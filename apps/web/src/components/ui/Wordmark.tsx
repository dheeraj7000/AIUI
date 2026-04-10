interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function Wordmark({ size = 'lg', className = '' }: WordmarkProps) {
  return (
    <span
      className={`font-mono font-extrabold tracking-tight inline-flex items-baseline ${sizes[size]} ${className}`}
    >
      <span className="text-indigo-400">AI</span>
      <span className="text-indigo-500/40 mx-px select-none" aria-hidden>
        |
      </span>
      <span className="text-indigo-300">UI</span>
    </span>
  );
}
