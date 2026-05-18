import type { PatientStatusFilter } from '@/lib/patients/queries';

const VALID_STATUS: ReadonlySet<PatientStatusFilter> = new Set([
  'active',
  'discharged',
  'inactive',
  'archived',
  'all',
]);

export interface PatientsFilters {
  search: string | undefined;
  status: PatientStatusFilter;
  page: number;
  pageSize: number;
}

/**
 * Normaliza searchParams del request en filtros tipados para la query.
 * Default: status='active', page=1, pageSize=25. q ausente = sin búsqueda.
 */
export function parsePatientsSearchParams(
  raw: Record<string, string | string[] | undefined>,
): PatientsFilters {
  const search = firstStr(raw['q'])?.trim();
  const statusParam = firstStr(raw['status']);
  const status: PatientStatusFilter =
    statusParam && VALID_STATUS.has(statusParam as PatientStatusFilter)
      ? (statusParam as PatientStatusFilter)
      : 'active';

  const pageParam = firstStr(raw['page']);
  const parsedPage = pageParam ? Number.parseInt(pageParam, 10) : 1;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return {
    search: search && search.length > 0 ? search : undefined,
    status,
    page,
    pageSize: 25,
  };
}

function firstStr(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}
