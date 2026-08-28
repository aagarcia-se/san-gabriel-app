import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductos } from '../api/useProductos';
import {
  useActualizarPrecio,
  useActualizarProducto,
  useIngresarPrecio,
} from '../api/useProductoMutations';
import { controlTypeToFlags, computePrecioPorUnidad, flagsToControlType } from '../lib/productoHelpers';
import { PageHeader } from '@/shared/ui/PageHeader';
import { Spinner } from '@/shared/ui/Spinner';
import { ErrorState } from '@/shared/ui/ErrorState';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ProductoForm, type ProductoFormValues } from './ProductoForm';
import type { TipoProduccion } from '../types/producto.types';
import type { ApiError } from '@/shared/api/httpClient';

export function EditarProductoPage() {
  const { idProducto: idProductoParam } = useParams<{ idProducto: string }>();
  const idProducto = Number(idProductoParam);
  const navigate = useNavigate();

  const { data: productos, isLoading, isError, error, refetch } = useProductos();
  const producto = productos?.find((p) => p.idProducto === idProducto);

  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const actualizarProducto = useActualizarProducto();
  const ingresarPrecio = useIngresarPrecio();
  const actualizarPrecio = useActualizarPrecio();

  async function handleSubmit(values: ProductoFormValues) {
    if (!producto) return;
    setSubmitError(undefined);
    setIsSaving(true);
    try {
      const { controlarStock, controlarStockDiario } = controlTypeToFlags(values.controlType);

      await actualizarProducto.mutateAsync({
        idProducto: producto.idProducto,
        nombreProducto: values.nombreProducto.trim(),
        idCategoria: Number(values.idCategoria),
        oldCategoria: producto.idCategoria,
        controlarStock,
        controlarStockDiario,
        controlarInventario: values.controlarInventario ? 1 : 0,
        tipoProduccion: values.tipoProduccion,
        ...(values.tipoProduccion === 'bandejas'
          ? { unidadesPorBandeja: Number(values.unidadesPorBandeja) }
          : {}),
      });

      const precioPayload = {
        idProducto: producto.idProducto,
        cantidad: values.cantidad.trim(),
        precio: values.precio.trim(),
        precioPorUnidad: computePrecioPorUnidad(values.cantidad, values.precio),
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin ? values.fechaFin : null,
      };

      if (producto.precio) {
        await actualizarPrecio.mutateAsync(precioPayload);
      } else {
        await ingresarPrecio.mutateAsync(precioPayload);
      }

      navigate('/productos', { replace: true });
    } catch (err) {
      setSubmitError((err as ApiError).message ?? 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Editar producto" backTo="/productos" />

      {isLoading && <Spinner label="Cargando…" />}

      {isError && <ErrorState message={error?.message} onRetry={() => refetch()} />}

      {!isLoading && !isError && !producto && (
        <EmptyState
          title="Producto no encontrado"
          description="Puede que ya no exista, o el enlace esté roto."
        />
      )}

      {producto && (
        <>
          {!producto.precio && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Este producto no tiene un precio activo asociado, así que no pudimos precargar su
                configuración de stock/producción con certeza — quedaron valores por defecto.
                Revísalos antes de guardar.
              </p>
            </div>
          )}

          <div className="card">
            <ProductoForm
              initialValues={{
                nombreProducto: producto.nombreProducto,
                idCategoria: String(producto.idCategoria),
                controlType: flagsToControlType(
                  producto.precio?.controlarStock,
                  producto.precio?.controlarStockDiario,
                ),
                controlarInventario: !!producto.precio?.controlarInventario,
                tipoProduccion: (producto.precio?.tipoProduccion as TipoProduccion) ?? 'harina',
                unidadesPorBandeja: producto.precio?.unidadesPorBandeja
                  ? String(producto.precio.unidadesPorBandeja)
                  : '',
                cantidad: producto.precio ? String(producto.precio.cantidad) : '',
                precio: producto.precio ? String(producto.precio.precio) : '',
                fechaInicio: producto.precio?.fechaInicio ?? new Date().toISOString().slice(0, 10),
                fechaFin: producto.precio?.fechaFin ?? '',
              }}
              submitLabel="Guardar cambios"
              isSubmitting={isSaving}
              errorMessage={submitError}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/productos')}
            />
          </div>
        </>
      )}
    </div>
  );
}
