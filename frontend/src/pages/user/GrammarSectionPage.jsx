import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function getEncouragement(pct) {
  if (pct >= 90) return { msg: 'Xuất sắc! Bạn đã nắm vững phần này!', color: '#81c784' };
  if (pct >= 60) return { msg: 'Tốt lắm! Tiếp tục luyện tập nhé!',    color: '#ffd166' };
  return            { msg: 'Cần luyện tập thêm. Hãy làm lại nhé!',    color: '#ff8a65' };
}

export default function GrammarSectionPage() {
  const { lessonId, sectionId } = useParams();
  const navigate = useNavigate();

  const [section,      setSection]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [current,      setCurrent]      = useState(0);
  const [answers,      setAnswers]      = useState({}); // { [qId]: userAnswer }
  const [correctMap,   setCorrectMap]   = useState({}); // { [qId]: bool }
  const [fillInput,    setFillInput]    = useState('');
  const [feedback,     setFeedback]     = useState(null); // null | { isCorrect, correctDisplay, explanation }
  const [phase,        setPhase]        = useState('quiz');
  const [result,       setResult]       = useState(null);
  const [submitting,   setSubmitting]   = useState(false);

  useEffect(() => {
    api.get(`/grammar/sections/${sectionId}`)
      .then(res => setSection(res.data.data))
      .finally(() => setLoading(false));
  }, [sectionId]);

  // Sync fill input when navigating
  useEffect(() => {
    if (!section) return;
    const q = section.questions[current];
    if (q?.question_type === 'fill_blank') {
      setFillInput(answers[q.id] || '');
    }
  }, [current, section]);

  if (loading) return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'calc(100vh - 64px)',background:'#060e1f'}}>
      <div style={{width:36,height:36,borderRadius:'50%',border:'2px solid rgba(200,169,110,.15)',borderTopColor:'#c8a96e',animation:'spin .8s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  if (!section) return (
    <div className="container py-4">
      <div className="alert alert-danger">Không tìm thấy phần học</div>
    </div>
  );

  const questions = section.questions || [];
  const total     = questions.length;
  const q         = questions[current];
  const OPTS      = ['A', 'B', 'C', 'D'];
  const optKeys   = { A: 'option_a', B: 'option_b', C: 'option_c', D: 'option_d' };

  const isAnswered = (qItem) => answers[qItem?.id] !== undefined;

  // Check and immediately show feedback
  const checkAnswer = (userAnswer) => {
    if (!q || isAnswered(q)) return;

    let isCorrect, correctDisplay;
    if (q.question_type === 'multiple_choice') {
      isCorrect      = userAnswer === q.correct;
      correctDisplay = `${q.correct}. ${q[optKeys[q.correct]] || ''}`;
    } else {
      const ua = (userAnswer || '').trim().toLowerCase();
      isCorrect      = ua === (q.fill_answer || '').trim().toLowerCase();
      correctDisplay = q.fill_answer || '';
    }

    setAnswers(prev  => ({ ...prev, [q.id]: userAnswer }));
    setCorrectMap(prev => ({ ...prev, [q.id]: isCorrect }));
    setFeedback({ isCorrect, correctDisplay, explanation: q.explanation || '' });
  };

  // Dismiss feedback and advance
  const handleFeedbackNext = () => {
    setFeedback(null);
    if (current < total - 1) {
      setCurrent(c => c + 1);
      setFillInput('');
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = questions.map(qItem => ({
        question_id: qItem.id,
        chosen: qItem.question_type === 'multiple_choice' ? (answers[qItem.id] || null) : undefined,
        fill:   qItem.question_type === 'fill_blank'      ? (answers[qItem.id] || '')   : undefined,
      }));
      const res = await api.post(`/grammar/sections/${sectionId}/submit`, { answers: payload });
      setResult(res.data.data);
      setPhase('result');
    } catch {
      alert('Lỗi khi nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const enc = result ? getEncouragement(result.score_pct) : null;
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
        :root { --gold:#c8a96e; --gold-lt:#e8d5a3; --gold-bright:#f5ecd4; --gold-dim:#7a6040; --navy:#060e1f; --text:#e8dcc8; --text-sub:#8a7f6a; --border:rgba(200,169,110,.18); }

        .gs-root  { min-height:calc(100vh - 64px); background:var(--navy); font-family:'Be Vietnam Pro',sans-serif; color:var(--text); }
        .gs-inner { max-width:760px; margin:0 auto; padding:32px 24px 80px; }

        .gs-back { display:inline-flex; align-items:center; gap:8px;
          font-family:'Cinzel',serif; font-size:.7rem; font-weight:600;
          letter-spacing:.14em; text-transform:uppercase; color:var(--gold-dim);
          text-decoration:none; border:1px solid rgba(200,169,110,.18); border-radius:6px;
          padding:6px 13px; margin-bottom:24px; transition:all .25s; }
        .gs-back:hover { color:var(--gold-lt); border-color:rgba(200,169,110,.4); background:rgba(200,169,110,.06); }

        .gs-header { margin-bottom:20px; }
        .gs-lesson-title  { font-size:.78rem; color:var(--text-sub); margin-bottom:4px; }
        .gs-section-title { font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700; color:var(--gold-lt); letter-spacing:.05em; }

        /* Progress */
        .gs-progress-wrap { margin-bottom:28px; }
        .gs-progress-meta { display:flex; justify-content:space-between; margin-bottom:8px; font-size:.75rem; color:var(--text-sub); }
        .gs-progress-label { font-family:'Cinzel',serif; font-size:.65rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; }
        .gs-dots { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:6px; }
        .gs-dot { width:9px; height:9px; border-radius:50%; border:1.5px solid rgba(200,169,110,.25); cursor:pointer; transition:all .2s; }
        .gs-dot.is-correct { background:#81c784; border-color:#81c784; box-shadow:0 0 5px rgba(129,199,132,.5); }
        .gs-dot.is-wrong   { background:#ff8a65; border-color:#ff8a65; box-shadow:0 0 5px rgba(255,138,101,.5); }
        .gs-dot.is-current { border-color:var(--gold-lt); box-shadow:0 0 7px rgba(200,169,110,.5); }
        .gs-track { height:4px; border-radius:2px; background:rgba(255,255,255,.06); overflow:hidden; }
        .gs-fill  { height:100%; border-radius:2px; background:linear-gradient(90deg,var(--gold-dim),var(--gold)); transition:width .4s cubic-bezier(.16,1,.3,1); box-shadow:0 0 6px rgba(200,169,110,.4); }

        /* Question panel */
        .gs-panel { background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(200,169,110,.02));
          border:1px solid var(--border); border-radius:12px; padding:28px; position:relative; overflow:hidden;
          box-shadow:inset 0 1px 0 rgba(200,169,110,.1),0 8px 32px rgba(0,0,0,.25);
          animation:qreveal .4s cubic-bezier(.16,1,.3,1); }
        @keyframes qreveal { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .gs-panel::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(200,169,110,.4),transparent); }

        .gs-q-num  { font-family:'Cinzel',serif; font-size:.68rem; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--gold-dim); margin-bottom:12px; }
        .gs-q-type { display:inline-flex; align-items:center; padding:2px 10px; border-radius:10px;
          font-size:.62rem; font-weight:600; letter-spacing:.08em; margin-left:10px; vertical-align:middle; }
        .gs-q-text { font-size:1rem; font-weight:500; color:var(--text); line-height:1.6; margin-bottom:20px; }

        /* MC options */
        .gs-options { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        @media(max-width:500px) { .gs-options { grid-template-columns:1fr; } }
        .gs-opt { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; border-radius:8px;
          border:1px solid rgba(200,169,110,.2); cursor:pointer; transition:all .2s; background:rgba(255,255,255,.02); }
        .gs-opt:hover:not(.gs-opt-locked) { border-color:rgba(200,169,110,.45); background:rgba(200,169,110,.06); }
        .gs-opt-locked { cursor:default; }
        .gs-opt-correct { border-color:rgba(129,199,132,.6) !important; background:rgba(129,199,132,.12) !important; }
        .gs-opt-wrong   { border-color:rgba(255,138,101,.5) !important; background:rgba(255,138,101,.08) !important; }
        .gs-opt-dim     { opacity:.35; }
        .gs-opt-key { width:24px; height:24px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center;
          font-family:'Cinzel',serif; font-size:.7rem; font-weight:700; border:1.5px solid rgba(200,169,110,.3); color:var(--gold-dim); transition:all .2s; }
        .gs-opt-correct .gs-opt-key { background:#81c784; border-color:#81c784; color:#060e1f; }
        .gs-opt-wrong   .gs-opt-key { background:#ff8a65; border-color:#ff8a65; color:#060e1f; }
        .gs-opt.selected .gs-opt-key { background:var(--gold); border-color:var(--gold); color:#060e1f; }
        .gs-opt-text { font-size:.88rem; color:var(--text); line-height:1.4; }

        /* Fill blank */
        .gs-fill-input { width:100%; padding:14px 16px; background:rgba(255,255,255,.04);
          border:1px solid rgba(200,169,110,.25); border-radius:8px; font-family:'Be Vietnam Pro',sans-serif;
          font-size:.94rem; color:var(--text); outline:none; transition:all .25s; }
        .gs-fill-input::placeholder { color:rgba(138,127,106,.4); }
        .gs-fill-input:focus { border-color:rgba(200,169,110,.55); background:rgba(200,169,110,.05); box-shadow:0 0 0 1px rgba(200,169,110,.18); }
        .gs-fill-input:disabled { opacity:.55; cursor:default; }
        .gs-fill-input.correct { border-color:rgba(129,199,132,.6); background:rgba(129,199,132,.08); }
        .gs-fill-input.wrong   { border-color:rgba(255,138,101,.5); background:rgba(255,138,101,.06); }
        .gs-fill-check { margin-top:10px; padding:10px 22px; border-radius:8px; cursor:pointer; font-weight:600;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.86rem; transition:all .25s; border:none;
          background:linear-gradient(135deg,rgba(200,169,110,.14),rgba(200,169,110,.26));
          border:1px solid rgba(200,169,110,.4); color:var(--gold-lt); }
        .gs-fill-check:hover { border-color:rgba(200,169,110,.8); box-shadow:0 0 14px rgba(200,169,110,.25); }
        .gs-fill-check:disabled { opacity:.4; cursor:not-allowed; }

        /* Nav buttons (prev only now) */
        .gs-nav { display:flex; gap:10px; margin-top:20px; }
        .gs-btn-prev { padding:9px 18px; border-radius:8px; cursor:pointer; font-weight:600;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.84rem; transition:all .25s;
          background:transparent; border:1px solid rgba(200,169,110,.2); color:var(--text-sub); }
        .gs-btn-prev:hover { border-color:rgba(200,169,110,.5); color:var(--text); }
        .gs-btn-prev:disabled { opacity:.3; cursor:not-allowed; }

        /* ── FEEDBACK POPUP ── */
        .gs-fb-overlay { position:fixed; inset:0; z-index:999; display:flex; align-items:flex-end; justify-content:center;
          background:rgba(0,0,0,.45); animation:fbfade .2s ease; }
        @keyframes fbfade { from{opacity:0} to{opacity:1} }
        .gs-fb-box { width:100%; max-width:760px; border-radius:16px 16px 0 0; padding:28px 28px 36px;
          animation:fbslide .3s cubic-bezier(.16,1,.3,1); position:relative; }
        @keyframes fbslide { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
        .gs-fb-box.correct { background:linear-gradient(135deg,rgba(3,28,10,.97),rgba(10,40,15,.97)); border:1px solid rgba(129,199,132,.3); border-bottom:none; }
        .gs-fb-box.wrong   { background:linear-gradient(135deg,rgba(30,10,4,.97),rgba(40,15,5,.97));  border:1px solid rgba(255,138,101,.3); border-bottom:none; }
        html[data-bs-theme="light"] .gs-fb-box.correct { background:linear-gradient(135deg,#f0fff4,#dcffe4); border-color:rgba(129,199,132,.5); }
        html[data-bs-theme="light"] .gs-fb-box.wrong   { background:linear-gradient(135deg,#fff5f0,#ffe8dc); border-color:rgba(255,138,101,.5); }

        .gs-fb-status { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
        .gs-fb-icon { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:900; flex-shrink:0; }
        .correct .gs-fb-icon { background:rgba(129,199,132,.25); color:#81c784; }
        .wrong   .gs-fb-icon { background:rgba(255,138,101,.2);  color:#ff8a65; }
        .gs-fb-title { font-family:'Cinzel',serif; font-size:1.05rem; font-weight:700; letter-spacing:.06em; }
        .correct .gs-fb-title { color:#81c784; }
        .wrong   .gs-fb-title { color:#ff8a65; }

        .gs-fb-correct-ans { font-size:.84rem; margin-bottom:8px; }
        .gs-fb-correct-ans span { font-weight:700; }
        .correct .gs-fb-correct-ans { color:rgba(129,199,132,.8); }
        .wrong   .gs-fb-correct-ans { color:rgba(255,255,255,.7); }
        html[data-bs-theme="light"] .wrong .gs-fb-correct-ans { color:#6b4030; }
        html[data-bs-theme="light"] .correct .gs-fb-correct-ans { color:#2d6a30; }

        .gs-fb-explanation { font-size:.82rem; color:rgba(255,255,255,.5); margin-bottom:20px; line-height:1.55; }
        html[data-bs-theme="light"] .gs-fb-explanation { color:rgba(0,0,0,.5); }

        .gs-fb-next { padding:11px 32px; border-radius:8px; cursor:pointer; font-weight:700;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.9rem; transition:all .25s; border:none; }
        .correct .gs-fb-next { background:#81c784; color:#060e1f; }
        .correct .gs-fb-next:hover { background:#a5d6a7; box-shadow:0 0 18px rgba(129,199,132,.4); }
        .wrong   .gs-fb-next { background:#ff8a65; color:#fff; }
        .wrong   .gs-fb-next:hover { background:#ffab91; box-shadow:0 0 18px rgba(255,138,101,.4); }

        /* Result screen */
        .gs-result { animation:qreveal .5s cubic-bezier(.16,1,.3,1); }
        .gs-result-panel { background:linear-gradient(145deg,rgba(255,255,255,.05),rgba(200,169,110,.03));
          border:1px solid var(--border); border-radius:12px; padding:36px; position:relative; overflow:hidden;
          text-align:center; box-shadow:0 8px 40px rgba(0,0,0,.3); }
        .gs-result-panel::before { content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(200,169,110,.5),transparent); }
        .gs-score-ring { width:100px; height:100px; border-radius:50%; margin:0 auto 20px;
          display:flex; align-items:center; justify-content:center; flex-direction:column;
          border:2px solid rgba(200,169,110,.3); box-shadow:0 0 30px rgba(200,169,110,.2); }
        .gs-score-pct   { font-family:'Cinzel',serif; font-size:1.6rem; font-weight:700; line-height:1; }
        .gs-score-label { font-size:.65rem; font-family:'Cinzel',serif; letter-spacing:.1em; color:var(--text-sub); }
        .gs-enc   { font-size:1rem; font-weight:600; margin-bottom:6px; }
        .gs-stats { display:flex; gap:16px; justify-content:center; margin:16px 0; font-size:.82rem; color:var(--text-sub); }
        .gs-stats span { display:flex; flex-direction:column; align-items:center; gap:2px; }
        .gs-stats strong { font-size:1.1rem; font-weight:700; font-family:'Cinzel',serif; }
        .gs-exp-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 16px; border-radius:20px;
          font-family:'Cinzel',serif; font-size:.75rem; font-weight:600; letter-spacing:.1em;
          background:rgba(200,169,110,.15); border:1px solid rgba(200,169,110,.4); color:var(--gold-lt); margin-bottom:20px; }
        .gs-unlock-note { font-size:.8rem; color:#ff8a65; margin-bottom:20px; }
        .gs-result-btns { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; }
        .gs-result-btn  { padding:10px 22px; border-radius:8px; cursor:pointer; font-weight:600;
          font-family:'Be Vietnam Pro',sans-serif; font-size:.86rem; transition:all .25s; text-decoration:none; display:inline-block; }
        .gs-btn-retry { background:transparent; border:1px solid rgba(200,169,110,.3); color:var(--text-sub); }
        .gs-btn-retry:hover { border-color:rgba(200,169,110,.6); color:var(--text); }
        .gs-btn-back  { background:linear-gradient(135deg,rgba(200,169,110,.12),rgba(200,169,110,.22)); border:1px solid rgba(200,169,110,.35); color:var(--gold-lt); }
        .gs-btn-back:hover  { border-color:rgba(200,169,110,.7); }
        .gs-btn-next-sec  { background:linear-gradient(135deg,rgba(129,199,132,.15),rgba(129,199,132,.28)); border:1px solid rgba(129,199,132,.4); color:#81c784; }
        .gs-btn-next-sec:hover  { border-color:#81c784; box-shadow:0 0 14px rgba(129,199,132,.2); }

        /* Light mode */
        html[data-bs-theme="light"] .gs-root { --navy:#ffffff; --text:#1a1a2e; --text-sub:#6b7280; --border:rgba(0,0,0,.1); --glow-gold:rgba(14,45,107,.12); --gold:#1a4fae; --gold-lt:#0d2d6b; --gold-bright:#4878cc; --gold-dim:#2e5cb8; }
        html[data-bs-theme="light"] .gs-panel { background:rgba(255,255,255,.92); border-color:rgba(0,0,0,.1); }
        html[data-bs-theme="light"] .gs-opt   { background:rgba(255,255,255,.7); border-color:rgba(0,0,0,.12); }
        html[data-bs-theme="light"] .gs-fill-input { background:rgba(0,0,0,.03); border-color:rgba(0,0,0,.15); color:#1a1a2e; }
        html[data-bs-theme="light"] .gs-result-panel { background:rgba(255,255,255,.92); border-color:rgba(0,0,0,.1); }
        @keyframes spin { to{transform:rotate(360deg);} }
      `}</style>

      <div className="gs-root">
        <div className="gs-inner">

          <Link to={`/grammar/${lessonId}`} className="gs-back">← {section.lesson_title || 'Lesson'}</Link>

          <div className="gs-header">
            <div className="gs-lesson-title">{section.lesson_title}</div>
            <div className="gs-section-title">{section.title}</div>
          </div>

          {/* ── QUIZ PHASE ── */}
          {phase === 'quiz' && total > 0 && (
            <>
              {/* Progress dots */}
              <div className="gs-progress-wrap">
                <div className="gs-progress-meta">
                  <span className="gs-progress-label">Question {current + 1} / {total}</span>
                  <span style={{fontSize:'.72rem'}}>{answeredCount}/{total} answered</span>
                </div>
                <div className="gs-dots">
                  {questions.map((qItem, idx) => (
                    <div key={qItem.id}
                      className={`gs-dot
                        ${correctMap[qItem.id] === true  ? 'is-correct' : ''}
                        ${correctMap[qItem.id] === false ? 'is-wrong'   : ''}
                        ${idx === current ? 'is-current' : ''}`}
                      onClick={() => { if (!feedback) setCurrent(idx); }}
                      title={`Q${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="gs-track">
                  <div className="gs-fill" style={{width:`${(answeredCount / total) * 100}%`}}/>
                </div>
              </div>

              {/* Question card */}
              <div className="gs-panel" key={current}>
                <div className="gs-q-num">
                  Question {current + 1}
                  <span className="gs-q-type" style={{
                    background: q.question_type === 'fill_blank' ? 'rgba(79,195,247,.12)' : 'rgba(200,169,110,.1)',
                    color:       q.question_type === 'fill_blank' ? '#4fc3f7' : 'var(--gold-dim)',
                    border:      `1px solid ${q.question_type === 'fill_blank' ? 'rgba(79,195,247,.3)' : 'rgba(200,169,110,.2)'}`,
                  }}>
                    {q.question_type === 'fill_blank' ? 'Fill Blank' : 'Multiple Choice'}
                  </span>
                </div>

                <div className="gs-q-text"
                  dangerouslySetInnerHTML={{ __html: q.question.replace(/___+/g,
                    '<span style="display:inline-block;min-width:60px;border-bottom:2px solid #c8a96e;margin:0 4px">&nbsp;</span>')
                  }}
                />

                {q.question_type === 'multiple_choice' ? (
                  <div className="gs-options">
                    {OPTS.filter(opt => q[optKeys[opt]]).map(opt => {
                      const isQAnswered  = isAnswered(q);
                      const isSelected   = answers[q.id] === opt;
                      const isCorrectOpt = opt === q.correct;

                      let cls = 'gs-opt';
                      if (isQAnswered) {
                        cls += ' gs-opt-locked';
                        if (isCorrectOpt)                    cls += ' gs-opt-correct';
                        else if (isSelected && !isCorrectOpt) cls += ' gs-opt-wrong';
                        else                                  cls += ' gs-opt-dim';
                      } else {
                        if (isSelected) cls += ' selected';
                      }

                      return (
                        <div key={opt} className={cls} onClick={() => !isQAnswered && checkAnswer(opt)}>
                          <div className="gs-opt-key">{opt}</div>
                          <div className="gs-opt-text">{q[optKeys[opt]]}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <input
                      className={`gs-fill-input ${
                        isAnswered(q)
                          ? (correctMap[q.id] ? 'correct' : 'wrong')
                          : ''
                      }`}
                      placeholder="Type your answer..."
                      value={fillInput}
                      disabled={isAnswered(q)}
                      onChange={e => setFillInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !isAnswered(q) && fillInput.trim()) {
                          checkAnswer(fillInput.trim());
                        }
                      }}
                      autoFocus={!isAnswered(q)}
                    />
                    {!isAnswered(q) && (
                      <button className="gs-fill-check" disabled={!fillInput.trim()}
                        onClick={() => checkAnswer(fillInput.trim())}>
                        Check Answer
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Prev nav (only when no feedback showing) */}
              {!feedback && (
                <div className="gs-nav">
                  <button className="gs-btn-prev" onClick={() => { setCurrent(c => c - 1); setFillInput(''); }}
                    disabled={current === 0}>
                    ← Prev
                  </button>
                  {isAnswered(q) && current < total - 1 && (
                    <button className="gs-btn-prev" style={{marginLeft:'auto'}}
                      onClick={() => { setCurrent(c => c + 1); setFillInput(''); }}>
                      Next →
                    </button>
                  )}
                  {isAnswered(q) && current === total - 1 && (
                    <button className="gs-btn-prev" style={{marginLeft:'auto', borderColor:'rgba(129,199,132,.4)', color:'#81c784'}}
                      onClick={handleSubmit} disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {phase === 'quiz' && total === 0 && (
            <div className="gs-panel" style={{textAlign:'center',padding:40}}>
              <p style={{color:'var(--text-sub)'}}>Phần này chưa có câu hỏi.</p>
              <Link to={`/grammar/${lessonId}`} className="gs-result-btn gs-btn-back" style={{marginTop:12}}>
                Quay lại bài học
              </Link>
            </div>
          )}

          {/* ── RESULT PHASE ── */}
          {phase === 'result' && result && enc && (
            <div className="gs-result">
              <div className="gs-result-panel">
                <div className="gs-score-ring" style={{
                  background: `radial-gradient(circle, ${enc.color}18, transparent)`,
                  borderColor: `${enc.color}44`,
                }}>
                  <span className="gs-score-pct" style={{color: enc.color}}>{Math.round(result.score_pct)}%</span>
                  <span className="gs-score-label">Score</span>
                </div>

                <div className="gs-enc" style={{color: enc.color}}>{enc.msg}</div>

                <div className="gs-stats">
                  <span><strong style={{color:'#81c784'}}>{result.correct_q}</strong>Correct</span>
                  <span><strong style={{color:'#ff8a65'}}>{result.total_q - result.correct_q}</strong>Wrong</span>
                  <span><strong style={{color:'var(--gold-lt)'}}>{result.total_q}</strong>Total</span>
                </div>

                <div className="gs-exp-badge">
                  ✦ +{result.exp_earned} EXP
                  {result.first_day_bonus && <span style={{fontSize:'.65rem',color:'#fbbf24'}}>· 2× hôm nay!</span>}
                  {result.is_first_attempt && <span style={{opacity:.6,fontSize:'.65rem'}}>· Lần đầu</span>}
                  {result.daily_task_completed && <span style={{fontSize:'.65rem',color:'var(--gold)'}}>· Daily done!</span>}
                </div>

                {result.streak?.current > 1 && (
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:14,fontSize:'.8rem',color:'#f59e0b'}}>
                    <span>🔥</span>
                    <span><strong>{result.streak.current}</strong> ngày liên tiếp</span>
                    {result.streak.multiplier > 1 && (
                      <span style={{background:'rgba(245,158,11,.15)',border:'1px solid rgba(245,158,11,.3)',borderRadius:12,padding:'1px 8px',fontWeight:700}}>
                        {result.streak.multiplier}× EXP
                      </span>
                    )}
                    {result.streak.milestone && (
                      <span style={{color:'#fcd34d'}}>🏅 Milestone {result.streak.milestone} ngày!</span>
                    )}
                  </div>
                )}

                {result.achievements_unlocked?.length > 0 && (
                  <div style={{background:'rgba(200,169,110,.08)',border:'1px solid rgba(200,169,110,.25)',borderRadius:10,padding:'12px 16px',marginBottom:16,textAlign:'left'}}>
                    <div style={{fontSize:'.7rem',fontWeight:700,letterSpacing:'.1em',color:'var(--gold-dim)',marginBottom:8,textTransform:'uppercase'}}>
                      🏆 Thành tích mở khóa!
                    </div>
                    {result.achievements_unlocked.map(a => (
                      <div key={a.code} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,fontSize:'.82rem',color:'var(--text)'}}>
                        <span>{a.icon}</span>
                        <span style={{fontWeight:600}}>{a.name}</span>
                        {a.exp_reward > 0 && <span style={{color:'var(--gold)',fontSize:'.72rem',marginLeft:'auto'}}>+{a.exp_reward} EXP</span>}
                      </div>
                    ))}
                  </div>
                )}

                {!result.is_unlocked && (
                  <div className="gs-unlock-note">Cần ≥ 60% để mở khóa phần tiếp theo. Hãy thử lại!</div>
                )}

                <div className="gs-result-btns">
                  <button className="gs-result-btn gs-btn-retry"
                    onClick={() => { setPhase('quiz'); setAnswers({}); setCorrectMap({}); setCurrent(0); setFillInput(''); setResult(null); setFeedback(null); }}>
                    Làm lại
                  </button>
                  <Link to={`/grammar/${lessonId}`} className="gs-result-btn gs-btn-back">Bài học</Link>
                  {result.is_unlocked && result.next_section_id && (
                    <Link to={`/grammar/${lessonId}/section/${result.next_section_id}`} className="gs-result-btn gs-btn-next-sec">
                      Phần tiếp →
                    </Link>
                  )}
                  {result.is_unlocked && !result.next_section_id && (
                    <Link to="/grammar" className="gs-result-btn gs-btn-next-sec">Bài học tiếp →</Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FEEDBACK POPUP ── */}
      {feedback && (
        <div className="gs-fb-overlay" onClick={e => e.target === e.currentTarget && handleFeedbackNext()}>
          <div className={`gs-fb-box ${feedback.isCorrect ? 'correct' : 'wrong'}`}>

            <div className="gs-fb-status">
              <div className="gs-fb-icon">
                {feedback.isCorrect ? '✓' : '✗'}
              </div>
              <div className="gs-fb-title">
                {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
              </div>
            </div>

            {!feedback.isCorrect && feedback.correctDisplay && (
              <div className="gs-fb-correct-ans">
                Correct answer: <span>{feedback.correctDisplay}</span>
              </div>
            )}

            {feedback.explanation && (
              <div className="gs-fb-explanation">{feedback.explanation}</div>
            )}

            <button className="gs-fb-next" onClick={handleFeedbackNext}>
              {current < total - 1 ? 'Next →' : (submitting ? 'Submitting...' : 'Finish')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
