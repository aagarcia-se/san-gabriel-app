import { useRef, useState, type FormEvent } from 'react';
import { Building2, CalendarDays, Phone, User } from 'lucide-react';
import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { IconField } from '@/shared/ui/IconField';
import { ScrollToBottomButton } from '@/shared/ui/ScrollToEdgeButton';
import { ProductoCantidadPicker, type ProductoCantidadItem } from '@/shared/ui/components/ProductoCantidadPicker';

export interface OrdenEspecialFormValues {
  nombreCliente: string;
  telefonoCliente: string;
  idSucursal: string;
  fechaEntrega: string;
  fechaAProducir: string;
  productos: ProductoCantidadItem[];
}

interface OrdenEspecialFormProps {
  initialValues?: Partial<OrdenEspecialFormValues>;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: OrdenEspecialFormValues, nombreSucursal: string) => void;
  onCancel: () => void;
}

const EMPTY_VALUES: OrdenEspecialFormValues = {
  nombreCliente: '',
  telefonoCliente: '',
  idSucursal: '',
  fechaEntrega: new Date().toISOString().slice(0, 10),
  fechaAProducir: new Date().toISOString().slice(0, 10),
  productos: [],
};

export function OrdenEspecialForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: OrdenEspecialFormProps) {
  const [values, setValues] = useState<OrdenEspecialFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [productosError, setProductosError] = useState<string | undefined>();
  const productosSeccionRef = useRef<HTMLDivElement>(null);

  const {
    data: sucursales,
    isLoading: isLoadingSucursales,
    isError: isSucursalesError,
  } = useSucursales();

  function setField<K extends keyof OrdenEspecialFormValues>(
    field: K,
    value: OrdenEspecialFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (values.productos.length === 0) {
      setProductosError('Agrega al menos un producto al pedido.');
      return;
    }
    setProductosError(undefined);

    const sucursal = sucursales?.find((s) => String(s.idSucursal) === values.idSucursal);
    onSubmit(values, sucursal?.nombreSucursal ?? '');
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="nombreCliente" className="text-sm font-medium text-ink/80">
              Nombre del cliente
            </label>
            <IconField icon={User}>
              <input
                id="nombreCliente"
                type="text"
                required
                value={values.nombreCliente}
                onChange={(e) => setField('nombreCliente', e.target.value)}
                disabled={isSubmitting}
                className="input pl-9"
              />
            </IconField>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="telefonoCliente" className="text-sm font-medium text-ink/80">
              Teléfono
            </label>
            <IconField icon={Phone}>
              <input
                id="telefonoCliente"
                type="tel"
                required
                value={values.telefonoCliente}
                onChange={(e) => setField('telefonoCliente', e.target.value)}
                disabled={isSubmitting}
                className="input pl-9"
              />
            </IconField>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="idSucursal" className="text-sm font-medium text-ink/80">
            Sucursal de entrega
          </label>
          {isSucursalesError ? (
            <>
              <input
                id="idSucursal"
                type="number"
                min={1}
                required
                value={values.idSucursal}
                onChange={(e) => setField('idSucursal', e.target.value)}
                disabled={isSubmitting}
                className="input"
              />
              <p className="text-xs text-danger-600 dark:text-danger-400">
                No se pudo cargar la lista de sucursales — escribe el ID a mano.
              </p>
            </>
          ) : (
            <IconField icon={Building2}>
              <select
                id="idSucursal"
                required
                value={values.idSucursal}
                onChange={(e) => setField('idSucursal', e.target.value)}
                disabled={isSubmitting || isLoadingSucursales}
                className="input pl-9"
              >
                <option value="" disabled>
                  {isLoadingSucursales ? 'Cargando…' : 'Selecciona una sucursal'}
                </option>
                {sucursales?.map((sucursal) => (
                  <option key={sucursal.idSucursal} value={sucursal.idSucursal}>
                    {sucursal.nombreSucursal}
                  </option>
                ))}
              </select>
            </IconField>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="fechaEntrega" className="text-sm font-medium text-ink/80">
              Fecha de entrega
            </label>
            <IconField icon={CalendarDays}>
              <input
                id="fechaEntrega"
                type="date"
                required
                value={values.fechaEntrega}
                onChange={(e) => setField('fechaEntrega', e.target.value)}
                disabled={isSubmitting}
                className="input pl-9"
              />
            </IconField>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="fechaAProducir" className="text-sm font-medium text-ink/80">
              Fecha a producir
            </label>
            <IconField icon={CalendarDays}>
              <input
                id="fechaAProducir"
                type="date"
                required
                value={values.fechaAProducir}
                onChange={(e) => setField('fechaAProducir', e.target.value)}
                disabled={isSubmitting}
                className="input pl-9"
              />
            </IconField>
          </div>
        </div>

        <div className="space-y-1.5" ref={productosSeccionRef}>
          <label className="text-sm font-medium text-ink/80">Productos del pedido</label>
          <ProductoCantidadPicker
            value={values.productos}
            onChange={(productos) => setField('productos', productos)}
            disabled={isSubmitting}
          />
          {productosError && (
            <p className="text-xs text-danger-600 dark:text-danger-400">{productosError}</p>
          )}
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="rounded-lg bg-danger-500/10 px-3 py-2 text-sm text-danger-600 dark:text-danger-400"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Guardando…' : submitLabel}
          </button>
        </div>
      </form>

      {/* Es un botón "fixed" flotante: no necesita estar dentro del <form>,
          y su type="button" evita que dispare el submit por accidente
          si en algún momento lo movieras adentro. */}
      <ScrollToBottomButton mobileActivationRef={productosSeccionRef} />
    </>
  );
}