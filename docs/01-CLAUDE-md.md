# Rehai — Guía para Claude Code

> **Lee esto en cada sesión.** Es el contrato técnico del proyecto.
> Plan completo en [`docs/00-MASTER-PLAN.md`](./docs/00-MASTER-PLAN.md).
> Sistema de diseño en [`docs/DESIGN.md`](./docs/DESIGN.md).
> Prototipo de referencia visual en [`docs/prototype-reference/`](./docs/prototype-reference/).

---

## 🎯 Qué estamos construyendo

**Rehai** = SaaS B2B vertical para clínicas de readaptación deportiva en México.

**MoveWell SLP** = cliente pivote (firmó la propuesta KonectAI por $510k MXN, financia el desarrollo). Es el primer tenant que usaremos para validar todo. **No es producto a la medida** — es el SaaS, configurado para MoveWell.

### Tres aplicaciones lógicas en un solo Next.js

1. **Marketing público** → `rehai.app` (landing del producto + booking público por tenant).
2. **App clínica** → `{tenant}.rehai.app` (fisios, recepción, dirección).
3. **Portal paciente PWA** → `{tenant}.rehai.app/portal` o `app.{tenant-domain}/portal`.
4. **Admin Rehai** → `admin.rehai.app` (super-admin KonectAI: alta de tenants, biblioteca global, billing del SaaS).

7 módulos: Agenda · EMR · Pagos+CFDI · Portal · Wearables · Reportes · Settings.

Cliente real, datos sensibles de salud, **NOM-004-SSA3 + LFPDPPP + NOM-024** son innegociables.

---

## 🏢 Multi-tenancy (núcleo del producto)

**Cada tabla por tenant lleva `organization_id`. Sin excepciones.** RLS aísla los datos.

### Resolución de tenant

- Subdominio: `movewell.rehai.app` → `tenant_slug = movewell`.
- Path prefix (dev): `localhost:3000/t/movewell`.
- Custom domain: `app.movewell.mx` → `tenant_domains` table.

Middleware Next.js resuelve el tenant antes de cualquier render. Si no hay match → 404 público o redirect a `rehai.app`.

### Reglas

1. **Toda tabla nueva** con datos de clínica → `organization_id NOT NULL` + RLS escrita en la **misma migration**.
2. **Test E2E** con 2 orgs en cada PR que toque DB. Verifica aislamiento.
3. **Service role key** solo en server actions admin, jamás en route handlers públicos sin auth.
4. **Branding** se inyecta vía `<html data-tenant="movewell">` desde server, sin client JS.

---

## 🧰 Stack (cerrado)

| Capa         | Tech                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| Framework    | **Next.js 15** App Router + TypeScript estricto                          |
| UI           | **Tailwind v4** + **shadcn/ui** (selectivo) + tokens propios (DESIGN.md) |
| DB           | **Supabase Postgres** + RLS multi-tenant                                 |
| ORM          | **Drizzle** (NO Prisma)                                                  |
| Auth         | **Supabase Auth** (magic link + 2FA TOTP)                                |
| Storage      | **Supabase Storage**                                                     |
| Server state | **TanStack Query v5**                                                    |
| Forms        | **React Hook Form + Zod**                                                |
| Pagos        | **Stripe** (con adapter para MP/Conekta)                                 |
| CFDI         | **Facturama API**                                                        |
| WhatsApp     | **Evolution API** (infra KonectAI)                                       |
| Orquestación | **n8n** (recordatorios, NPS, reseñas)                                    |
| Email        | **Resend**                                                               |
| Monitoreo    | **Sentry + Logtail**                                                     |
| Tests        | **Vitest + Playwright + Testing Library**                                |
| Hosting      | **Vercel + Supabase Cloud**                                              |

**Prohibido:** Prisma, NextAuth, Redux, Zustand, MUI, Chakra, Mantine, MongoDB.

---

## 📁 Estructura del repo

