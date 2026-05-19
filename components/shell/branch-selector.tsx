'use client';

import { Check, ChevronDown, Layers } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils/cn';

export interface BranchOption {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  color: string;
}

interface BranchSelectorProps {
  branches: BranchOption[];
  initialBranchId: string | 'all';
  /** Callback al cambiar la sucursal seleccionada (lo persiste en cookie via API). */
  onSelect?: (branchId: string | 'all') => void;
}

/**
 * Selector de sucursal. Estado UI-only por ahora — la "sucursal activa" no
 * está persistida en sesión todavía (sub-fase siguiente: cookie + filtros
 * server-side en agenda + dashboard).
 *
 * Patrón visual del prototipo: dropdown con dot de color + nombre corto +
 * "Vista consolidada" como opción especial cuando la org tiene >1 sucursal.
 */
export function BranchSelector({ branches, initialBranchId, onSelect }: BranchSelectorProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | 'all'>(initialBranchId);
  const ref = useRef<HTMLDivElement>(null);

  // Click fuera para cerrar
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function pick(id: string | 'all'): void {
    setActive(id);
    setOpen(false);
    onSelect?.(id);
  }

  const hasMultiple = branches.length > 1;
  const current = active === 'all' ? null : branches.find((b) => b.id === active);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="border-border bg-surface-2 hover:bg-surface flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {active === 'all' ? (
            <span
              className="border-border bg-surface flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
              aria-hidden
            >
              <Layers className="text-muted size-[14px]" />
            </span>
          ) : (
            current && (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{
                  background: `${current.color}1A`,
                  border: `1px solid ${current.color}66`,
                }}
                aria-hidden
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    background: current.color,
                    boxShadow: `0 0 6px ${current.color}`,
                  }}
                />
              </span>
            )
          )}
          <span className="min-w-0 text-left">
            <span className="text-subtle block font-mono text-[10px] tracking-wider uppercase">
              Sucursal
            </span>
            <span className="text-text block truncate text-[13px] font-medium tracking-[-0.011em]">
              {active === 'all' ? 'Vista consolidada' : (current?.shortName ?? 'Selecciona…')}
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn('text-muted size-[14px] transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="border-border bg-surface absolute right-0 left-0 z-30 mt-1.5 rounded-lg border p-1 shadow-2xl"
        >
          {branches.map((b) => {
            const isActive = active === b.id;
            return (
              <button
                key={b.id}
                role="menuitem"
                type="button"
                onClick={() => pick(b.id)}
                className={cn(
                  'hover:bg-surface-2 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors',
                  isActive && 'bg-surface-2',
                )}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }}
                />
                <span className="min-w-0 flex-1">
                  <span className="text-text block truncate text-[13px] font-medium tracking-[-0.011em]">
                    {b.name}
                  </span>
                </span>
                {isActive && <Check className="text-accent size-[14px]" aria-hidden />}
              </button>
            );
          })}

          {hasMultiple && (
            <>
              <div className="border-border mx-2 my-1 h-px border-t" />
              <button
                role="menuitem"
                type="button"
                onClick={() => pick('all')}
                className={cn(
                  'hover:bg-surface-2 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors',
                  active === 'all' && 'bg-surface-2',
                )}
              >
                <span
                  className="border-muted flex size-3.5 items-center justify-center rounded-sm border"
                  aria-hidden
                >
                  <Layers className="text-muted size-[9px]" />
                </span>
                <span className="flex-1">
                  <span className="text-text block text-[13px] font-medium tracking-[-0.011em]">
                    Vista consolidada
                  </span>
                  <span className="text-subtle block font-mono text-[11px]">
                    todas las sucursales
                  </span>
                </span>
                {active === 'all' && <Check className="text-accent size-[14px]" aria-hidden />}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
