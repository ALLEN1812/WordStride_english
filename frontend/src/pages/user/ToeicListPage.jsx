import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const TYPE_FILTERS = [
  { key: 'all',          label: 'Tất cả',      icon: '✦',  color: '#c8a96e', glow: 'rgba(200,169,110,.3)' },
  { key: 'full_test',    label: 'Full Test',   icon: '📋', color: '#ff8a65', glow: 'rgba(255,138,101,.3)' },
  { key: 'mini_test',    label: 'Mini Test',   icon: '⚡',  color: '#ce93d8', glow: 'rgba(206,147,216,.3)' },
  { key: 'practice_set', label: 'Practice',   icon: '🎯', color: '#4fc3f7', glow: 'rgba(79,195,247,.3)'  },
];

const DIFF_META = {
  easy:   { label: 'Easy',   color: '#81c784', bg: 'rgba(129,199,132,.12)', border: 'rgba(129,199,132,.35)' },
  medium: { label: 'Medium', color: '#ffd166', bg: 'rgba(255,209,102,.12)', border: 'rgba(255,209,102,.35)' },
  hard:   { label: 'Hard',   color: '#ff8a65', bg: 'rgba(255,138,101,.12)', border: 'rgba(255,138,101,.35)' },
};

const TYPE_META = {
  full_test:    { label: 'Full Test',    color: '#ff8a65', bg: 'rgba(255,138,101,.1)' },
  mini_test:    { label: 'Mini Test',    color: '#ce93d8', bg: 'rgba(206,147,216,.1)' },
  practice_set: { label: 'Practice Set', color: '#4fc3f7', bg: 'rgba(79,195,247,.1)'  },
};

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i, x: (i * 137.5) % 100,
  dur: 6 + (i % 5) * 2, delay: (i * 0.6) % 8,
  size: 1.2 + (i % 3) * 0.5,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 10),
}));

const TOEIC_STRUCTURE = [
  {
    skill: '🎧 Listening', color: '#4fc3f7',
    parts: [
      { part: 'Part 1', name: 'Photographs',         count: '6 câu'  },
      { part: 'Part 2', name: 'Question-Response',   count: '25 câu' },
      { part: 'Part 3', name: 'Short Conversations', count: '39 câu' },
      { part: 'Part 4', name: 'Short Talks',         count: '30 câu' },
    ],
  },
  {
    skill: '📖 Reading', color: '#81c784',
    parts: [
      { part: 'Part 5', name: 'Incomplete Sentences',    count: '30 câu' },
      { part: 'Part 6', name: 'Text Completion',         count: '16 câu' },
      { part: 'Part 7', name: 'Reading Comprehension',   count: '54 câu' },
    ],
  },
];

