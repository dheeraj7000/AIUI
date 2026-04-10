interface TokenChipProps {
  label: string;
  value?: string;
  variant?: 'floating' | 'inline' | 'bullet';
  size?: 'sm' | 'md';
  animated?: boolean;
  floatRotate?: string;
  floatSpeed?: 'normal' | 'delayed' | 'slow';
  className?: string;
}

const floatClass = {
  normal: 'animate-float',
  delayed: 'animate-float-delayed',
  slow: 'animate-float-slow',
};

export function TokenChip({
  label,
  value,
  variant = 'inline',
  size = 'md',
  animated = false,
  floatRotate,
  floatSpeed = 'normal',
  className = '',
}: TokenChipProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1.5 text-xs';

  if (variant === 'bullet') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/15 px-2 py-0.5 text-[11px] font-mono text-indigo-300 ${className}`}
      >
        <span className="h-1 w-1 rounded-full bg-indigo-400" />
        {label}
        {value && <span className="text-zinc-500">{value}</span>}
      </span>
    );
  }

  const base = `rounded-lg bg-white/5 backdrop-blur-md ${sizeClass} font-mono text-zinc-400 border border-white/10 shadow-lg shadow-black/20`;
  const animClass = animated ? floatClass[floatSpeed] : '';

  return (
    <div
      className={`${variant === 'floating' ? 'absolute hidden lg:block' : 'inline-block'} ${animClass} ${className}`}
      style={floatRotate ? ({ '--float-rotate': floatRotate } as React.CSSProperties) : undefined}
    >
      <div className={base}>
        {label}
        {value && <span className="text-zinc-500 ml-1">{value}</span>}
      </div>
    </div>
  );
}
