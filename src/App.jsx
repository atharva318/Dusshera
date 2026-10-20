import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

/* Ten heads = ten inner enemies. Edit freely. */
const HEADS = [
  { vice: "Anger", virtue: "Patience", color: "#ff9aa2", msg: "Count to ten, like the ten heads. Calm hearts win battles." },
  { vice: "Greed", virtue: "Generosity", color: "#ffd98e", msg: "Share your sweets. Joy multiplies when it is given away." },
  { vice: "Jealousy", virtue: "Gratitude", color: "#b8e6b0", msg: "Celebrate other people's wins. There is enough sunshine for everyone." },
  { vice: "Pride", virtue: "Modesty", color: "#c7b8ff", msg: "Real strength is quiet. Tall trees bow to the wind." },
  { vice: "Desire", virtue: "Self-control", color: "#ffb3d9", msg: "Wanting everything leaves you with nothing. Choose what matters." },
  { vice: "Attachment", virtue: "Letting go", color: "#a8def0", msg: "Hold life with open hands. Peace begins when you release." },
  { vice: "Hatred", virtue: "Love", color: "#ffc2a1", msg: "Hate is heavy to carry. Love is light and travels far." },
  { vice: "Selfishness", virtue: "Compassion", color: "#d9f0a3", msg: "Look up from your own plate. Someone near you needs a hand." },
  { vice: "Cruelty", virtue: "Kindness", color: "#f7b7ff", msg: "A soft word can melt a hard heart. Be gentle today." },
  { vice: "Ego", virtue: "Humility", color: "#ffe066", msg: "Even a king with ten heads fell. Humility keeps you standing." },
];
const FLY = 0.16, HIT = 0.4, BURST = 0.48, STEP = 0.05, FINAL = 0.95;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => clamp(t) * clamp(t) * (3 - 2 * clamp(t));

function useStageProgress(ref) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setP(clamp(-r.top / (r.height - window.innerHeight)));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
  return p;
}

function useFireworks() {
  const canvasRef = useRef(null);
  const parts = useRef([]);
  useEffect(() => {
    const c = canvasRef.current, ctx = c.getContext("2d");
    let raf, w, h;
    const resize = () => {
      const d = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * d; c.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const loop = () => {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,.16)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      parts.current = parts.current.filter((q) => q.life > 0);
      for (const q of parts.current) {
        q.vx *= 0.985; q.vy = q.vy * 0.985 + 0.06;
        q.x += q.vx; q.y += q.vy; q.life--;
        ctx.globalAlpha = Math.max(0, q.life / q.max);
        ctx.fillStyle = q.c;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  const burst = useCallback((x, y, colors, n = 70) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = 1.5 + Math.random() * 5.5;
      parts.current.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 60 + Math.random() * 35, max: 95, r: 1.5 + Math.random() * 2.2, c: colors[i % colors.length] });
    }
  }, []);
  return { canvasRef, burst };
}

function Face({ color, mood }) {
  const ink = "#3b2340";
  return (
    <svg viewBox="0 0 100 100" className="face" aria-hidden="true">
      <path d="M22 30 L30 6 L40 24 L50 2 L60 24 L70 6 L78 30 Z" fill="#ffd166" stroke="#e09f3e" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="50" cy="58" r="38" fill={color} stroke="#5b3a5e" strokeWidth="3" />
      <circle cx="25" cy="68" r="7" fill="#ff7b9c" opacity=".55" />
      <circle cx="75" cy="68" r="7" fill="#ff7b9c" opacity=".55" />
      {mood === "angry" && (<>
        <path d="M24 40 L43 48 M76 40 L57 48" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        <circle cx="36" cy="57" r="7" fill="#fff" /><circle cx="64" cy="57" r="7" fill="#fff" />
        <circle cx="38" cy="58" r="3.6" fill={ink} /><circle cx="62" cy="58" r="3.6" fill={ink} />
        <path d="M37 80 Q50 70 63 80" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        <path d="M42 76 l3 7 l3 -8z M52 75 l3 8 l3 -7z" fill="#fff" stroke={ink} strokeWidth="1.5" />
      </>)}
      {mood === "dizzy" && (<>
        <path d="M30 51 l11 11 M41 51 l-11 11 M59 51 l11 11 M70 51 l-11 11" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M36 79 q4 -6 8 0 t8 0 t8 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      </>)}
      {mood === "happy" && (<>
        <path d="M29 58 Q36 48 43 58 M57 58 Q64 48 71 58" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
        <path d="M35 70 Q50 92 65 70 Z" fill="#c0475a" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      </>)}
    </svg>
  );
}

