import Link from 'next/link';

import { AvatarInitials } from '@/components/shared/avatar-initials';
import { Card } from '@/components/shared/card';
import { calculateAge } from '@/lib/patients/queries';
import { cn } from '@/lib/utils/cn';

import type { Patient } from '@/lib/db/schema/patients';

interface PatientsTableProps {
  rows: Patient[];
}

const STATUS_LABEL: Record<Patient['status'], string> = {
  active: 'Activo',
  discharged: 'Alta',
  inactive: 'Inactivo',
  archived: 'Archivado',
};

const SPORT_LEVEL_LABEL: Record<NonNullable<Patient['sportLevel']>, string> = {
  recreational: 'Recreativo',
  amateur: 'Amateur',
  semipro: 'Semiprofesional',
  professional: 'Profesional',
  elite: 'Élite',
};

/**
 * Tabla de pacientes — desktop usa `<table>` real para accesibilidad/copy-paste,
 * mobile la transforma en lista de cards (con `:md` queries).
 *
 * Cada row es un link a /pacientes/[id]. La ficha detallada llega en el
 * siguiente sub-paso de Fase 1.1.
 */
export function PatientsTable({ rows }: PatientsTableProps) {
  return (
    <Card className="overflow-hidden p-0">
      {/* Desktop: tabla */}
      <div className="hidden md:block">
        <table className="w-full text-[13px]">
          <thead className="text-subtle text-[11px] tracking-wider uppercase">
            <tr className="border-border-soft border-b">
              <th className="px-4 py-3 text-left font-medium">Paciente</th>
              <th className="px-4 py-3 text-left font-medium">Deporte</th>
              <th className="px-4 py-3 text-left font-medium">Objetivo</th>
              <th className="px-4 py-3 text-right font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-border-soft hover:bg-surface-2/40 group border-b transition-colors last:border-b-0"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/pacientes/${row.id}`}
                    className="flex items-center gap-3"
                    aria-label={`Ver ficha de ${row.firstName} ${row.lastName}`}
                  >
                    <AvatarInitials
                      name={`${row.firstName} ${row.lastName}`}
                      size="sm"
                      aria-hidden
                    />
                    <span className="flex flex-col">
                      <span className="text-text group-hover:text-accent font-medium tracking-[-0.011em] transition-colors">
                        {row.lastName}, {row.firstName}
                      </span>
                      <span className="text-muted font-mono text-[11px]">
                        <MetaLine
                          age={calculateAge(row.birthDate)}
                          email={row.email}
                          phone={row.phone}
                        />
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <SportCell sport={row.sport} level={row.sportLevel} />
                </td>
                <td className="text-muted max-w-md px-4 py-3 text-[12px]">
                  <span className="line-clamp-2">{row.functionalGoal ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: lista de cards */}
      <ul className="divide-border-soft block divide-y md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <Link
              href={`/pacientes/${row.id}`}
              className="active:bg-surface-2/60 flex items-start gap-3 px-4 py-3 transition-colors"
            >
              <AvatarInitials name={`${row.firstName} ${row.lastName}`} size="sm" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-text truncate text-[14px] font-medium tracking-[-0.011em]">
                    {row.lastName}, {row.firstName}
                  </p>
                  <StatusBadge status={row.status} compact />
                </div>
                <div className="text-muted mt-1 text-[12px]">
                  <SportCell sport={row.sport} level={row.sportLevel} inline />
                </div>
                {row.functionalGoal && (
                  <p className="text-subtle mt-1 line-clamp-2 text-[12px]">{row.functionalGoal}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MetaLine({
  age,
  email,
  phone,
}: {
  age: number | null;
  email: string | null;
  phone: string | null;
}) {
  const parts: string[] = [];
  if (age !== null) parts.push(`${age} a`);
  if (email) parts.push(email);
  else if (phone) parts.push(phone);
  return <>{parts.join(' · ') || '—'}</>;
}

function SportCell({
  sport,
  level,
  inline,
}: {
  sport: string | null;
  level: Patient['sportLevel'];
  inline?: boolean;
}) {
  if (!sport) return <span className="text-subtle">—</span>;
  return (
    <span className={inline ? 'flex flex-wrap items-center gap-1.5' : 'flex flex-col'}>
      <span className="text-text">{sport}</span>
      {level && (
        <span className={cn(inline ? 'text-subtle text-[11px]' : 'text-subtle text-[11px]')}>
          {SPORT_LEVEL_LABEL[level]}
        </span>
      )}
    </span>
  );
}

function StatusBadge({ status, compact }: { status: Patient['status']; compact?: boolean }) {
  const styles: Record<Patient['status'], string> = {
    active: 'bg-good/15 text-good',
    discharged: 'bg-accent-soft text-accent',
    inactive: 'bg-surface-2 text-muted',
    archived: 'bg-bad/10 text-bad',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-mono tracking-wider uppercase',
        compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
        styles[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
