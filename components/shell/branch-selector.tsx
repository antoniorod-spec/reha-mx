'use client';

import { Check, ChevronDown, Layers, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

import { cn } from '@/lib/utils/cn';
import { setActiveBranchAction } from '@/server/actions/workspace/set-active-branch';

export interface BranchOption {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  color: string;
}

interface BranchSelectorProps {
  branches: BranchOption[];
  /** Slug del branch activo, o null = "Vista consolidada". */
  activeSlug: string | null;
}

/**
 * Selector de sucursal. Persiste la selección en cookie `rehai-active-branch`
 * vía server action. Tras el revalidate, dashboard y agenda re-renderizan
 * con los queries filtrados por el branch elegido.
 *
 * Patrón visual del prototipo: dropdown con dot de color + nombre corto +
 * "Vista consolidada" como opción especial cuando la org tiene >1 sucursal.
 *
 * Durante el server roundtrip, useTransition mantiene `isPending=true` y el
 * botón muestra spinner. La selección final viene del prop `activeSlug` que
 * el layout re-resuelve tras el revalidate.
 */
export function BranchSelector({ branches, activeSlug }: BranchSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function pick(slug: string | null): void {
    setOpen(false);
    if (slug === activeSlug) return;
    startTransition(async () => {
      await setActiveBranchAction({ slug });
    });
  }

  const hasMultiple = branches.length > 1;
  const current = activeSlug === null ? null : branches.find((b) => b.slug === activeSlug);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="border-border bg-surface-2 hover:bg-surface flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-2 transition-colors disabled:opacity-70"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {current ? (
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
          ) : (
            <span
              className="border-border bg-surface flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
              aria-hidden
            >
              <Layers className="text-muted size-[14px]" />
            </span>
          )}
          <span className="min-w-0 text-left">
            <span className="text-subtle block font-mono text-[10px] tracking-wider uppercase">
              Sucursal
            </span>
            <span className="text-text block truncate text-[13px] font-medium tracking-[-0.011em]">
              {current ? current.shortName : 'Vista consolidada'}
            </span>
          </span>
        </span>
        {isPending ? (
          <Loader2 className="text-muted size-[14px] animate-spin" aria-hidden />
        ) : (
          <ChevronDown
            className={cn('text-muted size-[14px] transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="border-border bg-surface absolute right-0 left-0 z-30 mt-1.5 rounded-lg border p-1 shadow-2xl"
        >
          {branches.map((b) => {
            const isActive = activeSlug === b.slug;
            return (
              <button
                key={b.id}
                role="menuitem"
                type="button"
                onClick={() => pick(b.slug)}
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
                onClick={() => pick(null)}
                className={cn(
                  'hover:bg-surface-2 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors',
                  activeSlug === null && 'bg-surface-2',
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
                {activeSlug === null && <Check className="text-accent size-[14px]" aria-hidden />}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