```
reha-mx/
├── app/
│   ├── (marketing)/          ← rehai.app público
│   ├── (app)/                ← {tenant}.rehai.app app clínica
│   ├── (portal)/             ← portal paciente PWA
│   ├── (admin)/              ← admin.rehai.app super-admin
│   ├── api/
│   │   ├── webhooks/         ← stripe, facturama, whatsapp
│   │   └── cron/             ← Vercel cron
│   └── layout.tsx
├── components/
│   ├── ui/                   ← shadcn primitives
│   ├── shared/               ← KPI, Card, Avatar, BranchBadge
│   ├── tenant/               ← TenantBranding, TenantSwitcher
│   ├── agenda/
│   ├── clinical/
│   ├── billing/
│   ├── portal/
│   └── charts/
├── lib/
│   ├── supabase/
│   │   ├── client.ts         ← browser
│   │   ├── server.ts         ← RSC
│   │   ├── service.ts        ← service role (solo server actions admin)
│   │   └── middleware.ts
│   ├── tenant/
│   │   ├── resolver.ts       ← host/path → tenant_slug
│   │   ├── context.ts        ← AsyncLocalStorage para tenant en server
│   │   └── branding.ts
│   ├── db/
│   │   ├── schema/           ← drizzle schemas
│   │   ├── queries/
│   │   └── migrations/
│   ├── facturama/
│   ├── stripe/
│   ├── whatsapp/
│   ├── wearables/
│   ├── auth/
│   ├── audit/
│   ├── validators/
│   └── utils/
├── server/
│   └── actions/
├── hooks/
├── types/
├── docs/
│   ├── 00-MASTER-PLAN.md
│   ├── DESIGN.md
│   ├── prototype-reference/  ← snapshot del prototipo HTML para consultar
│   ├── modulo-bootstrap.md
│   ├── modulo-agenda.md
│   └── ...
├── tests/
│   ├── unit/
│   └── e2e/
├── public/
├── drizzle.config.ts
├── next.config.ts
├── middleware.ts             ← tenant resolution + auth refresh
├── tailwind.config.ts
├── tsconfig.json
├── CLAUDE.md
└── README.md
```

---

## 🔒 Reglas no negociables

### Código

1. **TypeScript estricto.** `strict: true`, `noUncheckedIndexedAccess: true`. No `any`.
2. **Server Components por default.** `'use client'` solo con estado/eventos.
3. **Mutaciones = Server Actions** con Zod en server. TanStack Query las consume.
4. **No barrel files** (explotan el bundle).
5. **Sin try/catch defensivo.** Solo donde sí hace algo. Errores van a `error.tsx`.
6. **Imports absolutos** con `@/`.
7. **Naming:** `kebab-case.tsx`, `PascalCase`, `useCamelCase`, `xxxAction`.
8. **Tenant en context.** Server actions reciben `organizationId` desde context, no como param de cliente.

### Multi-tenant + clínico

9. **Toda tabla con datos de clínica:** `organization_id NOT NULL` + RLS en misma migration.
10. **Test E2E con 2 orgs** verifica aislamiento en cada PR que toque DB.
11. **Service role key** SOLO en server actions admin. Nunca en handlers públicos.
12. **Audit log** vía trigger Postgres en cualquier acceso a expediente clínico (incluido SELECT).
13. **Storage estudios médicos:** signed URLs ≤ 1h. Nunca URLs públicas.
14. **PII en logs:** prohibido. Usar IDs.

### UI

15. **Tokens de DESIGN.md** vía CSS vars. No hardcodear hex.
16. **Inter** UI, **JetBrains Mono** datos numéricos.
17. **Acento `#3FBCD4`** (override por tenant). Texto sobre acento = `#06101C`.
18. **Dark + light** desde día 1.
19. **Mobile ≤768px + desktop ≥1024px** verificados antes de mergear.
20. **Sin emojis decorativos.** `lucide-react` o set propio.
21. **Sin gradientes saturados.** Solo gradiente sutil del logo.

---

## 🧪 Definition of Done

- [ ] Tipos completos
- [ ] Zod en server + cliente
- [ ] RLS escrita y testeada con cada rol
- [ ] **Aislamiento multi-tenant verificado** (test 2 orgs)
- [ ] Unit test de lógica
- [ ] E2E test happy path
- [ ] Loading + error + empty
- [ ] Mobile + desktop
- [ ] Dark + light
- [ ] A11y (kbd nav, contraste AA)
- [ ] Audit log si toca clínico
- [ ] Doc en `/docs` si módulo nuevo

