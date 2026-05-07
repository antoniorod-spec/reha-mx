# Reha.mx — Handoff para Claude Code

> Prototipo del SaaS para clínicas de fisioterapia / readaptación deportiva en México.
> **Lee también [`DESIGN.md`](./DESIGN.md)** — tokens de diseño, reglas y patrones obligatorios.

---

## 🎯 Qué es esto

Un prototipo **navegable y de alta fidelidad**, no un MVP funcional. Sirve para:
- Demos a clínicas y fisios.
- Validar flujos clínicos y de paciente antes de construir.
- Servir de spec visual para el build "real" (Next.js + Supabase, fase posterior).

**No tiene backend.** Todos los datos viven en `src/data.jsx` y `src/views/portal-data.jsx`.

---

## 📦 Stack

- **HTML + React 18** vía Babel standalone (sin build step, sin npm).
- **Tailwind** vía CDN.
- **Inter** (UI) + **JetBrains Mono** (datos) vía Google Fonts.
- 100% estático → se sirve tal cual desde Vercel / GitHub Pages / cualquier static host.

**No hay** `package.json`, `node_modules`, bundler, ni build. Cualquier cambio es: editar `.jsx` → recargar el navegador.

---

## 🗂️ Estructura

```
index.html                      ← entry point (carga todos los .jsx en orden)
Reha.mx.html                    ← duplicado por compatibilidad
Reha.mx.bundled.html            ← single-file standalone (offline, generado)
vercel.json                     ← cleanUrls: true
README.md                       ← descripción pública del repo
DESIGN.md                       ← sistema de diseño (LEER antes de tocar UI)
CLAUDE.md                       ← este archivo

components/
  ios-frame.jsx                 ← bezel iPhone para el portal paciente

src/
  app.jsx                       ← router + estado global (theme, currentView, currentBranch)
  shell.jsx                     ← sidebar desktop + topbar + bottom nav mobile + tokens()
  data.jsx                      ← mock data clínico (sucursales, citas, pacientes, KPIs)
  charts.jsx                    ← AreaSparkline, LineChart, BarChart, HeatmapGrid (SVG puro)
  icons.jsx                     ← icon set (stroke 1.6, 24×24)
  views/
    dashboard.jsx               ← Dashboard consolidado multi-sucursal
    branch-dashboard.jsx        ← Dashboard de una sucursal (heatmap + carga fisios)
    agenda.jsx                  ← Orquestador de Agenda
    agenda-helpers.jsx          ← utils de fechas/grids
    agenda-sidebar.jsx          ← sidebar de mini-mes + filtros
    agenda-views-timeline.jsx   ← día/semana/3-días (timeline con hours)
    agenda-views-month-list.jsx ← mes (grid) + lista (móvil)
    patient.jsx                 ← Expediente: PAIN/EVA, fuerza cuádriceps, wearable, ejercicios
    patients-list.jsx           ← Directorio + filtros
    branches.jsx                ← Admin de sucursales
    protocols.jsx               ← Biblioteca clínica de protocolos
    payments.jsx                ← Cobros + estado de cuenta
    billing.jsx                 ← CFDI 4.0 (México)
    reports.jsx                 ← NPS, clínico, financiero
    team.jsx                    ← Fisios, capacidad, comisiones
    settings.jsx                ← NOM-024, integraciones, branding
    portal.jsx                  ← Shell del portal paciente (mobile, dentro de iOS frame)
    portal-data.jsx             ← Mock data del portal
    portal-ui.jsx               ← Primitivas del portal (PAvatar, PCard, PChip, etc.)
    portal-tab-home.jsx         ← Tab Home del portal
    portal-tab-plan.jsx         ← Tab Plan (ejercicios HEP)
    portal-tab-citas.jsx        ← Tab Citas
    portal-tab-nutri.jsx        ← Tab Nutrición
    portal-tab-yo.jsx           ← Tab Yo (perfil, paquetes, chat)
    portal-onboarding.jsx       ← Flow de onboarding del paciente
    portal-screens-extra.jsx    ← Pantallas overlay (notificaciones, ajustes, etc.)
```

---

## 🔧 Cómo desarrollar

```bash
# Cualquiera de estos sirve:
python3 -m http.server 8000
npx serve .
# luego abre http://localhost:8000
```

