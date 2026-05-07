/* Portal paciente — Onboarding flow (link mágico → 7 pasos) */

/* ─── Step indicator ─── */
const StepDots = ({ current, total }) => (
  <div className="flex items-center justify-center gap-1.5 px-5 pt-3 pb-1">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i}
           className="rounded-full transition-all"
           style={{
             width: i === current ? 22 : 6,
             height: 6,
             background: i <= current ? PC.accent : PC.surface2,
           }}/>
    ))}
  </div>
);

/* ─── Step 0: Magic link landing (WhatsApp deep-link) ─── */
const StepMagicLink = ({ onContinue }) => (
  <div className="flex flex-col h-full" style={{ background: PC.bg }}>
    {/* Hero with WhatsApp brand color tone */}
    <div className="flex-1 flex flex-col items-center justify-center px-7 pt-12 pb-6 text-center"
         style={{ background: "radial-gradient(120% 60% at 50% 0%, rgba(63,188,212,0.15), rgba(6,16,28,0) 60%)" }}>
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
           style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 18px 40px rgba(37,211,102,0.35)" }}>
        <IconWhatsApp size={38} className="text-white"/>
      </div>
      <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>
        Link enviado por WhatsApp
      </div>
      <div className="text-[26px] font-semibold tracking-tighter2 mb-2" style={{ color: PC.text }}>
        ¡Hola, Carlos!
      </div>
      <div className="text-[14px] leading-relaxed mb-6" style={{ color: PC.muted }}>
        Tu fisio <span style={{ color: PC.text }}>Dr. Antonio R.</span> de <span style={{ color: PC.text }}>Reha Centro</span> te dio de alta tras tu consulta de hoy.
      </div>

      <div className="w-full rounded-2xl px-4 py-3 mb-6 text-left" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
               style={{ background: "rgba(37,211,102,0.15)" }}>
            <IconWhatsApp size={16} style={{ color: "#25D366" }}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-mono" style={{ color: PC.subtle }}>+52 444 812 3340 · WhatsApp Business</div>
            <div className="text-[12.5px] mt-0.5" style={{ color: PC.text }}>Tu link seguro: <span className="font-mono" style={{ color: PC.accent }}>reha.mx/c/8K3M</span></div>
          </div>
        </div>
      </div>

      <div className="text-[11px] font-mono mb-1" style={{ color: PC.subtle }}>El link expira en 22:14:48</div>
    </div>

    {/* CTA */}
    <div className="px-5 pb-6 pt-2 space-y-2">
      <button onClick={onContinue}
              className="w-full h-12 rounded-xl text-[14px] font-semibold tracking-tightish"
              style={{ background: PC.accent, color: "#06101C" }}>
        Iniciar mi configuración
      </button>
      <button className="w-full h-10 text-[12px] font-mono"
              style={{ color: PC.muted }}>
        ¿No eres Carlos? Reportar este link
      </button>
    </div>
  </div>
);

