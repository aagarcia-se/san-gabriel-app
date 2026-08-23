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
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RequirePermission } from '@/features/auth/components/RequirePermission';
import { RootRedirect } from '@/features/auth/components/RootRedirect';
import { MasPage } from '@/features/menu/pages/MasPage';
import { MenuGroupPage } from '@/shared/layout/MenuGroupPage';

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

                {/* Patrón para cada módulo nuevo — SIEMPRE envuelto en
                    RequirePermission con la misma rutaAcceso del permiso:
                    <Route
                      path="/productos"
                      element={
                        <RequirePermission ruta="/productos">
                          <ProductosPage />
                        </RequirePermission>
                      }
                    />
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
