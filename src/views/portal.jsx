/* Portal paciente — host (iOS device frame + tabs orchestration + screen stack) */

const PortalApp = ({ fullscreen = false, externalScreen, onCloseExternal }) => {
  const [tab, setTab] = React.useState("inicio");
  const [stack, setStack] = React.useState([]);   // screen stack pushed by user

  const push = (id) => setStack(s => [...s, id]);
  const pop  = () => {
    if (externalScreen && stack.length === 0) { onCloseExternal && onCloseExternal(); return; }
    setStack(s => s.slice(0, -1));
  };

  /* External screens (driven by parent launcher) take precedence */
  const top = externalScreen && stack.length === 0 ? externalScreen : stack[stack.length - 1];

  const screenMap = {
    onboarding:    () => <PortalOnboarding onDone={pop}/>,
    citaDetail:    () => <ScreenCitaDetail onBack={pop}/>,
    ejercicio:     () => <ScreenEjercicioDetail onBack={pop}/>,
    proms:         () => <ScreenPROMs onBack={pop}/>,
    pago:          () => <ScreenPago onBack={pop}/>,
    notif:         () => <ScreenNotificaciones onBack={pop}/>,
    docs:          () => <ScreenDocumentos onBack={pop}/>,
    perfil:        () => <ScreenPerfil onBack={pop}/>,
  };

  return (
    <div className="h-full w-full relative" style={{ background: PC.bg, color: PC.text, paddingTop: fullscreen ? 0 : 54, paddingBottom: top ? 0 : (fullscreen ? 0 : 76), minHeight: fullscreen ? "calc(100vh - 56px)" : undefined }}>
      {top ? (
        <div className="absolute inset-0" style={{ background: PC.bg }}>
          {screenMap[top] ? screenMap[top]() : null}
        </div>
      ) : (
        <React.Fragment>
          <div className="h-full w-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {tab === "inicio" && (
              <PortalHomeTab
                onOpenAppt={() => push("citaDetail")}
                onOpenProtocol={() => push("ejercicio")}
                onOpenChat={() => setTab("yo")}
                onOpenPaquetes={() => push("pago")}
                onOpenReportarDolor={() => push("proms")}/>
            )}
            {tab === "plan"  && <PortalPlanTab/>}
            {tab === "citas" && <PortalCitasTab/>}
            {tab === "nutri" && <PortalNutriTab/>}
            {tab === "yo"    && <PortalYoTab/>}
          </div>
          <PortalTabBar tab={tab} setTab={setTab} fullscreen={fullscreen}/>
        </React.Fragment>
      )}
    </div>
  );
};

