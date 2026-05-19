'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

interface SearchInputProps {
  initial: string;
}

const DEBOUNCE_MS = 250;

/**
 * Buscador con debounce. Actualiza la URL con `?q=…` y deja que el Server
 * Component vuelva a renderizar con resultados nuevos. Mantenemos el resto
 * de params (status) y reseteamos `page` a 1 con cada nueva búsqueda.
 *
 * Nota: usamos `initial` solo como valor inicial — si el usuario cambia de
 * filtro (status) y vuelve, el componente se desmonta/monta por la
 * navegación de Next y el initial vuelve a aplicarse. Evitamos un useEffect
 * que sincronice prop → state (cascading renders).
 */
export function SearchInput({ initial }: SearchInputProps) {
  const [value, setValue] = useState(initial);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = value.trim();
      const current = params.get('q')?.trim() ?? '';
      if (trimmed === current) return;

      const next = new URLSearchParams(params);
      if (trimmed.length > 0) {
        next.set('q', trimmed);
      } else {
        next.delete('q');
      }
      next.delete('page');

      const qs = next.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [value, params, pathname, router]);

  return (
    <label className="border-border bg-surface-2 focus-within:border-accent flex h-9 w-full max-w-sm items-center gap-2 rounded-md border px-3 transition-colors">
      <Search className="text-subtle size-4" aria-hidden />
      <span className="sr-only">Buscar paciente</span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar por nombre, email, teléfono, deporte…"
        className="placeholder:text-subtle text-text w-full bg-transparent text-[13px] outline-none"
        autoComplete="off"
      />
    </label>
  );
}
