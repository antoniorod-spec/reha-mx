# Rehai — Plan maestro técnico

> Plan global del proyecto Rehai (SaaS para clínicas de readaptación deportiva).
> **MoveWell SLP es el cliente pivote** — financia el desarrollo y valida el producto.
> Léelo **antes** de cualquier prompt de fase.

**Repo:** `github.com/antoniorod-spec/reha-mx`
**Cliente pivote:** MoveWell SLP (San Luis Potosí)
**Owner:** Antonio Rodríguez de Tembleque (KonectAI.dev)
**Fecha:** 2026-04-21 · Vigencia: documento vivo

---

## 0. Posicionamiento estratégico

### 0.1 Qué es Rehai

**Rehai es el sistema operativo para clínicas de readaptación deportiva en México.** Vertical SaaS B2B con:

- App clínica (fisios, recepción, dirección).
- Portal paciente PWA con plan, citas, chat y wearables.
- Facturación CFDI 4.0 nativa, pagos en línea, recordatorios WhatsApp.
- Multi-sucursal y multi-tenant desde día 1.

### 0.2 MoveWell como Cliente Fundador

**Modelo definido:** MoveWell SLP es el **Cliente Fundador #1** del SaaS Rehai.

- ❌ **No paga** los $510k MXN de la propuesta original (se cancela).
- ✅ **Paga solo $3,500 MXN/mes** pass-through de costos operativos reales (infra, WhatsApp, CFDI).
- ✅ **Acceso vitalicio gratis** al SaaS (sin licencia, sin caducidad).
- ✅ **Soporte prioritario** + 3 features priorizadas por año en el roadmap.
- ✅ **Sus datos son suyos** (LFPDPPP), exportables en JSON + PDFs si se va.
- ❌ **No recibe código fuente, no recibe equity, no recibe revenue share.**

A cambio Rehai obtiene:

- Cliente real desde día 1 que valida el producto.
- Caso de éxito para vender al cliente #2.
- Feedback de calidad (skin in the game).

**Detalle completo en `04-modelo-cliente-fundador.md`** (anexo comercial con plantilla de contrato).

⚠️ **No empezar Fase 0 hasta que:**

1. Rehai S.A.P.I. de C.V. esté constituida (~4-6 semanas).
2. Contrato Cliente Fundador esté firmado entre Rehai y MoveWell.
3. Propuesta original KonectAI ↔ MoveWell ($510k) esté formalmente cancelada.

**Workaround:** firmar acuerdo provisional "KonectAI desarrolla por cuenta de Rehai S.A.P.I. en formación" para arrancar técnicamente antes de tener la sociedad constituida.

### 0.3 Roadmap comercial post-MoveWell

| Mes     | Objetivo                                                                                                                                                       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1–M5   | Build con MoveWell como Cliente Fundador. Discovery, Fases 0–6.                                                                                                |
| M6      | Go-live MoveWell + 30 días hipercare.                                                                                                                          |
| M7–M9   | Estabilización. **Cliente #2 paga suscripción normal** — proponer pricing público (estimado $4,500–6,500 MXN/mes según tier). 1–2 clínicas piloto en SLP/CDMX. |
| M10–M12 | Pricing público formalizado, programa de partners (fisios influencers en SLP/CDMX), referrals desde MoveWell.                                                  |
| Año 2   | 10–15 clínicas. Marketplace de protocolos. App marca blanca (tier enterprise).                                                                                 |

Este horizonte comercial **debe influenciar las decisiones técnicas desde hoy**:

- Multi-tenant duro desde día 1 (no parchear después).
- Branding configurable por tenant (logo, colores secundarios, dominio).
- Catálogos clínicos editables por tenant (protocolos, evaluaciones).
- Datos de cada tenant **completamente aislados** (RLS por `organization_id`).
- Pricing engine diferenciado por tenant (MoveWell free, otros pagan).

---

## 1. Estrategia de repo

### 1.1 Decisión: branch `app-real` en `antoniorod-spec/reha-mx`

El prototipo actual (HTML + Babel standalone, 13 views) **no se borra**. Se preserva como referencia visual viva:

```
reha-mx (repo)
├── main                ← branch actual con el prototipo (intocable durante build)
├── prototype           ← se crea desde main hoy, queda como museo
└── app-real            ← branch nueva donde vive el SaaS real
```

