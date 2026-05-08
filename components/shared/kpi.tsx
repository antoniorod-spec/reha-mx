import { Card } from '@/components/shared/card';
import { cn } from '@/lib/utils/cn';

type KpiFormat = 'integer' | 'currency' | 'percent' | 'raw';

interface KpiProps {
  label: string;
  /** Si es number, se formatea según `format`. Si es string, se usa tal cual. */
  value: string | number;
  /** Variación porcentual (12 = +12%, -5 = -5%). Color automático según signo. */
  delta?: number;
  /** Texto descriptivo bajo el valor. Ej: "vs mes anterior". */
  deltaLabel?: string;
  format?: KpiFormat;
}

/**
 * KPI de Rehai — número grande en mono, label arriba, delta + comparación abajo.
 * DESIGN.md: 28-32px mono semibold con tracking tighter, label 11px medium muted.
 * Datos numéricos SIEMPRE en JetBrains Mono con tabular-nums.
 */
export function Kpi({ label, value, delta, deltaLabel, format = 'integer' }: KpiProps) {
  const formatted = typeof value === 'number' ? formatValue(value, format) : value;
  const deltaText = typeof delta === 'number' ? formatDelta(delta) : null;
  const deltaColor =
    delta === undefined
      ? 'text-muted'
      : delta > 0
        ? 'text-good'
        : delta < 0
          ? 'text-bad'
          : 'text-muted';

  return (
    <Card>
      <div className="text-muted text-[11px] font-medium">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-text font-mono text-[28px] font-semibold tracking-[-0.022em] tabular-nums">
          {formatted}
        </div>
        {deltaText !== null && (
          <div className={cn('font-mono text-[11px] tabular-nums', deltaColor)}>{deltaText}</div>
        )}
      </div>
      {deltaLabel !== undefined && (
        <div className="text-subtle mt-0.5 text-[10px]">{deltaLabel}</div>
      )}
    </Card>
  );
}

function formatValue(value: number, format: KpiFormat): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
      }).format(value);
    case 'percent':
      return `${value}%`;
    case 'raw':
      return String(value);
    case 'integer':
    default:
      return new Intl.NumberFormat('es-MX').format(value);
  }
}

function formatDelta(delta: number): string {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta}%`;
}
