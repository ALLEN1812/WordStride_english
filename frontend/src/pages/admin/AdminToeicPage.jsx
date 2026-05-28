import React, { useEffect, useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import api from '../../api/axios';

const PART_INFO = {
  1: { label: 'Photographs',           skill: 'Listening', hasGroup: false, hasAudio: true,  hasImage: true  },
  2: { label: 'Question-Response',     skill: 'Listening', hasGroup: false, hasAudio: true,  hasImage: false },
  3: { label: 'Short Conversations',   skill: 'Listening', hasGroup: true,  hasAudio: false, hasImage: false },
  4: { label: 'Short Talks',           skill: 'Listening', hasGroup: true,  hasAudio: false, hasImage: false },
  5: { label: 'Incomplete Sentences',  skill: 'Reading',   hasGroup: false, hasAudio: false, hasImage: false },
  6: { label: 'Text Completion',       skill: 'Reading',   hasGroup: true,  hasAudio: false, hasImage: false },
  7: { label: 'Reading Comprehension', skill: 'Reading',   hasGroup: true,  hasAudio: false, hasImage: false },
};
const PARTS = [1, 2, 3, 4, 5, 6, 7];
const OPTS = ['A', 'B', 'C', 'D'];
const STATUS_COLOR = { draft: 'secondary', public: 'success', hidden: 'warning', archived: 'dark' };
const DIFF_COLOR = { easy: 'success', medium: 'warning', hard: 'danger' };

const EMPTY_TEST = { title: '', type: 'full_test', duration_minutes: 120, difficulty: 'medium', description: '', status: 'draft' };
const EMPTY_GROUP = { audio_url: '', image_url: '', passage: '', transcript: '', group_order: 0 };
const EMPTY_Q = { question_num: '', question_text: '', image_url: '', audio_url: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '', order_index: 0 };

const PART_DIRECTIONS = {
  1: 'Directions: For each question in this part, you will hear four statements about a picture in your test book. When you hear the statements, you must select the one statement that best describes what you see in the picture. Then find the number of the question on your answer sheet and mark your answer. The statements will not be printed in your test book and will be spoken only one time.',
  2: 'Directions: You will hear a question or statement and three responses spoken in English. They will not be printed in your test book and will be spoken only one time. Select the best response to the question or statement and mark the letter (A), (B), or (C) on your answer sheet.',
  3: 'Directions: You will hear some conversations between two or more people. You will be asked to answer three questions about what the speakers say in each conversation. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The conversations will not be printed in your test book and will be spoken only one time.',
  4: 'Directions: You will hear some talks given by a single speaker. You will be asked to answer three or more questions about what the speaker says in each talk. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The talks will not be printed in your test book and will be spoken only one time.',
  5: 'Directions: A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence. Then mark the letter (A), (B), (C), or (D) on your answer sheet.',
  6: 'Directions: Read the texts that follow. A word, phrase, or sentence is missing in parts of each text. Four answer choices for each question are given below the text. Select the best answer to complete the text. Then mark the letter (A), (B), (C), or (D) on your answer sheet.',
  7: 'Directions: In this part you will read a selection of texts, such as magazine and newspaper articles, e-mails, and instant messages. Each text or set of texts is followed by several questions. Select the best answer for each question and mark the letter (A), (B), (C), or (D) on your answer sheet.',
};

const IMPORT_TEMPLATES = {
  1: {
    audio_url: 'https://cdn.example.com/part1.mp3',
    questions: [
      { question_num: 1, order_index: 1, image_url: 'https://cdn.example.com/q1.jpg',
        option_a: 'The woman is reading a book.', option_b: 'The man is standing by a window.',
        option_c: 'Two people are sitting at a table.', option_d: 'The chair is next to the desk.',
        correct_answer: 'A', explanation: '' },
    ],
  },
  2: {
    audio_url: 'https://cdn.example.com/part2.mp3',
    questions: [
      { question_num: 7, order_index: 1,
        option_a: "Yes, I'll be there at 9.", option_b: "No, I haven't seen him.",
        option_c: "It's on the third floor.",
        correct_answer: 'A', explanation: '' },
    ],
  },
  3: {
    audio_url: 'https://cdn.example.com/part3.mp3',
    groups: [
      {
        group_order: 1,
        transcript: "Man: Did you finish the report?\nWoman: Yes, I sent it this morning.\nMan: Great, I'll review it after lunch.",
        questions: [
          { question_num: 32, order_index: 1, question_text: 'What did the woman do this morning?',
            option_a: 'Attended a meeting', option_b: 'Sent a report', option_c: 'Called a client', option_d: 'Wrote a proposal',
            correct_answer: 'B', explanation: '' },
          { question_num: 33, order_index: 2, question_text: 'When will the man review the report?',
            option_a: 'In the morning', option_b: 'After lunch', option_c: 'Tomorrow', option_d: 'Next week',
            correct_answer: 'B', explanation: '' },
        ],
      },
    ],
  },
  4: {
    audio_url: 'https://cdn.example.com/part4.mp3',
    groups: [
      {
        group_order: 1,
        transcript: "Good morning, everyone. Welcome to our annual conference. Today we will discuss the new marketing strategy for the upcoming quarter.",
        questions: [
          { question_num: 71, order_index: 1, question_text: 'What is the main topic of the talk?',
            option_a: 'Sales results', option_b: 'Marketing strategy', option_c: 'New products', option_d: 'Employee training',
            correct_answer: 'B', explanation: '' },
          { question_num: 72, order_index: 2, question_text: 'Who is most likely the speaker?',
            option_a: 'A customer', option_b: 'A manager', option_c: 'A new employee', option_d: 'A journalist',
            correct_answer: 'B', explanation: '' },
        ],
      },
    ],
  },
  5: {
    questions: [
      { question_num: 101, order_index: 1,
        question_text: 'The manager _____ the quarterly report by Friday.',
        option_a: 'will submit', option_b: 'submitting', option_c: 'submitted', option_d: 'submit',
        correct_answer: 'A', explanation: '' },
    ],
  },
  6: {
    groups: [
      {
        group_order: 1,
        passage: "Dear Ms. Johnson,\n\nThank you for your _____(134) to the position of Marketing Manager. We would like to _____(135) you for an interview. Please _____(136) your availability by replying to this email. We look forward to _____(137) from you.\n\nBest regards,\nHR Department",
        questions: [
          { question_num: 134, order_index: 1, question_text: '', option_a: 'application', option_b: 'applying', option_c: 'applied', option_d: 'applies', correct_answer: 'A', explanation: '' },
          { question_num: 135, order_index: 2, question_text: '', option_a: 'invite', option_b: 'inviting', option_c: 'invited', option_d: 'invitation', correct_answer: 'A', explanation: '' },
          { question_num: 136, order_index: 3, question_text: '', option_a: 'confirm', option_b: 'confirming', option_c: 'confirmation', option_d: 'confirmed', correct_answer: 'A', explanation: '' },
          { question_num: 137, order_index: 4, question_text: '', option_a: 'hear', option_b: 'hearing', option_c: 'heard', option_d: 'hears', correct_answer: 'B', explanation: '' },
        ],
      },
    ],
  },
  7: {
    groups: [
      {
        group_order: 1,
        image_url: '',
        passage: "WANTED: Marketing Manager\n\nABC Corporation is seeking an experienced marketing manager to lead our expanding team.\n\nRequirements:\n- Bachelor's degree in Marketing or related field\n- 5+ years of experience in digital marketing\n- Strong communication skills\n\nTo apply, send your resume to hr@abc.com",
        questions: [
          { question_num: 147, order_index: 1, question_text: 'What position is being advertised?',
            option_a: 'Sales Manager', option_b: 'Marketing Manager', option_c: 'Product Designer', option_d: 'HR Manager',
            correct_answer: 'B', explanation: '' },
          { question_num: 148, order_index: 2, question_text: 'How many years of experience are required?',
            option_a: '3 years', option_b: '4 years', option_c: '5 years', option_d: '6 years',
            correct_answer: 'C', explanation: '' },
        ],
      },
    ],
  },
};

/* ── Excel helpers ──────────────────────────────────────────────────────────── */

// Parse an uploaded Excel / CSV file → same JSON shape used by doImport
// type: 'array' for Excel (ArrayBuffer), 'string' for CSV (text)
function parseFileToJSON(data, partNum, type = 'array') {
  const wb  = XLSX.read(data, { type });
  const ws  = wb.Sheets[wb.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!aoa.length) throw new Error('File Excel rỗng');

  // Row 0 may be a config row: [ 'part_audio_url', 'https://...' ]
  let partAudioUrl = '';
  let dataStart    = 0;
  if (String(aoa[0][0]).trim().toLowerCase() === 'part_audio_url') {
    partAudioUrl = String(aoa[0][1] || '').trim();
    dataStart    = 1;
  }

  const headers = aoa[dataStart].map(h => String(h).trim().toLowerCase().replace(/ /g, '_'));
  const rows    = aoa.slice(dataStart + 1)
    .filter(row => row.some(c => c !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => { if (h) obj[h] = row[i] ?? ''; });
      return obj;
    });

  const hasGroups = PART_INFO[partNum]?.hasGroup;
  const str = v => String(v ?? '').trim();
  const num = v => Number(v) || 0;

  if (!hasGroups) {
    return {
      audio_url: partAudioUrl,
      questions: rows.map((r, i) => ({
        question_num:   num(r.question_num)  || i + 1,
        question_text:  str(r.question_text),
        image_url:      str(r.image_url),
        audio_url:      str(r.audio_url) || partAudioUrl,
        option_a:       str(r.option_a),
        option_b:       str(r.option_b),
        option_c:       str(r.option_c),
        option_d:       str(r.option_d),
        correct_answer: str(r.correct_answer).toUpperCase() || 'A',
        explanation:    str(r.explanation),
        order_index:    num(r.order_index) || i + 1,
      })),
    };
  }

  // Grouped parts — accumulate by group_order
  const groupMap = new Map();
  const groupKeys = [];
  rows.forEach((r, i) => {
    const go = num(r.group_order) || 1;
    if (!groupMap.has(go)) {
      groupMap.set(go, {
        group_order: go,
        transcript:  str(r.transcript),
        passage:     str(r.passage),
        audio_url:   str(r.group_audio_url) || str(r.audio_url) || partAudioUrl,
        image_url:   str(r.group_image_url),
        questions:   [],
      });
      groupKeys.push(go);
    } else {
      const g = groupMap.get(go);
      if (!g.transcript && r.transcript) g.transcript = str(r.transcript);
      if (!g.passage    && r.passage)    g.passage    = str(r.passage);
      if (!g.image_url  && r.group_image_url) g.image_url = str(r.group_image_url);
    }
    if (r.question_num) {
      const g = groupMap.get(go);
      g.questions.push({
        question_num:   num(r.question_num),
        question_text:  str(r.question_text),
        image_url:      str(r.image_url),
        audio_url:      str(r.audio_url),
        option_a:       str(r.option_a),
        option_b:       str(r.option_b),
        option_c:       str(r.option_c),
        option_d:       str(r.option_d),
        correct_answer: str(r.correct_answer).toUpperCase() || 'A',
        explanation:    str(r.explanation),
        order_index:    num(r.order_index) || g.questions.length + 1,
      });
    }
  });
  return { audio_url: partAudioUrl, groups: groupKeys.map(go => groupMap.get(go)) };
}

