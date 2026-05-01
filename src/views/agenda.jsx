/* Agenda — mobile-first redesign (iOS Calendar / Cron pattern) + desktop week grid */

/* ───── Helpers ───── */
const fmtTime = (s) => {
  const startBase = 8;
  const totalMin = Math.round((startBase + s) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};
const endTime = (s, dur) => fmtTime(s + dur);
const fullMonth = "Mayo 2026";

const FULL_DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const branchPill = (name) => {
  const b = BRANCHES.find(x => x.short === name);
  return b ? { color: b.color, name: b.short } : { color: "#9BB3C4", name: name || "—" };
};

const periodOf = (s) => {
  const startBase = 8;
  const h = startBase + s;
  if (h < 12) return "Mañana";
  if (h < 18) return "Tarde";
  return "Noche";
};

/* ───── Mobile: day strip ───── */
const DayStrip = ({ theme, dayIdx, setDayIdx }) => {
  const t = tokens(theme);
  const todayIdx = 0; // visual: Lun 4 es "hoy"
  return (
    <div className="px-4 pt-3 pb-2 sticky top-0 z-20" style={{ background: t.bg, borderBottom: `1px solid ${t.borderSoft}` }}>
      {/* Month + arrows */}
      <div className="flex items-center justify-between mb-2.5">
        <button className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
          <IconChevronLeft size={14}/>
        </button>
        <div className="text-[14px] font-semibold tracking-tightish" style={{ color: t.text }}>{fullMonth}</div>
        <button className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
          <IconChevronRight size={14}/>
        </button>
      </div>
      {/* 7-day pills */}
      <div className="grid grid-cols-7 gap-1.5">
        {AGENDA_DAYS.map((d, i) => {
          const active = i === dayIdx;
          const isToday = i === todayIdx;
          const hasAppts = APPTS.some(a => a.d === i);
          return (
            <button key={i} onClick={() => setDayIdx(i)}
                    className="rounded-lg flex flex-col items-center justify-center transition-colors"
                    style={{
                      height: 56,
                      background: active ? t.accent : "transparent",
                      border: `1px solid ${active ? t.accent : isToday ? t.accent + "55" : "transparent"}`,
                    }}>
              <span className="text-[10px] font-mono uppercase tracking-wider"
                    style={{ color: active ? "rgba(6,16,28,0.7)" : isToday ? t.accent : t.subtle }}>{d.label.slice(0, 1)}</span>
              <span className="text-[18px] font-semibold tracking-tighter2 leading-tight"
                    style={{ color: active ? "#06101C" : isToday ? t.accent : t.text }}>{d.date}</span>
              {hasAppts && (
                <span className="w-1 h-1 rounded-full mt-0.5"
                      style={{ background: active ? "#06101C" : t.accent, opacity: active ? 0.7 : 1 }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ───── Mobile: appointment card ───── */
const ApptCard = ({ theme, a, onTap }) => {
  const t = tokens(theme);
  const cfg = APPT_TYPES[a.t];
  const bp = branchPill(a.b);
  return (
    <button onClick={onTap}
            className="w-full text-left rounded-lg flex stretch overflow-hidden transition-all active:scale-[0.99]"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <div style={{ width: 4, background: cfg.bar, alignSelf: "stretch", flexShrink: 0 }}/>
      <div className="flex-1 min-w-0 px-3.5 py-3">
        {/* Row 1: time + confirmation + branch */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[15px] font-semibold tracking-tightish font-mono" style={{ color: t.text }}>{fmtTime(a.s)}</span>
          {a.c && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full" style={{ background: "rgba(34,197,94,0.18)" }} title="Confirmada por WhatsApp">
              <IconCheck size={10} style={{ color: "#34D399" }}/>
            </span>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-[11.5px] font-mono" style={{ color: t.muted }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: bp.color }}/>
            {bp.name}
          </div>
        </div>
        {/* Row 2: patient name (allow up to 2 lines, no ellipsis-on-1-line) */}
        <div className="text-[15px] font-semibold leading-snug tracking-tightish" style={{ color: t.text, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {a.p}
        </div>
        {/* Row 3: type · fisio · duration */}
        <div className="text-[12.5px] mt-1 leading-snug" style={{ color: t.muted }}>
          <span style={{ color: cfg.bar, fontWeight: 600 }}>{cfg.label}</span>
          <span className="mx-1.5" style={{ color: t.subtle }}>·</span>
          <span>{a.f}</span>
          <span className="mx-1.5" style={{ color: t.subtle }}>·</span>
          <span className="font-mono">{a.mins} min</span>
        </div>
      </div>
    </button>
  );
};

/* ───── Mobile: day list (default) ───── */
const DayList = ({ theme, dayAppts, onTap }) => {
  const t = tokens(theme);
  const periods = ["Mañana", "Tarde", "Noche"];
  const grouped = periods.map(p => ({ p, items: dayAppts.filter(a => periodOf(a.s) === p) })).filter(g => g.items.length > 0);

  if (dayAppts.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <IconCalendar size={18} style={{ color: t.subtle }}/>
        </div>
        <div className="text-[14px] font-medium" style={{ color: t.muted }}>Sin citas este día</div>
        <div className="text-[12px] font-mono mt-1" style={{ color: t.subtle }}>Toca + para crear una</div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      {grouped.map(({ p, items }) => (
        <div key={p} className="mt-1">
          <div className="sticky top-[120px] z-10 -mx-4 px-4 py-2 flex items-center gap-2"
               style={{ background: t.bg, borderBottom: `1px solid ${t.borderSoft}` }}>
            <span className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{p}</span>
            <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>{items.length}</span>
          </div>
          <div className="space-y-2 pt-2">
            {items.map((a, i) => <ApptCard key={i} theme={theme} a={a} onTap={() => onTap(a)}/>)}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ───── Mobile: timeline view ───── */
const DayTimeline = ({ theme, dayAppts, onTap }) => {
  const t = tokens(theme);
  // build a list of distinct hour buckets used by today's appts
  const hours = [];
  for (let h = 7; h <= 20; h++) hours.push(h);

  return (
    <div className="px-4 pb-4 pt-2">
      {hours.map((h) => {
        const apptsAtHour = dayAppts.filter(a => Math.floor(8 + a.s) === h);
        return (
          <div key={h} className="flex gap-3 py-1.5" style={{ borderTop: h !== 7 ? `1px solid ${t.borderSoft}` : "none" }}>
            <div className="text-[11px] font-mono pt-2.5 text-right shrink-0" style={{ width: 40, color: apptsAtHour.length ? t.muted : t.subtle }}>{h.toString().padStart(2, "0")}:00</div>
            <div className="flex-1 min-w-0 py-1 space-y-1.5">
              {apptsAtHour.length === 0 && (
                <div className="h-8 rounded-md" style={{ background: "transparent" }}/>
              )}
              {apptsAtHour.map((a, i) => <ApptCard key={i} theme={theme} a={a} onTap={() => onTap(a)}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ───── Mobile: bottom sheet detail ───── */
const ApptSheet = ({ theme, a, onClose }) => {
  const t = tokens(theme);
  if (!a) return null;
  const cfg = APPT_TYPES[a.t];
  const bp = branchPill(a.b);
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-2xl max-h-[88vh] overflow-y-auto"
           style={{ background: t.surface, borderTop: `1px solid ${t.border}` }}>
        <div className="flex justify-center pt-2 pb-1"><div className="w-10 h-1 rounded-full" style={{ background: t.border }}/></div>
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono"
                  style={{ background: cfg.bg, color: cfg.fg, border: `1px solid ${cfg.border}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.bar }}/>{cfg.label}
            </span>
            {a.c && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-1.5 py-1 rounded" style={{ background: "rgba(34,197,94,0.12)", color: "#34D399", border: "1px solid rgba(34,197,94,0.4)" }}>
                <IconWhatsApp size={10}/> Confirmada
              </span>
            )}
          </div>
          <div className="text-[18px] font-semibold tracking-tighter2 leading-tight" style={{ color: t.text }}>{a.p}</div>
          <div className="text-[12.5px] font-mono mt-1" style={{ color: t.muted }}>
            {AGENDA_DAYS[a.d].label} {a.d === 0 ? "4" : AGENDA_DAYS[a.d].date} de mayo · {fmtTime(a.s)} → {endTime(a.s, a.dur)} · {a.mins} min
          </div>

          <div className="mt-4 rounded-lg overflow-hidden" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
            {[
              { l: "Fisio asignado", v: a.f },
              { l: "Sucursal",       v: bp.name, dot: bp.color },
              { l: "Sala",           v: "Sala 02 · Readaptación" },
              { l: "Sesión",         v: "12 / 24 del protocolo" },
            ].map((r, i) => (
              <div key={i} className="px-3 py-2.5 flex items-center justify-between" style={{ borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}` }}>
                <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{r.l}</div>
                <div className="text-[12.5px] font-medium tracking-tightish flex items-center gap-1.5" style={{ color: t.text }}>
                  {r.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.dot }}/>}
                  {r.v}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button className="px-3 py-3 rounded-md text-[13px] font-semibold flex items-center justify-center gap-1.5" style={{ background: t.accent, color: "#06101C" }}>
              <IconCheck size={13}/> Confirmar
            </button>
            <button className="px-3 py-3 rounded-md text-[13px] font-medium flex items-center justify-center gap-1.5" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>
              <IconClock size={13}/> Reagendar
            </button>
            <button className="px-3 py-3 rounded-md text-[13px] font-medium flex items-center justify-center gap-1.5" style={{ background: t.surface2, color: t.bad, border: `1px solid ${t.border}` }}>
              <IconX size={13}/> Cancelar
            </button>
            <button className="px-3 py-3 rounded-md text-[13px] font-medium flex items-center justify-center gap-1.5" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>
              <IconEdit size={13}/> Notas SOAP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───── Mobile container ───── */
const AgendaMobile = ({ theme, branchId }) => {
  const t = tokens(theme);
  const all = [...BRANCHES, CONSOLIDATED];
  const current = all.find(b => b.id === branchId);
  const [dayIdx, setDayIdx] = React.useState(0);
  const [view, setView] = React.useState("list"); // "list" | "timeline"
  const [selected, setSelected] = React.useState(null);

  // filter by branch
  const dayAppts = APPTS
    .filter(a => a.d === dayIdx)
    .filter(a => branchId === "all" || a.b === current.short)
    .sort((a, b) => a.s - b.s);

  const dayLabel = `${FULL_DAY_NAMES[dayIdx]} ${AGENDA_DAYS[dayIdx].date} de mayo`;
  const branchCount = new Set(dayAppts.map(a => a.b)).size;

  return (
    <div className="pb-24">
      {/* Title block (separate from sticky strip) */}
      <div className="px-4 pt-4 pb-2">
        <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Agenda · {current.short}</div>
        <h1 className="text-[22px] font-semibold tracking-tighter2 mt-1" style={{ color: t.text }}>Calendario</h1>
      </div>

      {/* Sticky day strip */}
      <DayStrip theme={theme} dayIdx={dayIdx} setDayIdx={setDayIdx}/>

      {/* Day header with view toggle */}
      <div className="px-4 py-3 flex items-center justify-between gap-3" style={{ borderBottom: `1px solid ${t.borderSoft}` }}>
        <div className="min-w-0">
          <div className="text-[16px] font-semibold tracking-tightish truncate" style={{ color: t.text }}>{dayLabel}</div>
          <div className="text-[12px] font-mono mt-0.5" style={{ color: t.subtle }}>
            {dayAppts.length} cita{dayAppts.length === 1 ? "" : "s"}{branchId === "all" && branchCount > 0 ? ` · ${branchCount} sucursal${branchCount === 1 ? "" : "es"}` : ""}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button className="w-9 h-9 rounded-md flex items-center justify-center relative" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconFilter size={14}/>
          </button>
          <div className="flex items-center p-0.5 rounded-md" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <button onClick={() => setView("list")}
                    className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                    style={{ background: view === "list" ? t.accent : "transparent", color: view === "list" ? "#06101C" : t.muted }}
                    title="Vista lista">
              <IconList size={14}/>
            </button>
            <button onClick={() => setView("timeline")}
                    className="w-8 h-8 rounded flex items-center justify-center transition-colors"
                    style={{ background: view === "timeline" ? t.accent : "transparent", color: view === "timeline" ? "#06101C" : t.muted }}
                    title="Vista timeline">
              <IconClock size={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === "list"
        ? <DayList theme={theme} dayAppts={dayAppts} onTap={setSelected}/>
        : <DayTimeline theme={theme} dayAppts={dayAppts} onTap={setSelected}/>
      }

      {/* FAB */}
      <button className="fixed z-40 rounded-full flex items-center justify-center"
              style={{
                bottom: "calc(env(safe-area-inset-bottom) + 80px)",
                right: 16,
                width: 56, height: 56,
                background: t.accent, color: "#06101C",
                boxShadow: "0 12px 28px rgba(63,188,212,0.45), 0 4px 8px rgba(0,0,0,0.4)",
              }}>
        <IconPlus size={20}/>
      </button>

      <ApptSheet theme={theme} a={selected} onClose={() => setSelected(null)}/>
    </div>
  );
};

/* ───── Desktop week grid (kept) ───── */
const AgendaDesktop = ({ theme, branchId }) => {
  const t = tokens(theme);
  const all = [...BRANCHES, CONSOLIDATED];
  const current = all.find(b => b.id === branchId);
  const visible = APPTS.filter(a => branchId === "all" || a.b === current.short);
  const [selectedIdx, setSelectedIdx] = React.useState(visible.findIndex(a => a.p.startsWith("Carlos")) || 1);
  const sel = visible[selectedIdx] || visible[0];
  const slotH = 56;

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-tighter2" style={{ color: t.text }}>Agenda</h1>
          <div className="text-[11.5px] sm:text-[12px] font-mono mt-1" style={{ color: t.subtle }}>Semana del 4 — 10 de mayo · {current.short}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-md overflow-hidden shrink-0" style={{ border: `1px solid ${t.border}` }}>
            <button className="w-8 h-8 flex items-center justify-center" style={{ color: t.muted, background: t.surface }}><IconChevronLeft size={14}/></button>
            <button className="px-3 h-8 text-[12px] font-medium" style={{ color: t.text, background: t.surface, borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}` }}>Hoy</button>
            <button className="w-8 h-8 flex items-center justify-center" style={{ color: t.muted, background: t.surface }}><IconChevronRight size={14}/></button>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono p-0.5 rounded-md shrink-0" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
            {["Día","Semana","Mes"].map((x, i) => (
              <button key={x} className="px-2 py-1 rounded" style={{ background: i === 1 ? t.surface : "transparent", color: i === 1 ? t.text : t.muted }}>{x}</button>
            ))}
          </div>
          <button className="px-3 py-1.5 rounded-md text-[12px] font-semibold flex items-center gap-1.5 no-wrap shrink-0" style={{ background: t.accent, color: "#06101C" }}>
            <IconPlus size={13}/> Nueva cita
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto h-scroll">
        {[
          { label: current.short,         dot: current.color },
          { label: "Todos los fisios",    dot: null },
          { label: "Todos los tipos",     dot: null },
        ].map((f, i) => (
          <button key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] shrink-0 no-wrap"
                  style={{ background: t.surface, border: `1px solid ${t.border}`, color: t.text }}>
            {f.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.dot }}/>}
            {f.label}
            <IconChevronDown size={11} style={{ color: t.muted }}/>
          </button>
        ))}
        <div className="hidden lg:flex ml-auto items-center gap-3 text-[11px] font-mono" style={{ color: t.subtle }}>
          {Object.entries(APPT_TYPES).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: v.bar }}/>
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        <Card theme={theme} padding="p-0" className="overflow-x-auto h-scroll">
          <div className="grid sticky top-0 z-10" style={{ gridTemplateColumns: `48px repeat(7, minmax(90px, 1fr))`, minWidth: 720, background: t.surface, borderBottom: `1px solid ${t.border}` }}>
            <div></div>
            {AGENDA_DAYS.map((d, i) => (
              <div key={i} className="px-2 py-2.5 text-center" style={{ borderLeft: `1px solid ${t.borderSoft}` }}>
                <div className="text-[10px] font-mono uppercase" style={{ color: t.subtle }}>{d.label}</div>
                <div className="text-[15px] font-semibold tracking-tightish mt-0.5" style={{ color: i === 0 ? t.accent : t.text }}>{d.date}</div>
              </div>
            ))}
          </div>
          <div className="grid relative" style={{ gridTemplateColumns: `48px repeat(7, 1fr)`, minWidth: 720 }}>
            <div>
              {AGENDA_HOURS.map((h, i) => (
                <div key={i} className="text-[10px] font-mono pr-2 text-right" style={{ height: slotH, color: t.subtle, paddingTop: 2 }}>{h}:00</div>
              ))}
            </div>
            {AGENDA_DAYS.map((_, di) => (
              <div key={di} className="relative" style={{ borderLeft: `1px solid ${t.borderSoft}` }}>
                {AGENDA_HOURS.map((_, hi) => (
                  <div key={hi} style={{ height: slotH, borderTop: hi === 0 ? "none" : `1px solid ${t.borderSoft}` }}/>
                ))}
                {visible.filter(a => a.d === di).map((a, ai) => {
                  const idx = visible.indexOf(a);
                  const cfg = APPT_TYPES[a.t];
                  const isSel = idx === selectedIdx;
                  return (
                    <button key={ai} onClick={() => setSelectedIdx(idx)}
                            className="absolute left-1 right-1 rounded-md text-left px-2 py-1.5 transition-all overflow-hidden"
                            style={{
                              top: a.s * slotH + 2,
                              height: a.dur * slotH - 4,
                              background: cfg.bg,
                              border: `1px solid ${isSel ? cfg.fg : cfg.border}`,
                              boxShadow: isSel ? `0 0 0 2px ${cfg.fg}33` : "none",
                            }}>
                      <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: cfg.fg }}>
                        <span>{fmtTime(a.s)}</span>
                        {a.c && <IconCheck size={9} style={{ color: "#34D399" }}/>}
                      </div>
                      <div className="text-[11.5px] font-semibold leading-tight tracking-tightish mt-0.5 truncate" style={{ color: t.text }}>{a.p}</div>
                      <div className="text-[10px] font-mono mt-0.5 truncate" style={{ color: cfg.fg, opacity: 0.85 }}>{cfg.label}</div>
                      {a.dur >= 1.4 && (
                        <div className="text-[10px] font-mono mt-1 truncate opacity-70" style={{ color: t.muted }}>{a.f.split(" ").slice(0, 2).join(" ")}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* Right rail */}
        {sel && (
          <Card theme={theme} padding="p-0" className="self-start sticky" style={{ top: 70 }}>
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono"
                      style={{ background: APPT_TYPES[sel.t].bg, color: APPT_TYPES[sel.t].fg, border: `1px solid ${APPT_TYPES[sel.t].border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: APPT_TYPES[sel.t].bar }}/>{APPT_TYPES[sel.t].label}
                </span>
                {sel.c && (
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.12)", color: "#34D399", border: "1px solid rgba(34,197,94,0.4)" }}>
                    <IconWhatsApp size={10}/> Confirmada
                  </span>
                )}
              </div>
              <div className="text-[16px] font-semibold tracking-tightish" style={{ color: t.text }}>{sel.p}</div>
              <div className="text-[11.5px] font-mono mt-1" style={{ color: t.muted }}>
                {AGENDA_DAYS[sel.d].label} {AGENDA_DAYS[sel.d].date} · {fmtTime(sel.s)} → {endTime(sel.s, sel.dur)} · {sel.mins} min
              </div>
            </div>
            <div className="border-t" style={{ borderColor: t.border }}>
              {[
                { l: "Fisio asignado", v: sel.f, dot: t.accent },
                { l: "Sucursal",       v: branchPill(sel.b).name, dot: branchPill(sel.b).color },
                { l: "Sala",           v: "Sala 02 · Readaptación" },
                { l: "Sesión",         v: "12 / 24 del protocolo" },
                { l: "Motivo",         v: "LCA derecho · Fase de fuerza" },
              ].map((r, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: i === 0 ? "none" : `1px solid ${t.borderSoft}` }}>
                  <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{r.l}</div>
                  <div className="text-[12px] font-medium tracking-tightish flex items-center gap-1.5" style={{ color: t.text }}>
                    {r.dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.dot }}/>}
                    {r.v}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t" style={{ borderColor: t.border }}>
              <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: t.subtle }}>Notas SOAP</div>
              <div className="text-[12px] leading-relaxed" style={{ color: t.muted }}>
                S: refiere mejoría en flexión activa, leve molestia en saltos.<br/>
                O: ROM 0-130°, fuerza isométrica cuádriceps 63% LSI…
              </div>
              <button className="text-[11px] font-mono mt-2" style={{ color: t.accent }}>Ver nota completa →</button>
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 py-3 border-t" style={{ borderColor: t.border }}>
              <button className="px-3 py-2 rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5" style={{ background: t.accent, color: "#06101C" }}>
                <IconCheck size={13}/> Confirmar
              </button>
              <button className="px-3 py-2 rounded-md text-[12px] font-medium flex items-center justify-center gap-1.5" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>
                <IconClock size={13}/> Reagendar
              </button>
              <button className="px-3 py-2 rounded-md text-[12px] font-medium flex items-center justify-center gap-1.5" style={{ background: t.surface2, color: t.bad, border: `1px solid ${t.border}` }}>
                Cancelar
              </button>
              <button className="px-3 py-2 rounded-md text-[12px] font-medium flex items-center justify-center gap-1.5" style={{ background: t.surface2, color: t.text, border: `1px solid ${t.border}` }}>
                <IconEdit size={13}/> Notas SOAP
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

/* ───── Top-level Agenda dispatcher ───── */
const Agenda = ({ theme, branchId, isMobile }) => {
  return isMobile
    ? <AgendaMobile theme={theme} branchId={branchId}/>
    : <AgendaDesktop theme={theme} branchId={branchId}/>;
};

Object.assign(window, { Agenda });
