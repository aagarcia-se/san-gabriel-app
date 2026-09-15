import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { PackagePlus } from 'lucide-react';
import { ProductoStockPicker, type ProductoStockCantidadItem } from '@/shared/ui/components/ProductoStockPicker';
import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { useIngresarStock } from '../api/useInventarioMutations';
import { useAuthStore } from '@/features/auth/store/authStore';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Alert } from '@/shared/ui/Alert';
import { ButtonSpinner } from '@/shared/ui/ButtonSpinner';
import type { ApiError } from '@/shared/api/httpClient';

export function IngresarExistenciasPage() {
  const { idSucursal: idParam } = useParams<{ idSucursal: string }>();
  const idSucursal = Number(idParam);
  const navigate = useNavigate();

  const idUsuario = useAuthStore((state) => state.user?.idUsuario) ?? 0;
  const { data: sucursales } = useSucursales();
  const nombreSucursal = sucursales?.find((s) => s.idSucursal === idSucursal)?.nombreSucursal;

  const [seleccionados, setSeleccionados] = useState<ProductoStockCantidadItem[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const productosSeccionRef = useRef<HTMLDivElement>(null);

  const ingresarStock = useIngresarStock();

  function handleGuardar() {
    setError(undefined);
    setSuccess(false);

    if (seleccionados.length === 0) {
      setError('Agrega al menos un producto con cantidad.');
      return;
    }

    const ahora = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const hoy = dayjs().format('YYYY-MM-DD');

    const stockProductos = seleccionados.map((item) => ({
      idUsuario,
      idProducto: item.idProducto,
      idSucursal,
      stock: item.cantidad,
      tipoProduccion: item.tipoProduccion,
      controlarStock: item.controlarStock,
      controlarStockDiario: item.controlarStockDiario,
      fechaCreacion: hoy,
      fechaActualizacion: ahora,
    }));

    ingresarStock.mutate(
      { stockProductos },
      {
        onSuccess: () => {
          setSuccess(true);
          setSeleccionados([]);
        },
        onError: (err: unknown) => {
          setError((err as ApiError).message ?? 'No se pudo ingresar el stock.');
        },
      },
    );
  }

  return (
    <>
      <div className="space-y-4 pb-4">
        <PageHeader
          title="Agregar existencias"
          description={nombreSucursal ? `Sucursal: ${nombreSucursal}` : undefined}
          backTo={`/inventarios/${idSucursal}`}
        />

        <ProductoStockPicker
          idSucursal={idSucursal}
          value={seleccionados}
          onChange={setSeleccionados}
          disabled={ingresarStock.isPending}
          cantidadInicial={0}
        />

        {error && (
          <Alert variant="danger" onDismiss={() => setError(undefined)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" onDismiss={() => setSuccess(false)} autoDismissMs={5000}>
            Existencias ingresadas correctamente.
          </Alert>
        )}

        <div className="sticky bottom-20 z-10 sm:bottom-4">
          <div className="card flex flex-col gap-3 shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              {seleccionados.length === 0
                ? 'Selecciona productos para ingresar existencias.'
                : `${seleccionados.length} producto(s) listo(s) para guardar.`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate(`/inventarios/${idSucursal}`)}
                disabled={ingresarStock.isPending}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardar}
                disabled={ingresarStock.isPending || seleccionados.length === 0}
                className="btn-primary"
              >
                {ingresarStock.isPending && <ButtonSpinner />}
                <PackagePlus className="h-4 w-4" />
                {ingresarStock.isPending ? 'Guardando…' : 'Guardar existencias'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}