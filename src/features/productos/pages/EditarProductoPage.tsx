import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProductos } from '../api/useProductos';
import { useActualizarPrecio, useActualizarProducto } from '../api/useProductoMutations';
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

      // Este endpoint siempre tiene un precio ya cargado (por eso el
      // producto aparece acá) — a diferencia de antes, ya no hace falta
      // decidir entre ingresar/actualizar: siempre es actualizar.
      await actualizarPrecio.mutateAsync({
        idProducto: producto.idProducto,
        cantidad: values.cantidad.trim(),
        precio: values.precio.trim(),
        precioPorUnidad: computePrecioPorUnidad(values.cantidad, values.precio),
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin ? values.fechaFin : null,
      });

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
          description="Puede que esté inactivo, no tenga precio cargado, o el enlace esté roto."
        />
      )}

      {producto && (
        <div className="card">
          <ProductoForm
            initialValues={{
              nombreProducto: producto.nombreProducto,
              idCategoria: String(producto.idCategoria),
              controlType: flagsToControlType(
                producto.controlarStock,
                producto.controlarStockDiario,
              ),
              controlarInventario: !!producto.controlarInventario,
              tipoProduccion: producto.tipoProduccion as TipoProduccion,
              unidadesPorBandeja: producto.unidadesPorBandeja
                ? String(producto.unidadesPorBandeja)
                : '',
              cantidad: String(producto.cantidad),
              precio: String(producto.precio),
              fechaInicio: producto.fechaInicio,
              fechaFin: producto.fechaFin ?? '',
            }}
            submitLabel="Guardar cambios"
            isSubmitting={isSaving}
            errorMessage={submitError}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/productos')}
          />
        </div>
      )}
    </div>
  );
}
