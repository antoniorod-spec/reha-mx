/* Configuración — organización, NOM-024, integraciones, roles */

const Settings = ({ theme, isMobile }) => {
  const t = tokens(theme);
  const [section, setSection] = React.useState("organizacion");

  const sections = [
    { id: "organizacion", label: "Organización",   icon: IconBuilding2 },
    { id: "cumplimiento", label: "Cumplimiento",   icon: IconShield },
    { id: "integrations", label: "Integraciones",  icon: IconLink },
    { id: "roles",        label: "Roles y permisos", icon: IconKey },
    { id: "branding",     label: "Marca",           icon: IconBolt },
    { id: "billing",      label: "Plan y facturación Reha", icon: IconCard },
  ];

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{ORG_INFO.name} · {ORG_INFO.rfc}</div>
          <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>Configuración</h1>
          <div className="text-[12px] sm:text-[12.5px] mt-1.5 flex items-center gap-2" style={{ color: t.muted }}>
            <span>Cuenta organizacional</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(52,211,153,0.12)", color: t.good, border: `1px solid ${t.good}55` }}>
              <IconShield size={9}/> Plan Clínico Pro
            </span>
          </div>
        </div>
      </div>

      {/* Section tabs (horizontal scroll on mobile) */}
      <div className="h-scroll mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 no-wrap">
          {sections.map((s) => {
            const active = s.id === section;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium shrink-0 no-wrap transition-colors"
                      style={{ background: active ? t.accentSoft : t.surface, color: active ? t.accent : t.muted, border: `1px solid ${active ? t.accent + "55" : t.border}` }}>
                <s.icon size={13}/>{s.label}
              </button>
            );
          })}
        </div>
      </div>

      {section === "organizacion" && <OrgSection theme={theme}/>}
      {section === "cumplimiento" && <ComplianceSection theme={theme}/>}
      {section === "integrations" && <IntegrationsSection theme={theme} isMobile={isMobile}/>}
      {section === "roles" && <RolesSection theme={theme}/>}
      {section === "branding" && <BrandingSection theme={theme}/>}
      {section === "billing" && <PlanSection theme={theme}/>}
    </div>
  );
};

