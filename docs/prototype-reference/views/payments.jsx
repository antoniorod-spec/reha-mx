/* Pagos — cobros, saldos, métodos de pago */

const Payments = ({ theme, isMobile }) => {
  const t = tokens(theme);
  const [filter, setFilter] = React.useState("Todos");

  const filters = [
    { id: "Todos",      count: PAYMENTS.length },
    { id: "Pagado",     count: PAYMENTS.filter(p => p.status === "Pagado").length },
    { id: "Pendiente",  count: PAYMENTS.filter(p => p.status === "Pendiente").length },
    { id: "Vencido",    count: PAYMENTS.filter(p => p.status === "Vencido").length },
    { id: "Reembolso",  count: PAYMENTS.filter(p => p.status === "Reembolso").length },
  ];

  const filtered = filter === "Todos" ? PAYMENTS : PAYMENTS.filter(p => p.status === filter);

  const statusStyle = (s) => {
    if (s === "Pagado")     return { c: t.good, bg: "rgba(52,211,153,0.12)" };
    if (s === "Pendiente")  return { c: "#F59E0B", bg: "rgba(245,158,11,0.12)" };
    if (s === "Vencido")    return { c: t.bad, bg: "rgba(248,113,113,0.12)" };
    if (s === "Reembolso")  return { c: t.subtle, bg: "rgba(95,123,145,0.15)" };
    return { c: t.muted, bg: t.surface2 };
  };

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Cobros · Mayo 2026</div>
          <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>Pagos</h1>
          <div className="text-[12px] sm:text-[12.5px] mt-1.5" style={{ color: t.muted }}>312 transacciones · $487,300 MXN cobrado</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex px-3 py-1.5 rounded-md text-[12px] font-medium items-center gap-1.5" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconDownload size={13}/> Exportar
          </button>
          <button className="hidden sm:flex px-3 py-1.5 rounded-md text-[12px] font-medium items-center gap-1.5" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconLink size={13}/> Link de pago
          </button>
          <button className="px-3 py-1.5 rounded-md text-[12px] sm:text-[12.5px] font-semibold flex items-center gap-1.5 no-wrap" style={{ background: t.accent, color: "#06101C" }}>
            <IconPlus size={13}/> Nuevo cobro
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-5">
        {PAYMENT_KPIS.map((k, i) => <KPICard key={i} theme={theme} k={k}/>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 sm:mb-5">
        {/* Methods breakdown */}
        <Card theme={theme} className="lg:col-span-2" padding="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Cobros por método · Últimos 30 días</div>
              <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>$487,300 MXN total</div>
            </div>
          </div>
          {/* Stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-4" style={{ background: t.surface2 }}>
            {REVENUE_BY_METHOD_30D.map((m, i) => (
              <div key={i} title={`${m.label} ${m.pct}%`} style={{ width: `${m.pct}%`, background: m.color }}/>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {REVENUE_BY_METHOD_30D.map((m, i) => (
              <div key={i}>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }}/>
                  <span className="text-[11px] font-medium tracking-tightish" style={{ color: t.text }}>{m.label}</span>
                </div>
                <div className="text-[18px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>${(m.value / 1000).toFixed(1)}k</div>
                <div className="text-[10.5px] font-mono" style={{ color: t.subtle }}>{m.pct}% del total</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Aging buckets */}
        <Card theme={theme} padding="p-4">
          <div className="text-[13px] font-semibold tracking-tightish mb-1" style={{ color: t.text }}>Antigüedad de saldos</div>
          <div className="text-[11px] font-mono mb-3" style={{ color: t.subtle }}>16 cuentas · $21,660 MXN</div>
          {[
            { l: "0–7 días",   v: 12180, n: 8,  c: t.good },
            { l: "8–30 días",  v: 6240,  n: 5,  c: t.accent },
            { l: "31–60 días", v: 2700,  n: 2,  c: "#F59E0B" },
            { l: "+60 días",   v: 540,   n: 1,  c: t.bad },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2.5 py-1.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[11.5px]" style={{ color: t.muted }}>{b.l}</span>
                  <span className="text-[11.5px] font-mono" style={{ color: t.text }}>${b.v.toLocaleString("es-MX")}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                  <div className="h-full rounded-full" style={{ width: `${(b.v / 21660) * 100}%`, background: b.c }}/>
                </div>
              </div>
              <span className="text-[10px] font-mono shrink-0 w-6 text-right" style={{ color: t.subtle }}>{b.n}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Filters */}
      <div className="h-scroll mb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
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
          {filtered.map((p) => {
            const ss = statusStyle(p.status);
            return (
              <div key={p.id} className="rounded-lg p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center text-[11px] font-semibold shrink-0"
                         style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>{p.init}</div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold tracking-tightish truncate" style={{ color: t.text }}>{p.patient}</div>
                      <div className="text-[10.5px] font-mono truncate" style={{ color: t.subtle }}>{p.id} · {p.branch}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[15px] font-semibold tracking-tighter2" style={{ color: t.text }}>${p.amount.toLocaleString("es-MX")}</div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded mt-0.5"
                          style={{ background: ss.bg, color: ss.c, border: `1px solid ${ss.c}55` }}>
                      <span className="w-1 h-1 rounded-full bg-current"/> {p.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: t.borderSoft }}>
                  <div className="text-[11.5px] truncate flex-1 min-w-0" style={{ color: t.muted }}>{p.concept}</div>
                  <div className="text-[10.5px] font-mono ml-2 shrink-0" style={{ color: t.subtle }}>{p.date}</div>
                </div>
                <div className="text-[11px] font-mono mt-1 flex items-center gap-1.5" style={{ color: t.subtle }}>
                  <IconCard size={11}/> {p.method}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop: table */}
      {!isMobile && (
        <Card theme={theme} padding="p-0">
          <div className="grid grid-cols-[1fr_2fr_2fr_1.4fr_1.4fr_1fr_1fr_30px] text-[10.5px] font-mono uppercase tracking-wider px-4 py-2"
               style={{ color: t.subtle, borderBottom: `1px solid ${t.borderSoft}` }}>
            <div>Folio</div>
            <div>Paciente</div>
            <div>Concepto</div>
            <div>Método</div>
            <div>Fecha</div>
            <div className="text-right">Monto</div>
            <div>Estado</div>
            <div></div>
          </div>
          {filtered.map((p, i) => {
            const ss = statusStyle(p.status);
            return (
              <div key={p.id} className="grid grid-cols-[1fr_2fr_2fr_1.4fr_1.4fr_1fr_1fr_30px] items-center px-4 py-2.5 text-[12.5px] hover:bg-white/[0.03] transition-colors"
                   style={{ borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}`, color: t.text }}>
                <div className="font-mono text-[11px]" style={{ color: t.muted }}>{p.id}</div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9.5px] font-semibold shrink-0"
                       style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>{p.init}</div>
                  <span className="truncate font-medium tracking-tightish">{p.patient}</span>
                </div>
                <div className="truncate" style={{ color: t.muted }}>{p.concept}</div>
                <div className="truncate text-[11.5px]" style={{ color: t.muted }}>{p.method}</div>
                <div className="font-mono text-[11.5px]" style={{ color: t.muted }}>{p.date}</div>
                <div className="text-right font-mono">${p.amount.toLocaleString("es-MX")}</div>
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: ss.bg, color: ss.c, border: `1px solid ${ss.c}55` }}>
                    <span className="w-1 h-1 rounded-full bg-current"/> {p.status}
                  </span>
                </div>
                <div className="text-right opacity-50"><IconMore size={13} style={{ color: t.muted }}/></div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

Object.assign(window, { Payments });
