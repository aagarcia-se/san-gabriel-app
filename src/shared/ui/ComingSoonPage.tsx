import { Construction } from 'lucide-react';

export function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Construction className="h-10 w-10 text-slate-500" />
      <p className="text-sm font-medium text-slate-300">
        Este módulo todavía no está disponible.
      </p>
      <p className="max-w-xs text-sm text-slate-500">
        Lo iremos construyendo junto a los demás. Vuelve pronto.
      </p>
    </div>
  );
}
