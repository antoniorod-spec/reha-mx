/* Facturación CFDI 4.0 — México */

const Billing = ({ theme, isMobile }) => {
  const t = tokens(theme);
  const [filter, setFilter] = React.useState("Todos");

  const filters = [
    { id: "Todos",     count: CFDI_LIST.length },
    { id: "Timbrado",  count: CFDI_LIST.filter(p => p.status === "Timbrado").length },
    { id: "En cola",   count: CFDI_LIST.filter(p => p.status === "En cola").length },
    { id: "Cancelado", count: CFDI_LIST.filter(p => p.status === "Cancelado").length },
  ];

  const filtered = filter === "Todos" ? CFDI_LIST : CFDI_LIST.filter(p => p.status === filter);

  const statusStyle = (s) => {
    if (s === "Timbrado")  return { c: t.good, bg: "rgba(52,211,153,0.12)" };
    if (s === "En cola")   return { c: "#F59E0B", bg: "rgba(245,158,11,0.12)" };
    if (s === "Cancelado") return { c: t.bad, bg: "rgba(248,113,113,0.12)" };
    return { c: t.muted, bg: t.surface2 };
  };

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Facturación CFDI 4.0 · SAT</div>
          <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>Facturación</h1>
          <div className="text-[12px] sm:text-[12.5px] mt-1.5 flex items-center gap-2" style={{ color: t.muted }}>
            <span>1,284 timbradas en abril</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(52,211,153,0.12)", color: t.good, border: `1px solid ${t.good}55` }}>
              <span className="w-1 h-1 rounded-full bg-current"/> PAC en línea
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex px-3 py-1.5 rounded-md text-[12px] font-medium items-center gap-1.5" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconDownload size={13}/> Descarga masiva
          </button>
          <button className="hidden sm:flex px-3 py-1.5 rounded-md text-[12px] font-medium items-center gap-1.5" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconReceipt size={13}/> Complemento pago
          </button>
          <button className="px-3 py-1.5 rounded-md text-[12px] sm:text-[12.5px] font-semibold flex items-center gap-1.5 no-wrap" style={{ background: t.accent, color: "#06101C" }}>
            <IconPlus size={13}/> Emitir CFDI
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-3 sm:mb-5">
        {CFDI_KPIS.map((k, i) => <KPICard key={i} theme={theme} k={k}/>)}
      </div>

      {/* Issuer card */}
      <Card theme={theme} padding="p-0" className="mb-3 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-0">
          <div className="px-4 py-3 border-b sm:border-b-0 sm:border-r" style={{ borderColor: t.border }}>
            <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: t.subtle }}>Emisor</div>
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>{ORG_INFO.name}</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: t.muted }}>{ORG_INFO.rfc} · Régimen 601</div>
          </div>
          <div className="px-4 py-3 border-b sm:border-b-0 sm:border-r" style={{ borderColor: t.border }}>
            <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: t.subtle }}>Serie · Folio</div>
            <div className="text-[13px] font-semibold tracking-tightish font-mono" style={{ color: t.text }}>MW-A-01284</div>
            <div className="text-[11px] font-mono mt-0.5" style={{ color: t.muted }}>Próximo: 01285</div>
          </div>
          <div className="px-4 py-3 border-b sm:border-b-0 sm:border-r" style={{ borderColor: t.border }}>
            <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: t.subtle }}>Cert. SAT</div>
            <div className="text-[13px] font-semibold tracking-tightish font-mono truncate" style={{ color: t.text }}>{ORG_INFO.cer.slice(0, 12)}…</div>
            <div className="text-[11px] font-mono mt-0.5 flex items-center gap-1" style={{ color: t.good }}>
              <IconShield size={10}/> Vigente · exp {ORG_INFO.expCer}
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: t.subtle }}>PAC</div>
            <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Finkok</div>
            <div className="text-[11px] font-mono mt-0.5 flex items-center gap-1" style={{ color: t.good }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.good, boxShadow: `0 0 6px ${t.good}` }}/> Operando · 84ms
            </div>
          </div>
        </div>
      </Card>

      {/* Filter chips */}
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
          {filtered.map((c) => {
            const ss = statusStyle(c.status);
            return (
              <div key={c.folio} className="rounded-lg p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-[11px] font-mono font-semibold" style={{ color: t.accent }}>{c.folio}</div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                            style={{ background: ss.bg, color: ss.c, border: `1px solid ${ss.c}55` }}>
                        <span className="w-1 h-1 rounded-full bg-current"/> {c.status}
                      </span>
                    </div>
                    <div className="text-[13px] font-semibold tracking-tightish mt-1 truncate" style={{ color: t.text }}>{c.razon}</div>
                    <div className="text-[10.5px] font-mono mt-0.5 truncate" style={{ color: t.subtle }}>{c.rfc}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[15px] font-semibold tracking-tighter2" style={{ color: t.text }}>${c.total.toLocaleString("es-MX")}</div>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: t.subtle }}>{c.metodo} · {c.uso}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: t.borderSoft }}>
                  <div className="text-[10.5px] font-mono truncate flex-1" style={{ color: t.subtle }}>UUID: {c.uuid}</div>
                  <div className="text-[10.5px] font-mono shrink-0 ml-2" style={{ color: t.muted }}>{c.date}</div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                  <button className="px-2 py-1.5 rounded-md text-[10.5px] font-medium" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>
                    PDF
                  </button>
                  <button className="px-2 py-1.5 rounded-md text-[10.5px] font-medium" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>
                    XML
                  </button>
                  <button className="px-2 py-1.5 rounded-md text-[10.5px] font-medium flex items-center justify-center gap-1" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>
                    <IconWhatsApp size={11}/> Enviar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Desktop: table */}
      {!isMobile && (
        <Card theme={theme} padding="p-0">
          <div className="grid grid-cols-[1.2fr_1.2fr_1.2fr_2fr_0.8fr_0.8fr_0.8fr_1fr_1fr_60px] text-[10.5px] font-mono uppercase tracking-wider px-4 py-2"
               style={{ color: t.subtle, borderBottom: `1px solid ${t.borderSoft}` }}>
            <div>Folio</div>
            <div>UUID</div>
            <div>RFC</div>
            <div>Razón social</div>
            <div>Uso</div>
            <div>Forma</div>
            <div>Método</div>
            <div className="text-right">Total</div>
            <div>Estado</div>
            <div></div>
          </div>
          {filtered.map((c, i) => {
            const ss = statusStyle(c.status);
            return (
              <div key={c.folio} className="grid grid-cols-[1.2fr_1.2fr_1.2fr_2fr_0.8fr_0.8fr_0.8fr_1fr_1fr_60px] items-center px-4 py-2.5 text-[12.5px] hover:bg-white/[0.03] transition-colors"
                   style={{ borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}`, color: t.text }}>
                <div className="font-mono text-[11px] font-semibold" style={{ color: t.accent }}>{c.folio}</div>
                <div className="font-mono text-[11px] truncate" style={{ color: t.subtle }}>{c.uuid}</div>
                <div className="font-mono text-[11px] truncate" style={{ color: t.muted }}>{c.rfc}</div>
                <div className="truncate font-medium tracking-tightish">{c.razon}</div>
                <div className="font-mono text-[11px]" style={{ color: t.muted }}>{c.uso}</div>
                <div className="font-mono text-[11px]" style={{ color: t.muted }}>{c.forma}</div>
                <div className="font-mono text-[11px]">
                  <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>{c.metodo}</span>
                </div>
                <div className="text-right font-mono">${c.total.toLocaleString("es-MX")}</div>
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: ss.bg, color: ss.c, border: `1px solid ${ss.c}55` }}>
                    <span className="w-1 h-1 rounded-full bg-current"/> {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <button className="w-6 h-6 rounded-md flex items-center justify-center" title="PDF" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}><IconDownload size={11}/></button>
                  <button className="w-6 h-6 rounded-md flex items-center justify-center" title="Más" style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}><IconMore size={11}/></button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Footer note */}
      <div className="mt-4 flex items-center gap-2 text-[11px] font-mono" style={{ color: t.subtle }}>
        <IconShield size={12} style={{ color: t.good }}/>
        Todas las facturas se timbran ante el SAT vía Finkok · Cumplimiento CFDI 4.0 verificado el 03 Abr 2026
      </div>
    </div>
  );
};

Object.assign(window, { Billing });
