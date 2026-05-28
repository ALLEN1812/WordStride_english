import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const CATEGORIES = [
  { key:'',          label:'All Topics',  icon:'✦',  color:'#c8a96e', glow:'rgba(200,169,110,.3)' },
  { key:'TOEIC',     label:'TOEIC',       icon:'⚡',  color:'#ce93d8', glow:'rgba(206,147,216,.3)' },
  { key:'IELTS',     label:'IELTS',       icon:'🌿',  color:'#81c784', glow:'rgba(129,199,132,.3)' },
  { key:'Giao tiếp', label:'Daily Talk',  icon:'💧',  color:'#4fc3f7', glow:'rgba(79,195,247,.3)'  },
  { key:'Học thuật', label:'Academic',    icon:'🔥',  color:'#ff8a65', glow:'rgba(255,138,101,.3)' },
];

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i, x: (i * 137.5) % 100,
  dur: 6 + (i % 5) * 2, delay: (i * 0.6) % 8,
  size: 1.2 + (i % 3) * 0.5,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 10),
}));

// Element colors for category icons on cards
const CAT_META = {
  'TOEIC':     { color:'#ce93d8', bg:'rgba(206,147,216,.12)', icon:'⚡' },
  'IELTS':     { color:'#81c784', bg:'rgba(129,199,132,.12)', icon:'🌿' },
  'Giao tiếp': { color:'#4fc3f7', bg:'rgba(79,195,247,.12)',  icon:'💧' },
  'Học thuật': { color:'#ff8a65', bg:'rgba(255,138,101,.12)', icon:'🔥' },
};
const DEFAULT_CAT = { color:'#c8a96e', bg:'rgba(200,169,110,.12)', icon:'◆' };

