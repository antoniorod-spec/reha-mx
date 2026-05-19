export interface AgendaFilters {
  /** Fecha del día a mostrar en formato YYYY-MM-DD (timezone del servidor). */
  date: string;
  /** Slug del branch seleccionado, o null para "todas las sucursales". */
  branchSlug: string | null;
}

/**
 * Normaliza searchParams del request de agenda.
 * Defaults: date=hoy en tz del servidor, branchSlug=null (todas).
 */
export function parseAgendaSearchParams(
  raw: Record<string, string | string[] | undefined>,
): AgendaFilters {
  const dateRaw = firstStr(raw['date']);
  const branchSlug = firstStr(raw['branch']) ?? null;

  const date = dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : todayLocalIsoDate();

  return { date, branchSlug };
}

export function todayLocalIsoDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function firstStr(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}
