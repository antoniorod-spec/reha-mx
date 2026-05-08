import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

/**
 * Branding por tenant — colores, logo, "from email", nombre WhatsApp Business.
 * Se inyecta vía data-tenant en <html> + CSS vars (sin client JS).
 *
 * Default si no hay row: branding Reha.mx (cyan #3FBCD4, logo Reha.mx).
 */
export const tenantBranding = pgTable('tenant_branding', {
  organizationId: uuid('organization_id')
    .primaryKey()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  /** URL del logo light theme (sirve también para dark si no hay logo_dark_url) */
  logoUrl: text('logo_url'),
  /** URL del logo dark theme (opcional, fallback a logo_url) */
  logoDarkUrl: text('logo_dark_url'),
  /** Hex del accent — override del default Reha.mx cyan #3FBCD4 */
  accentColor: text('accent_color').default('#3FBCD4'),
  /** "from" de emails transaccionales — ej. 'citas@movewell.reha.mx' */
  emailFrom: text('email_from'),
  /** Nombre que verá el paciente en WhatsApp Business — ej. 'MoveWell SLP' */
  whatsappBusinessName: text('whatsapp_business_name'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type TenantBranding = typeof tenantBranding.$inferSelect;
export type NewTenantBranding = typeof tenantBranding.$inferInsert;
