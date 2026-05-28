import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const LEVEL_META = {
  beginner:     { label: 'Beginner',     color: '#81c784', bg: 'rgba(129,199,132,.12)', border: 'rgba(129,199,132,.35)' },
  intermediate: { label: 'Intermediate', color: '#ffd166', bg: 'rgba(255,209,102,.12)', border: 'rgba(255,209,102,.35)' },
  advanced:     { label: 'Advanced',     color: '#ff8a65', bg: 'rgba(255,138,101,.12)', border: 'rgba(255,138,101,.35)' },
};

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function GrammarLessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson,  setLesson]  = useState(null);
  const [tab,     setTab]     = useState('theory');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/grammar/lessons/${id}`)
      .then(res => setLesson(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'calc(100vh - 64px)',background:'var(--page-bg, #060e1f)'}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:'2px solid rgba(200,169,110,.15)',borderTopColor:'#c8a96e',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  if (!lesson) return (
    <div className="container py-4">
      <div className="alert alert-danger">Không tìm thấy bài học</div>
    </div>
  );

  const meta       = LEVEL_META[lesson.level] || LEVEL_META.beginner;
  const ytId       = getYoutubeId(lesson.youtube_url);
  const sections   = lesson.sections || [];
  const hasSections = sections.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
        :root { --gold:#c8a96e; --gold-lt:#e8d5a3; --gold-bright:#f5ecd4; --gold-dim:#7a6040; --navy:#060e1f; --text:#e8dcc8; --text-sub:#8a7f6a; --border:rgba(200,169,110,.18); }

        .glp-root { min-height:calc(100vh - 64px); background:var(--navy); font-family:'Be Vietnam Pro',sans-serif; color:var(--text); }
        .glp-inner { max-width:900px; margin:0 auto; padding:36px 24px 60px; }

        /* Back */
        .glp-back { display:inline-flex; align-items:center; gap:8px;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.72rem; font-weight:600;
          letter-spacing:.06em; text-transform:uppercase; color:var(--gold-dim);
          text-decoration:none; border:1px solid rgba(200,169,110,.18); border-radius:6px;
          padding:7px 14px; margin-bottom:28px; transition:all .25s; }
        .glp-back:hover { color:var(--gold-lt); border-color:rgba(200,169,110,.4); background:rgba(200,169,110,.06); }

        /* Header */
        .glp-header { margin-bottom:28px; }
        .glp-level { display:inline-flex; align-items:center; gap:5px; padding:4px 12px;
          border-radius:20px; font-family:'Be Vietnam Pro',sans-serif; font-size:.68rem; font-weight:600;
          letter-spacing:.05em; border:1px solid; margin-bottom:12px; }
        .glp-title { font-family:'Cormorant Garamond',serif; font-size:clamp(1.5rem,2.8vw,2.1rem); font-weight:600;
          color:var(--gold-lt); letter-spacing:.03em; line-height:1.2; }

        /* Tabs */
        .glp-tabs { display:flex; gap:2px; margin-bottom:24px;
          border-bottom:1px solid var(--border); }
        .glp-tab { padding:10px 20px; background:none; border:none; cursor:pointer;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.88rem; font-weight:600;
          color:var(--text-sub); letter-spacing:.04em; position:relative; transition:color .2s; }
        .glp-tab::after { content:''; position:absolute; bottom:-1px; left:0; right:0; height:2px;
          background:var(--gold); transform:scaleX(0); transition:transform .25s; border-radius:2px; }
        .glp-tab.active { color:var(--gold-lt); }
        .glp-tab.active::after { transform:scaleX(1); }
        .glp-tab:hover:not(.active) { color:var(--text); }

        /* Theory panel */
        .glp-panel { background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(200,169,110,.025));
          border:1px solid var(--border); border-radius:12px; padding:28px;
          position:relative; overflow:hidden;
          box-shadow:inset 0 1px 0 rgba(200,169,110,.1),0 8px 32px rgba(0,0,0,.25); }
        .glp-panel::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(200,169,110,.4),transparent); }
        .glp-theory-content { line-height:1.85; color:var(--text); font-size:.94rem; }
        .glp-theory-content h1,.glp-theory-content h2,.glp-theory-content h3 {
          font-family:'Cormorant Garamond',serif; font-weight:600; color:var(--gold-lt); margin-top:1.5em; }
        .glp-theory-content table { width:100%; border-collapse:collapse; margin:1em 0; }
        .glp-theory-content th,.glp-theory-content td {
          border:1px solid var(--border); padding:10px 14px; }
        .glp-theory-content th { background:rgba(200,169,110,.1); color:var(--gold); }
        .glp-theory-content code { background:rgba(200,169,110,.08); padding:2px 8px;
          border-radius:4px; font-size:.85em; color:var(--gold-lt); }
        .glp-theory-content blockquote { border-left:3px solid var(--gold);
          padding:8px 16px; margin:1em 0; background:rgba(200,169,110,.05);
          border-radius:0 6px 6px 0; color:var(--text-sub); }

        /* YouTube */
        .glp-yt-wrap { margin-top:28px; }
        .glp-yt-label { font-family:'Be Vietnam Pro',sans-serif; font-size:.7rem; font-weight:600;
          letter-spacing:.14em; text-transform:uppercase; color:var(--gold-dim); margin-bottom:12px;
          display:flex; align-items:center; gap:10px; }
        .glp-yt-label::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,var(--border),transparent); }
        .glp-yt-frame { width:100%; aspect-ratio:16/9; border-radius:10px; overflow:hidden;
          border:1px solid var(--border); box-shadow:0 4px 24px rgba(0,0,0,.4); }
        .glp-yt-frame iframe { width:100%; height:100%; border:none; }

        /* Exercises — section cards */
        .glp-sections { display:flex; flex-direction:column; gap:12px; }
        .glp-section-card { display:flex; align-items:center; gap:16px;
          background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(200,169,110,.02));
          border:1px solid var(--border); border-radius:10px; padding:16px 20px;
          text-decoration:none; cursor:pointer; transition:all .25s; position:relative; overflow:hidden; }
        .glp-section-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1.5px;
          background:linear-gradient(90deg,transparent,var(--gold),transparent); opacity:0; transition:opacity .3s; }
        .glp-section-card.unlocked:hover { border-color:rgba(200,169,110,.4); transform:translateX(4px);
          box-shadow:0 4px 24px rgba(0,0,0,.3),0 0 16px rgba(200,169,110,.12); }
        .glp-section-card.unlocked:hover::before { opacity:1; }
        .glp-section-card.locked { opacity:.5; cursor:not-allowed; }

        .glp-sec-order { width:40px; height:40px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.85rem; font-weight:800; }
        .glp-sec-info { flex:1; min-width:0; }
        .glp-sec-title { font-family:'Cormorant Garamond',serif; font-size:1rem; font-weight:600;
          color:var(--gold-lt); letter-spacing:.02em; margin-bottom:3px; }
        .glp-sec-desc { font-size:.8rem; color:var(--text-sub); }
        .glp-sec-meta { display:flex; align-items:center; gap:8px; font-size:.72rem; color:var(--text-sub); flex-shrink:0; }
        .glp-sec-score { padding:3px 10px; border-radius:10px;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.68rem; font-weight:600; }
        .glp-sec-arrow { font-size:14px; color:var(--gold-dim); opacity:0; transition:all .25s; }
        .glp-section-card.unlocked:hover .glp-sec-arrow { opacity:1; transform:translateX(3px); }
        .glp-sec-lock { font-size:13px; color:var(--text-sub); opacity:.6; }

        /* "Start exercises" CTA on theory tab */
        .glp-cta { display:inline-flex; align-items:center; gap:8px; margin-top:24px;
          padding:11px 22px; border-radius:8px; cursor:pointer;
          background:linear-gradient(135deg,rgba(200,169,110,.14),rgba(200,169,110,.24));
          border:1px solid rgba(200,169,110,.4); color:var(--gold-lt);
          font-family:'Be Vietnam Pro',sans-serif; font-size:.78rem; font-weight:700; letter-spacing:.08em;
          text-transform:uppercase; transition:all .3s; }
        .glp-cta:hover { border-color:rgba(200,169,110,.8); color:var(--gold-bright);
          box-shadow:0 0 20px rgba(200,169,110,.25); transform:translateY(-1px); }

        /* Light mode */
        html[data-bs-theme="light"] .glp-root { --navy:#ffffff; --text:#1a1a2e; --text-sub:#6b7280; --border:rgba(0,0,0,.1); --glow-gold:rgba(14,45,107,.12); --gold:#1a4fae; --gold-lt:#0d2d6b; --gold-bright:#4878cc; --gold-dim:#2e5cb8; }
        html[data-bs-theme="light"] .glp-panel { background:rgba(255,255,255,.9); border-color:rgba(0,0,0,.1); box-shadow:0 4px 20px rgba(0,0,0,.07); }
        html[data-bs-theme="light"] .glp-theory-content th { background:rgba(200,169,110,.08); }
        html[data-bs-theme="light"] .glp-section-card { background:rgba(255,255,255,.9); border-color:rgba(0,0,0,.1); }
      `}</style>

      <div className="glp-root">
        <div className="glp-inner">
          <Link to="/grammar" className="glp-back">← Grammar Lessons</Link>

          <div className="glp-header">
            <div className="glp-level" style={{ color:meta.color, borderColor:meta.border, background:meta.bg }}>
              {meta.label}
            </div>
            <h1 className="glp-title">{lesson.title}</h1>
          </div>

          {/* Tab bar */}
          <div className="glp-tabs">
            <button className={`glp-tab ${tab === 'theory' ? 'active' : ''}`} onClick={() => setTab('theory')}>
              Theory
            </button>
            {hasSections && (
              <button className={`glp-tab ${tab === 'exercises' ? 'active' : ''}`} onClick={() => setTab('exercises')}>
                Exercises {sections.length > 0 && `(${sections.length})`}
              </button>
            )}
          </div>

          {/* Theory tab */}
          {tab === 'theory' && (
            <div>
              <div className="glp-panel">
                <div className="glp-theory-content" dangerouslySetInnerHTML={{ __html: lesson.content }}/>
              </div>

              {/* YouTube embed */}
              {ytId && (
                <div className="glp-yt-wrap">
                  <div className="glp-yt-label">Video Reference</div>
                  <div className="glp-yt-frame">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="Grammar video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {hasSections && (
                <button className="glp-cta" onClick={() => setTab('exercises')}>
                  Practice Exercises →
                </button>
              )}
            </div>
          )}

          {/* Exercises tab */}
          {tab === 'exercises' && hasSections && (
            <div className="glp-sections">
              {sections.map((s, i) => {
                const scorePct  = s.best_score;
                const passed    = scorePct !== null && scorePct >= 60;
                const scoreColor = scorePct === null ? 'var(--text-sub)' : scorePct >= 90 ? '#81c784' : scorePct >= 60 ? '#ffd166' : '#ff8a65';

                return s.is_unlocked ? (
                  <Link key={s.id} to={`/grammar/${id}/section/${s.id}`} className="glp-section-card unlocked">
                    <div className="glp-sec-order" style={{
                      background: passed ? 'rgba(129,199,132,.15)' : 'rgba(200,169,110,.1)',
                      border: `1.5px solid ${passed ? 'rgba(129,199,132,.4)' : 'rgba(200,169,110,.3)'}`,
                      color: passed ? '#81c784' : 'var(--gold-lt)',
                    }}>
                      {passed ? '✓' : i + 1}
                    </div>
                    <div className="glp-sec-info">
                      <div className="glp-sec-title">{s.title}</div>
                      {s.description && <div className="glp-sec-desc">{s.description}</div>}
                    </div>
                    <div className="glp-sec-meta">
                      {s.question_count > 0 && (
                        <span style={{fontSize:'.72rem',color:'var(--text-sub)'}}>{s.question_count} câu</span>
                      )}
                      {scorePct !== null && (
                        <span className="glp-sec-score" style={{
                          color: scoreColor,
                          background: `${scoreColor}18`,
                          border: `1px solid ${scoreColor}44`,
                        }}>
                          {Math.round(scorePct)}%
                        </span>
                      )}
                      <span className="glp-sec-arrow">→</span>
                    </div>
                  </Link>
                ) : (
                  <div key={s.id} className="glp-section-card locked">
                    <div className="glp-sec-order" style={{
                      background:'rgba(255,255,255,.04)',
                      border:'1.5px solid rgba(200,169,110,.15)',
                      color:'var(--text-sub)',
                    }}>
                      {i + 1}
                    </div>
                    <div className="glp-sec-info">
                      <div className="glp-sec-title">{s.title}</div>
                      <div className="glp-sec-desc">Hoàn thành phần trước ≥ 60% để mở khóa</div>
                    </div>
                    <div className="glp-sec-meta">
                      <span className="glp-sec-lock">🔒</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'exercises' && !hasSections && (
            <div className="glp-panel" style={{textAlign:'center', padding:'40px'}}>
              <p style={{color:'var(--text-sub)', marginBottom:0}}>Bài học này chưa có bài tập. Quay lại sau nhé!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
