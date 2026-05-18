import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

/**
 * Tipos de cita configurables por organización. Cada org puede crear los suyos
 * pero el seed precarga 5 estándar de MoveWell / clínica de readaptación
 * deportiva típica:
 *
 *   1. Valoración inicial — 60min — alta intensidad de trabajo, primera visita
 *   2. Sesión de rehabilitación — 45min — sesión clínica típica
 *   3. Reevaluación — 30min — chequeo a medio camino
 *   4. Readaptación funcional — 60min — entrenamiento progresivo
 *   5. Alta clínica — 30min — última visita + plan de mantenimiento
 *
 * `slug` permite que el código se refiera al tipo por nombre estable
 * (no por UUID) mientras que el nombre legible puede cambiar.
 */
export const appointmentTypes = pgTable(
  'appointment_types',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    /** Identificador estable: 'valoracion', 'sesion-rehab', 'reevaluacion'... */
    slug: text('slug').notNull(),

    name: text('name').notNull(),

    /** Duración en minutos. Default 45min (sesión clínica). */
    durationMinutes: integer('duration_minutes').notNull().default(45),

    /** Color hex para mostrar en agenda. */
    color: text('color').notNull().default('#3FBCD4'),

    /** Para booking público: ¿se ofrece este tipo a pacientes externos? */
    bookableByPatient: text('bookable_by_patient').notNull().default('false'),

    /** Precio sugerido en centavos MXN — informativo, el cobro va por payments. */
    priceCents: integer('price_cents'),

    isActive: text('is_active').notNull().default('true'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('appointment_types_org_slug_unique').on(t.organizationId, t.slug),
    index('appointment_types_org_active_idx').on(t.organizationId, t.isActive),
  ],
);

export type AppointmentType = typeof appointmentTypes.$inferSelect;
export type NewAppointmentType = typeof appointmentTypes.$inferInsert;
