import {
  index,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

/**
 * Estado de una sucursal — `active` para operación normal, `paused` cuando
 * temporalmente no recibe citas (mantenimiento, vacaciones), `closed` para
 * cierres definitivos sin borrar histórico de pacientes/citas.
 */
export const branchStatusEnum = pgEnum('branch_status', ['active', 'paused', 'closed']);

/**
 * Sucursal de una clínica. Una organización puede tener N branches.
 *
 * MoveWell SLP tiene 2 sucursales reales: Centro y Lomas Pádel. La tabla
 * está pensada para que crezca a multi-ciudad (CDMX, Monterrey) y que el
 * "default" se pueda configurar por usuario más adelante.
 *
 * No incluye horarios estructurados todavía (`opening_hours JSON` viene
 * en sub-fase posterior cuando hagamos los slots de booking público).
 */
export const branches = pgTable(
  'branches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    /** Slug corto para URLs internas: 'centro', 'lomas-padel'. */
    slug: text('slug').notNull(),
    name: text('name').notNull(),

    /** Color hex para badges + agenda overlays. Override del default tenant. */
    color: text('color'),

    addressLine: text('address_line'),
    city: text('city'),
    state: text('state'),
    postalCode: text('postal_code'),
    phone: text('phone'),

    /** Zona horaria IANA — la mayoría de México es 'America/Mexico_City'. */
    timezone: text('timezone').notNull().default('America/Mexico_City'),

    /** Hora de apertura/cierre default (usado por slots de booking público). */
    defaultOpenAt: time('default_open_at').default('08:00'),
    defaultCloseAt: time('default_close_at').default('21:00'),

    status: branchStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('branches_org_slug_unique').on(t.organizationId, t.slug),
    index('branches_org_status_idx').on(t.organizationId, t.status),
  ],
);

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
