import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

// ── Greeting by time ─────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { text: 'Good Night',    icon: '🌙', sub: 'The stars guide your path, Traveler' };
  if (h < 12) return { text: 'Good Morning',  icon: '🌅', sub: 'A new day, a new adventure awaits' };
  if (h < 17) return { text: 'Good Afternoon',icon: '☀️', sub: 'Keep pushing forward, Traveler' };
  if (h < 21) return { text: 'Good Evening',  icon: '🌇', sub: 'Twilight falls over Teyvat...' };
  return             { text: 'Good Night',    icon: '🌙', sub: 'Rest well and study tomorrow' };
}

// ── Static particles ──────────────────────────────────────
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i * 137.5) % 100,
  dur: 6 + (i % 5) * 2,
  delay: (i * 0.6) % 9,
  size: 1.5 + (i % 3) * 0.7,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 10),
}));

// ── Nav cards data ────────────────────────────────────────
const NAV_CARDS = [
  {
    to: '/vocab',
    label: 'Vocabulary',
    element: 'Hydro',
    elementIcon: '◈',
    color: '#4fc3f7',
    glow: 'rgba(79,195,247,.4)',
    bg: 'rgba(79,195,247,.08)',
    border: 'rgba(79,195,247,.3)',
    desc: 'Learn words across Teyvat',
    statKey: 'topics',
    statLabel: 'topics',
  },
  {
    to: '/grammar',
    label: 'Grammar',
    element: 'Dendro',
    elementIcon: '✦',
    color: '#81c784',
    glow: 'rgba(129,199,132,.4)',
    bg: 'rgba(129,199,132,.08)',
    border: 'rgba(129,199,132,.3)',
    desc: 'Master the language arts',
    statKey: 'lessons',
    statLabel: 'lessons',
  },
  {
    to: '/toeic',
    label: 'Luyện Thi',
    element: 'Pyro',
    elementIcon: '▲',
    color: '#ff8a65',
    glow: 'rgba(255,138,101,.4)',
    bg: 'rgba(255,138,101,.08)',
    border: 'rgba(255,138,101,.3)',
    desc: 'Forge your skills in battle',
    statKey: 'exams',
    statLabel: 'đề thi',
  },
  {
    to: '/history',
    label: 'Progress',
    element: 'Electro',
    elementIcon: '◇',
    color: '#ce93d8',
    glow: 'rgba(206,147,216,.4)',
    bg: 'rgba(206,147,216,.08)',
    border: 'rgba(206,147,216,.3)',
    desc: 'Track your adventure log',
    statKey: null,
    statLabel: 'View history',
  },
];

