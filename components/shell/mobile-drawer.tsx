'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BranchSelector, type BranchOption } from './branch-selector';
import { Logo } from './logo';
import { SidebarNav } from './sidebar-nav';

interface MobileDrawerProps {
  branches: BranchOption[];
  activeBranchSlug: string | null;
}

/**
 * Hamburger + drawer mobile. El sidebar desktop está en `Sidebar` (hidden md:flex).
 * Este componente sólo aparece en mobile (md:hidden) y maneja el toggle del drawer.
 *
 * Pone overlay con fade + drawer sliding desde la izquierda. ESC cierra.
 */
export function MobileDrawer({ branches, activeBranchSlug }: MobileDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="border-border bg-surface-2 text-muted hover:text-text inline-flex size-8 items-center justify-center rounded-md border md:hidden"
      >
        <Menu className="size-[15px]" aria-hidden />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/65 md:hidden"
          />
          <aside className="bg-surface border-border fixed top-0 bottom-0 left-0 z-50 flex w-[280px] flex-col border-r shadow-2xl md:hidden">
            <div className="flex items-center justify-between px-4 pt-5 pb-3">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-muted hover:text-text inline-flex size-7 items-center justify-center rounded-md"
              >
                <X className="size-[16px]" aria-hidden />
              </button>
            </div>
            <div className="px-3 pb-3">
              <BranchSelector branches={branches} activeSlug={activeBranchSlug} />
            </div>
            <div className="text-subtle px-4 pt-2 pb-1.5 font-mono text-[10px] tracking-wider uppercase">
              Workspace
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
