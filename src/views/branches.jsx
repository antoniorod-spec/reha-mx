/* Branches admin */

const Branches = ({ theme }) => {
  const t = tokens(theme);

  return (
    <div className="px-6 pt-5 pb-10">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tighter2" style={{ color: t.text }}>Sucursales</h1>
          <div className="text-[12px] font-mono mt-1" style={{ color: t.subtle }}>3 activas · 1 en planeación · MoveWell SLP</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconList size={13}/> Vista de tabla
          </button>
          <button className="px-3 py-1.5 rounded-md text-[12px] font-semibold flex items-center gap-1.5" style={{ background: t.accent, color: "#06101C" }}>
            <IconPlus size={13}/> Nueva sucursal
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {BRANCHES.map((b) => (
          <Card key={b.id} theme={theme} padding="p-0" className="overflow-hidden">
            {/* Image header */}
            <div className="relative h-32"
                 style={{ background: `linear-gradient(135deg, ${b.color}33 0%, ${b.color}11 60%, transparent 100%), repeating-linear-gradient(135deg, ${theme === "dark" ? "#161616" : "#F0F0F0"} 0 8px, ${theme === "dark" ? "#0F0F0F" : "#FAFAFA"} 8px 16px)` }}>
              <div className="absolute inset-0 flex items-end justify-between p-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono"
                      style={{ background: `${b.color}26`, color: b.color, border: `1px solid ${b.color}66` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: b.color, boxShadow: `0 0 6px ${b.color}` }}/>
                  {b.status}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.55)", color: "#FAFAFA" }}>SUC-{b.id.slice(0,3).toUpperCase()}</span>
              </div>
            </div>
            {/* Body */}
            <div className="px-4 pt-3 pb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold tracking-tightish" style={{ color: t.text }}>{b.name}</h3>
              </div>
              <div className="space-y-1 mt-2 text-[11.5px]" style={{ color: t.muted }}>
                <div className="flex items-center gap-1.5"><IconMapPin size={12}/>{b.addr}</div>
                <div className="flex items-center gap-1.5 font-mono"><IconPhone size={12}/>{b.phone}</div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-1 mt-3 py-3 border-t border-b" style={{ borderColor: t.border }}>
                {[
                  { l: "Fisios",      v: b.fisios   },
                  { l: "Pacientes",   v: b.patients },
                  { l: "Ocupación",   v: `${b.occupancy}%` },
                  { l: "Salas",       v: b.salas    },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-[16px] font-semibold tracking-tighter2" style={{ color: t.text }}>{s.v}</div>
                    <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-3">
                <button className="px-2 py-1.5 rounded-md text-[11px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Editar</button>
                <button className="px-2 py-1.5 rounded-md text-[11px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Dashboard</button>
                <button className="px-2 py-1.5 rounded-md text-[11px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Horarios</button>
              </div>
            </div>
          </Card>
        ))}

        {/* Planning slot */}
        <Card theme={theme} padding="p-0" className="overflow-hidden col-span-3" style={{ borderStyle: "dashed" }}>
          <div className="grid grid-cols-[1fr_auto] items-center px-5 py-4">
            <div>
              <div className="text-[12px] font-semibold tracking-tightish" style={{ color: t.text }}>MoveWell Querétaro · En planeación</div>
              <div className="text-[11px] font-mono mt-1" style={{ color: t.subtle }}>Apertura prevista Q3 2026 · proyectado: 4 fisios, 80 pacientes/mes</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-md text-[11.5px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Plan de apertura</button>
              <button className="px-3 py-1.5 rounded-md text-[11.5px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Activar</button>
            </div>
          </div>
        </Card>
      </div>

      {/* Global config */}
      <Card theme={theme} padding="p-0" className="mb-6">
        <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: t.border }}>
          <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Configuración global</div>
          <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>Qué se hereda a todas las sucursales vs qué se configura localmente</div>
        </div>
        <div className="grid grid-cols-2">
          <div className="px-4 py-3" style={{ borderRight: `1px solid ${t.border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <IconLayers size={13} style={{ color: t.accent }}/>
              <div className="text-[12px] font-semibold tracking-tightish" style={{ color: t.text }}>Heredado · Organización</div>
            </div>
            <div className="space-y-2">
              {[
                { l: "Catálogo de servicios",        v: "42 servicios" },
                { l: "Plantillas de protocolo",      v: "27 plantillas" },
                { l: "Marca y branding",             v: "Tema MoveWell" },
                { l: "Roles y permisos",             v: "8 roles" },
                { l: "Cumplimiento NOM-024 / SAT",   v: "Activo" },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between text-[12px] py-1">
                  <span style={{ color: t.muted }}>{r.l}</span>
                  <span className="font-mono" style={{ color: t.text }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <IconBuilding size={13} style={{ color: "#5B8AC9" }}/>
              <div className="text-[12px] font-semibold tracking-tightish" style={{ color: t.text }}>Local · Por sucursal</div>
            </div>
            <div className="space-y-2">
              {[
                { l: "Horarios de atención",     v: "L-S · 07:00–20:00" },
                { l: "Equipo asignado",          v: "Independiente" },
                { l: "Salas y equipamiento",     v: "Inventario local" },
                { l: "Precios locales",          v: "Override permitido" },
                { l: "Integración WhatsApp",     v: "Número por sucursal" },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between text-[12px] py-1">
                  <span style={{ color: t.muted }}>{r.l}</span>
                  <span className="font-mono" style={{ color: t.text }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Staff table */}
      <Card theme={theme} padding="p-0">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Equipo por sucursal</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>Cada fisio puede pertenecer a una o más sucursales</div>
          </div>
          <button className="px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1" style={{ color: t.muted, border: `1px solid ${t.border}` }}>
            <IconFilter size={11}/> Filtrar
          </button>
        </div>
        <div className="grid grid-cols-[2fr_1.4fr_1.6fr_1fr_1fr_30px] text-[10.5px] font-mono uppercase tracking-wider px-4 py-2"
             style={{ color: t.subtle, borderTop: `1px solid ${t.borderSoft}`, borderBottom: `1px solid ${t.borderSoft}` }}>
          <div>Fisio</div>
          <div>Especialidad</div>
          <div>Sucursales</div>
          <div className="text-right">Pacientes</div>
          <div>Estado</div>
          <div></div>
        </div>
        {STAFF.map((s, i) => (
          <div key={i} className="grid grid-cols-[2fr_1.4fr_1.6fr_1fr_1fr_30px] items-center px-4 py-2.5 text-[12.5px] hover:bg-white/[0.03] transition-colors"
               style={{ borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}`, color: t.text }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
                   style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>{s.init}</div>
              <span className="font-medium tracking-tightish">{s.name}</span>
            </div>
            <div style={{ color: t.muted }}>{s.spec}</div>
            <div className="flex items-center gap-1 flex-wrap">
              {s.branches.map((bn, j) => {
                const b = BRANCHES.find(x => x.short === bn);
                return (
                  <span key={j} className="inline-flex items-center gap-1 text-[10.5px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: `${b.color}1F`, color: b.color, border: `1px solid ${b.color}55` }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: b.color }}/> {bn}
                  </span>
                );
              })}
            </div>
            <div className="text-right font-mono">{s.patients}</div>
            <div>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-1.5 py-0.5 rounded"
                    style={{
                      background: s.status === "Disponible" ? "rgba(52,211,153,0.12)" : s.status === "En sesión" ? "rgba(63,188,212,0.12)" : "rgba(115,115,115,0.12)",
                      color:      s.status === "Disponible" ? "#34D399" : s.status === "En sesión" ? t.accent : t.subtle,
                      border:    `1px solid ${s.status === "Disponible" ? "rgba(52,211,153,0.4)" : s.status === "En sesión" ? "rgba(63,188,212,0.4)" : "rgba(115,115,115,0.3)"}`,
                    }}>
                <span className="w-1 h-1 rounded-full bg-current"/> {s.status}
              </span>
            </div>
            <div className="text-right opacity-50"><IconMore size={13} style={{ color: t.muted }}/></div>
          </div>
        ))}
      </Card>
    </div>
  );
};

Object.assign(window, { Branches });