---

## 🚀 Comandos esenciales

```bash
# Desarrollo
pnpm dev                  # next dev (resolver tenant via /t/movewell o subdominio local)
pnpm db:generate          # drizzle-kit generate
pnpm db:push              # drizzle-kit push
pnpm db:studio
pnpm db:seed              # seed con MoveWell + 2da org de prueba

# Tests
pnpm test
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:isolation       # test específico de aislamiento multi-tenant

# Calidad
pnpm lint
pnpm typecheck
pnpm format

# Build
pnpm build
pnpm start

# Supabase local
supabase start
supabase db reset
```

---

## 🗂️ Patrón de Server Action

```ts
// server/actions/appointments.ts
'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { getTenantContext } from '@/lib/tenant/context';
import { revalidatePath } from 'next/cache';
import { auditLog } from '@/lib/audit';

const CreateAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  startsAt: z.string().datetime(),
  typeId: z.string().uuid(),
  branchId: z.string().uuid(),
});

export async function createAppointmentAction(input: z.infer<typeof CreateAppointmentSchema>) {
  const parsed = CreateAppointmentSchema.parse(input);
  const { organizationId } = await getTenantContext();
  const supabase = createServerClient();

  // organizationId NUNCA viene del cliente. Siempre del tenant context.
  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...parsed, organization_id: organizationId })
    .select()
    .single();

  if (error) throw error;

  await auditLog({
    action: 'appointment.created',
    resourceType: 'appointment',
    resourceId: data.id,
  });

  revalidatePath(`/t/${tenantSlug}/agenda`);
  return data;
}
```

**Reglas:**

- `'use server'` arriba.
- Zod schema arriba.
- `organizationId` desde context, **nunca** desde input.
- Validar antes de DB.
- `revalidatePath` después.
- `auditLog()` si toca clínico.
- Errores: lanzar; cliente los maneja con TanStack Query.

---

## 📐 Referenciar el prototipo

El prototipo HTML está en `docs/prototype-reference/`. Para portar una vista:

1. Lee el `.jsx` original en `docs/prototype-reference/views/X.jsx`.
2. Identifica: estructura, jerarquía, datos mostrados, estados.
3. Reescribe como Server Component (default) + Client Components donde haya estado.
4. Mantén tokens, tipografía, espaciado, patrones visuales.
5. **Diverge cuando shadcn/ui lo hace mejor** — Combobox, Sheet, DataTable virtualizado, Command palette.
6. Datos mock del prototipo (`docs/prototype-reference/data.jsx`) → seed de Drizzle (`lib/db/seed.ts`).

**No copies-pegues `Object.assign(window, ...)` ni el patrón Babel-standalone.** Eso es artefacto del prototipo, no del SaaS.

---

## 🌎 Localización es-MX

- Moneda: `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })`. `MXN` suffix cuando ambiguo.
- Fechas: `date-fns/locale/es-MX`.
- Hora: 24h app clínica, 12h am/pm portal.
- Vocabulario clínico real (`Tendinopatía rotuliana`, `Esguince tobillo grado II`).
- Títulos: `Dr.`, `Dra.`, `Mtro.`, `Mtra.`, `Lic.`.
- Validación RFC/CURP/CFDI con regex correcto.

---

## ⚠️ Cuándo PARAR y preguntar

- Decisión técnica que afecta multi-tenancy.
- Policy RLS ambigua.
- Campo del expediente clínico fuera de NOM-004-SSA3 que el cliente pide.
- Tocar `audit_logs` directamente (debería ser solo trigger).
- Stripe/Facturama falla en producción.
- Propuesta y realidad técnica chocan (ej: Stripe vs MP).
- Branding del tenant se sale del sistema de tokens.

**No improvises en estas zonas.** Reportá el bloqueo.

---

## 🔗 Referencias

- Repo: https://github.com/antoniorod-spec/reha-mx
- Prototipo (preservado): https://reha-mx-prototype.vercel.app
- Next.js 15: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Drizzle: https://orm.drizzle.team
- shadcn/ui: https://ui.shadcn.com
- Facturama API: https://apisandbox.facturama.com.mx/docs/swagger
