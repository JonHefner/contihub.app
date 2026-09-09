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

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={blue} x1="10" y1="6" x2="86" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9cc4f5" />
          <stop offset="22%" stopColor="#3b6ec4" />
          <stop offset="55%" stopColor="#1e4fa3" />
          <stop offset="100%" stopColor="#0a1d4a" />
        </linearGradient>
        <linearGradient id={blueHi} x1="18" y1="14" x2="48" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d7e8ff" stopOpacity=".9" />
          <stop offset="100%" stopColor="#1e4fa3" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gold} x1="38" y1="18" x2="90" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="28%" stopColor="#e0c36a" />
          <stop offset="58%" stopColor="#c9a34a" />
          <stop offset="100%" stopColor="#6f5a12" />
        </linearGradient>
        <linearGradient id={goldHi} x1="52" y1="30" x2="78" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff8d8" stopOpacity=".95" />
          <stop offset="100%" stopColor="#c9a34a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        fill="#071433"
        d="M69.176 25.032 A 37 37 0 1 0 69.176 70.968 L 57.985 62.209 A 23.2 23.2 0 1 1 57.985 33.791 Z"
        transform="translate(1.4 1.8)"
      />
      <path
        fill={`url(#${blue})`}
        d="M68.368 25.836 A 36 36 0 1 0 68.368 70.164 L 57.73 61.852 A 22.5 22.5 0 1 1 57.73 34.148 Z"
      />
      <path
        fill={`url(#${blueHi})`}
        d="M68.368 25.836 A 36 36 0 1 0 68.368 70.164 L 57.73 61.852 A 22.5 22.5 0 1 1 57.73 34.148 Z"
      />
      <path
        fill="#4a3c0c"
        d="M74.321 36.144 A 20 20 0 1 0 74.321 61.856 L 67.81 56.392 A 11.5 11.5 0 1 1 67.81 41.608 Z"
        transform="translate(.7 1)"
      />
      <path
        fill={`url(#${gold})`}
        d="M73.321 35.144 A 20 20 0 1 0 73.321 60.856 L 66.81 55.392 A 11.5 11.5 0 1 1 66.81 40.608 Z"
      />
      <path
        fill={`url(#${goldHi})`}
        d="M73.321 35.144 A 20 20 0 1 0 73.321 60.856 L 66.81 55.392 A 11.5 11.5 0 1 1 66.81 40.608 Z"
      />
    </svg>
  );
}