/* ─── Step 1: Welcome ─── */
const StepWelcome = ({ onContinue, onBack }) => (
  <OnboardingShell current={0} total={7} onBack={onBack}>
    <div className="px-7 pt-10 pb-6 text-center">
      <div className="text-[42px] mb-2">👋</div>
      <div className="text-[24px] font-semibold tracking-tighter2 mb-3" style={{ color: PC.text }}>
        Bienvenido a Reha
      </div>
      <div className="text-[14px] leading-relaxed mb-7" style={{ color: PC.muted }}>
        Vamos a configurar tu cuenta en <span style={{ color: PC.text }}>3 minutos</span>. Toda la info que pongas aquí se sincroniza con tu expediente clínico.
      </div>

      <div className="space-y-2 text-left mb-6">
        {[
          { i: "📋", t: "Datos personales y contacto",            s: "Para tu expediente NOM-024" },
          { i: "🩺", t: "Historial médico y lesión actual",       s: "Tu fisio ya capturó parte" },
          { i: "✍️", t: "Consentimientos y privacidad",            s: "LFPDPPP · firma digital" },
          { i: "⌚", t: "Tu wearable (opcional)",                  s: "Apple Watch · Garmin · Whoop" },
          { i: "🎯", t: "Tour de la app",                           s: "3 funciones clave" },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
               style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
            <div className="text-[20px]">{r.i}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium" style={{ color: PC.text }}>{r.t}</div>
              <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>{r.s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <OnboardingFooter onContinue={onContinue} cta="Empezar"/>
  </OnboardingShell>
);

/* ─── Step 2: Datos personales ─── */
const StepDatos = ({ onContinue, onBack, data, setData }) => {
  const update = (k, v) => setData({ ...data, [k]: v });
  return (
    <OnboardingShell current={1} total={7} onBack={onBack}>
      <div className="px-5 pt-5 pb-5">
        <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: PC.accent }}>Paso 1 de 6</div>
        <div className="text-[22px] font-semibold tracking-tighter2 mb-1" style={{ color: PC.text }}>Tus datos</div>
        <div className="text-[12.5px] leading-relaxed mb-5" style={{ color: PC.muted }}>
          Tu fisio capturó algunos en clínica. Completa lo que falte.
        </div>

        <div className="space-y-3.5">
          <FormField label="Nombre completo" value={data.nombre} onChange={(v) => update("nombre", v)} hint="Como aparece en tu INE"/>
          <FormField label="Fecha de nacimiento" value={data.dob} onChange={(v) => update("dob", v)} placeholder="DD / MM / AAAA"/>
          <FormSelect label="Género" value={data.genero} onChange={(v) => update("genero", v)}
                      options={["Masculino", "Femenino", "No binario", "Prefiero no decir"]}/>
          <FormField label="Teléfono" value={data.tel} onChange={(v) => update("tel", v)} placeholder="+52" prefix="📱"/>
          <FormField label="Email" value={data.email} onChange={(v) => update("email", v)} placeholder="tu@correo.com" prefix="✉️"/>
          <FormField label="CURP" value={data.curp} onChange={(v) => update("curp", v)} placeholder="18 caracteres" hint="Necesario para CFDI" optional/>

          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>Dirección</div>
            <FormField label="Calle y número" value={data.calle} onChange={(v) => update("calle", v)}/>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <FormField label="Colonia" value={data.col} onChange={(v) => update("col", v)} compact/>
              <FormField label="CP" value={data.cp} onChange={(v) => update("cp", v)} compact/>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <FormField label="Ciudad" value={data.ciudad} onChange={(v) => update("ciudad", v)} compact/>
              <FormField label="Estado" value={data.estado} onChange={(v) => update("estado", v)} compact/>
            </div>
          </div>
        </div>
      </div>
      <OnboardingFooter onContinue={onContinue} cta="Continuar"/>
    </OnboardingShell>
  );
};

/* ─── Step 3: Historial médico ─── */
const StepHistorial = ({ onContinue, onBack, data, setData }) => {
  const update = (k, v) => setData({ ...data, [k]: v });
  const toggle = (key, val) => {
    const arr = data[key] || [];
    update(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  return (
    <OnboardingShell current={2} total={7} onBack={onBack}>
      <div className="px-5 pt-5 pb-5">
        <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: PC.accent }}>Paso 2 de 6</div>
        <div className="text-[22px] font-semibold tracking-tighter2 mb-1" style={{ color: PC.text }}>Historial médico</div>
        <div className="text-[12.5px] leading-relaxed mb-5" style={{ color: PC.muted }}>
          Esta info nos ayuda a personalizar tu protocolo y prevenir complicaciones.
        </div>

        {/* Lesión actual (pre-llenado por fisio, read-only) */}
        <PCard className="px-4 py-3 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: PC.accent }}/>
            <div className="text-[10.5px] font-mono uppercase tracking-wider" style={{ color: PC.accent }}>Capturado por tu fisio</div>
          </div>
          <div className="text-[14px] font-semibold tracking-tightish" style={{ color: PC.text }}>LCA reconstruido (tendón rotuliano)</div>
          <div className="text-[11.5px] mt-1" style={{ color: PC.muted }}>Cirugía: 12 Mar 2026 · Pierna derecha · Dr. M. Salazar (ortopedista)</div>
        </PCard>

        <div className="space-y-4">
          <div>
            <div className="text-[12.5px] font-medium mb-2" style={{ color: PC.text }}>¿Padeces alguna de estas condiciones?</div>
            <div className="flex flex-wrap gap-2">
              {["Diabetes", "Hipertensión", "Asma", "Cardiopatía", "Osteoporosis", "Embarazo", "Ninguna"].map((c) => {
                const sel = (data.condiciones || []).includes(c);
                return (
                  <button key={c} onClick={() => toggle("condiciones", c)}
                          className="px-3 h-9 rounded-full text-[12px] font-medium transition-colors"
                          style={{
                            background: sel ? PC.accent : PC.surface,
                            color: sel ? "#06101C" : PC.muted,
                            border: `1px solid ${sel ? PC.accent : PC.border}`,
                          }}>{c}</button>
                );
              })}
            </div>
          </div>

          <FormField label="Alergias o medicamentos contraindicados" value={data.alergias} onChange={(v) => update("alergias", v)}
                     placeholder="Ej. Penicilina, AINEs, látex…" multiline/>

          <FormField label="Medicamentos actuales" value={data.medicamentos} onChange={(v) => update("medicamentos", v)}
                     placeholder="Nombre, dosis, frecuencia" multiline optional/>

          <FormField label="Cirugías previas (últimos 5 años)" value={data.cirugias} onChange={(v) => update("cirugias", v)}
                     placeholder="Año, tipo, lado" multiline optional/>

          <div className="pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>Contacto de emergencia</div>
            <FormField label="Nombre" value={data.emerNombre} onChange={(v) => update("emerNombre", v)}/>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <FormField label="Parentesco" value={data.emerRel} onChange={(v) => update("emerRel", v)} compact/>
              <FormField label="Teléfono" value={data.emerTel} onChange={(v) => update("emerTel", v)} compact/>
            </div>
          </div>
        </div>
      </div>
      <OnboardingFooter onContinue={onContinue} cta="Continuar"/>
    </OnboardingShell>
  );
};

/* ─── Step 4: Consentimientos ─── */
const StepConsentimientos = ({ onContinue, onBack, data, setData }) => {
  const toggle = (k) => setData({ ...data, [k]: !data[k] });
  const allOk = data.lfpdppp && data.tratamiento && data.imagenes !== undefined;
  const [signing, setSigning] = React.useState(false);

  return (
    <OnboardingShell current={3} total={7} onBack={onBack}>
      <div className="px-5 pt-5 pb-5">
        <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: PC.accent }}>Paso 3 de 6</div>
        <div className="text-[22px] font-semibold tracking-tighter2 mb-1" style={{ color: PC.text }}>Consentimientos</div>
        <div className="text-[12.5px] leading-relaxed mb-5" style={{ color: PC.muted }}>
          Por ley estamos obligados a recabar estos consentimientos. Puedes revocarlos en cualquier momento.
        </div>

        <div className="space-y-2.5">
          <ConsentRow
            checked={!!data.lfpdppp}
            onToggle={() => toggle("lfpdppp")}
            required
            title="Aviso de privacidad (LFPDPPP)"
            sub="Cómo tratamos tus datos personales y sensibles"
            link="reha.mx/aviso-privacidad"/>

          <ConsentRow
            checked={!!data.tratamiento}
            onToggle={() => toggle("tratamiento")}
            required
            title="Consentimiento informado de tratamiento"
            sub="Riesgos, beneficios y alternativas a la fisioterapia"
            link="reha.mx/consentimiento-fisio"/>

          <ConsentRow
            checked={!!data.imagenes}
            onToggle={() => toggle("imagenes")}
            title="Uso de imágenes y video"
            sub="Para registrar tu progreso y compartir con tu fisio"
            optional/>

          <ConsentRow
            checked={!!data.investigacion}
            onToggle={() => toggle("investigacion")}
            title="Datos anonimizados para investigación"
            sub="Mejora protocolos en pacientes con tu misma lesión"
            optional/>

          <ConsentRow
            checked={!!data.marketing}
            onToggle={() => toggle("marketing")}
            title="Comunicación promocional"
            sub="Ofertas de paquetes y eventos"
            optional/>
        </div>

        {/* Firma digital */}
        <div className="mt-5">
          <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>Firma digital</div>
          <div className="rounded-xl px-4 py-5 text-center cursor-pointer"
               onClick={() => setSigning(!signing)}
               style={{ background: PC.surface, border: `1px dashed ${signing ? PC.accent : PC.border}` }}>
            {signing ? (
              <div>
                <svg width="120" height="40" viewBox="0 0 120 40" className="mx-auto">
                  <path d="M5 30 Q 15 8, 22 22 T 42 18 Q 50 12 56 25 T 78 18 Q 85 12 92 22 T 115 14"
                        stroke={PC.accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
                <div className="text-[11px] font-mono mt-1" style={{ color: PC.accent }}>✓ Firmado · {new Date().toLocaleDateString("es-MX")} · 11:23</div>
              </div>
            ) : (
              <div>
                <div className="text-[11px] font-mono mb-1" style={{ color: PC.subtle }}>Toca aquí y firma con tu dedo</div>
                <div className="text-[14px]" style={{ color: PC.muted }}>━━━━━━</div>
              </div>
            )}
          </div>
          <div className="text-[10.5px] font-mono mt-2 leading-relaxed" style={{ color: PC.subtle }}>
            Tu firma queda guardada con timestamp y geo-tag (Reha Centro · 22.155, -100.985) cumpliendo NOM-024-SSA3-2012.
          </div>
        </div>
      </div>
      <OnboardingFooter onContinue={onContinue} cta="Aceptar y continuar" disabled={!(allOk && signing)}/>
    </OnboardingShell>
  );
};

