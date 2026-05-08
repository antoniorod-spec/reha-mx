import { LoginForm } from './login-form';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  robots: { index: false, follow: false },
};

/**
 * Página de login pública.
 * Server Component — todo el estado del form está en LoginForm (client).
 */
export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <LoginForm />
    </main>
  );
}
