import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const RARITY_COLOR = {
  common:    { bg: 'var(--rar-common-bg)',  text: 'var(--rar-common-c)',  border: 'var(--rar-common-bd)'  },
  rare:      { bg: 'var(--rar-rare-bg)',    text: 'var(--rar-rare-c)',    border: 'var(--rar-rare-bd)'    },
  epic:      { bg: 'var(--rar-epic-bg)',    text: 'var(--rar-epic-c)',    border: 'var(--rar-epic-bd)'    },
  legendary: { bg: 'var(--rar-legend-bg)',  text: 'var(--rar-legend-c)',  border: 'var(--rar-legend-bd)'  },
};

const CATEGORY_LABEL = {
  vocab:   '📚 Từ Vựng',
  grammar: '✏️ Ngữ Pháp',
  toeic:   '🎯 TOEIC',
  streak:  '🔥 Streak',
};

function StreakBadge({ streak }) {
  const { current_streak, longest_streak, multiplier } = streak;
  const flames = current_streak >= 30 ? 3 : current_streak >= 7 ? 2 : current_streak >= 3 ? 1 : 0;
  const flameIcon = '🔥'.repeat(flames) || '💤';

  return (
    <div style={styles.streakCard}>
      <div style={styles.streakMain}>
        <span style={styles.streakIcon}>{flameIcon}</span>
        <div>
          <div style={styles.streakNum}>{current_streak}</div>
          <div style={styles.streakLabel}>ngày liên tiếp</div>
        </div>
      </div>
      <div style={styles.streakStats}>
        <div style={styles.streakStat}>
          <span style={styles.streakStatVal}>{longest_streak}</span>
          <span style={styles.streakStatLabel}>kỷ lục</span>
        </div>
        {multiplier > 1 && (
          <div style={{ ...styles.streakStat, ...styles.multiplierBadge }}>
            <span style={styles.streakStatVal}>{multiplier}×</span>
            <span style={styles.streakStatLabel}>EXP</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AchievementCard({ ach }) {
  const unlocked = !!ach.unlocked_at;
  const rarity = RARITY_COLOR[ach.rarity] || RARITY_COLOR.common;
  return (
    <div title={ach.description} style={{
      ...styles.achCard,
      border: `1px solid ${unlocked ? rarity.border : '#e5e7eb'}`,
      background: unlocked ? rarity.bg : '#f9fafb',
      opacity: unlocked ? 1 : 0.5,
    }}>
      <div style={styles.achIcon}>{unlocked ? ach.icon : '🔒'}</div>
      <div style={{ ...styles.achName, color: unlocked ? rarity.text : '#9ca3af' }}>{ach.name}</div>
      {unlocked && ach.exp_reward > 0 && (
        <div style={styles.achExp}>+{ach.exp_reward} EXP</div>
      )}
      {unlocked && (
        <div style={styles.achDate}>{new Date(ach.unlocked_at).toLocaleDateString('vi-VN')}</div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm]     = useState({ full_name: user?.full_name || '', dob: user?.dob?.split('T')[0] || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg]       = useState('');
  const [err, setErr]       = useState('');
  const [saving, setSaving] = useState(false);
  const [gamData, setGamData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    api.get('/users/achievements').then(r => setGamData(r.data.data)).catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setSaving(true);
    try {
      await api.put('/users/profile', form);
      setMsg('Cập nhật thông tin thành công!');
    } catch (er) {
      setErr(er.response?.data?.message || 'Lỗi cập nhật');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setSaving(true);
    try {
      await api.put('/auth/change-password', pwForm);
      setMsg('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (er) {
      setErr(er.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally { setSaving(false); }
  };

  // Group achievements by category
  const byCategory = {};
  if (gamData?.achievements) {
    gamData.achievements.forEach(a => {
      if (!byCategory[a.category]) byCategory[a.category] = [];
      byCategory[a.category].push(a);
    });
  }
  const unlockedCount = gamData?.achievements?.filter(a => a.unlocked_at).length ?? 0;
  const totalCount = gamData?.achievements?.length ?? 0;

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h3 className="fw-bold mb-4">Hồ Sơ Cá Nhân</h3>

      {/* Tabs */}
      <div style={styles.tabRow}>
        {[['profile', '👤 Thông Tin'], ['achievements', `🏆 Thành Tích (${unlockedCount}/${totalCount})`]].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            ...styles.tabBtn,
            ...(activeTab === key ? styles.tabBtnActive : {}),
          }}>{label}</button>
        ))}
      </div>

      {msg && <div className="alert alert-success py-2 mt-3">{msg}</div>}
      {err && <div className="alert alert-danger py-2 mt-3">{err}</div>}

      {activeTab === 'profile' && (
        <>
          {/* Streak banner */}
          {gamData?.streak && gamData.streak.current_streak > 0 && (
            <StreakBadge streak={gamData.streak} />
          )}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Thông tin cá nhân</h6>
              <form onSubmit={handleProfileSave}>
                <div className="mb-3">
                  <label className="form-label">Tên đăng nhập</label>
                  <input className="form-control" value={user?.username || ''} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={user?.email || ''} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label">Họ và tên</label>
                  <input className="form-control" value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày sinh</label>
                  <input type="date" className="form-control" value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-2" />}Lưu thay đổi
                </button>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Đổi mật khẩu</h6>
              <form onSubmit={handlePasswordSave}>
                <div className="mb-3">
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <input type="password" className="form-control" value={pwForm.currentPassword}
                    onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mật khẩu mới</label>
                  <input type="password" className="form-control" value={pwForm.newPassword}
                    onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-warning" disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-2" />}Đổi mật khẩu
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {activeTab === 'achievements' && (
        <div className="mt-3">
          {gamData?.streak && <StreakBadge streak={gamData.streak} />}

          {!gamData && (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border spinner-border-sm me-2" />Đang tải...
            </div>
          )}

          {Object.keys(CATEGORY_LABEL).map(cat => {
            const list = byCategory[cat];
            if (!list) return null;
            const catUnlocked = list.filter(a => a.unlocked_at).length;
            return (
              <div key={cat} className="mb-4">
                <div style={styles.catHeader}>
                  <span style={styles.catLabel}>{CATEGORY_LABEL[cat]}</span>
                  <span style={styles.catCount}>{catUnlocked}/{list.length}</span>
                </div>
                <div style={styles.achGrid}>
                  {list.map(a => <AchievementCard key={a.id} ach={a} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  tabRow: {
    display: 'flex',
    gap: 8,
    borderBottom: '2px solid var(--app-border)',
    marginBottom: 4,
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontSize: '.88rem',
    fontWeight: 500,
    color: 'var(--app-text-3)',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    transition: 'all .2s',
  },
  tabBtnActive: {
    color: 'var(--rar-rare-c)',
    borderBottomColor: 'var(--rar-rare-c)',
    fontWeight: 700,
  },
  streakCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--rar-legend-bg)',
    border: '1px solid var(--rar-legend-bd)',
    borderRadius: 12,
    padding: '12px 20px',
    marginBottom: 16,
    marginTop: 12,
  },
  streakMain: { display: 'flex', alignItems: 'center', gap: 12 },
  streakIcon: { fontSize: '1.6rem' },
  streakNum: { fontSize: '1.8rem', fontWeight: 800, lineHeight: 1, color: 'var(--rar-legend-c)' },
  streakLabel: { fontSize: '.72rem', color: 'var(--rar-legend-c)', fontWeight: 500, marginTop: 2 },
  streakStats: { display: 'flex', gap: 12 },
  streakStat: { textAlign: 'center' },
  streakStatVal: { display: 'block', fontWeight: 700, fontSize: '1rem', color: 'var(--rar-legend-c)' },
  streakStatLabel: { fontSize: '.65rem', color: 'var(--rar-legend-c)' },
  multiplierBadge: {
    background: 'rgba(251,191,36,.25)',
    borderRadius: 8,
    padding: '4px 10px',
    border: '1px solid rgba(251,191,36,.4)',
  },
  catHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  catLabel: { fontWeight: 700, fontSize: '.92rem', fontFamily: 'var(--font-body)', color: 'var(--app-text)' },
  catCount: {
    fontSize: '.75rem',
    background: 'var(--app-surface-3)',
    borderRadius: 12,
    padding: '2px 10px',
    color: 'var(--app-text-3)',
    fontWeight: 600,
    border: '1px solid var(--app-border)',
  },
  achGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: 10,
  },
  achCard: {
    borderRadius: 10,
    padding: '10px 8px',
    textAlign: 'center',
    cursor: 'default',
    transition: 'transform .15s',
  },
  achIcon: { fontSize: '1.6rem', marginBottom: 4 },
  achName: { fontSize: '.7rem', fontWeight: 700, lineHeight: 1.3, fontFamily: 'var(--font-body)' },
  achExp: { fontSize: '.62rem', color: 'var(--correct-text)', fontWeight: 600, marginTop: 4 },
  achDate: { fontSize: '.58rem', color: 'var(--app-text-3)', marginTop: 2 },
};
