export function TideMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="tm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="url(#tm-g)" opacity="0.22" />
      <circle cx="16" cy="16" r="15" fill="none" stroke="url(#tm-g)" strokeWidth="1.5" />
      <path d="M16 5v13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 8h3M16 11.5h2M16 15h3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M6.5 19.5c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 3-1.6"
        stroke="#67e8f9"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M6.5 24c2 0 2-1.6 4-1.6s2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 3-1.6"
        stroke="#fff"
        strokeOpacity="0.7"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