export default function ToeicListPage() {
  const navigate = useNavigate();
  const [tests,   setTests]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [hovCard, setHovCard] = useState(null);

  useEffect(() => {
    api.get('/toeic/tests')
      .then(r => setTests(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tests : tests.filter(t => t.type === filter);
  const activeFil = TYPE_FILTERS.find(f => f.key === filter) || TYPE_FILTERS[0];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
        :root {
          --gold:#c8a96e; --gold-lt:#e8d5a3; --gold-bright:#f5ecd4; --gold-dim:#7a6040;
          --navy:#060e1f; --text:#e8dcc8; --text-sub:#8a7f6a;
          --border:rgba(200,169,110,.18);
        }

        .tl-root { min-height:calc(100vh - 64px); background:var(--navy);
          font-family:'Be Vietnam Pro',sans-serif; color:var(--text);
          position:relative; overflow:hidden; }

        .tl-bg { position:absolute; inset:0;
          background:
            radial-gradient(ellipse 70% 50% at 20% 0%, rgba(30,55,120,.5) 0%,transparent 60%),
            radial-gradient(ellipse 55% 60% at 90% 80%, rgba(80,40,10,.3) 0%,transparent 55%); }
        .tl-grid { position:absolute; inset:0;
          background-image: linear-gradient(rgba(200,169,110,.03) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(200,169,110,.03) 1px,transparent 1px);
          background-size:52px 52px; }

        .tl-particle { position:absolute; border-radius:50%; background:var(--gold);
          animation:tlpfloat linear infinite; pointer-events:none; }
        @keyframes tlpfloat {
          0%{transform:translate(0,0);opacity:0;} 8%{opacity:.6;}
          92%{opacity:.25;} 100%{transform:translate(var(--drift),calc(-100% - 80px));opacity:0;} }

        .tl-inner { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:40px 28px 60px; }
        @keyframes tlreveal { to{opacity:1;transform:translateY(0);} }

        /* Header */
        .tl-header { margin-bottom:32px;
          opacity:0; animation:tlreveal .65s cubic-bezier(.16,1,.3,1) .05s forwards; }
        .tl-eyebrow { font-family:'Cinzel',serif; font-size:.68rem; font-weight:600;
          letter-spacing:.28em; text-transform:uppercase; color:var(--gold-dim);
          margin-bottom:10px; display:flex; align-items:center; gap:10px; }
        .tl-eyebrow::before { content:''; display:block; width:28px; height:1px;
          background:linear-gradient(90deg,transparent,var(--gold-dim)); }
        .tl-title { font-family:'Cinzel',serif;
          font-size:clamp(1.6rem,3vw,2.3rem); font-weight:700;
          color:transparent;
          background:linear-gradient(170deg,#f5ecd4 0%,#e8d5a3 30%,#c8a96e 60%,#9a7540 100%);
          -webkit-background-clip:text; background-clip:text;
          filter:drop-shadow(0 0 20px rgba(200,169,110,.35));
          letter-spacing:.08em; margin-bottom:4px; }
        .tl-subtitle { font-size:.88rem; color:var(--text-sub); }

        /* Stats row */
        .tl-stats { display:flex; gap:24px; margin-bottom:32px; flex-wrap:wrap;
          opacity:0; animation:tlreveal .65s cubic-bezier(.16,1,.3,1) .1s forwards; }
        .tl-stat { display:flex; align-items:center; gap:10px;
          background:linear-gradient(135deg,rgba(255,255,255,.04),rgba(200,169,110,.04));
          border:1px solid var(--border); border-radius:10px; padding:14px 20px; }
        .tl-stat-num { font-family:'Cinzel',serif; font-size:1.4rem; font-weight:700;
          color:var(--gold-lt); line-height:1; }
        .tl-stat-lbl { font-size:.72rem; color:var(--text-sub); margin-top:3px; }

        /* Filters */
        .tl-filters { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:28px;
          opacity:0; animation:tlreveal .65s cubic-bezier(.16,1,.3,1) .15s forwards; }
        .tl-filter-btn { padding:7px 18px; border-radius:20px;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.76rem; font-weight:600;
          letter-spacing:.02em; cursor:pointer;
          border:1px solid; transition:all .25s; background:transparent; }
        .tl-filter-btn.active { box-shadow:0 0 14px var(--fb-glow); }
        .tl-filter-count { display:flex; align-items:center; gap:6px;
          margin-left:auto; font-size:.76rem; color:var(--gold-dim);
          font-family:'Be Vietnam Pro',sans-serif; white-space:nowrap; }
        .tl-filter-count-num { color:var(--gold-lt); font-size:.9rem; font-weight:700; }

        /* Divider */
        .tl-divider { display:flex; align-items:center; gap:12px; margin:0 0 20px;
          opacity:0; animation:tlreveal .65s cubic-bezier(.16,1,.3,1) .2s forwards; }
        .tl-div-line { flex:1; height:1px; background:linear-gradient(90deg,var(--border),transparent); }
        .tl-div-text { font-family:'Cinzel',serif; font-size:.65rem; letter-spacing:.22em;
          text-transform:uppercase; color:var(--gold-dim); white-space:nowrap; }

        /* Cards grid */
        .tl-grid-cards { display:grid;
          grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:14px; }
        .tl-card-wrap { opacity:0; transform:translateY(20px);
          animation:tlreveal .6s cubic-bezier(.16,1,.3,1) forwards; }

        .tl-card { display:flex; flex-direction:column; height:100%;
          background:linear-gradient(145deg,rgba(255,255,255,.045) 0%,rgba(255,255,255,.02) 100%);
          border:1px solid var(--border); border-radius:12px;
          overflow:hidden; position:relative;
          transition:all .3s cubic-bezier(.16,1,.3,1);
          box-shadow:0 4px 20px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04); }
        .tl-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
          background:linear-gradient(90deg,transparent,var(--lc,var(--gold)),transparent);
          opacity:.35; transition:opacity .3s; z-index:1; }
        .tl-card:hover { transform:translateY(-5px);
          border-color:var(--lb,rgba(200,169,110,.35));
          box-shadow:0 14px 40px rgba(0,0,0,.35),var(--ls,0 0 20px rgba(200,169,110,.18)),
                     0 0 0 1px rgba(255,255,255,.03); }
        .tl-card:hover::before { opacity:1; }
        .tl-card-shimmer { position:absolute; top:0; left:-100%; width:50%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent);
          transition:left .5s ease; pointer-events:none; z-index:2; }
        .tl-card:hover .tl-card-shimmer { left:150%; }

        .tl-card-body { padding:20px 18px 14px; flex:1; display:flex; flex-direction:column; gap:0; }

        .tl-card-top { display:flex; align-items:flex-start; justify-content:space-between;
          margin-bottom:12px; gap:8px; }
        .tl-card-badges { display:flex; gap:6px; flex-wrap:wrap; }
        .tl-badge { display:inline-flex; align-items:center; padding:3px 10px;
          border-radius:12px; border:1px solid;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.7rem; font-weight:600;
          letter-spacing:.02em; transition:box-shadow .3s; }
        .tl-card:hover .tl-badge { box-shadow:0 0 8px var(--lb,rgba(200,169,110,.3)); }

        .tl-card-q { font-family:'Be Vietnam Pro',sans-serif; font-size:.76rem; font-weight:600;
          color:var(--gold-dim); white-space:nowrap; }

        .tl-card-title { font-family:'Be Vietnam Pro',sans-serif; font-size:1rem; font-weight:700;
          color:var(--gold-lt); letter-spacing:.01em; line-height:1.35;
          margin-bottom:8px; transition:color .3s; }
        .tl-card:hover .tl-card-title { color:var(--gold-bright); }

        .tl-card-desc { font-size:.82rem; color:var(--text-sub); line-height:1.6;
          flex:1; margin-bottom:14px;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

        /* Meta chips row */
        .tl-card-meta { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
        .tl-meta-chip { display:inline-flex; align-items:center; gap:4px;
          padding:3px 9px; border-radius:8px;
          background:rgba(200,169,110,.07); border:1px solid rgba(200,169,110,.12);
          font-size:.72rem; font-weight:500; color:var(--text-sub); }

        /* Action buttons */
        .tl-card-footer { display:flex; gap:8px;
          padding:12px 18px 16px; border-top:1px solid rgba(200,169,110,.08); }
        .tl-btn { flex:1; padding:9px 14px; border-radius:8px;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.78rem; font-weight:600;
          letter-spacing:.02em; cursor:pointer;
          transition:all .25s; border:1px solid; text-align:center; }
        .tl-btn-outline {
          background:transparent; color:var(--gold-dim); border-color:rgba(200,169,110,.3); }
        .tl-btn-outline:hover {
          background:rgba(200,169,110,.1); color:var(--gold-lt); border-color:rgba(200,169,110,.55);
          box-shadow:0 0 14px rgba(200,169,110,.15); }
        .tl-btn-solid {
          background:linear-gradient(135deg,rgba(200,169,110,.18),rgba(200,169,110,.3),rgba(200,169,110,.18));
          color:var(--gold-lt); border-color:rgba(200,169,110,.45); }
        .tl-btn-solid:hover {
          background:linear-gradient(135deg,rgba(200,169,110,.28),rgba(200,169,110,.42),rgba(200,169,110,.28));
          color:var(--gold-bright); border-color:rgba(200,169,110,.7);
          box-shadow:0 0 18px rgba(200,169,110,.25); }

        /* Empty / Loading */
        .tl-loading { display:flex; flex-direction:column; align-items:center;
          justify-content:center; padding:80px; gap:16px; }
        .tl-spin { width:36px; height:36px; border-radius:50%;
          border:2px solid rgba(200,169,110,.15); border-top-color:var(--gold);
          animation:tlspin .8s linear infinite; }
        @keyframes tlspin { to{transform:rotate(360deg);} }
        .tl-spin-text { font-family:'Be Vietnam Pro',sans-serif; font-size:.76rem;
          font-weight:500; letter-spacing:.1em; color:var(--gold-dim); text-transform:uppercase; }
        .tl-empty { text-align:center; padding:60px 20px;
          border:1px dashed rgba(200,169,110,.2); border-radius:10px; }
        .tl-empty-icon { font-size:40px; margin-bottom:12px; opacity:.4; }
        .tl-empty-text { font-family:'Be Vietnam Pro',sans-serif; font-size:.8rem;
          font-weight:500; letter-spacing:.08em; color:var(--gold-dim); }

        /* Structure panel */
        .tl-structure { margin-top:48px;
          opacity:0; animation:tlreveal .65s cubic-bezier(.16,1,.3,1) .4s forwards; }
        .tl-structure-inner {
          background:linear-gradient(145deg,rgba(255,255,255,.03),rgba(200,169,110,.03));
          border:1px solid var(--border); border-radius:12px; padding:24px 28px;
          position:relative; overflow:hidden; }
        .tl-structure-inner::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(200,169,110,.4),transparent); }
        .tl-structure-title { font-family:'Cinzel',serif; font-size:.72rem; font-weight:600;
          letter-spacing:.22em; text-transform:uppercase; color:var(--gold-dim); margin-bottom:20px;
          display:flex; align-items:center; gap:10px; }
        .tl-structure-title::before { content:''; display:block; width:20px; height:1px;
          background:var(--gold-dim); }
        .tl-structure-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        @media(max-width:640px){.tl-structure-grid{grid-template-columns:1fr;}}
        .tl-skill-label { font-size:.82rem; font-weight:700; margin-bottom:10px; }
        .tl-part-row { display:flex; justify-content:space-between; align-items:center;
          padding:7px 0; border-bottom:1px solid rgba(200,169,110,.06); }
        .tl-part-row:last-child { border-bottom:none; }
        .tl-part-name { font-size:.8rem; color:var(--text-sub); }
        .tl-part-name strong { font-weight:700; color:var(--text); }
        .tl-part-count { font-size:.76rem; font-weight:600; color:var(--gold-dim); white-space:nowrap; }

        /* Light mode */
        html[data-bs-theme="light"] .tl-root { --navy:#ffffff; --text:#1a1a2e; --text-sub:#6b7280; --border:rgba(0,0,0,.1); --gold:#1a4fae; --gold-lt:#0d2d6b; --gold-bright:#4878cc; --gold-dim:#2e5cb8; }
        html[data-bs-theme="light"] .tl-bg { background:radial-gradient(ellipse 70% 50% at 20% 0%,rgba(200,175,110,.1) 0%,transparent 60%); }
        html[data-bs-theme="light"] .tl-grid { background-image:linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px); }
        html[data-bs-theme="light"] .tl-card { background:rgba(255,255,255,.9); border-color:rgba(0,0,0,.09); box-shadow:0 4px 20px rgba(0,0,0,.07); }
        html[data-bs-theme="light"] .tl-card-footer { border-top-color:rgba(0,0,0,.07); }
        html[data-bs-theme="light"] .tl-stat { border-color:rgba(0,0,0,.09); }
        html[data-bs-theme="light"] .tl-meta-chip { background:rgba(0,0,0,.04); border-color:rgba(0,0,0,.1); }
        html[data-bs-theme="light"] .tl-structure-inner { border-color:rgba(0,0,0,.09); }
        html[data-bs-theme="light"] .tl-part-row { border-bottom-color:rgba(0,0,0,.07); }
      `}</style>

      <div className="tl-root">
        <div className="tl-bg"/><div className="tl-grid"/>
        {PARTICLES.map(p => (
          <div key={p.id} className="tl-particle" style={{
            left:`${p.x}%`, bottom:`-${p.size*2}px`,
            width:p.size, height:p.size, opacity:0,
            '--drift':`${p.drift}px`,
            animationDuration:`${p.dur}s`, animationDelay:`${p.delay}s`,
          }}/>
        ))}

        <div className="tl-inner">

          {/* Header */}
          <div className="tl-header">
            <div className="tl-eyebrow">Luyện Thi · Teyvat Academy</div>
            <h1 className="tl-title">TOEIC Practice</h1>
            <p className="tl-subtitle">Luyện thi TOEIC chuẩn định dạng ETS — Listening &amp; Reading</p>
          </div>

          {/* Stats */}
          <div className="tl-stats">
            {[['200', 'câu / Full Test'], ['120', 'phút làm bài'], ['990', 'điểm tối đa']].map(([num, lbl]) => (
              <div key={lbl} className="tl-stat">
                <div>
                  <div className="tl-stat-num">{num}</div>
                  <div className="tl-stat-lbl">{lbl}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="tl-filters">
            {TYPE_FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`tl-filter-btn ${filter === f.key ? 'active' : ''}`}
                style={{
                  '--fb-glow': f.glow,
                  color:       filter === f.key ? f.color : 'var(--text-sub)',
                  borderColor: filter === f.key ? `${f.color}55` : 'rgba(200,169,110,.15)',
                  background:  filter === f.key ? `${f.color}14` : 'transparent',
                }}>
                <span style={{marginRight:5}}>{f.icon}</span>{f.label}
              </button>
            ))}
            {!loading && (
              <span className="tl-filter-count">
                <span className="tl-filter-count-num">{filtered.length}</span> đề thi
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="tl-divider">
            <div className="tl-div-line"/>
            <span style={{fontSize:9,color:'var(--gold)'}}>◆</span>
            <span className="tl-div-text">{activeFil.label}</span>
            <span style={{fontSize:9,color:'var(--gold)'}}>◆</span>
            <div className="tl-div-line"/>
          </div>

          {/* Content */}
          {loading ? (
            <div className="tl-loading">
              <div className="tl-spin"/>
              <span className="tl-spin-text">Loading exams...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="tl-empty">
              <div className="tl-empty-icon">📋</div>
              <div className="tl-empty-text">Chưa có đề thi nào. Hãy quay lại sau.</div>
            </div>
          ) : (
            <div className="tl-grid-cards">
              {filtered.map((test, i) => {
                const diff = DIFF_META[test.difficulty] || DIFF_META.medium;
                const type = TYPE_META[test.type]       || TYPE_META.full_test;
                return (
                  <div key={test.id} className="tl-card-wrap" style={{animationDelay:`${.04 + i*.06}s`}}>
                    <div className="tl-card"
                      style={{ '--lc': diff.color, '--lb': diff.border, '--ls': `0 0 22px ${diff.color}33` }}
                      onMouseEnter={() => setHovCard(test.id)}
                      onMouseLeave={() => setHovCard(null)}>
                      <div className="tl-card-shimmer"/>

                      <div className="tl-card-body">
                        <div className="tl-card-top">
                          <div className="tl-card-badges">
                            <span className="tl-badge" style={{color:diff.color, borderColor:diff.border, background:diff.bg}}>
                              {diff.label}
                            </span>
                            <span className="tl-badge" style={{color:type.color, borderColor:`${type.color}55`, background:type.bg}}>
                              {type.label}
                            </span>
                          </div>
                          <span className="tl-card-q">{parseInt(test.question_count)||0} câu</span>
                        </div>

                        <div className="tl-card-title">{test.title}</div>
                        <p className="tl-card-desc">
                          {test.description || 'Đề thi TOEIC chuẩn ETS định dạng.'}
                        </p>

                        <div className="tl-card-meta">
                          <span className="tl-meta-chip">🎧 Listening</span>
                          <span className="tl-meta-chip">📖 Reading</span>
                          <span className="tl-meta-chip">⏱ {test.duration_minutes} phút</span>
                        </div>
                      </div>

                      <div className="tl-card-footer">
                        <button className="tl-btn tl-btn-outline"
                          onClick={() => navigate(`/toeic/${test.id}?mode=practice`)}>
                          Luyện tập
                        </button>
                        <button className="tl-btn tl-btn-solid"
                          onClick={() => navigate(`/toeic/${test.id}?mode=mock`)}>
                          Thi thử
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TOEIC Structure */}
          <div className="tl-structure">
            <div className="tl-structure-inner">
              <div className="tl-structure-title">Cấu trúc đề thi TOEIC</div>
              <div className="tl-structure-grid">
                {TOEIC_STRUCTURE.map(({ skill, color, parts }) => (
                  <div key={skill}>
                    <div className="tl-skill-label" style={{color}}>{skill}</div>
                    {parts.map(({ part, name, count }) => (
                      <div key={part} className="tl-part-row">
                        <span className="tl-part-name">
                          <strong>{part}</strong> — {name}
                        </span>
                        <span className="tl-part-count">{count}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
