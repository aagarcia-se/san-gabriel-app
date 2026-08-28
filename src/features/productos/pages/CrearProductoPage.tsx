import { useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useIngresarProducto, useIngresarPrecio } from '../api/useProductoMutations';
import { controlTypeToFlags, computePrecioPorUnidad } from '../lib/productoHelpers';
import { PageHeader } from '@/shared/ui/PageHeader';
import { ProductoForm, type ProductoFormValues } from './ProductoForm';
import type { ApiError } from '@/shared/api/httpClient';

export function CrearProductoPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();

  const ingresarProducto = useIngresarProducto();
  const ingresarPrecio = useIngresarPrecio();

  async function handleSubmit(values: ProductoFormValues) {
    setSubmitError(undefined);
    setIsSaving(true);
    try {
      const { controlarStock, controlarStockDiario } = controlTypeToFlags(values.controlType);

      const { idProducto } = await ingresarProducto.mutateAsync({
        nombreProducto: values.nombreProducto.trim(),
        idCategoria: Number(values.idCategoria),
        controlarStock,
        controlarStockDiario,
        controlarInventario: values.controlarInventario ? 1 : 0,
        tipoProduccion: values.tipoProduccion,
        // Se genera acá, en el navegador — el formulario no la pide.
        fechaCreacion: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        ...(values.tipoProduccion === 'bandejas'
          ? { unidadesPorBandeja: Number(values.unidadesPorBandeja) }
          : {}),
      });

      await ingresarPrecio.mutateAsync({
        idProducto,
        cantidad: values.cantidad.trim(),
        precio: values.precio.trim(),
        precioPorUnidad: computePrecioPorUnidad(values.cantidad, values.precio),
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin ? values.fechaFin : null,
      });

      navigate('/productos', { replace: true });
    } catch (err) {
      setSubmitError((err as ApiError).message ?? 'No se pudo crear el producto.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Nuevo producto" backTo="/productos" />

      <div className="card">
        <ProductoForm
          submitLabel="Crear producto"
          isSubmitting={isSaving}
          errorMessage={submitError}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/productos')}
        />
      </div>
    </div>
  );
}
