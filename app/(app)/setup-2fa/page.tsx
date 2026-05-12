import { redirect } from 'next/navigation';

import { Card } from '@/components/shared/card';
import { createClient } from '@/lib/supabase/server';

import { Setup2FAForm } from './setup-2fa-form';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurar 2FA',
  robots: { index: false, follow: false },
};

/**
 * Página de enrolment 2FA TOTP.
 *
 * Server Component:
 *  1. Verifica que hay sesión Supabase. Si no → redirect a /login con `next`.
 *  2. Llama `mfa.enroll({ factorType: 'totp' })` que devuelve QR + secret.
 *  3. Pasa los datos al client form como props inmutables.
 *
 * Esto evita el patrón `setState dentro de useEffect` (anti-pattern React 19)
 * y elimina el flash de "cargando" que tendría el enroll client-side.
 *
 * Nota: cada visita a /setup-2fa genera un nuevo factor. En Paso 6+ haremos
 * lookup previo de factores existentes para reutilizar uno pending si lo hay.
 */
export default async function Setup2FAPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    redirect('/login?next=/setup-2fa');
  }

  const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });

  if (enrollError !== null || enrollData === null) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card size="lg" className="w-full max-w-md">
          <div role="alert" className="text-bad text-[13px]">
            No pudimos iniciar la configuración de 2FA. Reintenta más tarde.
            <p className="text-subtle mt-1 text-[11px]">
              {enrollError?.message ?? 'Error desconocido'}
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Setup2FAForm
        factorId={enrollData.id}
        qrCode={enrollData.totp.qr_code}
        secret={enrollData.totp.secret}
        userEmail={user.email ?? ''}
      />
    </main>
  );
}
