import 'server-only';

import { and, asc, count, eq, gte, lt, sql } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { appointmentTypes } from '@/lib/db/schema/appointment-types';
import { appointments } from '@/lib/db/schema/appointments';
import { patients } from '@/lib/db/schema/patients';
import { practitioners } from '@/lib/db/schema/practitioners';

/**
 * Queries del Dashboard — Fase 1.2 foundation.
 *
 * KPIs base que vamos a mostrar:
 *   - Pacientes activos
 *   - Citas hoy (count + min totales)
 *   - Citas esta semana (count)
 *   - Próximas altas (esta semana, patients con estimated_return_date <= +7d)
 *
 * Próximas citas (lista corta) y distribución por deporte vienen en sub-fase
 * siguiente cuando agreguemos gráficos.
 */

export interface DashboardStats {
  patientsActive: number;
  todayAppointments: number;
  todayMinutes: number;
  weekAppointments: number;
  upcomingReturns: number;
}

export async function getDashboardStats(
  organizationId: string,
  branchId: string | null = null,
): Promise<DashboardStats> {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const weekEnd = new Date(dayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Patients y upcomingReturns NO se filtran por branch (un paciente puede
  // tener citas en cualquier sucursal de la org). Solo los conteos de
  // appointments filtran por branchId si está presente.
  const appointmentBranchFilter = branchId ? eq(appointments.branchId, branchId) : undefined;

  const [activeRow, todayRow, weekRow, returnsRow] = await Promise.all([
    db
      .select({ value: count() })
      .from(patients)
      .where(and(eq(patients.organizationId, organizationId), eq(patients.status, 'active'))),
    db
      .select({
        value: count(),
        minutes: sql<number>`COALESCE(SUM(${appointmentTypes.durationMinutes}), 0)::int`,
      })
      .from(appointments)
      .innerJoin(appointmentTypes, eq(appointments.typeId, appointmentTypes.id))
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          gte(appointments.startAt, dayStart),
          lt(appointments.startAt, dayEnd),
          appointmentBranchFilter,
        ),
      ),
    db
      .select({ value: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          gte(appointments.startAt, dayStart),
          lt(appointments.startAt, weekEnd),
          appointmentBranchFilter,
        ),
      ),
    db
      .select({ value: count() })
      .from(patients)
      .where(
        and(
          eq(patients.organizationId, organizationId),
          eq(patients.status, 'active'),
          gte(patients.estimatedReturnDate, dayStart.toISOString().slice(0, 10)),
          lt(patients.estimatedReturnDate, weekEnd.toISOString().slice(0, 10)),
        ),
      ),
  ]);

  return {
    patientsActive: activeRow[0]?.value ?? 0,
    todayAppointments: todayRow[0]?.value ?? 0,
    todayMinutes: todayRow[0]?.minutes ?? 0,
    weekAppointments: weekRow[0]?.value ?? 0,
    upcomingReturns: returnsRow[0]?.value ?? 0,
  };
}

export interface UpcomingAppointmentRow {
  appointmentId: string;
  startAt: Date;
  status: (typeof appointments.$inferSelect)['status'];
  patient: { id: string; firstName: string; lastName: string; sport: string | null };
  practitioner: { id: string; displayName: string; color: string };
  type: { name: string; durationMinutes: number };
}

export async function getUpcomingAppointments(
  organizationId: string,
  limit = 5,
  branchId: string | null = null,
): Promise<UpcomingAppointmentRow[]> {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 7);

  const rows = await db
    .select({
      appointmentId: appointments.id,
      startAt: appointments.startAt,
      status: appointments.status,
      patientId: patients.id,
      patientFirst: patients.firstName,
      patientLast: patients.lastName,
      patientSport: patients.sport,
      practId: practitioners.id,
      practName: practitioners.displayName,
      practColor: practitioners.color,
      typeName: appointmentTypes.name,
      typeDuration: appointmentTypes.durationMinutes,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .innerJoin(appointmentTypes, eq(appointments.typeId, appointmentTypes.id))
    .where(
      and(
        eq(appointments.organizationId, organizationId),
        gte(appointments.startAt, now),
        lt(appointments.startAt, horizon),
        branchId ? eq(appointments.branchId, branchId) : undefined,
      ),
    )
    .orderBy(asc(appointments.startAt))
    .limit(limit);

  return rows.map((r) => ({
    appointmentId: r.appointmentId,
    startAt: r.startAt,
    status: r.status,
    patient: {
      id: r.patientId,
      firstName: r.patientFirst,
      lastName: r.patientLast,
      sport: r.patientSport,
    },
    practitioner: { id: r.practId, displayName: r.practName, color: r.practColor },
    type: { name: r.typeName, durationMinutes: r.typeDuration },
  }));
}
