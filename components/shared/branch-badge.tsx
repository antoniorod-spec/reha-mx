interface BranchBadgeProps {
  name: string;
  /**
   * Color del dot. Acepta cualquier valor CSS válido (hex, rgb, var()).
   * Default: cyan de la sucursal Centro (token --color-branch-centro).
   */
  color?: string;
}

/**
 * Badge de sucursal — dot color + nombre.
 * DESIGN.md: 11.5px text-muted con dot 6px (1.5 × 4px).
 *
 * Para tenants con N sucursales el consumer pasa el color directo.
 * Tokens predefinidos disponibles:
 *   var(--color-branch-centro)  → #3FBCD4
 *   var(--color-branch-lomas)   → #5B8AC9
 *   var(--color-branch-carranza) → #7EE3C5
 */
export function BranchBadge({ name, color = 'var(--color-branch-centro)' }: BranchBadgeProps) {
  return (
    <span className="text-muted flex items-center gap-1.5 text-[11.5px]">
      <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}
