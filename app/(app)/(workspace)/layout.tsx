import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/shell/app-shell';
import { type BranchOption } from '@/components/shell/branch-selector';
import { listBranches } from '@/lib/agenda/queries';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout del workspace clínico. Aplica a /dashboard, /agenda, /pacientes,
 * /configuracion, y sub-rutas. NO aplica a login, signup, setup-2fa.
 *
 * Responsabilidades:
 *   1. Verificar sesión → redirect /login si no hay user activo.
 *   2. Resolver org del usuario (vía cookie de tenant o primer membership).
 *   3. Cargar lista de sucursales (para el branch selector) en server.
 *   4. Calcular el breadcrumb label desde el pathname (header `x-pathname`
 *      pasado por el middleware no existe todavía — usamos el header
 *      `x-current-path` que setea Next o caemos a un default).
 */
export default async function WorkspaceLayout({ children }: LayoutProps) {
  const userOrg = await getCurrentUserOrg();
  if (!userOrg) {
    redirect('/login');
  }

  const branches = await listBranches(userOrg.organization.id);

  const branchOptions: BranchOption[] = branches.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    shortName: b.name.replace(/^MoveWell\s+/i, ''),
    color: b.color ?? '#3FBCD4',
  }));

  const headerList = await headers();
  const pathname = headerList.get('x-pathname') ?? '/';
  const pathLabel = labelFromPath(pathname);

  const user = {
    email: userOrg.email,
    initials: initialsFromEmail(userOrg.email),
    role: roleLabel(userOrg.membership.role),
  };

  return (
    <AppShell
      organizationName={userOrg.organization.name}
      pathLabel={pathLabel}
      user={user}
      branches={branchOptions}
    >
      {children}
    </AppShell>
  );
}

function labelFromPath(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/agenda': 'Agenda',
    '/pacientes': 'Pacientes',
    '/configuracion': 'Configuración',
  };
  // Match exacta primero
  if (map[pathname]) return map[pathname];
  // Match por prefijo
  for (const [prefix, label] of Object.entries(map)) {
    if (pathname.startsWith(`${prefix}/`)) return label;
  }
  return 'Workspace';
}

function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'us';
  const parts = local.split(/[._-]+/).filter((p) => p.length > 0);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: 'Administrador',
    director: 'Director clínico',
    practitioner: 'Fisioterapeuta',
    reception: 'Recepción',
    patient: 'Paciente',
  };
  return map[role] ?? role;
}