/* ─── Step 5: Wearable ─── */
const StepWearable = ({ onContinue, onBack, data, setData }) => {
  const select = (id) => setData({ ...data, wearable: id });

  return (
    <OnboardingShell current={4} total={7} onBack={onBack}>
      <div className="px-5 pt-5 pb-5">
        <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: PC.accent }}>Paso 4 de 6 · Opcional</div>
        <div className="text-[22px] font-semibold tracking-tighter2 mb-1" style={{ color: PC.text }}>Conecta tu wearable</div>
        <div className="text-[12.5px] leading-relaxed mb-5" style={{ color: PC.muted }}>
          Si tienes uno, podemos leer FC, sueño y HRV para ajustar tu carga de entrenamiento. Puedes saltar este paso.
        </div>

        <div className="space-y-2">
          {[
            { id: "apple",  l: "Apple Watch",  s: "Series 6 o superior · vía Health Kit", emoji: "⌚", color: "#FFFFFF" },
            { id: "garmin", l: "Garmin",       s: "Connect IQ · todos los modelos",       emoji: "🏃", color: "#007CC3" },
            { id: "whoop",  l: "Whoop",        s: "4.0 · vía Whoop API",                  emoji: "💪", color: "#1A1A1A" },
            { id: "oura",   l: "Oura Ring",    s: "Gen 3 · sueño y recuperación",         emoji: "💍", color: "#CFA45A" },
            { id: "fitbit", l: "Fitbit",       s: "Charge / Sense / Versa",               emoji: "📿", color: "#00B0B9" },
          ].map((w) => {
            const sel = data.wearable === w.id;
            return (
              <button key={w.id} onClick={() => select(w.id)}
                      className="w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors"
                      style={{ background: sel ? "rgba(63,188,212,0.08)" : PC.surface, border: `1px solid ${sel ? PC.accent : PC.border}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] shrink-0"
                     style={{ background: PC.surface2 }}>{w.emoji}</div>
                <div className="flex-1 text-left">
                  <div className="text-[13.5px] font-medium" style={{ color: PC.text }}>{w.l}</div>
                  <div className="text-[10.5px] font-mono mt-0.5" style={{ color: PC.subtle }}>{w.s}</div>
                </div>
                <div className="w-5 h-5 rounded-full flex items-center justify-center"
                     style={{ background: sel ? PC.accent : "transparent", border: `1.5px solid ${sel ? PC.accent : PC.border}` }}>
                  {sel && <IconCheck size={11} style={{ color: "#06101C" }} strokeWidth={3}/>}
                </div>
              </button>
            );
          })}

          <button onClick={() => select("none")}
                  className="w-full px-4 py-3 rounded-xl text-[13px] font-medium mt-2"
                  style={{ background: data.wearable === "none" ? "rgba(63,188,212,0.08)" : "transparent",
                           color: PC.muted, border: `1px solid ${data.wearable === "none" ? PC.accent : PC.borderSoft}` }}>
            No tengo wearable / saltar este paso
          </button>
        </div>

        {data.wearable && data.wearable !== "none" && (
          <div className="mt-4 px-4 py-3 rounded-xl" style={{ background: "rgba(52,211,153,0.08)", border: `1px solid rgba(52,211,153,0.3)` }}>
            <div className="text-[11px] font-mono" style={{ color: PC.good }}>✓ Conectado · sincronizando últimos 30 días…</div>
          </div>
        )}
      </div>
      <OnboardingFooter onContinue={onContinue} cta="Continuar"/>
    </OnboardingShell>
  );
};

/* ─── Step 6 (5/6): Tour de la app ─── */
const StepTour = ({ onContinue, onBack }) => {
  const [slide, setSlide] = React.useState(0);
  const slides = [
    {
      emoji: "💪",
      bg: "linear-gradient(135deg, rgba(63,188,212,0.15), rgba(63,188,212,0.02))",
      title: "Tu protocolo, todos los días",
      desc: "Cada día tu fisio te asigna ejercicios con video-guía. Marca cada uno al terminarlo y registra tu RIR (esfuerzo percibido).",
      tip: "Tip: hazlos a la misma hora para volverlo hábito.",
    },
    {
      emoji: "📈",
      bg: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.02))",
      title: "Mide tu progreso",
      desc: "Verás tus gráficas de dolor (EVA), simetría de fuerza y rango articular. Mientras más constante, más rápido vuelves.",
      tip: "Tu fisio ve la misma data en tiempo real.",
    },
    {
      emoji: "💬",
      bg: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.02))",
      title: "Chat directo con tu fisio",
      desc: "¿Dolor inesperado? ¿Duda con un ejercicio? Mensajea, manda video o audio. Respuesta en menos de 5 horas.",
      tip: "También recibes recordatorios automáticos.",
    },
  ];
  const isLast = slide === slides.length - 1;

  return (
    <OnboardingShell current={5} total={7} onBack={onBack}>
      <div className="px-5 pt-5 pb-5">
        <div className="text-[11px] font-mono uppercase tracking-wider mb-1" style={{ color: PC.accent }}>Paso 5 de 6 · Tour</div>
        <div className="text-[22px] font-semibold tracking-tighter2 mb-3" style={{ color: PC.text }}>Cómo funciona Reha</div>

        {/* Slide */}
        <div className="rounded-2xl px-6 py-8 text-center mb-4"
             style={{ background: slides[slide].bg, border: `1px solid ${PC.border}`, minHeight: 320 }}>
          <div className="text-[64px] mb-4">{slides[slide].emoji}</div>
          <div className="text-[20px] font-semibold tracking-tighter2 mb-3" style={{ color: PC.text }}>{slides[slide].title}</div>
          <div className="text-[13px] leading-relaxed mb-4" style={{ color: PC.muted }}>{slides[slide].desc}</div>
          <div className="text-[11.5px] font-mono px-3 py-2 rounded-lg inline-block" style={{ background: PC.surface, color: PC.accent }}>
            💡 {slides[slide].tip}
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === slide ? 18 : 6,
                      height: 6,
                      background: i === slide ? PC.accent : PC.surface2,
                    }}/>
          ))}
        </div>

        {/* Slide nav */}
        <div className="flex items-center gap-2">
          {slide > 0 && (
            <button onClick={() => setSlide(slide - 1)}
                    className="flex-1 h-11 rounded-xl text-[13px] font-medium"
                    style={{ background: PC.surface, color: PC.muted, border: `1px solid ${PC.border}` }}>
              ← Anterior
            </button>
          )}
          {!isLast ? (
            <button onClick={() => setSlide(slide + 1)}
                    className="flex-1 h-11 rounded-xl text-[13px] font-semibold"
                    style={{ background: PC.accent, color: "#06101C" }}>
              Siguiente →
            </button>
          ) : null}
        </div>
      </div>
      {isLast && <OnboardingFooter onContinue={onContinue} cta="¡Estoy listo!"/>}
    </OnboardingShell>
  );
};

/* ─── Step 7: Done ─── */
const StepDone = ({ onContinue }) => (
  <div className="flex flex-col h-full" style={{ background: PC.bg }}>
    <div className="flex-1 flex flex-col items-center justify-center px-7 pt-12 pb-6 text-center"
         style={{ background: "radial-gradient(120% 60% at 50% 0%, rgba(52,211,153,0.18), rgba(6,16,28,0) 60%)" }}>
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
           style={{ background: "linear-gradient(135deg, #34D399, #1B9F70)", boxShadow: "0 18px 40px rgba(52,211,153,0.35)" }}>
        <IconCheck size={48} className="text-white" strokeWidth={3}/>
      </div>
      <div className="text-[28px] font-semibold tracking-tighter2 mb-3" style={{ color: PC.text }}>¡Todo listo!</div>
      <div className="text-[14px] leading-relaxed mb-6" style={{ color: PC.muted }}>
        Ya puedes empezar tu tratamiento. <span style={{ color: PC.text }}>Dr. Antonio R.</span> recibió tu información y armó tu primer plan.
      </div>

      <div className="w-full rounded-2xl px-4 py-4 mb-3 text-left" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
        <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>Tu próxima cita</div>
        <div className="text-[15px] font-semibold tracking-tightish" style={{ color: PC.text }}>Martes 5 May · 11:00</div>
        <div className="text-[12px] mt-1" style={{ color: PC.muted }}>Reha Centro · Sesión 1 de 24</div>
        <div className="flex items-center gap-2 mt-3">
          <div className="text-[10px] font-mono" style={{ color: PC.accent }}>Recordatorio por WhatsApp 24h antes</div>
        </div>
      </div>

      <div className="w-full rounded-2xl px-4 py-4 text-left" style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
        <div className="text-[10.5px] font-mono uppercase tracking-wider mb-2" style={{ color: PC.subtle }}>Hoy te toca</div>
        <div className="text-[14px]" style={{ color: PC.text }}>5 ejercicios · ~32 min</div>
        <div className="text-[11.5px] font-mono mt-1" style={{ color: PC.muted }}>Empezamos con movilidad ligera</div>
      </div>
    </div>

    <div className="px-5 pb-6 pt-2">
      <button onClick={onContinue}
              className="w-full h-12 rounded-xl text-[14px] font-semibold tracking-tightish"
              style={{ background: PC.accent, color: "#06101C" }}>
        Entrar a la app →
      </button>
    </div>
  </div>
);

/* ─── Reusable form primitives ─── */
const FormField = ({ label, value, onChange, placeholder, hint, prefix, multiline, optional, compact }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-[11.5px] font-medium" style={{ color: PC.muted }}>
        {label}
        {optional && <span className="ml-1.5 text-[10px] font-mono" style={{ color: PC.subtle }}>opcional</span>}
      </label>
      {hint && <div className="text-[10px] font-mono" style={{ color: PC.subtle }}>{hint}</div>}
    </div>
    <div className="flex items-center rounded-xl"
         style={{ background: PC.surface, border: `1px solid ${PC.border}`, paddingLeft: prefix ? 10 : 0 }}>
      {prefix && <div className="text-[14px] mr-2">{prefix}</div>}
      {multiline ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                  rows={2}
                  className="flex-1 bg-transparent px-3 py-2.5 text-[13px] resize-none outline-none"
                  style={{ color: PC.text }}/>
      ) : (
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
               className={`flex-1 bg-transparent ${compact ? "px-3 py-2" : "px-3 py-3"} text-[13px] outline-none`}
               style={{ color: PC.text }}/>
      )}
    </div>
  </div>
);

const FormSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-[11.5px] font-medium block mb-1.5" style={{ color: PC.muted }}>{label}</label>
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => {
        const sel = value === o;
        return (
          <button key={o} onClick={() => onChange(o)}
                  className="px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-colors"
                  style={{
                    background: sel ? "rgba(63,188,212,0.08)" : PC.surface,
                    color: sel ? PC.accent : PC.muted,
                    border: `1px solid ${sel ? PC.accent : PC.border}`,
                  }}>{o}</button>
        );
      })}
    </div>
  </div>
);

const ConsentRow = ({ checked, onToggle, title, sub, link, required, optional }) => (
  <button onClick={onToggle}
          className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-colors"
          style={{ background: PC.surface, border: `1px solid ${checked ? PC.accent : PC.border}` }}>
    <div className="w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0"
         style={{ background: checked ? PC.accent : "transparent", border: `1.5px solid ${checked ? PC.accent : PC.border}` }}>
      {checked && <IconCheck size={11} style={{ color: "#06101C" }} strokeWidth={3}/>}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <div className="text-[13px] font-medium" style={{ color: PC.text }}>{title}</div>
        {required && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(251,113,133,0.15)", color: PC.bad }}>OBLIG.</span>}
        {optional && <span className="text-[9px] font-mono" style={{ color: PC.subtle }}>opcional</span>}
      </div>
      <div className="text-[11px] font-mono mt-0.5" style={{ color: PC.subtle }}>{sub}</div>
      {link && <div className="text-[10.5px] font-mono mt-1" style={{ color: PC.accent }}>📄 Leer: {link}</div>}
    </div>
  </button>
);

/* ─── Onboarding shell (header + step dots + content) ─── */
const OnboardingShell = ({ current, total, onBack, children }) => (
  <div className="flex flex-col h-full" style={{ background: PC.bg }}>
    <div className="px-5 pt-3 pb-2 flex items-center" style={{ background: PC.bg }}>
      {onBack ? (
        <button onClick={onBack} className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center"
                style={{ background: PC.surface, border: `1px solid ${PC.border}` }}>
          <IconChevronLeft size={15} style={{ color: PC.text }}/>
        </button>
      ) : <div className="w-9 h-9"/>}
      <div className="flex-1 flex items-center justify-center gap-1.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: PC.accent }}>
          <span className="text-[13px] font-bold" style={{ color: "#06101C" }}>R</span>
        </div>
        <div className="text-[14px] font-semibold tracking-tightish" style={{ color: PC.text }}>Reha</div>
      </div>
      <div className="w-9 h-9"/>
    </div>
    <StepDots current={current} total={total}/>
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {children}
    </div>
  </div>
);

const OnboardingFooter = ({ onContinue, cta = "Continuar", disabled = false }) => (
  <div className="px-5 py-3" style={{ borderTop: `1px solid ${PC.borderSoft}`, background: PC.bg }}>
    <button onClick={onContinue} disabled={disabled}
            className="w-full h-12 rounded-xl text-[14px] font-semibold tracking-tightish transition-opacity"
            style={{
              background: disabled ? PC.surface2 : PC.accent,
              color: disabled ? PC.subtle : "#06101C",
              opacity: disabled ? 0.6 : 1,
            }}>
      {cta}
    </button>
  </div>
);

/* ─── Orchestrator ─── */
const PortalOnboarding = ({ onDone }) => {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    nombre: "Carlos Vázquez",
    dob: "12 / 08 / 1997",
    genero: "Masculino",
    tel: "+52 444 188 9023",
    email: "carlos.vazquez@gmail.com",
    curp: "",
    calle: "Av. Reforma 247",
    col: "Tequisquiapan",
    cp: "78230",
    ciudad: "San Luis Potosí",
    estado: "SLP",
    condiciones: ["Ninguna"],
    alergias: "",
    medicamentos: "",
    cirugias: "",
    emerNombre: "Ana Vázquez",
    emerRel: "Hermana",
    emerTel: "+52 444 122 8801",
    lfpdppp: false,
    tratamiento: false,
    imagenes: false,
    investigacion: false,
    marketing: false,
    wearable: null,
  });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <div className="h-full w-full" style={{ background: PC.bg }}>
      {step === 0 && <StepMagicLink onContinue={next}/>}
      {step === 1 && <StepWelcome onContinue={next} onBack={back}/>}
      {step === 2 && <StepDatos onContinue={next} onBack={back} data={data} setData={setData}/>}
      {step === 3 && <StepHistorial onContinue={next} onBack={back} data={data} setData={setData}/>}
      {step === 4 && <StepConsentimientos onContinue={next} onBack={back} data={data} setData={setData}/>}
      {step === 5 && <StepWearable onContinue={next} onBack={back} data={data} setData={setData}/>}
      {step === 6 && <StepTour onContinue={next} onBack={back}/>}
      {step === 7 && <StepDone onContinue={onDone}/>}
    </div>
  );
};

Object.assign(window, { PortalOnboarding });