**No hay hot reload.** Edita el `.jsx`, recarga el navegador. Punto.

### Añadir una vista nueva

1. Crea `src/views/mi-vista.jsx`.
2. Al final del archivo:
   ```js
   Object.assign(window, { MiVista });
   ```
3. Regístrala en el switch de `src/app.jsx`.
4. Agrega el `<script type="text/babel" src="src/views/mi-vista.jsx"></script>` en `index.html` **antes** del script de `app.jsx`.
5. Si la vista necesita una entrada en el menú lateral, agrégala en `src/shell.jsx` (busca el array de items del nav).

### Añadir una pantalla del portal paciente

- Si es una **tab principal** → nuevo archivo `portal-tab-X.jsx` + registrar en `portal.jsx`.
- Si es una **pantalla overlay** (notificaciones, settings, detalle…) → agregar al `portal-screens-extra.jsx` y disparar desde donde se necesite.
- Todo overlay del portal **debe respetar el padding del status bar del iPhone** (ya hay un patrón en `portal-screens-extra.jsx`, copiar de ahí).

---

## ⚠️ Reglas no negociables (Babel standalone gotchas)

1. **NO uses `type="module"`** en script imports — rompe Babel standalone.
2. **Cada `<script type="text/babel">` tiene su propio scope.** Para compartir componentes entre archivos, exporta a `window` al final:
   ```js
   Object.assign(window, { MiComponente, miHelper });
   ```
3. **Style objects globales con nombres únicos.** Nunca `const styles = {...}` — colisiona entre archivos. Usa `terminalStyles`, `cardStyles`, `agendaStyles`, etc. O estilos inline.
4. **Mock data centralizado** en `src/data.jsx` (clínica) y `src/views/portal-data.jsx` (paciente). No inventes datos sueltos en una vista.
5. **Toda escritura de UI pasa por los tokens de tema** (ver `DESIGN.md`). No hardcodees colores en una vista nueva — toma `t = tokens(theme)` y usa `t.bg`, `t.surface`, `t.accent`, etc.
6. **Versiones pinneadas con SRI** para React/ReactDOM/Babel en `index.html`. **No las cambies** sin razón fuerte — los integrity hashes se rompen si actualizas.

---

## 🚀 Deploy a GitHub + Vercel

Repo destino: **https://github.com/antoniorod-spec/reha-mx**

### Primer push

```bash
git init
git branch -M main
git remote add origin https://github.com/antoniorod-spec/reha-mx.git
git pull origin main --allow-unrelated-histories  # el repo ya tiene README inicial
git add .
git commit -m "feat: initial Reha.mx prototype — full app with 13 views"
git push -u origin main
```

### Vercel (CLI)

```bash
npm i -g vercel
vercel
# - Set up and deploy? Y
# - Project name? reha-mx
# - Directory? ./
# - Override settings? N (es estático, sin build)

vercel --prod
```

**Alternativa GUI:** https://vercel.com/new → Import `antoniorod-spec/reha-mx` → Framework: **Other** → Build command vacío → Output dir `./` → Deploy.

### Iteraciones siguientes

```bash
git add .
git commit -m "fix: <qué cambiaste>"
git push                # Vercel auto-deploya cada push a main
```

---

## 🧪 Cómo testear cambios sin desplegar

Solo abre `index.html` en el navegador (o sirve la carpeta con cualquier static server). No hay nada más.

Para una versión single-file que abre offline, usa `Reha.mx.bundled.html` — es el resultado de inlinear todos los assets. Solo se regenera explícitamente; no la edites a mano.

---

## 📋 Checklist al hacer cambios

- [ ] ¿El componente nuevo está exportado a `window`?
- [ ] ¿El script está cargado en `index.html` en el orden correcto (antes de `app.jsx`)?
- [ ] ¿Usa `tokens(theme)` para colores en vez de hardcodear?
- [ ] ¿Funciona en dark **y** light?
- [ ] ¿Funciona en mobile (≤768px) y desktop?
- [ ] ¿Los style objects tienen nombre único?
- [ ] ¿Sigue los patrones de `DESIGN.md`?

---

## 🔗 URLs útiles

- Repo: https://github.com/antoniorod-spec/reha-mx
- Vercel dashboard: https://vercel.com/dashboard
- Producción: (se llena tras primer deploy)
