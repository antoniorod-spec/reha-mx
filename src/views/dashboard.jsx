/* Dashboard consolidado */

const Dashboard = ({ theme, branchId, setView, setPatientFromName, isMobile }) => {
  const t = tokens(theme);
  const isAll = branchId === "all";
  const all = [...BRANCHES, CONSOLIDATED];
  const current = all.find(b => b.id === branchId);
  const kpis = isAll ? KPIS_CONSOLIDATED : KPIS_BRANCH;
  const greeting = "Buenos días, Antonio";

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>
            Lunes · 4 de mayo de 2026
          </div>
          <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>
            {greeting}<span style={{ color: t.accent }}>.</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: current.color }}/>
            <span className="text-[12px] sm:text-[12.5px]" style={{ color: t.muted }}>
              {isAll ? "Las 3 sucursales" : current.name} · {isAll ? "16 fisios activos" : `${current.fisios} fisios activos`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md text-[12px] sm:text-[12.5px] font-medium flex items-center gap-1.5 no-wrap"
                  style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconUpload size={13}/> Exportar
          </button>
          <button className="px-3 py-1.5 rounded-md text-[12px] sm:text-[12.5px] font-semibold flex items-center gap-1.5 no-wrap"
                  style={{ background: t.accent, color: "#06101C" }}>
            <IconPlus size={13}/> Nueva cita
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-5">
        {kpis.map((k, i) => <KPICard key={i} theme={theme} k={k}/>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Revenue chart */}
        <Card theme={theme} className="lg:col-span-2" padding="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>
                Ingresos por sucursal
              </div>
              <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>
                Últimos 6 meses · MXN
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono p-0.5 rounded-md" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
              {["6m","12m","YTD"].map((x, i) => (
                <button key={x} className="px-2 py-0.5 rounded"
                        style={{ background: i === 0 ? t.surface : "transparent", color: i === 0 ? t.text : t.muted }}>{x}</button>
              ))}
            </div>
          </div>
          <LineChart
            data={REVENUE_6M.map(d => ({ x: d.m, centro: d.centro, lomas: d.lomas, carranza: d.carranza }))}
            series={[
              { key: "centro",   color: "#3FBCD4", label: "Centro" },
              { key: "lomas",    color: "#5B8AC9", label: "Lomas" },
              { key: "carranza", color: "#7EE3C5", label: "Carranza" },
            ]}
            height={220} theme={theme} yMax={220}
            formatY={(v) => `${v}k`}
          />
        </Card>

        {/* Próximas altas */}
        <Card theme={theme} padding="p-0">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Próximas altas</div>
              <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>5 esperadas · Mayo</div>
            </div>
            <button className="text-[11px] font-mono" style={{ color: t.muted }}>Ver todas</button>
          </div>
          <div>
            {NEXT_DISCHARGES.map((p, i) => (
              <button key={i} onClick={() => { setPatientFromName(p.name); setView("patient"); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                      style={{ borderTop: `1px solid ${t.borderSoft}` }}>
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
                     style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>
                  {p.name.split(" ").map(s => s[0]).slice(0,2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium tracking-tightish truncate" style={{ color: t.text }}>{p.name}</div>
                  <div className="text-[10.5px] font-mono truncate" style={{ color: t.subtle }}>{p.dx} · {p.fisio}</div>
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: t.accent }}/>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono" style={{ color: t.text }}>{p.date}</div>
                  <div className="text-[10px] font-mono" style={{ color: t.subtle }}>{p.branch}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Branch performance table */}
      {isAll ? (
        <Card theme={theme} className="mt-3" padding="p-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Rendimiento por sucursal</div>
              <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>Mayo 2026 · Hasta hoy</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[11px] font-mono px-2 py-1 rounded flex items-center gap-1" style={{ color: t.muted, border: `1px solid ${t.border}` }}>
                <IconFilter size={11}/> Filtrar
              </button>
            </div>
          </div>
          <div className="grid grid-cols-[1.6fr_repeat(5,1fr)_30px] text-[10.5px] font-mono uppercase tracking-wider px-4 py-2"
               style={{ color: t.subtle, borderTop: `1px solid ${t.borderSoft}`, borderBottom: `1px solid ${t.borderSoft}` }}>
            <div>Sucursal</div>
            <div className="text-right">Pacientes activos</div>
            <div className="text-right">Sesiones / sem.</div>
            <div className="text-right">Ocupación</div>
            <div className="text-right">Ingreso del mes</div>
            <div className="text-right">NPS</div>
            <div></div>
          </div>
          {BRANCH_PERF.map((b, i) => {
            const branch = BRANCHES.find(x => x.id === b.id);
            return (
              <button key={b.id}
                      onClick={() => setView("branch-dashboard")}
                      className="w-full grid grid-cols-[1.6fr_repeat(5,1fr)_30px] items-center px-4 py-3 text-[12.5px] transition-colors hover:bg-white/[0.03] text-left"
                      style={{ borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}`, color: t.text }}>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: branch.color, boxShadow: `0 0 6px ${branch.color}` }}/>
                  <span className="font-medium tracking-tightish">{b.name}</span>
                </div>
                <div className="text-right font-mono">{b.patients}</div>
                <div className="text-right font-mono">{b.sessions}</div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <div className="w-14 h-1 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                      <div className="h-full rounded-full" style={{ width: `${b.occupancy}%`, background: branch.color }}/>
                    </div>
                    <span className="font-mono text-[11px]" style={{ color: t.muted }}>{b.occupancy}%</span>
                  </div>
                </div>
                <div className="text-right font-mono">${b.revenue.toLocaleString("es-MX")}</div>
                <div className="text-right font-mono">{b.nps}</div>
                <div className="text-right opacity-50"><IconChevronRight size={13} style={{ color: t.muted }}/></div>
              </button>
            );
          })}
        </Card>
      ) : (
        <BranchInsights theme={theme} branchId={branchId}/>
      )}

      {/* Lower row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        <Card theme={theme} padding="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Adherencia al protocolo</div>
            <Badge theme={theme} color={t.good}>+2.1 pts</Badge>
          </div>
          <div className="text-[28px] font-semibold tracking-tighter2" style={{ color: t.text }}>87.4<span className="text-[14px] font-mono" style={{ color: t.subtle }}>%</span></div>
          <div className="text-[11px] font-mono" style={{ color: t.subtle }}>Promedio últimos 30 días</div>
          <div className="mt-3"><AreaSparkline values={[78,80,82,79,84,83,85,86,84,87,88,87,89,87]} color={t.accent} theme={theme} height={56}/></div>
        </Card>
        <Card theme={theme} padding="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Sesiones canceladas</div>
            <Badge theme={theme} color={t.bad}>−14%</Badge>
          </div>
          <div className="text-[28px] font-semibold tracking-tighter2" style={{ color: t.text }}>4.2<span className="text-[14px] font-mono" style={{ color: t.subtle }}>%</span></div>
          <div className="text-[11px] font-mono" style={{ color: t.subtle }}>Tasa mensual · MoM</div>
          <div className="mt-3"><AreaSparkline values={[6,5.8,6.2,5.5,5.1,4.8,4.6,4.4,4.5,4.3,4.2,4.1,4.2]} color="#F87171" theme={theme} height={56}/></div>
        </Card>
        <Card theme={theme} padding="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Facturas CFDI emitidas</div>
            <Badge theme={theme} color={t.info}>Abril</Badge>
          </div>
          <div className="text-[28px] font-semibold tracking-tighter2" style={{ color: t.text }}>1,284</div>
          <div className="text-[11px] font-mono" style={{ color: t.subtle }}>SAT · 100% timbradas</div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1">
              <div className="text-[10px] font-mono" style={{ color: t.subtle }}>PUE</div>
              <div className="text-[15px] font-semibold tracking-tightish" style={{ color: t.text }}>892</div>
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-mono" style={{ color: t.subtle }}>PPD</div>
              <div className="text-[15px] font-semibold tracking-tightish" style={{ color: t.text }}>312</div>
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-mono" style={{ color: t.subtle }}>P. seguro</div>
              <div className="text-[15px] font-semibold tracking-tightish" style={{ color: t.text }}>80</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Reused for the per-branch dashboard
const BranchInsights = ({ theme, branchId }) => {
  const t = tokens(theme);
  const branch = BRANCHES.find(b => b.id === branchId) || BRANCHES[0];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
      <Card theme={theme} className="lg:col-span-2" padding="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Mapa de ocupación · Esta semana</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>{branch.name} · 4 salas · 07:00 → 19:00</div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: t.subtle }}>
            <span>Menos</span>
            <div className="flex gap-0.5">
              {["#0F0F0F","#0F2438","#16466A","#1F6A8E","#3FBCD4"].map((c,i) => <div key={i} className="w-3 h-3 rounded-[2px]" style={{ background: theme === "dark" ? c : ["#F5F5F5","#DCEEF3","#A8DDE6","#3FBCD4","#1B92AE"][i] }}/>)}
            </div>
            <span>Más</span>
          </div>
        </div>
        <HeatmapGrid rows={HEATMAP} days={HEATMAP_DAYS} hours={HEATMAP_HOURS} theme={theme}/>
      </Card>
      <Card theme={theme} padding="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Carga por fisio</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>{branch.name} · esta sem.</div>
          </div>
        </div>
        <div className="space-y-2.5">
          {FISIOS_CARGA.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
                   style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>{f.init}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] font-medium tracking-tightish truncate" style={{ color: t.text }}>{f.name}</span>
                  <span className="text-[10.5px] font-mono ml-2" style={{ color: t.muted }}>{f.patients} pac.</span>
                </div>
                <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                  <div className="h-full rounded-full" style={{ width: `${f.load}%`, background: f.load > 85 ? "#F87171" : f.load > 60 ? t.accent : "#34D399" }}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

Object.assign(window, { Dashboard, BranchInsights });
