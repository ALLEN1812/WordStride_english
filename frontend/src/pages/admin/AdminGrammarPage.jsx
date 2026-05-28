import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
const LEVEL_COLOR = { beginner: 'success', intermediate: 'warning', advanced: 'danger' };
const OPTS = ['A', 'B', 'C', 'D'];
const EMPTY_LESSON   = { title: '', content: '', level: 'beginner', order_index: 0, youtube_url: '' };
const EMPTY_SECTION  = { title: '', description: '', order_index: 0 };
const EMPTY_QUESTION = { question_type: 'multiple_choice', question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct: 'A', fill_answer: '', explanation: '', order_index: 0 };

function ytId(url) {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default function AdminGrammarPage() {
  const [lessons,       setLessons]       = useState([]);
  const [selLesson,     setSelLesson]     = useState(null);
  const [selSection,    setSelSection]    = useState(null);
  const [view,          setView]          = useState('lessons');
  const [loading,       setLoading]       = useState(false);

  const [lessonModal,   setLessonModal]   = useState(null);
  const [sectionModal,  setSectionModal]  = useState(null);
  const [questionModal, setQuestionModal] = useState(null);
  const [contentTab,    setContentTab]    = useState('edit');

  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const loadLessons = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/grammar/lessons');
      setLessons(r.data.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadLessons(); }, [loadLessons]);

  const openLesson = async (lesson) => {
    setLoading(true);
    try {
      const r = await api.get(`/grammar/lessons/${lesson.id}`);
      setSelLesson(r.data.data);
      setView('sections');
    } finally { setLoading(false); }
  };

  const openSection = async (section) => {
    setLoading(true);
    try {
      const r = await api.get(`/grammar/sections/${section.id}`);
      setSelSection(r.data.data);
      setView('questions');
    } finally { setLoading(false); }
  };

  const f = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (lessonModal)   { if (!form.title?.trim()) e.title = 'Required'; if (!form.content?.trim()) e.content = 'Required'; }
    if (sectionModal)  { if (!form.title?.trim()) e.title = 'Required'; }
    if (questionModal) {
      if (!form.question?.trim()) e.question = 'Required';
      if (form.question_type === 'fill_blank' && !form.fill_answer?.trim()) e.fill_answer = 'Required';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (lessonModal) {
        if (lessonModal === 'add') await api.post('/grammar/admin/lessons', form);
        else await api.put(`/grammar/admin/lessons/${lessonModal.id}`, form);
        await loadLessons(); setLessonModal(null);
      } else if (sectionModal) {
        if (sectionModal === 'add') await api.post('/grammar/admin/sections', { ...form, lesson_id: selLesson.id });
        else await api.put(`/grammar/admin/sections/${sectionModal.id}`, form);
        await openLesson(selLesson); setSectionModal(null);
      } else if (questionModal) {
        if (questionModal === 'add') await api.post('/grammar/admin/questions', { ...form, section_id: selSection.id });
        else await api.put(`/grammar/admin/questions/${questionModal.id}`, form);
        await openSection(selSection); setQuestionModal(null);
      }
    } catch { alert('Lỗi khi lưu. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const del = async (type, id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    if (type === 'lesson')   { await api.delete(`/grammar/admin/lessons/${id}`);   await loadLessons(); }
    if (type === 'section')  { await api.delete(`/grammar/admin/sections/${id}`);  await openLesson(selLesson); }
    if (type === 'question') { await api.delete(`/grammar/admin/questions/${id}`); await openSection(selSection); }
  };

  const openLessonModal = async (lesson = 'add') => {
    setContentTab('edit'); setErrors({});
    if (lesson === 'add') {
      setLessonModal('add'); setForm({ ...EMPTY_LESSON });
    } else {
      const r = await api.get(`/grammar/lessons/${lesson.id}`);
      const d = r.data.data;
      setLessonModal({ id: d.id, title: d.title });
      setForm({ title: d.title, content: d.content || '', level: d.level, order_index: d.order_index, youtube_url: d.youtube_url || '' });
    }
  };

  const openSectionModal = (sec = 'add') => {
    setErrors({}); setSectionModal(sec);
    setForm(sec === 'add' ? { ...EMPTY_SECTION } : { title: sec.title, description: sec.description || '', order_index: sec.order_index });
  };

  const openQuestionModal = (q = 'add') => {
    setErrors({}); setQuestionModal(q);
    setForm(q === 'add' ? { ...EMPTY_QUESTION } : {
      question_type: q.question_type, question: q.question,
      option_a: q.option_a || '', option_b: q.option_b || '', option_c: q.option_c || '', option_d: q.option_d || '',
      correct: q.correct || 'A', fill_answer: q.fill_answer || '', explanation: q.explanation || '', order_index: q.order_index,
    });
  };

  const Breadcrumb = () => (
    <nav className="mb-4">
      <ol className="breadcrumb mb-0">
        <li className={`breadcrumb-item ${view === 'lessons' ? 'active' : ''}`}>
          {view !== 'lessons'
            ? <a href="#" className="text-decoration-none" onClick={e => { e.preventDefault(); setView('lessons'); }}>Grammar</a>
            : 'Grammar'}
        </li>
        {view !== 'lessons' && selLesson && (
          <li className={`breadcrumb-item ${view === 'sections' ? 'active' : ''}`}>
            {view !== 'sections'
              ? <a href="#" className="text-decoration-none" onClick={e => { e.preventDefault(); setView('sections'); }}>{selLesson.title}</a>
              : selLesson.title}
          </li>
        )}
        {view === 'questions' && selSection && (
          <li className="breadcrumb-item active">{selSection.title}</li>
        )}
      </ol>
    </nav>
  );

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="fw-bold mb-0">
          {view === 'lessons' ? 'Grammar Lessons'
            : view === 'sections' ? selLesson?.title
            : selSection?.title}
        </h4>
        <button className="btn btn-primary" onClick={() => {
          if (view === 'lessons')   openLessonModal('add');
          if (view === 'sections')  openSectionModal('add');
          if (view === 'questions') openQuestionModal('add');
        }}>
          + Add {view === 'lessons' ? 'Lesson' : view === 'sections' ? 'Section' : 'Question'}
        </button>
      </div>

      <Breadcrumb />

      {loading && <div className="text-center py-5"><div className="spinner-border text-primary"/></div>}

      {/* ── Lessons ── */}
      {!loading && view === 'lessons' && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th width={40}>#</th>
                <th>Title</th>
                <th>Level</th>
                <th width={90} className="text-center">Sections</th>
                <th width={70} className="text-center">Order</th>
                <th width={80} className="text-center">Video</th>
                <th width={190}></th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l, i) => (
                <tr key={l.id}>
                  <td className="text-muted small">{i + 1}</td>
                  <td><span className="fw-semibold" style={{ cursor: 'pointer' }} onClick={() => openLesson(l)}>{l.title}</span></td>
                  <td><span className={`badge bg-${LEVEL_COLOR[l.level]}`}>{LEVEL_LABEL[l.level]}</span></td>
                  <td className="text-center">
                    <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => openLesson(l)}>
                      {parseInt(l.section_count) || 0}
                    </button>
                  </td>
                  <td className="text-center text-muted small">{l.order_index}</td>
                  <td className="text-center">
                    {l.youtube_url ? <span className="badge bg-danger">YouTube</span> : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => openLesson(l)}>Sections</button>
                    <button className="btn btn-outline-primary btn-sm me-1" onClick={() => openLessonModal(l)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => del('lesson', l.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {!lessons.length && <tr><td colSpan={7} className="text-center text-muted py-5">No lessons yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Sections ── */}
      {!loading && view === 'sections' && selLesson && (
        <>
          <div className="card mb-4 border-0 bg-light">
            <div className="card-body py-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className={`badge bg-${LEVEL_COLOR[selLesson.level]}`}>{LEVEL_LABEL[selLesson.level]}</span>
                {selLesson.youtube_url && ytId(selLesson.youtube_url) && (
                  <a href={selLesson.youtube_url} target="_blank" rel="noreferrer" className="badge bg-danger text-decoration-none">▶ YouTube</a>
                )}
                <span className="text-muted small">{selLesson.sections?.length || 0} sections</span>
              </div>
              <button className="btn btn-outline-primary btn-sm" onClick={() => openLessonModal(selLesson)}>Edit Lesson</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th width={40}>#</th>
                  <th>Section Title</th>
                  <th>Description</th>
                  <th width={110} className="text-center">Questions</th>
                  <th width={70} className="text-center">Order</th>
                  <th width={190}></th>
                </tr>
              </thead>
              <tbody>
                {(selLesson.sections || []).map((s, i) => (
                  <tr key={s.id}>
                    <td className="text-muted small">{i + 1}</td>
                    <td><span className="fw-semibold" style={{ cursor: 'pointer' }} onClick={() => openSection(s)}>{s.title}</span></td>
                    <td className="text-muted small">{s.description || '—'}</td>
                    <td className="text-center">
                      <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => openSection(s)}>
                        {s.question_count} question{s.question_count !== 1 ? 's' : ''}
                      </button>
                    </td>
                    <td className="text-center text-muted small">{s.order_index}</td>
                    <td>
                      <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => openSection(s)}>Questions</button>
                      <button className="btn btn-outline-primary btn-sm me-1" onClick={() => openSectionModal(s)}>Edit</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => del('section', s.id)}>Del</button>
                    </td>
                  </tr>
                ))}
                {!(selLesson.sections?.length) && <tr><td colSpan={6} className="text-center text-muted py-5">No sections yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Questions (card view) ── */}
      {!loading && view === 'questions' && selSection && (
        <>
          <p className="text-muted small mb-3">{selSection.questions?.length || 0} questions in this section</p>
          <div className="d-flex flex-column gap-3">
            {(selSection.questions || []).map((q, i) => (
              <div key={q.id} className="card border shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="text-muted fw-semibold small">#{i + 1}</span>
                        <span className={`badge ${q.question_type === 'fill_blank' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                          {q.question_type === 'fill_blank' ? 'Fill in Blank' : 'Multiple Choice'}
                        </span>
                      </div>
                      <p className="mb-2 fw-semibold">{q.question}</p>
                      {q.question_type === 'multiple_choice' && (
                        <div className="row g-1 mb-2">
                          {OPTS.map(opt => {
                            const txt = q[`option_${opt.toLowerCase()}`];
                            if (!txt) return null;
                            const isCorrect = q.correct === opt;
                            return (
                              <div key={opt} className="col-md-6">
                                <div className={`d-flex align-items-center gap-2 px-2 py-1 rounded small
                                  ${isCorrect ? 'bg-success bg-opacity-15 text-success fw-semibold' : 'bg-light text-muted'}`}>
                                  <span className={`badge ${isCorrect ? 'bg-success' : 'bg-light border text-muted'}`}>{opt}</span>
                                  <span>{txt}</span>
                                  {isCorrect && <span className="ms-auto">✓</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {q.question_type === 'fill_blank' && (
                        <div className="d-inline-flex align-items-center gap-2 bg-success bg-opacity-15 px-3 py-1 rounded small mb-2">
                          <span className="text-muted">Answer:</span>
                          <span className="text-success fw-semibold">{q.fill_answer}</span>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="text-muted small border-start border-3 ps-2">{q.explanation}</div>
                      )}
                    </div>
                    <div className="d-flex gap-2 flex-shrink-0">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => openQuestionModal(q)}>Edit</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => del('question', q.id)}>Del</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!(selSection.questions?.length) && (
              <div className="text-center text-muted py-5">No questions yet. Click "+ Add Question" to create one.</div>
            )}
          </div>
        </>
      )}

      {/* ══════════ LESSON MODAL ══════════ */}
      {lessonModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {lessonModal === 'add' ? 'Add New Lesson' : `Edit: ${lessonModal.title}`}
                </h5>
                <button className="btn-close" onClick={() => setLessonModal(null)}/>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Title <span className="text-danger">*</span></label>
                    <input className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                      value={form.title || ''} onChange={e => f('title', e.target.value)}
                      placeholder="e.g. Present Simple Tense"/>
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Level</label>
                    <select className="form-select" value={form.level || 'beginner'} onChange={e => f('level', e.target.value)}>
                      {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Order Index</label>
                    <input type="number" className="form-control" value={form.order_index ?? 0} onChange={e => f('order_index', +e.target.value)}/>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">YouTube URL</label>
                  <input className="form-control" value={form.youtube_url || ''} onChange={e => f('youtube_url', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."/>
                  {form.youtube_url && !ytId(form.youtube_url) && (
                    <div className="form-text text-danger">Invalid YouTube URL</div>
                  )}
                  {form.youtube_url && ytId(form.youtube_url) && (
                    <div className="mt-2">
                      <div className="ratio ratio-16x9" style={{ maxWidth: 360 }}>
                        <iframe src={`https://www.youtube.com/embed/${ytId(form.youtube_url)}`} title="YouTube preview" allowFullScreen/>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-1">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold mb-0">Content (HTML) <span className="text-danger">*</span></label>
                    <div className="btn-group btn-group-sm">
                      <button type="button" className={`btn btn-outline-secondary ${contentTab === 'edit' ? 'active' : ''}`}
                        onClick={() => setContentTab('edit')}>Edit</button>
                      <button type="button" className={`btn btn-outline-secondary ${contentTab === 'preview' ? 'active' : ''}`}
                        onClick={() => setContentTab('preview')}>Preview</button>
                    </div>
                  </div>
                  {contentTab === 'edit' ? (
                    <textarea className={`form-control font-monospace ${errors.content ? 'is-invalid' : ''}`}
                      rows={14} value={form.content || ''} onChange={e => f('content', e.target.value)}
                      placeholder="<h2>Structure</h2><p>The Present Simple is used for...</p>"/>
                  ) : (
                    <div className="border rounded p-3" style={{ minHeight: 200, maxHeight: 480, overflowY: 'auto' }}
                      dangerouslySetInnerHTML={{ __html: form.content || '<em class="text-muted">No content yet</em>' }}/>
                  )}
                  {errors.content && <div className="invalid-feedback d-block">{errors.content}</div>}
                  <div className="form-text">Supports h2, h3, p, table, ul, blockquote, strong, em</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setLessonModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-2"/>} Save Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ SECTION MODAL ══════════ */}
      {sectionModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1050 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{sectionModal === 'add' ? 'Add Section' : 'Edit Section'}</h5>
                <button className="btn-close" onClick={() => setSectionModal(null)}/>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Title <span className="text-danger">*</span></label>
                  <input className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    value={form.title || ''} onChange={e => f('title', e.target.value)}
                    placeholder="e.g. Part 1 — Affirmative Sentences"/>
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea className="form-control" rows={2} value={form.description || ''}
                    onChange={e => f('description', e.target.value)} placeholder="Optional short description"/>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Order Index</label>
                  <input type="number" className="form-control" value={form.order_index ?? 0} onChange={e => f('order_index', +e.target.value)}/>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSectionModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-2"/>} Save Section
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ QUESTION MODAL ══════════ */}
      {questionModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{questionModal === 'add' ? 'Add Question' : 'Edit Question'}</h5>
                <button className="btn-close" onClick={() => setQuestionModal(null)}/>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Question Type</label>
                  <div className="d-flex gap-4">
                    {['multiple_choice', 'fill_blank'].map(t => (
                      <div key={t} className="form-check">
                        <input className="form-check-input" type="radio" id={`qt-${t}`}
                          checked={form.question_type === t} onChange={() => f('question_type', t)}/>
                        <label className="form-check-label" htmlFor={`qt-${t}`}>
                          {t === 'multiple_choice' ? 'Multiple Choice (A/B/C/D)' : 'Fill in the Blank'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Question <span className="text-danger">*</span></label>
                  <textarea className={`form-control ${errors.question ? 'is-invalid' : ''}`} rows={3}
                    value={form.question || ''} onChange={e => f('question', e.target.value)}
                    placeholder={form.question_type === 'fill_blank' ? 'She ___ to school every day.' : 'What is the correct form of...?'}/>
                  {errors.question && <div className="invalid-feedback">{errors.question}</div>}
                  {form.question_type === 'fill_blank' && (
                    <div className="form-text">Use ___ (three underscores) to mark the blank</div>
                  )}
                </div>

                {form.question_type === 'multiple_choice' && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Options <span className="text-muted small fw-normal">(click the radio button to mark the correct answer)</span>
                    </label>
                    <div className="d-flex flex-column gap-2 mt-1">
                      {OPTS.map(opt => {
                        const key = `option_${opt.toLowerCase()}`;
                        const isCorrect = form.correct === opt;
                        return (
                          <div key={opt} className={`d-flex align-items-center gap-2 p-2 rounded border ${isCorrect ? 'border-success bg-success bg-opacity-10' : ''}`}>
                            <input type="radio" className="form-check-input mt-0 flex-shrink-0"
                              checked={isCorrect} onChange={() => f('correct', opt)} title="Mark as correct"/>
                            <span className={`badge flex-shrink-0 ${isCorrect ? 'bg-success' : 'bg-secondary'}`}>{opt}</span>
                            <input className="form-control form-control-sm" value={form[key] || ''}
                              onChange={e => f(key, e.target.value)} placeholder={`Option ${opt}...`}/>
                            {isCorrect && <span className="text-success fw-semibold small flex-shrink-0">✓ Correct</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {form.question_type === 'fill_blank' && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Correct Answer <span className="text-danger">*</span></label>
                    <input className={`form-control ${errors.fill_answer ? 'is-invalid' : ''}`}
                      value={form.fill_answer || ''} onChange={e => f('fill_answer', e.target.value)}
                      placeholder="e.g. goes"/>
                    {errors.fill_answer && <div className="invalid-feedback">{errors.fill_answer}</div>}
                    <div className="form-text">Case-insensitive, trims spaces</div>
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label fw-semibold">
                      Explanation <span className="text-muted small fw-normal">(shown after answering)</span>
                    </label>
                    <textarea className="form-control" rows={3} value={form.explanation || ''}
                      onChange={e => f('explanation', e.target.value)}
                      placeholder="Explain why the correct answer is right..."/>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Order Index</label>
                    <input type="number" className="form-control" value={form.order_index ?? 0}
                      onChange={e => f('order_index', +e.target.value)}/>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setQuestionModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-2"/>} Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
