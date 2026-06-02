import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';

// ── tiny modal ────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.4)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h6 className="modal-title fw-bold">{title}</h6>
            <button className="btn-close" onClick={onClose} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Shuffle for study ─────────────────────────────────────
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

function buildQuiz(cards) {
  if (cards.length < 2) return [];
  return shuffle(cards).slice(0, 10).map(card => {
    const wrongs = shuffle(cards.filter(c => c.id !== card.id)).slice(0, 3).map(c => c.meaning);
    while (wrongs.length < 3) wrongs.push('—');
    return { word: card.word, correct: card.meaning, options: shuffle([card.meaning, ...wrongs]) };
  });
}

// ─────────────────────────────────────────────────────────
// Study mode for a custom set
// ─────────────────────────────────────────────────────────
function SetStudy({ set, onBack }) {
  const cards = set.items || [];
  const [idx,       setIdx]       = useState(0);
  const [flipped,   setFlipped]   = useState(false);
  const [phase,     setPhase]     = useState('flash'); // 'flash'|'quiz'|'result'
  const [questions, setQuestions] = useState([]);
  const [answers,   setAnswers]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [ratings,   setRatings]   = useState({});

  const current = cards[idx];

  const rate = (r) => {
    setRatings(prev => ({ ...prev, [current.id]: r }));
    setFlipped(false);
    if (idx + 1 >= cards.length) {
      const qs = buildQuiz(cards);
      setQuestions(qs);
      setPhase(qs.length > 0 ? 'quiz' : 'result');
    } else {
      setIdx(i => i + 1);
    }
  };

  const quizScore = submitted
    ? questions.filter((q, i) => answers[i] === q.correct).length : 0;

  if (cards.length === 0)
    return (
      <div className="text-center py-5">
        <p className="text-muted">Bộ từ này chưa có từ vựng nào.</p>
        <button className="btn btn-outline-secondary" onClick={onBack}>← Quay lại</button>
      </div>
    );

  if (phase === 'quiz') return (
    <div>
      <button className="btn btn-link ps-0 mb-3 text-decoration-none" onClick={onBack}>← Quay lại</button>
      <h6 className="fw-bold mb-3">Bài tập kiểm tra — {set.name}</h6>
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        return (
          <div key={qi} className="card border-0 shadow-sm mb-3 p-3">
            <p className="fw-bold mb-2">Câu {qi + 1}: <span className="text-primary">{q.word}</span></p>
            <div className="row g-2">
              {q.options.map((opt, oi) => {
                const isChosen  = chosen === opt;
                const isCorrect = submitted && opt === q.correct;
                const isWrong   = submitted && isChosen && opt !== q.correct;
                return (
                  <div key={oi} className="col-md-6">
                    <div
                      onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: opt }))}
                      className={`p-2 rounded border ${
                        isCorrect ? 'border-success bg-success bg-opacity-10' :
                        isWrong   ? 'border-danger  bg-danger  bg-opacity-10' :
                        isChosen  ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                      }`}
                      style={{ cursor: submitted ? 'default' : 'pointer', fontSize: '.88rem' }}>
                      {opt}{isCorrect && ' ✅'}{isWrong && ' ❌'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {!submitted ? (
        <button className="btn btn-success w-100"
          disabled={Object.keys(answers).length < questions.length}
          onClick={() => setSubmitted(true)}>
          Nộp bài ({Object.keys(answers).length}/{questions.length} câu)
        </button>
      ) : (
        <div className="card border-0 bg-success-subtle p-3 text-center">
          <h6 className="fw-bold text-success">Kết quả: {quizScore}/{questions.length} câu đúng</h6>
          <button className="btn btn-outline-secondary btn-sm mt-2" onClick={onBack}>← Quay lại</button>
        </div>
      )}
    </div>
  );

  if (phase === 'result') return (
    <div className="text-center py-4">
      <div style={{ fontSize: 56 }}>🎉</div>
      <h6 className="fw-bold mt-2">Hoàn thành phiên học!</h6>
      <button className="btn btn-outline-secondary mt-3" onClick={onBack}>← Quay lại</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <button className="btn btn-link ps-0 mb-2 text-decoration-none" onClick={onBack}>← Quay lại</button>
      <h6 className="fw-semibold mb-3">{set.name} — Từ {idx + 1}/{cards.length}</h6>
      <div className="progress mb-3" style={{ height: 5 }}>
        <div className="progress-bar bg-success" style={{ width: `${(idx / cards.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div onClick={() => setFlipped(f => !f)} style={{
        minHeight: 220, borderRadius: 16, border: '1.5px solid var(--app-border)',
        boxShadow: '0 4px 20px rgba(0,0,0,.08)', background: 'var(--app-surface)',
        cursor: 'pointer', position: 'relative', userSelect: 'none',
      }}>
        <span style={{ position: 'absolute', bottom: 14, right: 16, fontSize: 20, color: 'var(--app-text-3)' }}>⟳</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, padding: '24px 32px' }}>
          {!flipped ? (
            <>
              <h3 style={{ fontWeight: 800, color: 'var(--app-text)' }}>{current?.word}</h3>
              {current?.phonetic && <p style={{ color: 'var(--rar-rare-c)' }}>/{current.phonetic}/</p>}
              <small className="text-muted">👆 Nhấn để xem nghĩa</small>
            </>
          ) : (
            <>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--correct-text)', textAlign: 'center' }}>{current?.meaning}</p>
              {current?.example && <p style={{ color: 'var(--app-text-3)', fontStyle: 'italic', fontSize: '.9rem', textAlign: 'center' }}>"{current.example}"</p>}
            </>
          )}
        </div>
      </div>

      {/* Rating buttons */}
      <div className="row g-2 mt-3">
        {[
          { r: 'easy',   icon: '😊', label: 'Dễ',        cls: 'outline-success' },
          { r: 'medium', icon: '😐', label: 'Trung bình', cls: 'outline-warning' },
          { r: 'hard',   icon: '😨', label: 'Khó',        cls: 'outline-danger'  },
        ].map(b => (
          <div key={b.r} className="col-4">
            <button className={`btn btn-${b.cls} w-100 d-flex flex-column align-items-center py-2`}
              style={{ borderRadius: 12 }} onClick={() => rate(b.r)}>
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              <small style={{ fontSize: 11 }}>{b.label}</small>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────
export default function MyVocabSetsPage() {
  const [sets,      setSets]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeSet, setActiveSet] = useState(null); // {set, mode:'study'|'edit'}

  // Modals
  const [showCreate,  setShowCreate]  = useState(false);
  const [createForm,  setCreateForm]  = useState({ name: '', description: '' });
  const [createSaving, setCreateSaving] = useState(false);

  const [editSetModal,  setEditSetModal]  = useState(null); // set object
  const [editSetForm,   setEditSetForm]   = useState({ name: '', description: '' });

  const [addItemModal,  setAddItemModal]  = useState(null); // set object
  const [addItemForm,   setAddItemForm]   = useState({ word: '', phonetic: '', meaning: '', example: '' });
  const [addItemSaving, setAddItemSaving] = useState(false);

  const [editItemModal, setEditItemModal] = useState(null); // item object with setId
  const [editItemForm,  setEditItemForm]  = useState({ word: '', phonetic: '', meaning: '', example: '' });

  const fetchSets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/vocab/my-sets');
      // Fetch each set's items count via detail endpoint — actually just show count from list
      setSets(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSetDetail = useCallback(async (setId) => {
    const res = await api.get(`/vocab/my-sets/${setId}`);
    return res.data.data;
  }, []);

  useEffect(() => { fetchSets(); }, [fetchSets]);

  // ── Create set ──
  const handleCreateSet = async () => {
    if (!createForm.name.trim()) return;
    setCreateSaving(true);
    try {
      await api.post('/vocab/my-sets', createForm);
      setShowCreate(false);
      setCreateForm({ name: '', description: '' });
      fetchSets();
    } finally {
      setCreateSaving(false);
    }
  };

  // ── Edit set ──
  const openEditSet = (set) => {
    setEditSetForm({ name: set.name, description: set.description || '' });
    setEditSetModal(set);
  };
  const handleEditSet = async () => {
    if (!editSetForm.name.trim()) return;
    await api.put(`/vocab/my-sets/${editSetModal.id}`, editSetForm);
    setEditSetModal(null);
    fetchSets();
    if (activeSet?.set?.id === editSetModal.id) {
      const updated = await fetchSetDetail(editSetModal.id);
      setActiveSet(prev => ({ ...prev, set: updated }));
    }
  };

  // ── Delete set ──
  const handleDeleteSet = async (setId) => {
    if (!window.confirm('Xóa bộ từ này?')) return;
    await api.delete(`/vocab/my-sets/${setId}`);
    fetchSets();
    if (activeSet?.set?.id === setId) setActiveSet(null);
  };

  // ── Open set (edit mode) ──
  const openSet = async (set, mode) => {
    const detail = await fetchSetDetail(set.id);
    setActiveSet({ set: detail, mode });
  };

  // ── Add item ──
  const openAddItem = (set) => {
    setAddItemForm({ word: '', phonetic: '', meaning: '', example: '' });
    setAddItemModal(set);
  };
  const handleAddItem = async () => {
    if (!addItemForm.word.trim() || !addItemForm.meaning.trim()) return;
    setAddItemSaving(true);
    try {
      await api.post(`/vocab/my-sets/${addItemModal.id}/items`, addItemForm);
      setAddItemModal(null);
      if (activeSet?.set?.id === addItemModal.id) {
        const updated = await fetchSetDetail(addItemModal.id);
        setActiveSet(prev => ({ ...prev, set: updated }));
      }
    } finally {
      setAddItemSaving(false);
    }
  };

  // ── Edit item ──
  const openEditItem = (item, setId) => {
    setEditItemForm({ word: item.word, phonetic: item.phonetic || '', meaning: item.meaning, example: item.example || '' });
    setEditItemModal({ ...item, setId });
  };
  const handleEditItem = async () => {
    await api.put(`/vocab/my-sets/items/${editItemModal.id}`, editItemForm);
    const updated = await fetchSetDetail(editItemModal.setId);
    setActiveSet(prev => ({ ...prev, set: updated }));
    setEditItemModal(null);
  };

  // ── Delete item ──
  const handleDeleteItem = async (itemId, setId) => {
    if (!window.confirm('Xóa từ này?')) return;
    await api.delete(`/vocab/my-sets/items/${itemId}`);
    const updated = await fetchSetDetail(setId);
    setActiveSet(prev => ({ ...prev, set: updated }));
  };

  // ─────────── ACTIVE SET VIEW ───────────
  if (activeSet) {
    if (activeSet.mode === 'study') {
      return (
        <div className="container py-4" style={{ maxWidth: 720 }}>
          <SetStudy set={activeSet.set} onBack={() => setActiveSet(null)} />
        </div>
      );
    }

    // Edit mode
    const { set } = activeSet;
    return (
      <div className="container py-4" style={{ maxWidth: 800 }}>
        <button className="btn btn-link ps-0 mb-3 text-decoration-none" onClick={() => setActiveSet(null)}>
          ← Quay lại bộ từ của tôi
        </button>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-0">{set.name}</h5>
            {set.description && <small className="text-muted">{set.description}</small>}
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => openEditSet(set)}>✏️ Sửa tên</button>
            <button className="btn btn-success btn-sm"
              disabled={!set.items?.length}
              onClick={() => setActiveSet(prev => ({ ...prev, mode: 'study' }))}>
              🎴 Học ngay
            </button>
          </div>
        </div>

        <button className="btn btn-primary btn-sm mb-3" onClick={() => openAddItem(set)}>
          + Thêm từ mới
        </button>

        {!set.items?.length ? (
          <div className="text-center text-muted py-5">Bộ từ chưa có từ vựng nào. Hãy thêm từ đầu tiên!</div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th><th>Từ</th><th>Phiên âm</th><th>Nghĩa</th><th>Ví dụ</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {set.items.map((item, i) => (
                    <tr key={item.id}>
                      <td className="text-muted small">{i + 1}</td>
                      <td className="fw-bold">{item.word}</td>
                      <td className="text-muted small">{item.phonetic ? `/${item.phonetic}/` : '—'}</td>
                      <td style={{ maxWidth: 200 }}>{item.meaning}</td>
                      <td className="text-muted fst-italic small" style={{ maxWidth: 180 }}>
                        {item.example ? `"${item.example}"` : '—'}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-outline-secondary btn-sm me-1"
                          onClick={() => openEditItem(item, set.id)}>✏️</button>
                        <button className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteItem(item.id, set.id)}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add item modal */}
        {addItemModal && (
          <Modal title="Thêm từ mới" onClose={() => setAddItemModal(null)}>
            <div className="modal-body">
              {[
                { key: 'word',     label: 'Từ vựng *',  ph: 'e.g. expose'      },
                { key: 'phonetic', label: 'Phiên âm',    ph: 'e.g. ɪkˈspəʊz'   },
                { key: 'meaning',  label: 'Nghĩa *',     ph: 'e.g. phơi bày'   },
                { key: 'example',  label: 'Ví dụ',       ph: 'e.g. Do not expose children to violence.' },
              ].map(f => (
                <div key={f.key} className="mb-3">
                  <label className="form-label small fw-semibold">{f.label}</label>
                  <input className="form-control" placeholder={f.ph}
                    value={addItemForm[f.key]}
                    onChange={e => setAddItemForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAddItemModal(null)}>Hủy</button>
              <button className="btn btn-primary" disabled={addItemSaving || !addItemForm.word || !addItemForm.meaning} onClick={handleAddItem}>
                {addItemSaving ? <span className="spinner-border spinner-border-sm me-1" /> : null}Thêm
              </button>
            </div>
          </Modal>
        )}

        {/* Edit item modal */}
        {editItemModal && (
          <Modal title="Sửa từ vựng" onClose={() => setEditItemModal(null)}>
            <div className="modal-body">
              {[
                { key: 'word',     label: 'Từ vựng *' },
                { key: 'phonetic', label: 'Phiên âm'  },
                { key: 'meaning',  label: 'Nghĩa *'   },
                { key: 'example',  label: 'Ví dụ'     },
              ].map(f => (
                <div key={f.key} className="mb-3">
                  <label className="form-label small fw-semibold">{f.label}</label>
                  <input className="form-control"
                    value={editItemForm[f.key]}
                    onChange={e => setEditItemForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditItemModal(null)}>Hủy</button>
              <button className="btn btn-primary" disabled={!editItemForm.word || !editItemForm.meaning} onClick={handleEditItem}>Lưu</button>
            </div>
          </Modal>
        )}

        {/* Edit set modal */}
        {editSetModal && (
          <Modal title="Sửa tên bộ từ" onClose={() => setEditSetModal(null)}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label small fw-semibold">Tên bộ từ *</label>
                <input className="form-control" value={editSetForm.name}
                  onChange={e => setEditSetForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Mô tả</label>
                <input className="form-control" value={editSetForm.description}
                  onChange={e => setEditSetForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditSetModal(null)}>Hủy</button>
              <button className="btn btn-primary" disabled={!editSetForm.name} onClick={handleEditSet}>Lưu</button>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // ─────────── SETS LIST ───────────
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">📚 Bộ flashcard của tôi</h4>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Tạo bộ mới</button>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : sets.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 56 }}>📂</div>
          <h6 className="mt-3">Bạn chưa có bộ flashcard nào</h6>
          <p className="small">Tạo bộ từ cá nhân để học theo cách của bạn!</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Tạo bộ mới</button>
        </div>
      ) : (
        <div className="row g-3">
          {sets.map(s => (
            <div key={s.id} className="col-sm-6 col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-1">{s.name}</h6>
                  {s.description && <p className="text-muted small mb-2">{s.description}</p>}
                  <small className="text-muted">Tạo: {new Date(s.created_at).toLocaleDateString('vi-VN')}</small>
                </div>
                <div className="card-footer bg-transparent border-0 pt-0">
                  <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-success btn-sm flex-fill"
                      onClick={() => openSet(s, 'study')}>🎴 Học</button>
                    <button className="btn btn-outline-primary btn-sm flex-fill"
                      onClick={() => openSet(s, 'edit')}>✏️ Quản lý</button>
                    <button className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteSet(s.id)}>🗑</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create set modal */}
      {showCreate && (
        <Modal title="Tạo bộ flashcard mới" onClose={() => setShowCreate(false)}>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label small fw-semibold">Tên bộ từ *</label>
              <input className="form-control" placeholder="e.g. TOEIC Part 5 của tôi"
                value={createForm.name}
                onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Mô tả</label>
              <input className="form-control" placeholder="Mô tả ngắn (tuỳ chọn)"
                value={createForm.description}
                onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Hủy</button>
            <button className="btn btn-primary"
              disabled={createSaving || !createForm.name.trim()}
              onClick={handleCreateSet}>
              {createSaving ? <span className="spinner-border spinner-border-sm me-1" /> : null}Tạo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
