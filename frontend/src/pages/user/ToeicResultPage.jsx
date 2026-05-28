import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';

const PART_INFO = {
  1: { label: 'Photographs',           skill: 'Listening' },
  2: { label: 'Question-Response',     skill: 'Listening' },
  3: { label: 'Short Conversations',   skill: 'Listening' },
  4: { label: 'Short Talks',           skill: 'Listening' },
  5: { label: 'Incomplete Sentences',  skill: 'Reading'   },
  6: { label: 'Text Completion',       skill: 'Reading'   },
  7: { label: 'Reading Comprehension', skill: 'Reading'   },
};
const OPTS = ['A', 'B', 'C', 'D'];

function ScoreRing({ score, max = 495, label, color }) {
  const pct = Math.min(score / max, 1);
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="text-center">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e9ecef" strokeWidth="10"/>
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${pct * c} ${c}`}
          strokeDashoffset={c / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}/>
        <text x="65" y="60" textAnchor="middle" fontSize="24" fontWeight="700" fill={color}>{score}</text>
        <text x="65" y="78" textAnchor="middle" fontSize="11" fill="#6c757d">/ {max}</text>
      </svg>
      <div className="fw-semibold small">{label}</div>
    </div>
  );
}

function fmtTime(s) {
  if (!s) return '—';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${ss}s`;
}

