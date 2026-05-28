import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const LEVEL_META = {
  beginner:     { label: 'Beginner',     color: '#81c784', bg: 'rgba(129,199,132,.12)', border: 'rgba(129,199,132,.35)', glow: 'rgba(129,199,132,.3)'  },
  intermediate: { label: 'Intermediate', color: '#ffd166', bg: 'rgba(255,209,102,.12)', border: 'rgba(255,209,102,.35)', glow: 'rgba(255,209,102,.3)'  },
  advanced:     { label: 'Advanced',     color: '#ff8a65', bg: 'rgba(255,138,101,.12)', border: 'rgba(255,138,101,.35)', glow: 'rgba(255,138,101,.3)'  },
};

const LEVELS = ['', 'beginner', 'intermediate', 'advanced'];

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i, x: (i * 137.5) % 100,
  dur: 6 + (i % 5) * 2, delay: (i * 0.6) % 8,
  size: 1.2 + (i % 3) * 0.5,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 10),
}));

export default function GrammarListPage() {
  const [lessons, setLessons] = useState([]);
  const [level,   setLevel]   = useState('');
  const [loading, setLoading] = useState(true);
  const [hovCard, setHovCard] = useState(null);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    setLoading(true); setLoaded(false);
    api.get('/grammar/lessons', { params: { level: level || undefined } })
      .then(res => { setLessons(res.data.data || []); setTimeout(() => setLoaded(true), 80); })
      .finally(() => setLoading(false));
  }, [level]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
        :root {
          --gold:#c8a96e; --gold-lt:#e8d5a3; --gold-bright:#f5ecd4; --gold-dim:#7a6040;
          --navy:#060e1f; --text:#e8dcc8; --text-sub:#8a7f6a;
          --border:rgba(200,169,110,.18);
        }
        .gl-root { min-height:calc(100vh - 64px); background:var(--navy);
          font-family:'Be Vietnam Pro',sans-serif; color:var(--text);
          position:relative; overflow:hidden; }
        .gl-bg { position:absolute; inset:0;
          background:
            radial-gradient(ellipse 70% 50% at 20% 0%, rgba(30,55,120,.5) 0%,transparent 60%),
            radial-gradient(ellipse 55% 60% at 90% 80%, rgba(80,40,10,.3) 0%,transparent 55%); }
        .gl-grid { position:absolute; inset:0;
          background-image: linear-gradient(rgba(200,169,110,.03) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(200,169,110,.03) 1px,transparent 1px);
          background-size:52px 52px; }
        .gl-particle { position:absolute; border-radius:50%; background:var(--gold);
          animation:glpfloat linear infinite; pointer-events:none; }
        @keyframes glpfloat {
          0%{transform:translate(0,0);opacity:0;} 8%{opacity:.6;}
          92%{opacity:.25;} 100%{transform:translate(var(--drift),calc(-100% - 80px));opacity:0;} }
        .gl-inner { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:40px 28px 60px; }
        @keyframes glreveal { to{opacity:1;transform:translateY(0);} }

        /* Header */
        .gl-header { margin-bottom:32px;
          opacity:0; animation:glreveal .65s cubic-bezier(.16,1,.3,1) .05s forwards; }
        .gl-eyebrow { font-family:'Cinzel',serif; font-size:.68rem; font-weight:600;
          letter-spacing:.28em; text-transform:uppercase; color:var(--gold-dim);
          margin-bottom:10px; display:flex; align-items:center; gap:10px; }
        .gl-eyebrow::before { content:''; display:block; width:28px; height:1px;
          background:linear-gradient(90deg,transparent,var(--gold-dim)); }
        .gl-title { font-family:'Cinzel',serif;
          font-size:clamp(1.6rem,3vw,2.3rem); font-weight:700;
          color:transparent;
          background:linear-gradient(170deg,#f5ecd4 0%,#e8d5a3 30%,#c8a96e 60%,#9a7540 100%);
          -webkit-background-clip:text; background-clip:text;
          filter:drop-shadow(0 0 20px rgba(200,169,110,.35));
          letter-spacing:.08em; margin-bottom:4px; }
        .gl-subtitle { font-size:.88rem; color:var(--text-sub); }

        /* Level filter */
        .gl-filters { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:28px;
          opacity:0; animation:glreveal .65s cubic-bezier(.16,1,.3,1) .12s forwards; }
        .gl-filter-btn { padding:7px 18px; border-radius:20px;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.72rem; font-weight:600;
          letter-spacing:.04em; text-transform:uppercase; cursor:pointer;
          border:1px solid; transition:all .25s; background:transparent; }
        .gl-filter-btn.active { box-shadow:0 0 14px var(--fb-glow); }

        /* Divider */
        .gl-divider { display:flex; align-items:center; gap:12px; margin:8px 0 20px;
          opacity:0; animation:glreveal .65s cubic-bezier(.16,1,.3,1) .18s forwards; }
        .gl-div-line { flex:1; height:1px; background:linear-gradient(90deg,var(--border),transparent); }
        .gl-div-text { font-family:'Cinzel',serif; font-size:.65rem; letter-spacing:.22em;
          text-transform:uppercase; color:var(--gold-dim); white-space:nowrap; }

        /* Cards grid */
        .gl-grid-cards { display:grid;
          grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }
        .gl-card-wrap { opacity:0; transform:translateY(20px);
          animation:glreveal .6s cubic-bezier(.16,1,.3,1) forwards; }

        .gl-card { display:flex; flex-direction:column;
          text-decoration:none; height:100%;
          background:linear-gradient(145deg,rgba(255,255,255,.045) 0%,rgba(255,255,255,.02) 100%);
          border:1px solid var(--border); border-radius:12px;
          overflow:hidden; position:relative;
          transition:all .3s cubic-bezier(.16,1,.3,1);
          box-shadow:0 4px 20px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04); }
        .gl-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
          background:linear-gradient(90deg,transparent,var(--lc,var(--gold)),transparent);
          opacity:.3; transition:opacity .3s; z-index:1; }
        .gl-card:hover { transform:translateY(-5px);
          border-color:var(--lb,rgba(200,169,110,.35));
          box-shadow:0 14px 40px rgba(0,0,0,.35),var(--ls,0 0 20px rgba(200,169,110,.18)),
                     0 0 0 1px rgba(255,255,255,.03); }
        .gl-card:hover::before { opacity:1; }
        .gl-card-shimmer { position:absolute; top:0; left:-100%; width:50%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent);
          transition:left .5s ease; pointer-events:none; z-index:2; }
        .gl-card:hover .gl-card-shimmer { left:150%; }

        .gl-card-body { padding:20px 18px 14px; flex:1; display:flex; flex-direction:column; }

        .gl-card-level { display:inline-flex; align-items:center; gap:5px;
          padding:3px 10px; border-radius:12px;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.65rem; font-weight:600;
          letter-spacing:.04em; border:1px solid;
          margin-bottom:10px; align-self:flex-start; transition:box-shadow .3s; }
        .gl-card:hover .gl-card-level { box-shadow:0 0 10px var(--lb); }

        .gl-card-num { font-family:'Be Vietnam Pro',sans-serif; font-size:.62rem; font-weight:600;
          letter-spacing:.06em; color:var(--gold-dim); margin-bottom:4px; }
        .gl-card-title { font-family:'Cormorant Garamond',serif; font-size:1.08rem; font-weight:600;
          color:var(--gold-lt); letter-spacing:.02em; line-height:1.3;
          margin-bottom:8px; transition:color .3s; flex:1; }
        .gl-card:hover .gl-card-title { color:var(--gold-bright); }

        .gl-card-footer { display:flex; align-items:center; justify-content:space-between;
          padding:10px 18px 14px; border-top:1px solid rgba(200,169,110,.07); }
        .gl-card-cta { font-family:'Be Vietnam Pro',sans-serif; font-size:.62rem; font-weight:600;
          letter-spacing:.06em; text-transform:uppercase; color:var(--gold-dim); }
        .gl-card-arrow { font-size:13px; color:var(--gold-dim); opacity:0;
          transform:translateX(-5px); transition:all .3s; }
        .gl-card:hover .gl-card-arrow { opacity:1; transform:translateX(0); }

        /* Loading / Empty */
        .gl-loading { display:flex; flex-direction:column; align-items:center;
          justify-content:center; padding:80px; gap:16px; }
        .gl-spin { width:36px; height:36px; border-radius:50%;
          border:2px solid rgba(200,169,110,.15); border-top-color:var(--gold);
          animation:glspin .8s linear infinite; }
        @keyframes glspin { to{transform:rotate(360deg);} }
        .gl-spin-text { font-family:'Be Vietnam Pro',sans-serif; font-size:.72rem;
          font-weight:500; letter-spacing:.14em; color:var(--gold-dim); text-transform:uppercase; }
        .gl-empty { text-align:center; padding:60px 20px;
          border:1px dashed rgba(200,169,110,.2); border-radius:10px; }
        .gl-empty-text { font-family:'Be Vietnam Pro',sans-serif; font-size:.8rem;
          font-weight:500; letter-spacing:.12em; color:var(--gold-dim); text-transform:uppercase; }

        /* Light mode */
        html[data-bs-theme="light"] .gl-root { --navy:#ffffff; --text:#1a1a2e; --text-sub:#6b7280; --border:rgba(0,0,0,.1); --glow-gold:rgba(14,45,107,.12); --gold:#1a4fae; --gold-lt:#0d2d6b; --gold-bright:#4878cc; --gold-dim:#2e5cb8; }
        html[data-bs-theme="light"] .gl-bg { background: radial-gradient(ellipse 70% 50% at 20% 0%,rgba(200,175,110,.1) 0%,transparent 60%); }
        html[data-bs-theme="light"] .gl-grid { background-image: linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px), linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px); }
        html[data-bs-theme="light"] .gl-card { background:rgba(255,255,255,.9); border-color:rgba(0,0,0,.09); box-shadow:0 4px 20px rgba(0,0,0,.07); }
        html[data-bs-theme="light"] .gl-card-footer { border-top-color:rgba(0,0,0,.07); }
      `}</style>

      <div className="gl-root">
        <div className="gl-bg"/><div className="gl-grid"/>
        {PARTICLES.map(p => (
          <div key={p.id} className="gl-particle" style={{
            left:`${p.x}%`, bottom:`-${p.size*2}px`,
            width:p.size, height:p.size, opacity:0,
            '--drift':`${p.drift}px`,
            animationDuration:`${p.dur}s`, animationDelay:`${p.delay}s`,
          }}/>
        ))}

        <div className="gl-inner">

          {/* Header */}
          <div className="gl-header">
            <div className="gl-eyebrow">Grammar · Teyvat Academy</div>
            <h1 className="gl-title">Grammar Lessons</h1>
            <p className="gl-subtitle">Master English grammar step by step</p>
          </div>

          {/* Level filters */}
          <div className="gl-filters">
            {LEVELS.map(l => {
              const meta = LEVEL_META[l] || { label: 'All Levels', color: 'var(--gold)', bg: 'rgba(200,169,110,.1)', border: 'rgba(200,169,110,.3)', glow: 'rgba(200,169,110,.3)' };
              const isActive = level === l;
              return (
                <button key={l} onClick={() => setLevel(l)}
                  className={`gl-filter-btn ${isActive ? 'active' : ''}`}
                  style={{
                    '--fb-glow': meta.glow,
                    color:       isActive ? meta.color : 'var(--text-sub)',
                    borderColor: isActive ? meta.border : 'rgba(200,169,110,.15)',
                    background:  isActive ? meta.bg     : 'transparent',
                  }}>
                  {meta.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="gl-divider">
            <div className="gl-div-line"/>
            <span style={{fontSize:9,color:'var(--gold)'}}>◆</span>
            <span className="gl-div-text">{LEVEL_META[level]?.label || 'All Levels'}</span>
            <span style={{fontSize:9,color:'var(--gold)'}}>◆</span>
            <div className="gl-div-line"/>
          </div>

          {/* Content */}
          {loading ? (
            <div className="gl-loading">
              <div className="gl-spin"/>
              <span className="gl-spin-text">Loading lessons...</span>
            </div>
          ) : lessons.length === 0 ? (
            <div className="gl-empty">
              <div className="gl-empty-text">No lessons found</div>
            </div>
          ) : (
            <div className="gl-grid-cards">
              {lessons.map((l, i) => {
                const meta = LEVEL_META[l.level] || LEVEL_META.beginner;
                return (
                  <div key={l.id} className="gl-card-wrap" style={{animationDelay:`${.04 + i*.06}s`}}>
                    <Link to={`/grammar/${l.id}`} className="gl-card"
                      style={{ '--lc': meta.color, '--lb': meta.border, '--ls': `0 0 22px ${meta.glow}` }}
                      onMouseEnter={() => setHovCard(l.id)} onMouseLeave={() => setHovCard(null)}>
                      <div className="gl-card-shimmer"/>
                      <div className="gl-card-body">
                        <span className="gl-card-level" style={{ color:meta.color, borderColor:meta.border, background:meta.bg }}>
                          {meta.label}
                        </span>
                        <div className="gl-card-num">Lesson {i + 1}</div>
                        <div className="gl-card-title">{l.title}</div>
                      </div>
                      <div className="gl-card-footer">
                        <span className="gl-card-cta">Open Lesson</span>
                        <span className="gl-card-arrow">→</span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
