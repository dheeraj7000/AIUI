import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export type StepStatus = 'active' | 'completed' | 'upcoming';

export interface Step {
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Step status */
  status: StepStatus;
}

export interface StepIndicatorProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Array of steps to display */
  steps: Step[];
  /** Layout direction */
  orientation?: 'horizontal' | 'vertical';
}

export function StepIndicator({
  steps,
  orientation = 'vertical',
  className,
  ...props
}: StepIndicatorProps) {
  return (
    <ol
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col gap-0' : 'flex-row items-start gap-0',
        className
      )}
      {...props}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li
            key={index}
            className={cn(
              'flex',
              orientation === 'vertical' ? 'flex-row gap-3' : 'flex-1 flex-col items-center gap-2'
            )}
          >
            {/* Number circle and connector line */}
            <div
              className={cn(
                'flex shrink-0',
                orientation === 'vertical' ? 'flex-col items-center' : 'flex-row items-center'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  step.status === 'completed' && 'bg-blue-600 text-white',
                  step.status === 'active' && 'border-2 border-blue-600 bg-white text-blue-600',
                  step.status === 'upcoming' && 'border-2 border-gray-300 bg-white text-gray-400'
                )}
              >
                {step.status === 'completed' ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {/* Connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    orientation === 'vertical' ? 'h-8 w-0.5' : 'h-0.5 flex-1',
                    step.status === 'completed' ? 'bg-blue-600' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
            {/* Text content */}
            <div
              className={cn(orientation === 'vertical' ? 'pb-8' : 'text-center', isLast && 'pb-0')}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="mt-0.5 text-xs text-gray-500">{step.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
