import { useEffect } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type AlertVariant = 'success' | 'danger';

interface AlertProps {
  variant: AlertVariant;
  children: React.ReactNode;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

const VARIANT_STYLES: Record<
  AlertVariant,
  { container: string; icon: typeof Check; hoverClose: string }
> = {
  success: {
    container: 'bg-success-500/10 text-success-600 dark:text-success-400',
    icon: Check,
    hoverClose: 'hover:bg-success-500/20',
  },
  danger: {
    container: 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
    icon: AlertTriangle,
    hoverClose: 'hover:bg-danger-500/20',
  },
};

export function Alert({
  variant,
  children,
  onDismiss,
  autoDismissMs,
}: AlertProps) {
  const { container, icon: Icon, hoverClose } = VARIANT_STYLES[variant];

  useEffect(() => {
    if (!onDismiss || !autoDismissMs) return;

    const timeout = setTimeout(onDismiss, autoDismissMs);

    return () => clearTimeout(timeout);
  }, [onDismiss, autoDismissMs]);

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
        container
      )}
    >
      <Icon className="h-4 w-4 shrink-0 translate-y-0.5" />

      <span className="flex-1">{children}</span>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className={cn(
            'shrink-0 rounded-md p-0.5 transition-colors',
            hoverClose
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}