/**
 * Seed inicial — Paso 10 de Fase 0.
 *
 * Idempotente: corre múltiples veces sin duplicar datos. Upsert por slug en
 * organizations, por email en users de Supabase, y por (user_id, organization_id)
 * en members.
 *
 * Crea:
 *   - 2 organizations:
 *       MoveWell SLP (slug: movewell, status: founder)
 *       Demo Clínica (slug: demo, status: trial) — para tests multi-tenant
 *   - tenant_branding para ambas (defaults Rehai + acento custom en demo)
 *   - 3 users por org con sus members:
 *       admin@<slug>.test (admin)
 *       fisio@<slug>.test (practitioner)
 *       recepcion@<slug>.test (reception)
 *   - Promueve hola@antoniotembleque.com a admin de MoveWell.
 *
 * Uso: pnpm db:seed
 */

import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@/lib/db/schema';
import { appointmentTypes, type NewAppointmentType } from '@/lib/db/schema/appointment-types';
import { appointments, type NewAppointment } from '@/lib/db/schema/appointments';
import { branches, type NewBranch } from '@/lib/db/schema/branches';
import { members, type NewMember } from '@/lib/db/schema/members';
import { organizations, type NewOrganization } from '@/lib/db/schema/organizations';
import { patients, type NewPatient } from '@/lib/db/schema/patients';
import { practitioners, type NewPractitioner } from '@/lib/db/schema/practitioners';
import { rooms, type NewRoom } from '@/lib/db/schema/rooms';
import { tenantBranding, type NewTenantBranding } from '@/lib/db/schema/tenant-branding';

