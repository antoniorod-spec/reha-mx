import { type BranchOption } from './branch-selector';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface AppShellProps {
  children: React.ReactNode;
  organizationName: string;
  pathLabel: string;
  user: {
    email: string;
    initials: string;
    role: string;
  };
  branches: BranchOption[];
}

/**
 * Shell del workspace clínico. Layout responsive:
 *
 *   - Desktop: sidebar fijo 244px a la izquierda + topbar sticky + main area.
 *   - Mobile: sidebar oculto, hamburger en topbar abre drawer.
 *
 * El children es el contenido de la página actual (server component).
 *
 * Recibe organization name, user info y branches como props pre-calculadas
 * por el layout de Next — todo server, sin client islands extra para fetch
 * de datos del shell mismo.
 */
export function AppShell({ children, organizationName, pathLabel, user, branches }: AppShellProps) {
  return (
    <div className="bg-bg text-text min-h-screen">
      <div className="flex">
        <Sidebar branches={branches} organizationName={organizationName} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar
            organizationName={organizationName}
            pathLabel={pathLabel}
            user={user}
            branches={branches}
          />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
