import {
  Activity,
  BarChart3,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  LayoutDashboard,
  Receipt,
  Settings,
  type LucideIcon,
  User,
  Users,
  UsersRound,
} from 'lucide-react';

export interface NavItem {
  /** Identificador estable. */
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Si está construido y navegable. Si false, se muestra deshabilitado con tooltip "Pronto". */
  enabled: boolean;
  /** Badge a la derecha (opcional). Puede ser número (count de cosas pendientes) o un dot. */
  badge?: 'dot' | string;
  /** Divide visualmente este item del bloque anterior con un separador + etiqueta. */
  groupLabel?: string;
}

/**
 * Navegación principal del workspace clínico.
 *
 * Estado actual (Fase 1.2): Dashboard, Agenda, Pacientes, Configuración están
 * activos. El resto se muestra deshabilitado con badge "Pronto" para comunicar
 * el roadmap del producto al usuario.
 *
 * Cada item navega a una ruta absoluta dentro del workspace.
 */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, enabled: true },
  { id: 'agenda', href: '/agenda', label: 'Agenda', icon: Calendar, enabled: true },
  { id: 'patients', href: '/pacientes', label: 'Pacientes', icon: Users, enabled: true },
  { id: 'patient', href: '/expediente', label: 'Expediente', icon: FileText, enabled: false },
  { id: 'protocols', href: '/protocolos', label: 'Protocolos', icon: Activity, enabled: false },
  { id: 'payments', href: '/pagos', label: 'Pagos', icon: CreditCard, enabled: false },
  { id: 'billing', href: '/facturacion', label: 'Facturación', icon: Receipt, enabled: false },
  { id: 'reports', href: '/reportes', label: 'Reportes', icon: BarChart3, enabled: false },
  { id: 'branches', href: '/sucursales', label: 'Sucursales', icon: Building2, enabled: false },
  { id: 'team', href: '/equipo', label: 'Equipo', icon: UsersRound, enabled: false },
  {
    id: 'settings',
    href: '/configuracion',
    label: 'Configuración',
    icon: Settings,
    enabled: true,
  },
  {
    id: 'portal',
    href: '/portal',
    label: 'App paciente',
    icon: User,
    enabled: false,
    groupLabel: 'Cara del paciente',
  },
];
