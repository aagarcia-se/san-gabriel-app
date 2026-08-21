import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/shared/layout/AppShell';
import { ComingSoonPage } from '@/shared/ui/ComingSoonPage';
import { SinAccesoPage } from '@/shared/ui/SinAccesoPage';
import { SinPermisosPage } from '@/shared/ui/SinPermisosPage';
import { HomePage } from '@/features/home/pages/HomePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RequirePermission } from '@/features/auth/components/RequirePermission';
import { RootRedirect } from '@/features/auth/components/RootRedirect';
import { MasPage } from '@/features/menu/pages/MasPage';

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
                {/* "/" ya no asume Dashboard: manda a la primera ruta
                    que el rol del usuario realmente tenga permitida. */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="/sin-permisos" element={<SinPermisosPage />} />
                <Route path="/sin-acceso" element={<SinAccesoPage />} />
                <Route path="/mas" element={<MasPage />} />

                <Route
                  path="/dashboard"
                  element={
                    <RequirePermission ruta="/dashboard">
                      <HomePage />
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
