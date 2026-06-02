import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const ROLE_BADGE = {
  admin: { label: 'Admin', cls: 'bg-danger' },
  user:  { label: 'User',  cls: 'bg-secondary' },
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card border-0" style={{ borderRadius: 14, background: `${color}12`, border: `1px solid ${color}30` }}>
      <div className="card-body py-3 px-4 d-flex align-items-center gap-3">
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color }}>{value}</div>
          <div style={{ fontSize: 12, color: 'var(--bs-secondary-color)', marginTop: 2 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { user: me } = useAuth();

  const [users,   setUsers]   = useState([]);
  const [stats,   setStats]   = useState({ total: 0, active: 0, locked: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('all'); // all | user | admin | locked
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [confirm, setConfirm] = useState(null); // { type, user }
  const [toast,   setToast]   = useState('');
  const LIMIT = 15;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set('search', search);
      if (filter === 'locked') params.set('locked', '1');
      else if (filter === 'admin') params.set('role', 'admin');
      else if (filter === 'user')  params.set('role', 'user');

      const [uRes, sRes] = await Promise.all([
        api.get(`/users/admin/users?${params}`),
        api.get('/users/admin/users/stats'),
      ]);
      setUsers(uRes.data.data || []);
      setTotal(uRes.data.total || 0);
      setStats(sRes.data.data || {});
    } catch {
      showToast('Lỗi tải dữ liệu');
    } finally { setLoading(false); }
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => { setPage(1); }, [search, filter]);

  const handleToggleLock = async (u) => {
    try {
      await api.put(`/users/admin/users/${u.id}/toggle-lock`);
      showToast(u.is_active ? `Đã khóa tài khoản ${u.username}` : `Đã mở khóa ${u.username}`);
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Lỗi'); }
    setConfirm(null);
  };

  const handleChangeRole = async (u, newRole) => {
    try {
      await api.put(`/users/admin/users/${u.id}/role`, { role: newRole });
      showToast(`Đã đổi role ${u.username} → ${newRole}`);
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Lỗi'); }
    setConfirm(null);
  };

  const handleDelete = async (u) => {
    try {
      await api.delete(`/users/admin/users/${u.id}`);
      showToast(`Đã xóa tài khoản ${u.username}`);
      load();
    } catch (e) { showToast(e.response?.data?.message || 'Lỗi'); }
    setConfirm(null);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="container-fluid py-4 px-4" style={{ maxWidth: 1200 }}>
      <style>{`
        .usr-table th { font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .06em; color: var(--bs-secondary-color); border-bottom: 2px solid var(--bs-border-color); }
        .usr-table td { vertical-align: middle; border-color: var(--bs-border-color); font-size: 13.5px; }
        .usr-row:hover td { background: var(--bs-tertiary-bg); }
        .usr-avatar { width: 34px; height: 34px; border-radius: 50%; border: 2px solid var(--bs-border-color);
          display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
        .usr-search { background: var(--bs-body-bg); border: 1.5px solid var(--bs-border-color);
          border-radius: 8px; padding: 8px 14px; font-size: 14px; color: var(--bs-body-color);
          outline: none; width: 100%; transition: border .15s; }
        .usr-search:focus { border-color: #6366f1; }
        .usr-filter-btn { padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--bs-border-color);
          background: transparent; font-size: 12px; font-weight: 700; cursor: pointer;
          color: var(--bs-secondary-color); transition: all .12s; }
        .usr-filter-btn.on { background: #6366f1; color: white; border-color: #6366f1; }
        .usr-filter-btn:hover:not(.on) { background: var(--bs-tertiary-bg); }
        .usr-action { padding: 4px 10px; border-radius: 6px; border: 1.5px solid var(--bs-border-color);
          background: transparent; font-size: 12px; font-weight: 600; cursor: pointer;
          color: var(--bs-body-color); transition: all .12s; }
        .usr-action:hover { background: var(--bs-tertiary-bg); }
        .usr-action.danger { border-color: #f44336; color: #f44336; }
        .usr-action.danger:hover { background: rgba(244,67,54,.08); }
        .usr-action.success { border-color: #10b981; color: #10b981; }
        .usr-action.success:hover { background: rgba(16,185,129,.08); }
        .usr-action.warning { border-color: #f59e0b; color: #f59e0b; }
        .usr-action.warning:hover { background: rgba(245,158,11,.08); }
        .usr-page-btn { width: 34px; height: 34px; border-radius: 6px; border: 1.5px solid var(--bs-border-color);
          background: transparent; font-size: 13px; font-weight: 700; cursor: pointer; color: var(--bs-body-color); }
        .usr-page-btn.on { background: #6366f1; color: white; border-color: #6366f1; }
        .usr-page-btn:hover:not(.on) { background: var(--bs-tertiary-bg); }
      `}</style>

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-0">Quản lý người dùng</h4>
          <p className="text-muted small mb-0 mt-1">Danh sách tài khoản, phân quyền và trạng thái</p>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={load}>↻ Làm mới</button>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3"><StatCard icon="👥" label="Tổng người dùng" value={stats.total}  color="#6366f1"/></div>
        <div className="col-6 col-md-3"><StatCard icon="✅" label="Đang hoạt động"  value={stats.active} color="#10b981"/></div>
        <div className="col-6 col-md-3"><StatCard icon="🔒" label="Đã khóa"          value={stats.locked} color="#f59e0b"/></div>
        <div className="col-6 col-md-3"><StatCard icon="⚙️" label="Quản trị viên"   value={stats.admins} color="#ef4444"/></div>
      </div>

      {/* Toolbar */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
        <div className="card-body py-3 px-4">
          <div className="d-flex flex-wrap gap-3 align-items-center">
            {/* Search */}
            <div style={{ flex: '1 1 240px', minWidth: 200 }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: .4 }}>🔍</span>
                <input className="usr-search" style={{ paddingLeft: 36 }}
                  placeholder="Tìm tên, email, username..."
                  value={search} onChange={e => setSearch(e.target.value)}/>
              </div>
            </div>
            {/* Filters */}
            <div className="d-flex gap-2 flex-wrap">
              {[
                { key: 'all',    label: `Tất cả (${stats.total})` },
                { key: 'user',   label: 'User' },
                { key: 'admin',  label: 'Admin' },
                { key: 'locked', label: `Bị khóa (${stats.locked})` },
              ].map(f => (
                <button key={f.key} className={`usr-filter-btn ${filter===f.key?'on':''}`}
                  onClick={() => setFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm me-2"/>Đang tải...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div style={{ fontSize: 40 }}>👤</div>
            <div className="mt-2">Không tìm thấy người dùng nào</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table usr-table mb-0">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 20 }}>Người dùng</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Level / EXP</th>
                  <th>Ngày đăng ký</th>
                  <th style={{ paddingRight: 20, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isMe = u.id === me?.id;
                  const initial = (u.full_name || u.username || '?')[0].toUpperCase();
                  const avatarColor = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'][u.id % 6];
                  return (
                    <tr key={u.id} className="usr-row">
                      {/* Avatar + name */}
                      <td style={{ paddingLeft: 20 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="usr-avatar" style={{ background: `${avatarColor}20`, color: avatarColor }}>
                            {u.avatar
                              ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
                              : initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                              {u.full_name || u.username}
                              {isMe && <span className="badge bg-primary ms-1" style={{ fontSize: 10 }}>Bạn</span>}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--bs-secondary-color)' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--bs-secondary-color)', fontSize: 13 }}>{u.email}</td>
                      <td>
                        <span className={`badge ${ROLE_BADGE[u.role]?.cls || 'bg-secondary'}`} style={{ fontSize: 11, padding: '4px 8px' }}>
                          {ROLE_BADGE[u.role]?.label || u.role}
                        </span>
                      </td>
                      <td>
                        {u.is_active
                          ? <span style={{ color: '#10b981', fontWeight: 600, fontSize: 12 }}>● Hoạt động</span>
                          : <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 12 }}>🔒 Bị khóa</span>}
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>
                          <span className="badge bg-primary me-1">Lv.{u.level || 1}</span>
                          <span style={{ color: 'var(--bs-secondary-color)' }}>{(u.total_exp || 0).toLocaleString()} EXP</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--bs-secondary-color)', fontSize: 12 }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      {/* Actions */}
                      <td style={{ paddingRight: 20, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {!isMe && (
                          <div className="d-flex gap-2 justify-content-end">
                            {/* Lock/Unlock */}
                            <button
                              className={`usr-action ${u.is_active ? 'warning' : 'success'}`}
                              onClick={() => setConfirm({ type: 'lock', user: u })}>
                              {u.is_active ? '🔒 Khóa' : '🔓 Mở'}
                            </button>
                            {/* Change role */}
                            <button
                              className="usr-action"
                              onClick={() => setConfirm({ type: 'role', user: u, newRole: u.role === 'admin' ? 'user' : 'admin' })}>
                              {u.role === 'admin' ? '⬇ Hạ quyền' : '⬆ Cấp Admin'}
                            </button>
                            {/* Delete */}
                            {u.role !== 'admin' && (
                              <button className="usr-action danger"
                                onClick={() => setConfirm({ type: 'delete', user: u })}>
                                🗑 Xóa
                              </button>
                            )}
                          </div>
                        )}
                        {isMe && <span style={{ fontSize: 12, color: 'var(--bs-secondary-color)', fontStyle: 'italic' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 px-1">
          <span style={{ fontSize: 13, color: 'var(--bs-secondary-color)' }}>
            {(page-1)*LIMIT+1}–{Math.min(page*LIMIT, total)} / {total} người dùng
          </span>
          <div className="d-flex gap-1">
            <button className="usr-page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i+1 : page <= 4 ? i+1 : page >= totalPages-3 ? totalPages-6+i : page-3+i;
              return (
                <button key={p} className={`usr-page-btn ${page===p?'on':''}`} onClick={() => setPage(p)}>{p}</button>
              );
            })}
            <button className="usr-page-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>›</button>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.5)' }}
          onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-body p-4 text-center">
                <div style={{ fontSize: 44, marginBottom: 12 }}>
                  {confirm.type==='lock'   && (confirm.user.is_active ? '🔒' : '🔓')}
                  {confirm.type==='role'   && '⚙️'}
                  {confirm.type==='delete' && '🗑️'}
                </div>
                <h6 className="fw-bold mb-2">
                  {confirm.type==='lock'   && (confirm.user.is_active ? 'Khóa tài khoản?' : 'Mở khóa tài khoản?')}
                  {confirm.type==='role'   && `Đổi quyền → ${confirm.newRole}?`}
                  {confirm.type==='delete' && 'Xóa tài khoản?'}
                </h6>
                <p className="text-muted small mb-4">
                  {confirm.type==='delete'
                    ? <><strong>{confirm.user.username}</strong> và toàn bộ dữ liệu sẽ bị xóa vĩnh viễn.</>
                    : <>Tài khoản: <strong>{confirm.user.username}</strong> ({confirm.user.email})</>}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-outline-secondary px-4" onClick={() => setConfirm(null)}>Hủy</button>
                  <button
                    className={`btn px-4 ${confirm.type==='delete' ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => {
                      if (confirm.type === 'lock')   handleToggleLock(confirm.user);
                      if (confirm.type === 'role')   handleChangeRole(confirm.user, confirm.newRole);
                      if (confirm.type === 'delete') handleDelete(confirm.user);
                    }}>
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#1a1a2e', color: 'white', padding: '12px 20px', borderRadius: 10,
          fontSize: 14, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,.3)',
          animation: 'fadeInUp .2s ease' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
