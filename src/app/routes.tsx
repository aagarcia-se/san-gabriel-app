import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/shared/layout/AppShell';
import { ComingSoonPage } from '@/shared/ui/ComingSoonPage';
import { SinAccesoPage } from '@/shared/ui/SinAccesoPage';
import { SinPermisosPage } from '@/shared/ui/SinPermisosPage';
import { Spinner } from '@/shared/ui/Spinner';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RequirePermission } from '@/features/auth/components/RequirePermission';
import { RootRedirect } from '@/features/auth/components/RootRedirect';
import { MenuGroupPage } from '@/shared/layout/MenuGroupPage';

// Todas las páginas se cargan de forma perezosa: cada una queda en su
// propio chunk y solo se descarga cuando el usuario navega a esa ruta,
// en vez de venir todas juntas en el bundle inicial.
const InicioPage = lazy(() => import('@/features/inicio/pages/InicioPage').then((m) => ({ default: m.InicioPage })));
const HomePage = lazy(() => import('@/features/home/pages/HomePage').then((m) => ({ default: m.HomePage })));
const PerfilPage = lazy(() => import('@/features/perfil/pages/PerfilPage').then((m) => ({ default: m.PerfilPage })));
const MasPage = lazy(() => import('@/features/menu/pages/MasPage').then((m) => ({ default: m.MasPage })));

const UsuariosPage = lazy(() => import('@/features/usuarios/pages/UsuariosPage').then((m) => ({ default: m.UsuariosPage })));
const CrearUsuarioPage = lazy(() => import('@/features/usuarios/pages/CrearUsuarioPage').then((m) => ({ default: m.CrearUsuarioPage })));
const EditarUsuarioPage = lazy(() => import('@/features/usuarios/pages/EditarUsuarioPage').then((m) => ({ default: m.EditarUsuarioPage })));

const SucursalesPage = lazy(() => import('@/features/sucursales/pages/SucursalesPage').then((m) => ({ default: m.SucursalesPage })));
const CrearSucursalPage = lazy(() => import('@/features/sucursales/pages/CrearSucursalPage').then((m) => ({ default: m.CrearSucursalPage })));
const EditarSucursalPage = lazy(() => import('@/features/sucursales/pages/EditarSucursalPage').then((m) => ({ default: m.EditarSucursalPage })));

const RolesPage = lazy(() => import('@/features/roles/pages/RolesPage').then((m) => ({ default: m.RolesPage })));
const CrearRolPage = lazy(() => import('@/features/roles/pages/CrearRolPage').then((m) => ({ default: m.CrearRolPage })));
const EditarRolPage = lazy(() => import('@/features/roles/pages/EditarRolPage').then((m) => ({ default: m.EditarRolPage })));

const ProductosPage = lazy(() => import('@/features/productos/pages/ProductosPage').then((m) => ({ default: m.ProductosPage })));
const CrearProductoPage = lazy(() => import('@/features/productos/pages/CrearProductoPage').then((m) => ({ default: m.CrearProductoPage })));
const EditarProductoPage = lazy(() => import('@/features/productos/pages/EditarProductoPage').then((m) => ({ default: m.EditarProductoPage })));

const CategoriasPage = lazy(() => import('@/features/categorias/page/CategoriasPage').then((m) => ({ default: m.CategoriasPage })));
const CrearCategoriaPage = lazy(() => import('@/features/categorias/page/CrearCategoriaPage').then((m) => ({ default: m.CrearCategoriaPage })));
const EditarCategoriaPage = lazy(() => import('@/features/categorias/page/EditarCategoriaPage').then((m) => ({ default: m.EditarCategoriaPage })));

const RecetasPage = lazy(() => import('@/features/recetas/pages/RecetasPage').then((m) => ({ default: m.RecetasPage })));
const CrearRecetaPage = lazy(() => import('@/features/recetas/pages/CrearRecetaPage').then((m) => ({ default: m.CrearRecetaPage })));
const EditarRecetaPage = lazy(() => import('@/features/recetas/pages/EditarRecetaPage').then((m) => ({ default: m.EditarRecetaPage })));

