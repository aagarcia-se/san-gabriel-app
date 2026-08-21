import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Croissant,
  ClipboardList,
  ShoppingCart,
  Store,
  Settings,
  Package,
  Gift,
  ArrowLeftRight,
  PackageMinus,
  BarChart3,
  ClipboardCheck,
  CalendarCheck,
  Bell,
  Tag,
  Circle,
  type LucideIcon,
} from 'lucide-react';

// Mapea la rutaAcceso que devuelve el permiso (JWT) a un ícono.
// Si agregan un permiso nuevo en el backend y no está aquí, cae al ícono
// genérico (Circle) — no rompe nada, solo se ve menos específico.
const iconByRoute: Record<string, LucideIcon> = {
  '/dashboard': LayoutDashboard,
  '/users': Users,
  '/users/roles': ShieldCheck,
  '/productos': Croissant,
  '/ordenes-produccion': ClipboardList,
  '/ventas': ShoppingCart,
  '/sucursales': Store,
  '/config': Settings,
  '/stock-productos': Package,
  '/pedido-especial': Gift,
  '/traslados-productos': ArrowLeftRight,
  '/descuento-stock': PackageMinus,
  '/reportes': BarChart3,
  '/encuestas-config': ClipboardCheck,
  '/activar-fecha-produccion': CalendarCheck,
  '/habilitar-notificaciones': Bell,
  '/categorias': Tag,
};

export function getIconForRoute(rutaAcceso: string): LucideIcon {
  return iconByRoute[rutaAcceso] ?? Circle;
}
