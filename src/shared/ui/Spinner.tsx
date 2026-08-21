import { cn } from '@/shared/lib/cn';

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = 'Cargando…' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted">
      <div
        role="status"
        aria-label={label}
        className={cn(
          'h-8 w-8 animate-spin rounded-full border-2 border-line border-t-brand-500',
          className,
        )}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
