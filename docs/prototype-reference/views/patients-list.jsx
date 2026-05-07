/* Pacientes — directorio. Tabla en desktop, cards en mobile */

const PatientsList = ({ theme, isMobile, setView }) => {
  const t = tokens(theme);
  const [filter, setFilter] = React.useState("Todos");
  const [search, setSearch] = React.useState("");

  const filters = [
    { id: "Todos",       count: PATIENTS_LIST.length },
    { id: "Activos",     count: PATIENTS_LIST.filter(p => p.status === "Activo").length },
    { id: "En valoración", count: PATIENTS_LIST.filter(p => p.phase === "Valoración").length },
    { id: "Próximos a alta", count: PATIENTS_LIST.filter(p => p.progress >= 80 && p.status === "Activo").length },
    { id: "Con saldo",   count: PATIENTS_LIST.filter(p => p.balance > 0).length },
    { id: "En pausa",    count: PATIENTS_LIST.filter(p => p.status === "Pausa").length },
  ];

  const filtered = PATIENTS_LIST.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.dx.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "Activos") return p.status === "Activo";
    if (filter === "En valoración") return p.phase === "Valoración";
    if (filter === "Próximos a alta") return p.progress >= 80 && p.status === "Activo";
    if (filter === "Con saldo") return p.balance > 0;
    if (filter === "En pausa") return p.status === "Pausa";
    return true;
  });

  const statusColor = (s) => s === "Activo" ? t.good : s === "Alta" ? t.accent : t.subtle;

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Directorio · Las 3 sucursales</div>
          <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>Pacientes</h1>
          <div className="text-[12px] sm:text-[12.5px] mt-1.5" style={{ color: t.muted }}>{PATIENTS_LIST.length} expedientes · {filtered.length} en vista</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex px-3 py-1.5 rounded-md text-[12px] font-medium items-center gap-1.5" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconDownload size={13}/> Exportar
          </button>
          <button className="px-3 py-1.5 rounded-md text-[12px] sm:text-[12.5px] font-semibold flex items-center gap-1.5 no-wrap" style={{ background: t.accent, color: "#06101C" }}>
            <IconPlus size={13}/> Nuevo paciente
          </button>
        </div>
      </div>

      {/* Search bar (mobile prominent) */}
      <div className="mb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <IconSearch size={14} style={{ color: t.subtle }}/>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
                 placeholder="Buscar por nombre o diagnóstico…"
                 className="bg-transparent outline-none flex-1 text-[13px]" style={{ color: t.text }}/>
          {search && (
            <button onClick={() => setSearch("")} className="p-0.5 rounded" style={{ color: t.muted }}>
              <IconX size={12}/>
            </button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="h-scroll mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 no-wrap">
          {filters.map((f) => {
            const active = f.id === filter;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11.5px] font-medium shrink-0 no-wrap transition-colors"
                      style={{ background: active ? t.accentSoft : t.surface, color: active ? t.accent : t.muted, border: `1px solid ${active ? t.accent + "55" : t.border}` }}>
                {f.id}
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: active ? "transparent" : t.surface2, color: active ? t.accent : t.subtle }}>{f.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: cards */}
      {isMobile && (
        <div className="space-y-2">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => setView("patient")}
                    className="w-full text-left rounded-lg p-3 transition-colors"
                    style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md flex items-center justify-center text-[12px] font-semibold shrink-0"
                     style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>{p.init}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold tracking-tightish truncate" style={{ color: t.text }}>{p.name}</div>
                      <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>{p.id} · {p.age} años · {p.sport}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                          style={{ background: `${statusColor(p.status)}1F`, color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}55` }}>
                      <span className="w-1 h-1 rounded-full bg-current"/> {p.status}
                    </span>
                  </div>
                  <div className="text-[12px] mt-2 truncate" style={{ color: t.muted }}>{p.dx}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.progress >= 80 ? t.good : t.accent }}/>
                    </div>
                    <span className="text-[10.5px] font-mono shrink-0" style={{ color: t.muted }}>{p.progress}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 text-[11px]" style={{ color: t.subtle }}>
                    <span className="font-mono">{p.fisio} · {p.branch}</span>
                    <span className="font-mono">{p.lastVisit}</span>
                  </div>
                  {p.balance > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-mono px-1.5 py-1 rounded" style={{ background: "rgba(245,158,11,0.10)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.4)" }}>
                      <IconWarning size={11}/> Saldo: ${p.balance.toLocaleString("es-MX")}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Desktop: table */}
      {!isMobile && (
        <Card theme={theme} padding="p-0">
          <div className="grid grid-cols-[2.4fr_1.4fr_1.2fr_1fr_1.4fr_0.8fr_0.8fr_30px] text-[10.5px] font-mono uppercase tracking-wider px-4 py-2"
               style={{ color: t.subtle, borderBottom: `1px solid ${t.borderSoft}` }}>
            <div>Paciente</div>
            <div>Diagnóstico</div>
            <div>Fisio</div>
            <div>Sucursal</div>
            <div>Progreso</div>
            <div className="text-right">NPS</div>
            <div>Estado</div>
            <div></div>
          </div>
          {filtered.map((p, i) => (
            <button key={p.id} onClick={() => setView("patient")}
                    className="w-full grid grid-cols-[2.4fr_1.4fr_1.2fr_1fr_1.4fr_0.8fr_0.8fr_30px] items-center px-4 py-2.5 text-[12.5px] hover:bg-white/[0.03] transition-colors text-left"
                    style={{ borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}`, color: t.text }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
                     style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>{p.init}</div>
                <div className="min-w-0">
                  <div className="font-medium tracking-tightish truncate">{p.name}</div>
                  <div className="text-[10.5px] font-mono truncate" style={{ color: t.subtle }}>{p.id} · {p.age} años</div>
                </div>
              </div>
              <div className="truncate" style={{ color: t.muted }}>{p.dx}</div>
              <div className="truncate" style={{ color: t.muted }}>{p.fisio}</div>
              <div style={{ color: t.muted }}>{p.branch}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                  <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.progress >= 80 ? t.good : t.accent }}/>
                </div>
                <span className="text-[10.5px] font-mono shrink-0" style={{ color: t.muted }}>{p.progress}%</span>
              </div>
              <div className="text-right font-mono">{p.nps ?? "—"}</div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{ background: `${statusColor(p.status)}1F`, color: statusColor(p.status), border: `1px solid ${statusColor(p.status)}55` }}>
                  <span className="w-1 h-1 rounded-full bg-current"/> {p.status}
                </span>
              </div>
              <div className="text-right opacity-50"><IconChevronRight size={13} style={{ color: t.muted }}/></div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
};

Object.assign(window, { PatientsList });
