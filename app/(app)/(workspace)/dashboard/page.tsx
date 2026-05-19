import { Calendar, Plus, Upload } from 'lucide-react';
import Link from 'next/link';

import { AvatarInitials } from '@/components/shared/avatar-initials';
import { Card } from '@/components/shared/card';
import { Kpi } from '@/components/shared/kpi';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';
import { getDashboardStats, getUpcomingAppointments } from '@/lib/dashboard/queries';
import { cn } from '@/lib/utils/cn';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

const STATUS_LABEL = {
  scheduled: 'Agendada',
  confirmed: 'Confirmada',
  in_progress: 'En curso',
  completed: 'Completada',
  no_show: 'No asistió',
  cancelled: 'Cancelada',
} as const;

const STATUS_STYLES = {
  scheduled: 'bg-surface-2 text-muted',
  confirmed: 'bg-accent-soft text-accent',
  in_progress: 'bg-accent-soft text-accent ring-1 ring-accent/30',
  completed: 'bg-good/15 text-good',
  no_show: 'bg-bad/10 text-bad',
  cancelled: 'bg-surface-2 text-subtle line-through',
} as const;

/**
 * Dashboard del workspace — landing post-login.
 *
 * KPIs base + lista de próximas citas (7 días). Diseño alineado al
 * prototipo: eyebrow mono con fecha actual, H1 grande con greeting + punto
 * accent, sub-info con dot de sucursal, acciones a la derecha.
 *
 * Gráficos (ingresos por sucursal, próximas altas detalladas, evolución de
 * pacientes) llegan en sub-sprint siguiente cuando integremos LineChart
 * desde el design system.
 */
export default async function DashboardPage() {
  const userOrg = await getCurrentUserOrg();
  // El layout (workspace) ya redirigió si no hay sesión — userOrg está garantizado.
  if (!userOrg) return null;

  const [stats, upcoming] = await Promise.all([
    getDashboardStats(userOrg.organization.id),
    getUpcomingAppointments(userOrg.organization.id, 5),
  ]);

  await logAudit({
    organizationId: userOrg.organization.id,
    userId: userOrg.userId,
    action: 'dashboard.viewed',
  });

  const greeting = buildGreeting(userOrg.email);
  const today = new Date();
  const dateLabel = today
    .toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <main className="px-4 pt-4 pb-10 sm:px-6 sm:pt-5">
      <header className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-subtle font-mono text-[10.5px] tracking-wider uppercase sm:text-[11px]">
            {dateLabel}
          </p>
          <h1 className="text-text mt-1 text-[22px] font-semibold tracking-[-0.022em] sm:text-[28px]">
            {greeting}
            <span className="text-accent">.</span>
          </h1>
          <p className="text-muted mt-1.5 flex items-center gap-2 text-[12px] sm:text-[12.5px]">
            <span className="bg-accent size-1.5 shrink-0 rounded-full" aria-hidden />
            {userOrg.organization.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="border-border bg-surface text-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12.5px] font-medium disabled:cursor-not-allowed"
          >
            <Upload className="size-[13px]" aria-hidden />
            Exportar
          </button>
          <Link
            href="/agenda"
            className="bg-accent text-accent-on inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold"
          >
            <Plus className="size-[13px]" aria-hidden />
            Nueva cita
          </Link>
        </div>
      </header>

      <section
        className="mb-3 grid grid-cols-2 gap-2.5 sm:mb-5 sm:gap-3 lg:grid-cols-4"
        aria-label="KPIs"
      >
        <Kpi label="Pacientes activos" value={stats.patientsActive} deltaLabel="en expediente" />
        <Kpi
          label="Citas hoy"
          value={stats.todayAppointments}
          deltaLabel={`${stats.todayMinutes} min totales`}
        />
        <Kpi
          label="Citas esta semana"
          value={stats.weekAppointments}
          deltaLabel="próximos 7 días"
        />
        <Kpi
          label="Retornos esta semana"
          value={stats.upcomingReturns}
          deltaLabel="estimado de alta"
        />
      </section>

      <section aria-label="Próximas citas">
        <Card className="overflow-hidden p-0">
          <div className="border-border-soft flex items-center justify-between border-b px-4 pt-4 pb-3">
            <div>
              <h2 className="text-text text-[13px] font-semibold tracking-[-0.011em]">
                Próximas citas
              </h2>
              <p className="text-subtle mt-0.5 font-mono text-[11px]">próximos 7 días</p>
            </div>
            <Link
              href="/agenda"
              className="text-muted hover:text-text inline-flex items-center gap-1 font-mono text-[11px] transition-colors"
            >
              <Calendar className="size-[12px]" aria-hidden /> Ver agenda
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-text text-[13px]">No hay citas en los próximos 7 días.</p>
              <p className="text-muted mt-1 text-[12px]">
                <Link href="/agenda" className="text-accent underline-offset-2 hover:underline">
                  Crear cita →
                </Link>
              </p>
            </div>
          ) : (
            <ul className="divide-border-soft divide-y">
              {upcoming.map((row) => {
                const start = new Date(row.startAt);
                const date = start.toLocaleDateString('es-MX', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                });
                const time = start.toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
                const fullName = `${row.patient.firstName} ${row.patient.lastName}`;

                return (
                  <li key={row.appointmentId} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex w-20 shrink-0 flex-col">
                      <span className="text-text font-mono text-[13px] leading-tight tabular-nums">
                        {time}
                      </span>
                      <span className="text-subtle font-mono text-[10px] leading-tight">
                        {date} · {row.type.durationMinutes}m
                      </span>
                    </div>

                    <span
                      className="w-1 shrink-0 self-stretch rounded-full"
                      style={{ backgroundColor: row.practitioner.color }}
                      aria-hidden
                    />

                    <AvatarInitials name={fullName} size="sm" aria-hidden />

                    <div className="min-w-0 flex-1">
                      <p className="text-text truncate text-[13.5px] font-medium tracking-[-0.011em]">
                        {fullName}
                      </p>
                      <p className="text-subtle truncate text-[11px]">
                        {row.patient.sport ? `${row.patient.sport} · ` : ''}
                        {row.type.name} · {row.practitioner.displayName}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'inline-flex h-6 items-center rounded-md px-2 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase',
                        STATUS_STYLES[row.status],
                      )}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      <p className="text-subtle mt-6 text-[11px]">
        Gráficos de ingresos, evolución de pacientes y próximas altas detalladas llegan en
        sub-sprint siguiente.
      </p>
    </main>
  );
}

function buildGreeting(email: string): string {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const name = capitalize(email.split('@')[0]?.split('.')[0] ?? 'tú');
  return `${greeting}, ${name}`;
}

function capitalize(s: string): string {
  if (s.length === 0) return s;
  return s[0]!.toUpperCase() + s.slice(1);
}
