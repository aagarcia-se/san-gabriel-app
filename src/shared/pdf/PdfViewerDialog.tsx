import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { usePDF, type DocumentProps } from '@react-pdf/renderer';
import { Download, Printer, X } from 'lucide-react';
import { Spinner } from '@/shared/ui/Spinner';

interface PdfViewerDialogProps {
  title: string;
  fileName: string;
  pdfDocument: ReactElement<DocumentProps>;
  onClose: () => void;
}

export function PdfViewerDialog({ title, fileName, pdfDocument, onClose }: PdfViewerDialogProps) {
  const [instance] = usePDF({ document: pdfDocument });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleDownload() {
    if (!instance.url) return;
    const link = document.createElement('a');
    link.href = instance.url;
    link.download = fileName;
    link.click();
  }

  function handlePrint() {
    if (!instance.url) return;
    const printWindow = window.open(instance.url);
    if (!printWindow) return;
    printWindow.onload = () => printWindow.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{title}</p>
          {instance.loading && <p className="text-xs text-muted">Generando PDF…</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            disabled={!instance.url}
            className="btn-secondary !px-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!instance.url}
            className="btn-primary !px-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Descargar</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-surface-2">
        {instance.loading && (
          <div className="flex h-full items-center justify-center">
            <Spinner label="Generando PDF…" />
          </div>
        )}

        {instance.error && (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-danger-600 dark:text-danger-400">
            No se pudo generar el PDF.
          </div>
        )}

        {instance.url && !instance.loading && (
          <iframe title={title} src={instance.url} className="h-full w-full border-0" />
        )}
      </div>
    </div>
  );
}