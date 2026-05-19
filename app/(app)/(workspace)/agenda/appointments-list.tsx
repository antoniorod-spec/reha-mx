'use client';

import { useState } from 'react';

import { AvatarInitials } from '@/components/shared/avatar-initials';
import { Card } from '@/components/shared/card';
import { cn } from '@/lib/utils/cn';

import { AppointmentSheet } from './appointment-sheet';

import type { AppointmentRow } from '@/lib/agenda/queries';
import type { Appointment } from '@/lib/db/schema/appointments';

interface AppointmentsListProps {
  rows: AppointmentRow[];
  date: string;
}

const STATUS_LABEL: Record<Appointment['status'], string> = {
  scheduled: 'Agendada',
  confirmed: 'Confirmada',
  in_progress: 'En curso',
  completed: 'Completada',
  no_show: 'No asistió',
  cancelled: 'Cancelada',
};

const STATUS_STYLES: Record<Appointment['status'], string> = {
  scheduled: 'bg-surface-2 text-muted',
  confirmed: 'bg-accent-soft text-accent',
  in_progress: 'bg-accent-soft text-accent ring-1 ring-accent/30',
  completed: 'bg-good/15 text-good',
  no_show: 'bg-bad/10 text-bad',
  cancelled: 'bg-surface-2 text-subtle line-through',
};

export function AppointmentsList({ rows, date }: AppointmentsListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRow = rows.find((r) => r.appointment.id === selectedId) ?? null;

  if (rows.length === 0) {
    return (
      <Card size="lg">
        <p className="text-text text-[14px] font-medium">No hay citas para este día.</p>
        <p className="text-muted mt-1 text-[12px]">
          Probá cambiar de fecha o sucursal, o crear una nueva cita.
        </p>
      </Card>
    );
  }

  const totalDuration = rows.reduce((acc, r) => acc + r.type.durationMinutes, 0);
  const totalLabel = `${rows.length} ${rows.length === 1 ? 'cita' : 'citas'} · ${totalDuration} min totales`;

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className="border-border-soft flex items-center justify-between border-b px-4 py-3">
          <p className="text-muted text-[12px]">
            <span className="text-text font-mono tabular-nums">{rows.length}</span>{' '}
            {rows.length === 1 ? 'cita' : 'citas'} ·{' '}
            <span className="text-text font-mono tabular-nums">{totalDuration}</span> min totales
          </p>
          <p className="text-subtle font-mono text-[11px]" title={`Día: ${date}`}>
            {totalLabel}
          </p>
        </div>

        <ul className="divide-border-soft divide-y">
          {rows.map(({ appointment, patient, practitioner, type, branch, room }) => {
            const start = new Date(appointment.startAt);
            const end = new Date(appointment.endAt);
            const startTime = start.toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            const endTime = end.toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            const fullName = `${patient.firstName} ${patient.lastName}`;

            return (
              <li key={appointment.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(appointment.id)}
                  className="hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:ring-accent/50 flex w-full gap-4 px-4 py-3 text-left transition-colors outline-none focus-visible:ring-1 focus-visible:ring-inset"
                  aria-label={`Abrir detalle de cita de ${fullName} a las ${startTime}`}
                >
                  <div className="text-text flex w-16 shrink-0 flex-col">
                    <span className="font-mono text-[16px] leading-tight tabular-nums">
                      {startTime}
                    </span>
                    <span className="text-subtle font-mono text-[10px] leading-tight">
                      {endTime} ({type.durationMinutes}m)
                    </span>
                  </div>

                  <span
                    className="w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: practitioner.color }}
                    aria-hidden
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <AvatarInitials name={fullName} size="sm" aria-hidden />
                        <div className="min-w-0">
                          <p className="text-text truncate text-[14px] font-medium tracking-[-0.011em]">
                            {fullName}
                          </p>
                          <p className="text-subtle text-[11px]">
                            {patient.sport ? `${patient.sport} · ` : ''}
                            {practitioner.displayName}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'inline-flex h-6 items-center rounded-md px-2 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase',
                          STATUS_STYLES[appointment.status],
                        )}
                      >
                        {STATUS_LABEL[appointment.status]}
                      </span>
                    </div>

                    <div className="text-muted mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
                      <span>
                        <span className="text-subtle">Tipo · </span>
                        <span className="text-text">{type.name}</span>
                      </span>
                      <span>
                        <span className="text-subtle">Sucursal · </span>
                        <span className="text-text">{branch.name}</span>
                      </span>
                      {room && (
                        <span>
                          <span className="text-subtle">Sala · </span>
                          <span className="text-text">{room.name}</span>
                        </span>
                      )}
                    </div>

                    {appointment.notes && (
                      <p className="text-muted mt-2 line-clamp-2 text-[12px] italic">
                        “{appointment.notes}”
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {selectedRow && <AppointmentSheet row={selectedRow} onClose={() => setSelectedId(null)} />}
    </>
  );
}
