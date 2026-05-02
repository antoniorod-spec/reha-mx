/* Agenda — Sidebar con mini-calendario, filtros y leyenda */

const MiniCalendar = ({ theme, selectedDay, onSelect }) => {
  const t = tokens(theme);
  // Mayo 2026: 1 May = Vie, así que la primera fila empieza con 4 huecos (L M Mi J)
  const daysInMonth = 31;
  const firstWeekday = 4; // Vie (0=Lun) → 4 huecos
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // semana visible: 4-10 (índices del array de cells)
  const isInWeek = (d) => d !== null && d >= 4 && d <= 10;
  const weekDayIdx = (d) => d - 4; // 4 → 0 (Lun)

  // todayDate = 4 (Lun 4 May)
  const TODAY = 4;
  // contar citas por día
  const apptsByDay = {};
  APPTS.forEach(a => {
    const day = 4 + a.d;
    apptsByDay[day] = (apptsByDay[day] || 0) + 1;
  });

  return (
    <div className="rounded-lg p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[12.5px] font-semibold tracking-tightish" style={{ color: t.text }}>Mayo 2026</div>
        <div className="flex gap-0.5">
          <button className="w-6 h-6 rounded flex items-center justify-center" style={{ color: t.muted }}><IconChevronLeft size={11}/></button>
          <button className="w-6 h-6 rounded flex items-center justify-center" style={{ color: t.muted }}><IconChevronRight size={11}/></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {SHORT_DAY_NAMES.map((d, i) => (
          <div key={i} className="text-[9.5px] font-mono text-center pb-1" style={{ color: t.subtle }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="h-7"/>;
          const isToday = d === TODAY;
          const isSelected = selectedDay === d;
          const inWeek = isInWeek(d);
          const count = apptsByDay[d] || 0;
          return (
            <button key={i}
                    onClick={() => onSelect && onSelect(d)}
                    className="h-7 rounded text-[10.5px] flex flex-col items-center justify-center relative transition-all"
                    style={{
                      background: isSelected ? t.accent : inWeek ? t.surface2 : "transparent",
                      color: isSelected ? "#06101C" : isToday ? t.accent : t.text,
                      fontWeight: isToday || isSelected ? 700 : 500,
                      border: isToday && !isSelected ? `1px solid ${t.accent}66` : "1px solid transparent",
                    }}>
              {d}
              {count > 0 && !isSelected && (
                <span className="absolute bottom-0.5 w-0.5 h-0.5 rounded-full" style={{ background: t.accent }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FilterRow = ({ theme, label, value, options, onChange, dotColors }) => {
  const t = tokens(theme);
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: t.subtle }}>{label}</div>
      <div className="space-y-1">
        {options.map((o, i) => {
          const isActive = value === o.value;
          return (
            <button key={i} onClick={() => onChange(o.value)}
                    className="w-full px-2 py-1.5 rounded flex items-center gap-2 text-[12px] text-left transition-colors"
                    style={{
                      background: isActive ? t.surface2 : "transparent",
                      color: isActive ? t.text : t.muted,
                      border: `1px solid ${isActive ? t.border : "transparent"}`,
                    }}>
              {(dotColors && dotColors[i]) ? (
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: dotColors[i] }}/>
              ) : null}
              <span className="flex-1 truncate">{o.label}</span>
              {isActive && <IconCheck size={11} style={{ color: t.accent }}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AgendaSidebar = ({ theme, filters, setFilters, onCreateNew }) => {
  const t = tokens(theme);
  const fisioOptions = [{ value: "all", label: "Todos los fisios" }, ...FISIO_DETAIL.map(f => ({ value: f.name, label: f.name }))];
  const fisioDots = ["transparent", ...FISIO_DETAIL.map(f => f.color)];
  const branchOptions = [{ value: "all", label: "Todas las sucursales" }, ...BRANCHES.map(b => ({ value: b.short, label: b.name }))];
  const branchDots = ["transparent", ...BRANCHES.map(b => b.color)];
  const typeOptions = [{ value: "all", label: "Todos los tipos" }, ...Object.entries(APPT_TYPES).map(([k, v]) => ({ value: k, label: v.label }))];
  const typeDots = ["transparent", ...Object.entries(APPT_TYPES).map(([k, v]) => v.bar)];

  return (
    <div className="space-y-3 sticky top-[70px]">
      <button onClick={onCreateNew}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 shadow-sm"
              style={{ background: t.accent, color: "#06101C" }}>
        <IconPlus size={14}/> Nueva cita
      </button>

      <MiniCalendar theme={theme}/>

      <div className="rounded-lg p-3 space-y-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
        <FilterRow theme={theme} label="Sucursal" value={filters.branch} options={branchOptions} dotColors={branchDots} onChange={(v) => setFilters({ ...filters, branch: v })}/>
        <div style={{ borderTop: `1px solid ${t.borderSoft}` }}/>
        <FilterRow theme={theme} label="Fisioterapeuta" value={filters.fisio}  options={fisioOptions} dotColors={fisioDots} onChange={(v) => setFilters({ ...filters, fisio: v })}/>
        <div style={{ borderTop: `1px solid ${t.borderSoft}` }}/>
        <FilterRow theme={theme} label="Tipo de cita" value={filters.type}    options={typeOptions} dotColors={typeDots} onChange={(v) => setFilters({ ...filters, type: v })}/>
      </div>

      <div className="rounded-lg p-3" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
        <div className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: t.subtle }}>Color por</div>
        <div className="grid grid-cols-3 gap-1 p-0.5 rounded-md" style={{ background: t.surface2, border: `1px solid ${t.border}` }}>
          {[
            { v: "type",   l: "Tipo" },
            { v: "fisio",  l: "Fisio" },
            { v: "branch", l: "Sucur." },
          ].map(opt => {
            const active = filters.colorBy === opt.v;
            return (
              <button key={opt.v} onClick={() => setFilters({ ...filters, colorBy: opt.v })}
                      className="px-1.5 py-1 rounded text-[11px] font-medium transition-colors"
                      style={{ background: active ? t.surface : "transparent", color: active ? t.text : t.muted, fontFamily: "inherit" }}>
                {opt.l}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { AgendaSidebar, MiniCalendar });
