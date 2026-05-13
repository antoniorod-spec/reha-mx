'use client';

import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Card } from '@/components/shared/card';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

interface Setup2FAFormProps {
  factorId: string;
  /** SVG string del QR generado por Supabase Auth */
  qrCode: string;
  /** Secret base32 para entrada manual en el Authenticator si el QR falla */
  secret: string;
  userEmail: string;
}

/**
 * Form de verificación 2FA. Recibe el factor recién creado (server) y maneja
 * la verificación del código TOTP del lado cliente:
 *   1. Usuario escanea QR (o ingresa secret manual) en su Authenticator
 *   2. Usuario tipea el código de 6 dígitos
 *   3. mfa.challenge() + mfa.verify() en cliente con anon key
 *   4. Supabase activa el factor → próximos logins requieren código
 *
 * Sin useEffect: el enroll vino como props desde el Server Component, evitando
 * setState-in-effect (anti-pattern React 19).
 */
export function Setup2FAForm({ factorId, qrCode, secret, userEmail }: Setup2FAFormProps) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  async function handleVerify(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (code.length !== 6) {
      setVerifyError('Ingresa el código de 6 dígitos');
      return;
    }
    setIsVerifying(true);
    setVerifyError(null);

    const supabase = createClient();

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError !== null || challenge === null) {
      setVerifyError('Error al iniciar verificación. Intenta de nuevo.');
      setIsVerifying(false);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });
    if (verifyErr !== null) {
      setVerifyError('Código incorrecto. Verifica que tu Authenticator esté sincronizado.');
      setIsVerifying(false);
      return;
    }

    setVerified(true);
    setIsVerifying(false);
  }

  if (verified) {
    return (
      <Card size="lg" className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-good/15 text-good flex size-12 items-center justify-center rounded-full">
            <CheckCircle2 size={22} />
          </div>
          <h1 className="text-text text-xl font-semibold tracking-[-0.022em]">2FA activado</h1>
          <p className="text-muted text-[13px]">
            Tu cuenta está protegida con autenticación de dos factores. La próxima vez que inicies
            sesión, te pediremos un código del Authenticator.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card size="lg" className="w-full max-w-md">
      <div className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-text flex items-center gap-2 text-xl font-semibold tracking-[-0.022em]">
            <ShieldCheck className="text-accent" size={20} />
            Configurar 2FA
          </h1>
          <p className="text-muted text-[13px]">
            Escanea el QR con tu app de Authenticator (Google Authenticator, Authy, 1Password) e
            ingresa el código generado.
          </p>
        </div>

        <div className="border-border bg-surface-2 flex items-center justify-center rounded-md border p-4">
          {/*
            Supabase devuelve qr_code como Data URI ("data:image/svg+xml;utf-8,<svg...>"),
            no como SVG inline. Usamos <img> con eslint-disable porque next/image
            no aporta optimización en Data URI (es SVG inline).
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCode}
            alt="Código QR para escanear con la app Authenticator"
            className="size-48 rounded bg-white p-2"
          />
        </div>

        <details className="text-[12px]">
          <summary className="text-muted cursor-pointer select-none">
            ¿No puedes escanear? Ingresa este código manual
          </summary>
          <div className="border-border bg-surface-2 text-text mt-2 rounded border px-3 py-2 font-mono break-all">
            {secret}
          </div>
        </details>

        <form onSubmit={handleVerify} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="code" className="text-muted block text-[12px] font-medium">
              Código de 6 dígitos
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              disabled={isVerifying}
              placeholder="000000"
              className={cn(
                'border-border bg-surface-2 text-text placeholder:text-subtle',
                'h-10 w-full rounded-md border px-3 text-center font-mono text-[18px] tracking-[0.5em] tabular-nums outline-none',
                'focus:border-accent focus:ring-accent/30 focus:ring-2',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
            />
          </div>

          {verifyError !== null && (
            <div
              role="alert"
              className="border-bad/40 bg-bad/10 text-bad rounded-md border px-3 py-2 text-[12px]"
            >
              {verifyError}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || code.length !== 6}
            className={cn(
              'bg-accent text-accent-on h-9 w-full rounded-md text-[13px] font-semibold',
              'transition-opacity hover:opacity-90',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            {isVerifying ? 'Verificando…' : 'Activar 2FA'}
          </button>
        </form>

        <p className="text-subtle text-center text-[11px]">{userEmail}</p>
      </div>
    </Card>
  );
}
