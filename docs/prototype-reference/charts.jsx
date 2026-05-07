/* Lightweight inline SVG charts — no external deps. Theme-aware via props. */

// LineChart: data is array of {x, ...series}; series is array of {key, color, label}
const LineChart = ({ data, series, height = 220, theme = "dark", yMax, yTicks = 4, showLegend = true, formatY = (v) => v, padL = 36, padR = 12, padT = 12, padB = 26 }) => {
  const W = 600, H = height;
  const grid = theme === "dark" ? "#1F1F1F" : "#EAEAEA";
  const axis = theme === "dark" ? "#525252" : "#A3A3A3";
  const text = theme === "dark" ? "#A3A3A3" : "#525252";
  const xs = data.map(d => d.x);
  const allVals = series.flatMap(s => data.map(d => d[s.key]));
  const max = yMax ?? Math.ceil(Math.max(...allVals) * 1.1);
  const min = 0;
  const xScale = (i) => padL + (i * (W - padL - padR)) / Math.max(1, data.length - 1);
  const yScale = (v) => padT + (H - padT - padB) * (1 - (v - min) / (max - min));
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => min + (i * (max - min)) / yTicks);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ display: "block" }}>
        {/* grid */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={yScale(t)} y2={yScale(t)} stroke={grid} strokeDasharray="2 4"/>
            <text x={padL - 8} y={yScale(t) + 3} fontSize="10" fill={text} textAnchor="end" fontFamily="JetBrains Mono">{formatY(t)}</text>
          </g>
        ))}
        {/* x labels */}
        {xs.map((x, i) => (
          <text key={i} x={xScale(i)} y={H - 8} fontSize="10" fill={text} textAnchor="middle" fontFamily="JetBrains Mono">{x}</text>
        ))}
        {/* lines */}
        {series.map((s) => {
          const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d[s.key])}`).join(" ");
          return (
            <g key={s.key}>
              <path d={path} fill="none" stroke={s.color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              {data.map((d, i) => (
                <circle key={i} cx={xScale(i)} cy={yScale(d[s.key])} r="2.5" fill={s.color} />
              ))}
            </g>
          );
        })}
      </svg>
      {showLegend && (
        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: text }}>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AreaSparkline = ({ values, color = "#3FBCD4", height = 60, theme = "dark" }) => {
  const W = 240, H = height;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const xs = (i) => (i * W) / (values.length - 1);
  const ys = (v) => H - 6 - ((v - min) / range) * (H - 12);
  const linePath = values.map((v, i) => `${i === 0 ? "M" : "L"} ${xs(i)} ${ys(v)}`).join(" ");
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`;
  const id = `g-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path d={linePath} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// BarChart: data: [{x, v}]; bar accent
const BarChart = ({ data, height = 140, color = "#3FBCD4", theme = "dark", yMax, padL = 28, padR = 8, padT = 12, padB = 22 }) => {
  const W = 360, H = height;
  const grid = theme === "dark" ? "#1F1F1F" : "#EAEAEA";
  const text = theme === "dark" ? "#A3A3A3" : "#525252";
  const max = yMax ?? Math.max(...data.map(d => d.v), 100);
  const bw = (W - padL - padR) / data.length * 0.7;
  const slot = (W - padL - padR) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ display: "block" }}>
      {[0, 0.5, 1].map((t, i) => (
        <line key={i} x1={padL} x2={W - padR} y1={padT + t * (H - padT - padB)} y2={padT + t * (H - padT - padB)} stroke={grid} strokeDasharray="2 4"/>
      ))}
      {data.map((d, i) => {
        const x = padL + i * slot + (slot - bw) / 2;
        const h = (d.v / max) * (H - padT - padB);
        const y = H - padB - h;
        return (
          <g key={i}>
            <rect x={x} y={padT} width={bw} height={H - padT - padB} fill={grid} opacity="0.4" rx="3"/>
            <rect x={x} y={y} width={bw} height={h} fill={color} rx="3" opacity={d.v === 0 ? 0.15 : 1}/>
            <text x={x + bw / 2} y={H - 6} fontSize="10" fill={text} textAnchor="middle" fontFamily="JetBrains Mono">{d.x}</text>
          </g>
        );
      })}
    </svg>
  );
};

// Heatmap cell grid
const HeatmapGrid = ({ rows, days, hours, theme = "dark" }) => {
  const palette = theme === "dark"
    ? ["#0F0F0F", "#0F2438", "#16466A", "#1F6A8E", "#3FBCD4"]
    : ["#F5F5F5", "#DCEEF3", "#A8DDE6", "#3FBCD4", "#1B92AE"];
  const text = theme === "dark" ? "#A3A3A3" : "#525252";
  const border = theme === "dark" ? "#0A0A0A" : "#FAFAFA";
  return (
    <div className="w-full">
      <div className="grid" style={{ gridTemplateColumns: `28px repeat(${hours.length}, 1fr)`, gap: "3px" }}>
        <div></div>
        {hours.map((h, i) => (
          <div key={i} className="text-[10px] font-mono text-center" style={{ color: text }}>{h}</div>
        ))}
        {rows.map((row, ri) => (
          <React.Fragment key={ri}>
            <div className="text-[11px] font-mono flex items-center justify-end pr-1" style={{ color: text }}>{days[ri]}</div>
            {row.map((v, ci) => (
              <div key={ci} className="rounded-[3px] aspect-[1.4/1]"
                   title={`${days[ri]} ${hours[ci]}:00`}
                   style={{ background: palette[v], outline: `1px solid ${border}` }} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { LineChart, AreaSparkline, BarChart, HeatmapGrid });
