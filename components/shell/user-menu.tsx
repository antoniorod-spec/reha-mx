'use client';

import { ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { logoutAction } from '@/server/actions/auth/logout';

interface UserMenuProps {
  email: string;
  initials: string;
  role: string;
}

/**
 * Avatar + nombre/role + dropdown con "Cerrar sesión".
 *
 * El logout va por server action `logoutAction`. Mantenemos el menú aquí como
 * client component para abrir/cerrar el popover.
 */
export function UserMenu({ email, initials, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="border-border-soft hover:bg-surface-2 flex items-center gap-2 rounded-md border border-transparent py-1 pr-2 pl-1.5 transition-colors"
      >
        <span
          className="text-accent-on flex size-7 items-center justify-center rounded-full text-[11px] font-semibold"
          style={{ background: 'linear-gradient(135deg, #3FBCD4, #1B92AE)' }}
          aria-hidden
        >
          {initials}
        </span>
        <span className="hidden text-left leading-tight md:block">
          <span className="text-text block text-[12px] font-medium tracking-[-0.011em]">
            {email.split('@')[0]}
          </span>
          <span className="text-subtle block font-mono text-[10px]">{role}</span>
        </span>
        <ChevronDown className="text-muted hidden size-[12px] md:block" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="border-border bg-surface absolute top-full right-0 z-30 mt-1.5 w-56 rounded-lg border p-1 shadow-2xl"
        >
          <div className="border-border-soft border-b px-3 py-2">
            <div className="text-text truncate text-[12px] font-medium">{email}</div>
            <div className="text-subtle font-mono text-[10px]">{role}</div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="hover:bg-surface-2 text-text flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] transition-colors"
            >
              <LogOut className="text-muted size-[14px]" aria-hidden />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
