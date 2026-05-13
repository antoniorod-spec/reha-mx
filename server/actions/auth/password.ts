'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

/**
 * Login con email + password. Recomendado para staff (admin/director/
 * practitioner/reception) que entran a diario. Para pacientes (uso esporádico)
 * usar el magic link en `login.ts`.
 *
 * Flow:
 *   1. signInWithPassword → setea cookies de sesión
 *   2. Verifica si el user tiene factor TOTP verificado
 *   3. Si tiene TOTP y la sesión aún es aal1 → mfa_required (UI redirige a verify)
 *   4. Si OK → redirect a / (server-side, useActionState NO ve la respuesta)
 */
export type PasswordLoginState =
  | { status: 'idle' }
  | { status: 'mfa_required'; factorId: string }
  | { status: 'error'; message: string };

const passwordLoginSchema = z.object({
  email: z.email({ message: 'Ingresa un email válido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
});

export async function loginWithPasswordAction(
  _prev: PasswordLoginState,
  formData: FormData,
): Promise<PasswordLoginState> {
  const parsed = passwordLoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
    return { status: 'error', message: firstError };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error !== null || data.user === null) {
    // Anti-enumeration: no revelamos si email existe
    return { status: 'error', message: 'Email o contraseña incorrectos.' };
  }

  // ¿Tiene 2FA activado? Si sí, requerir verify.
  const { data: mfaData } = await supabase.auth.mfa.listFactors();
  const verifiedTotp = mfaData?.totp.find((f) => f.status === 'verified');

  if (verifiedTotp !== undefined) {
    // AAL actual viene en la sesión
    const aal = data.session?.user.aud;
    if (aal !== 'aal2') {
      return { status: 'mfa_required', factorId: verifiedTotp.id };
    }
  }

  // Auth completa — redirect (server lanza NEXT_REDIRECT, browser navega)
  redirect('/');
}
