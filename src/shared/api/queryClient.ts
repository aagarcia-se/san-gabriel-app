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
  }
};
