import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const speak = useCallback((text, rate = 0.88) => {
    if (!synth || !text) return;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = 'en-US';
    utt.rate  = rate;
    utt.pitch = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    synth.speak(utt);
  }, [synth]);

  const cancel = useCallback(() => { synth?.cancel(); setSpeaking(false); }, [synth]);

  useEffect(() => () => synth?.cancel(), [synth]);

  return { speak, cancel, speaking };
}

const MAX_NEW_PER_DAY = 20;

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

function buildQuiz(reviewed, pool) {
  if (reviewed.length < 2) return [];
  return shuffle(reviewed).slice(0, 10).map(card => {
    const wrongs = shuffle(pool.filter(c => c.id !== card.id)).slice(0, 3).map(c => c.meaning);
    while (wrongs.length < 3) wrongs.push('—');
    return { word: card.word, correct: card.meaning, options: shuffle([card.meaning, ...wrongs]) };
  });
}

const RATING_BTNS = [
  { key:'easy',   icon:'✓',  label:'Easy',    sublabel:'Mark as learned', color:'#81c784', glow:'rgba(129,199,132,.4)', border:'rgba(129,199,132,.4)' },
  { key:'medium', icon:'◆',  label:'Medium',  sublabel:'Keep reviewing',  color:'#ffd166', glow:'rgba(255,209,102,.4)', border:'rgba(255,209,102,.4)' },
  { key:'hard',   icon:'✦',  label:'Hard',    sublabel:'Need more study', color:'#ff8a65', glow:'rgba(255,138,101,.4)', border:'rgba(255,138,101,.4)' },
  { key:'skip',   icon:'→',  label:'Skip',    sublabel:'Already know it', color:'#7dd3e8', glow:'rgba(125,211,232,.4)', border:'rgba(125,211,232,.4)' },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i, x: (i * 137.5) % 100,
  dur: 7 + (i % 4) * 2, delay: (i * 0.7) % 9,
  size: 1.2 + (i % 3) * 0.5,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 12),
}));

const STATUS_META = {
  hard:    { label:'Hard Word',  color:'#ff8a65', bg:'rgba(255,138,101,.1)',  icon:'⚡' },
  learned: { label:'Learned',   color:'#81c784', bg:'rgba(129,199,132,.1)',  icon:'✓' },
  new:     { label:'New Word',  color:'#7dd3e8', bg:'rgba(125,211,232,.08)', icon:'✦' },
};