**Plan:**

1. **Hoy:** desde `main`, crear branch `prototype` (snapshot del estado actual). Tag `v0.1.0-prototype`.
2. **Hoy:** crear branch `app-real` desde `main`. Borrar todo (excepto `.git`, `LICENSE`, `.gitignore`, `vercel.json`). Empezar Next.js limpio.
3. **Cuando `app-real` esté en Fase 0 cerrada:** se hace PR `app-real → main`. La nueva `main` queda con el SaaS real.
4. **`prototype`** queda accesible en `reha-mx-prototype.vercel.app` como demo visual viva.
5. **`main` (SaaS real)** queda en `rehai.app` o `app.rehai.app` cuando haya dominio.

Vercel: el proyecto actual (`reha-mx.vercel.app`) se renombra a `reha-mx-prototype` y apunta a branch `prototype`. Se crea proyecto nuevo `reha-mx` apuntando a `main` (futura) / `app-real` (hoy).

### 1.2 Estructura del repo final (post-Fase 0)

```
reha-mx/
├── app/                          ← Next.js 15 app
│   ├── (marketing)/              ← landing pública rehai.app
│   ├── (app)/                    ← app clínica (fisios, recepción, dirección)
│   ├── (portal)/                 ← portal paciente PWA
│   └── api/
├── components/
├── lib/
├── server/
├── docs/
│   ├── 00-MASTER-PLAN.md         ← este documento
│   ├── DESIGN.md                 ← sistema de diseño (heredado del prototipo)
│   ├── modulo-*.md               ← uno por módulo, generado al cerrar cada fase
│   └── prototype-reference/      ← snapshot del prototipo HTML (dashboard.jsx, agenda.jsx, etc.)
├── tests/
├── CLAUDE.md
├── README.md
└── package.json
```

**Importante:** copiar los `.jsx` del prototipo a `docs/prototype-reference/` para que Claude Code los pueda leer cuando necesite portar una vista, sin tener que cambiar de branch.

---

## 2. Decisiones de stack (cerradas)

### 2.1 Stack final

| Capa             | Decisión                              | Por qué                                                                                                |
| ---------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Framework**    | Next.js 15 (App Router)               | SSR para SEO público (rehai.app landing), RSC para portales pesados en datos, mismo runtime sirve PWA. |
| **Runtime**      | Node 20 LTS                           | Estable, Vercel-friendly, Edge runtime donde aplique.                                                  |
| **TS**           | TypeScript estricto                   | `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.                                    |
| **UI**           | Tailwind v4 + shadcn/ui (selectivo)   | Tokens del prototipo via CSS vars + `@theme`.                                                          |
| **DB**           | Postgres vía Supabase                 | Único managed Postgres con RLS, auth, storage, realtime.                                               |
| **ORM**          | **Drizzle**                           | Genera SQL transparente, compatible con RLS, sin abstracción que choque con policies.                  |
| **Auth**         | Supabase Auth                         | Magic link + 2FA TOTP. Roles vía custom claims + RLS.                                                  |
| **Storage**      | Supabase Storage                      | Estudios médicos cifrados, signed URLs ≤ 1h.                                                           |
| **Server state** | TanStack Query v5                     | Cache, optimistic updates, infinite queries.                                                           |
| **Forms**        | React Hook Form + Zod                 | Validación end-to-end compartida server/client.                                                        |
| **Pagos**        | Stripe + adapter pattern              | Stripe default; adapter MercadoPago/Conekta listo.                                                     |
| **CFDI**         | Facturama API                         | Como propuesta. SDK propio en `lib/facturama/`.                                                        |
| **WhatsApp**     | Evolution API (KonectAI)              | Más barato y flexible que Meta Cloud para flujos n8n.                                                  |
| **Orquestación** | n8n self-hosted                       | Recordatorios, NPS, reseñas. Nunca lógica crítica.                                                     |
| **Email**        | Resend                                | Magic links, recibos, facturas.                                                                        |
| **Hosting**      | Vercel Pro + Supabase Pro             | Como propuesta.                                                                                        |
| **Monitoreo**    | Sentry + Vercel Analytics + Logtail   | Errores + performance + logs.                                                                          |
| **Tests**        | Vitest + Playwright + Testing Library | Unit + E2E + componentes.                                                                              |
| **CI**           | GitHub Actions                        | Lint + typecheck + test + preview Vercel.                                                              |

### 2.2 Lo que NO va

- ❌ Prisma (conflicto sutil con RLS).
- ❌ NextAuth (Supabase Auth ya cubre todo).
- ❌ Redux/Zustand (TanStack Query + Context si hace falta).
- ❌ MUI/Chakra/Mantine (chocan con tokens propios).
- ❌ MongoDB (datos clínicos son relacionales).
- ❌ Vercel Postgres/Neon como primario (perdés RLS+storage integrado).

### 2.3 Variables de entorno mínimas

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # solo server, jamás cliente

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Facturama
FACTURAMA_API_USER=
FACTURAMA_API_PASSWORD=
FACTURAMA_ENV=sandbox               # sandbox | production

# WhatsApp (Evolution)
EVOLUTION_API_URL=
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE=

# Resend
RESEND_API_KEY=

# n8n
N8N_WEBHOOK_BASE=
N8N_WEBHOOK_SECRET=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_TENANT_DEFAULT=movewell  # tenant default en dev
NODE_ENV=development
```

