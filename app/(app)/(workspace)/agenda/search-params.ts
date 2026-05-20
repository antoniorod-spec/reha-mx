export interface AgendaFilters {
  /** Fecha del día a mostrar en formato YYYY-MM-DD (timezone del servidor). */
  date: string;
}

/**
 * Normaliza searchParams del request de agenda.
 * Default: date=hoy en tz del servidor.
 *
 * El filtro de sucursal se resuelve desde la cookie `rehai-active-branch`
 * (ver lib/agenda/active-branch.ts), no desde la URL — así el sidebar y la
 * agenda comparten la misma fuente de verdad.
 */
export function parseAgendaSearchParams(
  raw: Record<string, string | string[] | undefined>,
): AgendaFilters {
  const dateRaw = firstStr(raw['date']);
  const date = dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : todayLocalIsoDate();
  return { date };
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
