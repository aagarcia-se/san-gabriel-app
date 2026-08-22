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

- `POST /login` con body `{ usuario, contrasena }`.
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

## Menú agrupado, basado en permisos (por rol)

El menú vive en **un solo lugar**: `src/shared/layout/menuSchema.ts`. Ahí se
define el orden, la agrupación y el ícono de cada módulo. Sidebar, BottomNav
y "Más" (móvil) solo *renderizan* ese schema — no hay listas duplicadas.

**Orden y agrupación actual:**

```
Inicio                      (acceso libre, no depende de permisos)
Dashboard
Inventarios                 (grupo)
  ├─ Control de stock
  ├─ Descuento de stock
  └─ Traslados
Órdenes de producción
Pedidos especiales
Ventas
Reportes
Configuraciones             (grupo)
  ├─ Usuarios
  ├─ Roles
  ├─ Sucursales
  ├─ Productos
  ├─ Materia prima
  ├─ Mi perfil              (acceso libre, no depende de permisos)
  ├─ Encuestas
  ├─ Activar fecha de producción
  ├─ Notificaciones
  └─ Categorías
```

- `getVisibleMenu(permisos)` filtra el schema completo contra los permisos
  reales del rol (por `rutaAcceso`). Un link sin `rutaAcceso` (Inicio, Mi
  perfil) es siempre visible. Un grupo desaparece solo si **ninguno** de
  sus items quedó visible para ese rol.
- **Los grupos NO son un desplegable en desktop** — cada uno
  (`Inventarios`, `Configuraciones`) tiene su propia ruta (`to` en
  `menuSchema.ts`, ej. `/inventarios`) y es un click directo a una
  pantalla dedicada (`MenuGroupPage.tsx`) que muestra sus sub-opciones
  como tarjetas.
- **Desktop** (`Sidebar.tsx`): ancho reducido (`w-56`) y filas
  compactas — cada entrada (link o grupo) es un solo click, así que ya
  no hace falta espacio para desplegar nada. El grupo se marca activo
  tanto en su propia pantalla como en cualquiera de sus sub-opciones.
- **Móvil** (`BottomNav.tsx` / `MasPage.tsx`): distinto de desktop a
  propósito — la barra inferior toma los primeros 4 **links sueltos**
  de primer nivel (los grupos no ocupan un ícono ahí), y "Más" muestra
  todo junto: los links sueltos primero, y cada grupo como su propia
  sección con encabezado y grid — sin tener que entrar a otra pantalla
  para ver las sub-opciones, a diferencia de desktop.
- **Aterrizaje** (`RootRedirect.tsx`): al loguear o entrar a `/`, siempre
  se manda a `/inicio` — es de acceso libre, así que es un aterrizaje
  seguro para cualquier rol, tenga los permisos que tenga.
- Cada módulo nuevo se agrega en `menuSchema.ts` (como link suelto o
  dentro de un grupo) — Sidebar, BottomNav y "Más" lo reflejan
  automáticamente, sin tocar esos tres archivos.

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
`app/routes.tsx`). `/inicio` y `/perfil` son la excepción a propósito —
no están atados a un permiso del backend.

- Cualquier permiso que el usuario sí tiene pero cuyo módulo aún no se ha
  construido (todavía sin `<Route>`) cae en una pantalla "en construcción"
  (`ComingSoonPage.tsx`).

## Convención de rutas de API

El `baseURL` del cliente HTTP ya incluye `/api` (ej.
`http://localhost:3000/api`). **Cada servicio solo agrega el nombre de su
ruta**, sin prefijos como `/auth`:

```ts
httpClient.post('/login', payload);   // -> http://localhost:3000/api/login
httpClient.get('/productos');         // -> http://localhost:3000/api/productos
```

Esta es la convención para todos los módulos que construyamos de aquí en
adelante.

## Modo claro / oscuro

Implementado desde la base con tokens semánticos, no colores fijos:

- `tailwind.config.ts` define clases (`bg`, `surface`, `surface-2`, `line`,
  `ink`, `muted`) cuyo **valor real** viene de variables CSS.
