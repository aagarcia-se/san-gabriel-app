interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'No pudimos cargar la información.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <p className="text-sm text-muted">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary">
          Reintentar
        </button>
      )}
    </div>
  );
}
