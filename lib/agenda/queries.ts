import 'server-only';

import { and, asc, eq, gte, lt, sql } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { appointmentTypes, type AppointmentType } from '@/lib/db/schema/appointment-types';
import { appointments, type Appointment } from '@/lib/db/schema/appointments';
import { branches, type Branch } from '@/lib/db/schema/branches';
import { patients, type Patient } from '@/lib/db/schema/patients';
import { practitioners, type Practitioner } from '@/lib/db/schema/practitioners';
import { rooms, type Room } from '@/lib/db/schema/rooms';

/**
 * Queries de agenda — Fase 1.2 (foundation).
 *
 * Convención: TODAS las queries reciben `organizationId` y filtran por él
 * explícitamente (defensa en profundidad junto a RLS). Joins se hacen vía
 * Drizzle para que el resultado venga ya estructurado.
 */

export interface AppointmentRow {
  appointment: Appointment;
  patient: Pick<Patient, 'id' | 'firstName' | 'lastName' | 'sport'>;
  practitioner: Pick<Practitioner, 'id' | 'displayName' | 'color'>;
  type: Pick<AppointmentType, 'id' | 'name' | 'color' | 'durationMinutes'>;
  branch: Pick<Branch, 'id' | 'name' | 'slug'>;
  room: Pick<Room, 'id' | 'name'> | null;
}

export interface ListAppointmentsParams {
  organizationId: string;
  /** Inicio del rango (inclusive). */
  startAt: Date;
  /** Fin del rango (exclusive). */
  endAt: Date;
  branchId?: string | undefined;
  practitionerId?: string | undefined;
}

/**
 * Lista citas en un rango de tiempo, con joins a entidades relacionadas.
 * Resultado ordenado por start_at ascendente.
 */
export async function listAppointments(params: ListAppointmentsParams): Promise<AppointmentRow[]> {
  const conditions = [
    eq(appointments.organizationId, params.organizationId),
    gte(appointments.startAt, params.startAt),
    lt(appointments.startAt, params.endAt),
  ];

  if (params.branchId) conditions.push(eq(appointments.branchId, params.branchId));
  if (params.practitionerId)
    conditions.push(eq(appointments.practitionerId, params.practitionerId));

  const rows = await db
    .select({
      appointment: appointments,
      patient: {
        id: patients.id,
        firstName: patients.firstName,
        lastName: patients.lastName,
        sport: patients.sport,
      },
      practitioner: {
        id: practitioners.id,
        displayName: practitioners.displayName,
        color: practitioners.color,
      },
      type: {
        id: appointmentTypes.id,
        name: appointmentTypes.name,
        color: appointmentTypes.color,
        durationMinutes: appointmentTypes.durationMinutes,
      },
      branch: {
        id: branches.id,
        name: branches.name,
        slug: branches.slug,
      },
      room: {
        id: rooms.id,
        name: rooms.name,
      },
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .innerJoin(appointmentTypes, eq(appointments.typeId, appointmentTypes.id))
    .innerJoin(branches, eq(appointments.branchId, branches.id))
    .leftJoin(rooms, eq(appointments.roomId, rooms.id))
    .where(and(...conditions))
    .orderBy(asc(appointments.startAt));

  return rows.map((r) => ({
    appointment: r.appointment,
    patient: r.patient,
    practitioner: r.practitioner,
    type: r.type,
    branch: r.branch,
    room: r.room?.id ? { id: r.room.id, name: r.room.name as string } : null,
  }));
}

export async function listBranches(organizationId: string): Promise<Branch[]> {
  return db
    .select()
    .from(branches)
    .where(eq(branches.organizationId, organizationId))
    .orderBy(asc(branches.name));
}

export async function listPractitioners(organizationId: string): Promise<Practitioner[]> {
  return db
    .select()
    .from(practitioners)
    .where(
      and(eq(practitioners.organizationId, organizationId), eq(practitioners.isActive, 'true')),
    )
    .orderBy(asc(practitioners.displayName));
}

export async function listAppointmentTypes(organizationId: string): Promise<AppointmentType[]> {
  return db
    .select()
    .from(appointmentTypes)
    .where(
      and(
        eq(appointmentTypes.organizationId, organizationId),
        eq(appointmentTypes.isActive, 'true'),
      ),
    )
    .orderBy(asc(appointmentTypes.name));
}

export async function listRoomsByBranch(organizationId: string, branchId: string): Promise<Room[]> {
  return db
    .select()
    .from(rooms)
    .where(and(eq(rooms.organizationId, organizationId), eq(rooms.branchId, branchId)))
    .orderBy(asc(rooms.name));
}

/**
 * Buscador de pacientes por nombre para el form de "Crear cita".
 * Devuelve hasta 25 resultados sin paginación (autocomplete típico).
 */
export async function searchPatientsForPicker(
  organizationId: string,
  searchTerm: string,
): Promise<Array<Pick<Patient, 'id' | 'firstName' | 'lastName' | 'sport'>>> {
  const term = searchTerm.trim();
  const conditions = [eq(patients.organizationId, organizationId)];

  if (term.length > 0) {
    conditions.push(
      sql`(
        ${patients.firstName} ILIKE ${'%' + term + '%'}
        OR ${patients.lastName} ILIKE ${'%' + term + '%'}
        OR ${patients.email} ILIKE ${'%' + term + '%'}
        OR ${patients.phone} ILIKE ${'%' + term + '%'}
      )`,
    );
  }

  return db
    .select({
      id: patients.id,
      firstName: patients.firstName,
      lastName: patients.lastName,
      sport: patients.sport,
    })
    .from(patients)
    .where(and(...conditions))
    .orderBy(asc(patients.lastName), asc(patients.firstName))
    .limit(25);
}

/**
 * Verifica si hay overlap (conflicto) con una cita existente para un
 * practitioner o una sala dada. Usado por createAppointmentAction antes de
 * insertar para evitar dobles bookings.
 *
 * Considera "ocupado" cualquier appointment con status != cancelled/no_show.
 */
export interface ConflictCheckParams {
  organizationId: string;
  practitionerId: string;
  roomId: string | null;
  startAt: Date;
  endAt: Date;
  /** Si se está editando una cita existente, ignorarla. */
  excludeAppointmentId?: string;
}

export interface ConflictResult {
  practitionerBusy: boolean;
  roomBusy: boolean;
}

export async function checkAppointmentConflicts(
  params: ConflictCheckParams,
): Promise<ConflictResult> {
  const overlapClause = sql`${appointments.startAt} < ${params.endAt} AND ${appointments.endAt} > ${params.startAt}`;
  const blockingStatus = sql`${appointments.status} NOT IN ('cancelled', 'no_show')`;

  const baseConditions = [
    eq(appointments.organizationId, params.organizationId),
    overlapClause,
    blockingStatus,
  ];

  if (params.excludeAppointmentId) {
    baseConditions.push(sql`${appointments.id} <> ${params.excludeAppointmentId}`);
  }

  const [practitionerHit, roomHit] = await Promise.all([
    db
      .select({ id: appointments.id })
      .from(appointments)
      .where(and(...baseConditions, eq(appointments.practitionerId, params.practitionerId)))
      .limit(1),
    params.roomId
      ? db
          .select({ id: appointments.id })
          .from(appointments)
          .where(and(...baseConditions, eq(appointments.roomId, params.roomId)))
          .limit(1)
      : Promise.resolve([]),
  ]);

  return {
    practitionerBusy: practitionerHit.length > 0,
    roomBusy: roomHit.length > 0,
  };
}
