import {
  CC_VIEWBOX,
  bluePath,
  goldPath,
} from "./cc-mark-geometry.ts";

export const products = [
  { id: "contihub", name: "ContiHub" },
  { id: "projects", name: "Projects" },
  { id: "conticrm", name: "ContiCRM" },
  { id: "contifield", name: "ContiField" },
  { id: "conticost", name: "ContiCost" },
  { id: "contisafety", name: "ContiSafety" },
  { id: "contitrak", name: "ContiTraK" },
  { id: "contibid", name: "Conti Bid" },
] as const;

export type BrandProduct = (typeof products)[number];

function markDefs(prefix: string) {
  return `
    <linearGradient id="${prefix}blue" x1="18" y1="12" x2="82" y2="88" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#c5dcff"/>
      <stop offset="18%" stop-color="#4d82d6"/>
      <stop offset="48%" stop-color="#1e4fa3"/>
      <stop offset="100%" stop-color="#071433"/>
    </linearGradient>
    <linearGradient id="${prefix}blue-hi" x1="22" y1="16" x2="58" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#eef5ff" stop-opacity=".9"/>
      <stop offset="100%" stop-color="#1e4fa3" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="${prefix}gold" x1="28" y1="20" x2="78" y2="82" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fff6d2"/>
      <stop offset="16%" stop-color="#edd078"/>
      <stop offset="42%" stop-color="#c9a34a"/>
      <stop offset="72%" stop-color="#8b7020"/>
      <stop offset="100%" stop-color="#4a3c0c"/>
    </linearGradient>
    <linearGradient id="${prefix}gold-hi" x1="36" y1="26" x2="68" y2="62" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fff8d8" stop-opacity=".95"/>
      <stop offset="100%" stop-color="#c9a34a" stop-opacity="0"/>
    </linearGradient>
    <filter id="${prefix}brush" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85 0.06" numOctaves="3" seed="3" result="noise"/>
      <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
      <feComponentTransfer in="gray" result="grain">
        <feFuncA type="linear" slope="0.42"/>
      </feComponentTransfer>
      <feComposite in="grain" in2="SourceAlpha" operator="in" result="clipped"/>
      <feBlend in="SourceGraphic" in2="clipped" mode="overlay"/>
    </filter>
    <filter id="${prefix}paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" seed="11" result="n"/>
      <feColorMatrix type="saturate" values="0" in="n" result="g"/>
      <feComponentTransfer in="g" result="grain">
        <feFuncA type="linear" slope="0.22"/>
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="grain" mode="multiply"/>
    </filter>
    <radialGradient id="${prefix}vignette" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#1a1a1f"/>
      <stop offset="100%" stop-color="#0b0b0d"/>
    </radialGradient>
    <linearGradient id="${prefix}flare" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#c9a34a" stop-opacity="0"/>
      <stop offset="50%" stop-color="#f0d27a" stop-opacity="1"/>
      <stop offset="100%" stop-color="#c9a34a" stop-opacity="0"/>
    </linearGradient>
    <filter id="${prefix}flare-glow" x="-40%" y="-400%" width="180%" height="900%">
      <feGaussianBlur stdDeviation="2.4"/>
    </filter>
  `;
}

function markLetters(prefix: string) {
  const blue = bluePath();
  const gold = goldPath();
  return `
    <path fill="#041028" d="${blue}" transform="translate(1.5 2.1)"/>
    <path fill="url(#${prefix}blue)" d="${blue}" filter="url(#${prefix}brush)"/>
    <path fill="url(#${prefix}blue-hi)" d="${blue}"/>
    <path fill="#3d3208" d="${gold}" transform="translate(1.1 1.6)"/>
    <path fill="url(#${prefix}gold)" d="${gold}" filter="url(#${prefix}brush)"/>
    <path fill="url(#${prefix}gold-hi)" d="${gold}"/>
  `;
}

export function ccMarkSvg() {
  const prefix = "m-";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CC_VIEWBOX} ${CC_VIEWBOX}" fill="none">
  <defs>${markDefs(prefix)}</defs>
  <rect width="${CC_VIEWBOX}" height="${CC_VIEWBOX}" fill="#0b0b0d"/>
  ${markLetters(prefix)}
</svg>
`;
}

export function ccMarkOnDarkSvg() {
  const prefix = "d-";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">
  <defs>${markDefs(prefix)}</defs>
  <rect width="128" height="128" rx="28" fill="url(#${prefix}vignette)" filter="url(#${prefix}paper)"/>
  <rect x="3.2" y="3.2" width="121.6" height="121.6" rx="25" stroke="#d7d2c6" stroke-opacity=".28" stroke-width="1.6"/>
  <g transform="translate(10 8) scale(1.08)">
    ${markLetters(prefix)}
  </g>
</svg>
`;
}

export function tileSvg(name: string) {
  const prefix = "t-";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" fill="none">
  <defs>${markDefs(prefix)}</defs>
  <rect width="1024" height="1024" rx="180" fill="url(#${prefix}vignette)" filter="url(#${prefix}paper)"/>
  <rect x="18" y="18" width="988" height="988" rx="164" stroke="#d7d2c6" stroke-opacity=".2" stroke-width="4"/>
  <g transform="translate(198 92) scale(6.28)">
    ${markLetters(prefix)}
  </g>
  <text x="512" y="820" text-anchor="middle" fill="#fffdf8" font-family="Inter, Arial, Helvetica, sans-serif" font-size="78" font-weight="650">${escapeXml(name)}</text>
  <rect x="312" y="862" width="400" height="5" rx="2.5" fill="url(#${prefix}flare)" filter="url(#${prefix}flare-glow)"/>
  <rect x="352" y="862" width="320" height="3" rx="1.5" fill="url(#${prefix}flare)"/>
</svg>
`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function faviconSvg() {
  const prefix = "f-";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <defs>${markDefs(prefix)}</defs>
  <rect width="32" height="32" rx="7" fill="#0b0b0d"/>
  <rect x="1.1" y="1.1" width="29.8" height="29.8" rx="6" stroke="#d7d2c6" stroke-width="1.05" stroke-opacity=".4"/>
  <g transform="translate(2.2 1.8) scale(0.276)">
    ${markLetters(prefix)}
  </g>
</svg>
`;
}
