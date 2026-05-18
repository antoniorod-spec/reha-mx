import Link from 'next/link';

import { cn } from '@/lib/utils/cn';

import type { PatientStatusCounts } from '@/lib/patients/queries';
import type { PatientStatusFilter } from '@/lib/patients/queries';

interface StatusTabsProps {
  counts: PatientStatusCounts;
  active: PatientStatusFilter;
}

const TABS: ReadonlyArray<{ key: PatientStatusFilter; label: string }> = [
  { key: 'active', label: 'Activos' },
  { key: 'discharged', label: 'Alta' },
  { key: 'inactive', label: 'Inactivos' },
  { key: 'archived', label: 'Archivados' },
  { key: 'all', label: 'Todos' },
];

/**
 * Filtro por status del expediente — server component (Links).
 * El conteo viene precalculado para evitar query extra por cada tab.
 */
export function StatusTabs({ counts, active }: StatusTabsProps) {
  const total = counts.active + counts.discharged + counts.inactive + counts.archived;

  return (
    <nav className="-mx-1 flex flex-wrap gap-1" aria-label="Filtrar por estado">
      {TABS.map((tab) => {
        const count = tab.key === 'all' ? total : counts[tab.key];
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={tab.key === 'active' ? '/pacientes' : `/pacientes?status=${tab.key}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex h-8 items-center gap-2 rounded-md border px-3 text-[12px] font-medium transition-colors',
              isActive
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-border-soft text-muted hover:text-text hover:bg-surface-2',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'rounded font-mono text-[10px] tabular-nums',
                isActive ? 'text-accent' : 'text-subtle',
              )}
            >
              {count.toLocaleString('es-MX')}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
