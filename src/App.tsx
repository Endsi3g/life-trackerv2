import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/lib/storage-bridge";

/* ─────────────────────────────── TYPES ─────────────────────────────────── */

interface Task {
  id: number;
  text: string;
  done: boolean;
  priority: number;
  tag: string | null;
  created: string;
}

interface Habit {
  id: number;
  name: string;
  icon: string;
  goal: number;
  color: string;
  unit: string;
}

interface Goal {
  id: number;
  title: string;
  target: string;
  deadline: string;
  color: string;
}

interface AppData {
  tasks: Task[];
  habits: Habit[];
  habitLog: Record<string, Record<number, number>>;
  mood: Record<string, number>;
  notes: Record<string, string>;
  goals: Goal[];
  focus: number | null;
}

/* ─────────────────────────────── CONSTANTS ─────────────────────────────── */

const STORAGE_KEY = "lifetracker_v3";

const defaultData: AppData = {
  tasks: [],
  habits: [
    { id: 1, name: "Eau", icon: "💧", goal: 8, color: "#3b82f6", unit: "verres" },
    { id: 2, name: "Exercice", icon: "🏃", goal: 1, color: "#10b981", unit: "session" },
    { id: 3, name: "Lecture", icon: "📚", goal: 30, color: "#f59e0b", unit: "min" },
    { id: 4, name: "Méditation", icon: "🧘", goal: 10, color: "#8b5cf6", unit: "min" },
  ],
  habitLog: {},
  mood: {},
  notes: {},
  goals: [],
  focus: null,
};

const MOODS = [
  { emoji: "😄", label: "Super", value: 5, color: "#10b981" },
  { emoji: "🙂", label: "Bien", value: 4, color: "#3b82f6" },
  { emoji: "😐", label: "Moyen", value: 3, color: "#f59e0b" },
  { emoji: "😕", label: "Bof", value: 2, color: "#f97316" },
  { emoji: "😞", label: "Mal", value: 1, color: "#ef4444" },
];

const PRIORITY = [
  { label: "Urgent", color: "#ef4444" },
  { label: "Normal", color: "#3b82f6" },
  { label: "Doux", color: "#10b981" },
];

const TABS = [
  { label: "Jour", icon: "◉" },
  { label: "Focus", icon: "⏱" },
  { label: "Tâches", icon: "✓" },
  { label: "Habitudes", icon: "↻" },
  { label: "Journal", icon: "✎" },
];

/* ─────────────────────────────── UTILS ─────────────────────────────────── */

const todayKey = () => new Date().toISOString().split("T")[0];
const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const last7 = () => Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - 6 + i); return d.toISOString().split("T")[0];
});

/* ─────────────────────────────── PRIMITIVES ────────────────────────────── */

const Ring = ({ pct, size = 120, stroke = 8, color = "#3b82f6", bg = "#e8ecf0", children }: any) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.34,1.56,.64,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

const MiniRing = ({ pct, color, size = 38 }: any) => {
  const stroke = 3, r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8ecf0" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s cubic-bezier(.34,1.56,.64,1)" }} />
    </svg>
  );
};

const Card = ({ children, style = {}, animate = true, delay = 0, className = "" }: any) => (
  <motion.div
    initial={animate ? { opacity: 0, y: 15 } : false}
    animate={animate ? { opacity: 1, y: 0 } : false}
    transition={{ duration: 0.35, delay: delay / 1000, ease: [0.34, 1.56, 0.64, 1] }}
    className={`hover-lift ${className}`}
    style={{
      background: "#fff", borderRadius: 22, padding: 20,
      border: "1px solid rgba(0,0,0,0.045)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
      ...style
    }}
  >
    {children}
  </motion.div>
);

const Lbl = ({ children, style = {} }: any) => (
  <p style={{ color: "#a0a8b5", fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, marginBottom: 13, ...style }}>
    {children}
  </p>
);

const Pill = ({ children, active, color = "#0f172a", onClick, style = {} }: any) => (
  <button onClick={onClick} className="scale-press" style={{
    background: active ? color : "transparent",
    border: `1.5px solid ${active ? color : "#e0e4ea"}`,
    borderRadius: 99, padding: "5px 14px", fontSize: 11.5, fontWeight: 600,
    color: active ? "#fff" : "#9ca3af", cursor: "pointer",
    transition: "all 0.2s cubic-bezier(.34,1.56,.64,1)", fontFamily: "inherit", ...style
  }}>{children}</button>
);

