# Prompt: Fase 0 — Discovery & Bootstrap técnico

> Pegá esto como **primer mensaje** a Claude Code.
> Trabajamos sobre el repo existente `antoniorod-spec/reha-mx`, en una branch nueva `app-real`.
> El prototipo actual se preserva en branch `prototype` antes de empezar.

---

## 🎬 Mensaje a Claude Code

```
Vamos a construir Reha.mx — SaaS B2B para clínicas de readaptación deportiva en México. MoveWell SLP es el cliente pivote (firmó propuesta KonectAI por $510k MXN, financia el desarrollo y es el primer tenant). Hoy ejecutamos la **Fase 0: Discovery + Bootstrap técnico + Multi-tenancy**.

## Contexto

Estamos parados en el repo `antoniorod-spec/reha-mx`, branch `main`. Esa branch tiene el **prototipo HTML estático** (Babel standalone + Tailwind CDN, 13 views) que ya le mostramos al cliente y está deployado en `reha-mx.vercel.app`.

**El prototipo NO se borra.** Es la fuente de verdad visual del SaaS real.

## Lectura obligatoria (en orden)

1. `docs/00-MASTER-PLAN.md` — plan maestro completo
2. `CLAUDE.md` — contrato técnico
3. `docs/DESIGN.md` — sistema de diseño heredado del prototipo

Si alguno no está en la branch actual, decímelo. No avances hasta confirmarlo.

## Paso 0: Preservar el prototipo (antes de tocar código nuevo)

Ejecutá estos pasos en orden y reportá después de cada uno:

```bash
# 1. Asegurarte de estar en main actualizado
git checkout main
git pull origin main

# 2. Crear branch prototype como snapshot
git checkout -b prototype
git push -u origin prototype
git tag v0.1.0-prototype
git push origin v0.1.0-prototype

