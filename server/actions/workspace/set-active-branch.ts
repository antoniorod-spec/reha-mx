'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { ACTIVE_BRANCH_ALL, ACTIVE_BRANCH_COOKIE } from '@/lib/agenda/active-branch';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';
import { db } from '@/lib/db/client';
import { branches } from '@/lib/db/schema/branches';

/**
 * Server Action: persistir branch activo en cookie.
 *
 * Reglas:
 *   - `slug === null` (o ausente) → vista consolidada; cookie se borra.
 *   - `slug !== null` → debe ser un slug de un branch de la org del usuario.
 *     Si no existe, devuelve { ok: false }.
 *   - revalidate /dashboard y /agenda para que la nueva selección filtre los
 *     queries en SSR.
 *
 * Cookie:
 *   - 1 año de expiración (es preferencia, no auth).
 *   - sameSite=lax (basta para nav within app).
 *   - httpOnly=false porque NO contiene info sensible (solo slug público).
 *     Esto permite que el client component lea la cookie si necesita el
 *     value antes del próximo SSR (no la usamos hoy, pero futureproofing).
 */

const inputSchema = z.object({
  slug: z.string().min(1).max(64).nullable(),
});

export interface SetActiveBranchResult {
  ok: boolean;
  error?: string | undefined;
}

export async function setActiveBranchAction(
  input: z.infer<typeof inputSchema>,
): Promise<SetActiveBranchResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Slug inválido.' };

  const userOrg = await getCurrentUserOrg();
  if (!userOrg) return { ok: false, error: 'Sesión expirada.' };

  const store = await cookies();

  if (parsed.data.slug === null || parsed.data.slug === ACTIVE_BRANCH_ALL) {
    store.delete(ACTIVE_BRANCH_COOKIE);
  } else {
    const rows = await db
      .select({ id: branches.id })
      .from(branches)
      .where(
        and(
          eq(branches.organizationId, userOrg.organization.id),
          eq(branches.slug, parsed.data.slug),
        ),
      )
      .limit(1);

    if (rows.length === 0) {
      return { ok: false, error: 'Sucursal no encontrada en tu organización.' };
    }

    store.set({
      name: ACTIVE_BRANCH_COOKIE,
      value: parsed.data.slug,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false,
      path: '/',
    });
  }

  revalidatePath('/dashboard');
  revalidatePath('/agenda');

  return { ok: true };
}
