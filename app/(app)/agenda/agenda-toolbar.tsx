'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { cn } from '@/lib/utils/cn';

import { todayLocalIsoDate } from './search-params';

interface BranchOption {
  id: string;
  slug: string;
  name: string;
}

interface AgendaToolbarProps {
  date: string; // YYYY-MM-DD
  branchSlug: string | null;
  branches: BranchOption[];
}

/**
 * Toolbar de la agenda: selector de fecha + chips de sucursal + botones
 * "Anterior/Hoy/Siguiente". Actualiza la URL y deja que el RSC vuelva a
 * renderizar.
 */
export function AgendaToolbar({ date, branchSlug, branches }: AgendaToolbarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function navigate(next: { date?: string; branch?: string | null }): void {
    const merged = new URLSearchParams(params);
    if ('date' in next && next.date) {
      if (next.date === todayLocalIsoDate()) merged.delete('date');
      else merged.set('date', next.date);
    }
    if ('branch' in next) {
      if (next.branch === null) merged.delete('branch');
      else if (next.branch) merged.set('branch', next.branch);
    }
    const qs = merged.toString();
    startTransition(() => router.replace(qs ? `/agenda?${qs}` : '/agenda'));
  }

  function shiftDate(offsetDays: number): void {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    navigate({ date: `${yyyy}-${mm}-${dd}` });
  }

  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => shiftDate(-1)}
          className="border-border bg-surface-2 text-text hover:bg-surface inline-flex h-9 w-9 items-center justify-center rounded-md border text-[12px] transition-colors"
          aria-label="Día anterior"
        >
          ←
        </button>

        <div className="flex flex-col">
          <span className="text-text text-[14px] font-medium tracking-[-0.011em] capitalize">
            {formatted}
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => navigate({ date: e.target.value })}
            className="text-subtle font-mono text-[11px]"
            aria-label="Seleccionar fecha"
          />
        </div>

        <button
          type="button"
          onClick={() => shiftDate(1)}
          className="border-border bg-surface-2 text-text hover:bg-surface inline-flex h-9 w-9 items-center justify-center rounded-md border text-[12px] transition-colors"
          aria-label="Día siguiente"
        >
          →
        </button>

        <button
          type="button"
          onClick={() => navigate({ date: todayLocalIsoDate() })}
          className="border-border-soft text-muted hover:text-text inline-flex h-9 items-center rounded-md border px-3 text-[11px] transition-colors"
        >
          Hoy
        </button>
      </div>

      {branches.length > 1 && (
        <nav className="-mx-1 flex flex-wrap gap-1" aria-label="Filtrar por sucursal">
          <BranchChip
            label="Todas"
            isActive={branchSlug === null}
            onClick={() => navigate({ branch: null })}
          />
          {branches.map((b) => (
            <BranchChip
              key={b.id}
              label={b.name}
              isActive={branchSlug === b.slug}
              onClick={() => navigate({ branch: b.slug })}
            />
          ))}
        </nav>
      )}
    </div>
  );
}

interface BranchChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function BranchChip({ label, isActive, onClick }: BranchChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 items-center rounded-md border px-3 text-[12px] font-medium transition-colors',
        isActive
          ? 'border-accent bg-accent-soft text-accent'
          : 'border-border-soft text-muted hover:text-text hover:bg-surface-2',
      )}
    >
      {label}
    </button>
  );
}
