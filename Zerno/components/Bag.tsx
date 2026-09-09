/** пакет кофе для карточек обжарки — кислотность не рисуем, только тон этикетки */
export default function Bag({ tone, label, className = '' }: { tone: string; label: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 170" className={className} aria-hidden>
      <defs>
        <linearGradient id={`b-${label}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D9C7A6" /><stop offset=".5" stopColor="#EDDDBD" /><stop offset="1" stopColor="#CDB893" />
        </linearGradient>
      </defs>
      <path d="M16 30 h88 l6 126 a8 8 0 0 1 -8 8 h-84 a8 8 0 0 1 -8 -8 z" fill={`url(#b-${label})`} />
      <path d="M14 22 h92 v14 h-92 z" fill="#B99D6E" />
      <path d="M22 16 h76 v8 h-76 z" fill="#8F7650" />
      <rect x="28" y="62" width="64" height="70" rx="6" fill="#FBF5E8" />
      <rect x="28" y="62" width="64" height="16" rx="6" fill={tone} />
      <rect x="28" y="70" width="64" height="8" fill={tone} />
      <ellipse cx="60" cy="104" rx="11" ry="16" fill={tone} transform="rotate(-25 60 104)" />
      <path d="M60 88 c-5 8 -5 24 0 32" stroke="#FBF5E8" strokeWidth="2.4" fill="none" transform="rotate(-25 60 104)" />
      <text x="60" y="128" textAnchor="middle" fontFamily="var(--font-manrope), Manrope, sans-serif" fontSize="7.5" fontWeight="700" letterSpacing=".12em" fill="#2A1608">{label.toUpperCase()}</text>
      <circle cx="82" cy="46" r="4" fill="#8F7650" opacity=".7" />
    </svg>
  );
}
