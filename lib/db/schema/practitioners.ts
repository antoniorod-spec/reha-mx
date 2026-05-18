import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { branches } from './branches';
import { organizations } from './organizations';

/**
 * Especialidad clínica del fisio — afecta filtrado en agenda y derivaciones.
 * Valores en español para el contexto MX (no hay enum SAT/CONAMED, lo definimos
 * nosotros para que sea consistente entre clínicas).
 */
export const practitionerSpecialtyEnum = pgEnum('practitioner_specialty', [
  'fisioterapia_deportiva',
  'readaptacion_funcional',
  'fisioterapia_general',
  'kinesiologia',
  'osteopatia',
  'nutricion_deportiva',
  'preparacion_fisica',
  'medicina_deportiva',
  'otra',
]);

/**
 * Practitioner = fisio / profesional clínico que atiende pacientes.
 *
 * Extiende `members` con datos profesionales. Un member con role='practitioner'
 * típicamente tiene una row aquí; admin/director pueden o no atender (si lo
 * hacen, también tienen practitioner row).
 *
 * `userId` apunta a auth.users (Supabase). `displayName` es lo que ve el
 * paciente en WhatsApp / portal (puede ser "Mtra. Paulina G." en vez del email).
 *
 * `primaryBranchId` = sucursal default; el fisio puede atender en otras
 * sucursales sin restricción, solo es el preselect en formularios.
 */
export const practitioners = pgTable(
  'practitioners',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    /** Apunta a auth.users.id (Supabase Auth, sin FK formal). */
    userId: uuid('user_id').notNull(),

    displayName: text('display_name').notNull(),
    /** Título profesional formal — 'Lic. en Fisioterapia', 'Mtra. en Readaptación'. */
    title: text('title'),
    /** Cédula profesional (DGP / SEP) — opcional pero recomendado pre go-live. */
    licenseNumber: text('license_number'),

    specialty: practitionerSpecialtyEnum('specialty').notNull().default('fisioterapia_deportiva'),

    /** Color hex que identifica al fisio en el calendario. */
    color: text('color').notNull().default('#3FBCD4'),

    /** Sucursal default — puede atender en otras. */
    primaryBranchId: uuid('primary_branch_id').references(() => branches.id, {
      onDelete: 'set null',
    }),

    /** Notas internas (formación, certificaciones) — no visible al paciente. */
    bio: text('bio'),

    /** Inactivo = no aparece en pickers de agenda pero conserva histórico. */
    isActive: text('is_active').notNull().default('true'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('practitioners_org_user_unique').on(t.organizationId, t.userId),
    index('practitioners_org_active_idx').on(t.organizationId, t.isActive),
  ],
);

export type Practitioner = typeof practitioners.$inferSelect;
export type NewPractitioner = typeof practitioners.$inferInsert;
