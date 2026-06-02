import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PART_INFO = {
  1: { label: 'Photographs',           skill: 'listening', hasGroup: false },
  2: { label: 'Question-Response',     skill: 'listening', hasGroup: false },
  3: { label: 'Short Conversations',   skill: 'listening', hasGroup: true  },
  4: { label: 'Short Talks',           skill: 'listening', hasGroup: true  },
  5: { label: 'Incomplete Sentences',  skill: 'reading',   hasGroup: false },
  6: { label: 'Text Completion',       skill: 'reading',   hasGroup: true  },
  7: { label: 'Reading Comprehension', skill: 'reading',   hasGroup: true  },
};
const OPTS = ['A','B','C','D'];

function fmtTime(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), ss = s%60;
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

export default function ToeicTestPage() {
  const { id }   = useParams();
  const [sp]     = useSearchParams();
  const navigate = useNavigate();
  const mode     = sp.get('mode') === 'practice' ? 'practice' : 'mock';

  const [test,           setTest]           = useState(null);
  const [questions,      setQuestions]      = useState([]);
  const [answers,        setAnswers]        = useState({});
  const [revealed,       setRevealed]       = useState({});  // practice: per-question reveal
  const [section,        setSection]        = useState(null);
  const [activePart,     setActivePart]     = useState(null);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [timeLeft,       setTimeLeft]       = useState(null);
  const [submitting,     setSubmitting]     = useState(false);
  const [reviewMode,     setReviewMode]     = useState(false); // practice: review all
  const [retryIds,       setRetryIds]       = useState(null);  // Set of ids to retry, null=all

  const timerRef     = useRef(null);
  const questionRefs = useRef({});

  /* ── Load & sort ── */
  useEffect(() => {
    api.get(`/toeic/tests/${id}`).then(r => {
      const data = r.data.data;
      setTest(data);
      const qs = (data.questions || []).sort((a,b) => a.question_num - b.question_num);
      setQuestions(qs);
      if (mode === 'mock') setTimeLeft((data.duration_minutes || 120) * 60);
    });
  }, [id, mode]);

  /* ── Timer ── */
  useEffect(() => {
    if (mode !== 'mock' || timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t-1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, mode]);

  /* ── Derived ── */
  const questionsByPart = useMemo(() => {
    const map = {};
    questions.forEach(q => { if (!map[q.part_num]) map[q.part_num]=[]; map[q.part_num].push(q); });
    return map;
  }, [questions]);

  const groupsByPart = useMemo(() => {
    const map = {};
    questions.forEach(q => {
      if (!q.group) return;
      const p = q.part_num;
      if (!map[p]) map[p] = {};
      if (!map[p][q.group.id]) map[p][q.group.id] = { group: q.group, questions: [] };
      map[p][q.group.id].questions.push(q);
    });
    const result = {};
    Object.keys(map).forEach(p => {
      result[p] = Object.values(map[p]).map(g => ({
        ...g, questions: g.questions.sort((a,b) => a.question_num - b.question_num)
      })).sort((a,b) => a.questions[0].question_num - b.questions[0].question_num);
    });
    return result;
  }, [questions]);

  const availableParts    = useMemo(() => Object.keys(questionsByPart).map(Number).sort((a,b)=>a-b), [questionsByPart]);
  const listeningParts    = useMemo(() => availableParts.filter(p => PART_INFO[p]?.skill==='listening'), [availableParts]);
  const readingParts      = useMemo(() => availableParts.filter(p => PART_INFO[p]?.skill==='reading'),   [availableParts]);
  const hasListening      = listeningParts.length > 0;
  const hasReading        = readingParts.length > 0;

  /* ── Auto-set section/part on load ── */
  useEffect(() => {
    if (!availableParts.length) return;
    const defaultSection = hasListening ? 'listening' : 'reading';
    setSection(defaultSection);
    setActivePart(hasListening ? listeningParts[0] : readingParts[0]);
  }, [availableParts.length]);

  const sectionParts = section === 'listening' ? listeningParts : readingParts;

  useEffect(() => {
    if (!sectionParts.length || sectionParts.includes(activePart)) return;
    setActivePart(sectionParts[0]);
    setActiveGroupIdx(0);
  }, [section]);

  const activePartGroups = groupsByPart[activePart] || [];
  const currentGroup     = activePartGroups[activeGroupIdx] || null;

  /* ── Answer ── */
  const handleAnswer = useCallback((qId, opt) => {
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  }, []);

  const handleReveal = useCallback((qId) => {
    setRevealed(prev => ({ ...prev, [qId]: true }));
  }, []);

  /* ── Submit ── */
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (mode === 'mock') {
      const un = questions.filter(q => !answers[q.id]).length;
      if (un > 0 && !window.confirm(`Còn ${un} câu chưa trả lời. Nộp bài?`)) return;
    } else {
      const un = questions.filter(q => !answers[q.id]).length;
      if (un > 0 && !window.confirm(`Còn ${un} câu chưa trả lời. Nộp bài?`)) return;
    }
    clearTimeout(timerRef.current);
    setSubmitting(true);
    try {
      const payload = questions.map(q => ({ question_id: q.id, chosen: answers[q.id] || null }));
      const timeTaken = test ? test.duration_minutes * 60 - (timeLeft || 0) : null;
      const r = await api.post(`/toeic/tests/${id}/submit`, {
        answers: payload,
        mode: mode === 'mock' ? 'mock_test' : 'practice',
        time_taken_seconds: timeTaken,
      });
      const d = r.data.data;
      navigate(`/toeic/result/${d.attempt_id}`, {
        state: { streak: d.streak, achievements_unlocked: d.achievements_unlocked,
          daily_task_completed: d.daily_task_completed, first_day_bonus: d.first_day_bonus, exp_earned: d.exp_earned },
      });
    } catch {
      alert('Lỗi khi nộp bài. Vui lòng thử lại.');
      setSubmitting(false);
    }
  }, [submitting, mode, questions, answers, test, timeLeft, id, navigate]);

  /* ── Practice: enter review ── */
  const handleEnterReview = () => {
    const all = {};
    questions.forEach(q => { all[q.id] = true; });
    setRevealed(all);
    setReviewMode(true);
    setRetryIds(null);
    // Go to first part
    if (availableParts.length) {
      const p = availableParts[0];
      setSection(PART_INFO[p]?.skill || 'reading');
      setActivePart(p);
      setActiveGroupIdx(0);
    }
  };

  /* ── Practice: retry wrong ── */
  const handleRetryWrong = () => {
    const wrongIds = new Set(questions.filter(q => answers[q.id] && answers[q.id] !== q.correct_answer).map(q => q.id));
    if (!wrongIds.size) { alert('Không có câu nào sai! 🎉'); return; }
    setAnswers(prev => { const n={...prev}; wrongIds.forEach(id => delete n[id]); return n; });
    setRevealed(prev => { const n={...prev}; wrongIds.forEach(id => delete n[id]); return n; });
    setRetryIds(wrongIds);
    setReviewMode(false);
    const first = questions.find(q => wrongIds.has(q.id));
    if (first) {
      setSection(PART_INFO[first.part_num]?.skill || 'reading');
      setActivePart(first.part_num);
      setActiveGroupIdx(0);
    }
  };

  /* ── Sidebar click ── */
  const handleSidebarClick = (q) => {
    const skill = PART_INFO[q.part_num]?.skill;
    if (skill && skill !== section) setSection(skill);
    setActivePart(q.part_num);
    const groups = groupsByPart[q.part_num] || [];
    if (groups.length) {
      const gIdx = groups.findIndex(g => g.questions.some(gq => gq.id === q.id));
      setActiveGroupIdx(gIdx >= 0 ? gIdx : 0);
    }
    setTimeout(() => questionRefs.current[q.id]?.scrollIntoView({ behavior:'smooth', block:'center' }), 100);
  };

  /* ── Render question ── */
  const renderQuestion = (q) => {
    const isRevealed  = reviewMode || !!revealed[q.id];
    const userAnswer  = answers[q.id];
    const isCorrect   = userAnswer === q.correct_answer;
    // In retry mode, skip questions not in retryIds
    if (retryIds && !retryIds.has(q.id)) return null;

    return (
      <div key={q.id} ref={el => questionRefs.current[q.id] = el} className="toeic-qcard">

        <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:10 }}>
          <span style={{ background:'var(--app-text-2)', color:'var(--app-surface)', borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:700, flexShrink:0 }}>
            Q{q.question_num}
          </span>
          {q.question_text
            ? <span style={{ fontWeight:600, lineHeight:1.5, fontSize:14, color:'var(--app-text)' }}>{q.question_text}</span>
            : <span style={{ color:'var(--app-text-3)', fontStyle:'italic', fontSize:13 }}>(Nghe audio và chọn đáp án)</span>}
        </div>

        {!q.group && q.audio_url && (
          <audio controls style={{ width:'100%', height:34, marginBottom:8 }} key={q.audio_url}>
            <source src={q.audio_url}/>
          </audio>
        )}
        {q.image_url && <img src={q.image_url} alt="" style={{ maxHeight:180, borderRadius:6, marginBottom:8, display:'block' }}/>}

        <div>
          {OPTS.filter(o => q[`option_${o.toLowerCase()}`]).map(opt => {
            const txt         = q[`option_${opt.toLowerCase()}`];
            const isSel       = userAnswer === opt;
            const isCorrectOp = q.correct_answer === opt;
            let cls = 'toeic-opt';
            let lbg = 'var(--app-border)', lcol = 'var(--app-text-2)';
            if (isRevealed) {
              cls += ' locked';
              if (isCorrectOp)        { cls += ' ok';  lbg='#4caf50'; lcol='white'; }
              else if (isSel)         { cls += ' bad'; lbg='#f44336'; lcol='white'; }
              else                    { cls += ' dim'; }
            } else if (isSel)         { cls += ' sel'; lbg='#1565c0'; lcol='white'; }
            return (
              <div key={opt} className={cls} onClick={() => !isRevealed && handleAnswer(q.id, opt)}>
                <span style={{ width:22, height:22, borderRadius:4, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0, background:lbg, color:lcol }}>
                  {opt}
                </span>
                <span>{txt}</span>
              </div>
            );
          })}
        </div>

        {/* Practice: Xem đáp án / Explanation */}
        {mode === 'practice' && (
          <div style={{ marginTop:8 }}>
            {!isRevealed && userAnswer && (
              <button onClick={() => handleReveal(q.id)}
                style={{ border:'1px solid var(--app-border)', background:'var(--app-surface-2)', color:'var(--app-text-3)',
                  borderRadius:5, padding:'5px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
                Xem đáp án
              </button>
            )}
            {isRevealed && (
              <div className={`toeic-feedback ${isCorrect?'ok':'bad'}`}>
                <div style={{ fontWeight:700, marginBottom: q.explanation?6:0 }}>
                  {isCorrect ? '✅ Chính xác!' : `❌ Đáp án đúng: ${q.correct_answer}`}
                </div>
                {q.explanation && <div style={{ lineHeight:1.7, marginTop:4 }}>{q.explanation}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ── Content panel (left): passage for Reading groups ── */
  const contentPanel = useMemo(() => {
    if (!currentGroup || section === 'listening') return null;
    const { group } = currentGroup;
    if (!group.audio_url && !group.image_url && !group.passage) return null;
    return (
      <div style={{ height:'100%', overflowY:'auto', padding:'18px 20px' }}>
        {group.audio_url && (
          <audio controls style={{ width:'100%', height:34, marginBottom:12 }} key={group.audio_url}>
            <source src={group.audio_url}/>
          </audio>
        )}
        {group.image_url && (
          <img src={group.image_url} alt="" style={{ maxWidth:'100%', borderRadius:6, marginBottom:12, display:'block' }}/>
        )}
        {group.passage && (
          <div style={{ whiteSpace:'pre-wrap', lineHeight:1.9, fontSize:14, color:'#212529' }}>
            {group.passage}
          </div>
        )}
      </div>
    );
  }, [currentGroup, section]);

  /* ── Questions panel ── */
  const renderQuestionsPanel = () => {
    if (!activePart) return null;
    const hasGrps = PART_INFO[activePart]?.hasGroup;

    if (!hasGrps) {
      const pqs = (questionsByPart[activePart] || []).filter(q => !retryIds || retryIds.has(q.id));
      if (!pqs.length) return <div style={{ color:'#adb5bd', textAlign:'center', padding:'40px 0', fontSize:14 }}>Không có câu nào cần ôn trong Part này</div>;
      return <>{pqs.map(q => renderQuestion(q))}</>;
    }

    if (!currentGroup) return <div style={{ color:'#adb5bd', textAlign:'center', padding:'40px 0' }}>Không có dữ liệu</div>;
    const gqs = currentGroup.questions.filter(q => !retryIds || retryIds.has(q.id));
    if (!gqs.length) return <div style={{ color:'#adb5bd', textAlign:'center', padding:'40px 0', fontSize:14 }}>Không có câu nào cần ôn trong nhóm này</div>;
    return <>{gqs.map(q => renderQuestion(q))}</>;
  };

  /* ── Loading ── */
  if (!test || !section) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height:'60vh' }}>
      <div className="spinner-border text-primary"/>
    </div>
  );

  /* ── Layout vars ── */
  const answered      = Object.keys(answers).length;
  const totalQ        = retryIds ? retryIds.size : questions.length;
  const hasGrps       = PART_INFO[activePart]?.hasGroup;
  const showGroupTabs = hasGrps && activePartGroups.length > 0;
  const showContent   = hasGrps && section === 'reading' && contentPanel !== null;
  const timerWarn     = timeLeft !== null && timeLeft < 300;

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'var(--app-bg)' }}>
      <style>{`
        .tsec { padding:8px 20px; border:none; background:transparent; font-weight:700; font-size:13px; cursor:pointer; color:var(--app-text-3); border-bottom:3px solid transparent; transition:all .15s; white-space:nowrap; }
        .tsec.on { color:#1565c0; border-bottom-color:#1565c0; }
        [data-bs-theme="dark"] .tsec.on { color:#7baef5; border-bottom-color:#7baef5; }
        .tpart { padding:7px 16px; border:1px solid var(--app-border); border-bottom:none; background:var(--app-surface-3); font-size:12px; font-weight:700; color:var(--app-text-3); cursor:pointer; border-radius:6px 6px 0 0; transition:all .12s; white-space:nowrap; }
        .tpart.on { background:var(--app-surface); color:#1565c0; }
        [data-bs-theme="dark"] .tpart.on { color:#7baef5; }
        .tpart:hover:not(.on) { background:var(--app-surface-2); }
        .tgrp { padding:5px 13px; border:1.5px solid var(--app-border); background:var(--app-surface); font-size:12px; font-weight:700; color:var(--app-text-2); cursor:pointer; border-radius:5px; white-space:nowrap; transition:all .12s; }
        .tgrp.on { background:#1565c0; color:white; border-color:#1565c0; }
        [data-bs-theme="dark"] .tgrp.on { background:#2563eb; border-color:#3b82f6; }
        .tgrp:hover:not(.on) { background:var(--app-surface-2); }
        .tqbtn { width:33px; height:33px; border-radius:5px; border:1.5px solid var(--app-border); background:var(--app-surface); font-size:11px; font-weight:700; cursor:pointer; color:var(--app-text-2); transition:all .1s; }
        .tqbtn:hover { border-color:#1565c0; }
        .tqbtn.done { background:#1565c0; color:white; border-color:#1565c0; }
        .tqbtn.grp  { outline:2px solid #f57c00; outline-offset:1px; }
        .tqbtn.wrong-done { background:#e53935; color:white; border-color:#e53935; }
        .toeic-qcard { background:var(--app-surface); border:1px solid var(--app-border); border-radius:8px; padding:16px 18px; margin-bottom:16px; }
        .toeic-opt { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:7px; border:1.5px solid var(--app-border); background:transparent; color:var(--app-text); cursor:pointer; margin-bottom:5px; transition:all .1s; font-size:13px; }
        .toeic-opt:hover { border-color:#1565c0; background:var(--app-surface-2); }
        .toeic-opt.sel  { border-color:#1565c0; background:rgba(21,101,192,.1); }
        .toeic-opt.ok   { border-color:var(--correct-border)!important; background:var(--correct-bg)!important; color:var(--app-text)!important; }
        .toeic-opt.bad  { border-color:var(--wrong-border)!important;   background:var(--wrong-bg)!important;   color:var(--app-text)!important; }
        .toeic-opt.dim  { opacity:.4; cursor:default; }
        .toeic-opt.locked { cursor:default; }
        .toeic-feedback { border-radius:6px; padding:10px 14px; font-size:13px; margin-top:8px; }
        .toeic-feedback.ok  { background:var(--correct-bg); border:1px solid var(--correct-border); color:var(--correct-text); }
        .toeic-feedback.bad { background:var(--hint-bg);    border:1px solid var(--hint-border);    color:var(--hint-text);    }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background:'var(--app-surface)', borderBottom:'1px solid var(--app-border)', padding:'8px 16px',
        display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={() => navigate('/toeic')}
          style={{ border:'none', background:'none', color:'#6c757d', cursor:'pointer', fontSize:18, padding:'0 4px' }}>←</button>
        <span style={{ fontWeight:700, fontSize:14, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {test.title}
          {mode === 'practice' && <span style={{ marginLeft:8, fontSize:11, background:'#e8f5e9', color:'#2e7d32', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>LUYỆN TẬP</span>}
          {retryIds && <span style={{ marginLeft:8, fontSize:11, background:'#fff3e0', color:'#e65100', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>ÔN LẠI {retryIds.size} CÂU SAI</span>}
        </span>
        <span style={{ fontSize:12, color:'#6c757d', whiteSpace:'nowrap' }}>{answered}/{totalQ}</span>
        {timeLeft !== null && (
          <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:15, color:timerWarn?'#c62828':'#1565c0', whiteSpace:'nowrap' }}>
            ⏱ {fmtTime(timeLeft)}
          </span>
        )}
        {/* Practice actions */}
        {mode === 'practice' && !reviewMode && (
          <>
            <button onClick={handleEnterReview}
              style={{ border:'1px solid #dee2e6', background:'#f8f9fa', color:'#495057', borderRadius:6, padding:'5px 12px', fontSize:12, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}>
              Xem lại bài
            </button>
            <button onClick={handleRetryWrong}
              style={{ border:'1px solid #f44336', background:'#ffebee', color:'#c62828', borderRadius:6, padding:'5px 12px', fontSize:12, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}>
              Ôn lại câu sai
            </button>
          </>
        )}
        {mode === 'practice' && reviewMode && (
          <button onClick={() => { setReviewMode(false); setRetryIds(null); const all={}; setRevealed(all); }}
            style={{ border:'1px solid #dee2e6', background:'#f8f9fa', color:'#495057', borderRadius:6, padding:'5px 12px', fontSize:12, cursor:'pointer', fontWeight:600 }}>
            Tiếp tục làm
          </button>
        )}
        <button className="btn btn-primary btn-sm px-3" onClick={handleSubmit} disabled={submitting}>
          {submitting && <span className="spinner-border spinner-border-sm me-1"/>}
          Nộp bài
        </button>
      </div>

      {/* ── SECTION TABS ── */}
      {(hasListening && hasReading) && (
        <div style={{ background:'var(--app-surface)', borderBottom:'1px solid var(--app-border)', display:'flex', flexShrink:0 }}>
          {hasListening && (
            <button className={`tsec ${section==='listening'?'on':''}`}
              onClick={() => { setSection('listening'); setActiveGroupIdx(0); }}>
              🎧 Listening
            </button>
          )}
          {hasReading && (
            <button className={`tsec ${section==='reading'?'on':''}`}
              onClick={() => { setSection('reading'); setActiveGroupIdx(0); }}>
              📖 Reading
            </button>
          )}
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* ── CENTER ── */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Part tabs */}
          <div style={{ background:'#f0f2f5', borderBottom:'1px solid #dee2e6', padding:'8px 16px 0',
            display:'flex', gap:4, flexShrink:0, flexWrap:'wrap' }}>
            {sectionParts.map(p => (
              <button key={p} className={`tpart ${activePart===p?'on':''}`}
                onClick={() => { setActivePart(p); setActiveGroupIdx(0); }}>
                Part {p} — {PART_INFO[p]?.label}
              </button>
            ))}
          </div>

          {/* 2-panel: content + questions */}
          <div style={{ flex:1, display:'flex', overflow:'hidden', background:'var(--app-surface-2)' }}>

            {/* Left: passage (only when reading group with content) */}
            {showContent && (
              <div style={{ width:'45%', background:'var(--app-surface)', borderRight:'1px solid var(--app-border)', overflow:'hidden' }}>
                {contentPanel}
              </div>
            )}
            {/* Left: blank placeholder for grouped listening */}
            {hasGrps && !showContent && (
              <div style={{ width:'45%', background:'var(--app-surface)', borderRight:'1px solid var(--app-border)',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'var(--app-border)', fontSize:13 }}>—</span>
              </div>
            )}

            {/* Right: questions */}
            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
              {renderQuestionsPanel()}
            </div>
          </div>

          {/* Fixed group tabs */}
          {showGroupTabs && (
            <div style={{ borderTop:'2px solid var(--app-border)', background:'var(--app-surface-3)', padding:'7px 14px',
              display:'flex', gap:5, flexShrink:0, overflowX:'auto', flexWrap:'nowrap' }}>
              {activePartGroups.map((grpObj, i) => {
                const nums  = grpObj.questions.map(q => q.question_num);
                const label = nums.length===1 ? `Q${nums[0]}` : `Questions ${Math.min(...nums)}–${Math.max(...nums)}`;
                return (
                  <button key={i} className={`tgrp ${activeGroupIdx===i?'on':''}`}
                    onClick={() => setActiveGroupIdx(i)}>
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ width:220, flexShrink:0, borderLeft:'1px solid var(--app-border)', background:'var(--app-surface)',
          display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Timer */}
          {timeLeft !== null && (
            <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--app-border-light)', textAlign:'center', flexShrink:0 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--app-text-3)', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>Thời gian</div>
              <div style={{ fontFamily:'monospace', fontSize:20, fontWeight:700, color:timerWarn?'#c62828':'#1565c0' }}>
                {fmtTime(timeLeft)}
              </div>
            </div>
          )}

          {/* Question navigator */}
          <div style={{ flex:1, overflowY:'auto', padding:'10px 12px' }}>
            {sectionParts.map(p => {
              const pqs    = (questionsByPart[p] || []).sort((a,b)=>a.question_num-b.question_num);
              const pGroups = groupsByPart[p] || [];
              return (
                <div key={p} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:800, color:'var(--app-text-2)', marginBottom:5, lineHeight:1.3 }}>
                    Part {p} – {PART_INFO[p]?.label}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                    {pqs.map(q => {
                      const inCurGrp = activePart===p && currentGroup?.questions.some(gq=>gq.id===q.id);
                      const inCurPart= activePart===p && !PART_INFO[p]?.hasGroup;
                      const isWrong  = reviewMode && answers[q.id] && answers[q.id] !== q.correct_answer;
                      const isDone   = !!answers[q.id];
                      return (
                        <button key={q.id}
                          className={`tqbtn ${isWrong?'wrong-done':isDone?'done':''} ${inCurGrp||inCurPart?'grp':''}`}
                          onClick={() => handleSidebarClick(q)}>
                          {q.question_num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
