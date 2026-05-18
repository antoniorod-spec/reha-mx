import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Card } from '@/components/shared/card';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';
import { getPatientStatusCounts, listPatients } from '@/lib/patients/queries';

import { PatientsTable } from './patients-table';
import { SearchInput } from './search-input';
import { parsePatientsSearchParams } from './search-params';
import { StatusTabs } from './status-tabs';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pacientes',
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Página de pacientes (CRM básico, Fase 1.1).
 *
 * Server Component:
 *   1. Resuelve org del usuario actual (getCurrentUserOrg).
 *   2. Si no hay sesión → redirect a /login?next=/pacientes.
 *   3. Si está logueado pero sin membership activa → mensaje claro.
 *   4. Lista pacientes con paginación + búsqueda + filtro por status.
 *   5. Emite audit log `patient.listed`.
 */
export default async function PacientesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parsePatientsSearchParams(params);

  const userOrg = await getCurrentUserOrg();
  if (userOrg === null) {
    redirect('/login?next=/pacientes');
  }

  const [list, counts] = await Promise.all([
    listPatients({
      organizationId: userOrg.organization.id,
      search: filters.search,
      status: filters.status,
      page: filters.page,
      pageSize: filters.pageSize,
    }),
    getPatientStatusCounts(userOrg.organization.id),
  ]);

  await logAudit({
    organizationId: userOrg.organization.id,
    userId: userOrg.userId,
    action: 'patient.listed',
    resourceType: 'patient',
    metadata: {
      search: filters.search ?? null,
      status: filters.status,
      page: filters.page,
      total: list.total,
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-subtle font-mono text-[11px] tracking-wider uppercase">
            {userOrg.organization.name}
          </p>
          <h1 className="text-text mt-1 text-2xl font-semibold tracking-[-0.022em]">Pacientes</h1>
          <p className="text-muted mt-1 text-[13px]">
            {list.total === 0
              ? 'No hay pacientes en este filtro.'
              : `${list.total.toLocaleString('es-MX')} ${list.total === 1 ? 'paciente' : 'pacientes'} en total.`}
          </p>
        </div>
      </header>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatusTabs counts={counts} active={filters.status} />
          <SearchInput initial={filters.search ?? ''} />
        </div>
      </Card>

      {list.rows.length === 0 ? (
        <Card size="lg">
          <div className="text-center">
            <p className="text-text text-[14px] font-medium">
              {filters.search
                ? `Sin resultados para "${filters.search}"`
                : 'Aún no hay pacientes en esta categoría'}
            </p>
            <p className="text-muted mt-1 text-[12px]">
              {filters.search
                ? 'Probá con otro término o cambia el filtro de estado.'
                : 'Cuando se registren pacientes aparecerán acá.'}
            </p>
            {filters.search && (
              <Link
                href={withParams({ ...filters, search: undefined, page: 1 })}
                className="text-accent mt-3 inline-block text-[13px] underline-offset-2 hover:underline"
              >
                Limpiar búsqueda
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <>
          <PatientsTable rows={list.rows} />
          {list.totalPages > 1 && (
            <Pagination
              page={list.page}
              totalPages={list.totalPages}
              filters={filters}
              total={list.total}
            />
          )}
        </>
      )}
    </main>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  filters: ReturnType<typeof parsePatientsSearchParams>;
}

function Pagination({ page, totalPages, total, filters }: PaginationProps) {
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Paginación"
      className="text-muted mt-4 flex items-center justify-between text-[12px]"
    >
      <p>
        Página <span className="text-text font-mono">{page}</span> de{' '}
        <span className="text-text font-mono">{totalPages}</span> · {total.toLocaleString('es-MX')}{' '}
        en total
      </p>
      <div className="flex gap-2">
        <PageLink href={prev === null ? null : withParams({ ...filters, page: prev })}>
          Anterior
        </PageLink>
        <PageLink href={next === null ? null : withParams({ ...filters, page: next })}>
          Siguiente
        </PageLink>
      </div>
    </nav>
  );
}

interface PageLinkProps {
  href: string | null;
  children: React.ReactNode;
}

function PageLink({ href, children }: PageLinkProps) {
  if (href === null) {
    return (
      <span className="border-border-soft text-subtle inline-flex h-8 cursor-not-allowed items-center rounded-md border px-3">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="border-border bg-surface-2 text-text hover:bg-surface inline-flex h-8 items-center rounded-md border px-3 transition-colors"
    >
      {children}
    </Link>
  );
}

function withParams(filters: ReturnType<typeof parsePatientsSearchParams>): string {
  const search = new URLSearchParams();
  if (filters.search) search.set('q', filters.search);
  if (filters.status !== 'active') search.set('status', filters.status);
  if (filters.page > 1) search.set('page', String(filters.page));
  const qs = search.toString();
  return qs ? `/pacientes?${qs}` : '/pacientes';
}
