import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarDetalleVenta, consultarVentasPorSucursal } from './ventasApi';

export function useVentasPorSucursal(idSucursal: number) {
  return useQuery({
    queryKey: queryKeys.ventas.list(idSucursal),
    queryFn: () => consultarVentasPorSucursal(idSucursal),
    select: (data) => data.ventas,
    enabled: Number.isFinite(idSucursal) && idSucursal > 0,
  });
}

export function useVentaDetalle(idVenta: number) {
  return useQuery({
    queryKey: queryKeys.ventas.detail(idVenta),
    queryFn: () => consultarDetalleVenta(idVenta),
    select: (data) => data.venta,
    enabled: Number.isFinite(idVenta) && idVenta > 0,
  });
}