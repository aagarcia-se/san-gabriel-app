import type { PropsWithChildren } from 'react';
import { cn } from '@/shared/lib/cn';

type BadgeVariant = 'success' | 'danger' | 'neutral' | 'brand';

interface BadgeProps extends PropsWithChildren {
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  danger: 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
  neutral: 'bg-surface-2 text-muted',
  brand: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
};

export function Badge({ variant = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
