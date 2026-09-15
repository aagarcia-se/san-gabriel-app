import { useEffect } from 'react';
import {
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';

import { cn } from '@/shared/lib/cn';

type AlertVariant =
  | 'success'
  | 'danger';

type AlertPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface AlertProps {
  variant: AlertVariant;
  children: React.ReactNode;
  onDismiss?: () => void;
  autoDismissMs?: number;

  /**
   * Si es true, la alerta se muestra por encima
   * del contenido y no ocupa espacio dentro del layout.
   *
   * Por defecto es false para mantener el comportamiento
   * actual de todas las alertas existentes.
   */
  floating?: boolean;

  /**
   * Posición de la alerta cuando floating=true.
   *
   * Por defecto: top-right
   */
  position?: AlertPosition;
}

const VARIANT_STYLES: Record<
  AlertVariant,
  {
    container: string;
    icon: typeof Check;
    hoverClose: string;
  }
> = {
  success: {
    container:
      'bg-success-500/10 text-success-600 dark:text-success-400',
    icon: Check,
    hoverClose:
      'hover:bg-success-500/20',
  },

  danger: {
    container:
      'bg-danger-500/10 text-danger-600 dark:text-danger-400',
    icon: AlertTriangle,
    hoverClose:
      'hover:bg-danger-500/20',
  },
};

const FLOATING_POSITION_STYLES: Record<
  AlertPosition,
  string
> = {
  'top-left':
    'left-4 top-4 sm:left-6 sm:top-6',

  'top-center':
    'left-1/2 top-4 -translate-x-1/2 sm:top-6',

  'top-right':
    'right-4 top-4 sm:right-6 sm:top-6',

  'bottom-left':
    'bottom-4 left-4 sm:bottom-6 sm:left-6',

  'bottom-center':
    'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6',

  'bottom-right':
    'bottom-4 right-4 sm:bottom-6 sm:right-6',
};

export function Alert({
  variant,
  children,
  onDismiss,
  autoDismissMs,
  floating = false,
  position = 'top-right',
}: AlertProps) {
  const {
    container,
    icon: Icon,
    hoverClose,
  } = VARIANT_STYLES[variant];

  useEffect(() => {
    if (!onDismiss || !autoDismissMs) {
      return;
    }

    const timeout = setTimeout(
      onDismiss,
      autoDismissMs,
    );

    return () => clearTimeout(timeout);
  }, [onDismiss, autoDismissMs]);

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-lg px-3 py-2 text-sm',
        container,

        floating && [
          'fixed',
          'z-50',
          'w-[calc(100%-2rem)]',
          'max-w-md',
          'shadow-lg',
          'backdrop-blur-sm',
          FLOATING_POSITION_STYLES[position],
        ],
      )}
    >
      <Icon
        className="
          h-4
          w-4
          shrink-0
          translate-y-0.5
        "
      />

      <span className="flex-1">
        {children}
      </span>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar"
          className={cn(
            'shrink-0 rounded-md p-0.5 transition-colors',
            hoverClose,
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}