# San Gabriel App

Progressive Web App construida con **React 18 + TypeScript + Vite**, estilizada
con **Tailwind CSS** y con **TanStack Query + Axios** para el consumo de la API
(cache, reintentos, invalidación y estados de carga automáticos).

## Stack

- **Vite** — build tool y dev server.
- **React 18 + TypeScript** — strict mode activado.
- **Tailwind CSS** — mobile-first, con design tokens propios (`tailwind.config.ts`).
- **react-router-dom** — ruteo.
- **@tanstack/react-query** — data fetching + cache del lado del cliente.
- **axios** — cliente HTTP con interceptores centralizados.
- **zustand** — estado global de UI (ej. sesión, tema) cuando haga falta.
- **vite-plugin-pwa** — genera el Service Worker y el manifest automáticamente,
  con estrategia `NetworkFirst` para las llamadas a `/api`.

## Estructura del proyecto

```
src/
  app/                 # Bootstrap de la app: rutas y providers globales
    providers.tsx
    routes.tsx
  shared/              # Todo lo transversal, reutilizable entre features
    api/               # httpClient (axios) + queryClient (react-query)
    config/            # env.ts
    lib/               # utilidades (cn, etc.)
    layout/            # AppShell, Sidebar, BottomNav, Topbar
    ui/                # Design system: Spinner, ErrorState, EmptyState, Button...
  features/            # Un folder por módulo de negocio
    home/
      pages/
      # a futuro: api/, components/, hooks/, types/
  styles/
    globals.css
```

### Patrón para cada módulo nuevo (feature)

Cada vez que agreguemos un módulo que consuma tu API, seguirá esta misma forma:

```
features/<nombre>/
  api/          # funciones que llaman a httpClient + hooks de useQuery/useMutation
  components/   # componentes de UI específicos del módulo
  pages/        # páginas que se enrutan
  types/        # tipos/DTOs del módulo
```

Esto mantiene el proyecto escalable: nada se mezcla entre módulos y todo lo
compartido vive en `shared/`.

## Cómo correr el proyecto

```bash
npm install
cp .env.example .env   # ajusta VITE_API_BASE_URL a tu API real
npm run dev
```

- `npm run dev` — servidor de desarrollo (con Service Worker habilitado en dev).
- `npm run build` — build de producción (type-check + bundle).
- `npm run preview` — sirve el build de producción localmente para probar la PWA.
- `npm run lint` / `npm run format` — calidad de código.

## PWA: instalación e íconos

El manifest y el Service Worker se generan automáticamente vía
`vite-plugin-pwa` (ver `vite.config.ts`). Solo falta que agregues tus íconos
reales en `public/icons/` (ver `public/icons/README.md`).

Para probar "Add to Home Screen" en el celular, corre `npm run build && npm run preview`
y abre esa URL desde tu teléfono en la misma red (o despliega a Vercel/Netlify).

## Autenticación (login)

Integrado contra tu API real (`auth.route.js` / `auth.controller.js` /
`auth.service.js` / `auth/jwt.js`):

- `POST /auth/login` con body `{ usuario, contrasena }`.
- Respuesta (envelope estándar de tu API):
  ```json
  {
    "status": 200,
    "message": "Consulta exitosa",
    "authUser": "<jwt firmado como string>"
  }
  ```
  **`authUser` es el token plano**, no un objeto — así lo confirma
  `auth/jwt.js` (`jwt.sign(...)` devuelve un string). Los datos de sesión
  (`usuario`, `permisos`) van codificados dentro del payload del JWT, así
  que el frontend lo decodifica con `jwt-decode`
  (`src/shared/lib/jwt.ts`) para obtenerlos — no hace falta un segundo
  endpoint para el perfil.
- El token se guarda en `localStorage` (`auth_token`) y Axios lo inyecta
  automáticamente en cada request (`Authorization: Bearer <token>`).
- `permisos` (array del JWT) se guarda en el store para usarlo más
  adelante en autorización por módulo/acción.
- `ProtectedRoute` valida que el token exista y no haya expirado
  (`exp` del JWT) antes de dejar pasar a rutas privadas — igual que tu
  backend valida expiración en `jwt.verifyToken`. Si alguien sin sesión
  entra directo a una URL protegida, se le redirige a `/login` con un
  aviso de "Debes iniciar sesión para continuar."
