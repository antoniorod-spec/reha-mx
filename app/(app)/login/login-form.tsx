'use client';

import { CheckCircle2, KeyRound, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState } from 'react';

import { Card } from '@/components/shared/card';
import { cn } from '@/lib/utils/cn';
import { requestMagicLinkAction, type LoginState } from '@/server/actions/auth/login';
import { loginWithPasswordAction, type PasswordLoginState } from '@/server/actions/auth/password';

type Tab = 'password' | 'magic-link';

const MAGIC_LINK_INITIAL: LoginState = { status: 'idle' };
const PASSWORD_INITIAL: PasswordLoginState = { status: 'idle' };

export function LoginForm() {
  const [tab, setTab] = useState<Tab>('password');

  return (
    <Card size="lg" className="w-full max-w-md">
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-text text-xl font-semibold tracking-[-0.022em]">
            Inicia sesión en Rehai
          </h1>
          <p className="text-muted text-[13px]">
            {tab === 'password'
              ? 'Ingresa con tu correo y contraseña.'
              : 'Te enviamos un enlace para entrar sin contraseña.'}
          </p>
        </div>

        <TabBar value={tab} onChange={setTab} />

        {tab === 'password' ? <PasswordPanel /> : <MagicLinkPanel />}

        <p className="text-subtle border-border-soft border-t pt-3 text-center text-[11.5px]">
          ¿No tienes cuenta?{' '}
          <Link href="/signup" className="text-accent hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </Card>
  );
}

// ───── Tabs ──────────────────────────────────────────────────────────────────

interface TabBarProps {
  value: Tab;
  onChange: (next: Tab) => void;
}

function TabBar({ value, onChange }: TabBarProps) {
  return (
    <div role="tablist" className="border-border bg-surface-2 flex gap-1 rounded-md border p-1">
      <TabButton
        active={value === 'password'}
        onClick={() => onChange('password')}
        icon={<Lock size={12} />}
      >
        Contraseña
      </TabButton>
      <TabButton
        active={value === 'magic-link'}
        onClick={() => onChange('magic-link')}
        icon={<KeyRound size={12} />}
      >
        Magic link
      </TabButton>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon, children }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex h-7 flex-1 items-center justify-center gap-1.5 rounded text-[12px] font-medium transition-colors',
        active ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

// ───── Password panel ────────────────────────────────────────────────────────

function PasswordPanel() {
  const [state, formAction, isPending] = useActionState(loginWithPasswordAction, PASSWORD_INITIAL);

  if (state.status === 'mfa_required') {
    return (
      <div
        role="status"
        className="border-accent/40 bg-accent-soft text-accent rounded-md border px-3 py-3 text-[12px]"
      >
        Esta cuenta tiene 2FA activado. La verificación TOTP completa se habilita en el próximo
        sub-paso (verify-2fa page).
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <EmailField name="email" />
      <PasswordField name="password" autoComplete="current-password" />

      {state.status === 'error' && <ErrorAlert>{state.message}</ErrorAlert>}

      <SubmitButton pending={isPending} label="Entrar" pendingLabel="Entrando…" />
    </form>
  );
}

// ───── Magic link panel ──────────────────────────────────────────────────────

function MagicLinkPanel() {
  const [state, formAction, isPending] = useActionState(requestMagicLinkAction, MAGIC_LINK_INITIAL);

  if (state.status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          aria-hidden
          className="bg-accent-soft text-accent flex size-12 items-center justify-center rounded-full"
        >
          <CheckCircle2 size={22} />
        </div>
        <p className="text-text text-[14px] font-medium">Revisa tu correo</p>
        <p className="text-muted text-[12px]">
          Enlace enviado a <span className="text-text font-mono">{state.email}</span>. Tiene validez
          de 1 hora.
        </p>
        <p className="text-subtle text-[11px]">
          Si no llega en 2 minutos, revisa la carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <EmailField name="email" />

      {state.status === 'error' && <ErrorAlert>{state.message}</ErrorAlert>}

      <SubmitButton pending={isPending} label="Enviar enlace" pendingLabel="Enviando…" />
    </form>
  );
}

// ───── Fields compartidos ────────────────────────────────────────────────────

interface EmailFieldProps {
  name: string;
}

function EmailField({ name }: EmailFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-muted block text-[12px] font-medium">
        Correo electrónico
      </label>
      <div className="relative">
        <Mail
          aria-hidden
          size={14}
          className="text-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          id={name}
          name={name}
          type="email"
          autoComplete="email"
          required
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
  );
}

interface PasswordFieldProps {
  name: string;
  autoComplete: 'current-password' | 'new-password';
}

function PasswordField({ name, autoComplete }: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-muted block text-[12px] font-medium">
        Contraseña
      </label>
      <div className="relative">
        <Lock
          aria-hidden
          size={14}
          className="text-subtle pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          id={name}
          name={name}
          type="password"
          autoComplete={autoComplete}
          required
          minLength={8}
          placeholder="••••••••"
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

interface ErrorAlertProps {
  children: React.ReactNode;
}

function ErrorAlert({ children }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="border-bad/40 bg-bad/10 text-bad rounded-md border px-3 py-2 text-[12px]"
    >
      {children}
    </div>
  );
}

interface SubmitButtonProps {
  pending: boolean;
  label: string;
  pendingLabel: string;
}

function SubmitButton({ pending, label, pendingLabel }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'bg-accent text-accent-on h-9 w-full rounded-md text-[13px] font-semibold',
        'transition-opacity hover:opacity-90',
        'disabled:cursor-not-allowed disabled:opacity-60',
      )}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
