import { useState } from 'react';
import { Check, Copy, KeyRound } from 'lucide-react';

interface ResetPasswordDialogProps {
  open: boolean;
  password: string | null;
  onClose: () => void;
}

export function ResetPasswordDialog({ open, password, onClose }: ResetPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!open || !password) return null;

  async function handleCopy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Portapapeles no disponible (poco común) — el admin puede
      // seleccionar el texto a mano, no hace falta manejarlo aparte.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="card relative w-full max-w-sm space-y-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">Contraseña restablecida</h2>
            <p className="mt-1 text-sm text-muted">
              Comparte esta contraseña con el usuario — no se volverá a mostrar.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5">
          <span className="select-all font-mono text-sm text-ink">{password}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Copiada
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar
              </>
            )}
          </button>
        </div>

        <button type="button" onClick={onClose} className="btn-primary w-full">
          Listo
        </button>
      </div>
    </div>
  );
}
