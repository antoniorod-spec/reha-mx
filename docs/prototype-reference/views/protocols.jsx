/* Protocolos — biblioteca clínica */

const Protocols = ({ theme, isMobile }) => {
  const t = tokens(theme);
  const [region, setRegion] = React.useState("Todos");
  const [selected, setSelected] = React.useState(PROTOCOLS[0]);

  const filtered = region === "Todos" ? PROTOCOLS : PROTOCOLS.filter(p => p.region === region);

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <div className="text-[10.5px] sm:text-[11px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Biblioteca clínica</div>
          <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>Protocolos</h1>
          <div className="text-[12px] sm:text-[12.5px] mt-1.5" style={{ color: t.muted }}>27 plantillas · {PROTOCOLS.reduce((a, p) => a + p.used, 0)} pacientes asignados</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex px-3 py-1.5 rounded-md text-[12px] font-medium items-center gap-1.5" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconBook size={13}/> Importar evidencia
          </button>
          <button className="px-3 py-1.5 rounded-md text-[12px] sm:text-[12.5px] font-semibold flex items-center gap-1.5 no-wrap" style={{ background: t.accent, color: "#06101C" }}>
            <IconPlus size={13}/> Nuevo protocolo
          </button>
        </div>
      </div>

      {/* Region overview chips */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {PROTOCOL_REGIONS.map((r) => (
          <button key={r.name} onClick={() => setRegion(r.name)}
                  className="rounded-lg p-3 text-left transition-colors"
                  style={{ background: t.surface, border: `1px solid ${region === r.name ? r.color + "88" : t.border}` }}>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color, boxShadow: `0 0 6px ${r.color}` }}/>
              <span className="text-[11px] font-medium tracking-tightish" style={{ color: t.text }}>{r.name}</span>
            </div>
            <div className="text-[20px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>{r.count}</div>
            <div className="text-[10px] font-mono" style={{ color: t.subtle }}>protocolos</div>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="h-scroll mb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-1.5 no-wrap">
          {["Todos", ...PROTOCOL_REGIONS.map(r => r.name)].map((r) => {
            const active = r === region;
            return (
              <button key={r} onClick={() => setRegion(r)}
                      className="px-2.5 py-1.5 rounded-md text-[11.5px] font-medium shrink-0 transition-colors"
                      style={{ background: active ? t.accentSoft : t.surface, color: active ? t.accent : t.muted, border: `1px solid ${active ? t.accent + "55" : t.border}` }}>
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: stacked cards */}
      {isMobile && (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-lg p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono" style={{ color: t.subtle }}>{p.id} · {p.region}</div>
                  <div className="text-[14px] font-semibold tracking-tightish mt-0.5" style={{ color: t.text }}>{p.name}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0" style={{ background: t.accentSoft, color: t.accent, border: `1px solid ${t.accent}55` }}>
                  {p.used} pac.
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 py-2 border-t border-b" style={{ borderColor: t.borderSoft }}>
                <div>
                  <div className="text-[14px] font-semibold tracking-tightish" style={{ color: t.text }}>{p.weeks}<span className="text-[10px] font-mono" style={{ color: t.subtle }}> sem</span></div>
                  <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Duración</div>
                </div>
                <div>
                  <div className="text-[14px] font-semibold tracking-tightish" style={{ color: t.text }}>{p.phases}</div>
                  <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Fases</div>
                </div>
                <div>
                  <div className="text-[14px] font-semibold tracking-tightish" style={{ color: t.text }}>{p.exercises}</div>
                  <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Ejerc.</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px]" style={{ color: t.subtle }}>
                <span className="font-mono truncate">{p.author}</span>
                <span className="font-mono shrink-0 ml-2">{p.last}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop: split view (list + detail) */}
      {!isMobile && (
        <div className="grid grid-cols-[1.5fr_1fr] gap-3">
          <Card theme={theme} padding="p-0">
            <div className="grid grid-cols-[2fr_1fr_0.8fr_0.8fr_0.8fr_30px] text-[10.5px] font-mono uppercase tracking-wider px-4 py-2"
                 style={{ color: t.subtle, borderBottom: `1px solid ${t.borderSoft}` }}>
              <div>Protocolo</div>
              <div>Región / tipo</div>
              <div className="text-right">Sem.</div>
              <div className="text-right">Ejerc.</div>
              <div className="text-right">En uso</div>
              <div></div>
            </div>
            {filtered.map((p, i) => {
              const active = selected.id === p.id;
              const region = PROTOCOL_REGIONS.find(r => r.name === p.region) || { color: t.accent };
              return (
                <button key={p.id} onClick={() => setSelected(p)}
                        className="w-full grid grid-cols-[2fr_1fr_0.8fr_0.8fr_0.8fr_30px] items-center px-4 py-2.5 text-[12.5px] transition-colors text-left"
                        style={{ borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}`, color: t.text, background: active ? t.surface2 : "transparent" }}>
                  <div className="min-w-0">
                    <div className="font-medium tracking-tightish truncate">{p.name}</div>
                    <div className="text-[10.5px] font-mono truncate" style={{ color: t.subtle }}>{p.id} · {p.author}</div>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: region.color }}/>
                    <span className="truncate" style={{ color: t.muted }}>{p.type}</span>
                  </div>
                  <div className="text-right font-mono">{p.weeks}</div>
                  <div className="text-right font-mono">{p.exercises}</div>
                  <div className="text-right">
                    <span className="inline-flex items-center text-[10.5px] font-mono px-1.5 py-0.5 rounded" style={{ background: t.accentSoft, color: t.accent, border: `1px solid ${t.accent}55` }}>
                      {p.used}
                    </span>
                  </div>
                  <div className="text-right opacity-50"><IconChevronRight size={13} style={{ color: t.muted }}/></div>
                </button>
              );
            })}
          </Card>

          <Card theme={theme} padding="p-0">
            <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: t.border }}>
              <div className="text-[10px] font-mono" style={{ color: t.subtle }}>{selected.id} · {selected.region}</div>
              <div className="text-[15px] font-semibold tracking-tightish mt-0.5" style={{ color: t.text }}>{selected.name}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge theme={theme} color={t.good}>{selected.used} pacientes activos</Badge>
                <Badge theme={theme} color={t.subtle}>{selected.last}</Badge>
              </div>
            </div>
            <div className="px-4 py-3 grid grid-cols-3 gap-2 border-b" style={{ borderColor: t.border }}>
              <div>
                <div className="text-[18px] font-semibold tracking-tighter2" style={{ color: t.text }}>{selected.weeks}<span className="text-[10px] font-mono" style={{ color: t.subtle }}> sem</span></div>
                <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Duración</div>
              </div>
              <div>
                <div className="text-[18px] font-semibold tracking-tighter2" style={{ color: t.text }}>{selected.phases}</div>
                <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Fases</div>
              </div>
              <div>
                <div className="text-[18px] font-semibold tracking-tighter2" style={{ color: t.text }}>{selected.exercises}</div>
                <div className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Ejercicios</div>
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: t.subtle }}>Estructura</div>
              {Array.from({ length: selected.phases }).map((_, i) => {
                const labels = ["Fase 1 · Movilidad y control", "Fase 2 · Fortalecimiento", "Fase 3 · Fuerza & potencia", "Fase 4 · Reentreno funcional", "Fase 5 · Retorno al deporte"];
                const wks = Math.ceil(selected.weeks / selected.phases);
                return (
                  <div key={i} className="flex items-center gap-2 py-1.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
                         style={{ background: t.surface2, color: t.accent, border: `1px solid ${t.border}` }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-medium tracking-tightish truncate" style={{ color: t.text }}>{labels[i]}</div>
                      <div className="text-[10.5px] font-mono" style={{ color: t.subtle }}>~{wks} sem · {Math.round(selected.exercises / selected.phases)} ejerc.</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 pt-3 pb-4 border-t" style={{ borderColor: t.border }}>
              <div className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: t.subtle }}>Evidencia</div>
              <div className="text-[11.5px] flex items-center gap-1.5" style={{ color: t.muted }}>
                <IconBook size={12} style={{ color: t.accent }}/>
                <span className="font-mono">{selected.evidence}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button className="px-2.5 py-1.5 rounded-md text-[11.5px] font-medium" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>Editar</button>
                <button className="px-2.5 py-1.5 rounded-md text-[11.5px] font-semibold" style={{ background: t.accent, color: "#06101C" }}>Asignar a paciente</button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Protocols });