- `src/styles/globals.css` — define esas variables dos veces: una vez en
  `:root` (tema claro, paleta minimalista con blancos y grises suaves) y
  otra en `.dark` (tema oscuro, la paleta original del proyecto).
- Todos los componentes usan las clases semánticas (`bg-surface`,
  `text-ink`, `border-line`, etc.) — nunca `slate-900` directo — así que
  cambiar de tema no requiere tocar componentes nuevos, solo seguir la
  misma convención.
- `src/shared/theme/useTheme.ts` — store de zustand que alterna la clase
  `dark` en `<html>` y persiste la preferencia en `localStorage`.
- `src/shared/theme/ThemeToggle.tsx` — botón con íconos de sol/luna.
  Ya está colocado en el Sidebar (desktop), el Topbar (móvil) y el login
  (arriba a la derecha, para poder cambiarlo antes de iniciar sesión).
- `index.html` incluye un script inline que aplica el tema (guardado o
  según preferencia del sistema) **antes** del primer render, para evitar
  el parpadeo del tema equivocado al cargar.

**Para cada módulo nuevo:** usa siempre las clases semánticas
(`bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-surface-2`)
en vez de `slate-*` directo, para que funcione en ambos temas sin
esfuerzo extra.

## Instalación de la PWA (agregar a inicio / barra de direcciones)

El manifest y el Service Worker ya estaban configurados desde el inicio
(`vite-plugin-pwa` en `vite.config.ts`) — eso es lo que hace que el
navegador ofrezca instalar la app (el ícono en la barra de direcciones en
Chrome/Edge desktop, o el banner nativo en Android). Ahora además hay
UI propia para que sea evidente que se puede instalar:

- `src/shared/pwa/usePwaInstall.ts` — store con el estado de instalación
  (si el navegador ofreció instalar, si ya está instalada, si es iOS).
- `src/shared/pwa/PwaInstallListener.tsx` — capta el evento
  `beforeinstallprompt` del navegador (Chrome/Edge/Android) y
  `appinstalled` cuando ya se instaló. Montado una vez en `App.tsx`.
- `src/shared/pwa/InstallBanner.tsx` — banner flotante arriba, visible en
  cualquier pantalla (login incluido), con botón "Instalar". Se puede
  cerrar y no vuelve a aparecer por 14 días (`localStorage`).
- **iOS/Safari no dispara ese evento** (limitación de Apple, no del
  proyecto) — ahí el banner muestra los pasos manuales: "Toca Compartir
  → Agregar a inicio".
- Botón manual adicional (por si cierran el banner y luego quieren
  instalar): ícono de descarga en el Topbar (móvil) y "Instalar app" en
  el Sidebar (desktop), ambos solo visibles cuando el navegador ofrece
  la instalación nativa.

**Íconos:** ya hay 3 PNG placeholder generados en `public/icons/`
("SG" sobre el color de marca) — sin íconos reales el manifest no es
válido y el navegador nunca ofrece instalar. Cuando tengas el logo real
de la panadería, reemplázalos manteniendo el mismo nombre/tamaño (ver
`public/icons/README.md`).

**Requisito importante — contexto seguro:** el navegador solo ofrece
instalar en HTTPS, o en `http://localhost` exactamente. Si pruebas
`npm run dev` desde la misma compu en `http://localhost:5173`, funciona.
Si abres desde el celular usando la IP de tu red local (ej.
`http://192.168.x.x:5173`), **no** va a aparecer — no es un problema de
configuración, es una restricción de seguridad de los navegadores. Para
probar en el celular, usa `npm run build && npm run preview` en una URL
`https://` desplegada (ej. Vercel), o una herramienta de túnel HTTPS.

## Cómo seguimos

Para cada módulo que quieras integrar contra tu API, puedes:

1. Pegar el código relevante (endpoint, DTO/response de ejemplo, o el controller).
2. O pasar el link del repo de GitHub (si es público, lo puedo leer directo;
   si es privado, cuéntame el endpoint y el shape de la respuesta y armamos
   los tipos + el hook de consumo).

Con eso genero: tipos TypeScript del recurso, funciones de API, hooks de
`useQuery`/`useMutation`, y los componentes de UI (mobile-first) para ese módulo.
