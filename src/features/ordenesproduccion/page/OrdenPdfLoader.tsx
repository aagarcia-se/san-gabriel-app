import { useDetalleOrdenProduccion } from '../api/useDetalleOrdenProduccion';
import { useConsumoIngredientes } from '../api/useConsumoIngredientes';
import { PdfViewerDialog } from '@/shared/pdf/PdfViewerDialog';
import { OrdenProduccionPdfDocument } from '../pdf/OrdenProduccionPdfDocument';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';

interface OrdenPdfLoaderProps {
  idOrdenProduccion: number;
  onClose: () => void;
}

export function OrdenPdfLoader({ idOrdenProduccion, onClose }: OrdenPdfLoaderProps) {
  const {
    data: detalle,
    isLoading: isLoadingDetalle,
    isError: isErrorDetalle,
    error: errorDetalle,
    refetch: refetchDetalle,
  } = useDetalleOrdenProduccion(idOrdenProduccion);

  const {
    data: ingredientes,
    isLoading: isLoadingIngredientes,
    isError: isErrorIngredientes,
    error: errorIngredientes,
    refetch: refetchIngredientes,
  } = useConsumoIngredientes(idOrdenProduccion);

  const isLoading = isLoadingDetalle || isLoadingIngredientes;
  const isError = isErrorDetalle || isErrorIngredientes;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="card">
          <Spinner label="Preparando el documento…" />
        </div>
      </div>
    );
  }

  if (isError || !detalle) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="card w-full max-w-sm space-y-3">
          <ErrorState
            message={errorDetalle?.message ?? errorIngredientes?.message}
            onRetry={() => {
              refetchDetalle();
              refetchIngredientes();
            }}
          />
          <button type="button" onClick={onClose} className="btn-secondary w-full">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <PdfViewerDialog
      title={`Orden #${idOrdenProduccion}`}
      fileName={`orden-produccion-${idOrdenProduccion}.pdf`}
      pdfDocument={
        <OrdenProduccionPdfDocument detalle={detalle} ingredientes={ingredientes ?? []} />
      }
      onClose={onClose}
    />
  );
}