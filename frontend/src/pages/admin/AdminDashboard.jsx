import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, topics: 0, lessons: 0, exams: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/users').catch(() => ({ data: { total: 0 } })),
      api.get('/vocab/topics').catch(() => ({ data: { data: [] } })),
      api.get('/grammar/lessons').catch(() => ({ data: { data: [] } })),
      api.get('/toeic/admin/tests').catch(() => ({ data: { data: [] } })),
    ]).then(([u, v, g, e]) => {
      setStats({
        users:   u.data.total || 0,
        topics:  v.data.data?.length || 0,
        lessons: g.data.data?.length || 0,
        exams:   e.data.data?.length || 0,
      });
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  const modules = [
    {
      to: '/admin/vocab',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
        </svg>
      ),
      label: 'Từ Vựng',
      desc: 'Quản lý chủ đề & flashcard',
      value: stats.topics,
      unit: 'chủ đề',
      accent: '#10b981',
      bg: 'rgba(16,185,129,.08)',
    },
    {
      to: '/admin/grammar',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
      label: 'Ngữ Pháp',
      desc: 'Bài học & câu hỏi luyện tập',
      value: stats.lessons,
      unit: 'bài học',
      accent: '#f59e0b',
      bg: 'rgba(245,158,11,.08)',
    },
    {
      to: '/admin/toeic',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
      label: 'TOEIC',
      desc: 'Đề thi & câu hỏi TOEIC',
      value: stats.exams,
      unit: 'đề thi',
      accent: '#6366f1',
      bg: 'rgba(99,102,241,.08)',
    },
    {
      to: '/admin/users',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      label: 'Người Dùng',
      desc: 'Tài khoản & phân quyền',
      value: stats.users,
      unit: 'người dùng',
      accent: '#3b82f6',
      bg: 'rgba(59,130,246,.08)',
    },
  ];

  const quickActions = [
    { label: 'Thêm đề TOEIC', icon: '＋', to: '/admin/toeic', color: '#6366f1' },
    { label: 'Thêm bài ngữ pháp', icon: '＋', to: '/admin/grammar', color: '#f59e0b' },
    { label: 'Thêm chủ đề từ vựng', icon: '＋', to: '/admin/vocab', color: '#10b981' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bs-body-bg)' }}>
      <style>{`
        .adm-card {
          border-radius: 16px;
          border: 1px solid var(--bs-border-color);
          background: var(--bs-body-bg);
          transition: transform .18s, box-shadow .18s;
          cursor: pointer;
          text-decoration: none;
          display: block;
        }
        .adm-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,.1);
        }
        .adm-icon-wrap {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .adm-stat-num {
          font-size: 2rem; font-weight: 800; line-height: 1;
        }
        .adm-section-title {
          font-size: .7rem; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: var(--bs-secondary-color);
          margin-bottom: 14px;
        }
        .adm-quick-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: 10px;
          border: 1.5px dashed var(--bs-border-color);
          background: none; cursor: pointer; width: 100%;
          font-size: 13.5px; font-weight: 600;
          color: var(--bs-body-color);
          transition: all .15s; text-align: left;
        }
        .adm-quick-btn:hover {
          border-style: solid;
          background: var(--bs-tertiary-bg);
        }
        .adm-quick-icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; flex-shrink: 0;
          color: white;
        }
        .adm-hero {
          border-radius: 20px;
          padding: 32px 36px;
          margin-bottom: 28px;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
          position: relative;
          overflow: hidden;
          color: white;
        }
        .adm-hero::before {
          content: '';
          position: absolute; top: -40px; right: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,.05);
        }
        .adm-hero::after {
          content: '';
          position: absolute; bottom: -60px; right: 80px;
          width: 140px; height: 140px; border-radius: 50%;
          background: rgba(255,255,255,.04);
        }
        .adm-avatar-ring {
          width: 52px; height: 52px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800;
          background: rgba(255,255,255,.12);
          flex-shrink: 0;
        }
        .adm-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; flex-shrink: 0; }
      `}</style>

      <div className="container py-4" style={{ maxWidth: 1080 }}>

        {/* Hero */}
        <div className="adm-hero">
          <div className="d-flex align-items-center gap-3 mb-3" style={{ position: 'relative', zIndex: 1 }}>
            <div className="adm-avatar-ring">
              {(user?.full_name || user?.username || 'A')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {greeting}, {user?.full_name || user?.username} 👋
              </div>
              <div style={{ opacity: .65, fontSize: 13 }}>
                Quản trị viên · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
            <div className="ms-auto d-flex align-items-center gap-2" style={{ opacity: .8, fontSize: 13 }}>
              <div className="adm-dot"/>
              Hệ thống hoạt động bình thường
            </div>
          </div>

          {/* Mini stats in hero */}
          <div className="d-flex gap-4 flex-wrap" style={{ position: 'relative', zIndex: 1 }}>
            {[
              { label: 'Người dùng', value: stats.users },
              { label: 'Chủ đề từ vựng', value: stats.topics },
              { label: 'Bài ngữ pháp', value: stats.lessons },
              { label: 'Đề TOEIC', value: stats.exams },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1 }}>
                  {loading ? '—' : s.value}
                </div>
                <div style={{ fontSize: 11, opacity: .6, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="row g-4">
          {/* Left: Module cards */}
          <div className="col-lg-8">
            <div className="adm-section-title">Quản lý nội dung</div>
            <div className="row g-3">
              {modules.map(m => (
                <div key={m.to} className="col-sm-6">
                  <Link to={m.to} className="adm-card">
                    <div className="p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="adm-icon-wrap" style={{ background: m.bg, color: m.accent }}>
                          {m.icon}
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: '1rem' }}>{m.label}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>{m.desc}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-baseline gap-2">
                        <span className="adm-stat-num" style={{ color: m.accent }}>
                          {loading ? '—' : m.value}
                        </span>
                        <span className="text-muted small">{m.unit}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick actions + info */}
          <div className="col-lg-4">
            <div className="adm-section-title">Thao tác nhanh</div>
            <div className="d-flex flex-column gap-2 mb-4">
              {quickActions.map(a => (
                <button key={a.to} className="adm-quick-btn" onClick={() => navigate(a.to)}>
                  <div className="adm-quick-icon" style={{ background: a.color }}>{a.icon}</div>
                  {a.label}
                  <svg className="ms-auto" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" opacity=".4">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>

            <div className="adm-section-title">Điều hướng</div>
            <div className="card rounded-3 border" style={{ overflow: 'hidden' }}>
              {[
                { to: '/admin/toeic',   label: 'TOEIC Tests',     icon: '📝' },
                { to: '/admin/grammar', label: 'Ngữ Pháp',         icon: '✏️' },
                { to: '/admin/vocab',   label: 'Từ Vựng',          icon: '📖' },
                { to: '/admin/users',   label: 'Người Dùng',       icon: '👥' },
              ].map((item, i, arr) => (
                <Link key={item.to} to={item.to}
                  className="d-flex align-items-center gap-3 px-3 py-3 text-decoration-none"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bs-border-color)' : 'none', color: 'var(--bs-body-color)', transition: 'background .12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bs-tertiary-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
                  <span className="fw-semibold small">{item.label}</span>
                  <svg className="ms-auto" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" opacity=".3">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