const NotificacionesPage = lazy(() => import('@/features/notificaciones/page/NotificacionesPage').then((m) => ({ default: m.NotificacionesPage })));
const ActivarFechaPage = lazy(() => import('@/features/activacionfecha/page/ActivarFechaPage').then((m) => ({ default: m.ActivarFechaPage })));

const EncuestasPage = lazy(() => import('@/features/encuestas/page/EncuestasPage').then((m) => ({ default: m.EncuestasPage })));
const CrearEncuestaPage = lazy(() => import('@/features/encuestas/page/CrearEncuestaPage').then((m) => ({ default: m.CrearEncuestaPage })));
const EditarEncuestaPage = lazy(() => import('@/features/encuestas/page/EditarEncuestaPage').then((m) => ({ default: m.EditarEncuestaPage })));
const EncuestaDetallePage = lazy(() => import('@/features/encuestas/page/EncuestaDetallePage').then((m) => ({ default: m.EncuestaDetallePage })));

const OrdenesProduccionPage = lazy(() => import('@/features/ordenesproduccion/page/OrdenesProduccionPage').then((m) => ({ default: m.OrdenesProduccionPage })));
const CrearOrdenProduccionPage = lazy(() => import('@/features/ordenesproduccion/page/CrearOrdenProduccionPage').then((m) => ({ default: m.CrearOrdenProduccionPage })));
const DetalleOrdenProduccionPage = lazy(() => import('@/features/ordenesproduccion/page/DetalleOrdenProduccionPage').then((m) => ({ default: m.DetalleOrdenProduccionPage })));

const OrdenesEspecialesPage      = lazy(() => import('@/features/ordenesespeciales/page/OrdenesEspecialesPage').then((m) => ({ default: m.OrdenesEspecialesPage })));
const CrearOrdenEspecialPage     = lazy(() => import('@/features/ordenesespeciales/page/CrearOrdenEspecialPage').then((m) => ({ default: m.CrearOrdenEspecialPage })));
const EditarOrdenEspecialPage    = lazy(() => import('@/features/ordenesespeciales/page/EditarOrdenEspecialPage').then((m) => ({ default: m.EditarOrdenEspecialPage })));
const DetalleOrdenEspecialPage   = lazy(() => import('@/features/ordenesespeciales/page/DetalleOrdenEspecialPage').then((m) => ({ default: m.DetalleOrdenEspecialPage })));

const InventariosSucursalesPage  = lazy(() => import('@/features/inventarios/page/InventariosSucursalesPage').then((m) => ({ default: m.InventariosSucursalesPage })));
const InventarioSucursalPage     = lazy(() => import('@/features/inventarios/page/InventarioSucursalPage').then((m) => ({ default: m.InventarioSucursalPage })));
const IngresarExistenciasPage = lazy(() => import('@/features/inventarios/page/IngresarExistenciasPage').then((m) => ({ default: m.IngresarExistenciasPage })));
const DescontarExistenciasPage = lazy(() => import('@/features/inventarios/page/DescontarExistenciasPage').then((m) => ({ default: m.DescontarExistenciasPage })));
const TrasladarExistenciasPage = lazy(() => import('@/features/inventarios/page/TrasladarExistenciasPage').then((m) => ({ default: m.TrasladarExistenciasPage })));
const HistorialMovimientosPage = lazy(() => import('@/features/inventarios/page/HistorialMovimientosPage').then((m) => ({ default: m.HistorialMovimientosPage })))
const DetalleMovimientoPage = lazy(() => import('@/features/inventarios/page/DetalleMovimientoPage').then((m) => ({ default: m.DetalleMovimientoPage })));

