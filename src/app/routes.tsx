import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/shared/layout/AppShell';
import { ComingSoonPage } from '@/shared/ui/ComingSoonPage';
import { SinAccesoPage } from '@/shared/ui/SinAccesoPage';
import { SinPermisosPage } from '@/shared/ui/SinPermisosPage';
import { InicioPage } from '@/features/inicio/pages/InicioPage';
import { HomePage } from '@/features/home/pages/HomePage';
import { PerfilPage } from '@/features/perfil/pages/PerfilPage';
import { UsuariosPage } from '@/features/usuarios/pages/UsuariosPage';
import { CrearUsuarioPage } from '@/features/usuarios/pages/CrearUsuarioPage';
import { EditarUsuarioPage } from '@/features/usuarios/pages/EditarUsuarioPage';
import { SucursalesPage } from '@/features/sucursales/pages/SucursalesPage';
import { CrearSucursalPage } from '@/features/sucursales/pages/CrearSucursalPage';
import { EditarSucursalPage } from '@/features/sucursales/pages/EditarSucursalPage';
import { RolesPage } from '@/features/roles/pages/RolesPage';
import { CrearRolPage } from '@/features/roles/pages/CrearRolPage';
import { EditarRolPage } from '@/features/roles/pages/EditarRolPage';
import { ProductosPage } from '@/features/productos/pages/ProductosPage';
import { CrearProductoPage } from '@/features/productos/pages/CrearProductoPage';
import { EditarProductoPage } from '@/features/productos/pages/EditarProductoPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RequirePermission } from '@/features/auth/components/RequirePermission';
import { RootRedirect } from '@/features/auth/components/RootRedirect';
import { MasPage } from '@/features/menu/pages/MasPage';
import { MenuGroupPage } from '@/shared/layout/MenuGroupPage';
import { CategoriasPage } from '@/features/categorias/page/CategoriasPage';

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
                <Route path="/inventarios" element={<MenuGroupPage to="/inventarios" />} />
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

                {/* Patrón para cada módulo nuevo — SIEMPRE envuelto en
                    RequirePermission con la misma rutaAcceso del permiso.
                    Así, aunque el usuario escriba la URL directamente,
                    solo entra si su rol realmente tiene ese permiso. */}

                {/* Permiso que el usuario sí tiene pero cuyo módulo aún
                    no está construido (todavía no le pusimos <Route>). */}
                <Route path="*" element={<ComingSoonPage />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
