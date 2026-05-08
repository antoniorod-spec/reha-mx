'use client';

import { CheckCircle2, Mail } from 'lucide-react';
import { useActionState } from 'react';

import { Card } from '@/components/shared/card';
import { cn } from '@/lib/utils/cn';
import { requestMagicLinkAction, type LoginState } from '@/server/actions/auth/login';

const INITIAL_STATE: LoginState = { status: 'idle' };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(requestMagicLinkAction, INITIAL_STATE);

  if (state.status === 'sent') {
    return (
      <Card size="lg" className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            aria-hidden
            className="bg-accent-soft text-accent flex size-12 items-center justify-center rounded-full"
          >
            <CheckCircle2 size={22} />
          </div>
          <h1 className="text-text text-xl font-semibold tracking-[-0.022em]">Revisa tu correo</h1>
          <p className="text-muted text-[13px]">
            Te enviamos un enlace de acceso a{' '}
            <span className="text-text font-mono">{state.email}</span>. Tiene validez de 1 hora.
          </p>
          <p className="text-subtle text-[12px]">
            Si no llega en 2 minutos, revisa la carpeta de spam.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card size="lg" className="w-full max-w-md">
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-text text-xl font-semibold tracking-[-0.022em]">
            Inicia sesión en Rehai
          </h1>
          <p className="text-muted text-[13px]">
            Te enviamos un enlace para entrar sin contraseña.
          </p>
        </div>

        <form action={formAction} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-muted block text-[12px] font-medium">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail
                aria-hidden
                size={14}
                className="text-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                placeholder="tu@email.com"
                className={cn(
                  'border-border bg-surface-2 text-text placeholder:text-subtle',
                  'h-9 w-full rounded-md border pr-3 pl-9 text-[13px] outline-none',
                  'focus:border-accent focus:ring-accent/30 focus:ring-2',
                  'disabled:cursor-not-allowed disabled:opacity-60',
                )}
              />
            </div>
          </div>

          {state.status === 'error' && (
            <div
              role="alert"
              className="border-bad/40 bg-bad/10 text-bad rounded-md border px-3 py-2 text-[12px]"
            >
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'bg-accent text-accent-on h-9 w-full rounded-md text-[13px] font-semibold',
              'transition-opacity hover:opacity-90',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {isPending ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>

        <p className="text-subtle text-center text-[11px]">
          Al entrar aceptas el aviso de privacidad de Rehai.
        </p>
      </div>
    </Card>
  );
}
