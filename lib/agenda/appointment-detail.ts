import 'server-only';

import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { appointmentTypes } from '@/lib/db/schema/appointment-types';
import { appointments } from '@/lib/db/schema/appointments';
import { branches } from '@/lib/db/schema/branches';
import { patients } from '@/lib/db/schema/patients';
import { practitioners } from '@/lib/db/schema/practitioners';
import { rooms } from '@/lib/db/schema/rooms';

export interface AppointmentDetail {
  id: string;
  startAt: Date;
  endAt: Date;
  status: (typeof appointments.$inferSelect)['status'];
  notes: string | null;
  cancellationReason: string | null;
  patient: { id: string; firstName: string; lastName: string; sport: string | null };
  practitioner: { id: string; displayName: string; color: string };
  type: { id: string; name: string; durationMinutes: number; color: string };
  branch: { id: string; name: string; slug: string };
  room: { id: string; name: string } | null;
}

export async function getAppointmentDetail(
  organizationId: string,
  appointmentId: string,
): Promise<AppointmentDetail | null> {
  const rows = await db
    .select({
      id: appointments.id,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      status: appointments.status,
      notes: appointments.notes,
      cancellationReason: appointments.cancellationReason,
      patientId: patients.id,
      patientFirst: patients.firstName,
      patientLast: patients.lastName,
      patientSport: patients.sport,
      practId: practitioners.id,
      practName: practitioners.displayName,
      practColor: practitioners.color,
      typeId: appointmentTypes.id,
      typeName: appointmentTypes.name,
      typeDuration: appointmentTypes.durationMinutes,
      typeColor: appointmentTypes.color,
      branchId: branches.id,
      branchName: branches.name,
      branchSlug: branches.slug,
      roomId: rooms.id,
      roomName: rooms.name,
    })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(practitioners, eq(appointments.practitionerId, practitioners.id))
    .innerJoin(appointmentTypes, eq(appointments.typeId, appointmentTypes.id))
    .innerJoin(branches, eq(appointments.branchId, branches.id))
    .leftJoin(rooms, eq(appointments.roomId, rooms.id))
    .where(and(eq(appointments.id, appointmentId), eq(appointments.organizationId, organizationId)))
    .limit(1);

  const r = rows[0];
  if (!r) return null;

  return {
    id: r.id,
    startAt: r.startAt,
    endAt: r.endAt,
    status: r.status,
    notes: r.notes,
    cancellationReason: r.cancellationReason,
    patient: {
      id: r.patientId,
      firstName: r.patientFirst,
      lastName: r.patientLast,
      sport: r.patientSport,
    },
    practitioner: { id: r.practId, displayName: r.practName, color: r.practColor },
    type: {
      id: r.typeId,
      name: r.typeName,
      durationMinutes: r.typeDuration,
      color: r.typeColor,
    },
    branch: { id: r.branchId, name: r.branchName, slug: r.branchSlug },
    room: r.roomId ? { id: r.roomId, name: r.roomName ?? '' } : null,
  };
}
