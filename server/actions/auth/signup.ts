'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { requireEnv } from '@/lib/utils/env';

/**
 * Signup con email + password. Crea cuenta en Supabase Auth.
 *
 * Comportamiento según config GoTrue:
 *   - mailer_autoconfirm: true  → cuenta activa al instante + redirect a /
 *   - mailer_autoconfirm: false → email de confirmación + estado "pending"
 *
 * Self-hosted default: autoconfirm está ON. En producción real (Fase 6+)
 * lo apagaremos para que MoveWell y otros tenants confirmen email.
 *
 * En Fase 1+ restringiremos signup público a invitaciones via admin.
 */
export type SignupState =
  | { status: 'idle' }
  | { status: 'pending_confirmation'; email: string }
  | { status: 'error'; message: string };

const signupSchema = z
  .object({
    email: z.email({ message: 'Ingresa un email válido' }),
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  });

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
    return { status: 'error', message: firstError };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${requireEnv('NEXT_PUBLIC_APP_URL')}/auth/callback`,
    },
  });

  if (error !== null) {
    return {
      status: 'error',
      message: error.message.toLowerCase().includes('already registered')
        ? 'Este email ya tiene cuenta. Inicia sesión.'
        : 'No pudimos crear la cuenta. Intenta más tarde.',
    };
  }

  // Si autoconfirm está ON, session viene en la respuesta → redirect
  if (data.session !== null) {
    redirect('/');
  }

  // autoconfirm OFF → necesita confirmar email
  return { status: 'pending_confirmation', email: parsed.data.email };
}
