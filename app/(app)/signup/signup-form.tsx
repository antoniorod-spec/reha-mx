'use client';

import { CheckCircle2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';

import { Card } from '@/components/shared/card';
import { cn } from '@/lib/utils/cn';
import { signupAction, type SignupState } from '@/server/actions/auth/signup';

const INITIAL: SignupState = { status: 'idle' };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, INITIAL);

  if (state.status === 'pending_confirmation') {
    return (
      <Card size="lg" className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            aria-hidden
            className="bg-accent-soft text-accent flex size-12 items-center justify-center rounded-full"
          >
            <CheckCircle2 size={22} />
          </div>
          <h1 className="text-text text-xl font-semibold tracking-[-0.022em]">Cuenta creada</h1>
          <p className="text-muted text-[13px]">
            Te enviamos un correo de confirmación a{' '}
            <span className="text-text font-mono">{state.email}</span>. Haz click en el enlace para
            activar tu cuenta.
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
            Crear cuenta en Rehai
          </h1>
          <p className="text-muted text-[13px]">
            Usa una contraseña fuerte de mínimo 8 caracteres.
          </p>
        </div>

        <form action={formAction} className="space-y-3">
          <Field
            name="email"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            icon={<Mail size={14} />}
            required
          />

          <Field
            name="password"
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            icon={<Lock size={14} />}
            minLength={8}
            required
          />

          <Field
            name="passwordConfirm"
            label="Confirma contraseña"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            icon={<Lock size={14} />}
            minLength={8}
            required
          />

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
            {isPending ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-subtle border-border-soft border-t pt-3 text-center text-[11.5px]">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </Card>
  );
}

interface FieldProps {
  name: string;
  label: string;
  type: 'email' | 'password';
  autoComplete: string;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  minLength?: number;
}

function Field({
  name,
  label,
  type,
  autoComplete,
  placeholder,
  icon,
  required,
  minLength,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-muted block text-[12px] font-medium">
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden
          className="text-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        >
          {icon}
        </span>
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className={cn(
            'border-border bg-surface-2 text-text placeholder:text-subtle',
            'h-9 w-full rounded-md border pr-3 pl-9 text-[13px] outline-none',
            'focus:border-accent focus:ring-accent/30 focus:ring-2',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        />
      </div>
    </div>
  );
}