function SharedBg({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&display=swap');
        :root{
          --gold:#c8a96e;--gold-lt:#e8d5a3;--gold-bright:#f5ecd4;--gold-dim:#7a6040;
          --navy:#060e1f;--text:#e8dcc8;--text-sub:#8a7f6a;
          --border:rgba(200,169,110,.18);--glow-gold:rgba(200,169,110,.25);
        }
        .vs-root{min-height:calc(100vh - 64px);background:var(--navy);
          font-family:'Be Vietnam Pro',sans-serif;color:var(--text);position:relative;overflow:hidden;}
        .vs-bg{position:absolute;inset:0;
          background:
            radial-gradient(ellipse 70% 55% at 25% 0%,rgba(30,55,120,.5) 0%,transparent 60%),
            radial-gradient(ellipse 55% 60% at 85% 85%,rgba(80,40,10,.3) 0%,transparent 55%);}
        .vs-grid{position:absolute;inset:0;
          background-image:linear-gradient(rgba(200,169,110,.03) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(200,169,110,.03) 1px,transparent 1px);
          background-size:52px 52px;}
        .vs-particle{position:absolute;border-radius:50%;background:var(--gold);
          animation:vspfloat linear infinite;pointer-events:none;}
        @keyframes vspfloat{
          0%{transform:translate(0,0);opacity:0;}8%{opacity:.6;}
          92%{opacity:.25;}100%{transform:translate(var(--drift),calc(-100% - 80px));opacity:0;}}
        .vs-inner{position:relative;z-index:2;max-width:760px;margin:0 auto;padding:36px 24px 60px;}
        @keyframes vsreveal{to{opacity:1;transform:translateY(0);}}
        .vs-back{
          display:inline-flex;align-items:center;gap:8px;
          font-family:'Cinzel',serif;font-size:.72rem;font-weight:600;
          letter-spacing:.14em;text-transform:uppercase;
          color:var(--gold-dim);text-decoration:none;
          border:1px solid rgba(200,169,110,.18);border-radius:6px;
          padding:7px 14px;margin-bottom:28px;transition:all .25s;
          opacity:0;animation:vsreveal .6s cubic-bezier(.16,1,.3,1) .05s forwards;
        }
        .vs-back:hover{color:var(--gold-lt);border-color:rgba(200,169,110,.4);
          background:rgba(200,169,110,.06);transform:translateX(-3px);}
        .vs-panel{
          background:linear-gradient(145deg,rgba(255,255,255,.04) 0%,rgba(200,169,110,.025) 100%);
          border:1px solid var(--border);border-radius:12px;padding:28px;
          position:relative;overflow:hidden;
          box-shadow:inset 0 1px 0 rgba(200,169,110,.1),0 8px 32px rgba(0,0,0,.25);
        }
        .vs-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,rgba(200,169,110,.45),transparent);}
        .vs-loading{display:flex;flex-direction:column;align-items:center;
          justify-content:center;min-height:400px;gap:16px;}
        .vs-loading-spin{width:36px;height:36px;border-radius:50%;
          border:2px solid rgba(200,169,110,.15);border-top-color:var(--gold);
          animation:vsspin .8s linear infinite;}
        @keyframes vsspin{to{transform:rotate(360deg);}}
        .vs-loading-text{font-family:'Cinzel',serif;font-size:.72rem;
          letter-spacing:.22em;color:var(--gold-dim);text-transform:uppercase;}

        /* ── LIGHT MODE ── */
        html[data-bs-theme="light"] .vs-root {
          --navy:#ffffff; --text:#1a1a2e; --text-sub:#6b7280;
          --border:rgba(0,0,0,.1); --glow-gold:rgba(14,45,107,.12);
          --gold:#1a4fae; --gold-lt:#0d2d6b; --gold-bright:#4878cc; --gold-dim:#2e5cb8;
        }
        html[data-bs-theme="light"] .vs-bg {
          background:
            radial-gradient(ellipse 70% 55% at 25% 0%,rgba(200,175,110,.1) 0%,transparent 60%),
            radial-gradient(ellipse 55% 60% at 85% 85%,rgba(200,160,80,.07) 0%,transparent 55%);
        }
        html[data-bs-theme="light"] .vs-grid {
          background-image:
            linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px);
        }
        html[data-bs-theme="light"] .vs-panel {
          background:rgba(255,255,255,.9); border-color:rgba(0,0,0,.1);
          box-shadow:0 4px 20px rgba(0,0,0,.07);
        }
      `}</style>
      <div className="vs-root">
        <div className="vs-bg"/><div className="vs-grid"/>
        {PARTICLES.map(p => (
          <div key={p.id} className="vs-particle" style={{
            left:`${p.x}%`,bottom:`-${p.size*2}px`,
            width:p.size,height:p.size,opacity:0,
            '--drift':`${p.drift}px`,
            animationDuration:`${p.dur}s`,animationDelay:`${p.delay}s`,
          }}/>
        ))}
        {children}
      </div>
    </>
  );
}

export default function VocabStudyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { speak, cancel, speaking } = useTTS();

  const [topic,    setTopic]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [phase,    setPhase]    = useState('flash');
  const [session,  setSession]  = useState([]);
  const [idx,      setIdx]      = useState(0);
  const [flipped,  setFlipped]  = useState(false);
  const [ratings,  setRatings]  = useState({});
  const [reviewed, setReviewed] = useState([]);
  const [questions,setQuestions]= useState([]);
  const [answers,  setAnswers]  = useState({});
  const [submitted,setSubmitted]= useState(false);

  useEffect(() => {
    api.get(`/vocab/topics/${id}`)
      .then(res => {
        const data = res.data.data;
        setTopic(data);
        const all  = data.flashcards || [];
        const hard = all.filter(c => c.user_status === 'hard');
        const newC = all.filter(c => c.user_status === 'new').slice(0, MAX_NEW_PER_DAY);
        setSession([...hard, ...newC]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const current = session[idx];

  // Auto-speak word when card changes
  useEffect(() => {
    if (phase === 'flash' && current?.word) {
      const t = setTimeout(() => speak(current.word), 280);
      return () => clearTimeout(t);
    }
  }, [idx, phase, current?.word]);

  const markCard = useCallback(async (cardId, status) => {
    await api.put(`/vocab/flashcards/${cardId}/progress`, { status }).catch(() => {});
  }, []);

  const rate = async (rating) => {
    if (!current) return;
    cancel();
    setRatings(r => ({ ...r, [current.id]: rating }));
    setReviewed(prev => prev.find(c => c.id === current.id) ? prev : [...prev, current]);
    if (rating === 'easy' || rating === 'skip') await markCard(current.id, 'learned');
    else if (rating === 'hard') await markCard(current.id, 'hard');
    goNext();
  };

  const goNext = () => {
    setFlipped(false);
    if (idx + 1 >= session.length) {
      const allCards = topic?.flashcards || [];
      const qs = buildQuiz(reviewed.length > 0 ? reviewed : session, allCards);
      setQuestions(qs);
      setPhase(qs.length > 0 ? 'quiz' : 'result');
    } else {
      setIdx(i => i + 1);
    }
  };

  const goPrev = () => { setFlipped(false); setIdx(i => Math.max(i - 1, 0)); };

  const quizScore = submitted
    ? questions.filter((q, i) => answers[i] === q.correct).length : 0;

  // ── LOADING ──
  if (loading) return (
    <SharedBg>
      <div className="vs-inner">
        <div className="vs-loading">
          <div className="vs-loading-spin"/>
          <span className="vs-loading-text">Preparing your session...</span>
        </div>
      </div>
    </SharedBg>
  );

  // ── ALL DONE (no cards left) ──
  if (!loading && session.length === 0) return (
    <SharedBg>
      <style>{`
        .vs-complete{text-align:center;padding:60px 20px;
          opacity:0;animation:vsreveal .7s cubic-bezier(.16,1,.3,1) .1s forwards;}
        .vs-complete-icon{font-size:56px;margin-bottom:16px;
          filter:drop-shadow(0 0 20px rgba(200,169,110,.5));}
        .vs-complete-title{font-family:'Cinzel',serif;font-size:1.5rem;font-weight:700;
          color:var(--gold-lt);letter-spacing:.08em;margin-bottom:8px;}
        .vs-complete-sub{font-size:.9rem;color:var(--text-sub);margin-bottom:28px;}
        .vs-btn-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
        .vs-btn{
          padding:11px 22px;border-radius:8px;border:none;cursor:pointer;
          font-family:'Cinzel',serif;font-size:.78rem;font-weight:600;
          letter-spacing:.14em;text-transform:uppercase;transition:all .25s;
          position:relative;overflow:hidden;
        }
        .vs-btn.outline{
          background:transparent;border:1px solid rgba(200,169,110,.35);color:var(--gold-dim);
        }
        .vs-btn.outline:hover{border-color:rgba(200,169,110,.7);color:var(--gold-lt);
          background:rgba(200,169,110,.06);}
        .vs-btn.primary{
          background:linear-gradient(135deg,rgba(200,169,110,.18),rgba(200,169,110,.3),rgba(200,169,110,.18));
          border:1px solid rgba(200,169,110,.5);color:var(--gold-lt);
        }
        .vs-btn.primary:hover{border-color:rgba(200,169,110,.85);color:var(--gold-bright);
          box-shadow:0 0 24px rgba(200,169,110,.3);transform:translateY(-1px);}
        .vs-btn::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
          animation:vsbtnshimmer 3s ease infinite;}
        @keyframes vsbtnshimmer{from{left:-100%}to{left:200%}}
      `}</style>
      <div className="vs-inner">
        <Link to={`/vocab/${id}`} className="vs-back">← Topic Overview</Link>
        <div className="vs-complete">
          <div className="vs-complete-icon">✦</div>
          <div className="vs-complete-title">All Words Mastered!</div>
          <div className="vs-complete-sub">No new or hard words remain in this topic.</div>
          <div className="vs-btn-row">
            <button className="vs-btn outline" onClick={() => navigate(`/vocab/${id}`)}>View Word List</button>
            <button className="vs-btn primary" onClick={() => navigate('/vocab')}>Explore Topics</button>
          </div>
        </div>
      </div>
    </SharedBg>
  );

  // ── RESULT PHASE ──
  if (phase === 'result') {
    const easyC = Object.values(ratings).filter(r => r==='easy').length;
    const hardC = Object.values(ratings).filter(r => r==='hard').length;
    const medC  = Object.values(ratings).filter(r => r==='medium').length;
    return (
      <SharedBg>
        <style>{`
          .vs-result-wrap{opacity:0;animation:vsreveal .7s cubic-bezier(.16,1,.3,1) .1s forwards;}
          .vs-result-icon{font-size:52px;text-align:center;margin-bottom:14px;
            filter:drop-shadow(0 0 20px rgba(200,169,110,.5));}
          .vs-result-title{font-family:'Cinzel',serif;font-size:1.4rem;font-weight:700;
            color:var(--gold-lt);letter-spacing:.08em;text-align:center;margin-bottom:20px;}
          .vs-result-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;}
          .vs-result-stat{border:1px solid;border-radius:10px;padding:16px;text-align:center;
            transition:transform .25s;}
          .vs-result-stat:hover{transform:translateY(-2px);}
          .vs-result-stat-num{font-family:'Cinzel',serif;font-size:1.8rem;font-weight:900;
            line-height:1;margin-bottom:4px;}
          .vs-result-stat-label{font-size:.72rem;letter-spacing:.08em;}
          .vs-btn-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}
          .vs-btn{padding:11px 22px;border-radius:8px;border:none;cursor:pointer;
            font-family:'Cinzel',serif;font-size:.78rem;font-weight:600;
            letter-spacing:.14em;text-transform:uppercase;transition:all .25s;
            position:relative;overflow:hidden;}
          .vs-btn.outline{background:transparent;border:1px solid rgba(200,169,110,.35);color:var(--gold-dim);}
          .vs-btn.outline:hover{border-color:rgba(200,169,110,.7);color:var(--gold-lt);background:rgba(200,169,110,.06);}
          .vs-btn.primary{
            background:linear-gradient(135deg,rgba(200,169,110,.18),rgba(200,169,110,.3),rgba(200,169,110,.18));
            border:1px solid rgba(200,169,110,.5);color:var(--gold-lt);}
          .vs-btn.primary:hover{border-color:rgba(200,169,110,.85);color:var(--gold-bright);
            box-shadow:0 0 24px rgba(200,169,110,.3);transform:translateY(-1px);}
          .vs-btn::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
            animation:vsbtnshimmer 3s ease infinite;}
          @keyframes vsbtnshimmer{from{left:-100%}to{left:200%}}
        `}</style>
        <div className="vs-inner">
          <Link to={`/vocab/${id}`} className="vs-back">← Topic Overview</Link>
          <div className="vs-panel">
            <div className="vs-result-wrap">
              <div className="vs-result-icon">🎉</div>
              <div className="vs-result-title">Session Complete!</div>
              <div className="vs-result-stats">
                {[
                  { label:'Easy',   val:easyC, color:'#81c784', glow:'rgba(129,199,132,.15)', border:'rgba(129,199,132,.3)' },
                  { label:'Medium', val:medC,  color:'#ffd166', glow:'rgba(255,209,102,.15)', border:'rgba(255,209,102,.3)' },
                  { label:'Hard',   val:hardC, color:'#ff8a65', glow:'rgba(255,138,101,.15)', border:'rgba(255,138,101,.3)' },
                ].map(s => (
                  <div key={s.label} className="vs-result-stat" style={{
                    borderColor:s.border, background:s.glow,
                  }}>
                    <div className="vs-result-stat-num" style={{color:s.color}}>{s.val}</div>
                    <div className="vs-result-stat-label" style={{color:s.color}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="vs-btn-row">
                <button className="vs-btn outline" onClick={() => navigate(`/vocab/${id}`)}>Word List</button>
                <button className="vs-btn primary" onClick={() => navigate('/vocab')}>Explore Topics</button>
              </div>
            </div>
          </div>
        </div>
      </SharedBg>
    );
  }

  // ── QUIZ PHASE ──
  if (phase === 'quiz') {
    const answeredQ = Object.keys(answers).length;
    const scoreColor = submitted
      ? quizScore >= questions.length * .8 ? '#81c784'
        : quizScore >= questions.length * .5 ? '#ffd166' : '#ff8a65'
      : null;

    return (
      <SharedBg>
        <style>{`
          .vsq-header{margin-bottom:22px;opacity:0;animation:vsreveal .65s cubic-bezier(.16,1,.3,1) .1s forwards;}
          .vsq-eyebrow{font-family:'Cinzel',serif;font-size:.68rem;font-weight:600;
            letter-spacing:.28em;text-transform:uppercase;color:var(--gold-dim);
            margin-bottom:8px;display:flex;align-items:center;gap:10px;}
          .vsq-eyebrow::before{content:'';display:block;width:24px;height:1px;
            background:linear-gradient(90deg,transparent,var(--gold-dim));}
          .vsq-title{font-family:'Cinzel',serif;font-size:1.5rem;font-weight:700;
            color:var(--gold-lt);letter-spacing:.08em;margin-bottom:4px;}
          .vsq-sub{font-size:.85rem;color:var(--text-sub);}

          /* Progress */
          .vsq-prog-row{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
          .vsq-prog-bar{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.07);}
          .vsq-prog-fill{height:100%;border-radius:2px;
            background:linear-gradient(90deg,var(--gold-dim),var(--gold));
            box-shadow:0 0 8px rgba(200,169,110,.4);transition:width .4s cubic-bezier(.16,1,.3,1);}
          .vsq-prog-text{font-family:'Cinzel',serif;font-size:.68rem;letter-spacing:.12em;
            color:var(--gold-dim);white-space:nowrap;}

          /* Result banner */
          .vsq-result-banner{
            border-radius:10px;padding:20px 24px;margin-bottom:18px;border:1px solid;
            position:relative;overflow:hidden;opacity:0;animation:vsreveal .5s forwards;
          }
          .vsq-result-banner::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
            background:linear-gradient(90deg,transparent,var(--rc),transparent);}
          .vsq-result-top{display:flex;align-items:center;gap:16px;margin-bottom:10px;}
          .vsq-result-score{font-family:'Cinzel',serif;font-size:2.4rem;font-weight:900;line-height:1;}
          .vsq-result-label{font-family:'Cinzel',serif;font-size:.78rem;letter-spacing:.15em;text-transform:uppercase;margin-bottom:3px;}
          .vsq-result-detail{font-size:.85rem;color:var(--text-sub);}
          .vsq-result-bar{height:4px;border-radius:2px;background:rgba(255,255,255,.08);}
          .vsq-result-fill{height:100%;border-radius:2px;transition:width 1s cubic-bezier(.16,1,.3,1);}

          /* Questions */
          .vsq-q{
            background:linear-gradient(145deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.02) 100%);
            border:1px solid var(--border);border-radius:10px;padding:20px 22px 18px;
            margin-bottom:12px;position:relative;overflow:hidden;
            opacity:0;animation:vsreveal .6s cubic-bezier(.16,1,.3,1) forwards;
          }
          .vsq-q::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;
            background:linear-gradient(90deg,transparent,rgba(200,169,110,.22),transparent);}
          .vsq-q-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
          .vsq-q-num{font-family:'Cinzel',serif;font-size:.62rem;font-weight:700;
            letter-spacing:.16em;color:var(--gold-dim);
            padding:3px 9px;border-radius:10px;
            background:rgba(200,169,110,.08);border:1px solid rgba(200,169,110,.15);}
          .vsq-q-word{font-family:'Cinzel',serif;font-size:1.1rem;font-weight:700;
            color:var(--gold-lt);letter-spacing:.06em;}

          .vsq-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
          @media(max-width:520px){.vsq-opts{grid-template-columns:1fr;}}

          .vsq-opt{
            padding:11px 14px;border-radius:7px;
            border:1px solid rgba(200,169,110,.14);
            background:rgba(255,255,255,.03);
            cursor:pointer;transition:all .2s;
            font-size:.88rem;color:var(--text-sub);
            display:flex;align-items:center;justify-content:space-between;gap:8px;
          }
          .vsq-opt:hover:not(.disabled){
            border-color:rgba(200,169,110,.35);background:rgba(200,169,110,.07);
            color:var(--text);transform:translateX(2px);
          }
          .vsq-opt.chosen{border-color:rgba(200,169,110,.5);background:rgba(200,169,110,.1);color:var(--gold-lt);}
          .vsq-opt.correct{border-color:rgba(129,199,132,.6);background:rgba(129,199,132,.1);color:#81c784;}
          .vsq-opt.wrong  {border-color:rgba(255,138,101,.5);background:rgba(255,138,101,.1);color:#ff8a65;}
          .vsq-opt.disabled{cursor:default;}
          .vsq-opt-icon{font-size:14px;flex-shrink:0;}

          /* Submit btn */
          .vsq-submit{width:100%;padding:14px;margin-top:14px;border:none;border-radius:8px;cursor:pointer;
            font-family:'Cinzel',serif;font-size:.82rem;font-weight:600;
            letter-spacing:.18em;text-transform:uppercase;position:relative;overflow:hidden;transition:all .25s;}
          .vsq-submit.primary{
            background:linear-gradient(135deg,rgba(129,199,132,.2),rgba(129,199,132,.35),rgba(129,199,132,.2));
            border:1px solid rgba(129,199,132,.5);color:#81c784;}
          .vsq-submit.primary:hover:not(:disabled){
            box-shadow:0 0 24px rgba(129,199,132,.3);transform:translateY(-1px);
            border-color:rgba(129,199,132,.8);color:#a5d6a7;}
          .vsq-submit.outline{background:transparent;border:1px solid rgba(200,169,110,.3);color:var(--gold-dim);}
          .vsq-submit.outline:hover{border-color:rgba(200,169,110,.6);color:var(--gold-lt);background:rgba(200,169,110,.06);}
          .vsq-submit:disabled{opacity:.4;cursor:not-allowed;}
          .vsq-submit::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;
            background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
            animation:vsbtnshimmer 3s ease infinite;}
          @keyframes vsbtnshimmer{from{left:-100%}to{left:200%}}
        `}</style>

        <div className="vs-inner">
          <Link to={`/vocab/${id}`} className="vs-back">← Topic Overview</Link>

          <div className="vsq-header">
            <div className="vsq-eyebrow">✏️ Knowledge Check · {topic?.name}</div>
            <div className="vsq-title">Quiz Time</div>
            <div className="vsq-sub">Choose the correct meaning for each word</div>
          </div>

          {/* Result banner */}
          {submitted && (
            <div className="vsq-result-banner" style={{
              '--rc': scoreColor,
              borderColor:`${scoreColor}44`,
              background:`${scoreColor}0a`,
            }}>
              <div className="vsq-result-top">
                <div className="vsq-result-score" style={{color:scoreColor}}>{quizScore}/{questions.length}</div>
                <div>
                  <div className="vsq-result-label" style={{color:scoreColor}}>
                    {quizScore===questions.length ? '✦ Perfect Score!' :
                     quizScore >= questions.length*.7 ? '◆ Well done!' : '❋ Keep practicing'}
                  </div>
                  <div className="vsq-result-detail">
                    {quizScore} correct out of {questions.length} questions
                  </div>
                </div>
              </div>
              <div className="vsq-result-bar">
                <div className="vsq-result-fill" style={{
                  width:`${quizScore/questions.length*100}%`,
                  background:scoreColor, boxShadow:`0 0 8px ${scoreColor}66`,
                }}/>
              </div>
            </div>
          )}

          {/* Progress */}
          {!submitted && (
            <div className="vsq-prog-row">
              <div className="vsq-prog-bar">
                <div className="vsq-prog-fill" style={{width:`${(answeredQ/questions.length)*100}%`}}/>
              </div>
              <span className="vsq-prog-text">{answeredQ}/{questions.length}</span>
            </div>
          )}

          {/* Questions */}
          {questions.map((q, qi) => {
            const chosen = answers[qi];
            return (
              <div key={qi} className="vsq-q" style={{animationDelay:`${qi*.06}s`}}>
                <div className="vsq-q-header">
                  <span className="vsq-q-num">Q{String(qi+1).padStart(2,'0')}</span>
                  <span className="vsq-q-word">{q.word}</span>
                </div>
                <div className="vsq-opts">
                  {q.options.map((opt, oi) => {
                    const isChosen  = chosen === opt;
                    const isCorrect = submitted && opt === q.correct;
                    const isWrong   = submitted && isChosen && opt !== q.correct;
                    const cls = ['vsq-opt',
                      submitted ? 'disabled' : '',
                      isCorrect ? 'correct' : isWrong ? 'wrong' : isChosen ? 'chosen' : '',
                    ].filter(Boolean).join(' ');
                    return (
                      <div key={oi} className={cls}
                        onClick={() => !submitted && setAnswers(a => ({...a,[qi]:opt}))}>
                        <span>{opt}</span>
                        {submitted && (isCorrect || isWrong) && (
                          <span className="vsq-opt-icon">{isCorrect ? '✓' : '✗'}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {!submitted ? (
            <button className="vsq-submit primary"
              disabled={answeredQ < questions.length}
              onClick={() => setSubmitted(true)}>
              ✦ Submit · {answeredQ}/{questions.length} answered
            </button>
          ) : (
            <div style={{display:'flex',gap:10,marginTop:14}}>
              <button className="vsq-submit outline" style={{flex:1}}
                onClick={() => navigate(`/vocab/${id}`)}>Word List</button>
              <button className="vsq-submit primary" style={{flex:1}}
                onClick={() => navigate('/vocab')}>Explore Topics</button>
            </div>
          )}
        </div>
      </SharedBg>
    );
  }

  // ── FLASHCARD PHASE ──
  const st        = STATUS_META[current?.user_status] || STATUS_META.new;
  const newCount  = session.filter(c => c.user_status === 'new').length;
  const doneCount = Object.values(ratings).filter(r => r==='easy'||r==='skip').length;
  const hardCount = Object.values(ratings).filter(r => r==='hard').length;
  const pct       = Math.round((idx / session.length) * 100);

  return (
    <SharedBg>
      <style>{`
        /* Flash header */
        .vsf-header{margin-bottom:24px;opacity:0;animation:vsreveal .65s cubic-bezier(.16,1,.3,1) .1s forwards;}
        .vsf-eyebrow{font-family:'Cinzel',serif;font-size:.68rem;font-weight:600;
          letter-spacing:.28em;text-transform:uppercase;color:var(--gold-dim);
          margin-bottom:8px;display:flex;align-items:center;gap:10px;}
        .vsf-eyebrow::before{content:'';display:block;width:24px;height:1px;
          background:linear-gradient(90deg,transparent,var(--gold-dim));}

        /* Progress row */
        .vsf-prog-row{display:flex;align-items:center;gap:12px;margin-bottom:8px;}
        .vsf-prog-bar{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden;}
        .vsf-prog-fill{height:100%;border-radius:3px;
          background:linear-gradient(90deg,var(--gold-dim),var(--gold),var(--gold-bright));
          box-shadow:0 0 10px rgba(200,169,110,.5);
          transition:width .6s cubic-bezier(.16,1,.3,1);}
        .vsf-prog-info{display:flex;justify-content:space-between;margin-bottom:20px;font-size:.78rem;color:var(--text-sub);}
        .vsf-prog-stat{display:flex;align-items:center;gap:5px;}

        /* Daily limit notice */
        .vsf-notice{
          display:flex;align-items:center;gap:8px;
          border:1px solid rgba(255,209,102,.25);border-radius:7px;
          padding:9px 14px;margin-bottom:16px;
          background:rgba(255,209,102,.06);
          font-size:.8rem;color:rgba(255,209,102,.8);
          opacity:0;animation:vsreveal .65s cubic-bezier(.16,1,.3,1) .15s forwards;
        }

        /* Flashcard */
        .vsf-card-wrap{
          position:relative;margin-bottom:20px;
          opacity:0;animation:vsreveal .65s cubic-bezier(.16,1,.3,1) .18s forwards;
        }
        .vsf-card{
          background:linear-gradient(145deg,rgba(255,255,255,.06) 0%,rgba(200,169,110,.04) 60%,rgba(125,211,232,.03) 100%);
          border:1px solid var(--border);border-radius:16px;
          min-height:240px;cursor:pointer;position:relative;overflow:hidden;
          display:flex;align-items:center;justify-content:center;
          transition:all .3s cubic-bezier(.16,1,.3,1);
          box-shadow:0 8px 32px rgba(0,0,0,.3),inset 0 1px 0 rgba(200,169,110,.12);
          user-select:none;
        }
        .vsf-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1.5px;
          background:linear-gradient(90deg,transparent,rgba(200,169,110,.5),transparent);}
        .vsf-card:hover{
          border-color:rgba(200,169,110,.35);
          box-shadow:0 14px 48px rgba(0,0,0,.4),0 0 0 1px rgba(200,169,110,.1),
                     inset 0 1px 0 rgba(200,169,110,.18);
          transform:translateY(-2px);
        }

        /* Card shimmer */
        .vsf-card-shimmer{position:absolute;top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);
          animation:vscardshimmer 4s ease infinite;}
        @keyframes vscardshimmer{from{left:-100%}to{left:200%}}

        /* Status badge */
        .vsf-status{position:absolute;top:14px;right:14px;
          display:inline-flex;align-items:center;gap:5px;
          padding:4px 12px;border-radius:20px;
          font-family:'Cinzel',serif;font-size:.62rem;font-weight:600;
          letter-spacing:.1em;border:1px solid;}

        /* Flip hint */
        .vsf-flip-hint{position:absolute;bottom:14px;right:16px;
          font-size:.65rem;color:var(--gold-dim);letter-spacing:.12em;
          font-family:'Cinzel',serif;opacity:.6;}

        /* Card content */
        .vsf-card-content{padding:32px 40px;text-align:center;width:100%;}
        .vsf-word{font-family:'Cinzel',serif;
          font-size:clamp(1.8rem,4vw,2.8rem);font-weight:700;
          color:transparent;
          background:linear-gradient(170deg,#f5ecd4 0%,#e8d5a3 30%,#c8a96e 70%,#9a7540 100%);
          -webkit-background-clip:text;background-clip:text;
          filter:drop-shadow(0 0 20px rgba(200,169,110,.4));
          letter-spacing:.08em;margin-bottom:8px;}
        .vsf-phonetic{font-size:1rem;color:var(--gold-dim);margin-bottom:8px;letter-spacing:.04em;}
        .vsf-tap-hint{font-size:.72rem;color:var(--text-sub);letter-spacing:.12em;
          font-family:'Cinzel',serif;text-transform:uppercase;}

        .vsf-meaning{font-size:1.1rem;font-weight:600;color:#81c784;
          margin-bottom:10px;line-height:1.5;}
        .vsf-example{font-size:.88rem;color:var(--text-sub);font-style:italic;
          line-height:1.6;max-width:480px;margin:0 auto;}

        /* Speaker button */
        .vsf-speak{
          display:inline-flex;align-items:center;justify-content:center;
          width:38px;height:38px;border-radius:50%;cursor:pointer;
          background:rgba(200,169,110,.1);border:1.5px solid rgba(200,169,110,.28);
          color:var(--gold);transition:all .2s;margin:6px auto 2px;
        }
        .vsf-speak:hover{background:rgba(200,169,110,.2);border-color:rgba(200,169,110,.6);
          box-shadow:0 0 14px rgba(200,169,110,.3);}
        .vsf-speak.active{
          color:#81c784;border-color:rgba(129,199,132,.55);
          background:rgba(129,199,132,.1);
          animation:speakring .9s ease infinite;
        }
        @keyframes speakring{
          0%  {box-shadow:0 0 0 0   rgba(129,199,132,.45);}
          70% {box-shadow:0 0 0 9px rgba(129,199,132,.0);}
          100%{box-shadow:0 0 0 0   rgba(129,199,132,.0);}
        }

        /* Rating buttons */
        .vsf-ratings{
          display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;
          opacity:0;animation:vsreveal .65s cubic-bezier(.16,1,.3,1) .22s forwards;
        }
        @media(max-width:500px){.vsf-ratings{grid-template-columns:repeat(2,1fr);}}
        .vsf-rate-btn{
          display:flex;flex-direction:column;align-items:center;gap:6px;
          padding:14px 8px;border-radius:10px;border:1px solid;
          cursor:pointer;background:transparent;
          transition:all .25s cubic-bezier(.16,1,.3,1);
          position:relative;overflow:hidden;
        }
        .vsf-rate-btn:hover{transform:translateY(-3px);}
        .vsf-rate-icon{font-family:'Cinzel',serif;font-size:1.1rem;font-weight:900;line-height:1;}
        .vsf-rate-label{font-family:'Cinzel',serif;font-size:.62rem;font-weight:700;
          letter-spacing:.12em;text-transform:uppercase;}
        .vsf-rate-sub{font-size:.6rem;color:var(--text-sub);letter-spacing:.06em;
          line-height:1.3;text-align:center;}
        .vsf-rate-btn::after{content:'';position:absolute;top:0;left:-100%;width:50%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent);
          transition:left .4s;}
        .vsf-rate-btn:hover::after{left:150%;}

        /* Nav */
        .vsf-nav{display:flex;justify-content:space-between;
          opacity:0;animation:vsreveal .65s cubic-bezier(.16,1,.3,1) .26s forwards;}
        .vsf-nav-btn{
          display:flex;align-items:center;gap:6px;
          padding:8px 16px;border-radius:7px;border:1px solid rgba(200,169,110,.2);
          background:transparent;color:var(--gold-dim);cursor:pointer;
          font-family:'Cinzel',serif;font-size:.68rem;font-weight:600;
          letter-spacing:.12em;text-transform:uppercase;transition:all .22s;
        }
        .vsf-nav-btn:hover:not(:disabled){
          border-color:rgba(200,169,110,.45);color:var(--gold-lt);
          background:rgba(200,169,110,.06);}
        .vsf-nav-btn:disabled{opacity:.3;cursor:not-allowed;}
      `}</style>

      <div className="vs-inner">
        <Link to={`/vocab/${id}`} className="vs-back">← Topic Overview</Link>

        {/* Header */}
        <div className="vsf-header">
          <div className="vsf-eyebrow">🎴 Flashcard Study · {topic?.name}</div>
        </div>

        {/* Daily limit notice */}
        {newCount > 0 && (
          <div className="vsf-notice">
            <span>⚠️</span>
            <span>Daily limit: max <strong>{MAX_NEW_PER_DAY}</strong> new words per session for effective learning.</span>
          </div>
        )}

        {/* Progress */}
        <div className="vsf-prog-row">
          <div className="vsf-prog-bar">
            <div className="vsf-prog-fill" style={{width:`${pct}%`}}/>
          </div>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:'.68rem',color:'var(--gold-dim)',whiteSpace:'nowrap'}}>
            {idx+1}/{session.length}
          </span>
        </div>
        <div className="vsf-prog-info">
          <span className="vsf-prog-stat">
            <span style={{color:'#81c784'}}>✓</span> {doneCount} learned
          </span>
          <span className="vsf-prog-stat">
            <span style={{color:'#ff8a65'}}>⚡</span> {hardCount} hard
          </span>
          <span style={{color:'var(--gold-dim)'}}>{pct}% complete</span>
        </div>

        {/* Flashcard */}
        <div className="vsf-card-wrap">
          <div className="vsf-card" onClick={() => setFlipped(f => !f)}>
            <div className="vsf-card-shimmer"/>

            {/* Status */}
            <div className="vsf-status" style={{
              color:st.color, borderColor:`${st.color}44`, background:st.bg,
            }}>
              <span>{st.icon}</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:'.62rem',letterSpacing:'.1em'}}>{st.label}</span>
            </div>

            <div className="vsf-flip-hint">
              {flipped ? '◆ Front' : '◆ Tap to reveal'}
            </div>

            <div className="vsf-card-content">
              {!flipped ? (
                <>
                  <div className="vsf-word">{current?.word}</div>
                  {current?.phonetic && (
                    <div className="vsf-phonetic">/{current.phonetic}/</div>
                  )}
                  <button
                    className={`vsf-speak ${speaking ? 'active' : ''}`}
                    onClick={e => { e.stopPropagation(); speak(current.word); }}
                    title="Pronounce word"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  </button>
                  <div className="vsf-tap-hint">✦ tap card to reveal meaning ✦</div>
                </>
              ) : (
                <>
                  <div className="vsf-meaning">{current?.meaning}</div>
                  {current?.example && (
                    <div className="vsf-example">"{current.example}"</div>
                  )}
                  <button
                    className={`vsf-speak ${speaking ? 'active' : ''}`}
                    style={{marginTop:14}}
                    onClick={e => { e.stopPropagation(); speak(current.example || current.word, 0.82); }}
                    title="Pronounce example"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rating buttons */}
        <div className="vsf-ratings">
          {RATING_BTNS.map(btn => (
            <button key={btn.key} className="vsf-rate-btn"
              style={{
                borderColor:`${btn.color}44`,
                color:btn.color,
                background:`${btn.color}0a`,
                boxShadow:`0 0 0 rgba(0,0,0,0)`,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 6px 20px ${btn.glow},inset 0 0 12px ${btn.color}0a`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='0 0 0 rgba(0,0,0,0)'; }}
              onClick={() => rate(btn.key)}>
              <span className="vsf-rate-icon">{btn.icon}</span>
              <span className="vsf-rate-label">{btn.label}</span>
              <span className="vsf-rate-sub">{btn.sublabel}</span>
            </button>
          ))}
        </div>

        {/* Nav */}
        <div className="vsf-nav">
          <button className="vsf-nav-btn" onClick={goPrev} disabled={idx === 0}>
            ← Previous
          </button>
          <button className="vsf-nav-btn" onClick={goNext}>
            {idx + 1 >= session.length ? 'Finish Session →' : 'Skip →'}
          </button>
        </div>
      </div>
    </SharedBg>
  );
}