// ── Daily quests fallback (before API loads) ──────────────
const DEFAULT_DAILY_QUESTS = [
  { type: 'vocab',   label: 'Học 10 từ mới',          exp: 60,  done: false },
  { type: 'grammar', label: 'Hoàn thành bài ngữ pháp', exp: 80,  done: false },
  { type: 'exam',    label: 'Hoàn thành một đề thi',   exp: 100, done: false },
];

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats]         = useState({ exams: 0, lessons: 0, topics: 0 });
  const [myStats, setMyStats]     = useState(null);
  const [ranking, setRanking]     = useState([]);
  const [loaded, setLoaded]       = useState(false);
  const [hovCard, setHovCard]     = useState(null);
  const greeting = getGreeting();
  const canvasRef = useRef(null);

  // Derived traveler data from API
  const travelerRank   = myStats?.rank       || '–';
  const travelerLevel  = myStats?.level      || 1;
  const travelerExp    = myStats?.expInLevel  || 0;
  const travelerMaxExp = myStats?.expToNext   || 200;
  const expPercent     = travelerMaxExp > 0 ? Math.min((travelerExp / travelerMaxExp) * 100, 100) : 0;
  const dailyQuests    = myStats?.dailyTasks  || DEFAULT_DAILY_QUESTS;

  useEffect(() => {
    Promise.all([
      api.get('/toeic').catch(() => ({ data: { data: [] } })),
      api.get('/grammar/lessons').catch(() => ({ data: { data: [] } })),
      api.get('/vocab/topics').catch(() => ({ data: { data: [] } })),
      api.get('/ranking/me').catch(() => null),
      api.get('/ranking').catch(() => null),
    ]).then(([e, g, v, me, rank]) => {
      setStats({
        exams:   e.data.data?.length || 0,
        lessons: g.data.data?.length || 0,
        topics:  v.data.data?.length || 0,
      });
      if (me?.data?.success)   setMyStats(me.data.data);
      if (rank?.data?.success) setRanking(rank.data.data.slice(0, 5));
      setTimeout(() => setLoaded(true), 120);
    });
  }, []);

  // Draw star connections on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Subtle diagonal lines
      const isLight = document.documentElement.getAttribute('data-bs-theme') === 'light';
      ctx.strokeStyle = isLight ? 'rgba(140,105,50,.07)' : 'rgba(200,169,110,.04)';
      ctx.lineWidth = .6;
      for (let i = -canvas.height; i < canvas.width + canvas.height; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + canvas.height, canvas.height);
        ctx.stroke();
      }
    };
    resize();
    window.addEventListener('resize', resize);
    const obs = new MutationObserver(resize);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });
    return () => { window.removeEventListener('resize', resize); obs.disconnect(); };
  }, []);

  const displayName = user?.full_name || user?.username || 'Traveler';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&display=swap');

        :root {
          --gold:       #c8a96e;
          --gold-lt:    #e8d5a3;
          --gold-bright:#f5ecd4;
          --gold-dim:   #7a6040;
          --navy:       #060e1f;
          --navy2:      #0a1422;
          --navy3:      #0d1830;
          --text:       #e8dcc8;
          --text-sub:   #8a7f6a;
          --border:     rgba(200,169,110,.18);
          --glow-gold:  rgba(200,169,110,.28);
        }

        .hp-root {
          min-height:calc(100vh - 64px);
          background:var(--navy);
          font-family:'Be Vietnam Pro',sans-serif;
          position:relative;
          overflow:hidden;
          color:var(--text);
        }

        /* Background layers */
        .hp-bg {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%,   rgba(30,55,120,.5) 0%,transparent 60%),
            radial-gradient(ellipse 60% 60% at 0% 100%,   rgba(20,40,90,.4)  0%,transparent 55%),
            radial-gradient(ellipse 50% 50% at 100% 50%, rgba(80,40,10,.25) 0%,transparent 55%);
        }
        .hp-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(200,169,110,.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(200,169,110,.03) 1px,transparent 1px);
          background-size:52px 52px;
        }
        .hp-canvas {
          position:absolute; inset:0; width:100%; height:100%; pointer-events:none;
        }

        /* Particles */
        .hp-particle {
          position:absolute; border-radius:50%; background:var(--gold);
          animation:hpfloat linear infinite; pointer-events:none;
        }
        @keyframes hpfloat {
          0%  {transform:translate(0,0);opacity:0;}
          8%  {opacity:.7;}
          92% {opacity:.3;}
          100%{transform:translate(var(--drift),calc(-100% - 100px));opacity:0;}
        }

        /* ── MAIN LAYOUT ── */
        .hp-inner {
          position:relative; z-index:2;
          max-width:1280px; margin:0 auto;
          padding:40px 28px 60px;
        }

        /* ── GREETING BANNER ── */
        .hp-greeting {
          display:flex; align-items:flex-start; justify-content:space-between;
          gap:24px; margin-bottom:40px;
          opacity:0; transform:translateY(20px);
          animation:hpreveal .7s cubic-bezier(.16,1,.3,1) .1s forwards;
        }
        @keyframes hpreveal {
          to{opacity:1;transform:translateY(0);}
        }

        .hp-greeting-left { flex:1; min-width:0; }

        .hp-greeting-eyebrow {
          font-family:'Cinzel',serif;
          font-size:.72rem; font-weight:400;
          letter-spacing:.28em; text-transform:uppercase;
          color:var(--gold-dim); margin-bottom:8px;
          display:flex; align-items:center; gap:10px;
        }
        .hp-greeting-eyebrow::before {
          content:''; display:block; width:28px; height:1px;
          background:linear-gradient(90deg,transparent,var(--gold-dim));
        }

        .hp-greeting-name {
          font-family:'Cinzel',serif;
          font-size:clamp(1.6rem,3vw,2.5rem);
          font-weight:700; color:var(--gold-lt);
          letter-spacing:.06em; line-height:1.1;
          text-shadow:0 0 30px rgba(200,169,110,.35);
          margin-bottom:6px;
        }

        .hp-greeting-sub {
          font-size:.9rem; color:var(--text-sub);
          font-weight:400; letter-spacing:.04em;
        }

        /* Traveler profile card */
        .hp-traveler-card {
          background:linear-gradient(135deg,
            rgba(200,169,110,.1) 0%,
            rgba(200,169,110,.05) 50%,
            rgba(125,211,232,.05) 100%);
          border:1px solid var(--border);
          border-radius:12px;
          padding:18px 22px;
          min-width:240px;
          position:relative; overflow:hidden;
          box-shadow:inset 0 1px 0 rgba(200,169,110,.12),
                     0 8px 32px rgba(0,0,0,.3);
        }
        .hp-traveler-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(200,169,110,.5),transparent);
        }

        .hp-rank-row {
          display:flex; align-items:center; gap:10px; margin-bottom:12px;
        }
        .hp-rank-badge {
          width:40px; height:40px; border-radius:50%;
          background:radial-gradient(circle at 35% 35%,
            rgba(200,169,110,.25), rgba(6,14,31,.9));
          border:1.5px solid rgba(200,169,110,.5);
          display:flex; align-items:center; justify-content:center;
          font-family:'Cinzel',serif; font-size:14px; font-weight:700;
          color:var(--gold-lt);
          box-shadow:0 0 16px rgba(200,169,110,.2);
        }
        .hp-rank-info { flex:1; }
        .hp-rank-label {
          font-family:'Cinzel',serif; font-size:9px; letter-spacing:.16em;
          color:var(--gold-dim); text-transform:uppercase; margin-bottom:2px;
        }
        .hp-rank-name {
          font-size:13px; font-weight:700; color:var(--gold-lt);
        }

        /* EXP bar */
        .hp-exp-label {
          display:flex; justify-content:space-between;
          font-size:10px; color:var(--text-sub); margin-bottom:5px;
          font-family:'Cinzel',serif; letter-spacing:.08em;
        }
        .hp-exp-track {
          height:5px; border-radius:3px;
          background:rgba(255,255,255,.07);
          overflow:hidden; position:relative;
        }
        .hp-exp-fill {
          height:100%; border-radius:3px;
          background:linear-gradient(90deg,var(--gold-dim),var(--gold),var(--gold-bright));
          box-shadow:0 0 8px rgba(200,169,110,.5);
          transition:width 1.2s cubic-bezier(.16,1,.3,1);
        }

        /* ── SECTION LABEL ── */
        .hp-section-label {
          display:flex; align-items:center; gap:14px;
          margin-bottom:20px;
          opacity:0; animation:hpreveal .7s cubic-bezier(.16,1,.3,1) forwards;
        }
        .hp-section-label-line {
          flex:1; height:1px;
          background:linear-gradient(90deg,var(--border),transparent);
        }
        .hp-section-label-text {
          font-family:'Cinzel',serif; font-size:.7rem; font-weight:600;
          letter-spacing:.24em; text-transform:uppercase; color:var(--gold-dim);
          white-space:nowrap;
        }
        .hp-section-label-gem {
          font-size:9px; color:var(--gold);
          filter:drop-shadow(0 0 4px rgba(200,169,110,.7));
        }

        /* ── NAV CARDS GRID ── */
        .hp-cards-grid {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
          margin-bottom:36px;
        }
        @media(max-width:900px){.hp-cards-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:500px){.hp-cards-grid{grid-template-columns:1fr;}}

        .hp-card-wrap {
          opacity:0; transform:translateY(24px);
          animation:hpreveal .65s cubic-bezier(.16,1,.3,1) forwards;
        }

        .hp-card {
          display:block; text-decoration:none;
          background:linear-gradient(145deg,
            rgba(255,255,255,.04) 0%,
            rgba(255,255,255,.02) 100%);
          border:1px solid var(--border);
          border-radius:12px;
          padding:52px 20px 22px;
          position:relative; overflow:hidden;
          transition:all .3s cubic-bezier(.16,1,.3,1);
          cursor:pointer;
          box-shadow:0 4px 24px rgba(0,0,0,.25),
                     inset 0 1px 0 rgba(255,255,255,.04);
        }
        .hp-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
          background:linear-gradient(90deg,transparent,var(--c-color,var(--gold)),transparent);
          opacity:.4; transition:opacity .3s;
        }
        .hp-card::after {
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse at 50% 120%,var(--c-glow,rgba(200,169,110,.15)),transparent 65%);
          opacity:0; transition:opacity .35s;
        }
        .hp-card:hover {
          border-color:var(--c-border,var(--border));
          transform:translateY(-5px);
          box-shadow:0 12px 40px rgba(0,0,0,.35),
                     0 0 0 1px rgba(200,169,110,.1),
                     var(--c-shadow,0 0 20px rgba(200,169,110,.15));
        }
        .hp-card:hover::before{opacity:1;}
        .hp-card:hover::after{opacity:1;}

        /* Card shimmer on hover */
        .hp-card-shimmer {
          position:absolute; top:0; left:-100%; width:50%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);
          transition:left .5s ease;
          pointer-events:none;
        }
        .hp-card:hover .hp-card-shimmer{left:150%;}

        /* Element badge */
        .hp-card-element {
          position:absolute; top:14px; right:14px;
          display:flex; align-items:center; gap:4px;
          padding:3px 9px; border-radius:12px;
          font-family:'Cinzel',serif; font-size:8.5px; font-weight:600;
          letter-spacing:.1em; text-transform:uppercase;
          border:1px solid; opacity:.7;
          transition:opacity .3s;
        }
        .hp-card:hover .hp-card-element{opacity:1;}

        .hp-card-label {
          font-family:'Cinzel',serif; font-size:.92rem; font-weight:700;
          letter-spacing:.1em; margin-bottom:8px;
          transition:color .3s;
        }
        .hp-card-desc {
          font-size:.78rem; color:var(--text-sub); letter-spacing:.03em;
          line-height:1.4; margin-bottom:12px;
        }
        .hp-card-stat {
          display:inline-flex; align-items:center; gap:5px;
          font-family:'Cinzel',serif; font-size:.72rem; font-weight:600;
          letter-spacing:.1em; color:var(--gold-dim);
          border-top:1px solid rgba(200,169,110,.1);
          padding-top:10px; width:100%;
          transition:color .3s;
        }
        .hp-card-stat-num {
          font-size:.95rem; font-weight:700;
          transition:color .3s;
        }

        /* Enter button arrow */
        .hp-card-arrow {
          position:absolute; bottom:18px; right:16px;
          font-size:16px; color:var(--gold-dim); opacity:0;
          transform:translateX(-6px);
          transition:all .3s cubic-bezier(.16,1,.3,1);
        }
        .hp-card:hover .hp-card-arrow{opacity:1;transform:translateX(0);}

        /* ── BOTTOM ROW: Daily Quests + Leaderboard ── */
        .hp-bottom-row {
          display:grid; grid-template-columns:1fr 1fr; gap:16px;
          opacity:0; animation:hpreveal .7s cubic-bezier(.16,1,.3,1) forwards;
        }
        @media(max-width:700px){.hp-bottom-row{grid-template-columns:1fr;}}

        /* Panel shared */
        .hp-panel {
          background:linear-gradient(145deg,
            rgba(255,255,255,.035) 0%,
            rgba(200,169,110,.03) 100%);
          border:1px solid var(--border);
          border-radius:12px;
          padding:22px 24px;
          position:relative; overflow:hidden;
          box-shadow:inset 0 1px 0 rgba(200,169,110,.1),
                     0 8px 32px rgba(0,0,0,.2);
        }
        .hp-panel::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(200,169,110,.4),transparent);
        }
        .hp-panel-title {
          font-family:'Cinzel',serif; font-size:.72rem; font-weight:600;
          letter-spacing:.22em; text-transform:uppercase;
          color:var(--gold-dim); margin-bottom:16px;
          display:flex; align-items:center; gap:8px;
        }

        /* Daily quest items */
        .hp-quest {
          display:flex; align-items:center; gap:12px;
          padding:10px 0;
          border-bottom:1px solid rgba(200,169,110,.07);
          transition:all .2s;
        }
        .hp-quest:last-child{border-bottom:none;}
        .hp-quest:hover{padding-left:4px;}
        .hp-quest-done{opacity:.8;}

        .hp-quest-icon {
          width:34px; height:34px; border-radius:8px; flex-shrink:0;
          background:rgba(200,169,110,.08);
          border:1px solid rgba(200,169,110,.15);
          display:flex; align-items:center; justify-content:center;
          font-size:16px;
        }
        .hp-quest-info{flex:1;min-width:0;}
        .hp-quest-label{font-size:.82rem;font-weight:600;color:var(--text);margin-bottom:2px;}
        .hp-quest-reward{
          font-family:'Cinzel',serif; font-size:.65rem;
          letter-spacing:.1em; color:var(--gold-dim);
        }
        .hp-quest-check {
          width:22px; height:22px; border-radius:50%; flex-shrink:0;
          border:1.5px solid rgba(200,169,110,.3);
          display:flex; align-items:center; justify-content:center;
          font-size:11px;
          transition:all .2s;
        }
        .hp-quest-check.done{
          background:rgba(200,169,110,.2);
          border-color:var(--gold);
          color:var(--gold);
        }

        /* Stats panel */
        .hp-stats-grid {
          display:grid; grid-template-columns:1fr 1fr; gap:12px;
        }
        .hp-stat-item {
          background:rgba(255,255,255,.03);
          border:1px solid rgba(200,169,110,.1);
          border-radius:8px; padding:14px 16px;
          transition:all .25s;
        }
        .hp-stat-item:hover{
          border-color:rgba(200,169,110,.25);
          background:rgba(200,169,110,.05);
          transform:translateY(-2px);
        }
        .hp-stat-num {
          font-family:'Cinzel',serif;
          font-size:1.6rem; font-weight:700;
          color:var(--gold-lt);
          text-shadow:0 0 14px rgba(200,169,110,.3);
          line-height:1; margin-bottom:4px;
        }
        .hp-stat-label {
          font-size:.72rem; color:var(--text-sub);
          letter-spacing:.06em;
        }
        .hp-stat-icon { font-size:18px; margin-bottom:6px; }

        /* Teyvat quote */
        .hp-quote {
          text-align:center; margin-top:36px; padding:20px;
          opacity:0; animation:hpreveal .7s cubic-bezier(.16,1,.3,1) forwards;
        }
        .hp-quote-text {
          font-family:'Cinzel',serif; font-size:.75rem; font-weight:400;
          letter-spacing:.22em; color:var(--gold-dim); text-transform:uppercase;
          font-style:italic;
        }
        .hp-quote-divs {
          display:flex; align-items:center; gap:12px;
          justify-content:center; margin-bottom:8px;
        }
        .hp-quote-line{width:40px;height:1px;background:var(--border);}
        .hp-quote-gem{font-size:9px;color:var(--gold-dim);}

        /* ── LIGHT MODE ── */
        html[data-bs-theme="light"] .hp-root {
          --navy:        #ffffff;
          --navy2:       #f5f5f5;
          --navy3:       #eeeeee;
          --text:        #1a1a2e;
          --text-sub:    #6b7280;
          --border:      rgba(0,0,0,.1);
          --glow-gold:   rgba(14,45,107,.12);
          --gold:        #1a4fae;
          --gold-lt:     #0d2d6b;
          --gold-bright: #4878cc;
          --gold-dim:    #2e5cb8;
        }
        html[data-bs-theme="light"] .hp-greeting-name {
          text-shadow: 0 0 30px rgba(14,45,107,.15);
        }
        html[data-bs-theme="light"] .hp-stat-num {
          text-shadow: 0 0 14px rgba(14,45,107,.15);
        }
        html[data-bs-theme="light"] .hp-exp-fill {
          background: linear-gradient(90deg,#0d2d6b,#1a4fae,#4878cc);
          box-shadow: 0 0 8px rgba(14,45,107,.3);
        }
        html[data-bs-theme="light"] .hp-rank-badge {
          border-color: rgba(14,45,107,.4);
          box-shadow: 0 0 16px rgba(14,45,107,.15);
        }
        html[data-bs-theme="light"] .hp-bg {
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%,   rgba(200,175,110,.12) 0%,transparent 60%),
            radial-gradient(ellipse 60% 60% at 0% 100%,   rgba(180,155,90,.08)  0%,transparent 55%),
            radial-gradient(ellipse 50% 50% at 100% 50%, rgba(210,170,80,.06)  0%,transparent 55%);
        }
        html[data-bs-theme="light"] .hp-grid {
          background-image:
            linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px);
        }
        html[data-bs-theme="light"] .hp-card {
          background:linear-gradient(145deg,rgba(255,255,255,.9) 0%,rgba(248,248,248,.8) 100%);
          border-color:rgba(0,0,0,.09);
          box-shadow:0 4px 24px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,1);
        }
        html[data-bs-theme="light"] .hp-card:hover {
          box-shadow:0 12px 36px rgba(0,0,0,.1),0 0 0 1px rgba(200,169,110,.15),var(--c-shadow,none);
        }
        html[data-bs-theme="light"] .hp-card-shimmer {
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);
        }
        html[data-bs-theme="light"] .hp-traveler-card {
          background:linear-gradient(135deg,rgba(200,169,110,.12) 0%,rgba(200,169,110,.06) 50%,rgba(100,180,210,.04) 100%);
          border-color:rgba(0,0,0,.1);
          box-shadow:inset 0 1px 0 rgba(200,169,110,.18),0 8px 32px rgba(0,0,0,.06);
        }
        html[data-bs-theme="light"] .hp-rank-badge {
          background:radial-gradient(circle at 35% 35%,rgba(200,169,110,.3),rgba(255,255,255,.9));
        }
        html[data-bs-theme="light"] .hp-exp-track {
          background:rgba(0,0,0,.08);
        }
        html[data-bs-theme="light"] .hp-panel {
          background:linear-gradient(145deg,rgba(255,255,255,.92) 0%,rgba(200,169,110,.05) 100%);
          border-color:rgba(0,0,0,.09);
          box-shadow:inset 0 1px 0 rgba(200,169,110,.12),0 8px 32px rgba(0,0,0,.06);
        }
        html[data-bs-theme="light"] .hp-quest-icon {
          background:rgba(200,169,110,.1);
          border-color:rgba(200,169,110,.2);
        }
        html[data-bs-theme="light"] .hp-quest {
          border-bottom-color:rgba(0,0,0,.07);
        }
        html[data-bs-theme="light"] .hp-stat-item {
          background:rgba(255,255,255,.8);
          border-color:rgba(0,0,0,.08);
        }
        html[data-bs-theme="light"] .hp-stat-item:hover {
          background:rgba(200,169,110,.08);
          border-color:rgba(200,169,110,.25);
        }
        html[data-bs-theme="light"] .hp-card-stat {
          border-top-color:rgba(0,0,0,.07);
        }
      `}</style>

      <div className="hp-root">
        <div className="hp-bg"/>
        <div className="hp-grid"/>
        <canvas ref={canvasRef} className="hp-canvas"/>

        {/* Particles */}
        {PARTICLES.map(p => (
          <div key={p.id} className="hp-particle" style={{
            left:`${p.x}%`, bottom:`-${p.size*2}px`,
            width:p.size, height:p.size, opacity:0,
            '--drift':`${p.drift}px`,
            animationDuration:`${p.dur}s`,
            animationDelay:`${p.delay}s`,
          }}/>
        ))}

        <div className="hp-inner">

          {/* ── GREETING ── */}
          <div className="hp-greeting">
            <div className="hp-greeting-left">
              <div className="hp-greeting-eyebrow">
                {greeting.icon} {greeting.text}, Traveler
              </div>
              <h1 className="hp-greeting-name">{displayName}</h1>
              <p className="hp-greeting-sub">{greeting.sub}</p>
            </div>

            {/* Traveler rank card */}
            <div className="hp-traveler-card">
              <div className="hp-rank-row">
                <div className="hp-rank-badge">{travelerLevel}</div>
                <div className="hp-rank-info">
                  <div className="hp-rank-label">Adventure Rank</div>
                  <div className="hp-rank-name">
                    AR {travelerLevel}
                    {myStats && <span style={{fontSize:'10px',color:'var(--text-sub)',marginLeft:8}}>#{travelerRank} Global</span>}
                  </div>
                </div>
              </div>
              <div className="hp-exp-label">
                <span style={{fontFamily:"'Cinzel',serif",fontSize:'9px',letterSpacing:'.12em'}}>ENGLISH EXP</span>
                <span>{travelerExp} / {travelerMaxExp}</span>
              </div>
              <div className="hp-exp-track">
                <div className="hp-exp-fill" style={{width: loaded ? `${expPercent}%` : '0%'}}/>
              </div>
              {myStats && (
                <div style={{fontSize:'9px',color:'var(--text-sub)',marginTop:6,fontFamily:"'Cinzel',serif",letterSpacing:'.08em'}}>
                  TOTAL: {(myStats.totalExp || 0).toLocaleString()} EXP
                </div>
              )}
            </div>
          </div>

          {/* ── NAV CARDS ── */}
          <div className="hp-section-label" style={{animationDelay:'.2s'}}>
            <span className="hp-section-label-gem">◆</span>
            <span className="hp-section-label-text">Choose Your Path</span>
            <div className="hp-section-label-line"/>
          </div>

          <div className="hp-cards-grid">
            {NAV_CARDS.map((c, i) => (
              <div key={c.to} className="hp-card-wrap" style={{animationDelay:`${.25 + i * .1}s`}}>
                <Link
                  to={c.to}
                  className="hp-card"
                  style={{
                    '--c-color':  c.color,
                    '--c-glow':   c.glow,
                    '--c-border': c.border,
                    '--c-shadow': `0 0 28px ${c.glow}`,
                    ...(hovCard === i ? {
                      borderColor: c.border,
                      background: `linear-gradient(145deg, ${c.bg} 0%, rgba(255,255,255,.02) 100%)`,
                    } : {}),
                  }}
                  onMouseEnter={() => setHovCard(i)}
                  onMouseLeave={() => setHovCard(null)}>

                  <div className="hp-card-shimmer"/>

                  {/* Element badge */}
                  <div className="hp-card-element" style={{
                    color: c.color, borderColor: c.border,
                    background: c.bg,
                  }}>
                    <span>{c.elementIcon}</span>
                    <span>{c.element}</span>
                  </div>

                  <div className="hp-card-label" style={{color: hovCard===i ? c.color : 'var(--gold-lt)'}}>
                    {c.label}
                  </div>
                  <div className="hp-card-desc">{c.desc}</div>

                  <div className="hp-card-stat">
                    <span className="hp-card-stat-num" style={{color: hovCard===i ? c.color : 'var(--gold-lt)'}}>
                      {c.statKey ? stats[c.statKey] : '→'}
                    </span>
                    <span>{c.statLabel}</span>
                  </div>

                  <div className="hp-card-arrow">→</div>
                </Link>
              </div>
            ))}
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="hp-section-label" style={{animationDelay:'.6s'}}>
            <span className="hp-section-label-gem">◆</span>
            <span className="hp-section-label-text">Traveler Dashboard</span>
            <div className="hp-section-label-line"/>
          </div>

          <div className="hp-bottom-row" style={{animationDelay:'.7s'}}>
            {/* Daily quests */}
            <div className="hp-panel">
              <div className="hp-panel-title">
                Daily Quests
                {myStats && (
                  <span style={{marginLeft:'auto',fontSize:'10px',color:'var(--gold-dim)'}}>
                    {dailyQuests.filter(q=>q.done).length}/{dailyQuests.length} hoàn thành
                  </span>
                )}
              </div>
              {dailyQuests.map((q, i) => (
                <div key={i} className={`hp-quest ${q.done ? 'hp-quest-done' : ''}`}>
                  <div className="hp-quest-icon" style={q.done ? {background:'rgba(100,220,100,.12)',borderColor:'rgba(100,220,100,.3)'} : {}}>
                    {q.done ? '✓' : { vocab:'◈', grammar:'✦', exam:'▲' }[q.type] || '◆'}
                  </div>
                  <div className="hp-quest-info">
                    <div className="hp-quest-label" style={q.done ? {textDecoration:'line-through',opacity:.6} : {}}>
                      {q.label}
                    </div>
                    <div className="hp-quest-reward">✦ +{q.exp} EXP</div>
                  </div>
                  <div className={`hp-quest-check ${q.done ? 'done' : ''}`}>
                    {q.done ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>

            {/* Top Travelers leaderboard */}
            <div className="hp-panel">
              <div className="hp-panel-title">
                Top Travelers
              </div>
              {loaded && ranking.length > 0 ? ranking.map((r) => {
                const isMe = r.id === user?.id;
                return (
                  <div key={r.id} className="hp-quest" style={isMe ? {background:'rgba(200,169,110,.07)',borderRadius:6,padding:'8px 6px'} : {}}>
                    <div className="hp-quest-icon" style={{
                      background: r.rank === 1 ? 'rgba(255,215,0,.15)' : r.rank === 2 ? 'rgba(192,192,192,.15)' : r.rank === 3 ? 'rgba(205,127,50,.15)' : 'rgba(200,169,110,.08)',
                      borderColor: r.rank === 1 ? 'rgba(255,215,0,.4)' : r.rank === 2 ? 'rgba(192,192,192,.3)' : r.rank === 3 ? 'rgba(205,127,50,.3)' : 'rgba(200,169,110,.15)',
                      fontSize:14, fontWeight:700, color: r.rank <= 3 ? 'var(--gold-lt)' : 'var(--text-sub)',
                    }}>
                      {`#${r.rank}`}
                    </div>
                    <div className="hp-quest-info">
                      <div className="hp-quest-label" style={{display:'flex',alignItems:'center',gap:6}}>
                        {r.full_name || r.username}
                        {isMe && <span style={{fontSize:'9px',padding:'1px 6px',background:'rgba(200,169,110,.2)',borderRadius:4,color:'var(--gold)'}}>YOU</span>}
                      </div>
                      <div className="hp-quest-reward">AR {r.level} · {(r.total_exp||0).toLocaleString()} EXP</div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{color:'var(--text-sub)',fontSize:'.8rem',textAlign:'center',padding:'20px 0'}}>
                  {loaded ? 'Chưa có dữ liệu xếp hạng' : '...'}
                </div>
              )}
              {myStats && ranking.length > 0 && !ranking.find(r => r.id === user?.id) && user?.role !== 'admin' && (
                <div className="hp-quest" style={{background:'rgba(200,169,110,.07)',borderRadius:6,padding:'8px 6px',marginTop:4}}>
                  <div className="hp-quest-icon" style={{fontSize:13,fontWeight:700,color:'var(--gold-dim)'}}>#{myStats.rank}</div>
                  <div className="hp-quest-info">
                    <div className="hp-quest-label" style={{display:'flex',alignItems:'center',gap:6}}>
                      {user?.full_name || user?.username}
                      <span style={{fontSize:'9px',padding:'1px 6px',background:'rgba(200,169,110,.2)',borderRadius:4,color:'var(--gold)'}}>YOU</span>
                    </div>
                    <div className="hp-quest-reward">AR {myStats.level} · {(myStats.totalExp||0).toLocaleString()} EXP</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── TEYVAT QUOTE ── */}
          <div className="hp-quote" style={{animationDelay:'.9s'}}>
            <div className="hp-quote-divs">
              <div className="hp-quote-line"/>
              <span className="hp-quote-gem">◆</span>
              <div className="hp-quote-line"/>
            </div>
            <p className="hp-quote-text">"Every word mastered is a step closer to the truth of Teyvat"</p>
          </div>

        </div>
      </div>
    </>
  );
}