export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-label="RE5">
      <polygon points="30,6 34,6 20,58 8,58" fill="#ff5a1f" opacity="0.3" />
      <polygon points="30,6 34,6 38,58 26,58" fill="#ff5a1f" opacity="0.6" />
      <polygon points="30,6 34,6 56,58 44,58" fill="#ff5a1f" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      RE5<span className="dot">.</span> Agency
    </span>
  );
}
