import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const PART_INFO = {
  1: { label: 'Photographs',          skill: 'Listening', hasGroup: false },
  2: { label: 'Question-Response',    skill: 'Listening', hasGroup: false },
  3: { label: 'Short Conversations',  skill: 'Listening', hasGroup: true  },
  4: { label: 'Short Talks',          skill: 'Listening', hasGroup: true  },
  5: { label: 'Incomplete Sentences', skill: 'Reading',   hasGroup: false },
  6: { label: 'Text Completion',      skill: 'Reading',   hasGroup: true  },
  7: { label: 'Reading Comprehension',skill: 'Reading',   hasGroup: true  },
};
const OPTS = ['A', 'B', 'C', 'D'];

function fmtTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

export default function ToeicTestPage() {
  const { id }            = useParams();
  const [sp]              = useSearchParams();
  const navigate          = useNavigate();
  const mode              = sp.get('mode') === 'practice' ? 'practice' : 'mock';

  const [test,        setTest]        = useState(null);
  const [questions,   setQuestions]   = useState([]); // flat, ordered
  const [answers,     setAnswers]     = useState({}); // { qId: 'A'|'B'|'C'|'D' }
  const [revealed,    setRevealed]    = useState({}); // practice: { qId: true }
  const [activePart,  setActivePart]  = useState(null); // practice part selector
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [timeLeft,    setTimeLeft]    = useState(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [feedback,    setFeedback]    = useState(null); // { isCorrect, correctAnswer, explanation }
  const timerRef = useRef(null);

  /* ── Load test ── */
  useEffect(() => {
    api.get(`/toeic/tests/${id}`).then(r => {
      const data = r.data.data;
      setTest(data);
      const qs = data.questions || [];
      setQuestions(qs);
      if (mode === 'mock') {
        setTimeLeft((data.duration_minutes || 120) * 60);
      }
    });
  }, [id, mode]);

  /* ── Timer (mock only) ── */
  useEffect(() => {
    if (mode !== 'mock' || timeLeft === null) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, mode]);

  /* ── Questions for current part (practice) ── */
  const partQuestions = activePart
    ? questions.filter(q => q.part_num === activePart)
    : [];

  const currentQ = mode === 'practice' ? partQuestions[currentIdx] : questions[currentIdx];

  /* ── Answer handling ── */
  const handleAnswer = useCallback((opt) => {
    if (!currentQ) return;
    if (mode === 'practice' && revealed[currentQ.id]) return; // already answered

    setAnswers(prev => ({ ...prev, [currentQ.id]: opt }));

    if (mode === 'practice') {
      const isCorrect = opt === currentQ.correct_answer;
      setRevealed(prev => ({ ...prev, [currentQ.id]: true }));
      setFeedback({
        isCorrect,
        correctAnswer: currentQ.correct_answer,
        explanation: currentQ.explanation || '',
      });
    }
  }, [currentQ, mode, revealed]);

  /* ── Practice: next question ── */
  const handleFeedbackNext = () => {
    setFeedback(null);
    const list = partQuestions;
    if (currentIdx < list.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      // Practice part done — show summary
      const correct = list.filter(q => answers[q.id] === q.correct_answer).length;
      alert(`Hoàn thành Part ${activePart}!\n✅ ${correct}/${list.length} câu đúng`);
      setActivePart(null);
      setCurrentIdx(0);
      setRevealed({});
    }
  };

  /* ── Submit ── */
  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    if (mode === 'mock') {
      const unanswered = questions.filter(q => !answers[q.id]).length;
      if (unanswered > 0 && !window.confirm(`Còn ${unanswered} câu chưa trả lời. Nộp bài?`)) return;
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
      const { attempt_id, streak, achievements_unlocked, daily_task_completed, first_day_bonus, exp_earned } = r.data.data;
      navigate(`/toeic/result/${attempt_id}`, {
        state: { streak, achievements_unlocked, daily_task_completed, first_day_bonus, exp_earned },
      });
    } catch {
      alert('Lỗi khi nộp bài. Vui lòng thử lại.');
      setSubmitting(false);
    }
  }, [submitting, mode, questions, answers, test, timeLeft, id, navigate]);

  if (!test) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <div className="spinner-border text-primary"/>
    </div>
  );

  /* ────────────────── PRACTICE: Part Selector ────────────────── */
  if (mode === 'practice' && !activePart) {
    const parts = [...new Set(questions.map(q => q.part_num))].sort((a, b) => a - b);
    return (
      <div className="container py-5" style={{ maxWidth: 700 }}>
        <button className="btn btn-link text-muted p-0 mb-3" onClick={() => navigate('/toeic')}>
          ← Quay lại danh sách
        </button>
        <h3 className="fw-bold mb-1">{test.title}</h3>
        <p className="text-muted mb-4">Chọn Part để bắt đầu luyện tập</p>
        <div className="row g-3">
          {parts.map(p => {
            const info = PART_INFO[p] || {};
            const pqs = questions.filter(q => q.part_num === p);
            const answered = pqs.filter(q => revealed[q.id]).length;
            return (
              <div key={p} className="col-sm-6">
                <div className="card border rounded-3 p-3 h-100" style={{ cursor: 'pointer' }}
                  onClick={() => { setActivePart(p); setCurrentIdx(0); }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: 44, height: 44, background: info.skill === 'Listening' ? '#e3f2fd' : '#e8f5e9', color: info.skill === 'Listening' ? '#1565c0' : '#2e7d32', fontSize: 18 }}>
                      {info.skill === 'Listening' ? '🎧' : '📖'}
                    </div>
                    <div>
                      <div className="fw-bold">Part {p}</div>
                      <div className="text-muted small">{info.label}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>{pqs.length} câu</span>
                      <span>{answered}/{pqs.length} đã làm</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: '#e9ecef', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pqs.length ? (answered / pqs.length) * 100 : 0}%`, background: '#4caf50', borderRadius: 2 }}/>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {mode === 'practice' && questions.length > 0 && (
          <div className="mt-4 text-center">
            <button className="btn btn-primary px-5" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <span className="spinner-border spinner-border-sm me-2"/> : null}
              Nộp tất cả & Xem điểm
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ────────────────── PRACTICE: Question View ────────────────── */
  if (mode === 'practice') {
    const list = partQuestions;
    const q = currentQ;
    const info = PART_INFO[q?.part_num] || {};
    const isAnswered = q && revealed[q.id];
    const progress = list.length ? ((currentIdx + 1) / list.length) * 100 : 0;

    return (
      <div className="container py-4" style={{ maxWidth: 760 }}>
        <style>{`
          .tp-opt { display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:10px; border:2px solid #dee2e6; cursor:pointer; transition:all .15s; margin-bottom:8px; }
          .tp-opt:hover:not(.locked) { border-color:#1565c0; background:#f0f7ff; }
          .tp-opt.selected { border-color:#1565c0; background:#e3f0ff; }
          .tp-opt.correct { border-color:#2e7d32; background:#e8f5e9; }
          .tp-opt.wrong   { border-color:#c62828; background:#ffebee; }
          .tp-opt.dim     { opacity:.45; }
          .tp-fb-overlay { position:fixed; bottom:0; left:0; right:0; z-index:200; }
          .tp-fb-box { padding:20px 24px; border-top:4px solid; display:flex; align-items:center; gap:16px; }
          .tp-fb-box.correct { background:#e8f5e9; border-color:#4caf50; }
          .tp-fb-box.wrong   { background:#ffebee; border-color:#f44336; }
          .tp-fb-icon { font-size:28px; }
          .tp-audio-btn { border:none; background:#e3f2fd; color:#1565c0; border-radius:8px; padding:8px 16px; font-weight:600; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:6px; }
          .tp-audio-btn:hover { background:#bbdefb; }
        `}</style>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-link text-muted p-0" onClick={() => { setActivePart(null); setCurrentIdx(0); }}>
            ← Part {activePart}
          </button>
          <span className="text-muted small fw-semibold">{currentIdx + 1} / {list.length}</span>
        </div>

        {/* Progress */}
        <div style={{ height: 4, borderRadius: 2, background: '#e9ecef', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#1565c0', borderRadius: 2, transition: 'width .3s' }}/>
        </div>

        {/* Group context */}
        {q?.group && (
          <div className="card mb-4 border-0" style={{ background: '#f8f9fa' }}>
            <div className="card-body">
              {q.group.audio_url && (
                <audio controls className="w-100 mb-2" key={q.group.audio_url}>
                  <source src={q.group.audio_url}/>
                </audio>
              )}
              {q.group.image_url && (
                <img src={q.group.image_url} alt="" className="img-fluid rounded mb-2" style={{ maxHeight: 280 }}/>
              )}
              {q.group.passage && (
                <div className="small" style={{ whiteSpace: 'pre-wrap', maxHeight: 280, overflowY: 'auto', lineHeight: 1.7 }}>
                  {q.group.passage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Individual audio/image (Parts 1, 2) */}
        {!q?.group && q?.audio_url && (
          <audio controls className="w-100 mb-3" key={q.audio_url}>
            <source src={q.audio_url}/>
          </audio>
        )}
        {q?.image_url && (
          <img src={q.image_url} alt="" className="img-fluid rounded mb-3" style={{ maxHeight: 260 }}/>
        )}

        {/* Question */}
        <div className="mb-3">
          <span className="badge bg-secondary me-2">Q{q?.question_num || currentIdx + 1}</span>
          <span className="fw-semibold">{q?.question_text || `(Nghe audio và chọn đáp án)`}</span>
        </div>

        {/* Options */}
        <div>
          {OPTS.filter(o => q?.[`option_${o.toLowerCase()}`]).map(opt => {
            const txt = q[`option_${opt.toLowerCase()}`];
            const isSelected = answers[q.id] === opt;
            const isCorrectOpt = q.correct_answer === opt;
            let cls = 'tp-opt';
            if (isAnswered) {
              cls += ' locked';
              if (isCorrectOpt)           cls += ' correct';
              else if (isSelected)        cls += ' wrong';
              else                        cls += ' dim';
            } else if (isSelected)        cls += ' selected';
            return (
              <div key={opt} className={cls} onClick={() => handleAnswer(opt)}>
                <span className={`badge ${isAnswered && isCorrectOpt ? 'bg-success' : isAnswered && isSelected ? 'bg-danger' : 'bg-light border text-muted'}`}
                  style={{ width: 24, flexShrink: 0 }}>{opt}</span>
                <span>{txt}</span>
              </div>
            );
          })}
        </div>

        {/* Feedback overlay */}
        {feedback && (
          <div className="tp-fb-overlay">
            <div className={`tp-fb-box ${feedback.isCorrect ? 'correct' : 'wrong'}`}>
              <div className="tp-fb-icon">{feedback.isCorrect ? '✅' : '❌'}</div>
              <div style={{ flex: 1 }}>
                <div className="fw-bold">{feedback.isCorrect ? 'Correct!' : `Incorrect — Đáp án: ${feedback.correctAnswer}`}</div>
                {feedback.explanation && <div className="small text-muted mt-1">{feedback.explanation}</div>}
              </div>
              <button className="btn btn-primary px-4" onClick={handleFeedbackNext}>
                {currentIdx < list.length - 1 ? 'Next →' : 'Xem kết quả Part'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ────────────────── MOCK TEST ────────────────── */
  const parts = [...new Set(questions.map(q => q.part_num))].sort((a, b) => a - b);
  const answered = Object.keys(answers).length;
  const q = currentQ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        .mock-opt { display:flex; align-items:center; gap:12px; padding:14px 16px; border-radius:10px; border:2px solid #dee2e6; cursor:pointer; transition:all .15s; margin-bottom:8px; }
        .mock-opt:hover { border-color:#1565c0; background:#f0f7ff; }
        .mock-opt.selected { border-color:#1565c0; background:#e3f0ff; }
        .mock-qbtn { width:36px; height:36px; border-radius:6px; border:1.5px solid #dee2e6; background:none; font-size:12px; font-weight:600; cursor:pointer; transition:all .12s; }
        .mock-qbtn:hover { border-color:#1565c0; }
        .mock-qbtn.answered { background:#1565c0; color:white; border-color:#1565c0; }
        .mock-qbtn.active { outline:2px solid #f57c00; outline-offset:1px; }
        .mock-sidebar { width:260px; flex-shrink:0; border-right:1px solid #dee2e6; overflow-y:auto; padding:16px; background:#fafafa; }
        .mock-main { flex:1; overflow-y:auto; padding:24px; }
        .mock-header { background:white; border-bottom:1px solid #dee2e6; padding:10px 20px; display:flex; align-items:center; gap:16px; flex-shrink:0; }
        .mock-timer { font-family:monospace; font-size:1.15rem; font-weight:700; color:${timeLeft !== null && timeLeft < 300 ? '#c62828' : '#1565c0'}; }
      `}</style>

      {/* Header */}
      <div className="mock-header">
        <button className="btn btn-link text-muted p-0 me-2" onClick={() => navigate('/toeic')}>←</button>
        <div className="fw-bold flex-fill text-truncate">{test.title}</div>
        {timeLeft !== null && (
          <div className="mock-timer d-flex align-items-center gap-1">
            ⏱ {fmtTime(timeLeft)}
          </div>
        )}
        <div className="text-muted small me-3">{answered}/{questions.length}</div>
        <button className="btn btn-primary btn-sm px-3" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <span className="spinner-border spinner-border-sm me-1"/> : null}
          Nộp bài
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar: navigator */}
        <div className="mock-sidebar">
          {parts.map(p => {
            const pqs = questions.filter(q => q.part_num === p);
            const startIdx = questions.findIndex(q => q.part_num === p);
            return (
              <div key={p} className="mb-3">
                <div className="small fw-bold text-muted mb-1">Part {p} — {PART_INFO[p]?.label}</div>
                <div className="d-flex flex-wrap gap-1">
                  {pqs.map((pq, i) => {
                    const gIdx = startIdx + i;
                    return (
                      <button key={pq.id}
                        className={`mock-qbtn ${answers[pq.id] ? 'answered' : ''} ${currentIdx === gIdx ? 'active' : ''}`}
                        onClick={() => setCurrentIdx(gIdx)}>
                        {pq.question_num || gIdx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main: current question */}
        <div className="mock-main">
          {!q ? (
            <div className="text-center text-muted py-5">Chọn câu hỏi từ menu bên trái</div>
          ) : (
            <>
              {/* Group context */}
              {q.group && (
                <div className="card mb-4 border-0 bg-light">
                  <div className="card-body">
                    {q.group.audio_url && (
                      <audio controls className="w-100 mb-2" key={q.group.audio_url}>
                        <source src={q.group.audio_url}/>
                      </audio>
                    )}
                    {q.group.image_url && (
                      <img src={q.group.image_url} alt="" className="img-fluid rounded mb-2" style={{ maxHeight: 280 }}/>
                    )}
                    {q.group.passage && (
                      <div className="small border rounded p-3 bg-white" style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto', lineHeight: 1.75 }}>
                        {q.group.passage}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Individual audio / image */}
              {!q.group && q.audio_url && (
                <audio controls className="w-100 mb-3" key={q.audio_url}>
                  <source src={q.audio_url}/>
                </audio>
              )}
              {q.image_url && (
                <img src={q.image_url} alt="" className="img-fluid rounded mb-3" style={{ maxHeight: 260 }}/>
              )}

              {/* Question */}
              <div className="d-flex align-items-baseline gap-2 mb-3">
                <span className="badge bg-secondary">Q{q.question_num || currentIdx + 1}</span>
                <span className="fw-semibold">{q.question_text || '(Nghe audio và chọn đáp án)'}</span>
              </div>

              {/* Options */}
              {OPTS.filter(o => q[`option_${o.toLowerCase()}`]).map(opt => (
                <div key={opt}
                  className={`mock-opt ${answers[q.id] === opt ? 'selected' : ''}`}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}>
                  <span className={`badge ${answers[q.id] === opt ? 'bg-primary' : 'bg-light border text-muted'}`}
                    style={{ width: 24, flexShrink: 0 }}>{opt}</span>
                  <span>{q[`option_${opt.toLowerCase()}`]}</span>
                </div>
              ))}

              {/* Navigation */}
              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-secondary" disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(i => i - 1)}>← Câu trước</button>
                <button className="btn btn-outline-primary" disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx(i => i + 1)}>Câu tiếp →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
