import type { LucideIcon } from 'lucide-react';
import {
  Home,
  LayoutDashboard,
  Package,
  PackageMinus,
  ArrowLeftRight,
  ClipboardList,
  Gift,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  ShieldCheck,
  Store,
  Croissant,
  Wheat,
  UserCog,
  ClipboardCheck,
  CalendarCheck,
  Bell,
  Tag,
} from 'lucide-react';
import type { Permiso } from '@/features/auth/types/auth.types';

export interface MenuLink {
  type: 'link';
  to: string;
  label: string;
  icon: LucideIcon;
  // rutaAcceso del permiso que habilita este link. Si se omite, el link
  // es de acceso libre para cualquier usuario con sesión (ej. "Inicio",
  // "Mi perfil") y no depende de los permisos del rol.
  rutaAcceso?: string;
}

export interface MenuGroup {
  type: 'group';
  // Ruta de la pantalla que lista las sub-opciones del grupo (ej.
  // "/inventarios"). Un click lleva directo ahí — ya no es un
  // desplegable — y esa pantalla muestra las tarjetas de sus items.
  to: string;
  label: string;
  icon: LucideIcon;
  items: MenuLink[];
}

export type MenuEntry = MenuLink | MenuGroup;

// Orden y agrupación del menú para toda la app (Sidebar, BottomNav, "Más").
// Un solo lugar: cada módulo nuevo se agrega aquí, no en cada componente.
export const menuSchema: MenuEntry[] = [
  { type: 'link', to: '/inicio', label: 'Inicio', icon: Home },
  {
    type: 'link',
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    rutaAcceso: '/dashboard',
  },
  {
    type: 'group',
    to: '/inventarios',
    label: 'Inventarios',
    icon: Package,
    items: [
      {
        type: 'link',
        to: '/stock-productos',
        label: 'Control de stock',
        icon: Package,
        rutaAcceso: '/stock-productos',
      },
      {
        type: 'link',
        to: '/descuento-stock',
        label: 'Descuento de stock',
        icon: PackageMinus,
        rutaAcceso: '/descuento-stock',
      },
      {
        type: 'link',
        to: '/traslados-productos',
        label: 'Traslados',
        icon: ArrowLeftRight,
        rutaAcceso: '/traslados-productos',
      },
    ],
  },
  {
    type: 'link',
    to: '/ordenes-produccion',
    label: 'Órdenes de producción',
    icon: ClipboardList,
    rutaAcceso: '/ordenes-produccion',
  },
  {
    type: 'link',
    to: '/pedido-especial',
    label: 'Pedidos especiales',
    icon: Gift,
    rutaAcceso: '/pedido-especial',
  },
  {
    type: 'link',
    to: '/ventas',
    label: 'Ventas',
    icon: ShoppingCart,
    rutaAcceso: '/ventas',
  },
  {
    type: 'link',
    to: '/reportes',
    label: 'Reportes',
    icon: BarChart3,
    rutaAcceso: '/reportes',
  },
  {
    type: 'group',
    to: '/configuraciones',
    label: 'Configuraciones',
    icon: Settings,
    items: [
      { type: 'link', to: '/users', label: 'Usuarios', icon: Users, rutaAcceso: '/users' },
      {
        type: 'link',
        to: '/users/roles',
        label: 'Roles',
        icon: ShieldCheck,
        rutaAcceso: '/users/roles',
      },
      {
        type: 'link',
        to: '/sucursales',
        label: 'Sucursales',
        icon: Store,
        rutaAcceso: '/sucursales',
      },
      {
        type: 'link',
        to: '/productos',
        label: 'Productos',
        icon: Croissant,
        rutaAcceso: '/productos',
      },
      {
        type: 'link',
        to: '/config',
        label: 'Materia prima',
        icon: Wheat,
        rutaAcceso: '/config',
      },
      { type: 'link', to: '/perfil', label: 'Mi perfil', icon: UserCog },
      {
        type: 'link',
        to: '/encuestas-config',
        label: 'Encuestas',
        icon: ClipboardCheck,
        rutaAcceso: '/encuestas-config',
      },
      {
        type: 'link',
        to: '/activar-fecha-produccion',
        label: 'Activar fecha de producción',
        icon: CalendarCheck,
        rutaAcceso: '/activar-fecha-produccion',
      },
      {
        type: 'link',
        to: '/habilitar-notificaciones',
        label: 'Notificaciones',
        icon: Bell,
        rutaAcceso: '/habilitar-notificaciones',
      },
      {
        type: 'link',
        to: '/categorias',
        label: 'Categorías',
        icon: Tag,
        rutaAcceso: '/categorias',
      },
    ],
  },
];

// Filtra el schema según los permisos reales del usuario (por rol).
// Los links sin rutaAcceso (Inicio, Mi perfil) son siempre visibles.
// Un grupo desaparece por completo si ninguno de sus items quedó visible.
export function getVisibleMenu(permisos: Permiso[]): MenuEntry[] {
  const owned = new Set(permisos.map((p) => p.rutaAcceso));
  const hasAccess = (rutaAcceso?: string) => !rutaAcceso || owned.has(rutaAcceso);

  return menuSchema.reduce<MenuEntry[]>((acc, entry) => {
    if (entry.type === 'link') {
      if (hasAccess(entry.rutaAcceso)) acc.push(entry);
      return acc;
    }
    const items = entry.items.filter((item) => hasAccess(item.rutaAcceso));
    if (items.length > 0) acc.push({ ...entry, items });
    return acc;
  }, []);
}

// Busca un grupo por su ruta propia (ej. "/inventarios"), ya filtrado
// por los permisos del usuario. Si el grupo no existe o quedó vacío
// para ese rol, retorna undefined.
export function findVisibleGroup(
  visibleMenu: MenuEntry[],
  to: string,
): MenuGroup | undefined {
  return visibleMenu.find(
    (entry): entry is MenuGroup => entry.type === 'group' && entry.to === to,
  );
}

// Solo los links sueltos de primer nivel (sin los grupos) — para elegir
// los primarios del BottomNav en móvil, igual que antes de que los
// grupos se volvieran navegables en el Sidebar de desktop.
export function getTopLevelLinks(visibleMenu: MenuEntry[]): MenuLink[] {
  return visibleMenu.filter((entry): entry is MenuLink => entry.type === 'link');
}

// Solo los grupos de primer nivel (para las secciones de "Más" en móvil).
export function getTopLevelGroups(visibleMenu: MenuEntry[]): MenuGroup[] {
  return visibleMenu.filter((entry): entry is MenuGroup => entry.type === 'group');
}