function Ravana() {
  return (
    <svg viewBox="0 0 200 130" className="body" aria-hidden="true">
      <ellipse cx="34" cy="62" rx="15" ry="32" fill="#7b5ea7" stroke="#5b3a5e" strokeWidth="3" transform="rotate(25 34 62)" />
      <ellipse cx="166" cy="62" rx="15" ry="32" fill="#7b5ea7" stroke="#5b3a5e" strokeWidth="3" transform="rotate(-25 166 62)" />
      <rect x="45" y="5" width="110" height="122" rx="48" fill="#8a6bb8" stroke="#5b3a5e" strokeWidth="3" />
      <ellipse cx="100" cy="86" rx="36" ry="34" fill="#a98bd4" />
      <path d="M55 22 Q100 64 145 22" fill="none" stroke="#ffd166" strokeWidth="7" strokeLinecap="round" strokeDasharray="1 11" />
      <circle cx="100" cy="53" r="8" fill="#ff7b9c" stroke="#e09f3e" strokeWidth="3" />
    </svg>
  );
}

function Rama({ released }) {
  return (
    <svg viewBox="0 0 130 170" className="rama" aria-hidden="true">
      <rect x="40" y="110" width="22" height="50" rx="10" fill="#ff9f43" stroke="#7a3b1d" strokeWidth="3" />
      <rect x="64" y="110" width="22" height="50" rx="10" fill="#ff9f43" stroke="#7a3b1d" strokeWidth="3" />
      <rect x="34" y="62" width="58" height="60" rx="22" fill="#6ec1e4" stroke="#2a5f7a" strokeWidth="3" />
      <path d="M38 98 H88 V122 H38Z" fill="#ffb347" />
      <path d="M72 80 L108 70" stroke="#6ec1e4" strokeWidth="11" strokeLinecap="round" />
      <path d="M108 20 Q142 70 108 124" fill="none" stroke="#8b5a2b" strokeWidth="5" strokeLinecap="round" />
      <path d={released ? "M108 20 L108 124" : "M108 20 L88 70 L108 124"} fill="none" stroke="#fff" strokeWidth="2" />
      <circle cx="62" cy="38" r="26" fill="#6ec1e4" stroke="#2a5f7a" strokeWidth="3" />
      <path d="M38 22 L44 2 L54 16 L62 -2 L70 16 L80 2 L86 22 Z" fill="#ffd166" stroke="#e09f3e" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="53" cy="40" r="3.4" fill="#3b2340" /><circle cx="73" cy="40" r="3.4" fill="#3b2340" />
      <circle cx="46" cy="49" r="5" fill="#ff7b9c" opacity=".5" /><circle cx="80" cy="49" r="5" fill="#ff7b9c" opacity=".5" />
      <path d="M54 50 Q63 58 72 50" fill="none" stroke="#3b2340" strokeWidth="3" strokeLinecap="round" />
      <circle cx="63" cy="29" r="2.6" fill="#e5383b" />
    </svg>
  );
}