- **Errores del backend** (`generalErrors.js`): tu API los envuelve así:
  ```json
  { "error": { "message": "Usuario o contraseña inválidos.", "code": 401, "data": null } }
  ```
  El interceptor de Axios (`src/shared/api/httpClient.ts`) lee
  `error.response.data.error.message`/`code` y arma un `ApiError` plano
  (`{ status, code, message, details }`). Por diseño, tu backend usa el
  mismo mensaje genérico "Usuario o contraseña inválidos." para los
  códigos 9 (no existe), 10 (contraseña incorrecta) y 17 (bloqueado) —
  así no revela cuál fue el motivo — y el frontend simplemente lo muestra
  tal cual, sin agregar lógica propia de mapeo.
- `src/features/auth/store/authStore.ts` — estado global de sesión (zustand),
  persistido en `localStorage`.
- Envelope genérico reutilizable en `src/shared/api/apiEnvelope.ts` para
  tipar los próximos endpoints con el mismo formato `{ status, message, ... }`.

**Nota:** los campos exactos de `AuthUser` y `Permiso`
(`src/features/auth/types/auth.types.ts`) son un placeholder razonable —
si me compartes el DAO o un ejemplo real del JWT decodificado, los afino.

## Navegación dinámica basada en permisos

El menú (Sidebar en desktop, barra inferior + "Más" en móvil) **no está
harcodeado** — se genera a partir de `permisos` (array del JWT decodificado,
cada uno con `idPermiso`, `nombrePermiso`, `rutaAcceso`). Como los permisos
son **por rol**, cada usuario ve solo lo que su rol tiene asignado, y esto
se ajusta solo cuando cambian los permisos en el backend — no hay que
tocar nada en el frontend.

- `src/shared/layout/permisoIcons.ts` — mapea cada `rutaAcceso` a un ícono
  de `lucide-react`; si agregas un permiso nuevo en el backend y no está en
  el mapa, usa un ícono genérico automáticamente (no rompe nada).
- **Desktop** (`Sidebar.tsx`): lista todos los permisos del usuario, con
  scroll si son muchos.
- **Móvil** (`BottomNav.tsx`): muestra los primeros 4 permisos + botón
  "Más" que lleva a `/mas` (`MasPage.tsx`), con el resto en una grilla.
- **Aterrizaje dinámico** (`RootRedirect.tsx` / `getDefaultRoute()`): al
  loguear o entrar a `/`, se manda al usuario a su **primer permiso real**
  — ya no se asume que todos tienen "Dashboard". Si el rol no tiene ningún
  permiso, ve `/sin-permisos`.

### El menú oculta, pero NO protege — por eso cada ruta se protege aparte

Ocultar un link del menú no evita que alguien entre escribiendo la URL a
mano. Por eso cada `<Route>` de módulo se envuelve en
`RequirePermission`, que valida contra los permisos reales del JWT:

```tsx
<Route
  path="/productos"
  element={
    <RequirePermission ruta="/productos">
      <ProductosPage />
    </RequirePermission>
  }
/>
```

Si el usuario no tiene ese permiso, ve `/sin-acceso` en vez del módulo,
sin importar cómo haya llegado a esa URL. **Este patrón es obligatorio
para cada módulo nuevo que agreguemos** (ver el comentario de ejemplo en
`app/routes.tsx`).

- Cualquier permiso que el usuario sí tiene pero cuyo módulo aún no se ha
  construido (todavía sin `<Route>`) cae en una pantalla "en construcción"
  (`ComingSoonPage.tsx`).

## Cómo seguimos

Para cada módulo que quieras integrar contra tu API, puedes:

1. Pegar el código relevante (endpoint, DTO/response de ejemplo, o el controller).
2. O pasar el link del repo de GitHub (si es público, lo puedo leer directo;
   si es privado, cuéntame el endpoint y el shape de la respuesta y armamos
   los tipos + el hook de consumo).

Con eso genero: tipos TypeScript del recurso, funciones de API, hooks de
`useQuery`/`useMutation`, y los componentes de UI (mobile-first) para ese módulo.
