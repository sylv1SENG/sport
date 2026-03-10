import { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

// ============================================================
// DATA
// ============================================================
const ROUNDS = [
  { artist: "T.I.", title: "Whatever You Like", duration: 180, bpm: 120, round: "WARM UP", genre: "Hip-Hop", file: "/music/Whatever You Like.mp3" },
  { artist: "Ludacris ft. Mystikal", title: "Move Bitch", duration: 180, bpm: 138, round: "JAB-CROSS", genre: "Southern Rap", file: "/music/Ludacris - Move B___H (Official Music Video) ft. Mystikal, I-20.mp3" },
  { artist: "Macklemore & Ryan Lewis", title: "Can't Hold Us", duration: 180, bpm: 146, round: "COMBOS", genre: "Hip-Hop", file: "/music/MACKLEMORE & RYAN LEWIS - CANT HOLD US FEAT. RAY DALTON (OFFICIAL MUSIC VIDEO).mp3" },
  { artist: "Survivor", title: "Eye of the Tiger", duration: 180, bpm: 109, round: "POWER", genre: "Rock", file: "/music/Survivor - Eye Of The Tiger (Official HD Video).mp3" },
  { artist: "T-Pain", title: "Buy U a Drank", duration: 180, bpm: 126, round: "BODY SHOTS", genre: "R&B", file: "/music/T-Pain - Buy U A Drank (Shawty Snappin) (Official HD Video) ft. Yung Joc.mp3" },
  { artist: "T-Pain ft. Akon", title: "Bartender", duration: 180, bpm: 126, round: "DEFENSE", genre: "R&B", file: "/music/T-Pain - Bartender (Official HD Video) ft. Akon.mp3" },
  { artist: "Wiz Khalifa", title: "Roll Up", duration: 180, bpm: 120, round: "SPEED", genre: "Hip-Hop", file: "/music/Wiz Khalifa - Roll Up [Official Music Video].mp3" },
  { artist: "B.o.B ft. Bruno Mars", title: "Nothin' on You", duration: 180, bpm: 104, round: "FREESTYLE", genre: "Pop Rap", file: "/music/B.o.B - Nothin On You (feat. Bruno Mars) [Official Video].mp3" },
  { artist: "The Game ft. 50 Cent", title: "How We Do", duration: 180, bpm: 94, round: "COUNTER", genre: "West Coast", file: "/music/The Game - How We Do (Official Music Video).mp3" },
  { artist: "Kuroko No Basket", title: "Gyakushuu", duration: 180, bpm: 130, round: "BURNOUT", genre: "Anime OST", file: "/music/Kuroko No Basket Unreleased Music - Gyakushuu (extended).mp3" },
];

const REST_DURATION = 90;

const WORKOUTS = [
  {
    id: "boxing",
    title: "BOXE",
    subtitle: "Session Intensive",
    duration: "45min",
    rounds: 10,
    emoji: "🥊",
    color: "#1DB954",
    colorAlt: "#17a34a",
    description: "10 rounds de 3 min avec 1m30 de repos. Shadow boxing, combos, puissance, footwork.",
    tags: ["Cardio", "Force", "Endurance"],
  },
  {
    id: "coming_soon_1",
    title: "HIIT",
    subtitle: "Bientôt disponible",
    duration: "—",
    rounds: null,
    emoji: "🔥",
    color: "#555",
    colorAlt: "#444",
    description: "Intervalles haute intensité. Tabata, EMOM, AMRAP.",
    tags: ["Cardio", "Explosivité"],
    locked: true,
  },
  {
    id: "coming_soon_2",
    title: "CORDE",
    subtitle: "Bientôt disponible",
    duration: "—",
    rounds: null,
    emoji: "🪢",
    color: "#555",
    colorAlt: "#444",
    description: "Séances de corde à sauter structurées avec repos.",
    tags: ["Cardio", "Coordination"],
    locked: true,
  },
  {
    id: "coming_soon_3",
    title: "MUSCU",
    subtitle: "Bientôt disponible",
    duration: "—",
    rounds: null,
    emoji: "🏋️",
    color: "#555",
    colorAlt: "#444",
    description: "Timer pour séries et temps de repos musculation.",
    tags: ["Force", "Hypertrophie"],
    locked: true,
  },
];

// ============================================================
// UTILS
// ============================================================
const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const totalSessionTime = () =>
  ROUNDS.length * 180 + (ROUNDS.length - 1) * REST_DURATION;

const elapsedAtRound = (roundIndex) => {
  let t = 0;
  for (let i = 0; i < roundIndex; i++) t += ROUNDS[i].duration + REST_DURATION;
  return t;
};

// ============================================================
// AUDIO HOOKS
// ============================================================
const useAudio = () => {
  const ctxRef = useRef(null);
  const musicRef = useRef(null);
  const getCtx = () => {
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return ctxRef.current;
  };

  const playBell = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 830;
      osc.type = "triangle";
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  }, []);

  const playTick = useCallback(() => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      osc.type = "square";
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  }, []);

  const playStart = useCallback(() => {
    try {
      const ctx = getCtx();
      [0, 0.15, 0.3].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660 + delay * 400;
        osc.type = "triangle";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.4);
      });
    } catch (e) {}
  }, []);

  const playGoBell = useCallback(() => {
    try {
      const ctx = getCtx();
      [0, 0.25].forEach((delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 940;
        osc.type = "triangle";
        gain.gain.setValueAtTime(0.6, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 1.0);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 1.0);
      });
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 520;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.35, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (e) {}
  }, []);

  const playMusic = useCallback((file) => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
    if (!file) return;
    const audio = new Audio(file);
    audio.volume = 0.7;
    audio.loop = true;
    audio.play().catch(() => {});
    musicRef.current = audio;
  }, []);

  const pauseMusic = useCallback(() => {
    if (musicRef.current) musicRef.current.pause();
  }, []);

  const resumeMusic = useCallback(() => {
    if (musicRef.current) musicRef.current.play().catch(() => {});
  }, []);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }
  }, []);

  return { playBell, playTick, playStart, playGoBell, playMusic, pauseMusic, resumeMusic, stopMusic };
};

