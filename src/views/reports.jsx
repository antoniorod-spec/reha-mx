/* Reportes — analytics clínicos y financieros */

const Reports = ({ theme, isMobile, branchId }) => {
  const t = tokens(theme);
  const [period, setPeriod] = React.useState("YTD");

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Analítica · Las 3 sucursales</div>
          <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>Reportes</h1>
          <div className="text-[12px] sm:text-[12.5px] mt-1.5" style={{ color: t.muted }}>Año a la fecha · Mayo 2026</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-mono p-0.5 rounded-md" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
            {["30d","6m","YTD","12m"].map((x) => (
              <button key={x} onClick={() => setPeriod(x)} className="px-2 py-0.5 rounded transition-colors"
                      style={{ background: period === x ? t.surface : "transparent", color: period === x ? t.text : t.muted }}>{x}</button>
            ))}
          </div>
          <button className="px-3 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5 no-wrap" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconDownload size={13}/> <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-5">
        {REPORTS_KPIS.map((k, i) => <KPICard key={i} theme={theme} k={k}/>)}
      </div>

      {/* Top row: NPS trend + Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 sm:mb-5">
        <Card theme={theme} className="lg:col-span-2" padding="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Net Promoter Score · 6 meses</div>
              <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>{REPORTS_NPS.length} mediciones · n = 487 respuestas</div>
            </div>
            <div className="text-right">
              <div className="text-[26px] font-semibold tracking-tighter2" style={{ color: t.text }}>72</div>
              <div className="text-[10.5px] font-mono" style={{ color: t.good }}>+8 pts vs Nov</div>
            </div>
          </div>
          <LineChart
            data={REPORTS_NPS.map(d => ({ x: d.m, nps: d.v }))}
            series={[{ key: "nps", color: t.accent, label: "NPS" }]}
            height={isMobile ? 160 : 200} theme={theme} yMax={100}
          />
        </Card>

        <Card theme={theme} padding="p-4">
          <div className="text-[13px] font-semibold tracking-tightish mb-1" style={{ color: t.text }}>Resultados clínicos</div>
          <div className="text-[11px] font-mono mb-3" style={{ color: t.subtle }}>260 pacientes con alta · YTD</div>
          {/* Stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-4" style={{ background: t.surface2 }}>
            {REPORTS_OUTCOMES.map((o, i) => (
              <div key={i} title={`${o.label} ${o.pct}%`} style={{ width: `${o.pct}%`, background: o.color }}/>
            ))}
          </div>
          <div className="space-y-2">
            {REPORTS_OUTCOMES.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: o.color }}/>
                <span className="text-[11.5px] flex-1" style={{ color: t.muted }}>{o.label}</span>
                <span className="text-[11.5px] font-mono" style={{ color: t.text }}>{o.count}</span>
                <span className="text-[10.5px] font-mono w-9 text-right" style={{ color: t.subtle }}>{o.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top diagnostics */}
      <Card theme={theme} padding="p-0" className="mb-3 sm:mb-5">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Top diagnósticos · YTD</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>Volumen y tendencia vs trimestre anterior</div>
          </div>
        </div>
        <div className="px-4 pb-4 space-y-2">
          {REPORTS_TOP_DX.map((d, i) => {
            const max = REPORTS_TOP_DX[0].n;
            const TrendIcon = d.trend === "up" ? IconArrowUp : d.trend === "down" ? IconArrowDown : IconArrowRight;
            const tc = d.trend === "up" ? t.good : d.trend === "down" ? t.bad : t.subtle;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="text-[10px] font-mono w-5 text-right" style={{ color: t.subtle }}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[12.5px] font-medium tracking-tightish truncate" style={{ color: t.text }}>{d.dx}</span>
                    <span className="text-[11.5px] font-mono ml-2" style={{ color: t.muted }}>{d.n}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                    <div className="h-full rounded-full" style={{ width: `${(d.n / max) * 100}%`, background: t.accent }}/>
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${tc}1F`, color: tc, border: `1px solid ${tc}55` }}>
                    <TrendIcon size={9}/>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Lower row: 3 small reports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card theme={theme} padding="p-4">
          <div className="text-[13px] font-semibold tracking-tightish mb-1" style={{ color: t.text }}>Tiempo a alta · mediana</div>
          <div className="text-[11px] font-mono mb-3" style={{ color: t.subtle }}>Por región anatómica</div>
          {[
            { l: "Tobillo (esguinces)", v: 6.2,  max: 12 },
            { l: "Rodilla (LCA)",       v: 11.8, max: 12 },
            { l: "Hombro (subacrom.)",  v: 9.4,  max: 12 },
            { l: "Columna lumbar",      v: 8.6,  max: 12 },
            { l: "Tendinopatías",       v: 7.8,  max: 12 },
          ].map((r, i) => (
            <div key={i} className="py-1">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[11.5px]" style={{ color: t.muted }}>{r.l}</span>
                <span className="text-[11.5px] font-mono" style={{ color: t.text }}>{r.v} sem</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                <div className="h-full rounded-full" style={{ width: `${(r.v / r.max) * 100}%`, background: t.accent }}/>
              </div>
            </div>
          ))}
        </Card>

        <Card theme={theme} padding="p-4">
          <div className="text-[13px] font-semibold tracking-tightish mb-1" style={{ color: t.text }}>Pacientes · cohorte</div>
          <div className="text-[11px] font-mono mb-3" style={{ color: t.subtle }}>Adquisición trimestral</div>
          <div className="flex items-end gap-1.5 h-32">
            {[
              { q: "Q3 '25", v: 184, c: t.subtle },
              { q: "Q4 '25", v: 218, c: t.subtle },
              { q: "Q1 '26", v: 276, c: t.muted },
              { q: "Q2 '26", v: 312, c: t.accent },
            ].map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-t" style={{ height: `${(b.v / 312) * 100}%`, background: b.c, minHeight: "10%" }}/>
                <div className="text-[9.5px] font-mono" style={{ color: t.subtle }}>{b.q}</div>
                <div className="text-[10px] font-mono font-semibold" style={{ color: t.text }}>{b.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: t.border }}>
            <span className="text-[11px] font-mono" style={{ color: t.subtle }}>Crecimiento QoQ</span>
            <span className="text-[12px] font-mono font-semibold" style={{ color: t.good }}>+13.0%</span>
          </div>
        </Card>

        <Card theme={theme} padding="p-4">
          <div className="text-[13px] font-semibold tracking-tightish mb-1" style={{ color: t.text }}>Indicadores financieros</div>
          <div className="text-[11px] font-mono mb-3" style={{ color: t.subtle }}>Mensuales · MXN</div>
          {[
            { l: "Ingresos brutos",     v: "$487,300", d: "+15%", up: true },
            { l: "Costos operativos",   v: "$214,500", d: "+8%",  up: false },
            { l: "Margen operativo",    v: "56%",      d: "+3 pts", up: true },
            { l: "LTV / CAC",           v: "4.8×",     d: "+0.4×", up: true },
            { l: "Comisiones fisios",   v: "$184,200", d: "+11%", up: false },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 text-[12px]" style={{ borderTop: i > 0 ? `1px solid ${t.borderSoft}` : "none" }}>
              <span style={{ color: t.muted }}>{r.l}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono" style={{ color: t.text }}>{r.v}</span>
                <span className="inline-flex items-center text-[10px] font-mono" style={{ color: r.up ? t.good : t.bad }}>
                  {r.up ? <IconArrowUp size={9}/> : <IconArrowDown size={9}/>}{r.d}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

Object.assign(window, { Reports });
