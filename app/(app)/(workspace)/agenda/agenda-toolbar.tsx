'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { todayLocalIsoDate } from './search-params';

interface AgendaToolbarProps {
  date: string; // YYYY-MM-DD
}

/**
 * Toolbar de la agenda: selector de fecha + botones "Anterior/Hoy/Siguiente".
 * El filtro por sucursal vive en el sidebar global (BranchSelector) y se lee
 * desde cookie, no desde la URL.
 */
export function AgendaToolbar({ date }: AgendaToolbarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function navigate(nextDate: string): void {
    const merged = new URLSearchParams(params);
    if (nextDate === todayLocalIsoDate()) merged.delete('date');
    else merged.set('date', nextDate);
    const qs = merged.toString();
    startTransition(() => router.replace(qs ? `/agenda?${qs}` : '/agenda'));
  }

  function shiftDate(offsetDays: number): void {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    navigate(`${yyyy}-${mm}-${dd}`);
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
            onChange={(e) => navigate(e.target.value)}
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
          onClick={() => navigate(todayLocalIsoDate())}
          className="border-border-soft text-muted hover:text-text inline-flex h-9 items-center rounded-md border px-3 text-[11px] transition-colors"
        >
          Hoy
        </button>
      </div>
    </div>
  );
}
