import { Bell, ChevronRight, Search } from 'lucide-react';

import { ThemeToggle } from '@/components/shared/theme-toggle';

import { type BranchOption } from './branch-selector';
import { Logo } from './logo';
import { MobileDrawer } from './mobile-drawer';
import { UserMenu } from './user-menu';

interface TopbarProps {
  organizationName: string;
  pathLabel: string;
  user: {
    email: string;
    initials: string;
    role: string;
  };
  branches: BranchOption[];
  activeBranchSlug: string | null;
}

/**
 * Topbar sticky, layout responsive:
 *
 * Mobile: hamburger drawer trigger + logo + search icon + theme + bell + avatar
 * Desktop: breadcrumb + search bar (placeholder) + theme toggle + bell + user menu
 *
 * El breadcrumb se renderiza desde un Server Component padre y pasa
 * `pathLabel` ya calculado (no toca pathname acá para evitar client island
 * innecesaria).
 */
export function Topbar({
  organizationName,
  pathLabel,
  user,
  branches,
  activeBranchSlug,
}: TopbarProps) {
  return (
    <header
      className="border-border bg-bg/85 sticky top-0 z-20 flex items-center gap-2 border-b px-3 py-2.5 backdrop-blur-md sm:px-5"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* Mobile: hamburger + logo compact */}
      <div className="flex items-center gap-2 md:hidden">
        <MobileDrawer branches={branches} activeBranchSlug={activeBranchSlug} />
        <Logo />
      </div>

      {/* Desktop: breadcrumb */}
      <div className="hidden items-center gap-2 font-mono text-[12px] md:flex">
        <span className="text-muted">Rehai</span>
        <ChevronRight className="text-subtle size-[11px]" aria-hidden />
        <span className="text-muted">{organizationName}</span>
        <ChevronRight className="text-subtle size-[11px]" aria-hidden />
        <span className="text-text">{pathLabel}</span>
      </div>

      {/* Search (placeholder — implementar en próximo sprint) */}
      <div className="mx-auto hidden max-w-xl flex-1 md:block">
        <div className="border-border bg-surface-2 flex items-center gap-2 rounded-md border px-2.5 py-1.5">
          <Search className="text-subtle size-[14px]" aria-hidden />
          <input
            type="search"
            disabled
            placeholder="Buscar paciente, cita, factura… (próximamente)"
            className="placeholder:text-subtle text-text min-w-0 flex-1 bg-transparent text-[12.5px] outline-none disabled:cursor-not-allowed"
          />
          <kbd className="border-border bg-surface text-muted rounded border px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Mobile: search icon (placeholder) */}
      <button
        type="button"
        disabled
        aria-label="Buscar"
        className="border-border bg-surface-2 text-muted ml-auto inline-flex size-8 items-center justify-center rounded-md border md:hidden"
      >
        <Search className="size-[15px]" aria-hidden />
      </button>

      <ThemeToggle />

      <button
        type="button"
        aria-label="Notificaciones"
        disabled
        className="border-border bg-surface-2 text-muted relative inline-flex size-8 shrink-0 items-center justify-center rounded-md border disabled:cursor-not-allowed"
      >
        <Bell className="size-[15px]" aria-hidden />
      </button>

      <div className="border-border-soft hidden border-l pl-2.5 md:flex">
        <UserMenu email={user.email} initials={user.initials} role={user.role} />
      </div>
      <div className="md:hidden">
        <UserMenu email={user.email} initials={user.initials} role={user.role} />
      </div>
    </header>
  );
}
