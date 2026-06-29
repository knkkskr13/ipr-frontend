interface EmblemProps {
  className?: string;
}

/**
 * Stylised state-emblem placeholder (laurel + ashoka-chakra style disc).
 * The original mockups reference an `Emblem_of_Tripura.png` asset that
 * wasn't supplied with the design files, so this inline SVG stands in for
 * it — swap the <img> usage for a real asset under /public when available.
 */
export function Emblem({ className = 'w-14 h-14' }: EmblemProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Government of Tripura emblem"
    >
      <circle cx="32" cy="32" r="30" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#1e40af" strokeWidth="1.5" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        return (
          <line
            key={i}
            x1="32"
            y1="32"
            x2="32"
            y2="10"
            stroke="#1e40af"
            strokeWidth="0.75"
            transform={`rotate(${angle} 32 32)`}
          />
        );
      })}
      <path
        d="M32 18 L40 30 L36 30 L36 46 L28 46 L28 30 L24 30 Z"
        fill="#1e3a8a"
      />
      <path
        d="M18 44 Q32 52 46 44"
        fill="none"
        stroke="#15803d"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
