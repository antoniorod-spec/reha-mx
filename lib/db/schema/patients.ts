import { sql } from 'drizzle-orm';
import {
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { organizations } from './organizations';

/** Sexo biológico — relevante para ciertas escalas clínicas y normativas. */
export const patientSexEnum = pgEnum('patient_sex', ['female', 'male', 'intersex', 'unspecified']);

/**
 * Nivel deportivo del paciente — afecta protocolos de readaptación,
 * tiempos de retorno esperados y benchmarks comparativos.
 */
export const sportLevelEnum = pgEnum('sport_level', [
  'recreational', // recreativo: pádel/correr fin de semana
  'amateur', // amateur federado: liga local
  'semipro', // semiprofesional: 2da/3ra división
  'professional', // profesional: contrato remunerado
  'elite', // élite: selección nacional / mundial
]);

/**
 * Estado del expediente — controla aparición en bandejas (activos vs alta vs baja).
 * No confundir con status de la cita (eso está en appointments en Fase 1.2).
 */
export const patientStatusEnum = pgEnum('patient_status', [
  'active', // expediente abierto
  'discharged', // alta clínica
  'inactive', // pausa o pérdida de seguimiento
  'archived', // baja del sistema (no se borra, se archiva)
]);

/**
 * Tabla `patients` — pacientes de una clínica.
 *
 * - Aislado por `organization_id` + RLS (Fase 0 Paso 8 patrón).
 * - Audit log automático vía trigger record_audit_event (migration custom).
 * - `external_id`: opcional, sirve para migrar pacientes desde sistemas previos
 *   (los CSVs de MoveWell tienen IDs internos que se preservan acá).
 * - `email` y `phone` se guardan en limpio (necesarios para WhatsApp/email);
 *   nunca aparecen en URLs ni logs. PII protegida por RLS.
 * - `curp` y `rfc` opcionales — México. Cuando llegue facturación CFDI (Fase 3)
 *   el RFC pasa a ser requerido para emitir factura.
 *
 * Lo que NO va acá (vienen en siguientes módulos):
 * - emergency_contact → tabla `patient_emergency_contacts` (Fase 1.2)
 * - lesiones, diagnósticos, evaluaciones → tablas clinical_* (Fase 2)
 * - documentos firmados (consentimientos) → `consents` (Fase 2)
 */
export const patients = pgTable(
  'patients',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),

    /** ID en sistema externo previo (Excel, Google Sheets, etc.) — opcional. */
    externalId: text('external_id'),

    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),

    /** Email del paciente (lowercase, validado en server action con Zod). */
    email: text('email'),
    /** Teléfono en formato E.164 (+52..., sin espacios). */
    phone: text('phone'),

    birthDate: date('birth_date'),
    sex: patientSexEnum('sex'),

    /** Documentos de identidad — México. */
    curp: text('curp'),
    rfc: text('rfc'),

    /** Deporte principal (en lenguaje libre, sin lookup table todavía). */
    sport: text('sport'),
    sportLevel: sportLevelEnum('sport_level'),
    /** Objetivo funcional libre (ej: "Regresar a competir a nivel federado en 4 meses"). */
    functionalGoal: text('functional_goal'),
    /** Fecha estimada de retorno deportivo (referencia, no obligatoria). */
    estimatedReturnDate: date('estimated_return_date'),

    /** Notas internas del fisio/recepción — NO clínicas (eso va en SOAP). */
    notes: text('notes'),

    status: patientStatusEnum('status').notNull().default('active'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Búsqueda por nombre/apellido (queries de lista)
    index('patients_org_last_name_idx').on(t.organizationId, t.lastName),
    // Filtro por estado en bandeja
    index('patients_org_status_idx').on(t.organizationId, t.status),
    // Search por email único dentro de la org
    uniqueIndex('patients_org_email_unique')
      .on(t.organizationId, t.email)
      .where(sql`${t.email} IS NOT NULL`),
    // Search por external_id único dentro de la org (idempotencia en migraciones)
    uniqueIndex('patients_org_external_id_unique')
      .on(t.organizationId, t.externalId)
      .where(sql`${t.externalId} IS NOT NULL`),
  ],
);

export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
