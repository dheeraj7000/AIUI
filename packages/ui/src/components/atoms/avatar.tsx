import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200',
  {
    variants: {
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof avatarVariants> {
  /** Image source URL */
  src?: string;
  /** Alt text for the image */
  alt?: string;
  /** Fallback initials when no image is provided */
  fallback?: string;
}

export function Avatar({ className, size, src, alt, fallback, ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const showImage = src && !imageError;

  return (
    <span className={cn(avatarVariants({ size, className }))} {...props}>
      {showImage ? (
        <img
          src={src}
          alt={alt || ''}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-medium text-gray-600" aria-hidden="true">
          {fallback || '?'}
        </span>
      )}
    </span>
  );
}
