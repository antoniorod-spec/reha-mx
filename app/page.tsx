import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Card } from '@/components/shared/card';
import { createClient } from '@/lib/supabase/server';

/**
 * Home pública — landing mínima en construcción.
 *
 * Si hay sesión activa, redirige a `/dashboard` (workspace clínico).
 * Sin sesión, muestra la card "Rehai en construcción" con link a /login.
 *
 * En Fase post-MVP esta vista la reemplaza la landing de marketing real
 * (app/(marketing)/page.tsx).
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center px-6 py-12">
      <Card size="lg" className="w-full max-w-md">
        <div className="space-y-3">
          <span className="bg-accent-soft text-accent inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase">
            En construcción
          </span>
          <h1 className="text-text text-2xl font-semibold tracking-[-0.022em]">
            Rehai<span className="text-accent">.</span>
          </h1>
          <p className="text-muted text-[13px]">
            Sistema operativo para clínicas de readaptación deportiva en México. La landing pública
            llega en post-MVP.
          </p>
          <div className="border-border-soft mt-4 border-t pt-4">
            <Link
              href="/login"
              className="bg-accent text-accent-on inline-flex h-9 items-center rounded-md px-4 text-[13px] font-semibold transition-opacity hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          </div>
          {process.env.NODE_ENV !== 'production' && (
            <p className="text-subtle pt-2 text-[12px]">
              Dev:{' '}
              <Link href="/showcase" className="text-accent underline-offset-2 hover:underline">
                /showcase
              </Link>{' '}
              para QA visual de primitives.
            </p>
          )}
        </div>
      </Card>
    </main>
  );
}
