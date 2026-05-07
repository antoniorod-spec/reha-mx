/* Patient record — Carlos Vázquez */

const Patient = ({ theme }) => {
  const t = tokens(theme);
  const [tab, setTab] = React.useState("Resumen");
  const tabs = ["Resumen", "Evaluaciones", "Protocolo activo", "Sesiones", "Estudios", "Facturación"];
  const p = PATIENT;

  return (
    <div className="px-6 pt-5 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-[18px] font-semibold shrink-0"
               style={{ background: "linear-gradient(135deg, #1B3A5C, #3FBCD4)", color: "#FFFFFF" }}>{p.init}</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-tighter2" style={{ color: t.text }}>{p.name}</h1>
              <Badge theme={theme} color={t.info}>EXP-001247</Badge>
            </div>
            <div className="text-[12.5px] font-mono mt-1" style={{ color: t.muted }}>
              {p.age} años · {p.sport} · {p.diagnosis}
            </div>
            <div className="flex items-center gap-3 mt-2 text-[11.5px]">
              <span className="flex items-center gap-1.5" style={{ color: t.muted }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#3FBCD4" }}/>
                {p.branch}
              </span>
              <span style={{ color: t.subtle }}>·</span>
              <span style={{ color: t.muted }}>Fisio principal: <span style={{ color: t.text }}>{p.fisio}</span></span>
              <span style={{ color: t.subtle }}>·</span>
              <span style={{ color: t.muted }}>Inicio: {p.startDate}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-md text-[12px] font-medium flex items-center gap-1.5" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconMessage size={13}/> Mensaje
          </button>
          <button className="px-3 py-1.5 rounded-md text-[12px] font-semibold flex items-center gap-1.5" style={{ background: t.accent, color: "#06101C" }}>
            <IconPlus size={13}/> Registrar sesión
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b" style={{ borderColor: t.border }}>
        {tabs.map((x) => (
          <button key={x} onClick={() => setTab(x)}
                  className="relative px-3 py-2 text-[12.5px] font-medium tracking-tightish"
                  style={{ color: tab === x ? t.text : t.muted }}>
            {x}
            {tab === x && <span className="absolute left-2 right-2 -bottom-px h-[2px] rounded-t" style={{ background: t.accent }}/>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Left col - 2/3 */}
        <div className="col-span-2 space-y-3">
          {/* Summary card */}
          <Card theme={theme} padding="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Objetivo funcional</div>
                <div className="text-[14px] font-semibold tracking-tightish mt-1" style={{ color: t.text }}>{p.goal}</div>
              </div>
              <div>
                <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Alta estimada</div>
                <div className="text-[14px] font-semibold tracking-tightish mt-1" style={{ color: t.text }}>{p.expectedDischarge}</div>
                <div className="text-[10.5px] font-mono" style={{ color: t.good }}>en línea con plan</div>
              </div>
              <div>
                <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Sesiones</div>
                <div className="text-[14px] font-semibold tracking-tightish mt-1" style={{ color: t.text }}>{p.sessionsDone} / {p.sessionsTotal}</div>
                <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: t.surface2 }}>
                  <div className="h-full rounded-full" style={{ width: `${(p.sessionsDone / p.sessionsTotal) * 100}%`, background: t.accent }}/>
                </div>
              </div>
            </div>
          </Card>

          {/* Pain EVA */}
          <Card theme={theme} padding="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Evolución del dolor (EVA)</div>
                <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>Últimas 8 semanas · escala 0–10</div>
              </div>
              <div className="text-right">
                <div className="text-[20px] font-semibold tracking-tighter2" style={{ color: t.text }}>2.0</div>
                <div className="text-[10.5px] font-mono" style={{ color: t.good }}>−5.5 vs S1</div>
              </div>
            </div>
            <LineChart
              data={PAIN_EVA.map(d => ({ x: d.w, eva: d.v }))}
              series={[{ key: "eva", color: "#3FBCD4", label: "EVA" }]}
              height={180} theme={theme} yMax={10} formatY={(v) => v.toFixed(0)} showLegend={false}
            />
          </Card>

          {/* Strength */}
          <Card theme={theme} padding="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Fuerza isométrica de cuádriceps</div>
                <div className="text-[11px] font-mono mt-0.5" style={{ color: t.subtle }}>Pico de torque · Nm/kg · LSI {(63/67*100).toFixed(0)}%</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono" style={{ color: t.subtle }}>Meta retorno</div>
                <div className="text-[12px] font-semibold tracking-tightish" style={{ color: t.accent }}>≥ 90% LSI</div>
              </div>
            </div>
            <LineChart
              data={QUAD_FORCE.map(d => ({ x: d.w, afecto: d.afecto, sano: d.sano }))}
              series={[
                { key: "afecto", color: "#3FBCD4", label: "Lado afecto" },
                { key: "sano",   color: "#5B8AC9", label: "Lado sano" },
              ]}
              height={180} theme={theme} yMax={80} formatY={(v) => `${v}`}
            />
          </Card>
        </div>

        {/* Right col 1/3 */}
        <div className="space-y-3">
          {/* Wearable */}
          <Card theme={theme} padding="p-0">
            <div className="px-4 pt-4 pb-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <IconWatch size={14} style={{ color: t.accent }}/>
                  <span className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Wearable conectado</span>
                </div>
                <div className="text-[10.5px] font-mono mt-1" style={{ color: t.subtle }}>{WEARABLE.device}</div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(52,211,153,0.12)", color: "#34D399", border: "1px solid rgba(52,211,153,0.4)" }}>
                <span className="w-1 h-1 rounded-full bg-current"/> Sync · {WEARABLE.lastSync}
              </span>
            </div>
            <div className="grid grid-cols-2 border-t" style={{ borderColor: t.border }}>
              {[
                { l: "HRV (rMSSD)", v: WEARABLE.hrv.v, u: "ms", d: WEARABLE.hrv.delta, good: true },
                { l: "Sueño",       v: WEARABLE.sleep.v, u: "", d: WEARABLE.sleep.delta, good: true },
                { l: "Carga semana", v: WEARABLE.load.v, u: "TSS", d: WEARABLE.load.delta, good: true },
                { l: "FC reposo",    v: WEARABLE.rhr.v, u: "bpm", d: WEARABLE.rhr.delta, good: true },
              ].map((m, i) => (
                <div key={i} className="px-4 py-3" style={{ borderTop: i > 1 ? `1px solid ${t.border}` : "none", borderLeft: i % 2 === 1 ? `1px solid ${t.border}` : "none" }}>
                  <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{m.l}</div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[18px] font-semibold tracking-tighter2" style={{ color: t.text }}>{m.v}</span>
                    {m.u && <span className="text-[10px] font-mono" style={{ color: t.subtle }}>{m.u}</span>}
                  </div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: m.good ? t.good : t.bad }}>{m.d}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Protocol summary */}
          <Card theme={theme} padding="p-0">
            <div className="px-4 pt-4 pb-3">
              <div className="text-[13px] font-semibold tracking-tightish" style={{ color: t.text }}>Protocolo activo</div>
              <div className="text-[10.5px] font-mono mt-0.5" style={{ color: t.subtle }}>LCA · Fase 3 · Fuerza & control</div>
            </div>
            <div>
              {[
                { name: "Sentadilla búlgara con TRX",   meta: "3 × 10 · lado afecto",  done: 14 },
                { name: "Step-up lateral con carga",    meta: "3 × 12 · bilateral",    done: 13 },
                { name: "Hip thrust unilateral",        meta: "4 × 8 · lado afecto",   done: 12 },
                { name: "Cadena propioceptiva BOSU",    meta: "3 × 45s · bilateral",   done: 10 },
              ].map((e, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-2.5" style={{ borderTop: `1px solid ${t.borderSoft}` }}>
                  <div className="w-9 h-9 rounded-md shrink-0 flex items-center justify-center"
                       style={{ background: ["linear-gradient(135deg,#1F2937,#0F172A)","linear-gradient(135deg,#2A1A0E,#1A0F08)","linear-gradient(135deg,#1A2330,#0E141C)","linear-gradient(135deg,#21171C,#15101A)"][i] }}>
                    <IconPlay size={11} style={{ color: "#FFFFFF" }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium tracking-tightish truncate" style={{ color: t.text }}>{e.name}</div>
                    <div className="text-[10.5px] font-mono truncate" style={{ color: t.subtle }}>{e.meta}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-mono" style={{ color: t.muted }}>{e.done}/14</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Documents */}
          <Card theme={theme} padding="p-4">
            <div className="text-[13px] font-semibold tracking-tightish mb-2" style={{ color: t.text }}>Estudios recientes</div>
            <div className="space-y-1.5">
              {[
                { name: "Resonancia rodilla derecha.pdf", date: "12 Mar 2026", type: "RM" },
                { name: "Informe quirúrgico LCA.pdf",     date: "08 Mar 2026", type: "Cx" },
                { name: "Isocinético cuádriceps S6.csv",  date: "21 Abr 2026", type: "Iso" },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.03]">
                  <IconFile size={13} style={{ color: t.muted }}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11.5px] font-medium tracking-tightish truncate" style={{ color: t.text }}>{d.name}</div>
                    <div className="text-[10px] font-mono" style={{ color: t.subtle }}>{d.date}</div>
                  </div>
                  <Badge theme={theme} color={t.muted}>{d.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Patient });
