import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  // Uno de los dos es requerido: backTo para una ruta fija (la mayoría
  // de los casos), onBack para navegación dinámica (por ejemplo,
  // volver al historial real del navegador con navigate(-1)).
  backTo?: string;
  onBack?: () => void;
}

export function PageHeader({ title, description, backTo, onBack }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : (
        backTo && (
          <Link
            to={backTo}
            aria-label="Volver"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )
      )}
      <div>
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
    </div>
  );
}