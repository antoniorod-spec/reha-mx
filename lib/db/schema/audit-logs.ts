import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Audit log append-only. Registra cualquier acción sobre datos clínicos
 * (ver expediente, modificar appointment, exportar reporte, etc.).
 *
 * Diseño:
 * - SIN FK a organizations.id → permite borrar org sin tocar audit history.
 * - SIN policy de DELETE/UPDATE en RLS → append-only por compliance NOM-004-SSA3.
 * - SELECT solo via función SECURITY DEFINER (Paso 9), nunca query directo.
 *
 * Cómo escribir: helper auditLog() en lib/audit/index.ts (Paso 9).
 * Trigger Postgres genérico se aplica a tablas clinical_* (Paso 9).
 */
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Sin FK — append-only no debe romperse si se elimina una org (no debería ocurrir) */
  organizationId: uuid('organization_id').notNull(),
  /** auth.users.id del usuario que ejecutó la acción; null si es system/cron */
  userId: uuid('user_id'),
  /** Verbo en formato 'recurso.accion' — ej: 'patient.viewed', 'appointment.created' */
  action: text('action').notNull(),
  /** Tipo del recurso afectado: 'patient', 'appointment', 'clinical_record', etc. */
  resourceType: text('resource_type'),
  /** UUID del recurso afectado (si aplica) */
  resourceId: uuid('resource_id'),
  /** Metadata adicional: campos cambiados, IPs, etc. */
  metadata: jsonb('metadata'),
  /** IP del cliente (extraído de headers en server action) */
  ipAddress: text('ip_address'),
  /** User-Agent del cliente */
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
