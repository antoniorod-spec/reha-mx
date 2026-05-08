import { pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

/**
 * Roles dentro de una organización (clínica).
 * - admin:        dueño/director — todo (clínica, billing, settings)
 * - director:     director clínico — gestión clínica + reports, NO billing
 * - practitioner: fisio — su agenda, sus pacientes asignados
 * - reception:    recepción — agenda completa, cobros, NO acceso clínico
 * - patient:      paciente — solo sus propios datos via portal
 */
export const memberRoleEnum = pgEnum('member_role', [
  'admin',
  'director',
  'practitioner',
  'reception',
  'patient',
]);

export const memberStatusEnum = pgEnum('member_status', ['active', 'invited', 'suspended', 'left']);

/**
 * Membership de un usuario en una organización.
 * Un mismo userId puede tener varias rows en distintas organizations.
 * Único: (userId, organizationId) — un user no puede tener 2 rows en la misma org.
 *
 * userId apunta a auth.users de Supabase Auth (schema separado, sin FK formal).
 */
export const members = pgTable(
  'members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    /** FK lógica a auth.users.id (Supabase Auth schema) */
    userId: uuid('user_id').notNull(),
    role: memberRoleEnum('role').notNull(),
    status: memberStatusEnum('status').notNull().default('invited'),
    invitedAt: timestamp('invited_at', { withTimezone: true }).notNull().defaultNow(),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('members_user_organization_unique').on(t.userId, t.organizationId)],
);

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
