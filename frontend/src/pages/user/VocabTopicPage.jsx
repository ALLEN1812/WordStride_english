import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_META = {
  learned: { label: 'Learned',  color: '#81c784', glow: 'rgba(129,199,132,.35)', bg: 'rgba(129,199,132,.1)',  icon: '✓', element: 'Dendro'  },
  hard:    { label: 'Hard',     color: '#ff8a65', glow: 'rgba(255,138,101,.35)', bg: 'rgba(255,138,101,.1)',  icon: '⚡', element: 'Pyro'    },
  new:     { label: 'New',      color: '#7dd3e8', glow: 'rgba(125,211,232,.35)', bg: 'rgba(125,211,232,.08)', icon: '✦', element: 'Hydro'   },
};

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i, x: (i * 137.5) % 100,
  dur: 7 + (i % 4) * 2, delay: (i * 0.7) % 9,
  size: 1.2 + (i % 3) * 0.5,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 12),
}));

export default function VocabTopicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic,   setTopic]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [hovRow,  setHovRow]  = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    api.get(`/vocab/topics/${id}`)
      .then(res => { setTopic(res.data.data); setTimeout(() => setMounted(true), 80); })
      .finally(() => setLoading(false));
  }, [id]);

  const cards   = topic?.flashcards || [];
  const learned = cards.filter(c => c.user_status === 'learned').length;
  const hard    = cards.filter(c => c.user_status === 'hard').length;
  const newW    = cards.filter(c => !c.user_status || c.user_status === 'new').length;
  const notDone = cards.filter(c => c.user_status !== 'learned').length;
  const pctLearned = cards.length ? Math.round(learned / cards.length * 100) : 0;

  const filtered = search.trim()
    ? cards.filter(c =>
        c.word.toLowerCase().includes(search.toLowerCase()) ||
        c.meaning.toLowerCase().includes(search.toLowerCase())
      )
    : cards;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&display=swap');

        :root {
          --gold:#c8a96e; --gold-lt:#e8d5a3; --gold-bright:#f5ecd4; --gold-dim:#7a6040;
          --navy:#060e1f; --navy2:#0a1422; --text:#e8dcc8; --text-sub:#8a7f6a;
          --border:rgba(200,169,110,.18); --glow-gold:rgba(200,169,110,.25);
        }

        .vt-root {
          min-height:calc(100vh - 64px);
          background:var(--navy);
          font-family:'Be Vietnam Pro',sans-serif;
          color:var(--text);
          position:relative; overflow:hidden;
        }

        .vt-bg {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 75% 55% at 20% 0%, rgba(30,55,120,.5) 0%,transparent 60%),
            radial-gradient(ellipse 55% 60% at 85% 85%, rgba(80,40,10,.3) 0%,transparent 55%),
            radial-gradient(ellipse 40% 40% at 75% 20%, rgba(20,50,100,.35) 0%,transparent 50%);
        }
        .vt-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(200,169,110,.03) 1px,transparent 1px),
            linear-gradient(90deg,rgba(200,169,110,.03) 1px,transparent 1px);
          background-size:52px 52px;
        }
        .vt-particle {
          position:absolute; border-radius:50%; background:var(--gold);
          animation:vtpfloat linear infinite; pointer-events:none;
        }
        @keyframes vtpfloat {
          0%{transform:translate(0,0);opacity:0;} 8%{opacity:.6;}
          92%{opacity:.2;} 100%{transform:translate(var(--drift),calc(-100% - 80px));opacity:0;}
        }

        .vt-inner {
          position:relative; z-index:2;
          max-width:1000px; margin:0 auto;
          padding:36px 28px 60px;
        }

        @keyframes vtreveal { to{opacity:1;transform:translateY(0);} }

        /* Back link */
        .vt-back {
          display:inline-flex; align-items:center; gap:8px;
          font-family:'Cinzel',serif; font-size:.72rem; font-weight:600;
          letter-spacing:.14em; text-transform:uppercase;
          color:var(--gold-dim); text-decoration:none;
          border:1px solid rgba(200,169,110,.18); border-radius:6px;
          padding:7px 14px; margin-bottom:28px;
          transition:all .25s;
          opacity:0; animation:vtreveal .6s cubic-bezier(.16,1,.3,1) .05s forwards;
        }
        .vt-back:hover {
          color:var(--gold-lt); border-color:rgba(200,169,110,.4);
          background:rgba(200,169,110,.06); transform:translateX(-3px);
        }

        /* Header */
        .vt-header {
          display:flex; align-items:flex-start; justify-content:space-between;
          gap:20px; margin-bottom:32px;
          opacity:0; animation:vtreveal .65s cubic-bezier(.16,1,.3,1) .1s forwards;
        }
        .vt-header-left { flex:1; min-width:0; }

        .vt-eyebrow {
          font-family:'Cinzel',serif; font-size:.68rem; font-weight:600;
          letter-spacing:.28em; text-transform:uppercase;
          color:var(--gold-dim); margin-bottom:10px;
          display:flex; align-items:center; gap:10px;
        }
        .vt-eyebrow::before {
          content:''; display:block; width:24px; height:1px;
          background:linear-gradient(90deg,transparent,var(--gold-dim));
        }

        .vt-title {
          font-family:'Cinzel',serif;
          font-size:clamp(1.5rem,2.8vw,2.2rem); font-weight:700;
          color:transparent;
          background:linear-gradient(170deg,#f5ecd4 0%,#e8d5a3 30%,#c8a96e 65%,#9a7540 100%);
          -webkit-background-clip:text; background-clip:text;
          filter:drop-shadow(0 0 22px rgba(200,169,110,.38));
          letter-spacing:.07em; line-height:1.2; margin-bottom:10px;
        }

        .vt-meta-row {
          display:flex; align-items:center; gap:10px; flex-wrap:wrap;
        }
        .vt-category-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 12px; border-radius:20px;
          font-family:'Cinzel',serif; font-size:.68rem; font-weight:600;
          letter-spacing:.1em;
          color:var(--gold); border:1px solid rgba(200,169,110,.35);
          background:rgba(200,169,110,.1);
        }
        .vt-word-count {
          font-family:'Cinzel',serif; font-size:.68rem;
          letter-spacing:.12em; color:var(--gold-dim);
        }
        .vt-desc { font-size:.85rem; color:var(--text-sub); margin-top:8px; line-height:1.6; }

        /* Practice button */
        .vt-practice-btn {
          display:inline-flex; align-items:center; gap:10px; flex-shrink:0;
          padding:13px 22px; border-radius:8px; border:none; cursor:pointer;
          background:linear-gradient(135deg,rgba(129,199,132,.18),rgba(129,199,132,.3),rgba(129,199,132,.18));
          border:1px solid rgba(129,199,132,.5);
          color:#81c784;
          font-family:'Cinzel',serif; font-size:.78rem; font-weight:600;
          letter-spacing:.14em; text-transform:uppercase;
          transition:all .3s; position:relative; overflow:hidden;
          white-space:nowrap;
        }
        .vt-practice-btn:hover {
          transform:translateY(-2px);
          box-shadow:0 0 28px rgba(129,199,132,.3), inset 0 0 16px rgba(129,199,132,.08);
          border-color:rgba(129,199,132,.8); color:#a5d6a7;
        }
        .vt-practice-btn::after {
          content:''; position:absolute; top:0; left:-100%; width:50%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
          animation:vtshimmer 3s ease infinite;
        }
        @keyframes vtshimmer{from{left:-100%}to{left:200%}}

        .vt-remaining-badge {
          padding:2px 8px; border-radius:10px; font-size:.7rem; font-weight:700;
          background:rgba(129,199,132,.2); color:#81c784;
          border:1px solid rgba(129,199,132,.3);
        }

        /* Progress section */
        .vt-progress-section {
          margin-bottom:28px;
          opacity:0; animation:vtreveal .65s cubic-bezier(.16,1,.3,1) .18s forwards;
        }

        .vt-progress-header {
          display:flex; align-items:center; gap:12px; margin-bottom:14px;
        }
        .vt-progress-label {
          font-family:'Cinzel',serif; font-size:.68rem; font-weight:600;
          letter-spacing:.22em; text-transform:uppercase; color:var(--gold-dim);
        }
        .vt-progress-pct {
          font-family:'Cinzel',serif; font-size:.82rem; font-weight:700;
          color:var(--gold-lt); margin-left:auto;
        }
        .vt-progress-track {
          height:5px; border-radius:3px;
          background:rgba(255,255,255,.07); overflow:hidden; margin-bottom:16px;
        }
        .vt-progress-fill {
          height:100%; border-radius:3px;
          background:linear-gradient(90deg,var(--gold-dim),var(--gold),var(--gold-bright));
          box-shadow:0 0 10px rgba(200,169,110,.5);
          transition:width 1.2s cubic-bezier(.16,1,.3,1);
        }

        .vt-stat-cards {
          display:grid; grid-template-columns:repeat(3,1fr); gap:10px;
        }
        .vt-stat-card {
          background:linear-gradient(145deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.02) 100%);
          border:1px solid; border-radius:9px; padding:14px 16px;
          position:relative; overflow:hidden;
          box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
          transition:all .25s;
        }
        .vt-stat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
          background:linear-gradient(90deg,transparent,var(--sc),transparent);
          opacity:.5;
        }
        .vt-stat-card:hover {
          transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.03);
        }

        .vt-stat-num {
          font-family:'Cinzel',serif; font-size:1.8rem; font-weight:900;
          line-height:1; margin-bottom:4px;
          text-shadow:0 0 16px var(--sc);
        }
        .vt-stat-label { font-size:.78rem; letter-spacing:.06em; margin-bottom:8px; }
        .vt-stat-bar { height:3px; border-radius:2px; background:rgba(255,255,255,.07); }
        .vt-stat-fill {
          height:100%; border-radius:2px;
          transition:width 1s cubic-bezier(.16,1,.3,1) .3s;
          box-shadow:0 0 6px var(--sc);
        }

        /* Search */
        .vt-search-wrap {
          position:relative; margin-bottom:20px;
          opacity:0; animation:vtreveal .65s cubic-bezier(.16,1,.3,1) .24s forwards;
        }
        .vt-search-icon {
          position:absolute; left:14px; top:50%; transform:translateY(-50%);
          font-size:14px; color:var(--gold-dim); pointer-events:none;
        }
        .vt-search-input {
          width:100%; padding:12px 14px 12px 40px;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(200,169,110,.2); border-radius:8px;
          font-family:'Be Vietnam Pro',sans-serif; font-size:14px; font-weight:500;
          color:var(--text); outline:none; transition:all .25s;
        }
        .vt-search-input::placeholder { color:rgba(138,127,106,.38); font-weight:400; }
        .vt-search-input:focus {
          border-color:rgba(200,169,110,.5);
          background:rgba(200,169,110,.05);
          box-shadow:0 0 0 1px rgba(200,169,110,.18), inset 0 0 16px rgba(200,169,110,.03);
        }

        /* Divider */
        .vt-divider {
          display:flex; align-items:center; gap:12px; margin-bottom:16px;
          opacity:0; animation:vtreveal .65s cubic-bezier(.16,1,.3,1) .28s forwards;
        }
        .vt-div-line { flex:1; height:1px; background:linear-gradient(90deg,var(--border),transparent); }
        .vt-div-text {
          font-family:'Cinzel',serif; font-size:.65rem; letter-spacing:.22em;
          text-transform:uppercase; color:var(--gold-dim); white-space:nowrap;
        }
        .vt-div-gem { font-size:9px; color:var(--gold); filter:drop-shadow(0 0 4px rgba(200,169,110,.7)); }

        /* Table panel */
        .vt-table-panel {
          background:linear-gradient(145deg,rgba(255,255,255,.04) 0%,rgba(200,169,110,.025) 100%);
          border:1px solid var(--border); border-radius:10px;
          overflow:hidden; position:relative;
          box-shadow:inset 0 1px 0 rgba(200,169,110,.1), 0 8px 32px rgba(0,0,0,.25);
          opacity:0; animation:vtreveal .65s cubic-bezier(.16,1,.3,1) .3s forwards;
        }
        .vt-table-panel::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(200,169,110,.45),transparent);
        }

        /* Table */
        .vt-table { width:100%; border-collapse:collapse; }

        .vt-table thead tr {
          border-bottom:1px solid rgba(200,169,110,.15);
        }
        .vt-table thead th {
          padding:14px 18px;
          font-family:'Cinzel',serif; font-size:.62rem; font-weight:600;
          letter-spacing:.2em; text-transform:uppercase; color:var(--gold-dim);
          background:rgba(200,169,110,.04);
          white-space:nowrap;
        }
        .vt-table thead th:first-child { padding-left:20px; }
        .vt-table thead th:last-child  { padding-right:20px; }

        .vt-table tbody tr {
          border-bottom:1px solid rgba(200,169,110,.07);
          transition:all .2s;
          cursor:default;
        }
        .vt-table tbody tr:last-child { border-bottom:none; }
        .vt-table tbody tr:hover {
          background:rgba(200,169,110,.05);
        }
        .vt-table tbody tr.hov {
          background:rgba(200,169,110,.07);
        }

        .vt-table tbody td {
          padding:13px 18px; vertical-align:middle;
          font-size:.88rem;
        }
        .vt-table tbody td:first-child { padding-left:20px; }
        .vt-table tbody td:last-child  { padding-right:20px; }

        /* Row num */
        .vt-row-num {
          font-family:'Cinzel',serif; font-size:.62rem; font-weight:600;
          letter-spacing:.1em; color:var(--gold-dim);
        }

        /* Word cell */
        .vt-word {
          font-family:'Cinzel',serif; font-size:.95rem; font-weight:700;
          color:var(--gold-lt); letter-spacing:.05em;
          text-shadow:0 0 12px rgba(200,169,110,.2);
        }
        .vt-phonetic {
          font-size:.75rem; color:var(--text-sub); margin-top:2px; letter-spacing:.04em;
        }

        /* Meaning */
        .vt-meaning { color:var(--text); font-weight:500; }

        /* Example */
        .vt-example {
          color:var(--text-sub); font-style:italic; font-size:.82rem;
          max-width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
          letter-spacing:.02em;
        }

        /* Status badge */
        .vt-status-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 11px; border-radius:14px;
          font-family:'Cinzel',serif; font-size:.62rem; font-weight:600;
          letter-spacing:.1em; border:1px solid; white-space:nowrap;
        }

        /* Empty state */
        .vt-empty {
          text-align:center; padding:60px 20px;
          border:1px dashed rgba(200,169,110,.18); border-radius:10px;
        }
        .vt-empty-icon { font-size:40px; margin-bottom:12px; opacity:.4; }
        .vt-empty-text {
          font-family:'Cinzel',serif; font-size:.78rem;
          letter-spacing:.2em; color:var(--gold-dim); text-transform:uppercase;
        }

        /* Loading */
        .vt-loading {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; min-height:400px; gap:16px;
        }
        .vt-loading-spin {
          width:36px; height:36px; border-radius:50%;
          border:2px solid rgba(200,169,110,.15); border-top-color:var(--gold);
          animation:vtspin .8s linear infinite;
        }
        @keyframes vtspin{to{transform:rotate(360deg);}}
        .vt-loading-text {
          font-family:'Cinzel',serif; font-size:.72rem;
          letter-spacing:.22em; color:var(--gold-dim); text-transform:uppercase;
        }

        @media(max-width:700px){
          .vt-header{flex-direction:column;}
          .vt-stat-cards{grid-template-columns:1fr;}
          .vt-example{display:none;}
          .vt-phonetic{display:none;}
        }
        @media(max-width:500px){
          .vt-table thead th:nth-child(4),.vt-table tbody td:nth-child(4){display:none;}
        }

        /* ── LIGHT MODE ── */
        html[data-bs-theme="light"] .vt-root {
          --navy:#ffffff; --navy2:#f5f5f5; --text:#1a1a2e; --text-sub:#6b7280;
          --border:rgba(0,0,0,.1); --glow-gold:rgba(14,45,107,.12);
          --gold:#1a4fae; --gold-lt:#0d2d6b; --gold-bright:#4878cc; --gold-dim:#2e5cb8;
        }
        html[data-bs-theme="light"] .vt-bg {
          background:
            radial-gradient(ellipse 75% 55% at 20% 0%,rgba(200,175,110,.1) 0%,transparent 60%),
            radial-gradient(ellipse 55% 60% at 85% 85%,rgba(200,160,80,.07) 0%,transparent 55%);
        }
        html[data-bs-theme="light"] .vt-grid {
          background-image:
            linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px);
        }
        html[data-bs-theme="light"] .vt-panel {
          background:rgba(255,255,255,.9); border-color:rgba(0,0,0,.1);
          box-shadow:0 4px 20px rgba(0,0,0,.07);
        }
        html[data-bs-theme="light"] .vt-stat-card {
          background:rgba(255,255,255,.85); border-color:rgba(0,0,0,.09);
          box-shadow:0 2px 12px rgba(0,0,0,.06);
        }
        html[data-bs-theme="light"] .vt-table thead th {
          background:rgba(14,45,107,.06); border-color:rgba(0,0,0,.1); color:#2e5cb8;
        }
        html[data-bs-theme="light"] .vt-table tbody tr { border-color:rgba(0,0,0,.07); }
        html[data-bs-theme="light"] .vt-table tbody tr:hover { background:rgba(200,169,110,.06); }
        html[data-bs-theme="light"] .vt-search {
          background:rgba(0,0,0,.03); border-color:rgba(0,0,0,.12); color:#1a1a2e;
        }
        html[data-bs-theme="light"] .vt-search::placeholder { color:rgba(0,0,0,.3); }
        html[data-bs-theme="light"] .vt-search:focus {
          border-color:rgba(140,105,50,.4); background:rgba(255,255,255,.9);
        }
      `}</style>

      <div className="vt-root">
        <div className="vt-bg"/><div className="vt-grid"/>

        {PARTICLES.map(p => (
          <div key={p.id} className="vt-particle" style={{
            left:`${p.x}%`, bottom:`-${p.size*2}px`,
            width:p.size, height:p.size, opacity:0,
            '--drift':`${p.drift}px`,
            animationDuration:`${p.dur}s`, animationDelay:`${p.delay}s`,
          }}/>
        ))}

        <div className="vt-inner">

          {/* Back */}
          <Link to="/vocab" className="vt-back">← Vocabulary Topics</Link>

          {loading ? (
            <div className="vt-loading">
              <div className="vt-loading-spin"/>
              <span className="vt-loading-text">Loading topic...</span>
            </div>
          ) : !topic ? (
            <div className="vt-empty" style={{marginTop:40}}>
              <div className="vt-empty-icon">📖</div>
              <div className="vt-empty-text">Topic not found</div>
            </div>
          ) : (
            <>
              {/* ── HEADER ── */}
              <div className="vt-header">
                <div className="vt-header-left">
                  <div className="vt-eyebrow">💧 Vocabulary · Teyvat Academy</div>
                  <h1 className="vt-title">{topic.name}</h1>
                  <div className="vt-meta-row">
                    {topic.category && (
                      <span className="vt-category-badge">◆ {topic.category}</span>
                    )}
                    <span className="vt-word-count">✦ {cards.length} words</span>
                  </div>
                  {topic.description && (
                    <p className="vt-desc">{topic.description}</p>
                  )}
                </div>

                {cards.length > 0 && (
                  <button className="vt-practice-btn" onClick={() => navigate(`/vocab/${id}/study`)}>
                    <span>🎴</span>
                    <span>Flashcard Study</span>
                    {notDone > 0 && (
                      <span className="vt-remaining-badge">{notDone}</span>
                    )}
                  </button>
                )}
              </div>

              {/* ── PROGRESS ── */}
              {cards.length > 0 && (
                <div className="vt-progress-section">
                  <div className="vt-progress-header">
                    <span className="vt-progress-label">◆ Mastery Progress</span>
                    <span className="vt-progress-pct">{pctLearned}%</span>
                  </div>
                  <div className="vt-progress-track">
                    <div className="vt-progress-fill" style={{ width: mounted ? `${pctLearned}%` : '0%' }}/>
                  </div>

                  <div className="vt-stat-cards">
                    {[
                      { key:'learned', val:learned, meta:STATUS_META.learned },
                      { key:'hard',    val:hard,    meta:STATUS_META.hard    },
                      { key:'new',     val:newW,    meta:STATUS_META.new     },
                    ].map(s => {
                      const pct = cards.length ? Math.round(s.val / cards.length * 100) : 0;
                      return (
                        <div key={s.key} className="vt-stat-card" style={{
                          '--sc': s.meta.color,
                          borderColor:`${s.meta.color}30`,
                          background:`linear-gradient(145deg,${s.meta.bg} 0%,rgba(255,255,255,.02) 100%)`,
                        }}>
                          <div className="vt-stat-num" style={{ color:s.meta.color }}>{s.val}</div>
                          <div className="vt-stat-label" style={{ color:s.meta.color }}>
                            {s.meta.icon} {s.meta.label}
                          </div>
                          <div className="vt-stat-bar">
                            <div className="vt-stat-fill" style={{
                              width: mounted ? `${pct}%` : '0%',
                              background:s.meta.color,
                              '--sc':s.meta.color,
                            }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── SEARCH ── */}
              {cards.length > 0 && (
                <div className="vt-search-wrap">
                  <span className="vt-search-icon">🔍</span>
                  <input
                    className="vt-search-input"
                    placeholder="Search words or meanings..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              )}

              {/* ── DIVIDER ── */}
              <div className="vt-divider">
                <div className="vt-div-line"/>
                <span className="vt-div-gem">◆</span>
                <span className="vt-div-text">
                  {filtered.length} {filtered.length === 1 ? 'word' : 'words'}
                  {search ? ' found' : ' in this topic'}
                </span>
                <span className="vt-div-gem">◆</span>
                <div className="vt-div-line"/>
              </div>

              {/* ── WORD TABLE ── */}
              {cards.length === 0 ? (
                <div className="vt-empty">
                  <div className="vt-empty-icon">📖</div>
                  <div className="vt-empty-text">No words in this topic yet</div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="vt-empty">
                  <div className="vt-empty-icon">🔍</div>
                  <div className="vt-empty-text">No words match your search</div>
                </div>
              ) : (
                <div className="vt-table-panel">
                  <table className="vt-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Word</th>
                        <th>Meaning</th>
                        <th>Example</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((card, i) => {
                        const st  = STATUS_META[card.user_status] || STATUS_META.new;
                        const isH = hovRow === card.id;
                        return (
                          <tr key={card.id}
                            className={isH ? 'hov' : ''}
                            onMouseEnter={() => setHovRow(card.id)}
                            onMouseLeave={() => setHovRow(null)}>
                            <td>
                              <span className="vt-row-num">{String(i+1).padStart(2,'0')}</span>
                            </td>
                            <td>
                              <div className="vt-word">{card.word}</div>
                              {card.phonetic && (
                                <div className="vt-phonetic">/{card.phonetic}/</div>
                              )}
                            </td>
                            <td>
                              <span className="vt-meaning">{card.meaning}</span>
                            </td>
                            <td>
                              {card.example
                                ? <span className="vt-example" title={card.example}>"{card.example}"</span>
                                : <span style={{color:'var(--gold-dim)',fontSize:'.78rem'}}>—</span>}
                            </td>
                            <td>
                              <span className="vt-status-badge" style={{
                                color:st.color,
                                borderColor:`${st.color}44`,
                                background:st.bg,
                              }}>
                                {st.icon} {st.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}