export default function VocabListPage() {
  const [topics,   setTopics]   = useState([]);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [hovCard,  setHovCard]  = useState(null);
  const [loaded,   setLoaded]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true); setLoaded(false);
    api.get('/vocab/topics', { params: { search, category: category || undefined } })
      .then(res => { setTopics(res.data.data || []); setTimeout(() => setLoaded(true), 80); })
      .finally(() => setLoading(false));
  }, [search, category]);

  const activeCat = CATEGORIES.find(c => c.key === category) || CATEGORIES[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&display=swap');
        :root{
          --gold:#c8a96e;--gold-lt:#e8d5a3;--gold-bright:#f5ecd4;--gold-dim:#7a6040;
          --navy:#060e1f;--text:#e8dcc8;--text-sub:#8a7f6a;
          --border:rgba(200,169,110,.18);--glow-gold:rgba(200,169,110,.25);
        }
        .vl-root{min-height:calc(100vh - 64px);background:var(--navy);
          font-family:'Be Vietnam Pro',sans-serif;color:var(--text);position:relative;overflow:hidden;}
        .vl-bg{position:absolute;inset:0;
          background:
            radial-gradient(ellipse 70% 50% at 25% 0%,rgba(30,55,120,.5) 0%,transparent 60%),
            radial-gradient(ellipse 55% 65% at 90% 85%,rgba(80,40,10,.3) 0%,transparent 55%);}
        .vl-grid{position:absolute;inset:0;
          background-image:linear-gradient(rgba(200,169,110,.03) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(200,169,110,.03) 1px,transparent 1px);
          background-size:52px 52px;}
        .vl-particle{position:absolute;border-radius:50%;background:var(--gold);
          animation:vlpfloat linear infinite;pointer-events:none;}
        @keyframes vlpfloat{
          0%{transform:translate(0,0);opacity:0;}8%{opacity:.6;}
          92%{opacity:.25;}100%{transform:translate(var(--drift),calc(-100% - 80px));opacity:0;}}
        .vl-inner{position:relative;z-index:2;max-width:1280px;margin:0 auto;padding:40px 28px 60px;}
        @keyframes vlreveal{to{opacity:1;transform:translateY(0);}}

        /* Header */
        .vl-header{
          display:flex;align-items:flex-start;justify-content:space-between;gap:20px;
          margin-bottom:34px;
          opacity:0;animation:vlreveal .65s cubic-bezier(.16,1,.3,1) .05s forwards;
        }
        .vl-header-left{flex:1;}
        .vl-eyebrow{font-family:'Cinzel',serif;font-size:.68rem;font-weight:600;
          letter-spacing:.28em;text-transform:uppercase;color:var(--gold-dim);
          margin-bottom:10px;display:flex;align-items:center;gap:10px;}
        .vl-eyebrow::before{content:'';display:block;width:28px;height:1px;
          background:linear-gradient(90deg,transparent,var(--gold-dim));}
        .vl-title{font-family:'Cinzel',serif;
          font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;
          color:transparent;
          background:linear-gradient(170deg,#f5ecd4 0%,#e8d5a3 30%,#c8a96e 60%,#9a7540 100%);
          -webkit-background-clip:text;background-clip:text;
          filter:drop-shadow(0 0 24px rgba(200,169,110,.4));
          letter-spacing:.08em;margin-bottom:4px;}
        .vl-subtitle{font-size:.88rem;color:var(--text-sub);}

        /* My sets button */
        .vl-mysets-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:10px 20px;border-radius:8px;border:none;cursor:pointer;
          background:linear-gradient(135deg,rgba(200,169,110,.14),rgba(200,169,110,.24),rgba(200,169,110,.14));
          border:1px solid rgba(200,169,110,.4);
          color:var(--gold-lt);
          font-family:'Be Vietnam Pro',sans-serif;font-size:.78rem;font-weight:700;
          letter-spacing:.06em;text-transform:uppercase;
          transition:all .3s;white-space:nowrap;position:relative;overflow:hidden;
        }
        .vl-mysets-btn:hover{
          border-color:rgba(200,169,110,.8);color:var(--gold-bright);
          transform:translateY(-1px);
          box-shadow:0 0 24px rgba(200,169,110,.3),inset 0 0 16px rgba(200,169,110,.06);
        }
        .vl-mysets-btn::after{
          content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
          animation:vlshimmer 3s ease infinite;
        }
        @keyframes vlshimmer{from{left:-100%}to{left:200%}}

        /* Search & filter row */
        .vl-controls{
          display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;
          opacity:0;animation:vlreveal .65s cubic-bezier(.16,1,.3,1) .12s forwards;
        }
        .vl-search-wrap{position:relative;flex:1;min-width:220px;}
        .vl-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);
          font-size:14px;color:var(--gold-dim);pointer-events:none;}
        .vl-search{width:100%;padding:11px 14px 11px 38px;
          background:rgba(255,255,255,.04);border:1px solid rgba(200,169,110,.2);
          border-radius:8px;font-family:'Be Vietnam Pro',sans-serif;font-size:14px;font-weight:400;
          color:var(--text);outline:none;transition:all .25s;}
        .vl-search::placeholder{color:rgba(138,127,106,.38);font-weight:400;}
        .vl-search:focus{border-color:rgba(200,169,110,.5);background:rgba(200,169,110,.05);
          box-shadow:0 0 0 1px rgba(200,169,110,.18),inset 0 0 16px rgba(200,169,110,.03);}

        /* Category filters */
        .vl-cats{display:flex;gap:6px;flex-wrap:wrap;
          opacity:0;animation:vlreveal .65s cubic-bezier(.16,1,.3,1) .18s forwards;}
        .vl-cat-btn{
          display:inline-flex;align-items:center;gap:6px;
          padding:7px 15px;border-radius:20px;border:1px solid;
          font-family:'Be Vietnam Pro',sans-serif;font-size:.72rem;font-weight:600;
          letter-spacing:.04em;text-transform:uppercase;cursor:pointer;
          transition:all .25s;background:transparent;
        }
        .vl-cat-btn.active{box-shadow:0 0 16px var(--fb-glow);}
        .vl-cat-btn:not(.active):hover{transform:translateY(-1px);box-shadow:0 4px 14px var(--fb-glow);}

        /* Divider */
        .vl-divider{display:flex;align-items:center;gap:12px;margin:18px 0;
          opacity:0;animation:vlreveal .65s cubic-bezier(.16,1,.3,1) .22s forwards;}
        .vl-div-line{flex:1;height:1px;background:linear-gradient(90deg,var(--border),transparent);}
        .vl-div-text{font-family:'Cinzel',serif;font-size:.65rem;letter-spacing:.22em;
          text-transform:uppercase;color:var(--gold-dim);white-space:nowrap;}
        .vl-div-gem{font-size:9px;color:var(--gold);filter:drop-shadow(0 0 4px rgba(200,169,110,.7));}

        /* Cards grid */
        .vl-grid-cards{display:grid;
          grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;}

        .vl-card-wrap{opacity:0;transform:translateY(20px);
          animation:vlreveal .6s cubic-bezier(.16,1,.3,1) forwards;}

        .vl-card{
          display:flex;flex-direction:column;
          text-decoration:none;height:100%;
          background:linear-gradient(145deg,rgba(255,255,255,.045) 0%,rgba(255,255,255,.02) 100%);
          border:1px solid var(--border);border-radius:12px;
          overflow:hidden;position:relative;
          transition:all .3s cubic-bezier(.16,1,.3,1);
          box-shadow:0 4px 20px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04);
        }
        .vl-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1.5px;
          background:linear-gradient(90deg,transparent,var(--lc,var(--gold)),transparent);
          opacity:.3;transition:opacity .3s;z-index:1;}
        .vl-card::after{content:'';position:absolute;inset:0;
          background:radial-gradient(ellipse at 50% 130%,var(--lg,rgba(200,169,110,.12)),transparent 65%);
          opacity:0;transition:opacity .35s;}
        .vl-card:hover{
          transform:translateY(-5px);
          border-color:var(--lb,rgba(200,169,110,.35));
          box-shadow:0 14px 40px rgba(0,0,0,.35),
                     var(--ls,0 0 24px rgba(200,169,110,.18)),
                     0 0 0 1px rgba(255,255,255,.03);
        }
        .vl-card:hover::before{opacity:1;}
        .vl-card:hover::after{opacity:1;}

        /* Shimmer */
        .vl-card-shimmer{
          position:absolute;top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent);
          transition:left .5s ease;pointer-events:none;z-index:2;
        }
        .vl-card:hover .vl-card-shimmer{left:150%;}

        /* Thumbnail */
        .vl-card-thumb{
          width:100%;height:120px;object-fit:cover;
          border-bottom:1px solid var(--border);
        }

        /* No-thumb placeholder */
        .vl-card-placeholder{
          height:80px;
          background:linear-gradient(135deg,rgba(200,169,110,.06),rgba(125,211,232,.04));
          display:flex;align-items:center;justify-content:center;
          font-size:28px;border-bottom:1px solid var(--border);
        }

        /* Card body */
        .vl-card-body{padding:16px 16px 12px;flex:1;display:flex;flex-direction:column;}

        /* Category badge */
        .vl-card-cat{
          display:inline-flex;align-items:center;gap:4px;
          padding:3px 9px;border-radius:12px;
          font-family:'Be Vietnam Pro',sans-serif;font-size:.65rem;font-weight:600;
          letter-spacing:.04em;border:1px solid;margin-bottom:8px;
          transition:box-shadow .3s;align-self:flex-start;
        }
        .vl-card:hover .vl-card-cat{box-shadow:0 0 10px var(--lb,rgba(200,169,110,.3));}

        /* Card title */
        .vl-card-title{
          font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-weight:600;
          color:var(--gold-lt);letter-spacing:.02em;line-height:1.3;
          margin-bottom:6px;transition:color .3s;
        }
        .vl-card:hover .vl-card-title{color:var(--gold-bright);}

        /* Card desc */
        .vl-card-desc{
          font-size:.8rem;color:var(--text-sub);line-height:1.55;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
          overflow:hidden;flex:1;
        }

        /* Card footer */
        .vl-card-footer{
          display:flex;align-items:center;justify-content:space-between;
          padding:10px 16px 12px;
          border-top:1px solid rgba(200,169,110,.07);
        }
        .vl-card-cta{
          font-family:'Be Vietnam Pro',sans-serif;font-size:.62rem;font-weight:600;
          letter-spacing:.06em;text-transform:uppercase;color:var(--gold-dim);
          display:flex;align-items:center;gap:5px;
        }
        .vl-card-arrow{
          font-size:13px;color:var(--gold-dim);opacity:0;
          transform:translateX(-5px);transition:all .3s;
        }
        .vl-card:hover .vl-card-arrow{opacity:1;transform:translateX(0);}

        /* Loading */
        .vl-loading{display:flex;flex-direction:column;align-items:center;
          justify-content:center;padding:80px;gap:16px;}
        .vl-loading-spin{width:36px;height:36px;border-radius:50%;
          border:2px solid rgba(200,169,110,.15);border-top-color:var(--gold);
          animation:vlspin .8s linear infinite;}
        @keyframes vlspin{to{transform:rotate(360deg);}}
        .vl-loading-text{font-family:'Be Vietnam Pro',sans-serif;font-size:.72rem;
          font-weight:500;letter-spacing:.14em;color:var(--gold-dim);text-transform:uppercase;}

        /* Empty */
        .vl-empty{text-align:center;padding:60px 20px;
          border:1px dashed rgba(200,169,110,.2);border-radius:10px;}
        .vl-empty-icon{font-size:40px;margin-bottom:12px;opacity:.4;}
        .vl-empty-text{font-family:'Be Vietnam Pro',sans-serif;font-size:.8rem;
          font-weight:500;letter-spacing:.12em;color:var(--gold-dim);text-transform:uppercase;}

        /* Count */
        .vl-count{font-family:'Be Vietnam Pro',sans-serif;font-size:.7rem;font-weight:600;
          letter-spacing:.08em;color:var(--gold-dim);
          display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
        .vl-count-num{color:var(--gold-lt);font-size:.88rem;}

        /* ── LIGHT MODE ── */
        html[data-bs-theme="light"] .vl-root {
          --navy:#ffffff; --text:#1a1a2e; --text-sub:#6b7280;
          --border:rgba(0,0,0,.1); --glow-gold:rgba(14,45,107,.12);
          --gold:#1a4fae; --gold-lt:#0d2d6b; --gold-bright:#4878cc; --gold-dim:#2e5cb8;
        }
        html[data-bs-theme="light"] .vl-bg {
          background:
            radial-gradient(ellipse 70% 50% at 25% 0%,rgba(200,175,110,.1) 0%,transparent 60%),
            radial-gradient(ellipse 55% 65% at 90% 85%,rgba(200,160,80,.07) 0%,transparent 55%);
        }
        html[data-bs-theme="light"] .vl-grid {
          background-image:
            linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px);
        }
        html[data-bs-theme="light"] .vl-card {
          background:linear-gradient(145deg,rgba(255,255,255,.92) 0%,rgba(248,248,248,.8) 100%);
          border-color:rgba(0,0,0,.09);
          box-shadow:0 4px 20px rgba(0,0,0,.07),inset 0 1px 0 rgba(255,255,255,1);
        }
        html[data-bs-theme="light"] .vl-card-placeholder {
          background:linear-gradient(135deg,rgba(200,169,110,.08),rgba(125,211,232,.05));
          border-bottom-color:rgba(0,0,0,.08);
        }
        html[data-bs-theme="light"] .vl-search {
          background:rgba(0,0,0,.03); border-color:rgba(0,0,0,.12); color:#1a1a2e;
        }
        html[data-bs-theme="light"] .vl-search::placeholder { color:rgba(0,0,0,.3); }
        html[data-bs-theme="light"] .vl-search:focus {
          border-color:rgba(140,105,50,.4); background:rgba(255,255,255,.9);
          box-shadow:0 0 0 1px rgba(140,105,50,.15);
        }
        html[data-bs-theme="light"] .vl-card-footer {
          border-top-color:rgba(0,0,0,.07);
        }
        html[data-bs-theme="light"] .vl-empty {
          border-color:rgba(0,0,0,.12);
        }
      `}</style>

      <div className="vl-root">
        <div className="vl-bg"/><div className="vl-grid"/>

        {PARTICLES.map(p => (
          <div key={p.id} className="vl-particle" style={{
            left:`${p.x}%`,bottom:`-${p.size*2}px`,
            width:p.size,height:p.size,opacity:0,
            '--drift':`${p.drift}px`,
            animationDuration:`${p.dur}s`,animationDelay:`${p.delay}s`,
          }}/>
        ))}

        <div className="vl-inner">

          {/* Header */}
          <div className="vl-header">
            <div className="vl-header-left">
              <div className="vl-eyebrow">Vocabulary · Teyvat Academy</div>
              <h1 className="vl-title">Word Compendium</h1>
              <p className="vl-subtitle">Choose a topic to begin your lexical journey</p>
            </div>
            <button className="vl-mysets-btn" onClick={() => navigate('/vocab/my-sets')}>
              My Flashcard Sets
            </button>
          </div>

          {/* Search + category */}
          <div className="vl-controls">
            <div className="vl-search-wrap">
              <span className="vl-search-icon">🔍</span>
              <input className="vl-search" placeholder="Search topics..."
                value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
            {!loading && topics.length > 0 && (
              <span className="vl-count">
                <span className="vl-count-num">{topics.length}</span> topics
              </span>
            )}
          </div>

          {/* Category filters */}
          <div className="vl-cats">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`vl-cat-btn ${category === c.key ? 'active' : ''}`}
                style={{
                  '--fb-glow': c.glow,
                  color:       category === c.key ? c.color : 'var(--text-sub)',
                  borderColor: category === c.key ? `${c.color}55` : 'rgba(200,169,110,.15)',
                  background:  category === c.key ? `${c.color}14` : 'transparent',
                  textShadow:  category === c.key ? `0 0 12px ${c.glow}` : 'none',
                }}>
                <span>{c.icon}</span>{c.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="vl-divider">
            <div className="vl-div-line"/>
            <span className="vl-div-gem">◆</span>
            <span className="vl-div-text">{activeCat.label}</span>
            <span className="vl-div-gem">◆</span>
            <div className="vl-div-line"/>
          </div>

          {/* Content */}
          {loading ? (
            <div className="vl-loading">
              <div className="vl-loading-spin"/>
              <span className="vl-loading-text">Loading topics...</span>
            </div>
          ) : topics.length === 0 ? (
            <div className="vl-empty">
              <div className="vl-empty-icon">📖</div>
              <div className="vl-empty-text">No topics found in this realm</div>
            </div>
          ) : (
            <div className="vl-grid-cards">
              {topics.map((t, i) => {
                const cat  = CAT_META[t.category] || DEFAULT_CAT;
                const isH  = hovCard === t.id;
                return (
                  <div key={t.id} className="vl-card-wrap" style={{ animationDelay:`${.04 + i*.055}s` }}>
                    <Link to={`/vocab/${t.id}`} className="vl-card"
                      style={{
                        '--lc': cat.color,
                        '--lg': cat.bg.replace(',.12',',0.18'),
                        '--lb': `${cat.color}55`,
                        '--ls': `0 0 24px ${cat.color}33`,
                      }}
                      onMouseEnter={() => setHovCard(t.id)}
                      onMouseLeave={() => setHovCard(null)}>
                      <div className="vl-card-shimmer"/>

                      {t.thumbnail
                        ? <img className="vl-card-thumb" src={t.thumbnail} alt={t.name}/>
                        : <div className="vl-card-placeholder">{cat.icon}</div>}

                      <div className="vl-card-body">
                        {t.category && (
                          <span className="vl-card-cat" style={{
                            color:cat.color, borderColor:`${cat.color}44`, background:cat.bg,
                          }}>
                            <span>{cat.icon}</span>{t.category}
                          </span>
                        )}
                        <div className="vl-card-title">{t.name}</div>
                        {t.description && (
                          <p className="vl-card-desc">{t.description}</p>
                        )}
                      </div>

                      <div className="vl-card-footer">
                        <span className="vl-card-cta">Study Flashcards</span>
                        <span className="vl-card-arrow">→</span>
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