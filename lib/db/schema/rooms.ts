import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { branches } from './branches';
import { organizations } from './organizations';

/**
 * Tipos de espacio físico en una sucursal:
 *  - couch: camilla individual (sesión clínica 1:1)
 *  - functional: área funcional (entrenamiento de fuerza, propiocepción)
 *  - isokinetic: máquina de isoinercia / dinamómetro (espacio especializado)
 *  - assessment: cubículo de evaluación
 *  - shared: espacio compartido (uso flexible)
 */
export const roomTypeEnum = pgEnum('room_type', [
  'couch',
  'functional',
  'isokinetic',
  'assessment',
  'shared',
]);

/**
 * Sala/recurso físico dentro de una sucursal. La agenda usa esto para
 * detectar conflictos de espacio (dos citas en la misma sala al mismo tiempo).
 *
 * Capacity = cuántas personas puede atender simultáneamente. Para una camilla
 * tradicional 1:1, capacity=1. Para un área funcional, puede ser 4-6.
 */
export const rooms = pgTable(
  'rooms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    branchId: uuid('branch_id')
      .notNull()
      .references(() => branches.id, { onDelete: 'cascade' }),

    name: text('name').notNull(),
    type: roomTypeEnum('type').notNull().default('couch'),

    /** Cuántas personas atender simultáneamente. 1 para camilla individual. */
    capacity: integer('capacity').notNull().default(1),

    /** Para deshabilitar temporalmente sin borrar (mantenimiento, equipo dañado). */
    isActive: integer('is_active').notNull().default(1),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('rooms_branch_name_unique').on(t.branchId, t.name),
    index('rooms_org_branch_idx').on(t.organizationId, t.branchId),
  ],
);

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
