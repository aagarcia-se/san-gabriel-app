import { useParams } from 'react-router-dom';
import { useSucursales } from '@/features/sucursales/api/useSucursales';
import { PageHeader } from '@/shared/ui/PageHeader';

export function VentaSucursalPage() {
  const { idSucursal: idParam } = useParams<{ idSucursal: string }>();
  const idSucursal = Number(idParam);

  const { data: sucursales } = useSucursales();
  const nombreSucursal = sucursales?.find((s) => s.idSucursal === idSucursal)?.nombreSucursal;

  return (
    <div className="space-y-4">
      <PageHeader
        title={nombreSucursal ?? 'Ventas de sucursal'}
        description="Aquí vivirán las opciones de venta de esta sucursal."
        backTo="/ventas"
      />
    </div>
  );
}