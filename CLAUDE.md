@AGENTS.md

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

| Capa         | Tech                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Framework    | **Next.js 16** App Router + TypeScript estricto (master plan decía 15, usamos 16 — ver `docs/modulo-bootstrap.md`) |
| UI           | **Tailwind v4** + **shadcn/ui** (selectivo) + tokens propios (DESIGN.md)                                           |
| DB           | **Supabase Postgres self-hosted en dedi35661** + RLS multi-tenant                                                  |
| ORM          | **Drizzle** (NO Prisma)                                                                                            |
| Auth         | **Supabase Auth** (magic link + 2FA TOTP)                                                                          |
| Storage      | **Supabase Storage**                                                                                               |
| Server state | **TanStack Query v5**                                                                                              |
| Forms        | **React Hook Form + Zod**                                                                                          |
| Pagos        | **Stripe** (con adapter para MP/Conekta)                                                                           |
| CFDI         | **Facturama API**                                                                                                  |
| WhatsApp     | **Evolution API** (infra KonectAI)                                                                                 |
| Orquestación | **n8n** (recordatorios, NPS, reseñas)                                                                              |
| Email        | **Resend**                                                                                                         |
| Monitoreo    | **Sentry + Logtail**                                                                                               |
| Tests        | **Vitest + Playwright + Testing Library**                                                                          |
| Hosting      | **Vercel + Supabase self-hosted**                                                                                  |

**Prohibido:** Prisma, NextAuth, Redux, Zustand, MUI, Chakra, Mantine, MongoDB.

---

## 📁 Estructura del repo

```
reha-mx/
├── app/                      ← App Router (creado en bootstrap, módulos pendientes)
├── components/               ← (pendiente Paso 3)
├── lib/                      ← (pendiente Paso 3)
├── server/actions/           ← (pendiente Paso 3)
├── docs/
│   ├── 00-MASTER-PLAN.md
│   ├── 01-CLAUDE-md.md
│   ├── DESIGN.md
│   ├── prototype-reference/  ← snapshot del prototipo HTML para consultar
│   └── ...
├── public/
├── tests/                    ← (pendiente Paso 11)
├── next.config.ts
├── tsconfig.json
├── tailwind.config (CSS-based en v4)
├── eslint.config.mjs
├── package.json              ← name: "reha-mx"
├── pnpm-lock.yaml
├── pnpm-workspace.yaml       ← ignoredBuiltDependencies (sharp, unrs-resolver)
├── CLAUDE.md
├── AGENTS.md                 ← disclaimer Next.js 16 (auto-generado)
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
pnpm db:generate          # drizzle-kit generate (Paso 7)
pnpm db:push              # drizzle-kit push
pnpm db:studio
pnpm db:seed              # seed con MoveWell + 2da org de prueba

# Tests (pendiente Paso 11)
pnpm test
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:isolation

# Calidad
pnpm lint
pnpm typecheck
pnpm format

# Build
pnpm build
pnpm start

# Postgres directo (vía SSH tunnel a dedi35661)
ssh -fN -L 5432:localhost:5432 antonio@dedi35661   # abrir tunnel
pnpm db:migrate                                     # correr migrations
```

---

## 🌎 Localización es-MX

- Moneda: `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })`. `MXN` suffix cuando ambiguo.
- Fechas: `date-fns/locale/es-MX`.
- Hora: 24h app clínica, 12h am/pm portal.
- Vocabulario clínico real (`Tendinopatía rotuliana`, `Esguince tobillo grado II`).
- Títulos: `Dr.`, `Dra.`, `Mtro.`, `Mtra.`, `Lic.`.
- Validación RFC/CURP/CFDI con regex correcto.
- **Idioma de respuesta a Antonio:** español de México (tú/tienes/configuras), no Argentina ni España.

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
- Prototipo (preservado en branch `prototype`, tag `v0.1.0-prototype`): https://reha-mx-prototype.vercel.app (post Paso 13)
- Supabase self-hosted: https://reha.antoniotembleque.com (vía Cloudflare Zero Trust)
- Next.js 16: ver `node_modules/next/dist/docs/` (training data puede estar desactualizado — ver `AGENTS.md`)
- Supabase: https://supabase.com/docs
- Drizzle: https://orm.drizzle.team
- shadcn/ui: https://ui.shadcn.com
- Facturama API: https://apisandbox.facturama.com.mx/docs/swagger