export default function App() {
  const stageRef = useRef(null);
  const headRefs = useRef([]);
  const chestRef = useRef(null);
  const p = useStageProgress(stageRef);
  const { canvasRef, burst } = useFireworks();
  const [name, setName] = useState("");

  const hit = p >= HIT;
  const count = p >= BURST ? clamp(Math.floor((p - BURST) / STEP) + 1, 0, 10) : 0;
  const done = p >= FINAL;
  const dawn = smooth((p - HIT) / (FINAL - HIT));
  const t = clamp((p - FLY) / (HIT - FLY));
  const f = Math.pow(t, 1.4);
  const arc = -Math.sin(Math.PI * f) * 70;
  const rot = -Math.cos(Math.PI * f) * 12 * (1 - f * f * f);

  const stars = useMemo(() => Array.from({ length: 45 }, () => ({ x: Math.random() * 100, y: Math.random() * 55, d: Math.random() * 3, s: 2 + Math.random() * 3 })), []);
  const heads = useMemo(() => HEADS.map((h, i) => {
    const a = ((165 - i * (150 / 9)) * Math.PI) / 180;
    return { ...h, x: 50 + 44 * Math.cos(a), y: 53 - 40 * Math.sin(a) };
  }), []);

  const prev = useRef({ count: 0, hit: false });
  useEffect(() => {
    const pr = prev.current;
    if (hit && !pr.hit && chestRef.current) {
      const r = chestRef.current.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ["#ff7b00", "#ffd166", "#ffffff"], 90);
    }
    for (let i = pr.count; i < count; i++) {
      const el = headRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, [HEADS[i].color, "#ffd166", "#ffffff"], 75);
    }
    pr.count = count; pr.hit = hit;
  }, [count, hit, burst]);

  useEffect(() => {
    if (!done) return;
    const id = setInterval(() => {
      const c = HEADS[Math.floor(Math.random() * 10)].color;
      burst(window.innerWidth * (0.08 + Math.random() * 0.84), window.innerHeight * (0.08 + Math.random() * 0.45), [c, "#ffd166", "#fff"], 80);
    }, 650);
    return () => clearInterval(id);
  }, [done, burst]);

  let caption = { k: "a", title: "Ten heads, ten inner enemies", text: "Every head of Ravana is a weakness we all carry. Keep scrolling to meet Rama." };
  if (p >= FLY && p < HIT) caption = { k: "b", title: "Rama takes aim…", text: "Shoooosh! The arrow of truth is on its way." };
  else if (p >= HIT && p < BURST) caption = { k: "c", title: "Direct hit! 💥", text: "The ten heads are dizzy. Watch each one turn into a virtue." };
  else if (count > 0 && !done) { const h = HEADS[count - 1]; caption = { k: "h" + count, title: `${h.vice} → ${h.virtue}`, text: h.msg }; }
  else if (done) caption = { k: "z", title: "Good always wins. Happy Dussehra! 🪔", text: "Burn the Ravana within you, and light a little diya for everyone around you." };

  const share = async () => {
    const text = `Happy Dussehra${name ? ", " + name : ""}! 🏹🪔 May good always win over the ten heads within us.`;
    try {
      if (navigator.share) await navigator.share({ title: "Happy Dussehra", text, url: location.href });
      else { await navigator.clipboard.writeText(text + " " + location.href); alert("Wish copied! Paste it anywhere."); }
    } catch { /* cancelled */ }
  };

  return (
    <>
      <canvas ref={canvasRef} className="fx" />
      <header className="hero">
        <div className="diyas" aria-hidden="true">🪔 🪔 🪔</div>
        <h1>Happy<br />Dussehra!</h1>
        <p className="hindi">विजयादशमी की हार्दिक शुभकामनाएँ</p>
        <p className="sub">Scroll down and watch the ten heads of Ravana fall.</p>
        <div className="down" aria-hidden="true">↓</div>
      </header>

      <section ref={stageRef} className="stage-wrap">
        <div className="stage" style={{ "--dawn": dawn }}>
          <div className="sky" />
          <div className="sky dawn" />
          {stars.map((s, i) => <i key={i} className="star" style={{ left: s.x + "%", top: s.y + "%", width: s.s, height: s.s, animationDelay: s.d + "s", opacity: 1 - dawn }} />)}
          <div className="sun" />
          <div className="ground" />
          <div className="bar" style={{ width: p * 100 + "%" }} />

          <div className="field">
            <div className={"ravana" + (hit && count === 0 ? " shake" : "") + (done ? " glow" : "")}>
              <Ravana />
              <div ref={chestRef} className="chest" />
              {hit && <div className="impact" />}
              {heads.map((h, i) => {
                const burstDone = i < count;
                const mood = p < HIT ? "angry" : burstDone ? "happy" : "dizzy";
                return (
                  <div key={i} className="head" style={{ left: h.x + "%", top: h.y + "%" }}>
                    <div ref={(el) => (headRefs.current[i] = el)} className={"bob" + (burstDone ? " pop" : "")} style={{ animationDelay: i * 0.15 + "s" }}>
                      {burstDone && <span className="halo" />}
                      <Face color={h.color} mood={mood} />
                    </div>
                    <span className={"chip" + (burstDone ? " good" : "")}>{burstDone ? h.virtue : h.vice}</span>
                  </div>
                );
              })}
            </div>

            <div className="rama-wrap"><Rama released={p >= FLY} /></div>
            <div className={"arrow" + (t > 0 && t < 1 ? " flying" : "")} style={{ "--f": f, transform: `translateY(${arc}px) rotate(${rot}deg)`, opacity: done ? 0.25 : 1 }}>
              <svg viewBox="0 0 100 16" preserveAspectRatio="none"><path d="M0 2 L12 8 L0 14 M8 2 L20 8 L8 14" fill="#ff6b6b" /><line x1="12" y1="8" x2="86" y2="8" stroke="#8b5a2b" strokeWidth="3" strokeLinecap="round" /><path d="M84 1 L100 8 L84 15Z" fill="#ffb703" stroke="#e85d04" strokeWidth="1.5" /></svg>
            </div>
          </div>

          <div className="caption" key={caption.k}>
            <b>{caption.title}</b>
            <span>{caption.text}</span>
          </div>
        </div>
      </section>

      <section className="end">
        <h2>Ten heads. Ten lessons.</h2>
        <div className="cards">
          {HEADS.map((h) => (
            <article key={h.vice} style={{ "--c": h.color }}>
              <small>{h.vice} becomes</small>
              <strong>{h.virtue}</strong>
              <p>{h.msg}</p>
            </article>
          ))}
        </div>
        <div className="wish">
          <label htmlFor="n">Send a wish to someone</label>
          <input id="n" value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name" maxLength={30} />
          <p className="big">Happy Dussehra{name ? `, ${name}` : ""}! 🏹🪔</p>
          <div className="btns">
            <button onClick={share}>Share this wish</button>
            <button className="ghost" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Watch again</button>
          </div>
        </div>
        <footer>Made with love. Light a diya, share a sweet, forgive someone. 🪔</footer>
      </section>
    </>
  );
}
