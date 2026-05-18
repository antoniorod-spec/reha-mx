import { NextResponse } from 'next/server';

import { searchPatientsForPicker } from '@/lib/agenda/queries';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';

export const dynamic = 'force-dynamic';

/**
 * Endpoint interno (sin estabilidad pública) para autocomplete de pacientes
 * en el form de crear cita.
 *
 * - Authn: sesión Supabase (cookie).
 * - Authz: solo devuelve pacientes de la org del usuario actual.
 * - No-cache: cada query es contextual al user.
 *
 * Por qué API y no Server Action: necesitamos polling debounced desde el
 * cliente; Server Actions son menos eficientes (POST con FormData) para
 * lookup ligero.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const userOrg = await getCurrentUserOrg();
  if (!userOrg) {
    return NextResponse.json({ patients: [] }, { status: 401 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';

  const patients = await searchPatientsForPicker(userOrg.organization.id, q);
  return NextResponse.json({ patients });
}
