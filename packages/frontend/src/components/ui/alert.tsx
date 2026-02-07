import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        default:
          'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)]',
        destructive:
          'border-[var(--color-destructive)]/50 text-[var(--color-destructive)] bg-[var(--color-destructive)]/10',
        success:
          'border-green-500/50 text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

export { Alert };
