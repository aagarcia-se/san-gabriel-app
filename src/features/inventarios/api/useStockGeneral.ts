// useStockGeneral.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryClient';
import { consultarDescuentosPorSucursal, consultarDetalleDescuento, consultarDetalleTraslado, consultarStockGeneral, consultarTraslados } from './inventariosApi';

export function useStockGeneral(idSucursal: number, fecha: string) {
  return useQuery({
    queryKey: queryKeys.inventarios.stockGeneral(idSucursal, fecha),
    queryFn: () => consultarStockGeneral(idSucursal, fecha),
    select: (data) => data.stockProductos,
    enabled: Number.isFinite(idSucursal) && idSucursal > 0 && !!fecha,
  });
}

export function useDescuentos(idSucursal: number) {
  return useQuery({
    queryKey: queryKeys.inventarios.descuentos(idSucursal),
    queryFn: () => consultarDescuentosPorSucursal(idSucursal),
    select: (data) => data.descuentos,
    enabled: Number.isFinite(idSucursal) && idSucursal > 0,
  });
}

export function useTraslados() {
  return useQuery({
    queryKey: queryKeys.inventarios.traslados(),
    queryFn: consultarTraslados,
    select: (data) => data.traslados,
  });
}

export function useDetalleDescuento(idDescuento: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.inventarios.detalleDescuento(idDescuento),
    queryFn: () => consultarDetalleDescuento(idDescuento),
    select: (data) => data.descuentoStock,
    enabled: enabled && Number.isFinite(idDescuento) && idDescuento > 0,
  });
}

export function useDetalleTraslado(idTraslado: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.inventarios.detalleTraslado(idTraslado),
    queryFn: () => consultarDetalleTraslado(idTraslado),
    select: (data) => data.traslado,
    enabled: enabled && Number.isFinite(idTraslado) && idTraslado > 0,
  });
}