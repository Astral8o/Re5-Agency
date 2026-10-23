// RE5 brand graphics shared by the homepage, blog and privacy page.

export function Mark({ color = "currentColor", className }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill={color} aria-hidden="true" className={className}>
      <circle cx="50" cy="20" r="15" />
      <circle cx="78.5" cy="40.7" r="15" />
      <circle cx="67.6" cy="74.3" r="15" />
      <circle cx="32.4" cy="74.3" r="15" />
      <circle cx="21.5" cy="40.7" r="15" />
    </svg>
  );
}

// Chunky starburst used as a playful accent.
export function Burst({ color = "currentColor", className, rays = 12 }: { color?: string; className?: string; rays?: number }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <g stroke={color} strokeWidth="11" strokeLinecap="round">
        {Array.from({ length: rays }, (_, i) => {
          const a = (i * 2 * Math.PI) / rays;
          return (
            <line
              key={i}
              x1={50 + 14 * Math.cos(a)}
              y1={50 + 14 * Math.sin(a)}
              x2={50 + 42 * Math.cos(a)}
              y2={50 + 42 * Math.sin(a)}
            />
          );
        })}
      </g>
    </svg>
  );
}

// Four-point sparkle.
export function Spark({ color = "currentColor", className }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <path d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0Z" fill={color} />
    </svg>
  );
}

// Loopy hand-drawn line.
export function Squiggle({ color = "currentColor", className }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 600 220" fill="none" aria-hidden="true" className={className} preserveAspectRatio="none">
      <path
        d="M4 150 C90 40 170 30 210 90 C250 150 190 200 160 170 C120 130 220 40 320 60 C420 80 380 180 450 170 C520 160 540 80 596 60"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
