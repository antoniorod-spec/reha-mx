import { sql } from 'drizzle-orm';
import { check, index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { appointmentTypes } from './appointment-types';
import { branches } from './branches';
import { organizations } from './organizations';
import { patients } from './patients';
import { practitioners } from './practitioners';
import { rooms } from './rooms';

/**
 * State machine de una cita (master plan §Fase 1):
 *
 *   scheduled → confirmed → in_progress → completed
 *                                       → no_show
 *                                       → cancelled
 *
 * Transiciones permitidas (a validar en server actions):
 *   scheduled    → confirmed | cancelled
 *   confirmed    → in_progress | cancelled | no_show
 *   in_progress  → completed
 *   completed    (terminal)
 *   no_show      (terminal)
 *   cancelled    (terminal)
 */
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'no_show',
  'cancelled',
]);

/**
 * Cita en agenda. La row es la "fuente de verdad" del evento clínico.
 *
 * Constraints clave:
 *   - end_at > start_at (CHECK)
 *   - el slot del fisio es único por overlapping (validado a nivel server action;
 *     un exclusion constraint en Postgres requeriría btree_gist y agrega
 *     complejidad — primero validamos en código + audit log)
 *   - el slot de la sala es único por overlapping (mismo razonamiento)
 *
 * `confirmationToken` se usa en links de WhatsApp/email para que el paciente
 * confirme sin loguearse. Es UUID v4 ad-hoc — el server lo verifica y aplica
 * confirmAppointmentAction.
 *
 * `source` documenta cómo se creó la cita (manual, booking público, n8n).
 */
export const appointments = pgTable(
  'appointments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'restrict' }),
    practitionerId: uuid('practitioner_id')
      .notNull()
      .references(() => practitioners.id, { onDelete: 'restrict' }),
    patientId: uuid('patient_id')
      .notNull()
      .references(() => patients.id, { onDelete: 'restrict' }),
    typeId: uuid('type_id')
      .notNull()
      .references(() => appointmentTypes.id, { onDelete: 'restrict' }),
    roomId: uuid('room_id').references(() => rooms.id, { onDelete: 'set null' }),

    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),

    status: appointmentStatusEnum('status').notNull().default('scheduled'),

    /** Notas visibles para fisio/recepción, no para el paciente. */
    notes: text('notes'),

    /** Motivo de cancelación si status='cancelled'. */
    cancellationReason: text('cancellation_reason'),

    /** Token UUID para confirmar/cancelar sin login (vía link WhatsApp/email). */
    confirmationToken: uuid('confirmation_token').defaultRandom(),

    /** Origen: manual, booking_public, recurring, imported, n8n. */
    source: text('source').notNull().default('manual'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('appointments_end_after_start', sql`${t.endAt} > ${t.startAt}`),

    // Búsqueda principal: agenda por sucursal/fisio/día
    index('appointments_branch_start_idx').on(t.branchId, t.startAt),
    index('appointments_practitioner_start_idx').on(t.practitionerId, t.startAt),
    index('appointments_patient_start_idx').on(t.patientId, t.startAt),
    index('appointments_org_status_start_idx').on(t.organizationId, t.status, t.startAt),
  ],
);

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
