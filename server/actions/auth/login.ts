'use server';

import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { requireEnv } from '@/lib/utils/env';

/**
 * Estado del flow de login con magic link.
 * Diseñado para useActionState (React 19) en LoginForm.
 */
export type LoginState =
  | { status: 'idle' }
  | { status: 'sent'; email: string }
  | { status: 'error'; message: string };

const loginSchema = z.object({
  email: z.email({ message: 'Ingresa un email válido' }),
});

/**
 * Server Action: pide a Supabase Auth que envíe un magic link al email.
 *
 * Flow:
 *   1. Usuario ingresa email → submit form
 *   2. Esta action llama a supabase.auth.signInWithOtp
 *   3. Supabase envía email con link a /auth/callback?code=xxx
 *   4. Usuario hace click → callback (Sub-paso 6c) intercambia code por sesión
 *
 * No revela si el email existe (Supabase Auth lo maneja silenciosamente
 * para evitar enumeration attacks).
 */
export async function requestMagicLinkAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
    return { status: 'error', message: firstError };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${requireEnv('NEXT_PUBLIC_APP_URL')}/auth/callback`,
    },
  });

  if (error) {
    return {
      status: 'error',
      message: 'No pudimos enviar el correo. Intenta en unos minutos.',
    };
  }

  return { status: 'sent', email: parsed.data.email };
}
