import { bluePath, goldPath } from "@/lib/brand/cc-mark-geometry";

type CcMarkProps = {
  id: string;
  size?: number;
  className?: string;
};

export function CcMark({ id, size = 72, className }: CcMarkProps) {
  const blue = `${id}-cc-blue`;
  const blueHi = `${id}-cc-blue-hi`;
  const gold = `${id}-cc-gold`;
  const goldHi = `${id}-cc-gold-hi`;
  const brush = `${id}-cc-brush`;
  const blueD = bluePath();
  const goldD = goldPath();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={blue} x1="18" y1="12" x2="82" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c5dcff" />
          <stop offset="18%" stopColor="#4d82d6" />
          <stop offset="48%" stopColor="#1e4fa3" />
          <stop offset="100%" stopColor="#071433" />
        </linearGradient>
        <linearGradient id={blueHi} x1="22" y1="16" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#eef5ff" stopOpacity=".9" />
          <stop offset="100%" stopColor="#1e4fa3" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gold} x1="28" y1="20" x2="78" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff6d2" />
          <stop offset="16%" stopColor="#edd078" />
          <stop offset="42%" stopColor="#c9a34a" />
          <stop offset="72%" stopColor="#8b7020" />
          <stop offset="100%" stopColor="#4a3c0c" />
        </linearGradient>
        <linearGradient id={goldHi} x1="36" y1="26" x2="68" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff8d8" stopOpacity=".95" />
          <stop offset="100%" stopColor="#c9a34a" stopOpacity="0" />
        </linearGradient>
        <filter id={brush} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.8" numOctaves="3" seed="3" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
          <feComponentTransfer in="gray" result="grain">
            <feFuncA type="linear" slope="0.28" />
          </feComponentTransfer>
          <feComposite in="grain" in2="SourceAlpha" operator="in" result="clipped" />
          <feBlend in="SourceGraphic" in2="clipped" mode="overlay" />
        </filter>
      </defs>
      <path fill="#020817" d={blueD} transform="translate(2.6 2.8)" />
      <path fill="#041028" d={blueD} transform="translate(1.4 1.8)" />
      <path fill={`url(#${blue})`} d={blueD} filter={`url(#${brush})`} />
      <path fill={`url(#${blueHi})`} d={blueD} />
      <path fill="#2a2206" d={goldD} transform="translate(2 2.2)" />
      <path fill="#3d3208" d={goldD} transform="translate(1 1.2)" />
      <path fill={`url(#${gold})`} d={goldD} filter={`url(#${brush})`} />
      <path fill={`url(#${goldHi})`} d={goldD} />
    </svg>
  );
}
