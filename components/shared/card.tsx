import { cn } from '@/lib/utils/cn';

import type { ComponentPropsWithoutRef } from 'react';

interface CardProps extends ComponentPropsWithoutRef<'div'> {
  /** Padding interno: sm = 12px, md = 16px (default), lg = 20px. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Card base de Reha.mx — superficie con borde 1px sin sombra.
 * DESIGN.md: rounded-xl, border 1px en color border, sin shadows pesadas.
 */
export function Card({ size = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'border-border bg-surface rounded-xl border',
        size === 'sm' && 'p-3',
        size === 'md' && 'p-4',
        size === 'lg' && 'p-5',
        className,
      )}
      {...props}
    />
  );
}