---

## 3. Multi-tenancy (núcleo del producto)

### 3.1 Modelo

Un solo Postgres, datos aislados por **`organization_id`** vía RLS. Cada tenant tiene:

- `organizations` — la entidad raíz (ej: `MoveWell SLP`, `Clínica Rehab Polanco`).
- `branches` — sus sucursales.
- `members` — usuarios con rol dentro de la org.
- Datos clínicos, citas, pagos, etc. — todo con `organization_id` y RLS.

### 3.2 Resolución de tenant

Tres mecanismos, en orden de precedencia:

1. **Subdominio:** `movewell.rehai.app` → `tenant_slug = movewell`.
2. **Path prefix** (fallback dev): `rehai.app/t/movewell`.
3. **Custom domain:** `app.movewell.mx` → resuelve a `tenant_slug = movewell` vía tabla `tenant_domains`.

Middleware Next.js inspecciona host + path → resuelve `tenant_slug` → consulta `organizations` → set en context. Si no hay match → 404 público o redirect a `rehai.app`.

### 3.3 Branding por tenant

Tabla `tenant_branding`:

- `logo_url`, `logo_dark_url`
- `accent_color` (default `#3FBCD4`)
- `accent_color_text` (default `#06101C`)
- `font_family_override` (raro, default Inter)
- `email_from` (`citas@movewell.mx`)
- `whatsapp_business_name`

CSS variables se inyectan en `<html data-tenant="movewell">` desde el server, así dark/light + branding por tenant funciona sin client JS.

### 3.4 Datos compartidos vs por tenant

| Datos                  | Scope                                | Notas                                                                                |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| `users` (auth.users)   | Global (Supabase)                    | Un user puede pertenecer a múltiples orgs vía `members`.                             |
| `exercise_library`     | Global (Rehai) + override por tenant | Biblioteca base + ejercicios custom del tenant.                                      |
| `assessment_templates` | Global + override                    | 8 escalas estándar (Y-Balance, EVA, etc.) precargadas. Tenant puede crear las suyas. |
| `protocols`            | Por tenant                           | Cada clínica define sus protocolos.                                                  |
| `clinical_records`     | Por tenant                           | Aislamiento RLS estricto.                                                            |
| `audit_logs`           | Por tenant                           | Append-only via trigger.                                                             |

---

## 4. Arquitectura de la aplicación

### 4.1 Single Next.js, tres route groups

```
app/
├── (marketing)/                   ← rehai.app público
│   ├── page.tsx                   ← landing del producto
│   ├── precios/
│   ├── clinicas/                  ← directorio público (opt-in por tenant)
│   ├── docs/                      ← docs del producto
│   └── booking/[tenant]/          ← booking público sin login
│
├── (app)/                         ← app clínica
│   ├── login/
│   ├── dashboard/
│   ├── agenda/
│   ├── pacientes/[id]/
│   ├── protocolos/
│   ├── pagos/
│   ├── facturacion/
│   ├── reportes/
│   ├── equipo/
│   ├── sucursales/
│   └── configuracion/
│
├── (portal)/                      ← portal paciente PWA
│   ├── inicio/
│   ├── plan/
│   ├── citas/
│   ├── nutricion/
│   └── yo/
│
├── (admin)/                       ← admin Rehai (super-admin KonectAI)
│   ├── tenants/                   ← alta de clínicas
│   ├── exercise-library/          ← biblioteca global
│   └── billing/                   ← billing del SaaS (suscripciones de las clínicas)
│
└── api/
    ├── webhooks/
    └── cron/
```

