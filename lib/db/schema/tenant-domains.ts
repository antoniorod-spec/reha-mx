import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

/**
 * Custom domains por tenant — ej: app.movewell.mx → org MoveWell.
 * El tenant resolver consulta esta tabla cuando el host no es {slug}.rehai.app.
 *
 * Subdomain bajo rehai.app (movewell.rehai.app) NO va aquí — se resuelve por slug.
 */
export const tenantDomains = pgTable('tenant_domains', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  /** Hostname completo: 'app.movewell.mx', sin protocolo, sin path */
  domain: text('domain').notNull().unique(),
  /** Set cuando el dominio pasa verificación DNS (CNAME apunta a Vercel) */
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type TenantDomain = typeof tenantDomains.$inferSelect;
export type NewTenantDomain = typeof tenantDomains.$inferInsert;