const TextInput = ({ style = {}, ...rest }: any) => (
  <input {...rest} style={{
    background: "#f7f9fc", border: "1.5px solid #e8ecf2", borderRadius: 13,
    padding: "11px 15px", fontSize: 14, outline: "none", fontFamily: "inherit",
    color: "#374151", width: "100%", boxSizing: "border-box",
    transition: "border-color 0.2s ease", ...style
  }} onFocus={e => e.target.style.borderColor = "#3b82f6"}
    onBlur={e => e.target.style.borderColor = "#e8ecf2"} />
);

/* ─────────────────────────────── TOAST ─────────────────────────────────── */

const ToastContext = ({ toasts }: any) => (
  <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 1000, display: "flex", flexDirection: "column", gap: 8, maxWidth: 380, width: "calc(100% - 40px)" }}>
    <AnimatePresence>
      {toasts.map((t: any) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          style={{
            background: "#0f172a", borderRadius: 14, padding: "12px 18px",
            display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
          }}
        >
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{t.msg}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

/* ─────────────────────────────── CONFETTI ──────────────────────────────── */

const Confetti = ({ active }: { active: boolean }) => {
  if (!active) return null;
  const pieces = Array.from({ length: 15 }, (_, i) => ({
    id: i, left: 10 + i * 6, color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][i % 5],
    delay: i * 0.05, dur: 0.8 + Math.random() * 0.4, size: 6 + Math.random() * 5,
  }));
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", pointerEvents: "none", overflow: "hidden", height: 120, zIndex: 5 }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, opacity: 1 }}
          animate={{ y: 80, opacity: 0, rotate: 360 }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute", left: `${p.left}%`,
            width: p.size, height: p.size, borderRadius: p.id % 3 === 0 ? "50%" : 3,
            background: p.color
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────── ANIMATED NUMBER ───────────────────────── */

const AnimNum = ({ value, style = {} }: any) => {
  const [disp, setDisp] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDisp(value), 50);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <motion.span
      key={disp}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "inline-block", ...style }}
    >
      {disp}
    </motion.span>
  );
};

/* ═══════════════════════════════ MAIN APP ══════════════════════════════ */