**4 contextos lógicos en un solo deployment**, con layouts y auth distintos.

### 4.2 Modelo de datos núcleo (alto nivel — detalle en Fase 0)

**Tablas globales (sin `organization_id`):**

- `organizations`, `tenant_domains`, `tenant_branding`, `tenant_subscriptions`
- `members` (un user → muchas orgs con rol)
- `exercise_library_global`, `assessment_templates_global`
- `audit_logs_admin` (auditoría de Rehai super-admin)

**Tablas por tenant (con `organization_id` + RLS):**

- `branches`, `rooms`, `resources`
- `practitioners` (extiende `members` con specialty + licencia)
- `patients`, `patient_emergency_contacts`
- `appointment_types`, `appointments`, `appointment_reminders`, `waitlist`
- `clinical_records`, `assessments`, `assessment_results`, `soap_notes`
- `studies`, `study_annotations`, `consents`, `diagnoses`
- `protocols`, `protocol_exercises`, `patient_protocols`
- `exercise_library_tenant` (overrides del tenant)
- `payments`, `invoices`, `packages`, `package_redemptions`, `memberships`, `coupons`
- `wearable_connections`, `wearable_metrics`
- `conversations`, `messages`, `notifications`
- `audit_logs`

### 4.3 RLS — política base

Toda tabla por tenant lleva `organization_id`. Policies estándar:

```sql
-- Lectura: solo si user es miembro activo de esa org
CREATE POLICY "tenant_isolation_select" ON appointments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Pacientes solo ven sus propios datos
CREATE POLICY "patient_self_only" ON appointments
  FOR SELECT USING (
    patient_id = (SELECT patient_id FROM members WHERE user_id = auth.uid())
    OR
    organization_id IN (SELECT organization_id FROM members WHERE user_id = auth.uid() AND role IN ('admin','director','practitioner','reception'))
  );

-- audit_logs: append-only
CREATE POLICY "audit_insert_only" ON audit_logs
  FOR INSERT WITH CHECK (true);
-- sin SELECT directo: queries van vía función SECURITY DEFINER
```

**Reglas:**

1. Cada tabla nueva → policy escrita en la misma migration.
2. Test E2E con 2 orgs verifica aislamiento.
3. Service role key **solo** en server actions admin, jamás expuesta.

### 4.4 Convenciones de código

- **TypeScript estricto, sin `any`.** Si hay que escapar → `unknown` + type guard.
- **Server Components por default.** `'use client'` solo con estado/eventos.
- **Mutaciones = Server Actions.** Zod en server, TanStack Query en cliente.
- **Naming:**
  - Archivos `kebab-case.tsx`
  - Componentes `PascalCase`
  - Hooks `useCamelCase`
  - Server actions con sufijo `Action` (`createAppointmentAction`)
- **Imports absolutos** con `@/`.
- **No barrel files.**
- **Comentarios:** español para negocio (clínico, fiscal), inglés para técnico puro.

---

## 5. Plan de fases

| Fase  | Semanas | Objetivo                                      | Demo verificable                                             |
| ----- | ------- | --------------------------------------------- | ------------------------------------------------------------ |
| **0** | S1–S2   | Discovery + bootstrap técnico + multi-tenancy | Login en `movewell.rehai.app`, ver dashboard vacío           |
| **1** | S3–S6   | Agenda + CRM                                  | Crear cita, recordatorio WhatsApp 24h/2h, vista semana       |
| **2** | S7–S10  | EMR clínico                                   | Expediente con SOAP, evaluaciones, consentimientos, estudios |
| **3** | S11–S13 | Pagos + CFDI                                  | Cobro Stripe, CFDI Facturama, paquetes, membresías           |
| **4** | S14–S16 | Portal paciente PWA                           | Plan con video, registro diario, chat asíncrono              |
| **5** | S17–S19 | Wearables + dashboards                        | Apple Health/Garmin/Whoop, dashboards ejecutivos             |
| **6** | S20–S21 | Capacitación + go-live                        | Migración datos, training, hipercare 2 semanas               |

