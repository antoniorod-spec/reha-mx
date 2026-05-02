/* Equipo — fisios, capacidad, comisiones */

const Team = ({ theme, isMobile }) => {
  const t = tokens(theme);
  const [selected, setSelected] = React.useState(null);

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Recursos humanos · Reha</div>
          <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>Equipo</h1>
          <div className="text-[12px] sm:text-[12.5px] mt-1.5" style={{ color: t.muted }}>16 fisios activos · 3 sucursales</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex px-3 py-1.5 rounded-md text-[12px] font-medium items-center gap-1.5" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconCalendar size={13}/> Disponibilidades
          </button>
          <button className="px-3 py-1.5 rounded-md text-[12px] sm:text-[12.5px] font-semibold flex items-center gap-1.5 no-wrap" style={{ background: t.accent, color: "#06101C" }}>
            <IconPlus size={13}/> Nuevo miembro
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-5">
        {TEAM_KPIS.map((k, i) => <KPICard key={i} theme={theme} k={k}/>)}
      </div>

      {/* Capacity overview */}
      <Card theme={theme} padding="p-4" className="mb-3 sm:mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Carga del equipo · Esta semana</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>% sobre capacidad asignada · Saludable: 60–85%</div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10.5px] font-mono">
            <span className="inline-flex items-center gap-1.5" style={{ color: t.subtle }}><span className="w-2 h-2 rounded-sm" style={{ background: t.good }}/>Bajo</span>
            <span className="inline-flex items-center gap-1.5" style={{ color: t.subtle }}><span className="w-2 h-2 rounded-sm" style={{ background: t.accent }}/>Saludable</span>
            <span className="inline-flex items-center gap-1.5" style={{ color: t.subtle }}><span className="w-2 h-2 rounded-sm" style={{ background: t.bad }}/>Sobrecarga</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {FISIO_DETAIL.map((f) => {
            const color = f.load > 85 ? t.bad : f.load > 60 ? t.accent : t.good;
            return (
              <div key={f.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
                     style={{ background: `${f.color}1F`, color: f.color, border: `1px solid ${f.color}55` }}>{f.init}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="min-w-0 truncate">
                      <span className="text-[12px] font-medium tracking-tightish" style={{ color: t.text }}>{f.name}</span>
                      <span className="text-[10.5px] font-mono ml-2" style={{ color: t.subtle }}>{f.role}</span>
                    </div>
                    <span className="text-[11.5px] font-mono shrink-0" style={{ color }}>{f.load}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                    <div className="h-full rounded-full" style={{ width: `${f.load}%`, background: color }}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mobile: cards | Desktop: detailed table */}
      {isMobile ? (
        <div className="space-y-2">
          {FISIO_DETAIL.map((f) => (
            <button key={f.name} onClick={() => setSelected(f)}
                    className="w-full text-left rounded-lg p-3 transition-colors"
                    style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-md flex items-center justify-center text-[13px] font-semibold shrink-0"
                     style={{ background: `${f.color}1F`, color: f.color, border: `1px solid ${f.color}55` }}>{f.init}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold tracking-tightish truncate" style={{ color: t.text }}>{f.name}</div>
                      <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>{f.role}</div>
                    </div>
                    <div className="flex items-center gap-1 text-[10.5px] font-mono shrink-0" style={{ color: t.text }}>
                      <IconStar size={10} style={{ color: "#F59E0B" }}/>{f.rating}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2.5 py-2 border-t border-b" style={{ borderColor: t.borderSoft }}>
                    <div>
                      <div className="text-[14px] font-semibold tracking-tightish" style={{ color: t.text }}>{f.weekly}</div>
                      <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>sem</div>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold tracking-tightish" style={{ color: t.text }}>{f.monthly}</div>
                      <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>mes</div>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold tracking-tightish" style={{ color: t.text }}>{f.load}%</div>
                      <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>carga</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] font-mono" style={{ color: t.subtle }}>
                    <div className="flex items-center gap-1 flex-wrap">
                      {f.branches.map((bn, j) => {
                        const b = BRANCHES.find(x => x.short === bn);
                        return (
                          <span key={j} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${b.color}1F`, color: b.color, border: `1px solid ${b.color}55` }}>
                            <span className="w-1 h-1 rounded-full" style={{ background: b.color }}/>{bn}
                          </span>
                        );
                      })}
                    </div>
                    <span className="shrink-0 ml-2">${f.commission.toLocaleString("es-MX")}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Card theme={theme} padding="p-0">
          <div className="grid grid-cols-[2fr_1.4fr_1.4fr_0.8fr_0.8fr_0.8fr_1.2fr_30px] text-[10.5px] font-mono uppercase tracking-wider px-4 py-2"
               style={{ color: t.subtle, borderBottom: `1px solid ${t.borderSoft}` }}>
            <div>Fisio</div>
            <div>Especialidad</div>
            <div>Sucursales</div>
            <div className="text-right">Sem.</div>
            <div className="text-right">Mes</div>
            <div className="text-right">Rating</div>
            <div className="text-right">Comisiones</div>
            <div></div>
          </div>
          {FISIO_DETAIL.map((f, i) => (
            <button key={f.name} onClick={() => setSelected(f)}
                    className="w-full grid grid-cols-[2fr_1.4fr_1.4fr_0.8fr_0.8fr_0.8fr_1.2fr_30px] items-center px-4 py-2.5 text-[12.5px] hover:bg-white/[0.03] transition-colors text-left"
                    style={{ borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}`, color: t.text }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
                     style={{ background: `${f.color}1F`, color: f.color, border: `1px solid ${f.color}55` }}>{f.init}</div>
                <div className="min-w-0">
                  <div className="font-medium tracking-tightish truncate">{f.name}</div>
                  <div className="text-[10.5px] font-mono truncate" style={{ color: t.subtle }}>Desde {f.since}</div>
                </div>
              </div>
              <div className="truncate" style={{ color: t.muted }}>{f.role}</div>
              <div className="flex items-center gap-1 flex-wrap">
                {f.branches.map((bn, j) => {
                  const b = BRANCHES.find(x => x.short === bn);
                  return (
                    <span key={j} className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${b.color}1F`, color: b.color, border: `1px solid ${b.color}55` }}>
                      <span className="w-1 h-1 rounded-full" style={{ background: b.color }}/>{bn}
                    </span>
                  );
                })}
              </div>
              <div className="text-right font-mono">{f.weekly}</div>
              <div className="text-right font-mono">{f.monthly}</div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono">
                  <IconStar size={10} style={{ color: "#F59E0B" }}/>{f.rating}
                </span>
              </div>
              <div className="text-right font-mono">${f.commission.toLocaleString("es-MX")}</div>
              <div className="text-right opacity-50"><IconChevronRight size={13} style={{ color: t.muted }}/></div>
            </button>
          ))}
        </Card>
      )}

      {/* Mobile detail sheet */}
      {selected && isMobile && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.65)" }} onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-2xl p-4 max-h-[85vh] overflow-y-auto"
               style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md flex items-center justify-center text-[14px] font-semibold"
                     style={{ background: `${selected.color}1F`, color: selected.color, border: `1px solid ${selected.color}55` }}>{selected.init}</div>
                <div>
                  <div className="text-[15px] font-semibold tracking-tightish" style={{ color: t.text }}>{selected.name}</div>
                  <div className="text-[11px] font-mono" style={{ color: t.subtle }}>{selected.role}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>
                <IconX size={14}/>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 my-4">
              {[
                { l: "Pacientes activos", v: selected.weekly + 4 },
                { l: "Sesiones del mes", v: selected.monthly },
                { l: "Carga semanal", v: selected.load + "%" },
                { l: "Rating promedio", v: selected.rating },
                { l: "Comisiones mes", v: "$" + selected.commission.toLocaleString("es-MX") },
                { l: "Antigüedad", v: selected.since },
              ].map((r, i) => (
                <div key={i} className="rounded-md p-3" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
                  <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{r.l}</div>
                  <div className="text-[16px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>{r.v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2.5 rounded-md text-[12px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Ver agenda</button>
              <button className="px-3 py-2.5 rounded-md text-[12px] font-semibold" style={{ background: t.accent, color: "#06101C" }}>Ver perfil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Team });