const Portal = ({ theme, isMobile }) => {
  const t = tokens(theme);
  const [device, setDevice] = React.useState("ios"); // ios | android (visual only)
  const [externalScreen, setExternalScreen] = React.useState(null);
  /* nudge to remount the iframe child so it re-reads externalScreen */
  const [bump, setBump] = React.useState(0);
  const launch = (id) => { setExternalScreen(id); setBump(b => b + 1); };
  const closeExternal = () => setExternalScreen(null);

  /* Mobile: la app del paciente es la experiencia, sin device frame ni explainer */
  if (isMobile) {
    return (
      <div className="relative mx-auto" style={{ background: PC.bg, minHeight: "calc(100vh - 56px)", marginTop: -1, maxWidth: 480, paddingBottom: 76 }}>
        <PortalApp fullscreen={true}/>
      </div>
    );
  }

  return (
    <div className="px-6 pt-5 pb-10">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tighter2" style={{ color: t.text }}>Portal del paciente</h1>
          <div className="text-[12.5px] font-mono mt-1" style={{ color: t.muted }}>App nativa iOS / Android · Carlos Vázquez · Reha Centro</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 p-0.5 rounded-md" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            {[{ v: "ios", l: "iOS" }, { v: "android", l: "Android" }].map(o => {
              const active = device === o.v;
              return (
                <button key={o.v} onClick={() => setDevice(o.v)}
                        className="px-3 h-7 rounded text-[12px] font-medium"
                        style={{ background: active ? t.surface2 : "transparent", color: active ? t.text : t.muted }}>{o.l}</button>
              );
            })}
          </div>
          <button className="px-3 h-9 rounded-md flex items-center gap-1.5 text-[12px] font-mono" style={{ background: t.surface, color: t.muted, border: `1px solid ${t.border}` }}>
            <IconExternal size={12}/> Abrir solo móvil
          </button>
        </div>
      </div>

      <div className="grid gap-6 items-start" style={{ gridTemplateColumns: "minmax(420px, 460px) 1fr" }}>
        {/* Device */}
        <div className="flex justify-center sticky top-[70px]">
          {device === "ios" ? (
            <IOSDevice width={390} height={820} dark={true}>
              <PortalApp key={bump} externalScreen={externalScreen} onCloseExternal={closeExternal}/>
            </IOSDevice>
          ) : (
            <div className="rounded-[36px] overflow-hidden" style={{ width: 390, height: 820, background: "#000", padding: 8, border: `1px solid ${t.border}`, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <div className="rounded-[28px] overflow-hidden" style={{ height: "100%", width: "100%", background: PC.bg }}>
                <PortalApp key={bump} externalScreen={externalScreen} onCloseExternal={closeExternal}/>
              </div>
            </div>
          )}
        </div>

        {/* Right side: launcher + explainer */}
        <div className="space-y-3 pt-1">
          {/* Screen launcher */}
          <Card theme={theme} padding="p-0">
            <div className="px-4 pt-4 pb-2 flex items-baseline justify-between">
              <div>
                <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>Demo · 13 pantallas</div>
                <div className="text-[15px] font-semibold tracking-tightish mt-0.5" style={{ color: t.text }}>Mostrar en el dispositivo →</div>
              </div>
              {externalScreen && (
                <button onClick={closeExternal}
                        className="text-[11px] font-mono px-2 py-1 rounded"
                        style={{ background: t.surface2, color: t.muted, border: `1px solid ${t.border}` }}>
                  ✕ Cerrar
                </button>
              )}
            </div>

            <div className="px-2 pb-2">
              <LauncherGroup theme={theme} title="Onboarding del paciente">
                <LauncherRow theme={theme} active={externalScreen === "onboarding"} onClick={() => launch("onboarding")}
                             icon="🎬" l="Magic link → Bienvenida → 6 pasos" s="WhatsApp · Datos · Historial · Consents · Wearable · Tour"/>
              </LauncherGroup>

              <LauncherGroup theme={theme} title="Tareas frecuentes del paciente">
                <LauncherRow theme={theme} active={externalScreen === "citaDetail"} onClick={() => launch("citaDetail")}
                             icon="📅" l="Detalle de cita" s="Reagendar / cancelar · Mapa · Recordatorios"/>
                <LauncherRow theme={theme} active={externalScreen === "ejercicio"}  onClick={() => launch("ejercicio")}
                             icon="🎥" l="Detalle de ejercicio"  s="Video-guía · Tracker de sets · RIR · Tips"/>
                <LauncherRow theme={theme} active={externalScreen === "proms"}      onClick={() => launch("proms")}
                             icon="📊" l="Reportar dolor / PROMs"   s="EVA · KOOS · Tegner · localización"/>
              </LauncherGroup>

              <LauncherGroup theme={theme} title="Pagos & documentos">
                <LauncherRow theme={theme} active={externalScreen === "pago"}        onClick={() => launch("pago")}
                             icon="💳" l="Pago de paquete"          s="Tarjeta · MSI · SPEI · CFDI 4.0"/>
                <LauncherRow theme={theme} active={externalScreen === "notif"}       onClick={() => launch("notif")}
                             icon="🔔" l="Centro de notificaciones" s="Citas · pagos · adherencia · logros"/>
                <LauncherRow theme={theme} active={externalScreen === "docs"}        onClick={() => launch("docs")}
                             icon="📄" l="Documentos clínicos"      s="Consents · recetas · CFDI · imágenes"/>
                <LauncherRow theme={theme} active={externalScreen === "perfil"}      onClick={() => launch("perfil")}
                             icon="👤" l="Perfil completo"           s="Datos · clínicos · fiscales · privacidad"/>
              </LauncherGroup>

              <div className="px-3 py-2 mt-1 text-[10.5px] font-mono leading-relaxed" style={{ color: t.subtle }}>
                Las 5 pantallas de la app principal (Inicio · Plan · Citas · Nutri · Yo) están disponibles desde la barra inferior del dispositivo.
              </div>
            </div>
          </Card>

          <Card theme={theme} padding="p-4">
            <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: t.subtle }}>App del paciente</div>
            <div className="text-[20px] font-semibold tracking-tighter2 mb-2" style={{ color: t.text }}>La otra cara de Reha</div>
            <p className="text-[13px] leading-relaxed" style={{ color: t.muted }}>
              Cada paciente recibe acceso a su protocolo personalizado, plan nutricional, calendario de citas, expediente con gráficas de progreso, paquetes activos y chat directo con su fisio. Toda la app fluye sobre el mismo expediente que ve el clínico.
            </p>
          </Card>

          <Card theme={theme} padding="p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconWhatsApp size={14} style={{ color: "#34D399" }}/>
              <div className="text-[12.5px] font-semibold tracking-tightish" style={{ color: t.text }}>Sin descargar la app</div>
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: t.muted }}>
              Si el paciente no instala la app, la mayoría del flujo funciona vía WhatsApp Business: confirmaciones, recordatorios, links a videos del protocolo y avisos de pago.
            </p>
          </Card>

          <Card theme={theme} padding="p-4">
            <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: t.subtle }}>Datos sincronizados</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "100%", l: "Adherencia → expediente" },
                { v: "5s",   l: "Latencia chat" },
                { v: "PHI",  l: "Cifrado E2E" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-[18px] font-semibold tracking-tighter2 font-mono" style={{ color: t.accent }}>{s.v}</div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: t.subtle }}>{s.l}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* Launcher row component */
const LauncherGroup = ({ theme, title, children }) => {
  const t = tokens(theme);
  return (
    <div className="mt-2">
      <div className="px-3 pt-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider" style={{ color: t.subtle }}>{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const LauncherRow = ({ theme, icon, l, s, active, onClick }) => {
  const t = tokens(theme);
  return (
    <button onClick={onClick}
            className="w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors text-left"
            style={{
              background: active ? "rgba(63,188,212,0.1)" : "transparent",
              border: `1px solid ${active ? t.accent : "transparent"}`,
            }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] shrink-0"
           style={{ background: active ? "rgba(63,188,212,0.18)" : t.surface2 }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium tracking-tightish" style={{ color: t.text }}>{l}</div>
        <div className="text-[10.5px] font-mono mt-0.5" style={{ color: t.subtle }}>{s}</div>
      </div>
      <IconChevronRight size={12} style={{ color: active ? t.accent : t.subtle }}/>
    </button>
  );
};

Object.assign(window, { Portal, PortalApp });