// Generate and download a .xlsx template for the given part
function downloadExcelTemplate(partNum) {
  const wb = XLSX.utils.book_new();
  const template = IMPORT_TEMPLATES[partNum];
  const hasGroups = PART_INFO[partNum]?.hasGroup;
  const wsData = [];

  // Config row for parts with part-level audio
  if ([1, 2, 3, 4].includes(partNum)) {
    wsData.push(['part_audio_url', template.audio_url || '']);
  }

  // Build header row
  const hdrs = [];
  if (hasGroups) {
    hdrs.push('group_order');
    if ([3, 4].includes(partNum)) hdrs.push('transcript', 'group_audio_url');
    if ([6, 7].includes(partNum)) hdrs.push('passage');
    if (partNum === 7) hdrs.push('group_image_url');
  }
  hdrs.push('question_num', 'question_text');
  if (partNum === 1) hdrs.push('image_url');
  hdrs.push('option_a', 'option_b', 'option_c');
  if (partNum !== 2) hdrs.push('option_d');
  if ([1, 2].includes(partNum)) hdrs.push('audio_url');
  if (partNum === 7) hdrs.push('image_url');
  hdrs.push('correct_answer', 'explanation', 'order_index');
  wsData.push(hdrs);

  // Sample data rows
  const source = hasGroups ? template.groups : [{ questions: template.questions }];
  source.forEach(g => {
    (g.questions || []).forEach((q, qi) => {
      const row = [];
      if (hasGroups) {
        row.push(g.group_order ?? 1);
        if ([3, 4].includes(partNum)) { row.push(qi === 0 ? (g.transcript || '') : '', qi === 0 ? (g.audio_url || '') : ''); }
        if ([6, 7].includes(partNum)) row.push(g.passage || '');        // repeat passage on every row
        if (partNum === 7)            row.push(g.image_url || '');       // repeat image on every row
      }
      row.push(q.question_num, q.question_text || '');
      if (partNum === 1) row.push(q.image_url || '');
      row.push(q.option_a || '', q.option_b || '', q.option_c || '');
      if (partNum !== 2) row.push(q.option_d || '');
      if ([1, 2].includes(partNum)) row.push(q.audio_url || '');
      if (partNum === 7) row.push(q.image_url || '');
      row.push(q.correct_answer || 'A', q.explanation || '', q.order_index ?? qi + 1);
      wsData.push(row);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // Auto-width columns — cap passage at 60 chars wide so it doesn't blow out the sheet
  const colWidths = wsData[0].map((h, ci) => {
    const isPassage = String(h).toLowerCase().includes('passage');
    const maxLen = Math.max(...wsData.map(r => String(r[ci] ?? '').length), 12);
    return { wch: isPassage ? Math.min(maxLen, 60) : maxLen };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, `Part${partNum}`);
  XLSX.writeFile(wb, `toeic_part${partNum}_template.xlsx`);
}

function downloadCsvTemplate(partNum) {
  const wb = XLSX.utils.book_new();
  // Reuse the same workbook-building logic by calling downloadExcelTemplate but writing as CSV
  const template = IMPORT_TEMPLATES[partNum];
  const hasGroups = PART_INFO[partNum]?.hasGroup;
  const wsData = [];
  if ([1, 2, 3, 4].includes(partNum)) wsData.push(['part_audio_url', template.audio_url || '']);
  const hdrs = [];
  if (hasGroups) {
    hdrs.push('group_order');
    if ([3, 4].includes(partNum)) hdrs.push('transcript', 'group_audio_url');
    if ([6, 7].includes(partNum)) hdrs.push('passage');
    if (partNum === 7) hdrs.push('group_image_url');
  }
  hdrs.push('question_num', 'question_text');
  if (partNum === 1) hdrs.push('image_url');
  hdrs.push('option_a', 'option_b', 'option_c');
  if (partNum !== 2) hdrs.push('option_d');
  if ([1, 2].includes(partNum)) hdrs.push('audio_url');
  if (partNum === 7) hdrs.push('image_url');
  hdrs.push('correct_answer', 'explanation', 'order_index');
  wsData.push(hdrs);
  const source = hasGroups ? template.groups : [{ questions: template.questions }];
  source.forEach(g => {
    (g.questions || []).forEach((q, qi) => {
      const row = [];
      if (hasGroups) {
        row.push(g.group_order ?? 1);
        if ([3, 4].includes(partNum)) { row.push(qi === 0 ? (g.transcript || '') : '', qi === 0 ? (g.audio_url || '') : ''); }
        if ([6, 7].includes(partNum)) row.push(g.passage || '');        // repeat passage on every row
        if (partNum === 7)            row.push(g.image_url || '');       // repeat image on every row
      }
      row.push(q.question_num, q.question_text || '');
      if (partNum === 1) row.push(q.image_url || '');
      row.push(q.option_a || '', q.option_b || '', q.option_c || '');
      if (partNum !== 2) row.push(q.option_d || '');
      if ([1, 2].includes(partNum)) row.push(q.audio_url || '');
      if (partNum === 7) row.push(q.image_url || '');
      row.push(q.correct_answer || 'A', q.explanation || '', q.order_index ?? qi + 1);
      wsData.push(row);
    });
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, `Part${partNum}`);
  XLSX.writeFile(wb, `toeic_part${partNum}_template.csv`);
}

export default function AdminToeicPage() {
  const [view,      setView]      = useState('tests');   // 'tests' | 'parts' | 'questions'
  const [tests,     setTests]     = useState([]);
  const [selTest,   setSelTest]   = useState(null);      // test object
  const [selPart,   setSelPart]   = useState(null);      // part number
  const [partData,  setPartData]  = useState(null);      // { groups, questions }
  const [loading,   setLoading]   = useState(false);

  // Modals
  const [testModal,  setTestModal]  = useState(null);    // null | 'add' | test obj
  const [groupModal, setGroupModal] = useState(null);    // null | 'add' | group obj
  const [qModal,     setQModal]     = useState(null);    // null | 'add' | question obj
  const [form,       setForm]       = useState({});
  const [saving,     setSaving]     = useState(false);

  // Image upload
  const [uploadModal,   setUploadModal]   = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);  // { original, url }
  const [uploading,     setUploading]     = useState(false);
  const [copied,        setCopied]        = useState('');  // URL đang flash copy
  const [resolving,     setResolving]     = useState(false);
  const [fixingPaths,   setFixingPaths]   = useState(false);

  // Bulk-delete
  const [selQIds, setSelQIds] = useState(new Set());

  // Part directions
  const [partDirections, setPartDirections] = useState({});
  const [dirModal,       setDirModal]       = useState(false);
  const [dirText,        setDirText]        = useState('');

  // Import
  const [importModal,    setImportModal]    = useState(false);
  const [importData,     setImportData]     = useState(null);   // parsed object
  const [importFile,     setImportFile]     = useState('');     // filename display
  const [importing,      setImporting]      = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });

  /* ── Load tests ── */
  const loadTests = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/toeic/admin/tests');
      setTests(r.data.data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTests(); }, [loadTests]);

  // Load directions from localStorage when test changes
  useEffect(() => {
    if (selTest?.id) {
      try {
        const stored = localStorage.getItem(`toeic_dir_${selTest.id}`);
        setPartDirections(stored ? JSON.parse(stored) : {});
      } catch { setPartDirections({}); }
    }
  }, [selTest?.id]);

  // Reset selection when switching part
  useEffect(() => { setSelQIds(new Set()); }, [selPart]);

  /* ── Load part data ── */
  const loadPartData = useCallback(async (testId, partNum) => {
    setLoading(true);
    try {
      const r = await api.get(`/toeic/tests/${testId}`);
      const data = r.data.data;
      const groups = (data.groups || []).filter(g => g.part_num === partNum);
      const questions = (data.questions || []).filter(q => q.part_num === partNum);
      setPartData({ groups, questions });
    } finally { setLoading(false); }
  }, []);

  const openPart = (test, partNum) => {
    setSelTest(test);
    setSelPart(partNum);
    setView('questions');
    loadPartData(test.id, partNum);
  };

  /* ── Save handlers ── */
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const saveTest = async () => {
    setSaving(true);
    try {
      if (testModal === 'add') {
        const r = await api.post('/toeic/admin/tests', form);
        await loadTests();
        setTestModal(null);
        // Chuyển thẳng vào Parts view của đề vừa tạo
        setSelTest({ id: r.data.id, ...form });
        setView('parts');
      } else {
        await api.put(`/toeic/admin/tests/${testModal.id}`, form);
        await loadTests();
        setTestModal(null);
      }
    } catch { alert('Lỗi khi lưu'); } finally { setSaving(false); }
  };

  const saveGroup = async () => {
    setSaving(true);
    try {
      if (groupModal === 'add') await api.post('/toeic/admin/groups', { ...form, test_id: selTest.id, part_num: selPart });
      else await api.put(`/toeic/admin/groups/${groupModal.id}`, form);
      await loadPartData(selTest.id, selPart); setGroupModal(null);
    } catch { alert('Lỗi khi lưu'); } finally { setSaving(false); }
  };

  const saveQuestion = async () => {
    setSaving(true);
    try {
      const payload = { ...form, test_id: selTest.id, part_num: selPart,
        group_id: form.group_id || null };
      if (qModal === 'add') await api.post('/toeic/admin/questions', payload);
      else await api.put(`/toeic/admin/questions/${qModal.id}`, payload);
      await loadPartData(selTest.id, selPart); setQModal(null);
    } catch { alert('Lỗi khi lưu'); } finally { setSaving(false); }
  };

  const del = async (type, id) => {
    if (!window.confirm('Xác nhận xóa?')) return;
    if (type === 'test')     { await api.delete(`/toeic/admin/tests/${id}`); loadTests(); }
    if (type === 'group')    { await api.delete(`/toeic/admin/groups/${id}`); loadPartData(selTest.id, selPart); }
    if (type === 'question') { await api.delete(`/toeic/admin/questions/${id}`); loadPartData(selTest.id, selPart); }
  };

  const handleImageUpload = async files => {
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('images', f));
    try {
      const res = await api.post('/toeic/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedFiles(prev => [...(res.data.files || []), ...prev]);
    } catch (e) {
      alert('Upload thất bại: ' + (e.response?.data?.message || e.message));
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = url => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(''), 1800);
  };

  // Phát hiện đường dẫn local trong importData
  const getLocalPaths = (data) => {
    if (!data) return [];
    const s = new Set();
    const chk = v => { if (typeof v === 'string' && /^[A-Za-z]:[\\\/]/.test(v.trim())) s.add(v.trim()); };
    (data.groups    || []).forEach(g => { chk(g.image_url); (g.questions || []).forEach(q => chk(q.image_url)); });
    (data.questions || []).forEach(q => chk(q.image_url));
    return [...s];
  };

  // Upload ảnh local và thay thế URL trong importData
  const resolveLocalImages = async (folderFiles) => {
    const localPaths = getLocalPaths(importData);
    if (!localPaths.length) return;

    // Map tên file (lowercase) → File object
    const byName = {};
    Array.from(folderFiles).forEach(f => { byName[f.name.toLowerCase()] = f; });

    // Chỉ upload các file khớp tên
    const matched = localPaths.filter(p => !!byName[p.split(/[\\\/]/).pop().toLowerCase()]);
    if (!matched.length) { alert('Không tìm thấy ảnh nào khớp trong folder đã chọn.'); return; }

    setResolving(true);
    try {
      const fd = new FormData();
      matched.forEach(p => fd.append('images', byName[p.split(/[\\\/]/).pop().toLowerCase()]));

      const res = await api.post('/toeic/admin/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Xây dựng map: đường dẫn local → URL server
      const pathToUrl = {};
      matched.forEach((p, i) => { if (res.data.files?.[i]) pathToUrl[p] = res.data.files[i].url; });

      // Thay thế trong importData
      const rep = v => (typeof v === 'string' && pathToUrl[v.trim()]) ? pathToUrl[v.trim()] : (v || '');
      setImportData(prev => ({
        ...prev,
        groups:    prev.groups?.map(g => ({
          ...g,
          image_url: rep(g.image_url),
          questions: g.questions?.map(q => ({ ...q, image_url: rep(q.image_url) })),
        })),
        questions: prev.questions?.map(q => ({ ...q, image_url: rep(q.image_url) })),
      }));
    } catch (e) {
      alert('Lỗi upload ảnh: ' + (e.response?.data?.message || e.message));
    } finally {
      setResolving(false);
    }
  };

  // Scan groups + questions trong partData, tìm local paths, upload rồi cập nhật DB
  const fixLocalPaths = async (folderFiles) => {
    const isLocal = v => typeof v === 'string' && /^[A-Za-z]:[\\\/]/.test(v.trim());
    const groups    = partData?.groups    || [];
    const questions = partData?.questions || [];

    const items = [
      ...groups   .filter(g => isLocal(g.image_url))
                  .map(g => ({ type: 'group',    id: g.id, localPath: g.image_url.trim(), data: g })),
      ...questions.filter(q => isLocal(q.image_url))
                  .map(q => ({ type: 'question', id: q.id, localPath: q.image_url.trim(), data: q })),
    ];
    if (!items.length) return;

    const byName = {};
    Array.from(folderFiles).forEach(f => { byName[f.name.toLowerCase()] = f; });

    const matched = items.filter(item => !!byName[item.localPath.split(/[\\\/]/).pop().toLowerCase()]);
    if (!matched.length) { alert('Không tìm thấy ảnh nào khớp trong folder đã chọn.'); return; }

    setFixingPaths(true);
    try {
      // Batch upload
      const fd = new FormData();
      matched.forEach(item => fd.append('images', byName[item.localPath.split(/[\\\/]/).pop().toLowerCase()]));
      const res = await api.post('/toeic/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      const pathToUrl = {};
      matched.forEach((item, i) => { if (res.data.files?.[i]) pathToUrl[item.localPath] = res.data.files[i].url; });

      // Update DB for each item
      for (const item of matched) {
        const newUrl = pathToUrl[item.localPath];
        if (!newUrl) continue;
        const d = item.data;
        if (item.type === 'group') {
          await api.put(`/toeic/admin/groups/${item.id}`, {
            group_order: d.group_order, audio_url: d.audio_url || '',
            image_url: newUrl, passage: d.passage || '', transcript: d.transcript || '',
          });
        } else {
          await api.put(`/toeic/admin/questions/${item.id}`, {
            group_id: d.group_id || null, part_num: d.part_num,
            question_num: d.question_num, question_text: d.question_text || '',
            image_url: newUrl, audio_url: d.audio_url || '',
            option_a: d.option_a || '', option_b: d.option_b || '',
            option_c: d.option_c || '', option_d: d.option_d || '',
            correct_answer: d.correct_answer || 'A',
            explanation: d.explanation || '', order_index: d.order_index || 0,
          });
        }
      }
      await loadPartData(selTest.id, selPart);
    } catch (e) {
      alert('Lỗi fix: ' + (e.response?.data?.message || e.message));
    } finally {
      setFixingPaths(false);
    }
  };

  const toggleSelQ = id => setSelQIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const delSelected = async () => {
    if (!selQIds.size) return;
    if (!window.confirm(`Xóa ${selQIds.size} câu hỏi đã chọn?`)) return;
    for (const id of selQIds) await api.delete(`/toeic/admin/questions/${id}`);
    setSelQIds(new Set());
    loadPartData(selTest.id, selPart);
  };

  const saveDirection = () => {
    const next = { ...partDirections, [selPart]: dirText };
    setPartDirections(next);
    try { localStorage.setItem(`toeic_dir_${selTest.id}`, JSON.stringify(next)); } catch {}
    setDirModal(false);
  };

  const doImport = async () => {
    const data = importData;
    if (!data) { alert('Chưa chọn file.'); return; }

    const hasGroups = PART_INFO[selPart]?.hasGroup;
    if (hasGroups && !Array.isArray(data.groups))     { alert('File thiếu dữ liệu groups.'); return; }
    if (!hasGroups && !Array.isArray(data.questions)) { alert('File thiếu dữ liệu questions.'); return; }

    // Count total API calls for progress bar
    let total = hasGroups
      ? data.groups.reduce((s, g) => s + 1 + (g.questions?.length || 0), 0)
      : data.questions.length;
    let done = 0;
    setImportProgress({ done, total });
    setImporting(true);

    try {
      if (hasGroups) {

        for (const g of data.groups) {
          const res = await api.post('/toeic/admin/groups', {
            test_id:     selTest.id,
            part_num:    selPart,
            audio_url:   g.audio_url   || data.audio_url || '',
            image_url:   g.image_url   || '',
            passage:     g.passage     || '',
            transcript:  g.transcript  || '',
            group_order: g.group_order ?? 0,
          });
          done++;
          setImportProgress({ done, total });
          const groupId = res.data.id ?? res.data.data?.id;
          for (const q of g.questions || []) {
            await api.post('/toeic/admin/questions', {
              test_id:       selTest.id,
              part_num:      selPart,
              group_id:      groupId,
              question_num:  q.question_num  || 0,
              question_text: q.question_text || '',
              image_url:     q.image_url     || '',
              audio_url:     q.audio_url     || '',
              option_a:      q.option_a      || '',
              option_b:      q.option_b      || '',
              option_c:      q.option_c      || '',
              option_d:      q.option_d      || '',
              correct_answer: q.correct_answer || 'A',
              explanation:   q.explanation   || '',
              order_index:   q.order_index   ?? 0,
            });
            done++;
            setImportProgress({ done, total });
          }
        }
      } else {
        for (const q of data.questions) {
          await api.post('/toeic/admin/questions', {
            test_id:       selTest.id,
            part_num:      selPart,
            group_id:      null,
            audio_url:     q.audio_url  || data.audio_url || '',
            image_url:     q.image_url  || '',
            question_num:  q.question_num  || 0,
            question_text: q.question_text || '',
            option_a:      q.option_a      || '',
            option_b:      q.option_b      || '',
            option_c:      q.option_c      || '',
            option_d:      q.option_d      || '',
            correct_answer: q.correct_answer || 'A',
            explanation:   q.explanation   || '',
            order_index:   q.order_index   ?? 0,
          });
          done++;
          setImportProgress({ done, total });
        }
      }
      await loadPartData(selTest.id, selPart);
      setImportModal(false);
      setImportData(null);
      setImportFile('');
    } catch (e) {
      alert('Lỗi import: ' + (e.response?.data?.message || e.message));
    } finally {
      setImporting(false);
      setImportProgress({ done: 0, total: 0 });
    }
  };

  const openTestModal = (t = 'add') => {
    setTestModal(t);
    setForm(t === 'add' ? { ...EMPTY_TEST } : { title: t.title, type: t.type, duration_minutes: t.duration_minutes, difficulty: t.difficulty, description: t.description || '', status: t.status });
  };
  const openGroupModal = (g = 'add') => {
    setGroupModal(g);
    setForm(g === 'add' ? { ...EMPTY_GROUP } : { audio_url: g.audio_url || '', image_url: g.image_url || '', passage: g.passage || '', transcript: g.transcript || '', group_order: g.group_order });
  };
  const openQModal = (q = 'add', groupId = null) => {
    setQModal(q);
    setForm(q === 'add'
      ? { ...EMPTY_Q, group_id: groupId || '' }
      : { question_num: q.question_num, question_text: q.question_text || '', image_url: q.image_url || '', audio_url: q.audio_url || '', option_a: q.option_a || '', option_b: q.option_b || '', option_c: q.option_c || '', option_d: q.option_d || '', correct_answer: q.correct_answer || 'A', explanation: q.explanation || '', order_index: q.order_index, group_id: q.group_id || '' });
  };

  const pInfo = PART_INFO[selPart] || {};

  /* ── Breadcrumb ── */
  const Crumb = () => (
    <nav className="mb-4"><ol className="breadcrumb mb-0">
      <li className={`breadcrumb-item ${view === 'tests' ? 'active' : ''}`}>
        {view !== 'tests' ? <a href="#" onClick={e => { e.preventDefault(); setView('tests'); }}>TOEIC Tests</a> : 'TOEIC Tests'}
      </li>
      {view !== 'tests' && selTest && (
        <li className={`breadcrumb-item ${view === 'parts' ? 'active' : ''}`}>
          {view !== 'parts' ? <a href="#" onClick={e => { e.preventDefault(); setView('parts'); }}>{selTest.title}</a> : selTest.title}
        </li>
      )}
      {view === 'questions' && selPart && (
        <li className="breadcrumb-item active">Part {selPart} — {PART_INFO[selPart]?.label}</li>
      )}
    </ol></nav>
  );

  /* ════════════ TESTS VIEW ════════════ */
  const TestsView = () => (
    <>
      {loading ? <div className="text-center py-5"><div className="spinner-border text-primary"/></div> : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr><th>#</th><th>Title</th><th>Type</th><th>Difficulty</th><th className="text-center">Questions</th><th className="text-center">Duration</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {tests.map((t, i) => (
                <tr key={t.id}>
                  <td className="text-muted small">{i + 1}</td>
                  <td><span className="fw-semibold" style={{ cursor: 'pointer' }} onClick={() => { setSelTest(t); setView('parts'); }}>{t.title}</span></td>
                  <td><span className="badge bg-secondary">{t.type}</span></td>
                  <td><span className={`badge bg-${DIFF_COLOR[t.difficulty]}`}>{t.difficulty}</span></td>
                  <td className="text-center">{parseInt(t.question_count) || 0}</td>
                  <td className="text-center text-muted small">{t.duration_minutes}m</td>
                  <td><span className={`badge bg-${STATUS_COLOR[t.status]}`}>{t.status}</span></td>
                  <td>
                    <button className="btn btn-outline-secondary btn-sm me-1" onClick={() => { setSelTest(t); setView('parts'); }}>Parts</button>
                    <button className="btn btn-outline-primary btn-sm me-1" onClick={() => openTestModal(t)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => del('test', t.id)}>Del</button>
                  </td>
                </tr>
              ))}
              {!tests.length && <tr><td colSpan={8} className="text-center text-muted py-5">No tests yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  /* ════════════ PARTS VIEW ════════════ */
  const PartsView = () => (
    <div className="row g-3">
      {PARTS.map(p => {
        const info = PART_INFO[p];
        return (
          <div key={p} className="col-md-6 col-lg-4">
            <div className="card border rounded-3 p-3 h-100" style={{ cursor: 'pointer' }} onClick={() => openPart(selTest, p)}>
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 44, height: 44, background: info.skill === 'Listening' ? '#e3f2fd' : '#e8f5e9', color: info.skill === 'Listening' ? '#1565c0' : '#2e7d32', fontSize: 18, flexShrink: 0 }}>
                  {p}
                </div>
                <div>
                  <div className="fw-bold small">Part {p}</div>
                  <div className="text-muted small">{info.label}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    {info.skill} {info.hasGroup ? '· has groups' : '· individual'} {info.hasAudio ? '· audio' : ''} {info.hasImage ? '· image' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ════════════ QUESTIONS VIEW ════════════ */
  const QuestionsView = () => {
    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"/></div>;
    const groups    = partData?.groups || [];
    const ungrouped = (partData?.questions || []).filter(q => !q.group_id);
    const hasGroups = pInfo.hasGroup;
    const allQIds   = hasGroups
      ? (partData?.questions || []).map(q => q.id)
      : ungrouped.map(q => q.id);
    const allSelected = allQIds.length > 0 && allQIds.every(id => selQIds.has(id));
    const currentDir  = partDirections[selPart] || PART_DIRECTIONS[selPart] || '';

    return (
      <div className="d-flex flex-column gap-3">

        {/* ── Part Directions ── */}
        <div className="border rounded-3 p-3" style={{ background: 'rgba(13,110,253,.04)', borderColor: 'rgba(13,110,253,.2) !important' }}>
          <div className="d-flex justify-content-between align-items-start gap-2">
            <div style={{ flex: 1 }}>
              <div className="fw-semibold small text-primary mb-1" style={{ letterSpacing: '.06em' }}>
                PART {selPart} — DIRECTIONS
              </div>
              <div className="small text-muted" style={{ lineHeight: 1.7 }}>
                {currentDir || <span className="fst-italic">Chưa có nội dung hướng dẫn.</span>}
              </div>
            </div>
            <button className="btn btn-outline-primary btn-sm flex-shrink-0"
              onClick={() => { setDirText(currentDir); setDirModal(true); }}>
              Edit
            </button>
          </div>
        </div>

        {/* ── Local path warning + fix ── */}
        {(() => {
          const isLocal = v => typeof v === 'string' && /^[A-Za-z]:[\\\/]/.test(v.trim());
          const localCount = [
            ...(partData?.groups    || []).filter(g => isLocal(g.image_url)),
            ...(partData?.questions || []).filter(q => isLocal(q.image_url)),
          ].length;
          if (!localCount) return null;
          return (
            <div className="d-flex align-items-center justify-content-between px-3 py-2 rounded border border-danger bg-danger bg-opacity-10">
              <div>
                <div className="fw-semibold small text-danger">⚠️ {localCount} ảnh đang dùng đường dẫn local</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Không hiển thị được trên web — chọn <strong>folder chứa ảnh</strong>, hệ thống tự upload và cập nhật DB.</div>
              </div>
              <label className={`btn btn-sm btn-danger flex-shrink-0 ms-3 ${fixingPaths ? 'disabled' : ''}`}>
                {fixingPaths
                  ? <><span className="spinner-border spinner-border-sm me-1"/>Đang fix...</>
                  : `📁 Fix ${localCount} ảnh`}
                <input type="file" className="d-none"
                  multiple disabled={fixingPaths}
                  ref={el => { if (el) el.webkitdirectory = true; }}
                  onChange={async e => { await fixLocalPaths(e.target.files); e.target.value = ''; }}
                />
              </label>
            </div>
          );
        })()}

        {/* ── Bulk-delete bar ── */}
        {selQIds.size > 0 && (
          <div className="d-flex align-items-center justify-content-between px-3 py-2 rounded border border-danger bg-danger bg-opacity-10">
            <span className="small fw-semibold text-danger">Đã chọn {selQIds.size} câu hỏi</span>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelQIds(new Set())}>Bỏ chọn</button>
              <button className="btn btn-sm btn-danger" onClick={delSelected}>Xóa {selQIds.size} câu</button>
            </div>
          </div>
        )}

        {/* ── Groups section (Parts 3, 4, 6, 7) ── */}
        {hasGroups && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <input type="checkbox" className="form-check-input mt-0" title="Chọn tất cả"
                  checked={allSelected}
                  onChange={() => allSelected ? setSelQIds(new Set()) : setSelQIds(new Set(allQIds))}
                />
                <h6 className="fw-bold mb-0">Groups ({groups.length})</h6>
              </div>
              <button className="btn btn-outline-success btn-sm" onClick={() => openGroupModal('add')}>+ Add Group</button>
            </div>
            {!groups.length ? (
              <p className="text-muted small">No groups yet. Create groups first, then add questions.</p>
            ) : groups.map((g, gi) => {
              const gqs     = (partData?.questions || []).filter(q => q.group_id === g.id);
              const gAllSel = gqs.length > 0 && gqs.every(q => selQIds.has(q.id));
              return (
                <div key={g.id} className="card mb-3 border">
                  <div className="card-header d-flex justify-content-between align-items-center bg-light py-2">
                    <div className="d-flex align-items-center gap-2">
                      <input type="checkbox" className="form-check-input mt-0" title="Chọn tất cả trong group"
                        checked={gAllSel}
                        onChange={() => {
                          const next = new Set(selQIds);
                          gAllSel ? gqs.forEach(q => next.delete(q.id)) : gqs.forEach(q => next.add(q.id));
                          setSelQIds(next);
                        }}
                      />
                      <span className="fw-semibold small">Group {gi + 1}</span>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <span className="text-muted small">{gqs.length} question{gqs.length !== 1 ? 's' : ''}</span>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => openGroupModal(g)}>Edit</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => del('group', g.id)}>Del</button>
                      <button className="btn btn-success btn-sm" onClick={() => openQModal('add', g.id)}>+ Q</button>
                    </div>
                  </div>
                  <div className="card-body py-2 px-3">
                    {g.audio_url  && <div className="small text-muted mb-1">🎵 {g.audio_url}</div>}
                    {g.image_url  && (
                      <div className="mb-2">
                        <img src={g.image_url} alt=""
                          style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 4, border: '1px solid #dee2e6' }}
                          onError={e => { e.target.outerHTML = `<div class="text-danger small py-1">⚠️ Không tải được ảnh: ${g.image_url}</div>`; }}
                        />
                      </div>
                    )}
                    {g.passage    && <div className="small text-muted bg-light rounded p-2 mb-1" style={{ maxHeight: 80, overflow: 'hidden' }}>{g.passage.slice(0, 200)}...</div>}
                    {g.transcript && <div className="small text-muted">📝 Transcript available</div>}
                  </div>
                  {gqs.length > 0 && (
                    <div className="card-body pt-0">
                      {gqs.map((q, qi) => (
                        <div key={q.id} className={`d-flex align-items-start gap-2 p-2 rounded border mb-1 ${selQIds.has(q.id) ? 'border-danger bg-danger bg-opacity-5' : 'bg-light'}`}>
                          <input type="checkbox" className="form-check-input mt-1 flex-shrink-0"
                            checked={selQIds.has(q.id)} onChange={() => toggleSelQ(q.id)}/>
                          <span className="badge bg-secondary flex-shrink-0 mt-1">Q{q.question_num || qi+1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="small fw-semibold text-truncate">{q.question_text || '(audio only)'}</div>
                            <div className="d-flex gap-1 mt-1 flex-wrap">
                              {OPTS.filter(o => q[`option_${o.toLowerCase()}`]).map(o => (
                                <span key={o} className={`badge ${q.correct_answer === o ? 'bg-success' : 'bg-light border text-muted'}`}>{o}</span>
                              ))}
                            </div>
                          </div>
                          <div className="d-flex gap-1 flex-shrink-0">
                            <button className="btn btn-outline-primary btn-sm" onClick={() => openQModal(q)}>Edit</button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => del('question', q.id)}>Del</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Ungrouped questions (Parts 1, 2, 5) ── */}
        {!hasGroups && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center gap-2">
                <input type="checkbox" className="form-check-input mt-0" title="Chọn tất cả"
                  checked={allSelected}
                  onChange={() => allSelected ? setSelQIds(new Set()) : setSelQIds(new Set(allQIds))}
                />
                <h6 className="fw-bold mb-0">Questions ({ungrouped.length})</h6>
              </div>
              <button className="btn btn-success btn-sm" onClick={() => openQModal('add')}>+ Add Question</button>
            </div>
            {!ungrouped.length ? (
              <p className="text-muted small">No questions yet.</p>
            ) : ungrouped.map((q, i) => (
              <div key={q.id} className={`card mb-2 border ${selQIds.has(q.id) ? 'border-danger' : ''}`}>
                <div className="card-body py-2 px-3">
                  <div className="d-flex align-items-start gap-2">
                    <input type="checkbox" className="form-check-input mt-1 flex-shrink-0"
                      checked={selQIds.has(q.id)} onChange={() => toggleSelQ(q.id)}/>
                    <span className="badge bg-secondary flex-shrink-0 mt-1">Q{q.question_num || i+1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {q.audio_url && <div className="small text-muted mb-1">🎵 {q.audio_url}</div>}
                      {q.image_url && <div className="small text-muted mb-1">🖼 {q.image_url}</div>}
                      <div className="small fw-semibold">{q.question_text || '(audio/image only)'}</div>
                      <div className="d-flex gap-1 mt-1 flex-wrap">
                        {OPTS.filter(o => q[`option_${o.toLowerCase()}`]).map(o => (
                          <span key={o} className={`badge ${q.correct_answer === o ? 'bg-success' : 'bg-light border text-muted'}`}>{o}: {q[`option_${o.toLowerCase()}`]?.slice(0,20)}</span>
                        ))}
                      </div>
                    </div>
                    <div className="d-flex gap-1 flex-shrink-0">
                      <button className="btn btn-outline-primary btn-sm" onClick={() => openQModal(q)}>Edit</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => del('question', q.id)}>Del</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: 1100 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="fw-bold mb-0">
          {view === 'tests' ? 'TOEIC Tests'
            : view === 'parts' ? selTest?.title
            : `Part ${selPart} — ${PART_INFO[selPart]?.label}`}
        </h4>
        {view === 'tests' && (
          <button className="btn btn-primary" onClick={() => openTestModal('add')}>+ Add Test</button>
        )}
        {view === 'parts' && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setUploadModal(true)}>🖼 Upload Images</button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => openTestModal(selTest)}>Edit Test</button>
          </div>
        )}
        {view === 'questions' && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setUploadModal(true)}>🖼 Upload Images</button>
            <button className="btn btn-outline-info btn-sm" onClick={() => { setImportData(null); setImportFile(''); setImportModal(true); }}>
              ↑ Import
            </button>
            {pInfo.hasGroup
              ? <button className="btn btn-outline-success btn-sm" onClick={() => openGroupModal('add')}>+ Add Group</button>
              : <button className="btn btn-success btn-sm" onClick={() => openQModal('add')}>+ Add Question</button>
            }
          </div>
        )}
      </div>

      <Crumb />

      {view === 'tests'     && <TestsView />}
      {view === 'parts'     && <PartsView />}
      {view === 'questions' && <QuestionsView />}

      {/* ══ TEST MODAL ══ */}
      {testModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{testModal === 'add' ? 'Add TOEIC Test' : `Edit: ${testModal.title}`}</h5>
                <button className="btn-close" onClick={() => setTestModal(null)}/>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Title *</label>
                  <input className="form-control" value={form.title || ''} onChange={e => f('title', e.target.value)} placeholder="e.g. TOEIC Practice Test 1"/>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Type</label>
                    <select className="form-select" value={form.type || 'full_test'} onChange={e => f('type', e.target.value)}>
                      <option value="full_test">Full Test (200 câu)</option>
                      <option value="mini_test">Mini Test</option>
                      <option value="practice_set">Practice Set</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Difficulty</label>
                    <select className="form-select" value={form.difficulty || 'medium'} onChange={e => f('difficulty', e.target.value)}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Duration (phút)</label>
                    <input type="number" className="form-control" value={form.duration_minutes || 120} onChange={e => f('duration_minutes', +e.target.value)}/>
                  </div>
                </div>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Status</label>
                    <select className="form-select" value={form.status || 'draft'} onChange={e => f('status', e.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="public">Public</option>
                      <option value="hidden">Hidden</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea className="form-control" rows={3} value={form.description || ''} onChange={e => f('description', e.target.value)} placeholder="Mô tả đề thi..."/>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setTestModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveTest} disabled={saving || !form.title}>
                  {saving && <span className="spinner-border spinner-border-sm me-2"/>} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ GROUP MODAL ══ */}
      {groupModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{groupModal === 'add' ? `Add Group — Part ${selPart}` : 'Edit Group'}</h5>
                <button className="btn-close" onClick={() => setGroupModal(null)}/>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Order Index</label>
                  <input type="number" className="form-control" value={form.group_order ?? 0} onChange={e => f('group_order', +e.target.value)}/>
                  <div className="form-text">Thứ tự hiển thị của group trong part (0 = đầu tiên). Group có số nhỏ hơn sẽ hiện trước.</div>
                </div>
                {(selPart <= 4) && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Audio URL {[3,4].includes(selPart) && <span className="text-danger">*</span>}</label>
                      <input className="form-control" value={form.audio_url || ''} onChange={e => f('audio_url', e.target.value)} placeholder="https://... (mp3/wav)"/>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Image URL <span className="text-muted small fw-normal">(optional)</span></label>
                      <input className="form-control" value={form.image_url || ''} onChange={e => f('image_url', e.target.value)} placeholder="https://... (jpg/png)"/>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Transcript</label>
                      <textarea className="form-control" rows={5} value={form.transcript || ''} onChange={e => f('transcript', e.target.value)} placeholder="Transcript of the audio..."/>
                    </div>
                  </>
                )}
                {(selPart >= 6) && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Image URL <span className="text-muted small fw-normal">(optional — bảng, biểu đồ, quảng cáo...)</span></label>
                      <input className="form-control" value={form.image_url || ''} onChange={e => f('image_url', e.target.value)} placeholder="https://..."/>
                      {form.image_url && (
                        <div className="mt-2">
                          <img src={form.image_url} alt="preview" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 4, border: '1px solid #dee2e6' }}
                            onError={e => { e.target.style.display = 'none'; }}/>
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Passage</label>
                      <textarea className="form-control" rows={10} value={form.passage || ''} onChange={e => f('passage', e.target.value)} placeholder="Reading passage text..."/>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setGroupModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveGroup} disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-2"/>} Save Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ QUESTION MODAL ══ */}
      {qModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{qModal === 'add' ? `Add Question — Part ${selPart}` : 'Edit Question'}</h5>
                <button className="btn-close" onClick={() => setQModal(null)}/>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Question #</label>
                    <input type="number" className="form-control" value={form.question_num || ''} onChange={e => f('question_num', +e.target.value)} placeholder="e.g. 32"/>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Order Index</label>
                    <input type="number" className="form-control" value={form.order_index ?? 0} onChange={e => f('order_index', +e.target.value)}/>
                    <div className="form-text">Thứ tự hiển thị trong part. Số nhỏ hơn = hiện trước.</div>
                  </div>
                  {pInfo.hasGroup && (
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Group ID</label>
                      <input type="number" className="form-control" value={form.group_id || ''} onChange={e => f('group_id', +e.target.value)} placeholder="Group ID"/>
                    </div>
                  )}
                </div>

                {pInfo.hasAudio && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Audio URL</label>
                    <input className="form-control" value={form.audio_url || ''} onChange={e => f('audio_url', e.target.value)} placeholder="https://..."/>
                  </div>
                )}
                {(pInfo.hasImage || selPart === 1) && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Image URL</label>
                    <input className="form-control" value={form.image_url || ''} onChange={e => f('image_url', e.target.value)} placeholder="https://..."/>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Question Text</label>
                  <textarea className="form-control" rows={3} value={form.question_text || ''} onChange={e => f('question_text', e.target.value)}
                    placeholder={selPart <= 2 ? '(optional — audio carries question)' : 'What is the main topic of...?'}/>
                </div>

                {/* Options with inline correct selector */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Options <span className="text-muted small fw-normal">(select radio = correct)</span>
                  </label>
                  {OPTS.map(opt => {
                    const key = `option_${opt.toLowerCase()}`;
                    const isCorrect = form.correct_answer === opt;
                    return (
                      <div key={opt} className={`d-flex align-items-center gap-2 p-2 rounded border mb-1 ${isCorrect ? 'border-success bg-success bg-opacity-10' : ''}`}>
                        <input type="radio" className="form-check-input mt-0 flex-shrink-0" checked={isCorrect} onChange={() => f('correct_answer', opt)}/>
                        <span className={`badge flex-shrink-0 ${isCorrect ? 'bg-success' : 'bg-secondary'}`}>{opt}</span>
                        <input className="form-control form-control-sm" value={form[key] || ''} onChange={e => f(key, e.target.value)} placeholder={`Option ${opt}...`}/>
                        {isCorrect && <span className="text-success fw-semibold small flex-shrink-0">✓</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Explanation</label>
                  <textarea className="form-control" rows={3} value={form.explanation || ''} onChange={e => f('explanation', e.target.value)} placeholder="Explain the correct answer..."/>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setQModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveQuestion} disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-2"/>} Save Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ UPLOAD IMAGES MODAL ══ */}
      {uploadModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">🖼 Upload Images</h5>
                <button className="btn-close" onClick={() => setUploadModal(false)}/>
              </div>
              <div className="modal-body">

                {/* Drop zone */}
                <label
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', border: '2px dashed #adb5bd', borderRadius: 8,
                    padding: '28px 20px', cursor: uploading ? 'not-allowed' : 'pointer',
                    background: 'rgba(0,0,0,.02)', transition: 'border-color .2s', textAlign: 'center',
                  }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#0d6efd'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = '#adb5bd'; }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#adb5bd';
                    handleImageUpload(e.dataTransfer.files);
                  }}
                >
                  {uploading
                    ? <><span className="spinner-border spinner-border-sm me-2"/>Đang upload...</>
                    : <>
                        <div style={{ fontSize: 36 }}>📁</div>
                        <div className="fw-semibold mt-2">Kéo thả ảnh vào đây hoặc nhấp để chọn</div>
                        <div className="text-muted small mt-1">JPG, PNG, GIF, WebP — tối đa 10 MB/file, 30 file/lần</div>
                      </>
                  }
                  <input type="file" accept="image/*" multiple className="d-none" disabled={uploading}
                    onChange={e => { handleImageUpload(e.target.files); e.target.value = ''; }}/>
                </label>

                {/* Uploaded list */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="fw-semibold small">{uploadedFiles.length} ảnh đã upload</div>
                      <button className="btn btn-outline-secondary btn-sm"
                        onClick={() => setUploadedFiles([])}>Xóa danh sách</button>
                    </div>
                    <div style={{ maxHeight: 380, overflowY: 'auto' }} className="d-flex flex-column gap-2">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="d-flex align-items-center gap-2 p-2 border rounded">
                          <img src={f.url} alt={f.original}
                            style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 4, flexShrink: 0, background: '#f0f0f0' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="small fw-semibold text-truncate">{f.original}</div>
                            <div className="small text-muted text-truncate" style={{ fontSize: 11 }}>{f.url}</div>
                          </div>
                          <button
                            className={`btn btn-sm flex-shrink-0 ${copied === f.url ? 'btn-success' : 'btn-outline-secondary'}`}
                            style={{ minWidth: 68 }}
                            onClick={() => copyUrl(f.url)}
                          >
                            {copied === f.url ? '✓ Copied' : 'Copy URL'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedFiles.length === 0 && !uploading && (
                  <p className="text-muted small text-center mt-3">
                    Sau khi upload, copy URL và dán vào cột <code>image_url</code> trong file Excel.
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setUploadModal(false)}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ DIRECTIONS MODAL ══ */}
      {dirModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Part {selPart} — Directions</h5>
                <button className="btn-close" onClick={() => setDirModal(false)}/>
              </div>
              <div className="modal-body">
                <div className="mb-2 small text-muted">
                  Nội dung hướng dẫn hiển thị cho thí sinh trước khi làm Part {selPart}.
                </div>
                <textarea
                  className="form-control"
                  rows={8}
                  value={dirText}
                  onChange={e => setDirText(e.target.value)}
                  placeholder="Nhập nội dung directions..."
                />
                <div className="mt-2 d-flex gap-2">
                  <button className="btn btn-outline-secondary btn-sm"
                    onClick={() => setDirText(PART_DIRECTIONS[selPart] || '')}>
                    Reset về mặc định
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDirModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveDirection}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ IMPORT MODAL ══ */}
      {importModal && (() => {
        const hg = PART_INFO[selPart]?.hasGroup;
        const gc = importData?.groups?.length || 0;
        const qc = hg
          ? (importData?.groups || []).reduce((s, g) => s + (g.questions?.length || 0), 0)
          : (importData?.questions?.length || 0);
        const closeModal = () => { setImportModal(false); setImportData(null); setImportFile(''); };
        const handleFile = e => {
          const file = e.target.files[0];
          if (!file) return;
          setImportFile(file.name);
          setImportData(null);
          const isExcel = /\.(xlsx|xls)$/i.test(file.name);
          const isCsv   = /\.csv$/i.test(file.name);
          if (isExcel) {
            const r = new FileReader();
            r.onload = ev => {
              try { setImportData(parseFileToJSON(new Uint8Array(ev.target.result), selPart, 'array')); }
              catch (err) { alert('Lỗi đọc Excel: ' + err.message); setImportFile(''); }
            };
            r.readAsArrayBuffer(file);
          } else if (isCsv) {
            const r = new FileReader();
            r.onload = ev => {
              try { setImportData(parseFileToJSON(ev.target.result, selPart, 'string')); }
              catch (err) { alert('Lỗi đọc CSV: ' + err.message); setImportFile(''); }
            };
            r.readAsText(file);
          }
          e.target.value = '';
        };

        return (
          <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    Import Part {selPart} — {PART_INFO[selPart]?.label}
                  </h5>
                  <button className="btn-close" onClick={closeModal} disabled={importing}/>
                </div>
                <div className="modal-body">

                  {/* Instructions */}
                  <div className="alert alert-info py-2 small mb-4">
                    {selPart <= 2    && <>Row đầu: <code>part_audio_url, [url]</code>. Tiếp theo: header + dữ liệu câu hỏi (options A–{selPart === 1 ? 'D + image_url' : 'C'}).</>}
                    {[3,4].includes(selPart) && <>Row đầu: <code>part_audio_url, [url]</code>. Cột: <code>group_order, transcript, group_audio_url</code> + câu hỏi. Cùng <code>group_order</code> = cùng group.</>}
                    {selPart === 5   && <>Cột: <code>question_num, question_text, option_a–d, correct_answer, explanation, order_index</code>.</>}
                    {selPart === 6   && <>Cột: <code>group_order, passage</code> + câu hỏi. Cùng <code>group_order</code> = cùng passage (VD: câu 134–137).</>}
                    {selPart === 7   && <>Cột: <code>group_order, passage, group_image_url</code> + câu hỏi. Mỗi bài đọc = 1 <code>group_order</code> khác nhau.</>}
                  </div>

                  {/* Download templates */}
                  <div className="mb-4">
                    <div className="fw-semibold small mb-2">1. Tải file mẫu:</div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-success btn-sm" disabled={importing}
                        onClick={() => downloadExcelTemplate(selPart)}>
                        ↓ Excel (.xlsx)
                      </button>
                      <button className="btn btn-outline-secondary btn-sm" disabled={importing}
                        onClick={() => downloadCsvTemplate(selPart)}>
                        ↓ CSV (.csv)
                      </button>
                    </div>
                  </div>

                  {/* Upload area */}
                  <div className="mb-3">
                    <div className="fw-semibold small mb-2">2. Điền dữ liệu và tải lên:</div>
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      border: `2px dashed ${importData ? '#198754' : '#adb5bd'}`,
                      borderRadius: 8, padding: '32px 20px', cursor: importing ? 'not-allowed' : 'pointer',
                      background: importData ? 'rgba(25,135,84,.05)' : 'rgba(0,0,0,.02)',
                      transition: 'all .2s', textAlign: 'center',
                    }}>
                      {importData ? (
                        <>
                          <div style={{ fontSize: 32 }}>✅</div>
                          <div className="fw-semibold mt-1">{importFile}</div>
                          <div className="text-success small mt-1">
                            {hg ? `${gc} group${gc !== 1 ? 's' : ''}, ` : ''}{qc} câu hỏi — sẵn sàng import
                          </div>
                          <div className="text-muted small mt-1">Nhấp để chọn file khác</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: 32 }}>📂</div>
                          <div className="fw-semibold mt-1">Chọn file Excel hoặc CSV</div>
                          <div className="text-muted small mt-1">.xlsx, .xls, .csv</div>
                          {importFile && <div className="text-danger small mt-1">Lỗi đọc file — thử lại</div>}
                        </>
                      )}
                      <input type="file" accept=".xlsx,.xls,.csv" className="d-none" disabled={importing} onChange={handleFile}/>
                    </label>
                  </div>

                  {/* ── Resolve local image paths ── */}
                  {(() => {
                    const localPaths = getLocalPaths(importData);
                    if (!localPaths.length) return null;
                    const resolved = (importData?.groups || []).concat([]).reduce((arr, g) => {
                      (g.questions || []).forEach(q => { if (q.image_url && /^https?:\/\//.test(q.image_url)) arr.push(q.image_url); });
                      return arr;
                    }, []).length;
                    return (
                      <div className="alert alert-warning py-2 small mt-2">
                        <div className="fw-semibold mb-1">
                          ⚠️ Tìm thấy {localPaths.length} đường dẫn ảnh local
                        </div>
                        <div className="text-muted mb-2" style={{ fontSize: 11 }}>
                          {localPaths.slice(0, 2).map((p, i) => <div key={i} className="text-truncate">• {p}</div>)}
                          {localPaths.length > 2 && <div>...và {localPaths.length - 2} đường dẫn khác</div>}
                        </div>
                        <div className="mb-1">Chọn <strong>folder</strong> chứa ảnh — hệ thống tự upload và thay URL:</div>
                        <label className={`btn btn-sm btn-warning ${resolving ? 'disabled' : ''}`}>
                          {resolving
                            ? <><span className="spinner-border spinner-border-sm me-1"/>Đang upload...</>
                            : '📁 Chọn Folder Ảnh'}
                          <input type="file" className="d-none"
                            multiple
                            ref={el => { if (el) el.webkitdirectory = true; }}
                            disabled={resolving}
                            onChange={async e => {
                              await resolveLocalImages(e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <span className="ms-2 text-muted" style={{ fontSize: 11 }}>
                          (khớp theo tên file, không phân biệt hoa thường)
                        </span>
                      </div>
                    );
                  })()}

                  {/* Progress bar */}
                  {importing && importProgress.total > 0 && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Đang import...</span>
                        <span>{importProgress.done} / {importProgress.total}</span>
                      </div>
                      <div className="progress" style={{ height: 6 }}>
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                          style={{ width: `${Math.round((importProgress.done / importProgress.total) * 100)}%` }}/>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="btn btn-secondary" disabled={importing} onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={doImport} disabled={importing || !importData}>
                    {importing
                      ? <><span className="spinner-border spinner-border-sm me-2"/>Importing {importProgress.done}/{importProgress.total}...</>
                      : `Import${importData ? ` (${qc} câu)` : ''}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