export default function App() {
  const [data, setData] = useState<AppData>(defaultData);
  const [tab, setTab] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [tabKey, setTabKey] = useState(0);
  const [toasts, setToasts] = useState<any[]>([]);
  const [confetti, setConfetti] = useState(false);

  // Timer
  const [timerSec, setTimerSec] = useState(25 * 60);
  const [timerRun, setTimerRun] = useState(false);
  const [timerMode, setTimerMode] = useState("work");
  const [timerPreset, setTimerPreset] = useState(25);
  const [sessions, setSessions] = useState(0);

  const today = todayKey();
  const hlToday = data.habitLog[today] || {};
  const todayMood = data.mood[today];
  const pending = data.tasks.filter(t => !t.done).sort((a, b) => a.priority - b.priority);
  const done = data.tasks.filter(t => t.done);

  const habitScore = data.habits.length
    ? Math.round(data.habits.reduce((a, h) => a + Math.min((hlToday[h.id] || 0) / h.goal, 1), 0) / data.habits.length * 100) : 0;
  const taskScore = data.tasks.length ? Math.round(done.length / data.tasks.length * 100) : 0;
  const overall = (data.habits.length || data.tasks.length) ? Math.round((habitScore + taskScore) / 2) : 0;

  // Load / save
  useEffect(() => {
    (async () => {
      try {
        const r = await (window as any).storage.get(STORAGE_KEY);
        if (r && r.value) {
          const parsed = JSON.parse(r.value);
          // Ensure goals array exists
          if (!parsed.goals) parsed.goals = [];
          setData(parsed);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (window as any).storage.set(STORAGE_KEY, JSON.stringify(data)).catch(() => { });
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

  const save = (fn: (d: AppData) => void) => setData(p => {
    const n = JSON.parse(JSON.stringify(p));
    fn(n);
    return n;
  });

  const toast = useCallback((icon: string, msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t: any[]) => [...t, { id, icon, msg }]);
    setTimeout(() => setToasts((t: any[]) => t.filter(x => x.id !== id)), 3000);
  }, []);

  const switchTab = (i: number) => {
    setTab(i); setTabKey(k => k + 1);
  };

  const celebrate = () => { setConfetti(true); setTimeout(() => setConfetti(false), 1200); };

  /* ────────────────────────── TODAY TAB ────────────────────────── */
  const TodayTab = () => {
    const week = last7();
    const streak = (() => {
      let s = 0, d = new Date();
      for (let i = 0; i < 60; i++) {
        const k = d.toISOString().split("T")[0];
        if (data.habitLog[k] && Object.keys(data.habitLog[k]).length > 0) s++;
        else if (k !== today) break;
        d.setDate(d.getDate() - 1);
      }
      return s;
    })();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Card delay={0} style={{ background: "linear-gradient(145deg,#0f172a 0%,#1e293b 100%)", border: "none", position: "relative", overflow: "hidden" }}>
          <Confetti active={confetti} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>{fmtDate(today)}</p>
              <p style={{ color: "#fff", fontSize: 21, fontWeight: 800, letterSpacing: -0.5, marginBottom: 16 }}>Score du jour</p>
              <div style={{ display: "flex", gap: 22 }}>
                {[["Tâches", taskScore, "#3b82f6"], ["Habitudes", habitScore, "#10b981"]].map(([l, v, c]: any) => (
                  <div key={l}>
                    <div style={{ color: c, fontSize: 20, fontWeight: 800 }}><AnimNum value={v} />%</div>
                    <div style={{ color: "#475569", fontSize: 11, fontWeight: 500 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <Ring pct={overall} size={108} stroke={9} color="#3b82f6" bg="#1e293b">
              <span style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}><AnimNum value={overall} /></span>
              <span style={{ color: "#475569", fontSize: 10 }}>/ 100</span>
            </Ring>
          </div>
        </Card>

        <Card delay={60}>
          <Lbl>Humeur cette semaine</Lbl>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {week.map((d) => {
              const m = data.mood[d], mood = m ? MOODS.find(x => x.value === m) : null, isT = d === today;
              return (
                <div key={d} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: isT ? "#0f172a" : (mood ? mood.color + "15" : "#f8fafc"),
                    border: `1.5px solid ${isT ? "#0f172a" : (mood ? mood.color + "40" : "#e2e8f0")}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
                  }}>
                    {mood ? mood.emoji : "•"}
                  </div>
                  <span style={{ fontSize: 9, color: isT ? "#0f172a" : "#94a3b8", fontWeight: isT ? 800 : 500 }}>
                    {new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "narrow" })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card delay={90}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 13 }}>
            <Lbl style={{ marginBottom: 0 }}>Humeur</Lbl>
            {streak > 0 && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ background: "#fef3c7", borderRadius: 99, padding: "2px 10px", fontSize: 11, color: "#92400e", fontWeight: 700 }}>
                🔥 {streak} j. streak
              </motion.div>
            )}
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {MOODS.map((m) => (
              <button key={m.value} onClick={() => { save(d => { d.mood[today] = m.value; }); toast(m.emoji, "Humeur enregistrée"); }}
                className="scale-press" style={{
                  flex: 1, background: todayMood === m.value ? m.color + "22" : "#f7f9fc",
                  border: `2px solid ${todayMood === m.value ? m.color : "#e8ecf0"}`,
                  borderRadius: 15, padding: "10px 4px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  transition: "all 0.2s"
                }}>
                <span style={{ fontSize: 19 }}>{m.emoji}</span>
                <span style={{ fontSize: 9, color: todayMood === m.value ? m.color : "#b0b8c4", fontWeight: 600 }}>{m.label}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card delay={120}>
          <Lbl>Habitudes du jour</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {data.habits.map((h) => {
              const cur = hlToday[h.id] || 0, pct = Math.min(cur / h.goal * 100, 100);
              return (
                <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <MiniRing pct={pct} color={h.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{h.name}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{cur}/{h.goal}</span>
                    </div>
                    <div style={{ background: "#f0f2f5", borderRadius: 99, height: 5, overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={{ background: h.color, height: "100%", borderRadius: 99 }} />
                    </div>
                  </div>
                  <button onClick={() => save(d => {
                    const c = (d.habitLog[today] = d.habitLog[today] || {})[h.id] || 0;
                    d.habitLog[today][h.id] = c >= h.goal ? 0 : c + 1;
                    if (c + 1 === h.goal) { celebrate(); toast(h.icon, "Objectif atteint !"); }
                  })} className="scale-press" style={{
                    width: 33, height: 33, borderRadius: 10, background: pct === 100 ? h.color : "#f0f2f5",
                    border: "none", color: pct === 100 ? "#fff" : "#9ca3af", fontWeight: 800, cursor: "pointer"
                  }}>+</button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  /* ────────────────────────── FOCUS TAB ────────────────────────── */
  const FocusTab = () => {
    const elapsed = timerPreset * 60 - timerSec;
    const pct = elapsed / (timerPreset * 60) * 100;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13, textAlign: "center" }}>
        <Card delay={0}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 22 }}>
            {[15, 25, 45, 60].map(p => (
              <Pill key={p} active={timerPreset === p} onClick={() => { setTimerPreset(p); setTimerSec(p * 60); setTimerRun(false); }}>{p}min</Pill>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <Ring pct={pct} size={190} stroke={11} color={timerMode === "work" ? "#0f172a" : "#10b981"} bg="#f0f2f5">
              <span style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>{fmtTime(timerSec)}</span>
              <span style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{timerMode === "work" ? "🎯 Focus" : "☕ Pause"}</span>
            </Ring>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => setTimerRun(r => !r)} className="scale-press" style={{ background: timerMode === "work" ? "#0f172a" : "#10b981", border: "none", borderRadius: 15, padding: "13px 40px", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              {timerRun ? "⏸ Pause" : "▶ Démarrer"}
            </button>
            <button onClick={() => { setTimerRun(false); setTimerSec(timerPreset * 60); }} className="scale-press" style={{ background: "#f0f2f5", border: "1.5px solid #e0e4ea", borderRadius: 15, padding: "13px 18px", color: "#94a3b8", fontSize: 18, cursor: "pointer" }}>↺</button>
          </div>
        </Card>
        <Card delay={60}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a" }}><AnimNum value={sessions} /></div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#374151" }}>Sessions terminées</p>
              <p style={{ fontSize: 12, color: "#9ca3af" }}>Bravo pour votre persévérance !</p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  /* ────────────────────────── TASKS TAB ────────────────────────── */
  const TasksTab = () => {
    const [newT, setNewT] = useState("");
    const [prio, setPrio] = useState(1);

    const add = () => {
      if (!newT.trim()) return;
      save(d => d.tasks.unshift({ id: Date.now() + Math.random(), text: newT.trim(), done: false, priority: prio, tag: null, created: today }));
      setNewT("");
    };

    const remove = (id: number) => save(d => { d.tasks = d.tasks.filter(t => t.id !== id); });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Card delay={0}>
          <div style={{ display: "flex", gap: 9, marginBottom: 12 }}>
            <TextInput value={newT} onChange={(e: any) => setNewT(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && add()} placeholder="Une chose à faire..." />
            <button onClick={add} className="scale-press" style={{ background: "#0f172a", border: "none", borderRadius: 13, width: 44, height: 44, color: "#fff", fontSize: 24, cursor: "pointer" }}>+</button>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {PRIORITY.map((p, i) => (
              <Pill key={i} active={prio === i} color={p.color} onClick={() => setPrio(i)}>{p.label}</Pill>
            ))}
          </div>
        </Card>

        <AnimatePresence>
          {pending.map(t => (
            <Card key={t.id} className="scale-press" style={{ padding: "12px 15px", display: "flex", alignItems: "center", gap: 11 }}>
              <button onClick={() => { save(d => { const x = d.tasks.find(v => v.id === t.id); if (x) x.done = true; }); celebrate(); toast("✅", "Tâche finie !"); }}
                style={{ width: 22, height: 22, borderRadius: "50%", border: `2.5px solid ${PRIORITY[t.priority].color}`, background: "none", cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 14, flex: 1, fontWeight: 500, color: "#374151" }}>{t.text}</span>
              <button onClick={() => remove(t.id)} style={{ border: "none", background: "none", color: "#e2e8f0", fontSize: 18, cursor: "pointer" }}>×</button>
            </Card>
          ))}
        </AnimatePresence>

        {done.length > 0 && <Lbl style={{ marginTop: 10 }}>Terminées</Lbl>}
        {done.map(t => (
          <Card key={t.id} style={{ padding: "12px 15px", opacity: 0.5, display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</div>
            <span style={{ fontSize: 14, textDecoration: "line-through", flex: 1 }}>{t.text}</span>
            <button onClick={() => remove(t.id)} style={{ border: "none", background: "none", color: "#cbd5e1", fontSize: 18, cursor: "pointer" }}>×</button>
          </Card>
        ))}
      </div>
    );
  };

  /* ────────────────────────── HABITS TAB ────────────────────────── */
  const HabitsTab = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [nh, setNh] = useState<any>({ name: "", icon: "⭐", goal: 1, color: "#3b82f6", unit: "fois" });

    const [showGoal, setShowGoal] = useState(false);
    const [ng, setNg] = useState<any>({ title: "", target: "", deadline: "", color: "#3b82f6" });

    const week = last7();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowAdd(!showAdd)} style={{ flex: 1, background: "#0f172a", color: "#fff", padding: "12px", borderRadius: 15, fontWeight: 700, border: "none", cursor: "pointer" }}>+ Habitude</button>
          <button onClick={() => setShowGoal(!showGoal)} style={{ padding: "12px 20px", borderRadius: 15, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 700, cursor: "pointer" }}>+ Objectif</button>
        </div>

        {showAdd && (
          <Card>
            <Lbl>Nouvelle habitude</Lbl>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TextInput value={nh.name} onChange={(e: any) => setNh({ ...nh, name: e.target.value })} placeholder="Ex: Lire" />
              <div style={{ display: "flex", gap: 8 }}>
                <TextInput value={nh.goal} type="number" onChange={(e: any) => setNh({ ...nh, goal: parseInt(e.target.value) || 1 })} placeholder="Obj." style={{ flex: 1 }} />
                <TextInput value={nh.unit} onChange={(e: any) => setNh({ ...nh, unit: e.target.value })} placeholder="unité" style={{ flex: 1 }} />
                <input type="color" value={nh.color} onChange={e => setNh({ ...nh, color: e.target.value })} style={{ width: 44, borderRadius: 10 }} />
              </div>
              <button onClick={() => { save(d => d.habits.push({ ...nh, id: Date.now() + Math.random() })); setShowAdd(false); toast("✨", "Habitude ajoutée"); }}
                style={{ background: "#0f172a", color: "#fff", padding: 12, borderRadius: 12, border: "none", fontWeight: 700 }}>Créer</button>
            </div>
          </Card>
        )}

        {showGoal && (
          <Card>
            <Lbl>Nouvel Objectif Long Terme</Lbl>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TextInput value={ng.title} onChange={(e: any) => setNg({ ...ng, title: e.target.value })} placeholder="Titre de l'objectif" />
              <TextInput type="date" value={ng.deadline} onChange={(e: any) => setNg({ ...ng, deadline: e.target.value })} />
              <button onClick={() => { save(d => d.goals.push({ ...ng, id: Date.now() + Math.random() })); setShowGoal(false); toast("🎯", "Objectif créé"); }}
                style={{ background: "#3b82f6", color: "#fff", padding: 12, borderRadius: 12, border: "none", fontWeight: 700 }}>Ajouter</button>
            </div>
          </Card>
        )}

        {data.habits.map(h => {
          const cur = hlToday[h.id] || 0, pct = Math.min(cur / h.goal * 100, 100);
          return (
            <Card key={h.id}>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 12 }}>
                <MiniRing pct={pct} color={h.color} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: "#374151" }}>{h.name}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>{cur}/{h.goal} {h.unit}</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => save(d => { d.habits = d.habits.filter(x => x.id !== h.id); })} style={{ background: "none", border: "none", color: "#e2e8f0", fontSize: 18, cursor: "pointer" }}>×</button>
                  <button onClick={() => save(d => { const c = (d.habitLog[today] = d.habitLog[today] || {})[h.id] || 0; d.habitLog[today][h.id] = c + 1; })}
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", width: 32, height: 32, borderRadius: 8, cursor: "pointer" }}>+</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {week.map(d => {
                  const v = (data.habitLog[d] || {})[h.id] || 0, r = Math.min(v / h.goal, 1);
                  return (
                    <div key={d} style={{ flex: 1, height: 6, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${r * 100}%` }} style={{ height: "100%", background: h.color }} />
                    </div>
                  );
                })}
              </div>
            </Card>
          )
        })}

        {data.goals.length > 0 && <Lbl style={{ marginTop: 10 }}>Objectifs Long Terme</Lbl>}
        {data.goals.map(g => (
          <Card key={g.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: g.color }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>{g.title}</p>
              {g.deadline && <p style={{ fontSize: 11, color: "#94a3b8" }}>Échéance : {new Date(g.deadline).toLocaleDateString()}</p>}
            </div>
            <button onClick={() => save(d => { d.goals = d.goals.filter(x => x.id !== g.id); })} style={{ border: "none", background: "none", color: "#e2e8f0", fontSize: 18, cursor: "pointer" }}>×</button>
          </Card>
        ))}
      </div>
    );
  };

  /* ────────────────────────── JOURNAL TAB ────────────────────────── */
  const JournalTab = () => {
    const [note, setNote] = useState(data.notes[today] || "");
    const [grat, setGrat] = useState(data.notes[today + "_g"] || "");
    const [intent, setIntent] = useState(data.notes[today + "_i"] || "");
    const [view, setView] = useState("write");

    const onSave = () => {
      save(d => { d.notes[today] = note; d.notes[today + "_g"] = grat; d.notes[today + "_i"] = intent; });
      toast("📖", "Journal sauvegardé !");
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 5 }}>
          <Pill active={view === "write"} onClick={() => setView("write")}>✎ Écrire</Pill>
          <Pill active={view === "history"} onClick={() => setView("history")}>History</Pill>
        </div>

        {view === "write" ? (
          <>
            <Card><Lbl>🙏 Gratitude</Lbl><textarea value={grat} onChange={e => setGrat(e.target.value)} placeholder="3 choses positives..." style={{ width: "100%", minHeight: 70, border: "none", background: "#f8fafc", padding: 12, borderRadius: 12, outline: "none", fontFamily: "inherit", color: "#475569" }} /></Card>
            <Card><Lbl>🎯 Mon Intention</Lbl><TextInput value={intent} onChange={(e: any) => setIntent(e.target.value)} placeholder="Aujourd'hui, je vais..." /></Card>
            <Card><Lbl>✍ Journal Libre</Lbl><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Pensées, réflexions..." style={{ width: "100%", minHeight: 180, border: "none", background: "#f8fafc", padding: 12, borderRadius: 12, outline: "none", fontFamily: "inherit", color: "#475569", lineHeight: 1.6 }} /></Card>
            <button onClick={onSave} className="scale-press" style={{ background: "#0f172a", color: "#fff", padding: 15, borderRadius: 18, border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>💾 Sauvegarder</button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(data.notes).filter(([k, v]) => !k.includes("_") && v && k !== today).sort((a, b) => b[0].localeCompare(a[0])).map(([date, n]) => (
              <Card key={date}>
                <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 5 }}>{fmtDate(date)}</p>
                <p style={{ fontSize: 14, color: "#475569", fontStyle: "italic" }}>{n.substring(0, 100)}...</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const CONTENT = [<TodayTab />, <FocusTab />, <TasksTab />, <HabitsTab />, <JournalTab />];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", justifyContent: "center", fontFamily: "'Sora', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 430, paddingBottom: 110 }}>

        {/* Header */}
        <div style={{ padding: "50px 20px 15px", position: "sticky", top: 0, background: "rgba(240,242,245,0.85)", backdropFilter: "blur(12px)", zIndex: 10, borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.8 }}>Life<span style={{ color: "#3b82f6" }}>Tracker</span></h1>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{fmtDate(today).toUpperCase()}</p>
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: "#fff", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {todayMood ? MOODS.find(m => m.value === todayMood)?.emoji : "✨"}
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div key={tabKey} style={{ padding: "16px 20px" }}>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            {CONTENT[tab]}
          </motion.div>
        </div>

        {/* Tab Bar */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderTop: "1px solid #f1f5f9", display: "flex", padding: "12px 12px 30px", gap: 5 }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => switchTab(i)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <motion.div animate={{ background: tab === i ? "#0f172a" : "transparent", color: tab === i ? "#fff" : "#94a3b8", scale: tab === i ? 1.05 : 1 }}
                style={{ width: "100%", padding: "6px 0", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>
                {t.icon}
              </motion.div>
              <span style={{ fontSize: 9, fontWeight: 800, color: tab === i ? "#0f172a" : "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <ToastContext toasts={toasts} />
    </div>
  );
}
