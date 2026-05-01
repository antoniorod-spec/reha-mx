# Reha.mx — Handoff para Claude Code

Prototipo del SaaS para clínicas de fisioterapia deportiva en México.

## 🚀 Deploy a GitHub + Vercel

Repo destino: **https://github.com/antoniorod-spec/reha-mx**

### Pasos para Claude Code

1. **Inicializa git y conecta el repo remoto:**
   ```bash
   git init
   git branch -M main
   git remote add origin https://github.com/antoniorod-spec/reha-mx.git
   git pull origin main --allow-unrelated-histories  # el repo ya tiene un README inicial
   ```

2. **Primer commit + push:**
   ```bash
   git add .
   git commit -m "feat: initial Reha.mx prototype — full app with 13 views"
   git push -u origin main
   ```

3. **Deploy a Vercel** (requiere `vercel` CLI: `npm i -g vercel`):
   ```bash
   vercel
   # Cuando pregunte:
   # - Set up and deploy? Y
   # - Which scope? (tu cuenta)
   # - Link to existing project? N
   # - Project name? reha-mx
   # - Directory? ./
   # - Override settings? N (es estático, no necesita build)

   # Para producción:
   vercel --prod
   ```

   **Alternativa GUI:** ve a https://vercel.com/new → Import `antoniorod-spec/reha-mx` → Framework: **Other** → Build command vacío → Output dir `./` → Deploy.

---

## 📦 Stack

- **HTML + React 18** vía Babel standalone (sin build step)
- **Tailwind** vía CDN
- **Sin dependencias npm** — es 100% estático

## 🗂️ Estructura

```
index.html              ← entry point (Vercel home)
Reha.mx.html            ← duplicado por compatibilidad
Reha.mx.bundled.html    ← single-file standalone (offline)
vercel.json             ← cleanUrls
src/
  app.jsx               ← router + estado global
  shell.jsx             ← sidebar + topbar + mobile shell
  data.jsx              ← mock data (sucursales, citas, pacientes…)
  charts.jsx            ← gráficos SVG
  icons.jsx             ← icon set
  views/                ← una vista por archivo
    dashboard.jsx
    branch-dashboard.jsx
    agenda.jsx          ← mobile iOS Calendar + desktop week grid
    patient.jsx         ← expediente con PAIN/EVA, fuerza, wearable
    branches.jsx
    portal.jsx          ← vista paciente mobile
    patients-list.jsx
    protocols.jsx
    payments.jsx
    billing.jsx         ← CFDI 4.0 MX
    reports.jsx
    team.jsx
    settings.jsx        ← NOM-024, integraciones
components/
  ios-frame.jsx
```

## 🎨 Sistema de diseño

- **Tema:** dark by default + toggle a light
- **Acento:** cyan `#3FBCD4`
- **Tipo:** Inter para UI, JetBrains Mono para datos
- **Móvil:** sidebar colapsable + bottom nav, Agenda con patrón iOS Calendar / Cron

## ⚠️ Notas para futuras ediciones

- **NO uses `type="module"`** en los script imports — rompe Babel standalone
- Cada `<script type="text/babel">` tiene su propio scope. Para compartir componentes, usa `Object.assign(window, { Componente })` al final del archivo
- Los style objects globales DEBEN tener nombres únicos por archivo (ej: `terminalStyles`, no `styles`)
- Los datos están todos centralizados en `src/data.jsx`
- Para añadir una vista nueva: crea `src/views/X.jsx`, expórtala con `Object.assign(window, { X })`, regístrala en `src/app.jsx`, y agrega el `<script>` en `index.html`

## 🔗 URLs útiles

- Repo: https://github.com/antoniorod-spec/reha-mx
- Vercel dashboard: https://vercel.com/dashboard