const VentasSucursalesPage = lazy(() => import('@/features/ventas/pages/VentasSucursalesPage').then((m) => ({ default: m.VentasSucursalesPage })));
const VentaSucursalPage = lazy(() => import('@/features/ventas/pages/VentaSucursalPage').then((m) => ({ default: m.VentaSucursalPage })));
const VentaDetallePage = lazy(() => import('@/features/ventas/pages/VentaDetallePage').then((m) => ({ default: m.VentaDetallePage })));
export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas: sin Sidebar/BottomNav */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas privadas: envueltas en el shell (Sidebar/BottomNav) y protegidas */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Suspense fallback={<Spinner label="Cargando…" />}>
                <Routes>
                  <Route path="/" element={<RootRedirect />} />

                  {/* "Inicio" y "Mi perfil" son de acceso libre: cualquier
                      usuario con sesión los ve, sin importar su rol/permisos
                      (no están atados a un permiso del backend). */}
                  <Route path="/inicio" element={<InicioPage />} />
                  <Route path="/perfil" element={<PerfilPage />} />

                  <Route path="/sin-permisos" element={<SinPermisosPage />} />
                  <Route path="/sin-acceso" element={<SinAccesoPage />} />
                  <Route path="/mas" element={<MasPage />} />

                  {/* Pantallas de grupo: un click desde el Sidebar/BottomNav
                      lleva directo aquí, mostrando las sub-opciones de esa
                      sección como tarjetas (sin desplegable). */}
                {/*<Route path="/inventarios" element={<MenuGroupPage to="/inventarios" />} />*/}
                  <Route path="/configuraciones" element={<MenuGroupPage to="/configuraciones" />} />

                  <Route
                    path="/dashboard"
                    element={
                      <RequirePermission ruta="/dashboard">
                        <HomePage />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/users"
                    element={
                      <RequirePermission ruta="/users">
                        <UsuariosPage />
                      </RequirePermission>
                    }
                  />
                  {/* Sub-pantallas de Usuarios: mismo permiso que la lista
                      (no son un permiso propio del backend, son parte del
                      mismo módulo). */}
                  <Route
                    path="/users/nuevo"
                    element={
                      <RequirePermission ruta="/users">
                        <CrearUsuarioPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/users/:idUsuario/editar"
                    element={
                      <RequirePermission ruta="/users">
                        <EditarUsuarioPage />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/users/roles"
                    element={
                      <RequirePermission ruta="/users/roles">
                        <RolesPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/users/roles/nuevo"
                    element={
                      <RequirePermission ruta="/users/roles">
                        <CrearRolPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/users/roles/:idRol/editar"
                    element={
                      <RequirePermission ruta="/users/roles">
                        <EditarRolPage />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/sucursales"
                    element={
                      <RequirePermission ruta="/sucursales">
                        <SucursalesPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/sucursales/nueva"
                    element={
                      <RequirePermission ruta="/sucursales">
                        <CrearSucursalPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/sucursales/:idSucursal/editar"
                    element={
                      <RequirePermission ruta="/sucursales">
                        <EditarSucursalPage />
                      </RequirePermission>
                    }
                  />

                  <Route
                    path="/productos"
                    element={
                      <RequirePermission ruta="/productos">
                        <ProductosPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/productos/nuevo"
                    element={
                      <RequirePermission ruta="/productos">
                        <CrearProductoPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/productos/:idProducto/editar"
                    element={
                      <RequirePermission ruta="/productos">
                        <EditarProductoPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/categorias"
                    element={
                      <RequirePermission ruta="/categorias">
                        <CategoriasPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/categorias/nuevo"
                    element={
                      <RequirePermission ruta="/categorias">
                        <CrearCategoriaPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/categorias/:idCategoria/editar"
                    element={
                      <RequirePermission ruta="/categorias">
                        <EditarCategoriaPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/recetas"
                    element={
                      <RequirePermission ruta="/config">
                        <RecetasPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/recetas/nuevo"
                    element={
                      <RequirePermission ruta="/config">
                        <CrearRecetaPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/recetas/:idProducto/editar"
                    element={
                      <RequirePermission ruta="/config">
                        <EditarRecetaPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/habilitar-notificaciones"
                    element={
                      <RequirePermission ruta="/habilitar-notificaciones">
                        <NotificacionesPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/activar-fecha-produccion"
                    element={
                      <RequirePermission ruta="/activar-fecha-produccion">
                        <ActivarFechaPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/encuestas"
                    element={
                      <RequirePermission ruta="/encuestas-config">
                        <EncuestasPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/encuestas/nuevo"
                    element={
                      <RequirePermission ruta="/encuestas-config">
                        <CrearEncuestaPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/encuestas/:idCampania/editar"
                    element={
                      <RequirePermission ruta="/encuestas-config">
                        <EditarEncuestaPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/encuestas/:idCampania"
                    element={
                      <RequirePermission ruta="/encuestas-config">
                        <EncuestaDetallePage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/ordenes-produccion"
                    element={
                      <RequirePermission ruta="/ordenes-produccion">
                        <OrdenesProduccionPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/ordenes-produccion/nuevo"
                    element={
                      <RequirePermission ruta="/ordenes-produccion">
                        <CrearOrdenProduccionPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/ordenes-produccion/:idOrdenProduccion"
                    element={
                      <RequirePermission ruta="/ordenes-produccion">
                        <DetalleOrdenProduccionPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/ordenes-especiales"
                    element={
                      <RequirePermission ruta="/pedido-especial">
                        <OrdenesEspecialesPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/ordenes-especiales/nuevo"
                    element={
                      <RequirePermission ruta="/pedido-especial">
                        <CrearOrdenEspecialPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/ordenes-especiales/:idOrdenEspecial/editar"
                    element={
                      <RequirePermission ruta="/pedido-especial">
                        <EditarOrdenEspecialPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/ordenes-especiales/:idOrdenEspecial"
                    element={
                      <RequirePermission ruta="/pedido-especial">
                        <DetalleOrdenEspecialPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/inventarios"
                    element={
                      <RequirePermission ruta="/stock-productos">
                        <InventariosSucursalesPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/inventarios/:idSucursal"
                    element={
                      <RequirePermission ruta="/stock-productos">
                        <InventarioSucursalPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/inventarios/:idSucursal/ingresar"
                    element={
                      <RequirePermission ruta="/stock-productos">
                        <IngresarExistenciasPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/inventarios/:idSucursal/descontar"
                    element={
                      <RequirePermission ruta="/stock-productos">
                        <DescontarExistenciasPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/inventarios/:idSucursal/trasladar"
                    element={
                      <RequirePermission ruta="/stock-productos">
                        <TrasladarExistenciasPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/inventarios/:idSucursal/historial"
                    element={
                      <RequirePermission ruta="/stock-productos">
                        <HistorialMovimientosPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/inventarios/:idSucursal/historial/:tipo/:idMovimiento"
                    element={
                      <RequirePermission ruta="/stock-productos">
                        <DetalleMovimientoPage />
                      </RequirePermission>
                    }
                  />
                  <Route
                      path="/ventas"
                      element={
                        <RequirePermission ruta="/ventas">
                          <VentasSucursalesPage />
                        </RequirePermission>
                      }
                    />
                    <Route
                      path="/ventas/:idSucursal"
                      element={
                        <RequirePermission ruta="/ventas">
                          <VentaSucursalPage />
                        </RequirePermission>
                      }
                    />
                    <Route
                      path="/ventas/:idSucursal/detalle/:idVenta"
                      element={
                        <RequirePermission ruta="/ventas">
                          <VentaDetallePage />
                        </RequirePermission>
                      }
                    />
                                      {/* Patrón para cada módulo nuevo — SIEMPRE envuelto en
                      RequirePermission con la misma rutaAcceso del permiso.
                      Así, aunque el usuario escriba la URL directamente,
                      solo entra si su rol realmente tiene ese permiso. */}

                  {/* Permiso que el usuario sí tiene pero cuyo módulo aún
                      no está construido (todavía no le pusimos <Route>). */}
                  <Route path="*" element={<ComingSoonPage />} />
                </Routes>
              </Suspense>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}