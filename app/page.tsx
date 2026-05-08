import Link from 'next/link';

import { Card } from '@/components/shared/card';

/**
 * Placeholder de la home. Se reemplaza en Paso 4 final / Fase 1 con la landing
 * de marketing real (app/(marketing)/page.tsx via route group).
 */
export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <Card size="lg" className="w-full max-w-md">
        <div className="space-y-3">
          <span className="bg-accent-soft text-accent inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase">
            En construcción
          </span>
          <h1 className="text-text text-2xl font-semibold tracking-[-0.022em]">Reha.mx</h1>
          <p className="text-muted text-[13px]">
            Sistema operativo para clínicas de readaptación deportiva en México. La landing pública
            llega en Fase 1.
          </p>
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