# 3. Volver a main y crear app-real
git checkout main
git checkout -b app-real
git push -u origin app-real
```

**Después decímelo.** Yo confirmo que el prototipo quedó preservado y procedés con el cleanup.

## Paso 1: Cleanup en branch app-real

Estás en `app-real`. Borrá el prototipo de aquí (queda vivo en `prototype`):

```bash
# Mover los .jsx del prototipo a docs/prototype-reference/ (referencia visual)
mkdir -p docs/prototype-reference/{views,components}
git mv src/views/*.jsx docs/prototype-reference/views/
git mv src/*.jsx docs/prototype-reference/
git mv components/*.jsx docs/prototype-reference/components/

# Borrar archivos del prototipo que no aplican al SaaS
rm -f index.html Reha.mx.html Reha.mx.bundled.html
rmdir src components 2>/dev/null || true

# Mantener: vercel.json, .gitignore, LICENSE (si existe), README

git add .
git commit -m "chore: preserve prototype as reference, clean main for SaaS"
```

**Reportá:** qué quedó en la branch después del cleanup. Yo confirmo y procedés con bootstrap.

## Paso 2: Bootstrap Next.js 15

```bash
pnpm create next-app@latest . --typescript --tailwind --app --no-src --import-alias "@/*" --turbopack
```

Si pregunta por overwrite de archivos existentes, **NO sobrescribas** `vercel.json`, `LICENSE`, `README.md`, `docs/`, `.gitignore`.

Después configurá:

- `tsconfig.json` con `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- ESLint flat config + Prettier + lint-staged + Husky + commitlint convencional.
- `.editorconfig` y `.nvmrc` (Node 20 LTS).
- `pnpm` como package manager.

## Paso 3: Estructura de carpetas

Creá toda la estructura del repo con `.gitkeep` donde haga falta (ver `CLAUDE.md` sección "Estructura del repo"):

```
app/(marketing)/, app/(app)/, app/(portal)/, app/(admin)/, app/api/{webhooks,cron}/
components/{ui,shared,tenant,agenda,clinical,billing,portal,charts}
lib/{supabase,tenant,db/{schema,queries,migrations},facturama,stripe,whatsapp,wearables,auth,audit,validators,utils}
server/actions
hooks, types, tests/{unit,e2e}
```

## Paso 4: Sistema de diseño portado (clave: leer `docs/prototype-reference/` antes)

- `app/globals.css` con CSS variables del tema dark + light, mapeadas según `DESIGN.md`.
- `tailwind.config.ts` con `@theme` consumiendo esas variables.
- Fuentes Inter + JetBrains Mono via `next/font/google`.
- `components/shared/`:
  - `card.tsx` — Card primitive
  - `kpi.tsx` — KPI con delta (basado en patrón del prototipo)
  - `branch-badge.tsx`
  - `avatar-initials.tsx`
  - `theme-toggle.tsx`
- `app/(showcase)/page.tsx` (privada, no en prod) que renderice todos los primitives en dark+light para QA visual.

**Importante:** lee `docs/prototype-reference/views/dashboard.jsx` para entender los patrones de KPI y card antes de escribir los primitives.

## Paso 5: Multi-tenancy (CRÍTICO — esto define la arquitectura)

### Schema base
- `lib/db/schema/organizations.ts` — `id`, `slug` (unique), `name`, `created_at`, `subscription_status`.
- `lib/db/schema/tenant-domains.ts` — `domain` → `organization_id`, para custom domains.
- `lib/db/schema/tenant-branding.ts` — logo, accent_color, email_from, etc.
- `lib/db/schema/members.ts` — `user_id` (auth.users) ↔ `organization_id` ↔ `role` ↔ `status`.

### Resolver
- `lib/tenant/resolver.ts` — función que recibe `host` + `pathname` y devuelve `tenant_slug`:
  - Si subdomain (no `www`, no vacío): subdomain = slug.
  - Si path empieza con `/t/[slug]`: extraer slug.
  - Si host está en `tenant_domains`: lookup.
  - Si nada: null (público).
- `lib/tenant/context.ts` — AsyncLocalStorage para mantener `{ organizationId, tenantSlug, branding }` por request.
- `middleware.ts` raíz — resuelve tenant + refresca sesión Supabase + setea context.

### Test de aislamiento
- `tests/e2e/multi-tenant.spec.ts` — crea 2 orgs, 2 users (uno en cada), verifica que user A no puede leer datos de org B con ningún query.

## Paso 6: Supabase + Auth

Asumí que YO te paso credenciales de un proyecto Supabase vacío. **Pedímelas explícitamente como variables de entorno antes de avanzar.**

- `lib/supabase/{client,server,service,middleware}.ts` con los 3 clientes.
- Auth con magic link + 2FA TOTP:
  - `app/(app)/login/page.tsx`
  - `app/auth/callback/route.ts`
  - `app/(app)/setup-2fa/page.tsx`
- Resend integrado para enviar el magic link.

## Paso 7: Drizzle

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

- `drizzle.config.ts` apuntando a Supabase (con dos URLs: una para migrations con service role, otra runtime con anon).
- Schema base: `organizations`, `tenant_domains`, `tenant_branding`, `members`, `audit_logs` (genérico, append-only via trigger).
- Migrations generadas con `drizzle-kit generate`.
- Comandos en `package.json`: `db:generate`, `db:push`, `db:migrate`, `db:studio`, `db:seed`.

## Paso 8: RLS base

`lib/db/migrations/0001_rls.sql`:
- SELECT/INSERT/UPDATE en cada tabla por tenant: `organization_id IN (SELECT organization_id FROM members WHERE user_id = auth.uid() AND status='active')`.
- `audit_logs`: solo INSERT vía trigger, sin SELECT directo (queries vía función `SECURITY DEFINER`).
- Test SQL en `tests/unit/rls.test.ts` que crea 2 orgs, 2 users, verifica aislamiento con `set request.jwt.claim.sub = 'user_id'`.

## Paso 9: Audit log helper

- `lib/audit/index.ts` con `auditLog({ action, resourceType, resourceId, metadata? })`.
- Trigger Postgres genérico para tablas con prefijo `clinical_*` (aún no existen, pero el trigger queda listo).
- Test que verifica que un acceso a expediente genera entry.

## Paso 10: Seed de datos

`lib/db/seed.ts` con:
- **Org 1: MoveWell SLP** (slug `movewell`)
  - 1 sucursal: `MoveWell Centro`
  - 3 users: 1 admin (Antonio), 1 fisio (Dra. Paulina Granados), 1 recepción (Lic. Karla Méndez)
- **Org 2: Demo Rehab** (slug `demo`) — solo para tests de aislamiento, no para demo real
  - 1 sucursal, 1 admin, 1 fisio
- Branding default Reha.mx para ambas (cyan #3FBCD4).
- Magic link funciona contra los users.

`pnpm db:seed` debe ser idempotente.

## Paso 11: Testing infra

- `vitest.config.ts` con happy-dom.
- `playwright.config.ts` con projects chromium + mobile.
- E2E mínimos:
  - Login con magic link → dashboard vacío → logout.
  - User de Org A no puede acceder a `/t/demo` siendo miembro de `movewell`.
- CI workflow `.github/workflows/ci.yml`: install → lint → typecheck → test → playwright → comment preview Vercel URL en PR.

## Paso 12: Sentry + Logtail

- `pnpm add @sentry/nextjs`
- Configurar tres archivos `sentry.{client,server,edge}.config.ts`.
- DSN en env, redactado de logs públicos.
- Logtail con pino + `@logtail/pino`.

## Paso 13: Deploy a Vercel

- Renombrar el proyecto Vercel actual `reha-mx` → `reha-mx-prototype`, apuntar a branch `prototype`.
- Crear proyecto Vercel nuevo `reha-mx`, apuntar a branch `app-real` (luego `main`).
- `vercel.json` con headers de seguridad estrictos (CSP, HSTS, X-Frame-Options, Permissions-Policy).
- Variables de entorno en `.env.example` (todas las del Master Plan §2.3).
- Branch `app-real` → preview Vercel; cuando se hace PR a `main` → producción.

## Paso 14: Documentación

`docs/modulo-bootstrap.md`:
- Decisiones tomadas en Fase 0.
- Cómo correr el proyecto (incluyendo cómo simular subdomain en dev: `/t/movewell` en localhost).
- Cómo crear un usuario de prueba.
- Cómo agregar nueva tabla con RLS.
- Cómo agregar un tenant nuevo (proceso manual por ahora, automatizado en Fase 6).
- Convenciones de commits.

Actualizar `README.md` raíz con descripción del SaaS y link al prototipo preservado.

## Cómo trabajar

1. **Pausá después de cada paso (1–14)** y reportá: "✅ Hecho X — siguiente Y, ¿procedo?"
2. **Antes del Paso 0**, dame tu resumen de los 3 docs que leíste y las preguntas.
3. **Si algo del Master Plan se siente mal en la práctica**, decímelo con justificación. No improvises silenciosamente.
4. **Commit incremental**: un commit por paso, mensaje convencional.
5. **Antes de tocar DB**, escribí la policy RLS. Sin excepciones.
6. **Sin TODOs ocultos.** Pendientes a `docs/backlog-fase-0.md` con razón.

## Preguntas que necesito que me hagas ANTES del Paso 0

Listame estas con respuestas por defecto sugeridas. Yo confirmo o corrijo:

1. ¿Tenés acceso al repo `antoniorod-spec/reha-mx` con permisos de push? (necesitás credenciales git válidas).
2. ¿Proyecto Supabase: vacío que YO creo, o lo creás vos via CLI?
3. ¿Cuenta Vercel: la que ya tiene el prototipo (`antoniorod-spec`) o KonectAI org?
4. ¿Dominio: `reha.mx` ya comprado? ¿`movewell.reha.mx` apunta a Vercel?
5. ¿Tier Supabase: Free para empezar o Pro desde día 1?
6. ¿Datos pre-existentes en MoveWell (Excel actual) o tabula rasa?
7. ¿Branding final MoveWell: usa el de Reha.mx por defecto o tiene logo y paleta propios?
8. **Crítico:** ¿Reha.mx S.A.P.I. de C.V. está constituida y el contrato Cliente Fundador ya está firmado con MoveWell? (Ver `04-modelo-cliente-fundador.md`). Si todavía no — ¿hay acuerdo provisional firmado "KonectAI desarrolla por cuenta de Reha.mx S.A.P.I. en formación"? Si tampoco, paramos hasta resolverlo.

## Criterios de cierre de Fase 0

La fase termina cuando puedo:
- [ ] Ver branch `prototype` en GitHub con tag `v0.1.0-prototype`
- [ ] Ver `reha-mx-prototype.vercel.app` sirviendo el prototipo
- [ ] Clonar repo, checkout `app-real`, `pnpm install && pnpm dev`
- [ ] Login con magic link como `antonio@movewell.mx` en `localhost:3000/t/movewell`
- [ ] Login en `localhost:3000/t/demo` y verificar que NO veo datos de movewell
- [ ] Ver showcase en `/showcase` con primitives en dark + light
- [ ] Ver mi audit_log al loguearme
- [ ] `pnpm test` y `pnpm test:e2e` en verde (incluido test de aislamiento)
- [ ] Preview Vercel de la branch `app-real` deployado
- [ ] `docs/modulo-bootstrap.md` completo

Empezá leyendo los 3 archivos y dame tu resumen + las 8 preguntas. No toques nada hasta que apruebe.
```

---

## 📌 Antes de pegarle el prompt a Claude Code

```bash
cd ~/dev/reha-mx   # o donde tengas el repo

# Asegurate que la branch main tiene los 3 docs antes de empezar
ls docs/
# Debería tener: 00-MASTER-PLAN.md, DESIGN.md (heredado del prototipo)
# Si no, copialos:
cp /ruta/a/00-MASTER-PLAN.md docs/
cp /ruta/a/DESIGN.md docs/   # del prototipo actual reha-mx (si no existe en docs/)
cp /ruta/a/01-CLAUDE-md.md CLAUDE.md
git add docs/ CLAUDE.md
git commit -m "docs: master plan + claude.md for SaaS build"
git push origin main
```

Después abrís Claude Code en esa carpeta y pegás el prompt de arriba.
