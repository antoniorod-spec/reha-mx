import { notFound } from 'next/navigation';

import { AvatarInitials } from '@/components/shared/avatar-initials';
import { BranchBadge } from '@/components/shared/branch-badge';
import { Card } from '@/components/shared/card';
import { Kpi } from '@/components/shared/kpi';
import { ThemeToggle } from '@/components/shared/theme-toggle';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Showcase',
  robots: { index: false, follow: false },
};

/**
 * Página privada de QA visual — solo dev.
 * Renderiza todos los primitives de components/shared/ para validar
 * tokens, contraste y comportamiento en dark/light.
 */
export default function ShowcasePage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-text text-2xl font-semibold tracking-[-0.022em]">Rehai — Showcase</h1>
          <p className="text-muted mt-1 text-sm">
            Primitives de diseño. Solo dev. Toggle dark/light arriba a la derecha.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Cards">
        <div className="grid gap-3 md:grid-cols-3">
          <Card size="sm">
            <p className="text-muted text-[12px]">Card sm · padding 12px</p>
            <p className="text-text mt-1 text-[13px]">Contenido de ejemplo</p>
          </Card>
          <Card>
            <p className="text-muted text-[12px]">Card md (default) · padding 16px</p>
            <p className="text-text mt-1 text-[13px]">Contenido de ejemplo</p>
          </Card>
          <Card size="lg">
            <p className="text-muted text-[12px]">Card lg · padding 20px</p>
            <p className="text-text mt-1 text-[13px]">Contenido de ejemplo</p>
          </Card>
        </div>
      </Section>

      <Section title="KPIs">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Pacientes activos" value={487} delta={12} deltaLabel="vs mes anterior" />
          <Kpi label="Sesiones esta semana" value={156} delta={-3} deltaLabel="vs sem anterior" />
          <Kpi
            label="Ingresos del mes"
            value={487300}
            format="currency"
            delta={8}
            deltaLabel="vs mes anterior"
          />
          <Kpi label="Ocupación" value={72} format="percent" />
        </div>
      </Section>

      <Section title="Branch Badges">
        <Card>
          <div className="flex flex-wrap items-center gap-6">
            <BranchBadge name="Centro" />
            <BranchBadge name="Lomas Pádel" color="var(--color-branch-lomas)" />
            <BranchBadge
              name="Carranza (solo prototipo, no real)"
              color="var(--color-branch-carranza)"
            />
            <BranchBadge name="Custom hex" color="#A855F7" />
          </div>
        </Card>
      </Section>

      <Section title="Avatars con iniciales">
        <Card>
          <div className="flex items-center gap-4">
            <AvatarInitials name="Antonio Rodríguez de Tembleque" size="xs" />
            <AvatarInitials name="Antonio Rodríguez de Tembleque" size="sm" />
            <AvatarInitials name="Antonio Rodríguez de Tembleque" size="md" />
            <AvatarInitials name="Antonio Rodríguez de Tembleque" size="lg" />
            <span className="text-muted ml-2 text-[12px]">
              <span className="text-text font-mono">&quot;AR&quot;</span> · descarta &quot;de&quot;
            </span>
          </div>
          <div className="text-muted mt-4 grid gap-2 text-[12px]">
            <div className="flex items-center gap-3">
              <AvatarInitials name="Mtra. Paulina Granados" size="sm" />
              <span>
                Mtra. Paulina Granados → <span className="text-text font-mono">&quot;MP&quot;</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <AvatarInitials name="MoveWell SLP" size="sm" />
              <span>
                MoveWell SLP → <span className="text-text font-mono">&quot;MS&quot;</span>
              </span>
            </div>
          </div>
        </Card>
      </Section>

      <Section title="Tokens semánticos">
        <Card>
          <div className="grid gap-2 text-[12px]">
            <TokenRow name="bg" />
            <TokenRow name="surface" />
            <TokenRow name="surface-2" />
            <TokenRow name="border" />
            <TokenRow name="text" />
            <TokenRow name="muted" />
            <TokenRow name="subtle" />
            <TokenRow name="accent" />
            <TokenRow name="good" />
            <TokenRow name="bad" />
          </div>
        </Card>
      </Section>

      <Section title="Tipografía — JetBrains Mono para datos">
        <Card>
          <div className="space-y-2">
            <div className="text-text font-mono text-[28px] font-semibold tracking-[-0.022em] tabular-nums">
              487,300 MXN
            </div>
            <div className="text-muted font-mono text-[14px] tabular-nums">
              fx ESGUINCE GRADO 2 · pqx LCA · po MENISCOS
            </div>
            <div className="text-text text-[14px]">
              Inter para UI: Tendinopatía rotuliana, fascitis plantar, esguince tobillo grado II.
            </div>
          </div>
        </Card>
      </Section>
    </main>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-text mb-3 text-[13px] font-semibold tracking-[-0.011em]">{title}</h2>
      {children}
    </section>
  );
}

interface TokenRowProps {
  name: string;
}

function TokenRow({ name }: TokenRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="border-border size-5 rounded border"
        style={{ backgroundColor: `var(--color-${name})` }}
      />
      <span className="text-text font-mono">--color-{name}</span>
    </div>
  );
}
