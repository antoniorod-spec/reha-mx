import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Card } from '@/components/shared/card';
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
 *   2. Lee params: date (YYYY-MM-DD, default hoy), branch (slug | null = todas).
 *   3. Lista citas del día con joins (patient, practitioner, type, branch, room).
 *   4. Carga datos para el form de "Nueva cita" (branches, types, practitioners,
 *      rooms del branch seleccionado, primeros 25 pacientes).
 *   5. Emite audit log `agenda.viewed`.
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

  const [branchList, typesList, practitionersList] = await Promise.all([
    listBranches(userOrg.organization.id),
    listAppointmentTypes(userOrg.organization.id),
    listPractitioners(userOrg.organization.id),
  ]);

  // Selected branch (puede ser null = "Todas las sucursales")
  const selectedBranch =
    filters.branchSlug === null
      ? null
      : (branchList.find((b) => b.slug === filters.branchSlug) ?? null);

  // Si el slug del query no matcheó, caemos a "todas"
  const effectiveBranchId = selectedBranch?.id;

  // Rango: día completo de filters.date en tz local del servidor.
  // En sub-fase 1.2.b lo ajustamos al tz de la sucursal (master plan).
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
      branchSlug: filters.branchSlug,
      results: appointmentsList.length,
    },
  });

  const canCreate = branchList.length > 0 && practitionersList.length > 0 && typesList.length > 0;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-subtle font-mono text-[11px] tracking-wider uppercase">
            {userOrg.organization.name}
          </p>
          <h1 className="text-text mt-1 text-2xl font-semibold tracking-[-0.022em]">Agenda</h1>
          <p className="text-muted mt-1 text-[13px]">
            Vista por día. Vista calendario (semana/mes con drag&amp;drop) llega en próximo
            sub-sprint.
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
        <AgendaToolbar
          date={filters.date}
          branchSlug={filters.branchSlug}
          branches={branchList.map((b) => ({ id: b.id, slug: b.slug, name: b.name }))}
        />
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
