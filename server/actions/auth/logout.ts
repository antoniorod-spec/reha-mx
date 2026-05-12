'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

/**
 * Server Action: cierra la sesión del usuario.
 *
 * `signOut()` borra las cookies de sesión (refresh + access tokens) en el lado
 * server, invalida la sesión en Supabase Auth y emite un evento para que el
 * cliente actualice su estado. El `redirect()` posterior fuerza la navegación
 * a /login, donde el middleware verá la ausencia de cookies y servirá la página.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