loadEnv({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !DATABASE_URL) {
  throw new Error('Faltan envs: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL');
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

const SEED_PASSWORD = 'Rehai2026!';

interface OrgSpec {
  slug: string;
  name: string;
  status: NewOrganization['subscriptionStatus'];
  accent: string;
  whatsappName: string;
}

const ORGS: ReadonlyArray<OrgSpec> = [
  {
    slug: 'movewell',
    name: 'MoveWell SLP',
    status: 'founder',
    accent: '#3FBCD4',
    whatsappName: 'MoveWell SLP',
  },
  {
    slug: 'demo',
    name: 'Demo Clínica Rehai',
    status: 'trial',
    accent: '#E879F9',
    whatsappName: 'Demo Clínica',
  },
];

interface MemberSpec {
  emailLocal: string;
  role: NewMember['role'];
}

const MEMBERS: ReadonlyArray<MemberSpec> = [
  { emailLocal: 'admin', role: 'admin' },
  { emailLocal: 'fisio', role: 'practitioner' },
  { emailLocal: 'recepcion', role: 'reception' },
];

interface AdminUser {
  id: string;
  email: string | null;
}

async function findUserByEmail(email: string): Promise<string | null> {
  // GoTrue admin list paginated. Recorremos hasta encontrar (típicamente <100).
  const lowercase = email.toLowerCase();
  let page = 1;
  while (page <= 20) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=200`, {
      headers: { apikey: SUPABASE_SERVICE_KEY!, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
    });
    const j = (await res.json()) as { users?: AdminUser[] };
    const users = j.users ?? [];
    if (users.length === 0) return null;
    const found = users.find((u) => u.email?.toLowerCase() === lowercase);
    if (found) return found.id;
    if (users.length < 200) return null;
    page += 1;
  }
  return null;
}

async function upsertSupabaseUser(email: string): Promise<string> {
  const existing = await findUserByEmail(email);
  if (existing) return existing;

  const create = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({
      email,
      password: SEED_PASSWORD,
      email_confirm: true,
    }),
  });
  const cj = (await create.json()) as { id?: string; msg?: string };
  if (!cj.id) {
    throw new Error(`No se pudo crear user ${email}: ${JSON.stringify(cj)}`);
  }
  return cj.id;
}

async function upsertOrganization(spec: OrgSpec): Promise<string> {
  const existing = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, spec.slug))
    .limit(1);

  if (existing[0]) {
    await db
      .update(organizations)
      .set({ name: spec.name, subscriptionStatus: spec.status, updatedAt: new Date() })
      .where(eq(organizations.id, existing[0].id));
    return existing[0].id;
  }

  const inserted = await db
    .insert(organizations)
    .values({ slug: spec.slug, name: spec.name, subscriptionStatus: spec.status })
    .returning({ id: organizations.id });

  const row = inserted[0];
  if (!row) throw new Error(`Insert organization ${spec.slug} no devolvió row`);
  return row.id;
}

async function upsertBranding(
  orgId: string,
  spec: Pick<OrgSpec, 'accent' | 'whatsappName' | 'slug'>,
): Promise<void> {
  const row: NewTenantBranding = {
    organizationId: orgId,
    accentColor: spec.accent,
    emailFrom: `citas@${spec.slug}.rehai.app`,
    whatsappBusinessName: spec.whatsappName,
  };

  await db
    .insert(tenantBranding)
    .values(row)
    .onConflictDoUpdate({
      target: tenantBranding.organizationId,
      set: {
        accentColor: spec.accent,
        emailFrom: row.emailFrom,
        whatsappBusinessName: spec.whatsappName,
        updatedAt: new Date(),
      },
    });
}

async function upsertMember(orgId: string, userId: string, role: NewMember['role']): Promise<void> {
  await db
    .insert(members)
    .values({
      organizationId: orgId,
      userId,
      role,
      status: 'active',
      joinedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [members.userId, members.organizationId],
      set: { role, status: 'active', joinedAt: sql`COALESCE(${members.joinedAt}, NOW())` },
    });
}

/**
 * Pacientes sintéticos para demo / desarrollo. NO son datos reales de MoveWell —
 * los CSVs reales (LFPDPPP, datos clínicos) NO se commitean al repo y solo se
 * importan en staging con marco contractual firmado.
 *
 * Mezcla deportes y niveles típicos de la clínica MoveWell SLP:
 *   pádel, fútbol, ciclismo, crossfit, running, natación, golf.
 */
const PATIENT_SEEDS: ReadonlyArray<Omit<NewPatient, 'organizationId'>> = [
  {
    externalId: 'demo-001',
    firstName: 'Ana',
    lastName: 'García López',
    email: 'ana.garcia@demo-patients.test',
    phone: '+524441234567',
    birthDate: '1992-04-12',
    sex: 'female',
    sport: 'Pádel',
    sportLevel: 'amateur',
    functionalGoal: 'Regresar a torneo amateur en 8 semanas (tendinopatía rotuliana derecha).',
    estimatedReturnDate: '2026-07-12',
    status: 'active',
  },
  {
    externalId: 'demo-002',
    firstName: 'Carlos',
    lastName: 'Hernández Mejía',
    email: 'carlos.hernandez@demo-patients.test',
    phone: '+524451112233',
    birthDate: '1988-09-03',
    sex: 'male',
    sport: 'Fútbol',
    sportLevel: 'semipro',
    functionalGoal: 'Reintegración a entrenamientos plenos post LCA (operación 2026-02-14).',
    estimatedReturnDate: '2026-10-01',
    status: 'active',
  },
  {
    externalId: 'demo-003',
    firstName: 'María',
    lastName: 'Rodríguez Vázquez',
    email: 'maria.rodriguez@demo-patients.test',
    phone: '+524441555888',
    birthDate: '1979-11-22',
    sex: 'female',
    sport: 'Ciclismo de ruta',
    sportLevel: 'amateur',
    functionalGoal: 'Mejorar control de tronco y resistencia para Granfondo de octubre.',
    estimatedReturnDate: null,
    status: 'active',
  },
  {
    externalId: 'demo-004',
    firstName: 'Roberto',
    lastName: 'Martínez Aguilar',
    email: null,
    phone: '+524447776655',
    birthDate: '1995-02-18',
    sex: 'male',
    sport: 'Crossfit',
    sportLevel: 'recreational',
    functionalGoal: 'Recuperar movilidad de hombro derecho (impingement subacromial).',
    estimatedReturnDate: '2026-06-15',
    status: 'active',
  },
  {
    externalId: 'demo-005',
    firstName: 'Lucía',
    lastName: 'Fernández Soto',
    email: 'lucia.fernandez@demo-patients.test',
    phone: '+524449998877',
    birthDate: '2001-07-30',
    sex: 'female',
    sport: 'Natación',
    sportLevel: 'professional',
    functionalGoal: 'Mantenimiento competitivo + prevención lesión hombro pre-mundial 2027.',
    estimatedReturnDate: null,
    status: 'active',
  },
  {
    externalId: 'demo-006',
    firstName: 'Daniel',
    lastName: 'Torres Pacheco',
    email: 'daniel.torres@demo-patients.test',
    phone: '+524443322110',
    birthDate: '1985-01-09',
    sex: 'male',
    sport: 'Golf',
    sportLevel: 'amateur',
    functionalGoal: 'Resolución de lumbalgia recurrente con plan funcional.',
    estimatedReturnDate: '2026-05-25',
    status: 'discharged',
  },
  {
    externalId: 'demo-007',
    firstName: 'Sofía',
    lastName: 'Méndez Aranda',
    email: 'sofia.mendez@demo-patients.test',
    phone: '+524448887766',
    birthDate: '1998-12-05',
    sex: 'female',
    sport: 'Running',
    sportLevel: 'amateur',
    functionalGoal: 'Volver a maratón con plan progresivo (fascitis plantar bilateral).',
    estimatedReturnDate: '2026-08-30',
    status: 'active',
  },
  {
    externalId: 'demo-008',
    firstName: 'Eduardo',
    lastName: 'Salinas Robles',
    email: null,
    phone: '+524441122334',
    birthDate: '1970-03-17',
    sex: 'male',
    sport: 'Pádel',
    sportLevel: 'recreational',
    functionalGoal: 'Rehabilitación post artroscopia menisco derecho.',
    estimatedReturnDate: '2026-09-10',
    status: 'inactive',
  },
];

async function upsertPatients(orgId: string): Promise<number> {
  // Idempotencia manual: el unique index (organization_id, external_id) es parcial
  // (solo WHERE external_id IS NOT NULL), así que Postgres no acepta ON CONFLICT
  // por ese par sin matching WHERE. Hacemos check explícito.
  let inserted = 0;
  for (const p of PATIENT_SEEDS) {
    if (!p.externalId) continue;
    const existing = await db
      .select({ id: patients.id })
      .from(patients)
      .where(
        sql`${patients.organizationId} = ${orgId} AND ${patients.externalId} = ${p.externalId}`,
      )
      .limit(1);
    if (existing[0]) continue;
    await db.insert(patients).values({ ...p, organizationId: orgId });
    inserted += 1;
  }
  return inserted;
}

// ───────────────────────────────────────────────────────────────────────────
// Branches (sucursales)
// ───────────────────────────────────────────────────────────────────────────

interface BranchSpec extends Omit<NewBranch, 'organizationId' | 'id'> {
  rooms: ReadonlyArray<Pick<NewRoom, 'name' | 'type' | 'capacity'>>;
}

const BRANCHES_BY_ORG: Record<string, ReadonlyArray<BranchSpec>> = {
  movewell: [
    {
      slug: 'centro',
      name: 'MoveWell Centro',
      color: '#3FBCD4',
      addressLine: 'Centro Histórico',
      city: 'San Luis Potosí',
      state: 'San Luis Potosí',
      postalCode: '78000',
      timezone: 'America/Mexico_City',
      defaultOpenAt: '07:00',
      defaultCloseAt: '21:00',
      status: 'active',
      rooms: [
        { name: 'Camilla 1', type: 'couch', capacity: 1 },
        { name: 'Camilla 2', type: 'couch', capacity: 1 },
        { name: 'Camilla 3', type: 'couch', capacity: 1 },
        { name: 'Área funcional', type: 'functional', capacity: 6 },
        { name: 'Evaluación', type: 'assessment', capacity: 1 },
      ],
    },
    {
      slug: 'lomas-padel',
      name: 'MoveWell Lomas Pádel',
      color: '#F472B6',
      addressLine: 'Club de Pádel Lomas',
      city: 'San Luis Potosí',
      state: 'San Luis Potosí',
      postalCode: '78214',
      timezone: 'America/Mexico_City',
      defaultOpenAt: '08:00',
      defaultCloseAt: '20:00',
      status: 'active',
      rooms: [
        { name: 'Camilla A', type: 'couch', capacity: 1 },
        { name: 'Camilla B', type: 'couch', capacity: 1 },
        { name: 'Área funcional', type: 'functional', capacity: 4 },
      ],
    },
  ],
  demo: [
    {
      slug: 'demo-hq',
      name: 'Demo HQ',
      color: '#E879F9',
      addressLine: 'Av. de los Insurgentes 1234',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '03100',
      timezone: 'America/Mexico_City',
      defaultOpenAt: '08:00',
      defaultCloseAt: '20:00',
      status: 'active',
      rooms: [
        { name: 'Camilla 1', type: 'couch', capacity: 1 },
        { name: 'Camilla 2', type: 'couch', capacity: 1 },
        { name: 'Funcional', type: 'functional', capacity: 3 },
      ],
    },
  ],
};

async function upsertBranchesAndRooms(
  orgSlug: string,
  orgId: string,
): Promise<{ branches: number; rooms: number }> {
  const specs = BRANCHES_BY_ORG[orgSlug] ?? [];
  let branchCount = 0;
  let roomCount = 0;

  for (const spec of specs) {
    const { rooms: roomSpecs, ...branchData } = spec;

    const existing = await db
      .select({ id: branches.id })
      .from(branches)
      .where(sql`${branches.organizationId} = ${orgId} AND ${branches.slug} = ${spec.slug}`)
      .limit(1);

    let branchId: string;
    if (existing[0]) {
      await db
        .update(branches)
        .set({ ...branchData, updatedAt: new Date() })
        .where(sql`${branches.id} = ${existing[0].id}`);
      branchId = existing[0].id;
    } else {
      const inserted = await db
        .insert(branches)
        .values({ ...branchData, organizationId: orgId })
        .returning({ id: branches.id });
      branchId = inserted[0]!.id;
      branchCount += 1;
    }

    for (const roomSpec of roomSpecs) {
      const existingRoom = await db
        .select({ id: rooms.id })
        .from(rooms)
        .where(sql`${rooms.branchId} = ${branchId} AND ${rooms.name} = ${roomSpec.name}`)
        .limit(1);

      if (existingRoom[0]) continue;
      await db.insert(rooms).values({ ...roomSpec, organizationId: orgId, branchId });
      roomCount += 1;
    }
  }

  return { branches: branchCount, rooms: roomCount };
}

// ───────────────────────────────────────────────────────────────────────────
// Tipos de cita estándar
// ───────────────────────────────────────────────────────────────────────────

const APPOINTMENT_TYPE_SEEDS: ReadonlyArray<Omit<NewAppointmentType, 'organizationId'>> = [
  {
    slug: 'valoracion',
    name: 'Valoración inicial',
    durationMinutes: 60,
    color: '#3FBCD4',
    bookableByPatient: 'true',
    priceCents: 80000,
  },
  {
    slug: 'sesion-rehab',
    name: 'Sesión de rehabilitación',
    durationMinutes: 45,
    color: '#22D3EE',
    bookableByPatient: 'false',
    priceCents: 60000,
  },
  {
    slug: 'reevaluacion',
    name: 'Reevaluación',
    durationMinutes: 30,
    color: '#A78BFA',
    bookableByPatient: 'false',
    priceCents: 40000,
  },
  {
    slug: 'readaptacion-funcional',
    name: 'Readaptación funcional',
    durationMinutes: 60,
    color: '#34D399',
    bookableByPatient: 'false',
    priceCents: 65000,
  },
  {
    slug: 'alta',
    name: 'Alta clínica',
    durationMinutes: 30,
    color: '#FBBF24',
    bookableByPatient: 'false',
    priceCents: 0,
  },
];

async function upsertAppointmentTypes(orgId: string): Promise<number> {
  let inserted = 0;
  for (const t of APPOINTMENT_TYPE_SEEDS) {
    const existing = await db
      .select({ id: appointmentTypes.id })
      .from(appointmentTypes)
      .where(
        sql`${appointmentTypes.organizationId} = ${orgId} AND ${appointmentTypes.slug} = ${t.slug}`,
      )
      .limit(1);

    if (existing[0]) continue;
    await db.insert(appointmentTypes).values({ ...t, organizationId: orgId });
    inserted += 1;
  }
  return inserted;
}

// ───────────────────────────────────────────────────────────────────────────
// Practitioners (perfiles profesionales de fisios)
// ───────────────────────────────────────────────────────────────────────────

interface PractitionerSpec {
  emailLocal: string; // matching MemberSpec.emailLocal
  displayName: string;
  title: string;
  specialty: NewPractitioner['specialty'];
  color: string;
}

const PRACTITIONER_SPECS: ReadonlyArray<PractitionerSpec> = [
  {
    emailLocal: 'fisio',
    displayName: 'Mtra. Paulina Granados',
    title: 'Mtra. en Readaptación Deportiva',
    specialty: 'readaptacion_funcional',
    color: '#22D3EE',
  },
];

async function upsertPractitionersForOrg(orgSlug: string, orgId: string): Promise<number> {
  // Buscar primer branch para asignar como primary
  const branchRows = await db
    .select({ id: branches.id })
    .from(branches)
    .where(sql`${branches.organizationId} = ${orgId}`)
    .orderBy(branches.slug)
    .limit(1);
  const primaryBranchId = branchRows[0]?.id;

  let inserted = 0;
  for (const spec of PRACTITIONER_SPECS) {
    const email = `${spec.emailLocal}@${orgSlug}.test`;
    const userId = await findUserByEmail(email);
    if (!userId) continue;

    const existing = await db
      .select({ id: practitioners.id })
      .from(practitioners)
      .where(
        sql`${practitioners.organizationId} = ${orgId} AND ${practitioners.userId} = ${userId}`,
      )
      .limit(1);

    if (existing[0]) {
      // Actualizar display + primary branch para mantener consistencia
      await db
        .update(practitioners)
        .set({
          displayName: spec.displayName,
          title: spec.title,
          specialty: spec.specialty,
          color: spec.color,
          primaryBranchId: primaryBranchId ?? null,
          updatedAt: new Date(),
        })
        .where(sql`${practitioners.id} = ${existing[0].id}`);
      continue;
    }

    await db.insert(practitioners).values({
      organizationId: orgId,
      userId,
      displayName: spec.displayName,
      title: spec.title,
      specialty: spec.specialty,
      color: spec.color,
      primaryBranchId: primaryBranchId ?? null,
    });
    inserted += 1;
  }

  return inserted;
}

// ───────────────────────────────────────────────────────────────────────────
// Citas demo
// Solo para MoveWell — toma 3 pacientes activos + 1 fisio + 1 branch/room y
// crea citas en distintos estados / fechas relativas a hoy.
// ───────────────────────────────────────────────────────────────────────────

async function upsertDemoAppointments(orgId: string): Promise<number> {
  // Buscar contexto
  const branchRow = await db
    .select({ id: branches.id })
    .from(branches)
    .where(sql`${branches.organizationId} = ${orgId} AND ${branches.slug} = 'centro'`)
    .limit(1);
  const branchId = branchRow[0]?.id;
  if (!branchId) return 0;

  const roomRow = await db
    .select({ id: rooms.id })
    .from(rooms)
    .where(sql`${rooms.branchId} = ${branchId} AND ${rooms.name} = 'Camilla 1'`)
    .limit(1);
  const roomId = roomRow[0]?.id;

  const practitionerRow = await db
    .select({ id: practitioners.id })
    .from(practitioners)
    .where(sql`${practitioners.organizationId} = ${orgId}`)
    .limit(1);
  const practitionerId = practitionerRow[0]?.id;
  if (!practitionerId) return 0;

  const typeRows = await db
    .select({ id: appointmentTypes.id, slug: appointmentTypes.slug })
    .from(appointmentTypes)
    .where(sql`${appointmentTypes.organizationId} = ${orgId}`);

  const typeBySlug: Record<string, string> = {};
  for (const t of typeRows) typeBySlug[t.slug] = t.id;
  const sesionId = typeBySlug['sesion-rehab'];
  const valoracionId = typeBySlug['valoracion'];
  if (!sesionId || !valoracionId) return 0;

  const patientRows = await db
    .select({ id: patients.id, externalId: patients.externalId })
    .from(patients)
    .where(sql`${patients.organizationId} = ${orgId}`)
    .orderBy(patients.externalId);

  const patientByExternal: Record<string, string> = {};
  for (const p of patientRows) {
    if (p.externalId) patientByExternal[p.externalId] = p.id;
  }

  const ana = patientByExternal['demo-001'];
  const carlos = patientByExternal['demo-002'];
  const lucia = patientByExternal['demo-005'];
  if (!ana || !carlos || !lucia) return 0;

  // Construir fechas relativas: hoy 09:00, mañana 11:00, ayer 17:00 (completada)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const at = (daysOffset: number, hour: number, minutes: number): Date => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(hour, minutes, 0, 0);
    return d;
  };

  const seeds: ReadonlyArray<NewAppointment> = [
    {
      organizationId: orgId,
      branchId,
      practitionerId,
      patientId: ana,
      typeId: sesionId,
      roomId: roomId ?? null,
      startAt: at(0, 9, 0),
      endAt: at(0, 9, 45),
      status: 'confirmed',
      notes: 'Continuar trabajo de propiocepción rodilla derecha.',
      source: 'manual',
    },
    {
      organizationId: orgId,
      branchId,
      practitionerId,
      patientId: carlos,
      typeId: sesionId,
      roomId: roomId ?? null,
      startAt: at(0, 11, 0),
      endAt: at(0, 11, 45),
      status: 'scheduled',
      notes: 'Avance progresivo, evaluar carga concéntrica.',
      source: 'manual',
    },
    {
      organizationId: orgId,
      branchId,
      practitionerId,
      patientId: lucia,
      typeId: valoracionId,
      roomId: roomId ?? null,
      startAt: at(1, 16, 0),
      endAt: at(1, 17, 0),
      status: 'scheduled',
      notes: 'Valoración de seguimiento pre-temporada.',
      source: 'manual',
    },
    {
      organizationId: orgId,
      branchId,
      practitionerId,
      patientId: ana,
      typeId: sesionId,
      roomId: roomId ?? null,
      startAt: at(-1, 17, 0),
      endAt: at(-1, 17, 45),
      status: 'completed',
      notes: 'Sesión completada. EVA pre=4, post=2.',
      source: 'manual',
    },
  ];

  // Idempotencia: si ya hay >=4 citas en la org, asumir que el seed corrió antes.
  const existingCount = await db
    .select({ value: sql<number>`COUNT(*)::int` })
    .from(appointments)
    .where(sql`${appointments.organizationId} = ${orgId}`);
  if ((existingCount[0]?.value ?? 0) >= seeds.length) return 0;

  let inserted = 0;
  for (const seed of seeds) {
    await db.insert(appointments).values(seed);
    inserted += 1;
  }
  return inserted;
}

async function main(): Promise<void> {
  console.info('seed: arrancando…');

  for (const org of ORGS) {
    console.info(`\norg: ${org.name} (${org.slug})`);
    const orgId = await upsertOrganization(org);
    await upsertBranding(orgId, org);

    for (const member of MEMBERS) {
      const email = `${member.emailLocal}@${org.slug}.test`;
      const userId = await upsertSupabaseUser(email);
      await upsertMember(orgId, userId, member.role);
      console.info(`  ✓ ${email} (${member.role})`);
    }

    const patientsInserted = await upsertPatients(orgId);
    console.info(`  ✓ ${patientsInserted} pacientes demo (idempotente)`);

    const { branches: branchesInserted, rooms: roomsInserted } = await upsertBranchesAndRooms(
      org.slug,
      orgId,
    );
    console.info(`  ✓ ${branchesInserted} branches / ${roomsInserted} rooms nuevos`);

    const typesInserted = await upsertAppointmentTypes(orgId);
    console.info(`  ✓ ${typesInserted} appointment types nuevos`);

    const practitionersInserted = await upsertPractitionersForOrg(org.slug, orgId);
    console.info(`  ✓ ${practitionersInserted} practitioners nuevos`);

    if (org.slug === 'movewell') {
      const appointmentsInserted = await upsertDemoAppointments(orgId);
      console.info(`  ✓ ${appointmentsInserted} citas demo`);
    }
  }

  // Promover hola@antoniotembleque.com a admin de MoveWell.
  const movewell = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, 'movewell'))
    .limit(1);

  if (movewell[0]) {
    const ownerEmail = 'hola@antoniotembleque.com';
    try {
      const ownerId = await upsertSupabaseUser(ownerEmail);
      await upsertMember(movewell[0].id, ownerId, 'admin');
      console.info(`\n✓ ${ownerEmail} promovido a admin de MoveWell`);
    } catch (err) {
      console.warn(`\n⚠ No pude promover ${ownerEmail}: ${(err as Error).message}`);
    }
  }

  console.info('\nseed: listo.');
  console.info(`\nCuentas de prueba (todas password: ${SEED_PASSWORD}):`);
  for (const org of ORGS) {
    for (const member of MEMBERS) {
      console.info(`  ${member.role.padEnd(13)} ${member.emailLocal}@${org.slug}.test`);
    }
  }

  await client.end();
}

main().catch((err: unknown) => {
  console.error('seed FAILED:', err);
  process.exit(1);
});
