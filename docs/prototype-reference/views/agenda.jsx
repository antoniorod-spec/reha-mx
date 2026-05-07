/* Agenda — desktop multi-view (Día/Semana/Mes/Lista) + mobile preserved
   Helpers en agenda-helpers.jsx, sidebar en agenda-sidebar.jsx,
   vistas timeline en agenda-views-timeline.jsx,
   vistas mes/lista en agenda-views-month-list.jsx                       */

/* ───── Mobile pieces (sin cambios) ───── */
const DayStrip = ({ theme, dayIdx, setDayIdx }) => {
  const t = tokens(theme);
  const todayIdx = 0;
  return (
    <div className="px-4 pt-3 pb-2 sticky top-0 z-20" style={{ background: t.bg, borderBottom: `1px solid ${t.borderSoft}` }}>
      <div className="flex items-center justify-between mb-2.5">
        <button className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
          <IconChevronLeft size={14}/>
        </button>
        <div className="text-[14px] font-semibold tracking-tightish" style={{ color: t.text }}>Mayo 2026</div>
        <button className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
          <IconChevronRight size={14}/>
        </button>
      </div>
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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[15px] font-semibold tracking-tightish font-mono" style={{ color: t.text }}>{fmtTime(a.s)}</span>
          {a.c && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full" style={{ background: "rgba(34,197,94,0.18)" }}>
              <IconCheck size={10} style={{ color: "#34D399" }}/>
            </span>
          )}
          <div className="ml-auto flex items-center gap-1.5 text-[11.5px] font-mono" style={{ color: t.muted }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: bp.color }}/>
            {bp.name}
          </div>
        </div>
        <div className="text-[15px] font-semibold leading-snug tracking-tightish" style={{ color: t.text }}>{a.p}</div>
        <div className="text-[11.5px] font-mono mt-1.5 flex items-center gap-2" style={{ color: t.muted }}>
          <span className="px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.fg, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
          <span className="truncate">{a.f}</span>
        </div>
      </div>
    </button>
  );
};

