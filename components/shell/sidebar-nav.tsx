'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils/cn';

import { NAV_ITEMS, type NavItem } from './nav-items';

interface SidebarNavProps {
  /** Callback opcional para cerrar el drawer mobile al navegar. */
  onNavigate?: (() => void) | undefined;
}

/**
 * Lista de navegación del sidebar. Marca el item activo según el pathname
 * actual usando `usePathname()` (client). Items deshabilitados se muestran
 * con badge "Pronto" y sin link.
 *
 * El bloque "Cara del paciente" se separa visualmente con un divider más
 * la etiqueta del groupLabel.
 */
export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-2">
      {NAV_ITEMS.map((item) => (
        <NavRow key={item.id} item={item} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

interface NavRowProps {
  item: NavItem;
  pathname: string;
  onNavigate?: (() => void) | undefined;
}

function NavRow({ item, pathname, onNavigate }: NavRowProps) {
  const Icon = item.icon;
  const isActive = isItemActive(item, pathname);

  const content = (
    <>
      {isActive && (
        <span
          className="bg-accent absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r"
          aria-hidden
        />
      )}
      <Icon className="size-[15px] shrink-0" aria-hidden />
      <span className="text-[13px] font-medium tracking-[-0.011em]">{item.label}</span>
      {!item.enabled && (
        <span className="text-subtle ml-auto font-mono text-[10px] tracking-wider uppercase">
          pronto
        </span>
      )}
      {item.badge === 'dot' && (
        <span className="bg-accent ml-auto size-1.5 rounded-full" aria-hidden />
      )}
      {item.badge && item.badge !== 'dot' && (
        <span className="border-border bg-surface-2 text-muted ml-auto rounded border px-1.5 py-0.5 font-mono text-[10px]">
          {item.badge}
        </span>
      )}
    </>
  );

  return (
    <>
      {item.groupLabel && (
        <>
          <div className="border-border-soft mx-2 my-2 border-t" />
          <div className="text-subtle px-2.5 pt-1 pb-1 font-mono text-[10px] tracking-wider uppercase">
            {item.groupLabel}
          </div>
        </>
      )}
      {item.enabled ? (
        <Link
          href={item.href}
          {...(onNavigate ? { onClick: onNavigate } : {})}
          {...(isActive ? { 'aria-current': 'page' as const } : {})}
          className={cn(
            'relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors',
            isActive
              ? 'bg-surface-2 text-text'
              : 'text-muted hover:bg-surface-2/60 hover:text-text',
          )}
        >
          {content}
        </Link>
      ) : (
        <div
          className="text-subtle relative flex w-full cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-1.5"
          aria-disabled="true"
          title="Disponible en próximo sprint"
        >
          {content}
        </div>
      )}
    </>
  );
}

function isItemActive(item: NavItem, pathname: string): boolean {
  if (!item.enabled) return false;
  if (item.href === '/dashboard' && pathname === '/dashboard') return true;
  if (pathname === item.href) return true;
  if (item.href !== '/' && pathname.startsWith(`${item.href}/`)) return true;
  return false;
}
