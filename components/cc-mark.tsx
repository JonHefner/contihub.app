type CcMarkProps = {
  id: string;
  size?: number;
  className?: string;
};

export function CcMark({ id, size = 72, className }: CcMarkProps) {
  const blue = `${id}-cc-blue`;
  const gold = `${id}-cc-gold`;

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
        <linearGradient id={blue} x1="12" y1="8" x2="84" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7eb0f0" />
          <stop offset="38%" stopColor="#1e4fa3" />
          <stop offset="100%" stopColor="#0c2458" />
        </linearGradient>
        <linearGradient id={gold} x1="40" y1="20" x2="88" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f3e3ad" />
          <stop offset="42%" stopColor="#c9a34a" />
          <stop offset="100%" stopColor="#7a6416" />
        </linearGradient>
      </defs>
      <path
        fill="#0a1d42"
        d="M69.176 25.032 A 37 37 0 1 0 69.176 70.968 L 57.985 62.209 A 23.2 23.2 0 1 1 57.985 33.791 Z"
        transform="translate(1 1.4)"
      />
      <path
        fill={`url(#${blue})`}
        d="M68.368 25.836 A 36 36 0 1 0 68.368 70.164 L 57.73 61.852 A 22.5 22.5 0 1 1 57.73 34.148 Z"
      />
      <path
        fill="#6a5612"
        d="M74.321 36.144 A 20 20 0 1 0 74.321 61.856 L 67.81 56.392 A 11.5 11.5 0 1 1 67.81 41.608 Z"
        transform="translate(0.6 0.8)"
      />
      <path
        fill={`url(#${gold})`}
        d="M73.321 35.144 A 20 20 0 1 0 73.321 60.856 L 66.81 55.392 A 11.5 11.5 0 1 1 66.81 40.608 Z"
      />
    </svg>
  );
}