const DayList = ({ theme, dayAppts, onTap }) => {
  const t = tokens(theme);
  const periods = ["Mañana", "Tarde", "Noche"];
  if (dayAppts.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <IconCalendar size={20} style={{ color: t.subtle }}/>
        </div>
        <div className="text-[13px] font-medium" style={{ color: t.muted }}>Sin citas este día</div>
      </div>
    );
  }
  return (
    <div className="px-4 py-3 space-y-4">
      {periods.map((p) => {
        const items = dayAppts.filter(a => periodOf(a.s) === p).sort((a, b) => a.s - b.s);
        if (items.length === 0) return null;
        return (
          <div key={p}>
            <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: t.subtle }}>{p}</div>
            <div className="space-y-2">
              {items.map((a, i) => <ApptCard key={i} theme={theme} a={a} onTap={() => onTap(a)}/>)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

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
            {AGENDA_DAYS[a.d].label} {AGENDA_DAYS[a.d].date} de mayo · {fmtTime(a.s)} → {endTime(a.s, a.dur)} · {a.mins} min
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

const AgendaMobile = ({ theme, branchId }) => {
  const t = tokens(theme);
  const all = [...BRANCHES, CONSOLIDATED];
  const current = all.find(b => b.id === branchId);
  const [dayIdx, setDayIdx] = React.useState(0);
  const [sel, setSel] = React.useState(null);
  const dayAppts = APPTS.filter(a =>
    a.d === dayIdx && (current.id === "all" || a.b === current.short)
  );
  return (
    <div className="min-h-screen" style={{ background: t.bg }}>
      <DayStrip theme={theme} dayIdx={dayIdx} setDayIdx={setDayIdx}/>
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{dayIdx === 0 ? "HOY" : "Día"}</div>
          <div className="text-[16px] font-semibold tracking-tightish" style={{ color: t.text }}>
            {FULL_DAY_NAMES[dayIdx]} {AGENDA_DAYS[dayIdx].date}
          </div>
        </div>
        <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: t.accent, color: "#06101C" }}>
          <IconPlus size={16}/>
        </button>
      </div>
      <DayList theme={theme} dayAppts={dayAppts} onTap={setSel}/>
      <ApptSheet theme={theme} a={sel} onClose={() => setSel(null)}/>
    </div>
  );
};

/* ───── Desktop multi-view container ───── */
const AgendaDesktop = ({ theme, branchId }) => {
  const t = tokens(theme);
  const all = [...BRANCHES, CONSOLIDATED];
  const current = all.find(b => b.id === branchId);

  const [view, setView] = React.useState("week"); // day | week | month | list
  const [dayIdx, setDayIdx] = React.useState(NOW_DAY_IDX);
  const [filters, setFilters] = React.useState({ branch: "all", fisio: "all", type: "all", colorBy: "type" });
  const [selectedIdx, setSelectedIdx] = React.useState(null);

  // Branch desde topbar tiene preferencia sobre filtro local
  const effectiveBranch = current.id === "all" ? filters.branch : current.short;

  const filteredAppts = APPTS.filter(a => {
    if (effectiveBranch !== "all" && a.b !== effectiveBranch) return false;
    if (filters.fisio !== "all" && a.f !== filters.fisio) return false;
    if (filters.type  !== "all" && a.t !== filters.type)  return false;
    return true;
  });

  // KPIs
  const total = filteredAppts.length;
  const confirmed = filteredAppts.filter(a => a.c).length;
  const occupancy = Math.min(100, Math.round((total / 90) * 100));

  const titleMap = {
    day:   `${FULL_DAY_NAMES[dayIdx]} ${AGENDA_DAYS[dayIdx].date} de mayo`,
    week:  "Semana 4 – 10 de mayo",
    month: "Mayo 2026",
    list:  "Próximas citas",
  };

  return (
    <div className="px-6 py-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tighter2" style={{ color: t.text }}>Agenda</h1>
          <div className="text-[13px] font-mono mt-0.5" style={{ color: t.muted }}>
            {titleMap[view]} · {current.id === "all" ? "Todas las sucursales" : current.name}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 rounded-md" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: t.muted }}><IconChevronLeft size={13}/></button>
            <button className="px-2.5 h-7 rounded text-[12px] font-medium" style={{ color: t.text, background: t.surface2 }}>Hoy</button>
            <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: t.muted }}><IconChevronRight size={13}/></button>
          </div>
          <div className="flex items-center gap-0.5 p-0.5 rounded-md" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            {[
              { v: "day",   l: "Día" },
              { v: "week",  l: "Semana" },
              { v: "month", l: "Mes" },
              { v: "list",  l: "Lista" },
            ].map(opt => {
              const active = view === opt.v;
              return (
                <button key={opt.v} onClick={() => setView(opt.v)}
                        className="px-3 h-7 rounded text-[12px] font-medium transition-colors"
                        style={{ background: active ? t.surface2 : "transparent", color: active ? t.text : t.muted }}>
                  {opt.l}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats compactas */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { l: "Citas hoy",     v: APPTS.filter(a => a.d === NOW_DAY_IDX).length, sub: "programadas" },
          { l: "Confirmadas",   v: `${confirmed}/${total}`, sub: `${total ? Math.round(confirmed/total*100) : 0}% WhatsApp` },
          { l: "Ocupación",     v: `${occupancy}%`, sub: "esta semana" },
          { l: "Cancelaciones", v: "3",  sub: "últimos 7 días" },
        ].map((k, i) => (
          <div key={i} className="rounded-md px-3 py-2.5" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <div className="text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{k.l}</div>
            <div className="text-[20px] font-semibold tracking-tighter2 mt-0.5" style={{ color: t.text }}>{k.v}</div>
            <div className="text-[10.5px] font-mono mt-0.5" style={{ color: t.muted }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Layout: sidebar + content */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "200px minmax(0, 1fr)" }}>
        <AgendaSidebar theme={theme} filters={filters} setFilters={setFilters} onCreateNew={() => {}}/>
        <div>
          {view === "day"   && <DayView   theme={theme} dayIdx={dayIdx} appts={filteredAppts} colorBy={filters.colorBy} selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx}/>}
          {view === "week"  && <WeekView  theme={theme}                  appts={filteredAppts} colorBy={filters.colorBy} selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx}/>}
          {view === "month" && <MonthView theme={theme}                  appts={filteredAppts} colorBy={filters.colorBy} onSelectDay={(d) => { setDayIdx(Math.max(0, Math.min(6, d - 4))); setView("day"); }} onApptClick={(a) => setSelectedIdx(filteredAppts.indexOf(a))}/>}
          {view === "list"  && <ListView  theme={theme}                  appts={filteredAppts} colorBy={filters.colorBy} selectedIdx={selectedIdx} setSelectedIdx={setSelectedIdx}/>}
        </div>
      </div>

      {/* Detalle de cita seleccionada como sheet */}
      {selectedIdx !== null && filteredAppts[selectedIdx] && (
        <ApptSheet theme={theme} a={filteredAppts[selectedIdx]} onClose={() => setSelectedIdx(null)}/>
      )}
    </div>
  );
};

/* ───── Top-level dispatcher ───── */
const Agenda = ({ theme, branchId, isMobile }) => {
  return isMobile
    ? <AgendaMobile theme={theme} branchId={branchId}/>
    : <AgendaDesktop theme={theme} branchId={branchId}/>;
};

Object.assign(window, { Agenda });
