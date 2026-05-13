import { SignupForm } from './signup-form';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  robots: { index: false, follow: false },
};

/**
 * Página de signup pública. Server Component.
 * Antonio (admin futuro) crea su cuenta acá. En Fase 1+ restringimos
 * signup a invitaciones via admin para evitar abuso público.
 */
export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <SignupForm />
    </main>
  );
}
