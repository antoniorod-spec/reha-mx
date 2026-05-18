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
import { members, type NewMember } from '@/lib/db/schema/members';
import { organizations, type NewOrganization } from '@/lib/db/schema/organizations';
import { patients, type NewPatient } from '@/lib/db/schema/patients';
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

    const inserted = await upsertPatients(orgId);
    console.info(`  ✓ ${inserted} pacientes demo (idempotente)`);
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
