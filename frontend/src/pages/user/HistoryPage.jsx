import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function fmtTime(s) {
  if (!s) return '—';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${ss}s`;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/toeic/history')
      .then(r => setHistory(r.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h3 className="fw-bold mb-4">Lịch Sử Làm Bài</h3>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"/></div>
      ) : !history.length ? (
        <div className="text-center text-muted py-5">
          <div style={{ fontSize: 48 }}>📋</div>
          <p className="mt-2">Bạn chưa làm bài thi nào</p>
          <button className="btn btn-primary mt-2" onClick={() => navigate('/toeic')}>Luyện thi ngay</button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Đề thi</th>
                <th>Chế độ</th>
                <th className="text-center">Tổng điểm</th>
                <th className="text-center">Listening</th>
                <th className="text-center">Reading</th>
                <th className="text-center">Thời gian</th>
                <th>Ngày nộp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td className="fw-semibold">{h.title}</td>
                  <td>
                    <span className={`badge ${h.mode === 'mock_test' ? 'bg-danger' : 'bg-success'}`}>
                      {h.mode === 'mock_test' ? 'Thi thử' : 'Luyện tập'}
                    </span>
                  </td>
                  <td className="text-center">
                    <strong style={{ color: h.total_score >= 600 ? '#2e7d32' : h.total_score >= 400 ? '#e65100' : '#c62828' }}>
                      {h.total_score}
                    </strong>
                    <span className="text-muted small">/990</span>
                  </td>
                  <td className="text-center text-muted small">{h.listening_score}<span className="text-muted">/495</span></td>
                  <td className="text-center text-muted small">{h.reading_score}<span className="text-muted">/495</span></td>
                  <td className="text-center text-muted small">{fmtTime(h.time_taken_seconds)}</td>
                  <td className="text-muted small">{new Date(h.completed_at).toLocaleString('vi-VN')}</td>
                  <td>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => navigate(`/toeic/result/${h.id}`)}>
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