// ============================================================
// SMALL COMPONENTS
// ============================================================
const Equalizer = ({ active, color = "#1DB954" }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20 }}>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          width: 3,
          borderRadius: 1.5,
          backgroundColor: color,
          height: active ? undefined : 4,
          animation: active ? `eq ${0.4 + i * 0.1}s ease-in-out infinite alternate` : "none",
          animationDelay: `${i * 0.08}s`,
        }}
      />
    ))}
  </div>
);

const ProgressRing = ({ progress, size = 220, stroke = 5, color, children }) => {
  const r = (size - stroke) / 2;
  const c = r * 2 * Math.PI;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c - progress * c} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

// ============================================================
// HOME PAGE
// ============================================================
const HomePage = ({ onSelectWorkout, onGoTracking }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #0d0d0d 0%, #111 40%, #0a0f0d 100%)",
      color: "#fff",
      padding: "0 0 40px",
      fontFamily: "'Outfit', sans-serif",
    }}>
      {/* Hero header */}
      <div style={{
        padding: "48px 28px 36px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative bg glow */}
        <div style={{
          position: "absolute", top: -80, right: -60, width: 260, height: 260,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(29,185,84,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: "3px", color: "rgba(255,255,255,0.3)",
          marginBottom: 12, fontFamily: "'Space Mono', monospace",
        }}>
          TRAINING STUDIO
        </div>
        <h1 style={{
          fontSize: 42, fontWeight: 900, lineHeight: 1.05, margin: 0,
          letterSpacing: "-1.5px",
          background: "linear-gradient(135deg, #fff 60%, rgba(255,255,255,0.5))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Tes séances.<br />Ton rythme.
        </h1>
        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.4)", marginTop: 14,
          lineHeight: 1.5, maxWidth: 320, fontWeight: 400,
        }}>
          Choisis ton entraînement et lance le timer. Suis ta progression et celle de ton crew.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "flex", gap: 1, margin: "0 28px 32px",
        background: "rgba(255,255,255,0.04)", borderRadius: 14, overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {[
          { label: "Programmes", value: "1", sub: "actif" },
          { label: "Durée totale", value: "1h", sub: "session" },
          { label: "Repos", value: "1:30", sub: "/ round" },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: "16px 12px", textAlign: "center",
            borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Mono', monospace", letterSpacing: "-1px" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2, fontWeight: 500, letterSpacing: "0.5px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Section title */}
      <div style={{ padding: "0 28px", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "0.2px" }}>
          Entraînements
        </h2>
      </div>

      {/* Workout cards */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {WORKOUTS.map((w, i) => (
          <button
            key={w.id}
            onClick={() => !w.locked && onSelectWorkout(w.id)}
            onMouseEnter={() => setHovered(w.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex", alignItems: "center", gap: 16,
              width: "100%", padding: "18px 20px",
              borderRadius: 16, border: "1px solid",
              borderColor: hovered === w.id && !w.locked
                ? `${w.color}44` : "rgba(255,255,255,0.06)",
              background: hovered === w.id && !w.locked
                ? `linear-gradient(135deg, ${w.color}0d, transparent)`
                : "rgba(255,255,255,0.02)",
              cursor: w.locked ? "default" : "pointer",
              textAlign: "left", color: "#fff",
              transition: "all 0.3s ease",
              opacity: w.locked ? 0.45 : 1,
              animation: `fadeUp 0.5s ease-out ${i * 0.08}s both`,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: w.locked
                ? "rgba(255,255,255,0.04)"
                : `linear-gradient(135deg, ${w.color}22, ${w.color}0a)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26,
              border: `1px solid ${w.locked ? "rgba(255,255,255,0.06)" : w.color + "22"}`,
            }}>
              {w.locked ? "🔒" : w.emoji}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.5px" }}>
                  {w.title}
                </span>
                {!w.locked && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 8px",
                    borderRadius: 6, background: `${w.color}20`, color: w.color,
                    letterSpacing: "0.5px",
                  }}>
                    {w.duration}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {w.description}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                {w.tags.map((t) => (
                  <span key={t} style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 4,
                    background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)",
                    fontWeight: 500,
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {!w.locked && (
              <div style={{
                fontSize: 18, color: "rgba(255,255,255,0.2)",
                transition: "transform 0.2s, color 0.2s",
                transform: hovered === w.id ? "translateX(4px)" : "none",
              }}>
                ›
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Tracking section */}
      <div style={{ padding: "0 28px", marginTop: 36, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "0.2px" }}>
          Suivi & Progression
        </h2>
      </div>
      <div style={{ padding: "0 20px" }}>
        <button
          onClick={onGoTracking}
          onMouseEnter={() => setHovered("tracking")}
          onMouseLeave={() => setHovered(null)}
          style={{
            display: "flex", alignItems: "center", gap: 16,
            width: "100%", padding: "20px",
            borderRadius: 16, border: "1px solid",
            borderColor: hovered === "tracking" ? "rgba(99,179,237,0.3)" : "rgba(255,255,255,0.06)",
            background: hovered === "tracking"
              ? "linear-gradient(135deg, rgba(99,179,237,0.08), transparent)"
              : "rgba(255,255,255,0.02)",
            cursor: "pointer", textAlign: "left", color: "#fff",
            transition: "all 0.3s ease",
            animation: "fadeUp 0.5s ease-out 0.4s both",
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, rgba(99,179,237,0.2), rgba(99,179,237,0.05))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, border: "1px solid rgba(99,179,237,0.2)",
          }}>
            📊
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.5px" }}>SUIVI</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: "2px 8px",
                borderRadius: 6, background: "rgba(99,179,237,0.15)", color: "#63B3ED",
                letterSpacing: "0.5px",
              }}>
                Multi-joueurs
              </span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
              Log tes séances, ajoute des membres, suis les records de chacun.
            </div>
          </div>
          <div style={{
            fontSize: 18, color: "rgba(255,255,255,0.2)",
            transition: "transform 0.2s",
            transform: hovered === "tracking" ? "translateX(4px)" : "none",
          }}>
            ›
          </div>
        </button>
      </div>
    </div>
  );
};

// ============================================================
// CHART SECTION
// ============================================================
const ChartSection = ({ sessions, records, members, selectedMember, getMember }) => {
  // --- Sessions per week chart ---
  const getSessionsPerWeek = () => {
    if (sessions.length === 0) return [];
    const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const weekMap = {};

    sorted.forEach((s) => {
      const d = new Date(s.date);
      // Get Monday of that week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d);
      monday.setDate(diff);
      const key = monday.toISOString().slice(0, 10);
      if (!weekMap[key]) weekMap[key] = { week: key, total: 0 };
      weekMap[key].total += 1;

      // Per-member tracking
      const member = getMember(s.memberId);
      if (member) {
        if (!weekMap[key][member.name]) weekMap[key][member.name] = 0;
        weekMap[key][member.name] += 1;
      }
    });

    return Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week));
  };

  // --- Sessions per type (breakdown) ---
  const getSessionsByType = () => {
    const typeCount = {};
    sessions.forEach((s) => {
      const t = SESSION_TYPES.find((st) => st.id === s.type) || SESSION_TYPES[5];
      if (!typeCount[t.label]) typeCount[t.label] = { name: t.label, count: 0, color: t.color, emoji: t.emoji };
      typeCount[t.label].count += 1;
    });
    return Object.values(typeCount).sort((a, b) => b.count - a.count);
  };

  // --- Cumulative sessions over time ---
  const getCumulativeSessions = () => {
    if (sessions.length === 0) return [];
    const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
    const result = [];
    let cumul = 0;

    // Group by day
    const dayMap = {};
    sorted.forEach((s) => {
      const dayKey = new Date(s.date).toISOString().slice(0, 10);
      if (!dayMap[dayKey]) dayMap[dayKey] = 0;
      dayMap[dayKey] += 1;
    });

    Object.keys(dayMap).sort().forEach((day) => {
      cumul += dayMap[day];
      result.push({
        date: day,
        label: new Date(day).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        total: cumul,
      });
    });
    return result;
  };

  // --- Records progression per category ---
  const getRecordsProgression = () => {
    if (records.length === 0) return {};
    const categories = {};
    const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach((r) => {
      const key = r.category;
      if (!categories[key]) categories[key] = { entries: [], unit: r.unit };
      const member = getMember(r.memberId);
      categories[key].entries.push({
        date: r.date,
        label: new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        value: parseFloat(r.value) || 0,
        rawValue: r.value,
        memberName: member?.name || "?",
        memberColor: member?.color || "#fff",
      });
    });
    return categories;
  };

  const weeklyData = getSessionsPerWeek();
  const cumulData = getCumulativeSessions();
  const typeData = getSessionsByType();
  const recordsData = getRecordsProgression();
  const memberNames = selectedMember === "all"
    ? members.map((m) => m.name)
    : [getMember(selectedMember)?.name].filter(Boolean);
  const memberColors = {};
  members.forEach((m) => { memberColors[m.name] = m.color; });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "rgba(20,20,25,0.95)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "10px 14px", fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color || "#fff", display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
            {p.name}: <span style={{ fontFamily: "'Space Mono', monospace" }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const chartCard = (title, subtitle, children) => (
    <div style={{
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14, padding: "18px 16px", marginBottom: 14,
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );

  const noData = (msg) => (
    <div style={{ textAlign: "center", padding: "30px 20px", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
      {msg}
    </div>
  );

  return (
    <div>
      {/* Cumulative sessions area chart */}
      {chartCard("Progression cumulée", "Nombre total de séances dans le temps",
        cumulData.length < 2
          ? noData("Enregistre au moins 2 séances pour voir la courbe")
          : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={cumulData}>
                <defs>
                  <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1DB954" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#1DB954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Séances" stroke="#1DB954" strokeWidth={2.5} fill="url(#gradGreen)" dot={{ r: 4, fill: "#1DB954", stroke: "#0a0a0a", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )
      )}

      {/* Sessions per week bar chart with per-member breakdown */}
      {chartCard("Séances par semaine", selectedMember === "all" ? "Répartition par membre" : undefined,
        weeklyData.length === 0
          ? noData("Pas encore de données hebdomadaires")
          : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                  }}
                />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                {selectedMember === "all" ? (
                  memberNames.map((name) => (
                    <Bar key={name} dataKey={name} name={name} stackId="a" fill={memberColors[name] || "#888"} radius={[2, 2, 0, 0]} />
                  ))
                ) : (
                  <Bar dataKey="total" name="Séances" fill={getMember(selectedMember)?.color || "#1DB954"} radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          )
      )}

      {/* Session type breakdown */}
      {chartCard("Répartition par type", `${sessions.length} séance${sessions.length > 1 ? "s" : ""} au total`,
        typeData.length === 0
          ? noData("Aucune séance")
          : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {typeData.map((t) => {
                const pct = sessions.length > 0 ? (t.count / sessions.length) * 100 : 0;
                return (
                  <div key={t.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{t.emoji} {t.name}</span>
                      <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.5)" }}>
                        {t.count} <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>({Math.round(pct)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, borderRadius: 3,
                        background: t.color, transition: "width 0.5s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )
      )}

      {/* Records progression charts - one per category */}
      {Object.keys(recordsData).length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px", marginBottom: 12 }}>
            ÉVOLUTION DES RECORDS
          </div>
          {Object.entries(recordsData).map(([category, { entries, unit }]) => {
            const hasNumeric = entries.some((e) => e.value > 0);
            return chartCard(
              `🏆 ${category}`,
              unit ? `en ${unit}` : undefined,
              !hasNumeric || entries.length < 1
                ? noData("Valeurs non numériques")
                : entries.length === 1
                ? (
                  <div style={{ textAlign: "center", padding: "10px 0" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Mono', monospace", color: "#FFB74D" }}>
                      {entries[0].rawValue}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                      {entries[0].memberName} • {entries[0].label}
                    </div>
                  </div>
                )
                : (
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={entries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                      <Tooltip content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{
                            background: "rgba(20,20,25,0.95)", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 10, padding: "10px 14px", fontFamily: "'Outfit', sans-serif",
                          }}>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{d.label}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#FFB74D", fontFamily: "'Space Mono', monospace" }}>
                              {d.rawValue} {unit}
                            </div>
                            <div style={{ fontSize: 11, color: d.memberColor, marginTop: 2 }}>{d.memberName}</div>
                          </div>
                        );
                      }} />
                      <Line
                        type="monotone" dataKey="value" name={category}
                        stroke="#FFB74D" strokeWidth={2.5}
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          return (
                            <circle
                              key={`${cx}-${cy}`}
                              cx={cx} cy={cy} r={5}
                              fill={payload.memberColor || "#FFB74D"}
                              stroke="#0a0a0a" strokeWidth={2}
                            />
                          );
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )
            );
          })}
        </div>
      )}

      {sessions.length === 0 && Object.keys(recordsData).length === 0 && (
        <div style={{
          textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.2)",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Pas encore de données</div>
          <div style={{ fontSize: 12, marginTop: 4, color: "rgba(255,255,255,0.15)" }}>
            Enregistre des séances et des records pour voir tes courbes de progression
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// TRACKING PAGE
// ============================================================
const SESSION_TYPES = [
  { id: "boxing", label: "Boxe", emoji: "🥊", color: "#1DB954" },
  { id: "running", label: "Course", emoji: "🏃", color: "#FF6B6B" },
  { id: "hiit", label: "HIIT", emoji: "🔥", color: "#FF9F43" },
  { id: "strength", label: "Muscu", emoji: "🏋️", color: "#A78BFA" },
  { id: "jump_rope", label: "Corde", emoji: "🪢", color: "#38BDF8" },
  { id: "other", label: "Autre", emoji: "⚡", color: "#94A3B8" },
];

const AVATAR_COLORS = ["#1DB954", "#FF6B6B", "#A78BFA", "#FF9F43", "#38BDF8", "#F472B6", "#34D399", "#FBBF24"];

const generateId = () => Math.random().toString(36).substring(2, 10);

const formatDate = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000 && d.getDate() === now.getDate()) return "Aujourd'hui";
  if (diff < 172800000) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const TrackingPage = ({ onBack }) => {
  const [data, setData] = useState({ members: [], sessions: [], records: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("charts");
  const [selectedMember, setSelectedMember] = useState("all");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newSession, setNewSession] = useState({ memberId: "", type: "boxing", notes: "" });
  const [newRecord, setNewRecord] = useState({ memberId: "", category: "", value: "", unit: "" });

  // Load data from persistent storage
  useEffect(() => {
    const load = async () => {
      try {
        const result = await window.storage.get("tracking-data");
        if (result && result.value) {
          setData(JSON.parse(result.value));
        } else {
          // Initialize with default "Moi" member
          const initial = {
            members: [{ id: "me", name: "Moi", color: AVATAR_COLORS[0], createdAt: new Date().toISOString() }],
            sessions: [],
            records: [],
          };
          setData(initial);
          await window.storage.set("tracking-data", JSON.stringify(initial));
        }
      } catch (e) {
        const initial = {
          members: [{ id: "me", name: "Moi", color: AVATAR_COLORS[0], createdAt: new Date().toISOString() }],
          sessions: [],
          records: [],
        };
        setData(initial);
      }
      setLoading(false);
    };
    load();
  }, []);

  const saveData = async (newData) => {
    setData(newData);
    try { await window.storage.set("tracking-data", JSON.stringify(newData)); } catch (e) {}
  };

  const addMember = async () => {
    if (!newMemberName.trim()) return;
    const member = {
      id: generateId(),
      name: newMemberName.trim(),
      color: AVATAR_COLORS[data.members.length % AVATAR_COLORS.length],
      createdAt: new Date().toISOString(),
    };
    const nd = { ...data, members: [...data.members, member] };
    await saveData(nd);
    setNewMemberName("");
    setShowAddMember(false);
  };

  const removeMember = async (id) => {
    if (id === "me") return;
    const nd = {
      members: data.members.filter((m) => m.id !== id),
      sessions: data.sessions.filter((s) => s.memberId !== id),
      records: data.records.filter((r) => r.memberId !== id),
    };
    await saveData(nd);
    if (selectedMember === id) setSelectedMember("all");
  };

  const addSession = async () => {
    if (!newSession.memberId) return;
    const session = {
      id: generateId(),
      memberId: newSession.memberId,
      type: newSession.type,
      notes: newSession.notes,
      date: new Date().toISOString(),
    };
    const nd = { ...data, sessions: [session, ...data.sessions] };
    await saveData(nd);
    setNewSession({ memberId: "", type: "boxing", notes: "" });
    setShowAddSession(false);
  };

  const removeSession = async (id) => {
    const nd = { ...data, sessions: data.sessions.filter((s) => s.id !== id) };
    await saveData(nd);
  };

  const addRecord = async () => {
    if (!newRecord.memberId || !newRecord.category || !newRecord.value) return;
    const record = {
      id: generateId(),
      memberId: newRecord.memberId,
      category: newRecord.category,
      value: newRecord.value,
      unit: newRecord.unit || "",
      date: new Date().toISOString(),
    };
    const nd = { ...data, records: [record, ...data.records] };
    await saveData(nd);
    setNewRecord({ memberId: "", category: "", value: "", unit: "" });
    setShowAddRecord(false);
  };

  const removeRecord = async (id) => {
    const nd = { ...data, records: data.records.filter((r) => r.id !== id) };
    await saveData(nd);
  };

  const getMember = (id) => data.members.find((m) => m.id === id);

  const filteredSessions = selectedMember === "all"
    ? data.sessions : data.sessions.filter((s) => s.memberId === selectedMember);
  const filteredRecords = selectedMember === "all"
    ? data.records : data.records.filter((r) => r.memberId === selectedMember);

  // Styles
  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 14, fontFamily: "'Outfit', sans-serif",
    outline: "none",
  };
  const btnPrimary = {
    padding: "12px 24px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 14,
    cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "opacity 0.2s",
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0d0d0d", color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif",
    }}>
      Chargement...
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(165deg, #0d0d0d 0%, #0f1118 40%, #0d0d0d 100%)",
      color: "#fff", fontFamily: "'Outfit', sans-serif", paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.06)", border: "none", color: "#fff",
          width: 34, height: 34, borderRadius: 10, cursor: "pointer", fontSize: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          ←
        </button>
        <span style={{ fontSize: 18 }}>📊</span>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.5px" }}>SUIVI & PROGRESSION</span>
      </div>

      {/* Members row */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px" }}>
            MEMBRES
          </span>
          <button onClick={() => setShowAddMember(true)} style={{
            background: "rgba(99,179,237,0.12)", border: "1px solid rgba(99,179,237,0.2)",
            color: "#63B3ED", fontSize: 12, fontWeight: 600, padding: "5px 12px",
            borderRadius: 8, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
          }}>
            + Ajouter
          </button>
        </div>

        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          <button onClick={() => setSelectedMember("all")} style={{
            padding: "8px 16px", borderRadius: 10, border: "1px solid",
            borderColor: selectedMember === "all" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)",
            background: selectedMember === "all" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)",
            color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            Tous
          </button>
          {data.members.map((m) => (
            <button key={m.id} onClick={() => setSelectedMember(m.id)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 14px", borderRadius: 10, border: "1px solid",
              borderColor: selectedMember === m.id ? `${m.color}55` : "rgba(255,255,255,0.08)",
              background: selectedMember === m.id ? `${m.color}15` : "rgba(255,255,255,0.03)",
              color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", background: m.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, color: "#000",
              }}>
                {m.name.charAt(0).toUpperCase()}
              </div>
              {m.name}
              {m.id !== "me" && selectedMember === m.id && (
                <span onClick={(e) => { e.stopPropagation(); removeMember(m.id); }}
                  style={{ marginLeft: 4, opacity: 0.5, fontSize: 11, cursor: "pointer" }}>✕</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Add member modal */}
      {showAddMember && (
        <div style={{
          margin: "12px 20px", padding: 16, borderRadius: 14,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Nouveau membre</div>
          <input
            value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Prénom (ex: Théo)" style={inputStyle}
            onKeyDown={(e) => e.key === "Enter" && addMember()}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={addMember} style={{ ...btnPrimary, background: "#63B3ED", color: "#000", flex: 1 }}>
              Ajouter
            </button>
            <button onClick={() => { setShowAddMember(false); setNewMemberName(""); }}
              style={{ ...btnPrimary, background: "rgba(255,255,255,0.08)", color: "#fff" }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div style={{
        display: "flex", gap: 1, margin: "20px 20px 0",
        background: "rgba(255,255,255,0.03)", borderRadius: 12, overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {[
          { label: "Séances", value: filteredSessions.length },
          { label: "Records", value: filteredRecords.length },
          { label: "Membres", value: data.members.length },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: "14px 10px", textAlign: "center",
            borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Mono', monospace" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2, letterSpacing: "0.5px" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, margin: "20px 20px 0", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        {[
          { id: "charts", label: "📈 Courbes" },
          { id: "sessions", label: "Séances" },
          { id: "records", label: "Records" },
        ].map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: "10px", border: "none", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            background: activeTab === t.id ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)",
            color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.35)",
            transition: "all 0.2s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* CHARTS TAB */}
      {activeTab === "charts" && (
        <div style={{ padding: "16px 20px 0" }}>
          <ChartSection
            sessions={filteredSessions}
            records={filteredRecords}
            members={data.members}
            selectedMember={selectedMember}
            getMember={getMember}
          />
        </div>
      )}

      {/* SESSIONS TAB */}
      {activeTab === "sessions" && (
        <div style={{ padding: "16px 20px 0" }}>
          <button onClick={() => {
            setShowAddSession(true);
            setNewSession({ memberId: data.members[0]?.id || "", type: "boxing", notes: "" });
          }} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "1px dashed rgba(29,185,84,0.3)",
            background: "rgba(29,185,84,0.06)", color: "#1DB954", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif", marginBottom: 12,
          }}>
            + Enregistrer une séance
          </button>

          {showAddSession && (
            <div style={{
              padding: 16, borderRadius: 14, marginBottom: 12,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Nouvelle séance</div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Qui ?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {data.members.map((m) => (
                  <button key={m.id} onClick={() => setNewSession({ ...newSession, memberId: m.id })} style={{
                    padding: "6px 14px", borderRadius: 8, border: "1px solid",
                    borderColor: newSession.memberId === m.id ? m.color : "rgba(255,255,255,0.1)",
                    background: newSession.memberId === m.id ? `${m.color}20` : "transparent",
                    color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                  }}>
                    {m.name}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Type</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {SESSION_TYPES.map((t) => (
                  <button key={t.id} onClick={() => setNewSession({ ...newSession, type: t.id })} style={{
                    padding: "6px 12px", borderRadius: 8, border: "1px solid",
                    borderColor: newSession.type === t.id ? t.color : "rgba(255,255,255,0.1)",
                    background: newSession.type === t.id ? `${t.color}20` : "transparent",
                    color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Notes (optionnel)</div>
              <input value={newSession.notes} onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                placeholder="Ex: bonne forme, cardio impec..." style={{ ...inputStyle, marginBottom: 12 }} />

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addSession} style={{ ...btnPrimary, background: "#1DB954", color: "#000", flex: 1 }}>
                  Enregistrer
                </button>
                <button onClick={() => setShowAddSession(false)}
                  style={{ ...btnPrimary, background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Sessions list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredSessions.length === 0 && (
              <div style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                Aucune séance enregistrée
              </div>
            )}
            {filteredSessions.map((s) => {
              const member = getMember(s.memberId);
              const sType = SESSION_TYPES.find((t) => t.id === s.type) || SESSION_TYPES[5];
              return (
                <div key={s.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderRadius: 12, background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)", animation: "fadeUp 0.3s ease-out",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `linear-gradient(135deg, ${sType.color}25, ${sType.color}0a)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {sType.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{sType.label}</span>
                      {member && (
                        <span style={{
                          fontSize: 10, padding: "1px 7px", borderRadius: 4,
                          background: `${member.color}20`, color: member.color, fontWeight: 600,
                        }}>
                          {member.name}
                        </span>
                      )}
                    </div>
                    {s.notes && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      {formatDate(s.date)}
                    </div>
                  </div>
                  <button onClick={() => removeSession(s.id)} style={{
                    background: "none", border: "none", color: "rgba(255,255,255,0.15)",
                    cursor: "pointer", fontSize: 14, padding: 4, flexShrink: 0,
                  }}>
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RECORDS TAB */}
      {activeTab === "records" && (
        <div style={{ padding: "16px 20px 0" }}>
          <button onClick={() => {
            setShowAddRecord(true);
            setNewRecord({ memberId: data.members[0]?.id || "", category: "", value: "", unit: "" });
          }} style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "1px dashed rgba(255,183,77,0.3)",
            background: "rgba(255,183,77,0.06)", color: "#FFB74D", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Outfit', sans-serif", marginBottom: 12,
          }}>
            + Ajouter un record
          </button>

          {showAddRecord && (
            <div style={{
              padding: 16, borderRadius: 14, marginBottom: 12,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Nouveau record</div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Qui ?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {data.members.map((m) => (
                  <button key={m.id} onClick={() => setNewRecord({ ...newRecord, memberId: m.id })} style={{
                    padding: "6px 14px", borderRadius: 8, border: "1px solid",
                    borderColor: newRecord.memberId === m.id ? m.color : "rgba(255,255,255,0.1)",
                    background: newRecord.memberId === m.id ? `${m.color}20` : "transparent",
                    color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                  }}>
                    {m.name}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Catégorie</div>
              <input value={newRecord.category} onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                placeholder="Ex: Course 5km, Développé couché, Planche..." style={{ ...inputStyle, marginBottom: 12 }} />

              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Valeur</div>
                  <input value={newRecord.value} onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                    placeholder="Ex: 22:30, 80, 2:00..." style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Unité</div>
                  <input value={newRecord.unit} onChange={(e) => setNewRecord({ ...newRecord, unit: e.target.value })}
                    placeholder="Ex: min, kg, min..." style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addRecord} style={{ ...btnPrimary, background: "#FFB74D", color: "#000", flex: 1 }}>
                  Enregistrer
                </button>
                <button onClick={() => setShowAddRecord(false)}
                  style={{ ...btnPrimary, background: "rgba(255,255,255,0.08)", color: "#fff" }}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Records list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredRecords.length === 0 && (
              <div style={{ textAlign: "center", padding: 30, color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
                Aucun record enregistré
              </div>
            )}
            {filteredRecords.map((r) => {
              const member = getMember(r.memberId);
              return (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderRadius: 12, background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)", animation: "fadeUp 0.3s ease-out",
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "linear-gradient(135deg, rgba(255,183,77,0.2), rgba(255,183,77,0.05))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                  }}>
                    🏆
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{r.category}</span>
                      {member && (
                        <span style={{
                          fontSize: 10, padding: "1px 7px", borderRadius: 4,
                          background: `${member.color}20`, color: member.color, fontWeight: 600,
                        }}>
                          {member.name}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 18, fontWeight: 800, fontFamily: "'Space Mono', monospace",
                      color: "#FFB74D", marginTop: 2,
                    }}>
                      {r.value} <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.35)" }}>{r.unit}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                      {formatDate(r.date)}
                    </div>
                  </div>
                  <button onClick={() => removeRecord(r.id)} style={{
                    background: "none", border: "none", color: "rgba(255,255,255,0.15)",
                    cursor: "pointer", fontSize: 14, padding: 4, flexShrink: 0,
                  }}>
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// BOXING TIMER PAGE
// ============================================================
const BoxingTimerPage = ({ onBack }) => {
  const [state, setState] = useState("idle");
  const [currentRound, setCurrentRound] = useState(0);
  const [isRest, setIsRest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUNDS[0].duration);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const intervalRef = useRef(null);
  const { playBell, playTick, playStart, playGoBell, playMusic, pauseMusic, resumeMusic, stopMusic } = useAudio();

  const currentDuration = isRest ? REST_DURATION : ROUNDS[currentRound].duration;
  const progress = 1 - timeLeft / currentDuration;
  const globalProgress = totalElapsed / totalSessionTime();
  const accentColor = isRest ? "#E53935" : "#1DB954";
  const round = ROUNDS[currentRound];
  const isCountdown = isRest && timeLeft <= 5 && timeLeft > 0;

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) return 0;
      if (prev <= 6 && prev > 1) playTick();
      return prev - 1;
    });
    setTotalElapsed((prev) => prev + 1);
  }, [playTick]);

  useEffect(() => {
    if (timeLeft === 0 && state === "running") {
      if (isRest) {
        playGoBell();
        if (currentRound < ROUNDS.length - 1) {
          const nextRound = currentRound + 1;
          setIsRest(false);
          setCurrentRound(nextRound);
          setTimeLeft(ROUNDS[nextRound].duration);
          playMusic(ROUNDS[nextRound].file);
        } else {
          setState("idle");
          clearInterval(intervalRef.current);
          stopMusic();
        }
      } else {
        playBell();
        pauseMusic();
        if (currentRound < ROUNDS.length - 1) {
          setIsRest(true);
          setTimeLeft(REST_DURATION);
        } else {
          setState("idle");
          clearInterval(intervalRef.current);
          stopMusic();
        }
      }
    }
  }, [timeLeft, state, isRest, currentRound, playBell, playGoBell, playMusic, pauseMusic, stopMusic]);

  useEffect(() => {
    if (state === "running") intervalRef.current = setInterval(tick, 1000);
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [state, tick]);

  const handleStart = () => {
    if (state === "idle") {
      setCurrentRound(0); setIsRest(false);
      setTimeLeft(ROUNDS[0].duration); setTotalElapsed(0);
      playMusic(ROUNDS[0].file);
    } else if (state === "paused") {
      resumeMusic();
    }
    playStart(); setState("running");
  };
  const handlePause = () => { setState("paused"); pauseMusic(); };
  const handleReset = () => {
    setState("idle"); setCurrentRound(0); setIsRest(false);
    setTimeLeft(ROUNDS[0].duration); setTotalElapsed(0);
    clearInterval(intervalRef.current);
    stopMusic();
  };
  const skipForward = () => {
    if (isRest) {
      if (currentRound < ROUNDS.length - 1) {
        const sk = timeLeft; setIsRest(false);
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        setTimeLeft(ROUNDS[nextRound].duration);
        setTotalElapsed((t) => t + sk);
        playMusic(ROUNDS[nextRound].file);
      }
    } else if (currentRound < ROUNDS.length - 1) {
      const sk = timeLeft; setIsRest(true);
      setTimeLeft(REST_DURATION); setTotalElapsed((t) => t + sk);
      pauseMusic();
    }
  };
  const skipBack = () => {
    if (isRest) {
      const el = currentDuration - timeLeft; setIsRest(false);
      setTimeLeft(ROUNDS[currentRound].duration);
      setTotalElapsed((t) => Math.max(0, t - el));
      playMusic(ROUNDS[currentRound].file);
    } else {
      setTimeLeft(ROUNDS[currentRound].duration);
      playMusic(ROUNDS[currentRound].file);
    }
  };
  const jumpToRound = (idx) => {
    setCurrentRound(idx); setIsRest(false);
    setTimeLeft(ROUNDS[idx].duration);
    setTotalElapsed(elapsedAtRound(idx));
    if (state === "idle") setState("paused");
    if (state === "running") playMusic(ROUNDS[idx].file);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: isCountdown
        ? "linear-gradient(180deg, #1a0808 0%, #120606 50%, #1a0808 100%)"
        : "linear-gradient(180deg, #121212 0%, #0a0a0a 50%, #121212 100%)",
      color: "#fff", fontFamily: "'Outfit', sans-serif",
      transition: "background 0.5s ease",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            color: "#fff", width: 34, height: 34, borderRadius: 10,
            cursor: "pointer", fontSize: 16, display: "flex",
            alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >
            ←
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🥊</span>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.5px" }}>BOXE — SESSION</span>
          </div>
        </div>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 12,
          color: "rgba(255,255,255,0.35)",
        }}>
          {formatTime(Math.max(0, totalSessionTime() - totalElapsed))}
        </div>
      </div>

      {/* Global bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div style={{
          height: "100%", width: `${globalProgress * 100}%`,
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
          transition: "width 1s linear", borderRadius: "0 2px 2px 0",
        }} />
      </div>

      {/* Main */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "28px 24px 16px", gap: 20,
      }}>
        {/* Badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "5px 14px", borderRadius: 20,
          background: isRest ? "rgba(229,57,53,0.15)" : "rgba(29,185,84,0.12)",
          border: `1px solid ${isRest ? "rgba(229,57,53,0.25)" : "rgba(29,185,84,0.2)"}`,
          animation: state === "running" && isRest ? "restPulse 2s ease-in-out infinite" : "none",
        }}>
          {state === "running" && <Equalizer active={!isRest} color={accentColor} />}
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "1.5px",
            color: accentColor, textTransform: "uppercase",
          }}>
            {state === "idle" ? "Prêt" : isRest ? (isCountdown ? "⚡ PRÉPARE-TOI" : "🔴 RÉCUPÉRATION") : `Round ${currentRound + 1}/${ROUNDS.length}`}
          </span>
        </div>

        {/* Timer ring */}
        <div style={{ animation: state === "running" && isRest ? "pulse 2s ease-in-out infinite" : "none" }}>
          <ProgressRing progress={progress} color={isCountdown ? "#FF1744" : accentColor}>
            {isCountdown ? (
              <>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 80, fontWeight: 900,
                  lineHeight: 1, color: "#FF1744",
                  animation: "countdownPop 1s ease-out infinite",
                  textShadow: "0 0 40px rgba(255,23,68,0.5)",
                }} key={timeLeft}>
                  {timeLeft}
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: "#FF1744", marginTop: 8,
                  letterSpacing: "3px", textTransform: "uppercase", opacity: 0.8,
                }}>
                  REPRISE
                </div>
              </>
            ) : (
              <>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 48, fontWeight: 700,
                  letterSpacing: "-2px", lineHeight: 1,
                  color: isRest ? "#E53935" : "#fff",
                }}>
                  {formatTime(timeLeft)}
                </div>
                <div style={{
                  fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6,
                  fontWeight: 500, letterSpacing: "0.5px",
                }}>
                  {isRest ? "REPOS" : round.round}
                </div>
              </>
            )}
          </ProgressRing>
        </div>

        {/* Track info */}
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease-out" }} key={`${currentRound}-${isRest}`}>
          {!isRest && (
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "2px", marginBottom: 6,
              color: accentColor, textTransform: "uppercase", opacity: 0.8,
            }}>
              {round.round}
            </div>
          )}
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 3, letterSpacing: "0.3px" }}>
            {isRest ? "⏸ Repos" : round.title}
          </div>
          {!isRest && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>
              {round.artist}
            </div>
          )}
          {!isRest && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
              {round.genre} • {round.bpm} BPM • 3:00
            </div>
          )}
          {!isRest && round.spotify && (
            <a
              href={round.spotify}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                marginTop: 10, padding: "7px 16px", borderRadius: 20,
                background: "#1DB954", color: "#000", fontSize: 12, fontWeight: 700,
                textDecoration: "none", fontFamily: "'Outfit', sans-serif",
                transition: "transform 0.15s, box-shadow 0.2s",
                boxShadow: "0 2px 12px rgba(29,185,84,0.3)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Écouter sur Spotify
            </a>
          )}
          {isRest && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              Prochain → {currentRound < ROUNDS.length - 1
                ? `${ROUNDS[currentRound + 1].artist} — ${ROUNDS[currentRound + 1].title}`
                : "FIN"}
            </div>
          )}
          {isRest && currentRound < ROUNDS.length - 1 && ROUNDS[currentRound + 1].spotify && (
            <a
              href={ROUNDS[currentRound + 1].spotify}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                marginTop: 10, padding: "6px 14px", borderRadius: 20,
                background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)",
                fontSize: 11, fontWeight: 600, textDecoration: "none",
                fontFamily: "'Outfit', sans-serif", border: "1px solid rgba(255,255,255,0.1)",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Préparer le prochain
            </a>
          )}
        </div>

        {/* Round bar */}
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progress * 100}%`,
              background: accentColor, borderRadius: 2, transition: "width 1s linear",
            }} />
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 5,
            fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)",
          }}>
            <span>{formatTime(currentDuration - timeLeft)}</span>
            <span>{formatTime(currentDuration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 2 }}>
          {[
            { icon: "⏮", action: skipBack, disabled: state === "idle" },
          ].map((b, i) => (
            <button key={i} onClick={b.action} disabled={b.disabled} style={{
              background: "none", border: "none", fontSize: 20, padding: 8, cursor: b.disabled ? "default" : "pointer",
              color: b.disabled ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.7)", transition: "color 0.2s",
            }}>
              {b.icon}
            </button>
          ))}

          <button onClick={state === "running" ? handlePause : handleStart} style={{
            width: 60, height: 60, borderRadius: "50%", background: accentColor,
            border: "none", color: "#000", fontSize: 24, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.15s, box-shadow 0.2s",
            boxShadow: `0 4px 24px ${accentColor}44`,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {state === "running" ? "⏸" : "▶"}
          </button>

          <button onClick={skipForward} disabled={state === "idle"} style={{
            background: "none", border: "none", fontSize: 20, padding: 8,
            cursor: state === "idle" ? "default" : "pointer",
            color: state === "idle" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.7)",
            transition: "color 0.2s",
          }}>
            ⏭
          </button>

          <button onClick={handleReset} disabled={state === "idle" && currentRound === 0} style={{
            background: "none", border: "none", fontSize: 16, padding: 8,
            cursor: state === "idle" && currentRound === 0 ? "default" : "pointer",
            color: state === "idle" && currentRound === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.45)",
          }}>
            ↺
          </button>
        </div>
      </div>

      {/* Queue */}
      <div style={{
        background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 0 20px", flexShrink: 0,
      }}>
        <div style={{
          padding: "0 24px 10px", fontSize: 12, fontWeight: 600,
          letterSpacing: "0.5px", color: "rgba(255,255,255,0.4)",
        }}>
          FILE D'ATTENTE — {ROUNDS.length} rounds
        </div>
        <div style={{ maxHeight: 200, overflowY: "auto", padding: "0 12px" }}>
          {ROUNDS.map((r, i) => {
            const isActive = i === currentRound && !isRest;
            const isPast = i < currentRound;
            return (
              <button key={i} onClick={() => jumpToRound(i)} style={{
                display: "flex", alignItems: "center", width: "100%",
                padding: "9px 12px", borderRadius: 8, border: "none",
                background: isActive ? "rgba(29,185,84,0.1)" : "transparent",
                cursor: "pointer", gap: 12, transition: "background 0.2s", textAlign: "left",
              }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 24, fontFamily: "'Space Mono', monospace", fontSize: 12,
                  color: isActive ? accentColor : "rgba(255,255,255,0.25)",
                  textAlign: "center", flexShrink: 0,
                }}>
                  {isActive ? <Equalizer active={state === "running"} color={accentColor} /> : <span>{i + 1}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? accentColor : isPast ? "rgba(255,255,255,0.3)" : "#fff",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>
                    {r.artist} • {r.round}
                  </div>
                </div>
                {r.spotify && (
                  <a href={r.spotify} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(29,185,84,0.12)", border: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(29,185,84,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(29,185,84,0.12)"}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#1DB954">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </a>
                )}
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 11,
                  color: "rgba(255,255,255,0.2)", flexShrink: 0,
                }}>
                  3:00
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        @keyframes eq { from { height: 4px; } to { height: 18px; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.05); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes restPulse { 0%, 100% { box-shadow: 0 0 30px rgba(229,57,53,0.15); } 50% { box-shadow: 0 0 60px rgba(229,57,53,0.35); } }
        @keyframes countdownPop { 0% { transform: scale(1.3); opacity: 1; } 50% { transform: scale(1); opacity: 0.9; } 100% { transform: scale(0.95); opacity: 0.7; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        input:focus { border-color: rgba(255,255,255,0.25) !important; }
      `}</style>

      {page === "home" && (
        <HomePage
          onSelectWorkout={(id) => { if (id === "boxing") setPage("boxing"); }}
          onGoTracking={() => setPage("tracking")}
        />
      )}
      {page === "boxing" && (
        <BoxingTimerPage onBack={() => setPage("home")} />
      )}
      {page === "tracking" && (
        <TrackingPage onBack={() => setPage("home")} />
      )}
    </div>
  );
}
