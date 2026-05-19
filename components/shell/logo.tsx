import Link from 'next/link';

/**
 * Logo de Rehai — gradiente del prototipo (navy → cyan) sobre un cuadrado
 * redondeado con el ícono de actividad/movimiento. Texto "Rehai" + punto
 * acento + tagline.
 *
 * Server component — no interactividad propia, el link es navegación nativa.
 */
export function Logo({ href = '/dashboard' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <span
        className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #3FBCD4 100%)' }}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="15" cy="6" r="1.6" fill="#FFFFFF" stroke="none" />
          <path d="M5 19c2-1 3-3 4-4l2.5 2 3-2 3.5 4" />
          <path d="M9.5 11l3-2 2 2.5" />
        </svg>
      </span>
      <span className="min-w-0 leading-none">
        <span className="text-text block text-[15px] font-semibold tracking-[-0.011em]">
          Rehai<span className="text-accent">.</span>
        </span>
        <span className="text-subtle mt-0.5 block truncate font-mono text-[10px]">v 0.1 · MVP</span>
      </span>
    </Link>
  );
}
