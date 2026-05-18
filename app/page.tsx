import Link from 'next/link';

import { Card } from '@/components/shared/card';
import { createClient } from '@/lib/supabase/server';
import { logoutAction } from '@/server/actions/auth/logout';

/**
 * Placeholder de la home. En Fase 1 se reemplaza por la landing de marketing
 * real (app/(marketing)/page.tsx via route group).
 *
 * Para desarrollo: si hay sesión activa muestra info + botón logout + link a
 * /setup-2fa. Si no, muestra el estado "en construcción" con link a /login.
 */
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Card size="lg" className="w-full max-w-md">
        {user === null ? <UnauthenticatedView /> : <AuthenticatedView email={user.email ?? ''} />}
      </Card>
    </main>
  );
}

function UnauthenticatedView() {
  return (
    <div className="space-y-3">
      <span className="bg-accent-soft text-accent inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase">
        En construcción
      </span>
      <h1 className="text-text text-2xl font-semibold tracking-[-0.022em]">Rehai</h1>
      <p className="text-muted text-[13px]">
        Sistema operativo para clínicas de readaptación deportiva en México. La landing pública
        llega en Fase 1.
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
  );
}

interface AuthenticatedViewProps {
  email: string;
}

function AuthenticatedView({ email }: AuthenticatedViewProps) {
  return (
    <div className="space-y-4">
      <span className="bg-good/15 text-good inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase">
        Sesión activa
      </span>
      <div className="space-y-1">
        <h1 className="text-text text-xl font-semibold tracking-[-0.022em]">
          Hola, {email.split('@')[0]}
        </h1>
        <p className="text-muted text-[12px]">
          Conectado como <span className="text-text font-mono">{email}</span>
        </p>
      </div>

      <div className="space-y-2 pt-2">
        <Link
          href="/pacientes"
          className="bg-accent text-accent-on flex h-9 w-full items-center justify-center rounded-md text-[13px] font-semibold transition-opacity hover:opacity-90"
        >
          Ver pacientes
        </Link>

        {/* 2FA temporalmente desactivado en modo prueba para socios.
            Reactivar cuando entremos a Fase 5 (go-live MoveWell). */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="border-border text-muted hover:text-text flex h-9 w-full items-center justify-center rounded-md border text-[13px] font-medium transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      {process.env.NODE_ENV !== 'production' && (
        <p className="text-subtle border-border-soft border-t pt-3 text-[11px]">
          Dev:{' '}
          <Link href="/showcase" className="text-accent underline-offset-2 hover:underline">
            /showcase
          </Link>
        </p>
      )}
    </div>
  );
}
