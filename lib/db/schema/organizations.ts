import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Estado de suscripción de la organización al SaaS Reha.mx.
 * - founder: MoveWell SLP — Cliente Fundador, vitalicio sin licencia
 * - trial: prueba gratis (14 días default)
 * - active: pagando suscripción
 * - past_due: pago atrasado, gracia 7 días
 * - canceled: canceló pero acceso hasta fin de período
 * - suspended: bloqueada (no acceso)
 */
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'founder',
  'trial',
  'active',
  'past_due',
  'canceled',
  'suspended',
]);

/**
 * Tabla raíz multi-tenant. Cada clínica que usa Reha.mx es una organization.
 * Toda tabla con datos clínicos lleva organization_id + RLS.
 */
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Slug único usado en subdominio: movewell.reha.mx → slug='movewell' */
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').notNull().default('trial'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
