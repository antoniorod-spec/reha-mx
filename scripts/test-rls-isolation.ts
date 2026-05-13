/**
 * Test de aislamiento RLS multi-tenant — Paso 8 de Fase 0.
 *
 * Verifica que las policies aplicadas en 0001_rls_policies.sql funcionan:
 *   1. User A de Org A: ve solo Org A (no Org B)
 *   2. User B de Org B: ve solo Org B (no Org A)
 *   3. SELECT a members respeta self + admins de la org
 *
 * Setup como service role (bypassea RLS para preparar fixture).
 * Test como rol `authenticated` con JWT claim sub seteado.
 * Cleanup al final (idempotente).
 *
 * Uso: pnpm exec tsx scripts/test-rls-isolation.ts
 */

import { config as loadEnv } from 'dotenv';
import postgres from 'postgres';

loadEnv({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;
if (DATABASE_URL === undefined || DATABASE_URL.length === 0) {
  throw new Error('DATABASE_URL no está en .env.local');
}

// UUIDs ficticios de prueba — no necesitan estar en auth.users
const USER_A = '11111111-1111-4111-8111-111111111111';
const USER_B = '22222222-2222-4222-8222-222222222222';
const SLUG_A = '__rls_test_org_a';
const SLUG_B = '__rls_test_org_b';

const sql = postgres(DATABASE_URL, {
  ssl: false,
  prepare: false,
  max: 1,
  connect_timeout: 10,
});

interface TestResult {
  name: string;
  pass: boolean;
  detail: string;
}

const results: TestResult[] = [];

function expect(name: string, condition: boolean, detail = ''): void {
  results.push({ name, pass: condition, detail });
  const icon = condition ? '✓' : '✗';
  const color = condition ? '\x1b[32m' : '\x1b[31m';
  console.log(`  ${color}${icon}\x1b[0m ${name}${detail.length > 0 ? ` (${detail})` : ''}`);
}

async function setup(): Promise<{ orgAId: string; orgBId: string }> {
  // Cleanup previo por si quedó de una corrida anterior
  await sql`DELETE FROM organizations WHERE slug IN (${SLUG_A}, ${SLUG_B})`;

  const [orgARow] = await sql<
    { id: string }[]
  >`INSERT INTO organizations (slug, name) VALUES (${SLUG_A}, 'RLS Test Org A') RETURNING id`;
  const [orgBRow] = await sql<
    { id: string }[]
  >`INSERT INTO organizations (slug, name) VALUES (${SLUG_B}, 'RLS Test Org B') RETURNING id`;

  if (orgARow === undefined || orgBRow === undefined) {
    throw new Error('Fixture creation failed');
  }

  const orgAId = orgARow.id;
  const orgBId = orgBRow.id;

  // Members (status=active para que current_user_orgs() los vea)
  await sql`
    INSERT INTO members (organization_id, user_id, role, status, joined_at)
    VALUES
      (${orgAId}, ${USER_A}, 'admin', 'active', now()),
      (${orgBId}, ${USER_B}, 'admin', 'active', now())
  `;

  return { orgAId, orgBId };
}

async function cleanup(): Promise<void> {
  await sql`DELETE FROM organizations WHERE slug IN (${SLUG_A}, ${SLUG_B})`;
}

async function asUser<T>(
  userId: string,
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  // sql.begin tiene tipos complejos (UnwrapPromiseArray) — cast explícito
  // porque sabemos que el callback devuelve Promise<T>.
  return sql.begin(async (tx) => {
    const claims = JSON.stringify({ sub: userId, role: 'authenticated' });
    await tx.unsafe(`SET LOCAL request.jwt.claims = '${claims.replace(/'/g, "''")}'`);
    await tx.unsafe(`SET LOCAL ROLE authenticated`);
    return fn(tx);
  }) as Promise<T>;
}

async function run(): Promise<void> {
  console.log('\n=== Setup ===');
  const { orgAId, orgBId } = await setup();
  console.log(`  Org A: ${orgAId}`);
  console.log(`  Org B: ${orgBId}`);

  try {
    console.log('\n=== Test: User A solo ve Org A ===');
    const orgsSeenByA = await asUser(USER_A, async (tx) => {
      return tx<{ id: string; slug: string }[]>`SELECT id, slug FROM organizations`;
    });
    expect('User A ve exactamente 1 org', orgsSeenByA.length === 1, `got ${orgsSeenByA.length}`);
    expect(
      'User A ve solo su org (slug A)',
      orgsSeenByA[0]?.id === orgAId,
      `slug=${orgsSeenByA[0]?.slug}`,
    );

    console.log('\n=== Test: User B solo ve Org B ===');
    const orgsSeenByB = await asUser(USER_B, async (tx) => {
      return tx<{ id: string; slug: string }[]>`SELECT id, slug FROM organizations`;
    });
    expect('User B ve exactamente 1 org', orgsSeenByB.length === 1, `got ${orgsSeenByB.length}`);
    expect('User B ve solo su org (slug B)', orgsSeenByB[0]?.id === orgBId);

    console.log('\n=== Test: User A NO ve members de Org B ===');
    const membersSeenByA = await asUser(USER_A, async (tx) => {
      return tx<{ user_id: string; organization_id: string }[]>`
        SELECT user_id, organization_id FROM members
      `;
    });
    const seesOrgB = membersSeenByA.some((m) => m.organization_id === orgBId);
    expect('User A NO ve members de Org B (cross-tenant leak)', !seesOrgB);
    expect(
      'User A ve su propia membership',
      membersSeenByA.some((m) => m.user_id === USER_A),
    );

    console.log('\n=== Test: anonymous (sin JWT) NO ve organizations ===');
    const orgsAnon = await sql.begin(async (tx) => {
      await tx.unsafe(`SET LOCAL ROLE anon`);
      return tx<
        { id: string }[]
      >`SELECT id FROM organizations WHERE slug IN (${SLUG_A}, ${SLUG_B})`;
    });
    expect('Anon NO ve nuestras orgs', orgsAnon.length === 0);

    console.log('\n=== Test: User A NO puede INSERT en Org B ===');
    let insertBlocked = false;
    try {
      await asUser(USER_A, async (tx) => {
        await tx`
          INSERT INTO members (organization_id, user_id, role, status, joined_at)
          VALUES (${orgBId}, ${USER_A}, 'admin', 'active', now())
        `;
      });
    } catch {
      insertBlocked = true;
    }
    expect('Insert cross-tenant bloqueado por RLS', insertBlocked);

    console.log('\n=== Test: audit_logs SELECT bloqueado para usuarios ===');
    let auditBlocked = false;
    let auditDetail = '';
    try {
      const auditRead = await asUser(USER_A, async (tx) => {
        return tx<{ count: string }[]>`SELECT count(*)::text AS count FROM audit_logs`;
      });
      // RLS ON sin policy SELECT = deny all → count debe ser 0
      const count = Number(auditRead[0]?.count ?? '0');
      auditBlocked = count === 0;
      auditDetail = `count=${count}`;
    } catch {
      auditBlocked = true;
      auditDetail = 'query threw';
    }
    expect('audit_logs no devuelve rows a usuarios authenticated', auditBlocked, auditDetail);
  } finally {
    console.log('\n=== Cleanup ===');
    await cleanup();
    console.log('  ✓ Fixtures eliminadas');
  }

  const failed = results.filter((r) => !r.pass);
  console.log('\n' + '─'.repeat(60));
  if (failed.length === 0) {
    console.log(`\x1b[32m✓ TODOS LOS TESTS PASARON\x1b[0m (${results.length}/${results.length})`);
  } else {
    console.log(`\x1b[31m✗ FAILED: ${failed.length}/${results.length}\x1b[0m\n`);
    failed.forEach((f) =>
      console.log(`  - ${f.name}${f.detail.length > 0 ? ` (${f.detail})` : ''}`),
    );
    process.exit(1);
  }
}

run()
  .catch(async (e) => {
    console.error('\n\x1b[31mERROR:\x1b[0m', e);
    await cleanup().catch(() => {});
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
