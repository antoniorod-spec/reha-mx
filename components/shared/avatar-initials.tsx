import { cn } from '@/lib/utils/cn';

interface AvatarInitialsProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarInitialsProps['size']>, string> = {
  xs: 'size-5 text-[9px]',
  sm: 'size-6 text-[10px]',
  md: 'size-7 text-[11px]',
  lg: 'size-9 text-[13px]',
};

const STOPWORDS = new Set(['de', 'la', 'del', 'los', 'las', 'y', 'e']);

/**
 * Avatar circular con iniciales sobre gradiente de marca.
 * DESIGN.md: gradient 135deg navy → cyan (#1B3A5C → #3FBCD4), texto blanco.
 *
 * Genera iniciales descartando preposiciones:
 *   "Antonio Rodríguez de Tembleque" → "AR"
 *   "Mtra. Paulina Granados" → "MP"
 *   "MoveWell SLP" → "MS"
 */
export function AvatarInitials({ name, size = 'md', className }: AvatarInitialsProps) {
  const initials = getInitials(name);

  return (
    <div
      aria-label={name}
      role="img"
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white',
        SIZE_CLASSES[size],
        className,
      )}
      style={{ background: 'linear-gradient(135deg, #1B3A5C, #3FBCD4)' }}
    >
      {initials}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter((p) => p.length > 0 && !STOPWORDS.has(p.toLowerCase().replace(/\.$/, '')));

  if (parts.length === 0) return '?';

  const first = parts[0]?.[0]?.toUpperCase() ?? '';
  const second = parts.length > 1 ? (parts[1]?.[0]?.toUpperCase() ?? '') : '';
  return `${first}${second}`;
}
