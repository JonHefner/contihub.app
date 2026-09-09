/** Shared nested-CC geometry. Both letters are true circles about one center. */

export const CC_VIEWBOX = 100;
export const CC_OPENING_DEG = 37;

/** Outer radius of the blue C. Padding left for drop shadow. */
export const BLUE_OUTER = 34;
export const BLUE_INNER = 21;
export const GOLD_OUTER = 17.4;
export const GOLD_INNER = 7.5;
/** Nudge gold toward the opening so it reads centered in the C’s interior. */
export const GOLD_OFFSET_X = 2.1;
export const GOLD_OFFSET_Y = -0.35;

export type CcCenter = { cx: number; cy: number };

function openingRadians(openingDeg = CC_OPENING_DEG) {
  return (openingDeg * Math.PI) / 180;
}

/** Place the blue C so its axis-aligned bbox is centered in the viewBox. */
export function ccCenter(viewBox = CC_VIEWBOX, rOuter = BLUE_OUTER): CcCenter {
  const right = rOuter * Math.cos(openingRadians());
  return {
    cx: viewBox / 2 + (rOuter - right) / 2,
    cy: viewBox / 2,
  };
}

function pt(n: number) {
  return n.toFixed(3).replace(/\.?0+$/, "");
}

/**
 * Closed “C” with vertical terminals (same x on the top and bottom tips).
 * Outer arc travels the long way around the left, then the inner arc returns.
 */
export function ccPath(
  rOuter: number,
  rInner: number,
  center: CcCenter = ccCenter(),
  openingDeg = CC_OPENING_DEG,
): string {
  const { cx, cy } = center;
  const a = openingRadians(openingDeg);
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const topOuterX = pt(cx + rOuter * cos);
  const topOuterY = pt(cy - rOuter * sin);
  const botOuterX = pt(cx + rOuter * cos);
  const botOuterY = pt(cy + rOuter * sin);
  const botInnerX = pt(cx + rInner * cos);
  const botInnerY = pt(cy + rInner * sin);
  const topInnerX = pt(cx + rInner * cos);
  const topInnerY = pt(cy - rInner * sin);
  const ro = pt(rOuter);
  const ri = pt(rInner);
  return `M${topOuterX} ${topOuterY} A${ro} ${ro} 0 1 0 ${botOuterX} ${botOuterY} L${botInnerX} ${botInnerY} A${ri} ${ri} 0 1 1 ${topInnerX} ${topInnerY} Z`;
}

export function goldCenter(viewBox = CC_VIEWBOX): CcCenter {
  const blue = ccCenter(viewBox);
  return { cx: blue.cx + GOLD_OFFSET_X, cy: blue.cy + GOLD_OFFSET_Y };
}

export function ccMetrics() {
  const center = ccCenter();
  const gold = goldCenter();
  const a = openingRadians();
  const blueStroke = BLUE_OUTER - BLUE_INNER;
  const goldStroke = GOLD_OUTER - GOLD_INNER;
  const gap = BLUE_INNER - GOLD_OUTER;
  return {
    center,
    goldCenter: gold,
    blueStroke,
    goldStroke,
    gap,
    openingDeg: CC_OPENING_DEG,
    blueBBox: {
      left: center.cx - BLUE_OUTER,
      right: center.cx + BLUE_OUTER * Math.cos(a),
      top: center.cy - BLUE_OUTER,
      bottom: center.cy + BLUE_OUTER,
    },
    goldBBox: {
      left: gold.cx - GOLD_OUTER,
      right: gold.cx + GOLD_OUTER * Math.cos(a),
      top: gold.cy - GOLD_OUTER,
      bottom: gold.cy + GOLD_OUTER,
    },
  };
}

export const bluePath = () => ccPath(BLUE_OUTER, BLUE_INNER);
export const goldPath = () => ccPath(GOLD_OUTER, GOLD_INNER, goldCenter());
