import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────── CONSTANTS ─────────────────────────────── */

const STORAGE_KEY = "lifetracker_v3";

const defaultData = {
  tasks: [],
  habits: [
    { id: 1, name: "Eau", icon: "💧", goal: 8, color: "#3b82f6", unit: "verres" },
    { id: 2, name: "Exercice", icon: "🏃", goal: 1, color: "#10b981", unit: "session" },
    { id: 3, name: "Lecture", icon: "📚", goal: 30, color: "#f59e0b", unit: "min" },
    { id: 4, name: "Méditation", icon: "🧘", goal: 10, color: "#8b5cf6", unit: "min" },
  ],
  habitLog: {}, mood: {}, notes: {}, goals: [], focus: null,
};

const MOODS = [
  { emoji: "😄", label: "Super", value: 5, color: "#10b981" },
  { emoji: "🙂", label: "Bien",  value: 4, color: "#3b82f6" },
  { emoji: "😐", label: "Moyen", value: 3, color: "#f59e0b" },
  { emoji: "😕", label: "Bof",   value: 2, color: "#f97316" },
  { emoji: "😞", label: "Mal",   value: 1, color: "#ef4444" },
];

const PRIORITY = [
  { label: "Urgent", color: "#ef4444" },
  { label: "Normal", color: "#3b82f6" },
  { label: "Doux",   color: "#10b981" },
];

const TABS = [
  { label: "Jour",      icon: "◉" },
  { label: "Focus",     icon: "⏱" },
  { label: "Tâches",    icon: "✓" },
  { label: "Habitudes", icon: "↻" },
  { label: "Journal",   icon: "✎" },
];

/* ─────────────────────────────── UTILS ─────────────────────────────────── */

const todayKey = () => new Date().toISOString().split("T")[0];
const fmtDate  = d => new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const fmtTime  = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const last7    = () => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 6 + i); return d.toISOString().split("T")[0];
});

