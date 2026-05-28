import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axios';

const DIFFICULTIES = [
  { value: 'beginner',     label: 'Cơ bản',    color: '#10b981' },
  { value: 'intermediate', label: 'Trung cấp', color: '#f59e0b' },
  { value: 'advanced',     label: 'Nâng cao',  color: '#ef4444' },
];

const STATUSES = [
  { value: 'published', label: 'Công khai', color: '#10b981' },
  { value: 'draft',     label: 'Nháp',      color: '#6b7280' },
  { value: 'hidden',    label: 'Ẩn',        color: '#f59e0b' },
  { value: 'archived',  label: 'Lưu trữ',   color: '#8b5cf6' },
];

const WORD_TYPES = ['noun', 'verb', 'adjective', 'adverb', 'phrase', 'preposition', 'conjunction', 'other'];

const DiffBadge = ({ d }) => {
  const opt = DIFFICULTIES.find(x => x.value === d) || DIFFICULTIES[0];
  return <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:6, background: opt.color+'22', color: opt.color, fontSize:11, fontWeight:600 }}>{opt.label}</span>;
};

const StatusBadge = ({ s }) => {
  const opt = STATUSES.find(x => x.value === s) || STATUSES[0];
  return <span style={{ display:'inline-block', padding:'2px 8px', borderRadius:6, background: opt.color+'22', color: opt.color, fontSize:11, fontWeight:600 }}>{opt.label}</span>;
};

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuote = false;
  for (const ch of line) {
    if (ch === '"') { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { result.push(current); current = ''; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}

const EMPTY_TOPIC = { name: '', description: '', category: '', difficulty: 'beginner', thumbnail: '', status: 'published' };
const EMPTY_CARD  = { word: '', phonetic: '', meaning: '', word_type: '', example: '', notes: '', image_url: '', audio_url: '' };

export default function AdminVocabPage() {
  const [view, setView]         = useState('topics');
  const [topics, setTopics]     = useState([]);
  const [cards, setCards]       = useState([]);
  const [selTopic, setSelTopic] = useState(null);
  const [stats, setStats]       = useState({ topics: 0, cards: 0, published: 0, draft: 0 });

  const [topicModal, setTopicModal]   = useState(null);
  const [cardModal, setCardModal]     = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [delConfirm, setDelConfirm]   = useState(null);

  const [topicForm, setTopicForm] = useState(EMPTY_TOPIC);
  const [cardForm, setCardForm]   = useState(EMPTY_CARD);
  const [editId, setEditId]       = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const [importData, setImportData]     = useState([]);
  const [importStatus, setImportStatus] = useState('');
  const fileRef = useRef();

  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDiff, setFilterDiff]   = useState('');
  const [cardSearch, setCardSearch]   = useState('');

  const loadTopics = useCallback(async () => {
    const r = await api.get('/vocab/admin/topics').catch(() => ({ data: { data: [] } }));
    const data = r.data.data || [];
    setTopics(data);
    setStats({
      topics:    data.length,
      cards:     data.reduce((s, t) => s + (t.card_count || 0), 0),
      published: data.filter(t => t.status === 'published').length,
      draft:     data.filter(t => t.status === 'draft').length,
    });
  }, []);

  const loadCards = useCallback(async (topicId) => {
    const r = await api.get(`/vocab/admin/topics/${topicId}/flashcards`).catch(() => ({ data: { data: [] } }));
    setCards(r.data.data || []);
  }, []);

  useEffect(() => { loadTopics(); }, [loadTopics]);

  const openTopic = (t) => {
    setSelTopic(t);
    setCardSearch('');
    loadCards(t.id);
    setView('cards');
  };

  const backToTopics = () => { setView('topics'); setSelTopic(null); setCards([]); };

  // ── Topic CRUD ──────────────────────────────────────────
  const openAddTopic = () => {
    setTopicForm(EMPTY_TOPIC);
    setEditId(null);
    setError('');
    setTopicModal('add');
  };

  const openEditTopic = (t, e) => {
    e.stopPropagation();
    setTopicForm({
      name: t.name, description: t.description || '', category: t.category || '',
      difficulty: t.difficulty || 'beginner', thumbnail: t.thumbnail || '',
      status: t.status || 'published',
    });
    setEditId(t.id);
    setError('');
    setTopicModal('edit');
  };

  const saveTopic = async () => {
    if (!topicForm.name.trim()) { setError('Tên chủ đề là bắt buộc'); return; }
    setSaving(true); setError('');
    try {
      if (topicModal === 'add') await api.post('/vocab/admin/topics', topicForm);
      else await api.put(`/vocab/admin/topics/${editId}`, topicForm);
      setTopicModal(null);
      await loadTopics();
    } catch { setError('Lỗi lưu dữ liệu'); }
    finally { setSaving(false); }
  };

  const confirmDeleteTopic = async () => {
    await api.delete(`/vocab/admin/topics/${delConfirm.id}`);
    setDelConfirm(null);
    if (view === 'cards') backToTopics();
    loadTopics();
  };

  // ── Card CRUD ───────────────────────────────────────────
  const openAddCard = () => {
    setCardForm(EMPTY_CARD);
    setEditId(null);
    setError('');
    setCardModal('add');
  };

  const openEditCard = (c) => {
    setCardForm({
      word: c.word, phonetic: c.phonetic || '', meaning: c.meaning,
      word_type: c.word_type || '', example: c.example || '',
      notes: c.notes || '', image_url: c.image_url || '', audio_url: c.audio_url || '',
    });
    setEditId(c.id);
    setError('');
    setCardModal('edit');
  };

  const saveCard = async () => {
    if (!cardForm.word.trim() || !cardForm.meaning.trim()) { setError('Từ và nghĩa là bắt buộc'); return; }
    setSaving(true); setError('');
    try {
      if (cardModal === 'add') await api.post('/vocab/admin/flashcards', { ...cardForm, topic_id: selTopic.id });
      else await api.put(`/vocab/admin/flashcards/${editId}`, cardForm);
      setCardModal(null);
      await loadCards(selTopic.id);
      loadTopics();
    } catch { setError('Lỗi lưu dữ liệu'); }
    finally { setSaving(false); }
  };

  const confirmDeleteCard = async () => {
    await api.delete(`/vocab/admin/flashcards/${delConfirm.id}`);
    setDelConfirm(null);
    loadCards(selTopic.id);
    loadTopics();
  };

  // ── Import ──────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data;
        if (file.name.toLowerCase().endsWith('.json')) {
          data = JSON.parse(e.target.result);
          if (!Array.isArray(data)) throw new Error('JSON phải là một mảng objects');
        } else {
          const lines = e.target.result.trim().split('\n');
          const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/"/g, '').toLowerCase());
          data = lines.slice(1).filter(l => l.trim()).map(line => {
            const vals = parseCSVLine(line);
            const obj = {};
            headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim().replace(/"/g, ''); });
            return obj;
          });
        }
        const valid = data.filter(d => d.word && d.meaning);
        if (!valid.length) throw new Error('Không tìm thấy dữ liệu hợp lệ. Cần có cột "word" và "meaning"');
        setImportData(valid);
        setImportStatus('previewing');
      } catch (err) {
        alert('Lỗi đọc file: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const confirmImport = async () => {
    setSaving(true);
    try {
      await api.post(`/vocab/admin/topics/${selTopic.id}/import`, { cards: importData });
      closeImport();
      await loadCards(selTopic.id);
      loadTopics();
    } catch { alert('Lỗi import'); }
    finally { setSaving(false); }
  };

  const closeImport = () => { setImportModal(false); setImportData([]); setImportStatus(''); };

  // ── Filters ─────────────────────────────────────────────
  const filteredTopics = topics.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !(t.category || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterDiff && t.difficulty !== filterDiff) return false;
    return true;
  });

  const filteredCards = cards.filter(c => {
    if (!cardSearch) return true;
    return c.word.toLowerCase().includes(cardSearch.toLowerCase()) ||
           c.meaning.toLowerCase().includes(cardSearch.toLowerCase());
  });

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bs-body-bg)' }}>
      <style>{`
        .av-stat { border-radius:12px;border:1px solid var(--bs-border-color);background:var(--bs-body-bg);padding:16px 20px; }
        .av-btn { display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:none;cursor:pointer;font-size:13.5px;font-weight:600;transition:all .15s; }
        .av-btn:disabled { opacity:.5;cursor:not-allowed; }
        .av-btn-primary { background:#6366f1;color:white; }
        .av-btn-primary:hover:not(:disabled) { background:#4f46e5; }
        .av-btn-success { background:#10b981;color:white; }
        .av-btn-success:hover:not(:disabled) { background:#059669; }
        .av-btn-outline { background:transparent;color:var(--bs-body-color);border:1.5px solid var(--bs-border-color); }
        .av-btn-outline:hover { background:var(--bs-tertiary-bg); }
        .av-btn-danger { background:#ef4444;color:white; }
        .av-btn-danger:hover { background:#dc2626; }
        .av-row { display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--bs-border-color);cursor:pointer;transition:background .12s; }
        .av-row:hover { background:var(--bs-tertiary-bg); }
        .av-row:last-child { border-bottom:none; }
        .av-card-row { display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--bs-border-color);transition:background .12s; }
        .av-card-row:hover { background:var(--bs-tertiary-bg); }
        .av-card-row:last-child { border-bottom:none; }
        .av-input { width:100%;padding:8px 12px;border-radius:8px;border:1.5px solid var(--bs-border-color);background:var(--bs-body-bg);color:var(--bs-body-color);font-size:14px;transition:border-color .15s; }
        .av-input:focus { outline:none;border-color:#6366f1; }
        .av-select-sm { padding:6px 10px;border-radius:8px;border:1.5px solid var(--bs-border-color);background:var(--bs-body-bg);color:var(--bs-body-color);font-size:13px; }
        .av-select-sm:focus { outline:none;border-color:#6366f1; }
        .av-label { font-size:12px;font-weight:600;color:var(--bs-secondary-color);margin-bottom:4px;display:block; }
        .av-backdrop { position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1050;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto; }
        .av-modal { background:var(--bs-body-bg);border-radius:16px;width:100%;max-width:560px;box-shadow:0 24px 64px rgba(0,0,0,.2); }
        .av-modal-lg { max-width:720px; }
        .av-drop { border:2px dashed var(--bs-border-color);border-radius:12px;padding:48px 24px;text-align:center;cursor:pointer;transition:all .15s; }
        .av-drop:hover,.av-drop.over { border-color:#6366f1;background:rgba(99,102,241,.05); }
        .av-th { padding:8px 14px;background:var(--bs-tertiary-bg);font-size:11px;font-weight:700;color:var(--bs-secondary-color);letter-spacing:.07em;text-transform:uppercase; }
        .av-thumb { width:38px;height:38px;border-radius:7px;object-fit:cover;flex-shrink:0; }
      `}</style>

      <div className="container py-4" style={{ maxWidth: 1100 }}>

        {/* ── HEADER ── */}
        <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
          {view === 'cards' && (
            <button className="av-btn av-btn-outline" onClick={backToTopics}>← Quay lại</button>
          )}
          <div>
            <h4 className="fw-bold mb-0" style={{ fontSize: '1.15rem' }}>
              {view === 'topics' ? 'Quản lý Từ Vựng' : selTopic?.name}
            </h4>
            {view === 'cards' && selTopic && (
              <div className="d-flex align-items-center gap-2 mt-1">
                <DiffBadge d={selTopic.difficulty} />
                <StatusBadge s={selTopic.status} />
                <span className="text-muted small">{cards.length} flashcards</span>
              </div>
            )}
          </div>
          <div className="ms-auto d-flex gap-2 flex-wrap">
            {view === 'topics' ? (
              <button className="av-btn av-btn-primary" onClick={openAddTopic}>
                + Thêm chủ đề
              </button>
            ) : (
              <>
                <button className="av-btn av-btn-outline" onClick={() => setImportModal(true)}>
                  ↑ Import CSV/JSON
                </button>
                <button className="av-btn av-btn-primary" onClick={openAddCard}>
                  + Thêm flashcard
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── STATS ROW ── */}
        {view === 'topics' && (
          <div className="row g-3 mb-4">
            {[
              { label: 'Tổng chủ đề',    value: stats.topics,    color: '#6366f1' },
              { label: 'Tổng flashcard', value: stats.cards,     color: '#10b981' },
              { label: 'Công khai',      value: stats.published, color: '#3b82f6' },
              { label: 'Nháp / Ẩn',      value: stats.draft,     color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <div className="av-stat">
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TOPICS VIEW ── */}
        {view === 'topics' && (
          <div className="card border rounded-3" style={{ overflow: 'hidden' }}>
            <div className="d-flex align-items-center gap-2 p-3 border-bottom flex-wrap">
              <input className="av-input" style={{ maxWidth: 240 }} placeholder="Tìm chủ đề, danh mục..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <select className="av-select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select className="av-select-sm" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
                <option value="">Tất cả trình độ</option>
                {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <span className="ms-auto text-muted small">{filteredTopics.length} chủ đề</span>
            </div>

            <div className="d-none d-md-flex av-th" style={{ gap: 12 }}>
              <span style={{ flex: '2 1 0' }}>Chủ đề</span>
              <span style={{ width: 110 }}>Danh mục</span>
              <span style={{ width: 100 }}>Trình độ</span>
              <span style={{ width: 100 }}>Trạng thái</span>
              <span style={{ width: 60, textAlign: 'center' }}>Thẻ</span>
              <span style={{ width: 100 }}></span>
            </div>

            {filteredTopics.length === 0 ? (
              <div className="text-center text-muted py-5">
                <div style={{ fontSize: 36 }}>📚</div>
                <div className="mt-2">Không có chủ đề nào</div>
              </div>
            ) : filteredTopics.map(t => (
              <div key={t.id} className="av-row" onClick={() => openTopic(t)}>
                <div style={{ flex: '2 1 0', minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2">
                    {t.thumbnail && (
                      <img src={t.thumbnail} alt="" className="av-thumb"
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div className="fw-semibold" style={{ fontSize: 14 }}>{t.name}</div>
                      {t.description && (
                        <div className="text-muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                          {t.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ width: 110 }} className="text-muted small d-none d-md-block">{t.category || '—'}</div>
                <div style={{ width: 100 }} className="d-none d-md-block"><DiffBadge d={t.difficulty} /></div>
                <div style={{ width: 100 }} className="d-none d-md-block"><StatusBadge s={t.status || 'published'} /></div>
                <div style={{ width: 60, textAlign: 'center' }} className="d-none d-md-block">
                  <span style={{ padding: '2px 8px', borderRadius: 6, background: 'var(--bs-secondary-bg)', fontSize: 12, fontWeight: 600 }}>
                    {t.card_count || 0}
                  </span>
                </div>
                <div style={{ width: 100 }} className="d-flex gap-1 justify-content-end flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-outline-secondary btn-sm py-0 px-2" style={{ fontSize: 12 }}
                    onClick={e => openEditTopic(t, e)}>Sửa</button>
                  <button className="btn btn-outline-danger btn-sm py-0 px-2" style={{ fontSize: 12 }}
                    onClick={e => { e.stopPropagation(); setDelConfirm({ type: 'topic', id: t.id, name: t.name }); }}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CARDS VIEW ── */}
        {view === 'cards' && (
          <div className="card border rounded-3" style={{ overflow: 'hidden' }}>
            <div className="d-flex align-items-center gap-2 p-3 border-bottom flex-wrap">
              <input className="av-input" style={{ maxWidth: 280 }} placeholder="Tìm từ hoặc nghĩa..."
                value={cardSearch} onChange={e => setCardSearch(e.target.value)} />
              <span className="ms-auto text-muted small">{filteredCards.length} flashcards</span>
            </div>

            <div className="d-none d-lg-flex av-th" style={{ gap: 10 }}>
              <span style={{ flex: '1 1 120px' }}>Từ vựng</span>
              <span style={{ flex: '1.5 1 160px' }}>Nghĩa</span>
              <span style={{ width: 80 }}>Loại từ</span>
              <span style={{ flex: '1.5 1 0' }}>Ví dụ</span>
              <span style={{ width: 90 }}></span>
            </div>

            {filteredCards.length === 0 ? (
              <div className="text-center text-muted py-5">
                <div style={{ fontSize: 36 }}>🃏</div>
                <div className="mt-2">Chưa có flashcard nào</div>
                <button className="btn btn-primary btn-sm mt-3" onClick={openAddCard}>+ Thêm flashcard đầu tiên</button>
              </div>
            ) : filteredCards.map(c => (
              <div key={c.id} className="av-card-row">
                <div className="d-flex align-items-center gap-2" style={{ flex: '1 1 120px', minWidth: 80 }}>
                  {c.image_url && (
                    <img src={c.image_url} alt="" className="av-thumb"
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                  <div>
                    <div className="fw-bold" style={{ fontSize: 14 }}>{c.word}</div>
                    {c.phonetic && <div className="text-muted" style={{ fontSize: 11 }}>{c.phonetic}</div>}
                    {c.audio_url && (
                      <audio controls src={c.audio_url} style={{ height: 22, width: 120, marginTop: 2 }} />
                    )}
                  </div>
                </div>
                <div style={{ flex: '1.5 1 160px', fontSize: 13, minWidth: 80 }}>{c.meaning}</div>
                <div style={{ width: 80 }} className="d-none d-lg-block">
                  {c.word_type
                    ? <span style={{ padding: '2px 7px', borderRadius: 5, background: 'rgba(99,102,241,.12)', color: '#6366f1', fontSize: 11, fontWeight: 600 }}>{c.word_type}</span>
                    : <span className="text-muted small">—</span>
                  }
                </div>
                <div style={{ flex: '1.5 1 0', fontSize: 12 }} className="d-none d-lg-block text-muted">
                  {c.example || '—'}
                </div>
                <div className="d-flex gap-1 flex-shrink-0">
                  <button className="btn btn-outline-secondary btn-sm py-0 px-2" style={{ fontSize: 12 }}
                    onClick={() => openEditCard(c)}>Sửa</button>
                  <button className="btn btn-outline-danger btn-sm py-0 px-2" style={{ fontSize: 12 }}
                    onClick={() => setDelConfirm({ type: 'card', id: c.id, name: c.word })}>Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── TOPIC MODAL ──────────────────────────────── */}
      {topicModal && (
        <div className="av-backdrop" onClick={() => setTopicModal(null)}>
          <div className="av-modal" onClick={e => e.stopPropagation()}>
            <div className="d-flex align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">{topicModal === 'add' ? 'Thêm chủ đề mới' : 'Chỉnh sửa chủ đề'}</h5>
              <button className="btn-close ms-auto" onClick={() => setTopicModal(null)} />
            </div>
            <div className="p-4 d-flex flex-column gap-3">
              <div>
                <label className="av-label">Tên chủ đề *</label>
                <input className="av-input" value={topicForm.name}
                  onChange={e => setTopicForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Từ vựng TOEIC Business" />
              </div>
              <div>
                <label className="av-label">Mô tả</label>
                <textarea className="av-input" rows={2} value={topicForm.description}
                  onChange={e => setTopicForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn về chủ đề..." />
              </div>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label className="av-label">Danh mục</label>
                  <input className="av-input" value={topicForm.category}
                    onChange={e => setTopicForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="VD: TOEIC, Du lịch, Genshin..." />
                </div>
                <div className="col-sm-6">
                  <label className="av-label">Trình độ</label>
                  <select className="av-input" value={topicForm.difficulty}
                    onChange={e => setTopicForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="av-label">Trạng thái</label>
                  <select className="av-input" value={topicForm.status}
                    onChange={e => setTopicForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="av-label">URL hình ảnh đại diện</label>
                  <input className="av-input" value={topicForm.thumbnail}
                    onChange={e => setTopicForm(f => ({ ...f, thumbnail: e.target.value }))}
                    placeholder="https://..." />
                </div>
              </div>
              {topicForm.thumbnail && (
                <img src={topicForm.thumbnail} alt="preview"
                  style={{ height: 72, objectFit: 'cover', borderRadius: 8, alignSelf: 'flex-start' }}
                  onError={e => { e.target.style.display = 'none'; }} />
              )}
              {error && <div className="text-danger small">{error}</div>}
            </div>
            <div className="d-flex gap-2 justify-content-end p-4 pt-0">
              <button className="av-btn av-btn-outline" onClick={() => setTopicModal(null)}>Hủy</button>
              <button className="av-btn av-btn-primary" onClick={saveTopic}
                disabled={saving || !topicForm.name.trim()}>
                {saving ? 'Đang lưu...' : 'Lưu chủ đề'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CARD MODAL ───────────────────────────────── */}
      {cardModal && (
        <div className="av-backdrop" onClick={() => setCardModal(null)}>
          <div className="av-modal av-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="d-flex align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">{cardModal === 'add' ? 'Thêm flashcard' : 'Chỉnh sửa flashcard'}</h5>
              <button className="btn-close ms-auto" onClick={() => setCardModal(null)} />
            </div>
            <div className="p-4">
              <div className="row g-3">
                <div className="col-sm-5">
                  <label className="av-label">Từ vựng *</label>
                  <input className="av-input" value={cardForm.word}
                    onChange={e => setCardForm(f => ({ ...f, word: e.target.value }))}
                    placeholder="VD: appointment" />
                </div>
                <div className="col-sm-4">
                  <label className="av-label">Phiên âm</label>
                  <input className="av-input" value={cardForm.phonetic}
                    onChange={e => setCardForm(f => ({ ...f, phonetic: e.target.value }))}
                    placeholder="/əˈpɔɪntmənt/" />
                </div>
                <div className="col-sm-3">
                  <label className="av-label">Loại từ</label>
                  <select className="av-input" value={cardForm.word_type}
                    onChange={e => setCardForm(f => ({ ...f, word_type: e.target.value }))}>
                    <option value="">— Chọn —</option>
                    {WORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="av-label">Nghĩa tiếng Việt *</label>
                  <input className="av-input" value={cardForm.meaning}
                    onChange={e => setCardForm(f => ({ ...f, meaning: e.target.value }))}
                    placeholder="VD: cuộc hẹn, buổi hẹn gặp" />
                </div>
                <div className="col-12">
                  <label className="av-label">Câu ví dụ</label>
                  <input className="av-input" value={cardForm.example}
                    onChange={e => setCardForm(f => ({ ...f, example: e.target.value }))}
                    placeholder="VD: I have a doctor's appointment at 3 PM." />
                </div>
                <div className="col-12">
                  <label className="av-label">Ghi chú / Giải thích thêm</label>
                  <textarea className="av-input" rows={2} value={cardForm.notes}
                    onChange={e => setCardForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Cách dùng, phân biệt, collocations..." />
                </div>
                <div className="col-sm-6">
                  <label className="av-label">URL hình ảnh</label>
                  <input className="av-input" value={cardForm.image_url}
                    onChange={e => setCardForm(f => ({ ...f, image_url: e.target.value }))}
                    placeholder="https://..." />
                </div>
                <div className="col-sm-6">
                  <label className="av-label">URL audio phát âm</label>
                  <input className="av-input" value={cardForm.audio_url}
                    onChange={e => setCardForm(f => ({ ...f, audio_url: e.target.value }))}
                    placeholder="https://.../word.mp3" />
                </div>
                {(cardForm.image_url || cardForm.audio_url) && (
                  <div className="col-12 d-flex align-items-center gap-3 flex-wrap">
                    {cardForm.image_url && (
                      <img src={cardForm.image_url} alt="preview"
                        style={{ height: 64, borderRadius: 8, objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    )}
                    {cardForm.audio_url && <audio controls src={cardForm.audio_url} style={{ height: 36 }} />}
                  </div>
                )}
                {error && <div className="col-12"><div className="text-danger small">{error}</div></div>}
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-end p-4 pt-0">
              <button className="av-btn av-btn-outline" onClick={() => setCardModal(null)}>Hủy</button>
              <button className="av-btn av-btn-primary" onClick={saveCard}
                disabled={saving || !cardForm.word.trim() || !cardForm.meaning.trim()}>
                {saving ? 'Đang lưu...' : 'Lưu flashcard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── IMPORT MODAL ─────────────────────────────── */}
      {importModal && (
        <div className="av-backdrop" onClick={closeImport}>
          <div className="av-modal av-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="d-flex align-items-center p-4 border-bottom">
              <h5 className="mb-0 fw-bold">Import Flashcard hàng loạt</h5>
              <button className="btn-close ms-auto" onClick={closeImport} />
            </div>
            <div className="p-4">
              {importStatus !== 'previewing' ? (
                <>
                  <div
                    className="av-drop"
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('over'); }}
                    onDragLeave={e => e.currentTarget.classList.remove('over')}
                    onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('over'); handleFile(e.dataTransfer.files[0]); }}
                  >
                    <div style={{ fontSize: 44 }}>📂</div>
                    <div className="fw-semibold mt-2 mb-1">Kéo thả hoặc click để chọn file</div>
                    <div className="text-muted small">Hỗ trợ: .csv, .json</div>
                  </div>
                  <input ref={fileRef} type="file" accept=".csv,.json" style={{ display: 'none' }}
                    onChange={e => { handleFile(e.target.files[0]); e.target.value = ''; }} />

                  <div className="mt-4 p-3 rounded-3" style={{ background: 'var(--bs-tertiary-bg)', fontSize: 13 }}>
                    <div className="fw-semibold mb-1">Định dạng CSV (dòng đầu là tên cột):</div>
                    <code style={{ fontSize: 12 }}>word,phonetic,meaning,word_type,example,notes,image_url,audio_url</code>
                    <div className="fw-semibold mt-3 mb-1">Định dạng JSON (mảng objects):</div>
                    <code style={{ fontSize: 12 }}>[{`{"word":"run","meaning":"chạy","word_type":"verb","example":"I run daily."}`}]</code>
                    <div className="text-muted mt-2 small">* Bắt buộc: <strong>word</strong>, <strong>meaning</strong>. Các trường còn lại không bắt buộc.</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span style={{ padding: '3px 10px', borderRadius: 6, background: '#10b98122', color: '#10b981', fontWeight: 600, fontSize: 13 }}>
                      {importData.length} từ hợp lệ
                    </span>
                    <span className="text-muted small">Xem trước 10 từ đầu:</span>
                    <button className="btn btn-outline-secondary btn-sm ms-auto py-0"
                      onClick={() => { setImportData([]); setImportStatus(''); }}>
                      ← Chọn lại
                    </button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--bs-border-color)', borderRadius: 8 }}>
                    <table className="table table-sm mb-0">
                      <thead style={{ position: 'sticky', top: 0, background: 'var(--bs-tertiary-bg)' }}>
                        <tr>
                          <th style={{ fontSize: 12 }}>Từ</th>
                          <th style={{ fontSize: 12 }}>Nghĩa</th>
                          <th style={{ fontSize: 12 }}>Loại từ</th>
                          <th style={{ fontSize: 12 }}>Phiên âm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.slice(0, 10).map((r, i) => (
                          <tr key={i}>
                            <td className="fw-semibold">{r.word}</td>
                            <td>{r.meaning}</td>
                            <td className="text-muted small">{r.word_type || '—'}</td>
                            <td className="text-muted small">{r.phonetic || '—'}</td>
                          </tr>
                        ))}
                        {importData.length > 10 && (
                          <tr>
                            <td colSpan={4} className="text-center text-muted small py-2">
                              ...và {importData.length - 10} từ khác
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="d-flex gap-2 justify-content-end p-4 pt-0">
              <button className="av-btn av-btn-outline" onClick={closeImport}>Hủy</button>
              {importStatus === 'previewing' && (
                <button className="av-btn av-btn-success" onClick={confirmImport} disabled={saving}>
                  {saving ? 'Đang import...' : `Import ${importData.length} flashcard`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── DELETE CONFIRM ────────────────────────────── */}
      {delConfirm && (
        <div className="av-backdrop" onClick={() => setDelConfirm(null)}>
          <div className="av-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <h5 className="fw-bold mb-2">Xác nhận xóa</h5>
              <p className="text-muted mb-4">
                Bạn có chắc muốn xóa {delConfirm.type === 'topic' ? 'chủ đề' : 'flashcard'}{' '}
                <strong>"{delConfirm.name}"</strong>?
                {delConfirm.type === 'topic' && (
                  <span className="d-block mt-1 text-danger small">
                    Tất cả flashcard trong chủ đề này cũng sẽ bị xóa.
                  </span>
                )}
              </p>
              <div className="d-flex gap-2 justify-content-end">
                <button className="av-btn av-btn-outline" onClick={() => setDelConfirm(null)}>Hủy</button>
                <button className="av-btn av-btn-danger"
                  onClick={delConfirm.type === 'topic' ? confirmDeleteTopic : confirmDeleteCard}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
