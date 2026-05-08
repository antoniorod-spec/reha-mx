import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { requireEnv } from '@/lib/utils/env';

/**
 * Cliente Supabase con SERVICE ROLE — bypasea RLS.
 *
 * REGLA CLAUDE.md #11: usar SOLO desde:
 *   - server/actions/admin/**
 *   - app/(admin)/**
 *
 * ESLint bloquea importar este módulo desde otros lugares (no-restricted-imports
 * en eslint.config.mjs). Si necesitas service role en otro contexto, está mal —
 * usa lib/supabase/server.ts (con RLS) o pídele al super-admin que ejecute la op.
 *
 * El cliente NO persiste sesión — cada call usa la JWT del service role
 * directamente. No tiene contexto de usuario.
 */
export function createServiceClient() {
  return createSupabaseClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