const OrgSection = ({ theme }) => {
  const t = tokens(theme);
  return (
    <>
      <Card theme={theme} padding="p-0" className="mb-3">
        <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: t.border }}>
          <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Datos fiscales</div>
          <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>Información del emisor para CFDI 4.0</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {[
            { l: "Razón social",     v: ORG_INFO.name,    span: true },
            { l: "RFC",              v: ORG_INFO.rfc },
            { l: "Régimen fiscal",   v: ORG_INFO.regimen },
            { l: "Domicilio fiscal", v: ORG_INFO.domicilio, span: true },
            { l: "Certificado SAT",  v: ORG_INFO.cer.slice(0, 16) + "…" },
            { l: "Vencimiento",      v: ORG_INFO.expCer },
          ].map((r, i) => (
            <div key={i} className={`px-4 py-3 ${r.span ? "sm:col-span-2" : ""}`} style={{ borderTop: i > 0 ? `1px solid ${t.borderSoft}` : "none" }}>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: t.subtle }}>{r.l}</div>
              <div className="text-[13px] font-medium tracking-tightish font-mono" style={{ color: t.text }}>{r.v}</div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2" style={{ borderColor: t.border }}>
          <button className="px-3 py-1.5 rounded-md text-[11.5px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Ver constancia</button>
          <button className="px-3 py-1.5 rounded-md text-[11.5px] font-semibold flex items-center gap-1.5" style={{ background: t.accent, color: "#06101C" }}>
            <IconEdit size={12}/> Editar datos fiscales
          </button>
        </div>
      </Card>

      <Card theme={theme} padding="p-0">
        <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: t.border }}>
          <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Sucursales activas</div>
          <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>3 sucursales operando bajo MoveWell SLP</div>
        </div>
        {BRANCHES.map((b, i) => (
          <div key={b.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? `1px solid ${t.borderSoft}` : "none" }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                 style={{ background: `${b.color}1F`, border: `1px solid ${b.color}55` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium tracking-tightish truncate" style={{ color: t.text }}>{b.name}</div>
              <div className="text-[11px] font-mono truncate" style={{ color: t.subtle }}>{b.addr}</div>
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <div className="text-[11px] font-mono" style={{ color: t.muted }}>{b.fisios} fisios · {b.salas} salas</div>
              <div className="text-[10.5px] font-mono" style={{ color: t.subtle }}>{b.phone}</div>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
};

const ComplianceSection = ({ theme }) => {
  const t = tokens(theme);
  return (
    <Card theme={theme} padding="p-0">
      <div className="px-4 pt-4 pb-3 border-b flex items-center justify-between" style={{ borderColor: t.border }}>
        <div>
          <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Cumplimiento normativo</div>
          <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>NOM-024 · LFPDPPP · CFDI 4.0 · Auditado 03 Abr 2026</div>
        </div>
        <button className="px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>
          <IconDownload size={11}/> Reporte
        </button>
      </div>
      {COMPLIANCE.map((c, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3" style={{ borderTop: i > 0 ? `1px solid ${t.borderSoft}` : "none" }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
               style={{ background: `${c.color}1F`, border: `1px solid ${c.color}55` }}>
            <IconShield size={12} style={{ color: c.color }}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <span className="text-[12.5px] font-medium tracking-tightish" style={{ color: t.text }}>{c.l}</span>
              <span className="text-[11.5px] font-mono shrink-0" style={{ color: c.color }}>{c.v}</span>
            </div>
            <div className="text-[10.5px] font-mono mt-0.5" style={{ color: t.subtle }}>{c.note}</div>
          </div>
        </div>
      ))}
    </Card>
  );
};

const IntegrationsSection = ({ theme, isMobile }) => {
  const t = tokens(theme);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {INTEGRATIONS.map((it, i) => (
        <Card key={i} theme={theme} padding="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                   style={{ background: t.surface2, color: it.color, border: `1px solid ${t.border}` }}>
                <IconLink size={14}/>
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold tracking-tightish truncate" style={{ color: t.text }}>{it.name}</div>
                <div className="text-[10.5px] font-mono truncate" style={{ color: t.subtle }}>{it.by}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: `${it.color}1F`, color: it.color, border: `1px solid ${it.color}55` }}>
              <span className="w-1 h-1 rounded-full bg-current"/> {it.status}
            </span>
          </div>
          <div className="text-[11.5px] mt-1" style={{ color: t.muted }}>{it.desc}</div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: t.borderSoft }}>
            <button className="flex-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Configurar</button>
            <button className="px-2.5 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>
              <IconExternal size={11}/>
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
};

const RolesSection = ({ theme }) => {
  const t = tokens(theme);
  return (
    <Card theme={theme} padding="p-0">
      <div className="px-4 pt-4 pb-3 border-b flex items-center justify-between" style={{ borderColor: t.border }}>
        <div>
          <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Roles y permisos</div>
          <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>{ROLES.reduce((a, r) => a + r.members, 0)} miembros · 6 roles</div>
        </div>
        <button className="px-2.5 py-1.5 rounded-md text-[11.5px] font-medium flex items-center gap-1" style={{ background: t.accent, color: "#06101C" }}>
          <IconPlus size={12}/> Nuevo rol
        </button>
      </div>
      {ROLES.map((r, i) => (
        <div key={r.name} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? `1px solid ${t.borderSoft}` : "none" }}>
          <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
               style={{ background: t.surface2, color: t.accent, border: `1px solid ${t.border}` }}>
            <IconKey size={13}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium tracking-tightish truncate" style={{ color: t.text }}>{r.name}</div>
            <div className="text-[11px] font-mono truncate" style={{ color: t.subtle }}>{r.scope}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[14px] font-semibold tracking-tightish" style={{ color: t.text }}>{r.members}</div>
            <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>miembros</div>
          </div>
        </div>
      ))}
    </Card>
  );
};

const BrandingSection = ({ theme }) => {
  const t = tokens(theme);
  const palette = ["#3FBCD4", "#1B3A5C", "#5B8AC9", "#7EE3C5", "#34D399", "#A78BFA"];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Card theme={theme} padding="p-4">
        <div className="text-[13px] font-semibold tracking-tightish mb-1" style={{ color: t.text }}>Logo</div>
        <div className="text-[11px] font-mono mb-3" style={{ color: t.subtle }}>Aparece en CFDI, recordatorios y app paciente</div>
        <div className="rounded-lg flex items-center justify-center py-10"
             style={{ background: t.surface2, border: `1px dashed ${t.border}` }}>
          <Logo theme={theme}/>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button className="px-3 py-2 rounded-md text-[11.5px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Reemplazar</button>
          <button className="px-3 py-2 rounded-md text-[11.5px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Variante claro</button>
        </div>
      </Card>

      <Card theme={theme} padding="p-4">
        <div className="text-[13px] font-semibold tracking-tightish mb-1" style={{ color: t.text }}>Paleta</div>
        <div className="text-[11px] font-mono mb-3" style={{ color: t.subtle }}>Color primario: cyan clínico · #3FBCD4</div>
        <div className="grid grid-cols-6 gap-2">
          {palette.map((c, i) => (
            <div key={i} className="aspect-square rounded-md" style={{ background: c, boxShadow: i === 0 ? `0 0 12px ${c}66` : "none", border: i === 0 ? `2px solid ${t.text}33` : "none" }}/>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-md p-2" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
            <div className="text-[9.5px] font-mono uppercase" style={{ color: t.subtle }}>Heading</div>
            <div className="text-[14px] font-semibold tracking-tighter2" style={{ color: t.text }}>Inter</div>
          </div>
          <div className="rounded-md p-2" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
            <div className="text-[9.5px] font-mono uppercase" style={{ color: t.subtle }}>Body</div>
            <div className="text-[14px]" style={{ color: t.text }}>Inter</div>
          </div>
          <div className="rounded-md p-2" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
            <div className="text-[9.5px] font-mono uppercase" style={{ color: t.subtle }}>Mono</div>
            <div className="text-[14px] font-mono" style={{ color: t.text }}>JetBrains</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const PlanSection = ({ theme }) => {
  const t = tokens(theme);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <Card theme={theme} padding="p-4" className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Plan actual</div>
            <div className="text-[18px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>Reha · Clínico Pro</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>3 sucursales · 16 fisios · CFDI ilimitadas</div>
          </div>
          <Badge theme={theme} color={t.good}>Activo</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-t border-b" style={{ borderColor: t.border }}>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Costo mensual</div>
            <div className="text-[18px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>$8,900<span className="text-[11px] font-mono" style={{ color: t.subtle }}> MXN</span></div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Próximo cargo</div>
            <div className="text-[14px] font-semibold tracking-tightish mt-1" style={{ color: t.text }}>1 Jun 2026</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Cuentas</div>
            <div className="text-[14px] font-semibold tracking-tightish mt-1" style={{ color: t.text }}>16 / ∞</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Soporte</div>
            <div className="text-[14px] font-semibold tracking-tightish mt-1" style={{ color: t.text }}>Prioritario</div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 mt-3">
          <button className="px-3 py-1.5 rounded-md text-[11.5px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Cambiar plan</button>
          <button className="px-3 py-1.5 rounded-md text-[11.5px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Método de pago</button>
          <button className="px-3 py-1.5 rounded-md text-[11.5px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Historial</button>
        </div>
      </Card>

      <Card theme={theme} padding="p-4">
        <div className="text-[13px] font-semibold tracking-tightish mb-1" style={{ color: t.text }}>Uso del mes</div>
        <div className="text-[11px] font-mono mb-3" style={{ color: t.subtle }}>Mayo 2026</div>
        {[
          { l: "Pacientes activos",   v: 487,    max: 1000 },
          { l: "CFDI emitidas",       v: 1284,   max: null },
          { l: "Mensajes WhatsApp",   v: 4180,   max: 10000 },
          { l: "Almacenamiento (GB)", v: 18.4,   max: 100 },
        ].map((r, i) => (
          <div key={i} className="py-1.5">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[11.5px]" style={{ color: t.muted }}>{r.l}</span>
              <span className="text-[11.5px] font-mono" style={{ color: t.text }}>
                {r.v.toLocaleString("es-MX")}{r.max && <span style={{ color: t.subtle }}> / {r.max.toLocaleString("es-MX")}</span>}
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
              <div className="h-full rounded-full" style={{ width: r.max ? `${(r.v / r.max) * 100}%` : "100%", background: t.accent }}/>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

Object.assign(window, { Settings });
