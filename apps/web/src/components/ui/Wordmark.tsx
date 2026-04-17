interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'legacy' | 'editorial';
  className?: string;
}

const sizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
};

/**
 * AIUI Wordmark.
 *
 *   variant="editorial"  — paper/ink surfaces (Gambarino serif, oxblood mark)
 *   variant="legacy"     — dashboard/auth dark surfaces (indigo, kept until reskin)
 */
export function Wordmark({ size = 'lg', variant = 'legacy', className = '' }: WordmarkProps) {
  if (variant === 'editorial') {
    return (
      <span
        className={`inline-flex items-baseline gap-[1px] leading-none ${sizes[size]} ${className}`}
        style={{ fontFamily: 'var(--font-display)' }}
        aria-label="AIUI"
      >
        <span style={{ color: 'var(--ink)' }}>AI</span>
        <span aria-hidden style={{ color: 'var(--accent)' }}>
          ·
        </span>
        <span style={{ color: 'var(--ink)' }}>UI</span>
      </span>
    );
  }

  return (
    <span
      className={`font-mono font-extrabold tracking-tight inline-flex items-baseline ${sizes[size]} ${className}`}
      aria-label="AIUI"
    >
      <span className="text-indigo-400">AI</span>
      <span className="text-indigo-500/40 mx-px select-none" aria-hidden>
        |
      </span>
      <span className="text-indigo-300">UI</span>
    </span>
  );
}
