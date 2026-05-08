'use client';

import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { cn } from '@/lib/utils/cn';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'reha-theme';
const THEME_CHANGE_EVENT = 'reha:theme-change';

function subscribe(callback: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  // 'storage' captura cambios desde otras pestañas
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): Theme {
  const value = document.documentElement.dataset.theme;
  return value === 'light' ? 'light' : 'dark';
}

function getServerSnapshot(): Theme {
  return 'dark';
}

interface ThemeToggleProps {
  className?: string;
}

/**
 * Toggle dark/light. Persiste en localStorage; aplica via data-theme="..." en <html>.
 *
 * Usa useSyncExternalStore para sincronizar con el DOM sin setState-in-effect
 * (pattern recomendado en React 19). El script anti-FOUC en app/layout.tsx
 * setea data-theme antes de la hidratación.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle(): void {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage puede fallar en modo privacidad — no es crítico
    }
    // Notificar al subscribe local (storage event no se dispara en la misma tab)
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  const Icon = theme === 'dark' ? Sun : Moon;
  const label = `Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'border-border bg-surface-2 text-muted hover:bg-surface hover:text-text flex size-8 items-center justify-center rounded-md border transition-colors',
        className,
      )}
    >
      <Icon size={14} />
    </button>
  );
}
