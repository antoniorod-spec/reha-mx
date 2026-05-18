import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Card } from '@/components/shared/card';
import { listAppointmentTypes, listBranches, listPractitioners } from '@/lib/agenda/queries';
import { logAudit } from '@/lib/audit/log';
import { getCurrentUserOrg } from '@/lib/auth/current-user-org';
import { db } from '@/lib/db/client';
import { rooms } from '@/lib/db/schema/rooms';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configuración',
  robots: { index: false, follow: false },
};

const SPECIALTY_LABEL: Record<string, string> = {
  fisioterapia_deportiva: 'Fisioterapia deportiva',
  readaptacion_funcional: 'Readaptación funcional',
  fisioterapia_general: 'Fisioterapia general',
  kinesiologia: 'Kinesiología',
  osteopatia: 'Osteopatía',
  nutricion_deportiva: 'Nutrición deportiva',
  preparacion_fisica: 'Preparación física',
  medicina_deportiva: 'Medicina deportiva',
  otra: 'Otra',
};

const ROOM_TYPE_LABEL: Record<string, string> = {
  couch: 'Camilla',
  functional: 'Área funcional',
  isokinetic: 'Isoinercia',
  assessment: 'Evaluación',
  shared: 'Compartido',
};

/**
 * Página de Configuración — lectura por ahora (Fase 1.2 foundation).
 *
 * Muestra: sucursales con sus salas, equipo (fisios), tipos de cita.
 *
 * Formularios de crear/editar llegan en sub-sprint siguiente (post agenda
 * con DnD-Kit). Por ahora todo se siembra via `pnpm db:seed`.
 */
export default async function ConfiguracionPage() {
  const userOrg = await getCurrentUserOrg();
  if (userOrg === null) {
    redirect('/login?next=/configuracion');
  }

  const [branchList, typesList, practitionersList] = await Promise.all([
    listBranches(userOrg.organization.id),
    listAppointmentTypes(userOrg.organization.id),
    listPractitioners(userOrg.organization.id),
  ]);

  const allRooms = await db
    .select()
    .from(rooms)
    .where(eq(rooms.organizationId, userOrg.organization.id));

  const roomsByBranch = new Map<string, typeof allRooms>();
  for (const r of allRooms) {
    const arr = roomsByBranch.get(r.branchId) ?? [];
    arr.push(r);
    roomsByBranch.set(r.branchId, arr);
  }

  await logAudit({
    organizationId: userOrg.organization.id,
    userId: userOrg.userId,
    action: 'config.viewed',
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-6">
        <p className="text-subtle font-mono text-[11px] tracking-wider uppercase">
          {userOrg.organization.name}
        </p>
        <h1 className="text-text mt-1 text-2xl font-semibold tracking-[-0.022em]">Configuración</h1>
        <p className="text-muted mt-1 text-[13px]">
          Sucursales, equipo y tipos de cita. Formularios de edición se agregan en próximo sprint.{' '}
          <Link href="/agenda" className="text-accent underline-offset-2 hover:underline">
            Ver agenda →
          </Link>
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-text mb-3 text-[14px] font-semibold tracking-[-0.011em]">
          Sucursales ({branchList.length})
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {branchList.map((branch) => {
            const rs = roomsByBranch.get(branch.id) ?? [];
            return (
              <Card key={branch.id}>
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: branch.color ?? '#3FBCD4' }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-text text-[14px] font-medium tracking-[-0.011em]">
                      {branch.name}
                    </h3>
                    <p className="text-muted text-[12px]">
                      {[branch.addressLine, branch.city].filter(Boolean).join(', ') || '—'}
                    </p>
                    <p className="text-subtle mt-1 font-mono text-[11px]">
                      Horario {branch.defaultOpenAt ?? '—'} – {branch.defaultCloseAt ?? '—'} · TZ{' '}
                      {branch.timezone}
                    </p>
                  </div>
                </div>
                {rs.length > 0 && (
                  <ul className="border-border-soft mt-3 space-y-1 border-t pt-3 text-[12px]">
                    {rs.map((r) => (
                      <li key={r.id} className="flex items-center justify-between">
                        <span className="text-text">{r.name}</span>
                        <span className="text-subtle font-mono text-[11px]">
                          {ROOM_TYPE_LABEL[r.type] ?? r.type} · cap {r.capacity}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-text mb-3 text-[14px] font-semibold tracking-[-0.011em]">
          Equipo ({practitionersList.length})
        </h2>
        <Card className="overflow-hidden p-0">
          <ul className="divide-border-soft divide-y">
            {practitionersList.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: p.color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-text text-[14px] font-medium tracking-[-0.011em]">
                    {p.displayName}
                  </p>
                  <p className="text-subtle text-[11px]">
                    {p.title ? `${p.title} · ` : ''}
                    {SPECIALTY_LABEL[p.specialty] ?? p.specialty}
                  </p>
                </div>
              </li>
            ))}
            {practitionersList.length === 0 && (
              <li className="px-4 py-6 text-center">
                <p className="text-muted text-[13px]">Sin fisios registrados.</p>
              </li>
            )}
          </ul>
        </Card>
      </section>

      <section>
        <h2 className="text-text mb-3 text-[14px] font-semibold tracking-[-0.011em]">
          Tipos de cita ({typesList.length})
        </h2>
        <Card className="overflow-hidden p-0">
          <ul className="divide-border-soft divide-y">
            {typesList.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: t.color }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-text text-[14px] font-medium tracking-[-0.011em]">{t.name}</p>
                  <p className="text-subtle font-mono text-[11px]">
                    {t.durationMinutes} min
                    {t.priceCents !== null && t.priceCents > 0
                      ? ` · ${formatMxn(t.priceCents)}`
                      : ''}
                    {t.bookableByPatient === 'true' ? ' · público' : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </main>
  );
}

function formatMxn(cents: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);
}