export default function ToeicResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const gamData = location.state || {};
  const [result, setResult] = useState(null);
  const [showWrong, setShowWrong] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/toeic/results/${attemptId}`)
      .then(r => setResult(r.data.data))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
      <div className="spinner-border text-primary"/>
    </div>
  );
  if (!result) return (
    <div className="text-center py-5 text-muted">Không tìm thấy kết quả</div>
  );

  const answers = result.answers || [];
  const partScores = typeof result.part_scores === 'string'
    ? JSON.parse(result.part_scores || '{}') : (result.part_scores || {});

  const totalQ = answers.length;
  const totalCorrect = answers.filter(a => a.is_correct).length;
  const wrongAnswers = answers.filter(a => !a.is_correct);

  const totalScore = result.total_score || 0;
  const listeningScore = result.listening_score || 0;
  const readingScore = result.reading_score || 0;

  const getLevel = (score) => {
    if (score >= 900) return { label: 'C2 — Mastery', color: '#7b1fa2' };
    if (score >= 785) return { label: 'C1 — Effective', color: '#1565c0' };
    if (score >= 605) return { label: 'B2 — Vantage', color: '#0288d1' };
    if (score >= 405) return { label: 'B1 — Threshold', color: '#2e7d32' };
    if (score >= 225) return { label: 'A2 — Waystage', color: '#f57c00' };
    return { label: 'A1 — Breakthrough', color: '#c62828' };
  };
  const level = getLevel(totalScore);

  return (
    <div className="container py-5" style={{ maxWidth: 860 }}>
      <style>{`
        .res-card { border-radius:12px; border:none; box-shadow:0 2px 12px rgba(0,0,0,.07); }
        .part-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f0f0f0; }
        .part-bar { flex:1; height:8px; border-radius:4px; background:#e9ecef; overflow:hidden; }
        .part-fill { height:100%; border-radius:4px; transition: width 1s ease; }
        .wrong-card { border-left:4px solid #f44336; border-radius:8px; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,.06); }
      `}</style>

      <button className="btn btn-link text-muted p-0 mb-4" onClick={() => navigate('/toeic')}>
        ← Quay lại danh sách đề thi
      </button>

      {/* Score header */}
      <div className="res-card card mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center g-4">
            <div className="col-md-4 text-center">
              <div className="fw-bold text-muted small mb-1">TOEIC Score</div>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: '#1565c0', lineHeight: 1 }}>{totalScore}</div>
              <div className="text-muted small">/ 990</div>
              <div className="mt-2 px-3 py-1 rounded-pill d-inline-block fw-semibold small"
                style={{ background: level.color + '18', color: level.color }}>
                {level.label}
              </div>
            </div>
            <div className="col-md-4">
              <ScoreRing score={listeningScore} label="Listening" color="#1565c0"/>
            </div>
            <div className="col-md-4">
              <ScoreRing score={readingScore} label="Reading" color="#2e7d32"/>
            </div>
          </div>

          <div className="row g-3 mt-3 text-center">
            {[
              ['Tổng câu', `${totalCorrect}/${totalQ}`],
              ['Thời gian', fmtTime(result.time_taken_seconds)],
              ['Chế độ', result.mode === 'mock_test' ? 'Thi thử' : 'Luyện tập'],
              ['Đề thi', result.title || '—'],
            ].map(([lbl, val]) => (
              <div key={lbl} className="col-6 col-md-3">
                <div className="text-muted small">{lbl}</div>
                <div className="fw-semibold">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gamification panel */}
      {(gamData.exp_earned || gamData.achievements_unlocked?.length > 0 || gamData.streak?.current > 1) && (
        <div className="res-card card mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              {gamData.exp_earned > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, padding: '4px 16px', fontWeight: 700, color: '#92400e', fontSize: '.88rem' }}>
                  ✦ +{gamData.exp_earned} EXP
                  {gamData.first_day_bonus && <span style={{ fontWeight: 400, fontSize: '.75rem', marginLeft: 6, color: '#d97706' }}>· 2× hôm nay!</span>}
                  {gamData.daily_task_completed && <span style={{ fontWeight: 400, fontSize: '.75rem', marginLeft: 6 }}>· Daily done!</span>}
                </div>
              )}
              {gamData.streak?.current > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontWeight: 600, fontSize: '.85rem' }}>
                  🔥 {gamData.streak.current} ngày liên tiếp
                  {gamData.streak.multiplier > 1 && (
                    <span style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '1px 8px', fontWeight: 700 }}>
                      {gamData.streak.multiplier}× EXP
                    </span>
                  )}
                  {gamData.streak.milestone && (
                    <span style={{ color: '#d97706' }}>🏅 {gamData.streak.milestone} ngày!</span>
                  )}
                </div>
              )}
            </div>

            {gamData.achievements_unlocked?.length > 0 && (
              <div style={{ marginTop: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', color: '#92400e', marginBottom: 8, textTransform: 'uppercase' }}>
                  🏆 Thành tích mở khóa!
                </div>
                <div className="d-flex flex-wrap gap-3">
                  {gamData.achievements_unlocked.map(a => (
                    <div key={a.code} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                      <span style={{ fontWeight: 600 }}>{a.name}</span>
                      {a.exp_reward > 0 && <span style={{ color: '#059669', fontSize: '.72rem' }}>+{a.exp_reward} EXP</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Part breakdown */}
      <div className="res-card card mb-4">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3">Kết quả theo Part</h6>
          <div className="row g-0">
            {[
              { skill: 'Listening', parts: [1, 2, 3, 4], color: '#1565c0' },
              { skill: 'Reading',   parts: [5, 6, 7],    color: '#2e7d32' },
            ].map(({ skill, parts, color }) => (
              <div key={skill} className="col-md-6 pe-md-3">
                <div className="fw-semibold mb-2 small text-uppercase" style={{ color, letterSpacing: '.06em' }}>
                  {skill === 'Listening' ? '🎧' : '📖'} {skill}
                </div>
                {parts.map(p => {
                  const st = partScores[p] || {};
                  const pct = st.total ? (st.correct / st.total) * 100 : 0;
                  return (
                    <div key={p} className="part-row">
                      <div style={{ width: 54, flexShrink: 0 }}>
                        <span className="fw-semibold small">Part {p}</span>
                      </div>
                      <div className="part-bar">
                        <div className="part-fill" style={{ width: `${pct}%`, background: pct >= 70 ? '#4caf50' : pct >= 50 ? '#ff9800' : '#f44336' }}/>
                      </div>
                      <div className="text-muted small" style={{ width: 60, textAlign: 'right', flexShrink: 0 }}>
                        {st.correct ?? 0}/{st.total ?? 0}
                      </div>
                      <div className="fw-semibold small" style={{ width: 44, textAlign: 'right', flexShrink: 0, color: pct >= 70 ? '#2e7d32' : pct >= 50 ? '#e65100' : '#c62828' }}>
                        {Math.round(pct)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wrong answers review */}
      {wrongAnswers.length > 0 && (
        <div className="res-card card mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Câu sai ({wrongAnswers.length})</h6>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowWrong(w => !w)}>
                {showWrong ? 'Ẩn' : 'Xem'}
              </button>
            </div>
            {showWrong && (
              <div className="d-flex flex-column gap-3">
                {wrongAnswers.map((a, i) => (
                  <div key={a.question_id} className="wrong-card p-3">
                    <div className="d-flex gap-2 mb-1">
                      <span className="badge bg-secondary">Part {a.part_num}</span>
                      <span className="badge bg-light border text-muted">Q{a.question_num}</span>
                    </div>
                    {a.passage && (
                      <div className="small text-muted bg-light rounded p-2 mb-2"
                        style={{ maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {a.passage.slice(0, 400)}{a.passage.length > 400 ? '...' : ''}
                      </div>
                    )}
                    <p className="mb-2 small fw-semibold">{a.question_text || '(Câu hỏi nghe)'}</p>
                    <div className="row g-1 mb-2">
                      {OPTS.filter(o => a[`option_${o.toLowerCase()}`]).map(opt => {
                        const isCorrect = a.correct_answer === opt;
                        const isChosen  = a.chosen === opt;
                        return (
                          <div key={opt} className="col-6">
                            <div className={`small d-flex gap-1 align-items-center px-2 py-1 rounded ${isCorrect ? 'bg-success bg-opacity-15 text-success fw-semibold' : isChosen ? 'bg-danger bg-opacity-15 text-danger' : 'text-muted'}`}>
                              <span className={`badge ${isCorrect ? 'bg-success' : isChosen ? 'bg-danger' : 'bg-light border text-muted'}`}>{opt}</span>
                              {a[`option_${opt.toLowerCase()}`]}
                              {isCorrect && ' ✓'}
                              {isChosen && !isCorrect && ' ✗'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {a.explanation && (
                      <div className="small text-muted border-start border-3 ps-2">{a.explanation}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="d-flex gap-3 justify-content-center">
        <button className="btn btn-outline-primary px-4" onClick={() => navigate(`/toeic/${result.test_id}?mode=practice`)}>
          Luyện tập lại
        </button>
        <button className="btn btn-primary px-4" onClick={() => navigate(`/toeic/${result.test_id}?mode=mock`)}>
          Thi thử lại
        </button>
        <button className="btn btn-outline-secondary px-4" onClick={() => navigate('/toeic')}>
          Đề thi khác
        </button>
      </div>
    </div>
  );
}
