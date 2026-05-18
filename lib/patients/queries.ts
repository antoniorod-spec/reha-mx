import 'server-only';

import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { patients, type Patient } from '@/lib/db/schema/patients';

/**
 * Queries de pacientes — Fase 1.1.
 *
 * Convención: TODAS las queries reciben `organizationId` como primer parámetro
 * y filtran por él. RLS aplica de todos modos a nivel DB, pero el filtro
 * explícito hace el plan de query más eficiente con el índice
 * (organization_id, last_name).
 *
 * Resultados se serializan a tipos planos antes de mandarse a Server
 * Components — Drizzle ya devuelve POJOs (sin instancias de Date no
 * serializables en algunos contextos, pero acá los timestamps vienen como
 * Date que Next puede serializar al pasar a Client Components).
 */

export type PatientStatusFilter = Patient['status'] | 'all';

export interface ListPatientsParams {
  organizationId: string;
  search?: string | undefined;
  status?: PatientStatusFilter | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export interface ListPatientsResult {
  rows: Patient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export async function listPatients(params: ListPatientsParams): Promise<ListPatientsResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));

  const conditions: SQL[] = [eq(patients.organizationId, params.organizationId)];

  if (params.status && params.status !== 'all') {
    conditions.push(eq(patients.status, params.status));
  }

  const search = params.search?.trim();
  if (search && search.length > 0) {
    const term = `%${search}%`;
    const searchClause = or(
      ilike(patients.firstName, term),
      ilike(patients.lastName, term),
      ilike(patients.email, term),
      ilike(patients.phone, term),
      ilike(patients.sport, term),
    );
    if (searchClause) conditions.push(searchClause);
  }

  const where = and(...conditions);

  const offset = (page - 1) * pageSize;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(patients)
      .where(where)
      .orderBy(asc(patients.lastName), asc(patients.firstName), desc(patients.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ value: count() }).from(patients).where(where),
  ]);

  const total = totalResult[0]?.value ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return { rows, total, page, pageSize, totalPages };
}

export async function getPatientById(
  organizationId: string,
  patientId: string,
): Promise<Patient | null> {
  const rows = await db
    .select()
    .from(patients)
    .where(and(eq(patients.organizationId, organizationId), eq(patients.id, patientId)))
    .limit(1);

  return rows[0] ?? null;
}

export interface PatientStatusCounts {
  active: number;
  discharged: number;
  inactive: number;
  archived: number;
}

export async function getPatientStatusCounts(organizationId: string): Promise<PatientStatusCounts> {
  const rows = await db
    .select({
      status: patients.status,
      count: count(),
    })
    .from(patients)
    .where(eq(patients.organizationId, organizationId))
    .groupBy(patients.status);

  const result: PatientStatusCounts = { active: 0, discharged: 0, inactive: 0, archived: 0 };
  for (const row of rows) {
    result[row.status] = row.count;
  }
  return result;
}

/**
 * Calcula edad a partir de birth_date — se usa en lista y ficha.
 * Devuelve null si no hay birth_date. Edad se calcula en JS (no en SQL)
 * para evitar discrepancias entre el timezone del cliente y de la DB.
 */
export function calculateAge(birthDate: string | Date | null): number | null {
  if (!birthDate) return null;
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Sql tag exportado para queries derivadas en el feature (poco usado, pero útil). */
export { sql };