**Nuevo en Fase 0 vs propuesta original:** multi-tenancy + tenant resolver. Esto **no** suma tiempo significativo si se hace al inicio; sí lo suma (mucho) si se parchea después.

### 5.1 Reglas de paso de fase

Una fase está cerrada cuando:

1. ✅ Tests E2E críticos pasan en CI.
2. ✅ Demo a MoveWell, firma de aceptación parcial.
3. ✅ Sentry sin errores `error`/`fatal` abiertos.
4. ✅ Módulo en staging con datos de prueba.
5. ✅ `docs/modulo-X.md` actualizado.
6. ✅ Aislamiento multi-tenant verificado con 2 orgs de prueba.

---

## 6. Estrategia de UI/UX

### 6.1 El prototipo como fuente de verdad visual

Las 13 views del prototipo (`prototype-reference/`) son **la spec visual**. Para cada vista del SaaS real:

1. Claude Code lee el `.jsx` correspondiente del prototipo.
2. Identifica: estructura, jerarquía visual, datos mostrados, estados.
3. Reescribe como Server Components + Client Components donde aplique.
4. Mantiene tokens, tipografía, espaciado, patrones (KPI, Card, Avatar, etc.).
5. **Diverge cuando shadcn/ui hace mejor el trabajo:** Combobox, Command palette, DataTable virtualizado, Sheet lateral.

### 6.2 Tokens de diseño (heredados de DESIGN.md)

Mapeados a CSS vars Tailwind v4:

```css
@theme {
  --color-bg: #06101c;
  --color-surface: #0a1825;
  --color-surface-2: #0f2030;
  --color-border: #15293c;
  --color-text: #f0f7fb;
  --color-muted: #9bb3c4;
  --color-subtle: #5f7b91;
  --color-accent: #3fbcd4;
  --color-good: #34d399;
  --color-bad: #f87171;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

[data-theme='light'] {
  /* overrides */
}
[data-tenant='movewell'] {
  --color-accent: #3fbcd4;
} /* default Reha */
```

### 6.3 Reglas no negociables

- Inter para UI, JetBrains Mono para datos numéricos.
- Acento `#3FBCD4` (override por tenant). Texto sobre acento siempre `#06101C`.
- Dark + light desde día 1.
- Mobile-first en portal, desktop-first en app clínica.
- Sin emojis decorativos. Iconografía con `lucide-react` o set propio.
- Sin gradientes saturados. Solo gradiente sutil del logo `#1B3A5C → #3FBCD4`.

---

## 7. Compliance y seguridad

### 7.1 LFPDPPP + NOM-004-SSA3 + NOM-024

- **Aviso de privacidad** firmado en onboarding paciente, versionado en DB.
- **Consentimiento explícito** para tratamiento de datos sensibles de salud.
- **Audit logs** append-only de cualquier acceso a expediente clínico.
- **Conservación 5 años** del expediente clínico (NOM-004-SSA3, art. 6).
- **Derecho ARCO** (Acceso, Rectificación, Cancelación, Oposición) en `/yo/privacidad`.
- **NOM-024** (interoperabilidad de expedientes electrónicos) — exportar HL7 FHIR R4 en backlog post go-live.

### 7.2 Seguridad técnica

- TLS 1.3 forzado.
- Cifrado en reposo AES-256 (Supabase nativo).
- Tokens wearables cifrados con `pgsodium` antes de guardar.
- Rate limiting en endpoints públicos (booking, magic link).
- CSP estricto + HSTS en headers.
- 2FA TOTP obligatorio para roles admin/director.
- Pen-test antes del go-live (incluido en Fase 6).
- Service role key rotación cada 90 días.

### 7.3 Backups

- Supabase PITR — 7 días en plan Pro.
- Backup diario adicional a S3 con retención 30 días.
- DR drill mensual: restaurar a staging y verificar.

---

## 8. Definition of Done por feature

