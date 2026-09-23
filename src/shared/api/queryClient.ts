import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Datos considerados "frescos" por 1 minuto: evita refetch innecesario.
      staleTime: 60 * 1000,
      // Cuánto tiempo se mantiene en cache tras dejar de usarse (antes cacheTime).
      gcTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Claves de query centralizadas por módulo/feature.
// Cada feature nueva agrega su propio bloque aquí para mantener
// invalidaciones y cache keys consistentes en toda la app.
export const queryKeys = {
  usuarios: {
    all: ['usuarios'] as const,
    list: () => [...queryKeys.usuarios.all, 'list'] as const,
  },
  sucursales: {
    all: ['sucursales'] as const,
    list: () => [...queryKeys.sucursales.all, 'list'] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: () => [...queryKeys.roles.all, 'list'] as const,
    permisos: (idRol: number) => [...queryKeys.roles.all, 'permisos', idRol] as const,
  },
  permisos: {
    all: ['permisos'] as const,
    list: () => [...queryKeys.permisos.all, 'list'] as const,
  },
  productos: {
    all: ['productos'] as const,
    list: () => [...queryKeys.productos.all, 'list'] as const,
  },
  precios: {
    all: ['precios'] as const,
    list: () => [...queryKeys.precios.all, 'list'] as const,
  },
  categorias: {
    all: ['categorias'] as const,
    list: () => [...queryKeys.categorias.all, 'list'] as const
  },
  recetas: {
    all: ['recetas'] as const,
    list: () => [...queryKeys.recetas.all, 'list'] as const
  },
  notificaciones: {
    all: ['notificaciones'] as const,
    list: () => [...queryKeys.notificaciones.all, 'list'] as const
  },
  fechaactiva: {
    all: ['fechaactiva'] as const,
    list: () => [...queryKeys.fechaactiva.all, 'list'] as const,
  },
  encuestas: {
    all: ['encuestas'] as const,
    list: () => [...queryKeys.encuestas.all, 'list'] as const,
    detail: (idCampania: number) => [...queryKeys.encuestas.all, 'detail', idCampania] as const,
  },
  ordenesProduccion: {
    all: ['ordenesProduccion'] as const,
    list: (idRol: number, idSucursal: number) =>
      [...queryKeys.ordenesProduccion.all, 'list', idRol, idSucursal] as const,
    detalleOrden: (idOrdenProduccion: number) =>
      [...queryKeys.ordenesProduccion.all, 'detalleOrden', idOrdenProduccion] as const,
    consumoIngredientes: (idOrdenProduccion: number) =>
      [...queryKeys.ordenesProduccion.all, 'consumoIngredientes', idOrdenProduccion] as const,
  },
  ordenesEspeciales: {
    all: ['ordenesEspeciales'] as const,
    list: (idRol: number, idSucursal: number) =>
      [...queryKeys.ordenesEspeciales.all, 'list', idRol, idSucursal] as const,
    detail: (idOrdenEspecial: number) =>
      [...queryKeys.ordenesEspeciales.all, 'detail', idOrdenEspecial] as const,
  },
  inventarios: {
    all: ['inventarios'] as const,
    stockGeneral: (idSucursal: number, fecha: string) =>
      [...queryKeys.inventarios.all, 'stockGeneral', idSucursal, fecha] as const,
    descuentos: (idSucursal: number) =>
      [...queryKeys.inventarios.all, 'descuentos', idSucursal] as const,
    traslados: () => [...queryKeys.inventarios.all, 'traslados'] as const,
    detalleTraslado: (idTraslado: number) =>
      [...queryKeys.inventarios.all, 'detalleTraslado', idTraslado] as const,
    detalleDescuento: (idDescuento: number) =>
      [...queryKeys.inventarios.all, 'detalleDescuento', idDescuento] as const,
  },
  ventas: {
    all: ['ventas'] as const,
    list: (idSucursal: number) => [...queryKeys.ventas.all, 'list', idSucursal] as const,
    detail: (idVenta: number) => [...queryKeys.ventas.all, 'detail', idVenta] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    data: () => [...queryKeys.dashboard.all, 'data'] as const,
  },
};
