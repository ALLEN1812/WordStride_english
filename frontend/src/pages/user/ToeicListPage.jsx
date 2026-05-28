import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const TYPE_LABEL = { full_test: 'Full Test', mini_test: 'Mini Test', practice_set: 'Practice Set' };
const DIFF_COLOR = { easy: 'success', medium: 'warning', hard: 'danger' };
const STATUS_COLOR = { public: 'success', draft: 'secondary', hidden: 'warning', archived: 'dark' };

export default function ToeicListPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all'|'full_test'|'mini_test'|'practice_set'

  useEffect(() => {
    api.get('/toeic/tests')
      .then(r => setTests(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tests : tests.filter(t => t.type === filter);

  return (
    <div className="container py-5" style={{ maxWidth: 1000 }}>
      <style>{`
        .toeic-card {
          border-radius: 12px;
          transition: transform .18s, box-shadow .18s;
          cursor: pointer;
          overflow: hidden;
        }
        .toeic-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(0,0,0,.12) !important;
        }
        .toeic-score-bar { height: 6px; border-radius: 3px; background: #e9ecef; overflow: hidden; }
        .toeic-score-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #4caf50, #2196f3); }
        .toeic-hero {
          background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%);
          color: white;
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }
        .toeic-hero::after {
          content: 'TOEIC';
          position: absolute; right: 40px; top: 50%; transform: translateY(-50%);
          font-size: 100px; font-weight: 900; opacity: .08;
          letter-spacing: -4px;
        }
        .toeic-type-btn {
          padding: 7px 18px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid #dee2e6;
          background: none;
          transition: all .15s;
        }
        .toeic-type-btn.active {
          background: #1565c0;
          color: white;
          border-color: #1565c0;
        }
        .toeic-type-btn:hover:not(.active) {
          border-color: #1565c0;
          color: #1565c0;
        }
        .toeic-part-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(21,101,192,.1);
          color: #1565c0;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
        }
      `}</style>

      {/* Hero */}
      <div className="toeic-hero">
        <h1 className="fw-bold mb-1" style={{ fontSize: '2rem', position: 'relative' }}>TOEIC Practice</h1>
        <p className="mb-3 opacity-75" style={{ position: 'relative' }}>
          Luyện thi TOEIC với đề thi chuẩn định dạng ETS — Listening & Reading
        </p>
        <div className="d-flex gap-4" style={{ position: 'relative' }}>
          {[['200', 'câu/Full Test'], ['120', 'phút'], ['990', 'điểm tối đa']].map(([val, lbl]) => (
            <div key={lbl}>
              <div className="fw-bold" style={{ fontSize: '1.4rem' }}>{val}</div>
              <div style={{ fontSize: '12px', opacity: .7 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + count */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2 flex-wrap">
          {[['all','Tất cả'], ['full_test','Full Test'], ['mini_test','Mini Test'], ['practice_set','Practice Set']].map(([val, lbl]) => (
            <button key={val} className={`toeic-type-btn ${filter === val ? 'active' : ''}`}
              onClick={() => setFilter(val)}>{lbl}
            </button>
          ))}
        </div>
        <span className="text-muted small">{filtered.length} đề thi</span>
      </div>

      {/* Test list */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
      ) : !filtered.length ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 48 }}>📋</div>
          <p className="mt-2">Chưa có đề thi nào. Hãy quay lại sau.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map(test => (
            <div key={test.id} className="col-md-6">
              <div className="toeic-card card border shadow-sm h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge bg-${DIFF_COLOR[test.difficulty]}`}>{test.difficulty}</span>
                    <span className="text-muted small">{parseInt(test.question_count) || 0} câu</span>
                  </div>
                  <h5 className="fw-bold mb-1">{test.title}</h5>
                  <p className="text-muted small mb-3" style={{ minHeight: 36 }}>
                    {test.description || 'Đề thi TOEIC chuẩn ETS định dạng.'}
                  </p>

                  <div className="d-flex gap-2 flex-wrap mb-3">
                    <span className="toeic-part-badge">🎧 Listening</span>
                    <span className="toeic-part-badge">📖 Reading</span>
                    <span className="toeic-part-badge">⏱ {test.duration_minutes} phút</span>
                    <span className="toeic-part-badge">{TYPE_LABEL[test.type]}</span>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary flex-fill"
                      onClick={() => navigate(`/toeic/${test.id}?mode=practice`)}>
                      Luyện tập
                    </button>
                    <button className="btn btn-primary flex-fill"
                      onClick={() => navigate(`/toeic/${test.id}?mode=mock`)}>
                      Thi thử
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TOEIC info section */}
      <div className="mt-5 p-4 rounded-3 bg-light">
        <h6 className="fw-bold mb-3">Cấu trúc đề thi TOEIC</h6>
        <div className="row g-3">
          {[
            { skill: '🎧 Listening', parts: [['Part 1','Photographs','6 câu'], ['Part 2','Question-Response','25 câu'], ['Part 3','Short Conversations','39 câu'], ['Part 4','Short Talks','30 câu']] },
            { skill: '📖 Reading', parts: [['Part 5','Incomplete Sentences','30 câu'], ['Part 6','Text Completion','16 câu'], ['Part 7','Reading Comprehension','54 câu']] },
          ].map(({ skill, parts }) => (
            <div key={skill} className="col-md-6">
              <div className="fw-semibold mb-2">{skill}</div>
              {parts.map(([p, lbl, cnt]) => (
                <div key={p} className="d-flex justify-content-between small py-1 border-bottom">
                  <span><strong>{p}</strong> — {lbl}</span>
                  <span className="text-muted">{cnt}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
