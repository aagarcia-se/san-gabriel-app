import { Construction } from 'lucide-react';

export function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Construction className="h-10 w-10 text-muted" />
      <p className="text-sm font-medium text-muted">
        Este módulo todavía no está disponible.
      </p>
      <p className="max-w-xs text-sm text-muted">
        Lo iremos construyendo junto a los demás. Vuelve pronto.
      </p>
    </div>
  );
}