1. Tipos TypeScript completos, sin `any`.
2. Validación Zod en server action + client form.
3. RLS policy escrita y testeada con cada rol.
4. Aislamiento multi-tenant verificado (test con 2 orgs).
5. Unit test de lógica de negocio.
6. E2E test del happy path.
7. Estados loading + error + empty.
8. Mobile (≤768px) + desktop (≥1024px).
9. Dark + light themes.
10. Keyboard nav + aria-labels + contraste AA.
11. Audit log emitido si toca clínico.
12. Documentación en `/docs` si es módulo nuevo.

---

## 9. Riesgos y mitigaciones

| Riesgo                                                                                       | Prob. | Impacto | Mitigación                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------- | ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MoveWell rechaza modelo Cliente Fundador y exige cumplir propuesta original ($510k + código) | Baja  | Crítico | El modelo Cliente Fundador es radicalmente mejor para MoveWell ($966k de ahorro en 5 años + producto vivo). Si rechazan: fallback a sistema mono-tenant custom según propuesta original — replannear todo el master plan sin multi-tenancy. |
| Rehai S.A.P.I. tarda más de 6 semanas en constituirse                                        | Media | Medio   | Acuerdo provisional "KonectAI por cuenta de Rehai en formación" para arrancar Fase 0 antes. Cesión automática al constituirse.                                                                                                              |
| Multi-tenancy parcheado mal (filtraciones cross-tenant)                                      | Media | Crítico | RLS desde día 1, test E2E con 2 orgs en cada PR, auditoría de seguridad antes de tener segundo tenant.                                                                                                                                      |
| Facturama API caída en hora pico                                                             | Media | Alto    | Cola de reintentos en n8n, CFDI bajo demanda con feedback.                                                                                                                                                                                  |
| WhatsApp rate limit                                                                          | Media | Medio   | Distribución horaria, fallback SMS Twilio.                                                                                                                                                                                                  |
| Cliente cambia alcance Fase 4                                                                | Alta  | Medio   | Orden de cambio formal.                                                                                                                                                                                                                     |
| Migración datos Excel pre-existente MoveWell                                                 | Alta  | Alto    | Discovery dedica 2 días a auditar formato actual.                                                                                                                                                                                           |
| Pen-test descubre vulnerabilidad crítica                                                     | Baja  | Alto    | Pen-test en S19, 2 semanas de buffer pre go-live.                                                                                                                                                                                           |
| Equipo MoveWell no adopta el sistema                                                         | Media | Crítico | Capacitación presencial + hipercare 2 semanas + champion interno.                                                                                                                                                                           |
| Wearables cambian APIs (Apple)                                                               | Media | Medio   | Adapter pattern, sin acoplar a un solo SDK.                                                                                                                                                                                                 |

---

## 10. Decisiones que se difieren a Discovery

- ¿Cuántas sucursales reales tiene MoveWell hoy?
- ¿Pasarela final: Stripe vs Mercado Pago vs Conekta? (recomendación Stripe).
- ¿Qué wearables son prioritarios? (todos vs solo Apple+Garmin).
- ¿Equipo de isoinercia con API? (cambia alcance del expediente).
- ¿Migración desde sistema previo o tabula rasa?
- ¿MoveWell tiene logo y manual de marca propios o adopta branding Rehai?
- ¿Subdominio `movewell.rehai.app` o custom domain `app.movewell.mx` desde día 1?
- **Crítico — pre Fase 0:**
  - ¿Rehai S.A.P.I. está constituida?
  - ¿Contrato Cliente Fundador firmado entre Rehai y MoveWell?
  - ¿Propuesta KonectAI ↔ MoveWell ($510k) formalmente cancelada (sin anticipo cobrado)?

---

## 11. Cómo usar este plan

1. **Plan global = este archivo.** Va a `docs/00-MASTER-PLAN.md` en branch `app-real`.
2. **CLAUDE.md** del repo (`01-CLAUDE-md.md`) — Claude Code lo lee en cada sesión.
3. **Prompts por fase** (`02-fase-0-prompt.md` a `03-fases-1-a-6-prompts.md`) — pegar al iniciar cada fase.
4. **Workflow:**
   - Sesión 1 con prompt Fase 0 → al cerrar, merge `app-real → main`.
   - Sesión nueva por cada fase con su prompt.
   - Cada PR pasa CI (lint + typecheck + test + E2E + Vercel preview).

---

**Última actualización:** 2026-04-21
