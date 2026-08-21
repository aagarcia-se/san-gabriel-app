import { cn } from '@/shared/lib/cn';

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = 'Cargando…' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
      <div
        role="status"
        aria-label={label}
        className={cn(
          'h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500',
          className,
        )}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