/* ─────────────────────────────── CSS ───────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background: #f0f2f5;
  font-family: 'Sora', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
::-webkit-scrollbar { width: 0; }
input::placeholder, textarea::placeholder { color: #c8cdd6; }
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
button { font-family: 'Sora', sans-serif; }

/* ── Keyframes ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes slideRight {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideLeft {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.88); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
@keyframes ripple {
  0%   { transform: scale(0); opacity: .6; }
  100% { transform: scale(3); opacity: 0; }
}
@keyframes bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.25); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-5px); }
  40%      { transform: translateX(5px); }
  60%      { transform: translateX(-3px); }
  80%      { transform: translateX(3px); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-12px) scaleY(0.95); }
  to   { opacity: 1; transform: translateY(0) scaleY(1); }
}
@keyframes confettiFall {
  0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(20px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(10px) scale(0.9); }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes numberRoll {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes glow {
  0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
  50%      { box-shadow: 0 0 0 8px rgba(59,130,246,0.12); }
}
@keyframes tabSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Utility classes ── */
.card-enter { animation: fadeUp 0.38s cubic-bezier(.22,1,.36,1) both; }
.tab-content { animation: fadeUp 0.3s cubic-bezier(.22,1,.36,1) both; }
.scale-press:active { transform: scale(0.94); }
.hover-lift { transition: transform 0.18s ease, box-shadow 0.18s ease; }
.hover-lift:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08) !important; }
`;

/* ─────────────────────────────── PRIMITIVES ────────────────────────────── */

const Ring = ({ pct, size = 120, stroke = 8, color = "#3b82f6", bg = "#e8ecf0", children }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [animPct, setAnimPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);
  const dash = (Math.min(animPct, 100) / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.34,1.56,.64,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

const MiniRing = ({ pct, color, size = 38 }) => {
  const stroke = 3, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(pct), 50); return () => clearTimeout(t); }, [pct]);
  const dash = (Math.min(anim, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8ecf0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s cubic-bezier(.34,1.56,.64,1)" }} />
    </svg>
  );
};

const Card = ({ children, style = {}, animate = true, delay = 0 }) => (
  <div className={animate ? "card-enter hover-lift" : ""} style={{
    background: "#fff", borderRadius: 22, padding: 20,
    border: "1px solid rgba(0,0,0,0.045)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    animationDelay: `${delay}ms`, ...style
  }}>{children}</div>
);

const Lbl = ({ children, style = {} }) => (
  <p style={{ color: "#a0a8b5", fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, marginBottom: 13, ...style }}>
    {children}
  </p>
);

const Pill = ({ children, active, color = "#0f172a", onClick, style = {} }) => (
  <button onClick={onClick} className="scale-press" style={{
    background: active ? color : "transparent",
    border: `1.5px solid ${active ? color : "#e0e4ea"}`,
    borderRadius: 99, padding: "5px 14px", fontSize: 11.5, fontWeight: 600,
    color: active ? "#fff" : "#9ca3af", cursor: "pointer",
    transition: "all 0.2s cubic-bezier(.34,1.56,.64,1)", fontFamily: "inherit", ...style
  }}>{children}</button>
);

const TextInput = ({ style = {}, ...rest }) => (
  <input {...rest} style={{
    background: "#f7f9fc", border: "1.5px solid #e8ecf2", borderRadius: 13,
    padding: "11px 15px", fontSize: 14, outline: "none", fontFamily: "inherit",
    color: "#374151", width: "100%", boxSizing: "border-box",
    transition: "border-color 0.2s ease", ...style
  }} onFocus={e => e.target.style.borderColor = "#3b82f6"}
     onBlur={e => e.target.style.borderColor = "#e8ecf2"} />
);

/* ─────────────────────────────── TOAST ─────────────────────────────────── */

const ToastContext = ({ toasts }) => (
  <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 1000, display: "flex", flexDirection: "column", gap: 8, maxWidth: 380, width: "calc(100% - 40px)" }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        background: "#0f172a", borderRadius: 14, padding: "12px 18px",
        display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        animation: t.dying ? "toastOut 0.3s ease forwards" : "toastIn 0.35s cubic-bezier(.34,1.56,.64,1) both"
      }}>
        <span style={{ fontSize: 18 }}>{t.icon}</span>
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{t.msg}</span>
      </div>
    ))}
  </div>
);

/* ─────────────────────────────── CONFETTI ──────────────────────────────── */

const Confetti = ({ active }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 12 }, (_, i) => ({
    id: i, left: 10 + i * 7.5, color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5],
    delay: i * 0.08, dur: 0.7 + Math.random() * 0.4, size: 6 + Math.random() * 5,
  }));
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", pointerEvents: "none", overflow: "hidden", height: 80, zIndex: 5 }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, top: 0,
          width: p.size, height: p.size, borderRadius: p.id % 3 === 0 ? "50%" : 3,
          background: p.color, animation: `confettiFall ${p.dur}s ${p.delay}s ease-out forwards`
        }} />
      ))}
    </div>
  );
};

/* ─────────────────────────────── ANIMATED NUMBER ───────────────────────── */

const AnimNum = ({ value, style = {} }) => {
  const [disp, setDisp] = useState(value);
  const [key, setKey] = useState(0);
  useEffect(() => {
    setKey(k => k + 1);
    const t = setTimeout(() => setDisp(value), 0);
    return () => clearTimeout(t);
  }, [value]);
  return <span key={key} style={{ display: "inline-block", animation: "numberRoll 0.3s ease both", ...style }}>{disp}</span>;
};

/* ═══════════════════════════════ MAIN APP ══════════════════════════════ */

export default function App() {
  const [data, setData]   = useState(defaultData);
  const [tab,  setTab]    = useState(0);
  const [prevTab, setPrev] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [tabKey, setTabKey] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [confetti, setConfetti] = useState(false);

  // Timer
  const [timerSec,    setTimerSec]    = useState(25 * 60);
  const [timerRun,    setTimerRun]    = useState(false);
  const [timerMode,   setTimerMode]   = useState("work");
  const [timerPreset, setTimerPreset] = useState(25);
  const [sessions,    setSessions]    = useState(0);

  const today    = todayKey();
  const hlToday  = data.habitLog[today] || {};
  const todayMood = data.mood[today];
  const pending  = data.tasks.filter(t => !t.done);
  const done     = data.tasks.filter(t =>  t.done);
  const allTags  = [...new Set(data.tasks.map(t => t.tag).filter(Boolean))];

  const habitScore = data.habits.length
    ? Math.round(data.habits.reduce((a, h) => a + Math.min((hlToday[h.id] || 0) / h.goal, 1), 0) / data.habits.length * 100) : 0;
  const taskScore  = data.tasks.length ? Math.round(done.length / data.tasks.length * 100) : 0;
  const overall    = (data.habits.length || data.tasks.length) ? Math.round((habitScore + taskScore) / 2) : 0;

  // Load / save
  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get(STORAGE_KEY); if (r) setData(JSON.parse(r.value)); }
      catch {}
      setLoaded(true);
    })();
  }, []);
  useEffect(() => {
    if (!loaded) return;
    window.storage.set(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, loaded]);

  // Timer
  useEffect(() => {
    if (!timerRun) return;
    const id = setInterval(() => {
      setTimerSec(s => {
        if (s <= 1) {
          setTimerRun(false);
          if (timerMode === "work") {
            setSessions(n => n + 1);
            toast("☕", "Session terminée ! Pause méritée.");
            setTimerMode("break"); return 5 * 60;
          } else {
            toast("🎯", "Pause terminée ! Let's focus.");
            setTimerMode("work"); return timerPreset * 60;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRun, timerMode, timerPreset]);

  const save = fn => setData(p => { const n = structuredClone(p); fn(n); return n; });

  const toast = useCallback((icon, msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, icon, msg, dying: false }]);
    setTimeout(() => setToasts(t => t.map(x => x.id === id ? { ...x, dying: true } : x)), 2700);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const switchTab = i => {
    setPrev(tab); setTab(i); setTabKey(k => k + 1);
  };

  const celebrate = () => { setConfetti(true); setTimeout(() => setConfetti(false), 1200); };

  /* ══════════════════════════ TODAY TAB ══════════════════════════════════ */
  const TodayTab = () => {
    const week = last7();
    const streak = (() => {
      let s = 0, d = new Date();
      for (let i = 0; i < 60; i++) {
        const k = d.toISOString().split("T")[0];
        if (data.mood[k]) s++;
        else if (k !== today) break;
        d.setDate(d.getDate() - 1);
      }
      return s;
    })();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

        {/* Hero score */}
        <Card delay={0} style={{ background: "linear-gradient(145deg,#0f172a 0%,#1e293b 100%)", border: "none", overflow: "hidden", position: "relative" }}>
          <Confetti active={confetti} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <p style={{ color: "#fff", fontSize: 21, fontWeight: 800, letterSpacing: -0.5, marginBottom: 16 }}>
                Score du jour
              </p>
              <div style={{ display: "flex", gap: 22 }}>
                {[["Tâches", taskScore, "#3b82f6"], ["Habitudes", habitScore, "#10b981"]].map(([l, v, c]) => (
                  <div key={l}>
                    <div style={{ color: c, fontSize: 20, fontWeight: 800 }}>
                      <AnimNum value={v} />%
                    </div>
                    <div style={{ color: "#475569", fontSize: 11, marginTop: 1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <Ring pct={overall} size={108} stroke={9} color="#3b82f6" bg="#1e293b">
              <AnimNum value={overall} style={{ color: "#fff", fontSize: 24, fontWeight: 800 }} />
              <span style={{ color: "#475569", fontSize: 10 }}>/ 100</span>
            </Ring>
          </div>
          {overall === 100 && (
            <div style={{ position: "absolute", top: 12, right: 12, animation: "bounce 0.6s ease" }}>
              <span style={{ fontSize: 24 }}>🏆</span>
            </div>
          )}
        </Card>

        {/* Week */}
        <Card delay={60}>
          <Lbl>Cette semaine</Lbl>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {week.map((d, i) => {
              const m = data.mood[d], mood = m ? MOODS.find(x => x.value === m) : null, isT = d === today;
              return (
                <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, animation: `fadeUp 0.3s ${i * 40}ms both` }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 11,
                    background: isT ? "#0f172a" : (mood ? mood.color + "18" : "#f7f9fc"),
                    border: `1.5px solid ${isT ? "#0f172a" : mood ? mood.color + "55" : "#e8ecf0"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                    transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
                    transform: isT ? "scale(1.1)" : "scale(1)"
                  }}>
                    {mood ? mood.emoji : <span style={{ color: "#d1d5db", fontSize: 9 }}>•</span>}
                  </div>
                  <span style={{ fontSize: 9, color: isT ? "#0f172a" : "#b0b8c4", fontWeight: isT ? 700 : 400 }}>
                    {new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "narrow" })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mood */}
        <Card delay={120}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
            <Lbl style={{ marginBottom: 0 }}>Humeur</Lbl>
            {streak > 0 && (
              <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 99, padding: "3px 10px", fontSize: 11, color: "#92400e", fontWeight: 700, animation: "scaleIn 0.4s ease" }}>
                🔥 {streak} jours
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {MOODS.map((m, i) => (
              <button key={m.value} onClick={() => { save(d => { d.mood[today] = m.value; }); if (m.value >= 4) toast(m.emoji, `Humeur enregistrée !`); }}
                className="scale-press" style={{
                  flex: 1, background: todayMood === m.value ? m.color + "22" : "#f7f9fc",
                  border: `2px solid ${todayMood === m.value ? m.color : "#e8ecf0"}`,
                  borderRadius: 15, padding: "10px 4px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)",
                  transform: todayMood === m.value ? "scale(1.08)" : "scale(1)",
                  animation: `fadeUp 0.3s ${i * 50}ms both`
                }}>
                <span style={{ fontSize: 19 }}>{m.emoji}</span>
                <span style={{ fontSize: 9, color: todayMood === m.value ? m.color : "#b0b8c4", fontWeight: 600 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Quick habits */}
        <Card delay={180}>
          <Lbl>Habitudes du jour</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {data.habits.map((h, i) => {
              const cur = hlToday[h.id] || 0, pct = Math.min(cur / h.goal * 100, 100);
              return (
                <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, animation: `slideRight 0.3s ${i * 50 + 60}ms both` }}>
                  <span style={{ fontSize: 17, width: 26, textAlign: "center" }}>{h.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{h.name}</span>
                      <span style={{ fontSize: 12, color: pct === 100 ? h.color : "#9ca3af", fontWeight: 600, transition: "color 0.3s" }}>
                        <AnimNum value={cur} /><span>/{h.goal} {h.unit}</span>
                      </span>
                    </div>
                    <div style={{ background: "#f0f2f5", borderRadius: 99, height: 5, overflow: "hidden" }}>
                      <div style={{ background: h.color, height: "100%", width: `${pct}%`, borderRadius: 99, transition: "width 0.5s cubic-bezier(.34,1.56,.64,1)" }} />
                    </div>
                  </div>
                  <button onClick={() => {
                    save(d => {
                      if (!d.habitLog[today]) d.habitLog[today] = {};
                      const c = d.habitLog[today][h.id] || 0;
                      d.habitLog[today][h.id] = c >= h.goal ? 0 : c + 1;
                      if (c + 1 === h.goal) { celebrate(); toast(h.icon, `${h.name} complété ! 🎉`); }
                    });
                  }} className="scale-press" style={{
                    width: 33, height: 33, borderRadius: 10, flexShrink: 0,
                    background: pct === 100 ? h.color : "#f0f2f5",
                    border: `1.5px solid ${pct === 100 ? h.color : "#e0e4ea"}`,
                    color: pct === 100 ? "#fff" : "#9ca3af", cursor: "pointer",
                    fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)",
                    animation: pct === 100 ? "bounce 0.5s ease" : "none"
                  }}>{pct === 100 ? "✓" : "+"}</button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Goals */}
        {data.goals.length > 0 && (
          <Card delay={240}>
            <Lbl>Objectifs</Lbl>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {data.goals.map((g, i) => {
                const dl = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000) : null;
                return (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 11, animation: `slideRight 0.3s ${i * 60}ms both` }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: "#374151" }}>{g.title}</span>
                    {dl !== null && (
                      <span style={{ fontSize: 11, color: dl < 7 ? "#ef4444" : "#9ca3af", fontWeight: 700, animation: dl < 7 ? "pulse 1.5s infinite" : "none" }}>
                        {dl > 0 ? `J-${dl}` : "⚠"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <Card delay={300}>
            <Lbl>À faire · {pending.length}</Lbl>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {pending.slice(0, 4).map((t, i) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 11, animation: `slideRight 0.3s ${i * 50}ms both` }}>
                  <button onClick={() => { save(d => { const x = d.tasks.find(x => x.id === t.id); if (x) { x.done = true; toast("✅", "Tâche complétée !"); } }); }}
                    className="scale-press" style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                      background: "transparent", border: `2px solid ${PRIORITY[t.priority ?? 1].color}`, cursor: "pointer"
                    }} />
                  <span style={{ flex: 1, fontSize: 13, color: "#374151" }}>{t.text}</span>
                  {t.tag && <span style={{ fontSize: 10, background: "#f0f2f5", color: "#9ca3af", borderRadius: 99, padding: "2px 8px" }}>#{t.tag}</span>}
                </div>
              ))}
              {pending.length > 4 && <p style={{ fontSize: 12, color: "#b0b8c4", textAlign: "center" }}>+{pending.length - 4} tâches</p>}
            </div>
          </Card>
        )}

      </div>
    );
  };

  /* ══════════════════════════ FOCUS TAB ══════════════════════════════════ */
  const FocusTab = () => {
    const presets = [15, 25, 45, 60];
    const elapsed = timerPreset * 60 - timerSec;
    const pct = elapsed / (timerPreset * 60) * 100;
    const [localFocus, setLocalFocus] = useState(data.focus);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

        <Card delay={0} style={{ textAlign: "center" }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 22 }}>
            {presets.map(p => (
              <Pill key={p} active={timerPreset === p} color="#0f172a"
                onClick={() => { setTimerPreset(p); setTimerSec(p * 60); setTimerRun(false); }}>
                {p}min
              </Pill>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22, position: "relative" }}>
            {timerRun && (
              <div style={{
                position: "absolute", inset: -8, borderRadius: "50%",
                animation: "glow 2s ease infinite", pointerEvents: "none"
              }} />
            )}
            <Ring pct={timerRun || timerSec < timerPreset * 60 ? pct : 0}
              size={190} stroke={11} color={timerMode === "work" ? "#0f172a" : "#10b981"} bg="#f0f2f5">
              <span style={{
                fontSize: 40, fontWeight: 800, color: "#0f172a",
                fontVariantNumeric: "tabular-nums", letterSpacing: -1,
                transition: "all 0.3s ease"
              }}>
                {fmtTime(timerSec)}
              </span>
              <span style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                {timerMode === "work" ? "🎯 Focus" : "☕ Pause"}
              </span>
              {timerRun && (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", marginTop: 6, animation: "pulse 1s infinite" }} />
              )}
            </Ring>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => setTimerRun(r => !r)} className="scale-press" style={{
              background: timerMode === "work" ? "#0f172a" : "#10b981",
              border: "none", borderRadius: 15, padding: "13px 36px",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: timerRun ? "0 6px 20px rgba(15,23,42,0.3)" : "none"
            }}>
              {timerRun ? "⏸ Pause" : "▶ Démarrer"}
            </button>
            <button onClick={() => { setTimerRun(false); setTimerSec(timerPreset * 60); setTimerMode("work"); }}
              className="scale-press" style={{
                background: "#f0f2f5", border: "1.5px solid #e0e4ea", borderRadius: 15, padding: "13px 18px",
                color: "#94a3b8", fontSize: 18, cursor: "pointer", fontFamily: "inherit"
              }}>↺</button>
          </div>
        </Card>

        <Card delay={80}>
          <Lbl>Sessions aujourd'hui</Lbl>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <AnimNum value={sessions} style={{ fontSize: 38, fontWeight: 800, color: "#0f172a" }} />
            <div>
              <p style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Sessions complétées</p>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{sessions * timerPreset} min de focus total</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 4 }}>
              {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
                <div key={i} style={{
                  width: 8, height: 12 + i * 3, background: "#0f172a", borderRadius: 99,
                  animation: `fadeUp 0.4s ${i * 60}ms both`
                }} />
              ))}
            </div>
          </div>
        </Card>

        {pending.length > 0 && (
          <Card delay={160}>
            <Lbl>Sur quoi tu travailles ?</Lbl>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pending.slice(0, 6).map((t, i) => (
                <button key={t.id} onClick={() => { save(d => { d.focus = d.focus === t.id ? null : t.id; }); setLocalFocus(f => f === t.id ? null : t.id); }}
                  className="scale-press" style={{
                    background: localFocus === t.id ? "#f0f9ff" : "#f7f9fc",
                    border: `1.5px solid ${localFocus === t.id ? "#3b82f6" : "#e8ecf2"}`,
                    borderRadius: 13, padding: "11px 15px", cursor: "pointer", textAlign: "left",
                    display: "flex", alignItems: "center", gap: 11,
                    transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)", fontFamily: "inherit",
                    animation: `fadeUp 0.3s ${i * 50 + 60}ms both`
                  }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY[t.priority ?? 1].color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: localFocus === t.id ? 600 : 400, flex: 1 }}>{t.text}</span>
                  {localFocus === t.id && <span style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700 }}>En cours ▶</span>}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  /* ══════════════════════════ TASKS TAB ══════════════════════════════════ */
  const TasksTab = () => {
    const [newT, setNewT] = useState("");
    const [prio, setPrio] = useState(1);
    const [tag, setTag]   = useState("");
    const [fTag, setFTag] = useState(null);
    const [fPrio, setFPrio] = useState(null);
    const [editId, setEditId] = useState(null);
    const [editTxt, setEditTxt] = useState("");
    const [completing, setCompleting] = useState(null);

    const add = () => {
      if (!newT.trim()) return;
      save(d => d.tasks.unshift({ id: Date.now(), text: newT.trim(), done: false, priority: prio, tag: tag.trim() || null, created: today }));
      setNewT(""); setTag("");
      toast("✍️", "Tâche ajoutée !");
    };

    const complete = id => {
      setCompleting(id);
      setTimeout(() => {
        save(d => { const x = d.tasks.find(x => x.id === id); if (x) x.done = true; });
        setCompleting(null);
        toast("✅", "Tâche complétée !");
      }, 320);
    };

    const filterT = arr => arr.filter(t => (!fTag || t.tag === fTag) && (fPrio === null || t.priority === fPrio));
    const disPend = filterT(pending);
    const disDone = filterT(done);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

        <Card delay={0}>
          <div style={{ display: "flex", gap: 9, marginBottom: 12 }}>
            <TextInput value={newT} onChange={e => setNewT(e.target.value)}
              onKeyDown={e => e.key === "Enter" && add()} placeholder="Nouvelle tâche..." style={{ flex: 1, width: "auto" }} />
            <button onClick={add} className="scale-press" style={{
              background: "#0f172a", border: "none", borderRadius: 13, width: 44, height: 44,
              color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1)"
            }}>+</button>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {PRIORITY.map((p, i) => (
              <Pill key={i} active={prio === i} color={p.color} onClick={() => setPrio(i)}>{p.label}</Pill>
            ))}
            <input value={tag} onChange={e => setTag(e.target.value)} placeholder="#tag"
              style={{ fontSize: 11.5, border: "1.5px solid #e0e4ea", borderRadius: 99, padding: "5px 12px", outline: "none", fontFamily: "inherit", color: "#6b7280", background: "#f7f9fc", width: 72 }} />
          </div>
        </Card>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          <Pill active={!fTag && fPrio === null} color="#0f172a" onClick={() => { setFTag(null); setFPrio(null); }}>Tous</Pill>
          {PRIORITY.map((p, i) => (
            <Pill key={i} active={fPrio === i} color={p.color} onClick={() => setFPrio(fPrio === i ? null : i)}>{p.label}</Pill>
          ))}
          {allTags.map(t => (
            <Pill key={t} active={fTag === t} color="#6b7280" onClick={() => setFTag(fTag === t ? null : t)}>#{t}</Pill>
          ))}
        </div>

        {disPend.length > 0 && (
          <div>
            <Lbl>À faire · {disPend.length}</Lbl>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {disPend.map((t, i) => (
                <Card key={t.id} animate={false} style={{
                  padding: "13px 15px",
                  animation: completing === t.id
                    ? "shake 0.3s ease"
                    : `fadeUp 0.3s ${i * 40}ms both`,
                  opacity: completing === t.id ? 0.6 : 1,
                  transition: "opacity 0.3s ease"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <button onClick={() => complete(t.id)} className="scale-press" style={{
                      width: 21, height: 21, borderRadius: "50%", flexShrink: 0,
                      background: "transparent", border: `2.5px solid ${PRIORITY[t.priority ?? 1].color}`, cursor: "pointer",
                      transition: "all 0.25s cubic-bezier(.34,1.56,.64,1)"
                    }} />
                    {editId === t.id ? (
                      <input autoFocus value={editTxt} onChange={e => setEditTxt(e.target.value)}
                        onBlur={() => { save(d => { const x = d.tasks.find(x => x.id === t.id); if (x) x.text = editTxt; }); setEditId(null); }}
                        onKeyDown={e => { if (e.key === "Enter") { save(d => { const x = d.tasks.find(x => x.id === t.id); if (x) x.text = editTxt; }); setEditId(null); } }}
                        style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "inherit", color: "#374151", background: "transparent" }} />
                    ) : (
                      <span onClick={() => { setEditId(t.id); setEditTxt(t.text); }}
                        style={{ flex: 1, fontSize: 14, color: "#374151", cursor: "text" }}>{t.text}</span>
                    )}
                    {t.tag && <span style={{ fontSize: 10, background: "#f0f2f5", color: "#9ca3af", borderRadius: 99, padding: "2px 8px" }}>#{t.tag}</span>}
                    <div style={{ width: 9, height: 9, borderRadius: "50%", background: PRIORITY[t.priority ?? 1].color, flexShrink: 0 }} />
                    <button onClick={() => save(d => { d.tasks = d.tasks.filter(x => x.id !== t.id); })}
                      style={{ background: "transparent", border: "none", color: "#d1d5db", cursor: "pointer", fontSize: 18, padding: "0 2px", transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#ef4444"} onMouseLeave={e => e.target.style.color = "#d1d5db"}>×</button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {disDone.length > 0 && (
          <div>
            <Lbl>Terminées · {disDone.length}</Lbl>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {disDone.map((t, i) => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "11px 15px",
                  background: "#f7f9fc", borderRadius: 15, border: "1px solid #f0f2f5",
                  animation: `fadeUp 0.3s ${i * 35}ms both`
                }}>
                  <button onClick={() => save(d => { const x = d.tasks.find(x => x.id === t.id); if (x) x.done = false; })}
                    className="scale-press" style={{
                      width: 21, height: 21, borderRadius: "50%", flexShrink: 0,
                      background: "#10b981", border: "none", cursor: "pointer",
                      color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>✓</button>
                  <span style={{ flex: 1, fontSize: 13, color: "#b0b8c4", textDecoration: "line-through" }}>{t.text}</span>
                  <button onClick={() => save(d => { d.tasks = d.tasks.filter(x => x.id !== t.id); })}
                    style={{ background: "transparent", border: "none", color: "#e0e4ea", cursor: "pointer", fontSize: 17 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.tasks.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#c8cdd6", animation: "fadeIn 0.5s ease" }}>
            <div style={{ fontSize: 42, marginBottom: 12, animation: "bounce 1s ease infinite" }}>✨</div>
            <p style={{ fontSize: 14 }}>Commence par ajouter une tâche !</p>
          </div>
        )}
      </div>
    );
  };

  /* ══════════════════════════ HABITS TAB ═════════════════════════════════ */
  const HabitsTab = () => {
    const [showAdd, setShowAdd]   = useState(false);
    const [nh, setNh]             = useState({ name: "", icon: "⭐", goal: 1, color: "#3b82f6", unit: "fois" });
    const [showGoal, setShowGoal] = useState(false);
    const [ng, setNg]             = useState({ title: "", target: "", deadline: "", color: "#3b82f6" });
    const [ripple, setRipple]     = useState(null);
    const week = last7();

    const rippleHabit = id => { setRipple(id); setTimeout(() => setRipple(null), 500); };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>
            Score: <AnimNum value={habitScore} style={{ color: "#0f172a", fontWeight: 700 }} />%
          </span>
          <button onClick={() => setShowAdd(true)} className="scale-press" style={{
            background: "#0f172a", border: "none", borderRadius: 11, padding: "8px 18px",
            color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1)"
          }}>+ Habitude</button>
        </div>

        {showAdd && (
          <Card delay={0} style={{ animation: "slideDown 0.3s cubic-bezier(.34,1.56,.64,1) both" }}>
            <Lbl>Nouvelle habitude</Lbl>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TextInput value={nh.name} onChange={e => setNh(p => ({ ...p, name: e.target.value }))} placeholder="Nom de l'habitude" />
              <div style={{ display: "flex", gap: 8 }}>
                <input value={nh.icon} onChange={e => setNh(p => ({ ...p, icon: e.target.value }))} maxLength={2}
                  style={{ width: 50, background: "#f7f9fc", border: "1.5px solid #e8ecf2", borderRadius: 12, padding: "10px", fontSize: 18, outline: "none", textAlign: "center" }} />
                <input type="number" min={1} value={nh.goal} onChange={e => setNh(p => ({ ...p, goal: parseInt(e.target.value) || 1 }))} placeholder="Objectif"
                  style={{ flex: 1, background: "#f7f9fc", border: "1.5px solid #e8ecf2", borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#374151" }} />
                <input value={nh.unit} onChange={e => setNh(p => ({ ...p, unit: e.target.value }))} placeholder="unité"
                  style={{ flex: 1, background: "#f7f9fc", border: "1.5px solid #e8ecf2", borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#374151" }} />
                <input type="color" value={nh.color} onChange={e => setNh(p => ({ ...p, color: e.target.value }))}
                  style={{ width: 44, height: 44, border: "none", borderRadius: 11, cursor: "pointer", padding: 2 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  if (!nh.name.trim()) return;
                  save(d => d.habits.push({ ...nh, id: Date.now() }));
                  setNh({ name: "", icon: "⭐", goal: 1, color: "#3b82f6", unit: "fois" });
                  setShowAdd(false); toast("🔥", "Habitude créée !");
                }} className="scale-press" style={{ flex: 1, background: "#0f172a", border: "none", borderRadius: 12, padding: 11, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                  Créer
                </button>
                <button onClick={() => setShowAdd(false)} className="scale-press"
                  style={{ flex: 1, background: "#f7f9fc", border: "1.5px solid #e0e4ea", borderRadius: 12, padding: 11, color: "#9ca3af", cursor: "pointer", fontFamily: "inherit" }}>
                  Annuler
                </button>
              </div>
            </div>
          </Card>
        )}

        {data.habits.map((h, i) => {
          const cur = hlToday[h.id] || 0, pct = Math.min(cur / h.goal * 100, 100);
          return (
            <Card key={h.id} delay={i * 60}>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 13 }}>
                <div style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
                  onClick={() => {
                    rippleHabit(h.id);
                    save(d => {
                      if (!d.habitLog[today]) d.habitLog[today] = {};
                      const c = d.habitLog[today][h.id] || 0;
                      d.habitLog[today][h.id] = c >= h.goal ? 0 : c + 1;
                      if (c + 1 === h.goal) { celebrate(); toast(h.icon, `${h.name} complété ! 🎉`); }
                    });
                  }}>
                  <MiniRing pct={pct} color={h.color} />
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{h.icon}</span>
                  {ripple === h.id && (
                    <div style={{
                      position: "absolute", inset: "50%", transform: "translate(-50%,-50%)",
                      width: 30, height: 30, borderRadius: "50%",
                      background: h.color + "44",
                      animation: "ripple 0.5s ease-out forwards"
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: "#374151", fontWeight: 600, marginBottom: 1 }}>{h.name}</p>
                  <p style={{ fontSize: 12, color: pct === 100 ? h.color : "#9ca3af", transition: "color 0.3s" }}>
                    <AnimNum value={cur} />/{h.goal} {h.unit}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => save(d => {
                    if (!d.habitLog[today]) d.habitLog[today] = {};
                    const c = d.habitLog[today][h.id] || 0;
                    if (c > 0) d.habitLog[today][h.id] = c - 1;
                  })} className="scale-press" style={{ width: 33, height: 33, borderRadius: 10, background: "#f0f2f5", border: "1.5px solid #e0e4ea", color: "#9ca3af", cursor: "pointer", fontSize: 16, transition: "all 0.2s" }}>−</button>
                  <button onClick={() => {
                    rippleHabit(h.id);
                    save(d => {
                      if (!d.habitLog[today]) d.habitLog[today] = {};
                      const c = d.habitLog[today][h.id] || 0;
                      d.habitLog[today][h.id] = c >= h.goal ? 0 : c + 1;
                      if (c + 1 === h.goal) { celebrate(); toast(h.icon, `${h.name} complété ! 🎉`); }
                    });
                  }} className="scale-press" style={{
                    width: 33, height: 33, borderRadius: 10,
                    background: pct === 100 ? h.color : "#f0f2f5",
                    border: `1.5px solid ${pct === 100 ? h.color : "#e0e4ea"}`,
                    color: pct === 100 ? "#fff" : "#9ca3af", cursor: "pointer", fontSize: 16,
                    transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
                    animation: pct === 100 ? "bounce 0.5s ease" : "none"
                  }}>+</button>
                </div>
                <button onClick={() => save(d => { d.habits = d.habits.filter(x => x.id !== h.id); })}
                  style={{ background: "transparent", border: "none", color: "#e0e4ea", cursor: "pointer", fontSize: 19, transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#ef4444"} onMouseLeave={e => e.target.style.color = "#e0e4ea"}>×</button>
              </div>

              <div style={{ background: "#f0f2f5", borderRadius: 99, height: 6, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ background: `linear-gradient(90deg, ${h.color}, ${h.color}cc)`, height: "100%", width: `${pct}%`, borderRadius: 99, transition: "width 0.6s cubic-bezier(.34,1.56,.64,1)" }} />
              </div>

              <div style={{ display: "flex", gap: 3 }}>
                {week.map((d, wi) => {
                  const v = (data.habitLog[d] || {})[h.id] || 0, ratio = Math.min(v / h.goal, 1);
                  return (
                    <div key={d} style={{ flex: 1, height: 5, borderRadius: 99, background: "#f0f2f5", overflow: "hidden" }}>
                      <div style={{ width: `${ratio * 100}%`, height: "100%", background: h.color, borderRadius: 99, transition: "width 0.4s ease", animationDelay: `${wi * 50}ms` }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", marginTop: 4 }}>
                {week.map(d => (
                  <span key={d} style={{ flex: 1, fontSize: 9, color: "#c8cdd6", textAlign: "center" }}>
                    {new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "narrow" })}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          <Lbl>Objectifs long terme</Lbl>
          <button onClick={() => setShowGoal(true)} className="scale-press" style={{
            background: "transparent", border: "1.5px solid #e0e4ea", borderRadius: 10, padding: "5px 14px",
            color: "#9ca3af", fontSize: 12, cursor: "pointer", fontFamily: "inherit"
          }}>+ Objectif</button>
        </div>

        {showGoal && (
          <Card delay={0} style={{ animation: "slideDown 0.3s cubic-bezier(.34,1.56,.64,1) both" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TextInput value={ng.title} onChange={e => setNg(p => ({ ...p, title: e.target.value }))} placeholder="Mon objectif" />
              <TextInput value={ng.target} onChange={e => setNg(p => ({ ...p, target: e.target.value }))} placeholder="Détails..." />
              <div style={{ display: "flex", gap: 8 }}>
                <input type="date" value={ng.deadline} onChange={e => setNg(p => ({ ...p, deadline: e.target.value }))}
                  style={{ flex: 1, background: "#f7f9fc", border: "1.5px solid #e8ecf2", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", fontFamily: "inherit", color: "#374151" }} />
                <input type="color" value={ng.color} onChange={e => setNg(p => ({ ...p, color: e.target.value }))}
                  style={{ width: 44, height: 44, border: "none", borderRadius: 11, cursor: "pointer", padding: 2 }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  if (!ng.title.trim()) return;
                  save(d => d.goals.push({ ...ng, id: Date.now() }));
                  setNg({ title: "", target: "", deadline: "", color: "#3b82f6" }); setShowGoal(false);
                  toast("🎯", "Objectif créé !");
                }} className="scale-press" style={{ flex: 1, background: "#0f172a", border: "none", borderRadius: 12, padding: 11, color: "#fff", cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>
                  Créer
                </button>
                <button onClick={() => setShowGoal(false)} className="scale-press"
                  style={{ flex: 1, background: "#f7f9fc", border: "1.5px solid #e0e4ea", borderRadius: 12, padding: 11, color: "#9ca3af", cursor: "pointer", fontFamily: "inherit" }}>
                  Annuler
                </button>
              </div>
            </div>
          </Card>
        )}

        {data.goals.map((g, i) => {
          const dl = g.deadline ? Math.ceil((new Date(g.deadline) - new Date()) / 86400000) : null;
          return (
            <Card key={g.id} delay={i * 50} style={{ padding: "14px 17px", display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{g.title}</p>
                {g.target && <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{g.target}</p>}
              </div>
              {dl !== null && (
                <span style={{ fontSize: 12, color: dl < 7 ? "#ef4444" : "#9ca3af", fontWeight: 700, flexShrink: 0, animation: dl < 7 ? "pulse 1.5s infinite" : "none" }}>
                  {dl > 0 ? `J-${dl}` : "⚠ Dépassé"}
                </span>
              )}
              <button onClick={() => save(d => { d.goals = d.goals.filter(x => x.id !== g.id); })}
                style={{ background: "transparent", border: "none", color: "#e0e4ea", cursor: "pointer", fontSize: 19 }}>×</button>
            </Card>
          );
        })}
      </div>
    );
  };

  /* ══════════════════════════ JOURNAL TAB ════════════════════════════════ */
  const JournalTab = () => {
    const [note,   setNote]   = useState(data.notes[today] || "");
    const [grat,   setGrat]   = useState(data.notes[today + "_g"] || "");
    const [intent, setIntent] = useState(data.notes[today + "_i"] || "");
    const [view,   setView]   = useState("write");
    const [saved,  setSaved]  = useState(false);
    const charCount = note.length;

    const onSave = () => {
      save(d => { d.notes[today] = note; d.notes[today + "_g"] = grat; d.notes[today + "_i"] = intent; });
      setSaved(true); toast("📖", "Journal sauvegardé !");
      setTimeout(() => setSaved(false), 2000);
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Pill active={view === "write"} color="#0f172a" onClick={() => setView("write")}>✎ Écrire</Pill>
          <Pill active={view === "history"} color="#0f172a" onClick={() => setView("history")}>📋 Historique</Pill>
        </div>

        {view === "write" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            <Card delay={0}>
              <Lbl>🙏 Gratitude</Lbl>
              <textarea value={grat} onChange={e => setGrat(e.target.value)} placeholder={"1. \n2. \n3."}
                style={{ width: "100%", minHeight: 80, background: "#f7f9fc", border: "1.5px solid #e8ecf2", borderRadius: 13, padding: 13, fontSize: 13, outline: "none", resize: "none", fontFamily: "'Sora', sans-serif", color: "#374151", boxSizing: "border-box", lineHeight: 1.7, transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#10b981"} onBlur={e => e.target.style.borderColor = "#e8ecf2"} />
            </Card>

            <Card delay={60}>
              <Lbl>🎯 Intention du jour</Lbl>
              <TextInput value={intent} onChange={e => setIntent(e.target.value)} placeholder="Aujourd'hui je veux..."
                onFocus={e => e.target.style.borderColor = "#f59e0b"} onBlur={e => e.target.style.borderColor = "#e8ecf2"} />
            </Card>

            <Card delay={120}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
                <Lbl style={{ marginBottom: 0 }}>✍ Journal libre</Lbl>
                <span style={{ fontSize: 11, color: "#c8cdd6" }}>{charCount} car.</span>
              </div>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Mes pensées, réflexions, idées du jour..."
                style={{ width: "100%", minHeight: 180, background: "#f7f9fc", border: "1.5px solid #e8ecf2", borderRadius: 13, padding: 14, fontSize: 14, outline: "none", resize: "none", fontFamily: "'Lora', serif", color: "#374151", lineHeight: 1.85, boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#8b5cf6"} onBlur={e => e.target.style.borderColor = "#e8ecf2"} />
            </Card>

            <button onClick={onSave} className="scale-press" style={{
              background: saved ? "#10b981" : "#0f172a",
              border: "none", borderRadius: 15, padding: "14px",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.4s cubic-bezier(.34,1.56,.64,1)"
            }}>
              {saved ? "✓ Sauvegardé !" : "💾 Sauvegarder"}
            </button>
          </div>
        )}

        {view === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(data.notes).filter(([k, v]) => !k.includes("_") && v && k !== today)
              .sort((a, b) => b[0].localeCompare(a[0])).slice(0, 20).map(([date, n], i) => {
                const mood = data.mood[date] ? MOODS.find(m => m.value === data.mood[date]) : null;
                return (
                  <Card key={date} delay={i * 50} style={{ padding: "15px 17px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                      <p style={{ fontSize: 12, color: "#9ca3af" }}>{fmtDate(date)}</p>
                      {mood && <span style={{ fontSize: 17 }}>{mood.emoji}</span>}
                    </div>
                    {data.notes[date + "_i"] && (
                      <p style={{ fontSize: 12, color: "#3b82f6", marginBottom: 7, fontStyle: "italic" }}>🎯 {data.notes[date + "_i"]}</p>
                    )}
                    <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.7, fontFamily: "'Lora', serif", fontStyle: "italic" }}>
                      {n.slice(0, 160)}{n.length > 160 ? "..." : ""}
                    </p>
                  </Card>
                );
              })}
            {Object.keys(data.notes).filter(k => !k.includes("_")).length <= 1 && (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#c8cdd6", animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                <p style={{ fontSize: 14 }}>Ton journal est vide pour l'instant.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const CONTENT = [<TodayTab />, <FocusTab />, <TasksTab />, <HabitsTab />, <JournalTab />];

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 430, paddingBottom: 92 }}>

          {/* Header */}
          <div style={{
            padding: "50px 20px 15px",
            background: "rgba(240,242,245,0.92)",
            borderBottom: "1px solid #e8ecf0",
            position: "sticky", top: 0, zIndex: 10,
            backdropFilter: "blur(18px)",
            animation: "fadeIn 0.4s ease"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={{ fontSize: 23, fontWeight: 800, color: "#0f172a", letterSpacing: -0.8 }}>
                  Life<span style={{ color: "#3b82f6" }}>Tracker</span>
                </h1>
                <p style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2, fontWeight: 400 }}>
                  {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {timerRun && (
                  <div style={{
                    background: "#0f172a", borderRadius: 99, padding: "5px 13px",
                    display: "flex", alignItems: "center", gap: 7,
                    animation: "scaleIn 0.4s cubic-bezier(.34,1.56,.64,1)"
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 1s infinite" }} />
                    <span style={{ color: "#fff", fontSize: 12, fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{fmtTime(timerSec)}</span>
                  </div>
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 19, background: "#fff", border: "1.5px solid #e8ecf0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)"
                }}>
                  {todayMood ? MOODS.find(m => m.value === todayMood)?.emoji : "·"}
                </div>
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div key={tabKey} className="tab-content" style={{ padding: "16px 16px 0" }}>
            {CONTENT[tab]}
          </div>

          {/* Tab bar */}
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 430,
            background: "rgba(240,242,245,0.96)", backdropFilter: "blur(20px)",
            borderTop: "1px solid #e0e4ea",
            display: "flex", padding: "10px 10px 26px"
          }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => switchTab(i)} style={{
                flex: 1, background: "transparent", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "5px 0"
              }}>
                <div style={{
                  width: 38, height: 29, borderRadius: 9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: tab === i ? "#0f172a" : "transparent",
                  transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
                  transform: tab === i ? "scale(1.05)" : "scale(1)"
                }}>
                  <span style={{ fontSize: 13, color: tab === i ? "#fff" : "#b0b8c4", fontWeight: 800, transition: "color 0.2s" }}>{t.icon}</span>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
                  color: tab === i ? "#0f172a" : "#b0b8c4",
                  transition: "color 0.2s ease"
                }}>
                  {t.label.toUpperCase()}
                </span>
                <div style={{
                  width: tab === i ? 16 : 0, height: 3, borderRadius: 99,
                  background: "#3b82f6", transition: "width 0.3s cubic-bezier(.34,1.56,.64,1)"
                }} />
              </button>
            ))}
          </div>

        </div>
      </div>

      <ToastContext toasts={toasts} />
    </>
  );
}
