import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Card } from '@/components/shared/card';
import { getActiveBranch } from '@/lib/agenda/active-branch';
import {
  listAppointments,
  listAppointmentTypes,
  listBranches,
  listPractitioners,
  listRoomsByBranch,
  searchPatientsForPicker,
} from '@/lib/agenda/queries';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';

import { AgendaToolbar } from './agenda-toolbar';
import { AppointmentsList } from './appointments-list';
import { NewAppointmentLauncher } from './new-appointment-launcher';
import { parseAgendaSearchParams } from './search-params';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agenda',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Página de Agenda — vista lista por día (Fase 1.2 foundation).
 *
 * Server Component:
 *   1. Resuelve org del usuario actual.
 *   2. Lee params: date (YYYY-MM-DD, default hoy).
 *   3. Resuelve branch activo desde cookie (BranchSelector del sidebar).
 *   4. Lista citas del día filtradas por branch activo (si hay).
 *   5. Carga datos para el form de "Nueva cita".
 *   6. Emite audit log `agenda.viewed`.
 *
 * Vista calendario (semana/día/mes con DnD-Kit) llega en sub-fase 1.2.b.
 */
export default async function AgendaPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = parseAgendaSearchParams(raw);

  const userOrg = await getCurrentUserOrg();
  if (userOrg === null) {
    redirect('/login?next=/agenda');
  }

  const [branchList, typesList, practitionersList, activeBranch] = await Promise.all([
    listBranches(userOrg.organization.id),
    listAppointmentTypes(userOrg.organization.id),
    listPractitioners(userOrg.organization.id),
    getActiveBranch(userOrg.organization.id),
  ]);

  const effectiveBranchId = activeBranch?.id;

  const dayStart = new Date(`${filters.date}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [appointmentsList, roomList, initialPatients] = await Promise.all([
    listAppointments({
      organizationId: userOrg.organization.id,
      startAt: dayStart,
      endAt: dayEnd,
      branchId: effectiveBranchId,
    }),
    effectiveBranchId
      ? listRoomsByBranch(userOrg.organization.id, effectiveBranchId)
      : Promise.resolve([]),
    searchPatientsForPicker(userOrg.organization.id, ''),
  ]);

  await logAudit({
    organizationId: userOrg.organization.id,
    userId: userOrg.userId,
    action: 'agenda.viewed',
    resourceType: 'appointment',
    metadata: {
      date: filters.date,
      branchSlug: activeBranch?.slug ?? null,
      results: appointmentsList.length,
    },
  });

  const canCreate = branchList.length > 0 && practitionersList.length > 0 && typesList.length > 0;
  const branchLabel = activeBranch?.name ?? 'Vista consolidada';
  const branchDotColor = activeBranch?.color ?? '#3FBCD4';

  return (
    <main className="px-4 pt-4 pb-10 sm:px-6 sm:pt-5">
      <header className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-subtle font-mono text-[10.5px] tracking-wider uppercase sm:text-[11px]">
            Operación · {userOrg.organization.name}
          </p>
          <h1 className="text-text mt-1 text-[22px] font-semibold tracking-[-0.022em] sm:text-[28px]">
            Agenda<span className="text-accent">.</span>
          </h1>
          <p className="text-muted mt-1.5 flex items-center gap-2 text-[12px] sm:text-[12.5px]">
            <span
              className="size-1.5 shrink-0 rounded-full"
              style={{ background: branchDotColor }}
              aria-hidden
            />
            <span className="text-text">{branchLabel}</span>
            <span className="text-subtle font-mono text-[11px]">
              · cambia la sucursal en el sidebar
            </span>
          </p>
        </div>

        {canCreate && (
          <NewAppointmentLauncher
            branches={branchList.map((b) => ({ id: b.id, name: b.name, slug: b.slug }))}
            practitioners={practitionersList.map((p) => ({
              id: p.id,
              displayName: p.displayName,
              color: p.color,
              primaryBranchId: p.primaryBranchId,
            }))}
            types={typesList.map((t) => ({
              id: t.id,
              name: t.name,
              durationMinutes: t.durationMinutes,
              color: t.color,
            }))}
            defaultBranchId={effectiveBranchId ?? branchList[0]?.id}
            defaultDate={filters.date}
            roomsByBranch={
              effectiveBranchId
                ? { [effectiveBranchId]: roomList.map((r) => ({ id: r.id, name: r.name })) }
                : {}
            }
            initialPatients={initialPatients}
          />
        )}
      </header>

      <Card className="mb-4">
        <AgendaToolbar date={filters.date} />
      </Card>

      {!canCreate && (
        <Card size="lg" className="mb-4">
          <p className="text-text text-[14px] font-medium">Falta configuración para crear citas</p>
          <p className="text-muted mt-1 text-[12px]">
            Necesitas al menos 1 sucursal, 1 fisio y 1 tipo de cita.{' '}
            <Link
              href="/configuracion/sucursales"
              className="text-accent underline-offset-2 hover:underline"
            >
              Ir a Configuración →
            </Link>
          </p>
        </Card>
      )}

      <AppointmentsList rows={appointmentsList} date={filters.date} />
    </main>
  );
}
