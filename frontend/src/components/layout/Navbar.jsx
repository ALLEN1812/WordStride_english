import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { to: '/vocab',   label: 'Từ Vựng',  desc: 'Học flashcard'     },
  { to: '/grammar', label: 'Ngữ Pháp', desc: 'Bài học lý thuyết' },
  { to: '/toeic',   label: 'Luyện Thi',desc: 'Thi thử TOEIC'     },
  { to: '/history', label: 'Kết Quả',  desc: 'Lịch sử làm bài'  },
];

export default function Navbar() {
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();
  const location            = useLocation();
  const [dark, setDark]         = useState(() => localStorage.getItem('gi-theme') !== 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const dropRef      = useRef(null);
  const settingsRef  = useRef(null);

  // Apply theme to entire page
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Sync theme from other tabs
  useEffect(() => {
    const onStorage = () => {
      const d = localStorage.getItem('gi-theme') !== 'light';
      setDark(d);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current     && !dropRef.current.contains(e.target))     setDropOpen(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close menus on route change
  useEffect(() => { setMenuOpen(false); setDropOpen(false); setSettingsOpen(false); }, [location]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('gi-theme', next ? 'dark' : 'light');
  };

  // Ẩn navbar trên trang thi TOEIC (fullscreen) — /toeic/123 nhưng không ẩn /toeic/result/123
  const isTestPage = /^\/toeic\/(?!result\/)\d+/.test(location.pathname);
  if (location.pathname === '/register' || location.pathname === '/login' || isTestPage) return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  const avatarLetter = (user?.full_name || user?.username || 'U')[0].toUpperCase();

  const d = dark;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');

        :root {
          --nb-bg:        ${d ? 'rgba(6,14,31,.92)'    : 'rgba(255,255,255,.92)'};
          --nb-bg-solid:  ${d ? '#060e1f'              : '#ffffff'};
          --nb-border:    ${d ? 'rgba(200,169,110,.2)' : 'rgba(0,0,0,.1)'};
          --nb-gold:      ${d ? '#c8a96e'              : '#8a6030'};
          --nb-gold-lt:   ${d ? '#e8d5a3'              : '#b08040'};
          --nb-gold-dim:  ${d ? '#6a5030'              : '#b0a080'};
          --nb-cyan:      ${d ? '#7dd3e8'              : '#2a90b8'};
          --nb-text:      ${d ? '#e8dcc8'              : '#1a1a2e'};
          --nb-text-sub:  ${d ? '#8a7f6a'              : '#6b7280'};
          --nb-glow:      ${d ? 'rgba(200,169,110,.3)' : 'rgba(0,0,0,.06)'};
          --nb-drop-bg:   ${d ? 'rgba(8,18,38,.97)'   : 'rgba(255,255,255,.97)'};
          --nb-hover:     ${d ? 'rgba(200,169,110,.08)': 'rgba(0,0,0,.04)'};
          --nb-active:    ${d ? 'rgba(200,169,110,.15)': 'rgba(0,0,0,.07)'};
          --nb-shadow:    ${d ? 'rgba(0,0,0,.5)'       : 'rgba(0,0,0,.1)'};
          --nb-mobile-bg: ${d ? '#080f22'              : '#f8f8f8'};
        }

        .gi-nav {
          position:sticky; top:0; z-index:1000;
          width:100%;
          font-family:'Be Vietnam Pro',sans-serif;
          transition:all .4s ease;
        }

        /* Glass bar */
        .gi-nav-bar {
          background:var(--nb-bg);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border-bottom:1px solid var(--nb-border);
          transition:all .4s ease;
          position:relative;
        }
        .gi-nav-bar.scrolled {
          box-shadow:0 4px 32px var(--nb-shadow);
        }

        /* Animated shimmer line on top */
        .gi-nav-bar::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:1.5px;
          background:linear-gradient(90deg,
            transparent 0%,
            var(--nb-gold) 30%,
            var(--nb-cyan) 50%,
            var(--nb-gold) 70%,
            transparent 100%);
          background-size:200% 100%;
          animation:nbshine 4s linear infinite;
          opacity:.6;
        }
        @keyframes nbshine {
          from{background-position:200% 0}
          to  {background-position:-200% 0}
        }

        /* Grid pattern overlay */
        .gi-nav-bar::after {
          content:'';
          position:absolute; inset:0; pointer-events:none;
          background-image:
            linear-gradient(${d?'rgba(200,169,110,.03)':'rgba(0,0,0,.025)'} 1px,transparent 1px),
            linear-gradient(90deg,${d?'rgba(200,169,110,.03)':'rgba(0,0,0,.025)'} 1px,transparent 1px);
          background-size:40px 40px;
        }

        .gi-nav-inner {
          max-width:1280px; margin:0 auto;
          padding:0 24px;
          height:64px;
          display:flex; align-items:center; gap:0;
          position:relative; z-index:1;
        }

        /* Logo */
        .gi-logo {
          display:flex; align-items:center; gap:10px;
          text-decoration:none; flex-shrink:0; margin-right:32px;
          transition:opacity .2s;
        }
        .gi-logo:hover { opacity:.85; }

        .gi-logo-icon {
          width:36px; height:36px; border-radius:50%;
          background:radial-gradient(circle at 35% 35%, ${d?'rgba(200,169,110,.4)':'rgba(200,169,110,.25)'}, ${d?'rgba(6,14,31,.8)':'rgba(255,255,255,.8)'});
          border:1.5px solid var(--nb-border);
          display:flex; align-items:center; justify-content:center;
          font-size:18px;
          box-shadow:0 0 14px var(--nb-glow);
          animation:logopulse 3.5s ease-in-out infinite;
          flex-shrink:0;
        }
        @keyframes logopulse {
          0%,100%{box-shadow:0 0 14px var(--nb-glow)}
          50%    {box-shadow:0 0 24px var(--nb-glow)}
        }

        .gi-logo-text {
          font-family:'Cinzel',serif; font-size:1.05rem; font-weight:700;
          color:var(--nb-gold-lt); letter-spacing:.1em;
          text-shadow:0 0 16px var(--nb-glow);
          transition:color .4s;
          line-height:1;
        }
        .gi-logo-sub {
          font-size:8px; color:var(--nb-text-sub);
          letter-spacing:.18em; text-transform:uppercase;
          transition:color .4s;
        }

        /* Divider gem */
        .gi-nav-gem {
          width:1px; height:28px;
          background:linear-gradient(to bottom, transparent, var(--nb-border), transparent);
          margin:0 20px; flex-shrink:0;
        }

        /* Nav links */
        .gi-nav-links {
          display:flex; align-items:center; gap:2px; flex:1;
          list-style:none; margin:0; padding:0;
        }

        .gi-nav-link-item { position:relative; }

        .gi-nav-link {
          display:flex; align-items:center; gap:6px;
          padding:8px 14px; border-radius:6px;
          text-decoration:none;
          font-size:13.5px; font-weight:700;
          color:var(--nb-text-sub);
          letter-spacing:.04em;
          transition:all .25s;
          position:relative; white-space:nowrap;
        }
        .gi-nav-link:hover {
          color:var(--nb-gold-lt);
          background:var(--nb-hover);
        }
        .gi-nav-link.active {
          color:var(--nb-gold);
          background:var(--nb-active);
        }

        /* Active underline */
        .gi-nav-link.active::after {
          content:'';
          position:absolute; bottom:0; left:50%; right:50%;
          height:1.5px;
          background:linear-gradient(90deg, transparent, var(--nb-gold), transparent);
          transition:left .3s, right .3s;
          border-radius:2px;
        }
        .gi-nav-link.active::after { left:12%; right:12%; }

        /* Hover tooltip */
        .gi-link-tip {
          position:absolute; top:calc(100% + 8px); left:50%;
          transform:translateX(-50%);
          background:var(--nb-drop-bg);
          border:1px solid var(--nb-border);
          border-radius:6px; padding:5px 12px;
          font-size:10.5px; color:var(--nb-text-sub);
          white-space:nowrap; pointer-events:none;
          letter-spacing:.04em;
          box-shadow:0 4px 16px var(--nb-shadow);
          animation:tipfade .18s ease;
          z-index:100;
        }
        @keyframes tipfade {
          from{opacity:0;transform:translateX(-50%) translateY(4px)}
          to  {opacity:1;transform:translateX(-50%) translateY(0)}
        }
        .gi-link-tip::before {
          content:''; position:absolute; top:-6px; left:50%; transform:translateX(-50%);
          border:6px solid transparent;
          border-bottom-color:var(--nb-border); border-top:0;
        }

        /* Admin badge */
        .gi-admin-badge {
          display:flex; align-items:center; gap:6px;
          padding:6px 12px; border-radius:6px;
          text-decoration:none;
          font-size:12px; font-weight:800;
          color:${d?'#ffd166':'#8a6000'};
          background:${d?'rgba(255,209,102,.1)':'rgba(200,150,0,.08)'};
          border:1px solid ${d?'rgba(255,209,102,.25)':'rgba(200,150,0,.2)'};
          letter-spacing:.06em; white-space:nowrap;
          transition:all .2s;
        }
        .gi-admin-badge:hover {
          background:${d?'rgba(255,209,102,.18)':'rgba(200,150,0,.15)'};
          box-shadow:0 0 12px ${d?'rgba(255,209,102,.2)':'rgba(200,150,0,.15)'};
          color:${d?'#ffe08a':'#6a4800'};
        }

        /* Right side actions */
        .gi-nav-actions {
          display:flex; align-items:center; gap:10px; margin-left:auto; flex-shrink:0;
        }

        /* Logout button */
        .gi-logout-btn {
          width:34px; height:34px; border-radius:50%;
          background:${d?'rgba(200,60,60,.12)':'rgba(200,60,60,.08)'};
          border:1px solid ${d?'rgba(200,80,80,.3)':'rgba(200,80,80,.25)'};
          display:flex; align-items:center; justify-content:center;
          font-size:15px; cursor:pointer;
          transition:all .25s; flex-shrink:0;
          color:${d?'#f08888':'#c03030'};
        }
        .gi-logout-btn:hover {
          background:${d?'rgba(200,60,60,.25)':'rgba(200,60,60,.15)'};
          border-color:${d?'rgba(220,80,80,.6)':'rgba(200,60,60,.5)'};
          box-shadow:0 0 14px ${d?'rgba(200,60,60,.35)':'rgba(200,60,60,.2)'};
          transform:scale(1.1);
        }

        /* Three-dot settings button */
        .gi-settings-wrap { position:relative; }
        .gi-settings-btn {
          width:34px; height:34px; border-radius:50%;
          background:var(--nb-hover);
          border:1px solid var(--nb-border);
          display:flex; align-items:center; justify-content:center;
          font-size:20px; font-weight:700; cursor:pointer;
          color:var(--nb-text-sub); transition:all .25s; flex-shrink:0;
          letter-spacing:0; line-height:0.5;
        }
        .gi-settings-btn:hover {
          border-color:var(--nb-gold);
          color:var(--nb-gold);
          box-shadow:0 0 12px var(--nb-glow);
        }
        .gi-settings-dropdown {
          position:absolute; top:calc(100% + 10px); right:0;
          min-width:210px;
          background:var(--nb-drop-bg);
          border:1px solid var(--nb-border);
          border-radius:10px;
          box-shadow:0 12px 40px var(--nb-shadow);
          overflow:hidden;
          animation:ddopen .2s cubic-bezier(.16,1,.3,1);
          z-index:1100;
          backdrop-filter:blur(20px);
          padding:6px 0;
        }
        .gi-theme-row {
          display:flex; align-items:center; gap:10px; cursor:pointer;
        }
        .gi-toggle-switch {
          margin-left:auto; width:34px; height:19px; border-radius:10px;
          background:var(--nb-gold-dim); position:relative; transition:background .3s; flex-shrink:0;
        }
        .gi-toggle-switch.on { background:var(--nb-gold); }
        .gi-toggle-thumb {
          position:absolute; top:2.5px; left:2.5px;
          width:14px; height:14px; border-radius:50%;
          background:#fff; transition:transform .3s;
          box-shadow:0 1px 3px rgba(0,0,0,.3);
        }
        .gi-toggle-thumb.on { transform:translateX(15px); }

        /* User dropdown */
        .gi-user-wrap { position:relative; }

        .gi-user-btn {
          display:flex; align-items:center; gap:8px;
          padding:6px 12px 6px 6px; border-radius:8px;
          background:var(--nb-hover); border:1px solid var(--nb-border);
          cursor:pointer; transition:all .25s;
          color:var(--nb-text);
        }
        .gi-user-btn:hover {
          border-color:var(--nb-gold);
          background:var(--nb-active);
          box-shadow:0 0 10px var(--nb-glow);
        }

        .gi-avatar {
          width:28px; height:28px; border-radius:50%;
          overflow:hidden; flex-shrink:0;
          border:1.5px solid var(--nb-border);
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:800;
          background:radial-gradient(circle at 35% 35%, var(--nb-glow), ${d?'rgba(6,14,31,.9)':'rgba(255,255,255,.9)'});
          color:var(--nb-gold);
        }
        .gi-avatar img { width:100%; height:100%; object-fit:cover; }

        .gi-user-name {
          font-size:13px; font-weight:700; color:var(--nb-text);
          max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
          transition:color .4s;
        }

        .gi-chevron {
          font-size:9px; color:var(--nb-gold-dim);
          transition:transform .25s, color .4s;
        }
        .gi-chevron.open { transform:rotate(180deg); }

        /* Dropdown */
        .gi-dropdown {
          position:absolute; top:calc(100% + 10px); right:0;
          min-width:200px;
          background:var(--nb-drop-bg);
          border:1px solid var(--nb-border);
          border-radius:10px;
          box-shadow:0 12px 40px var(--nb-shadow);
          overflow:hidden;
          animation:ddopen .2s cubic-bezier(.16,1,.3,1);
          z-index:1100;
          backdrop-filter:blur(20px);
        }
        @keyframes ddopen {
          from{opacity:0;transform:translateY(-8px) scale(.97)}
          to  {opacity:1;transform:translateY(0) scale(1)}
        }

        /* Dropdown header */
        .gi-dd-header {
          padding:14px 16px 12px;
          border-bottom:1px solid var(--nb-border);
          display:flex; align-items:center; gap:10px;
        }
        .gi-dd-avatar {
          width:36px; height:36px; border-radius:50%;
          border:1.5px solid var(--nb-gold);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; font-weight:800;
          background:radial-gradient(circle at 35% 35%, var(--nb-glow), transparent);
          color:var(--nb-gold); flex-shrink:0;
          overflow:hidden;
        }
        .gi-dd-avatar img { width:100%; height:100%; object-fit:cover; }
        .gi-dd-info { flex:1; min-width:0; }
        .gi-dd-name { font-size:13px; font-weight:800; color:var(--nb-text);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:color .4s; }
        .gi-dd-email { font-size:10.5px; color:var(--nb-text-sub); transition:color .4s;
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .gi-dd-role {
          font-size:9px; font-family:'Be Vietnam Pro',sans-serif; font-weight:700; letter-spacing:.08em;
          padding:2px 8px; border-radius:20px; margin-top:3px; display:inline-block;
          background:${d?'rgba(200,169,110,.12)':'rgba(200,169,110,.1)'};
          color:var(--nb-gold); border:1px solid var(--nb-border);
        }

        /* Dropdown items */
        .gi-dd-item {
          display:flex; align-items:center; gap:10px;
          padding:11px 16px; width:100%; border:none; background:none;
          text-decoration:none; cursor:pointer;
          font-family:'Be Vietnam Pro',sans-serif; font-size:13.5px; font-weight:600;
          color:var(--nb-text); letter-spacing:.02em;
          transition:all .2s; text-align:left;
        }
        .gi-dd-item:hover {
          background:var(--nb-hover); color:var(--nb-gold-lt);
          padding-left:20px;
        }
        .gi-dd-item.danger { color:${d?'#f08888':'#c03030'}; }
        .gi-dd-item.danger:hover { background:${d?'rgba(200,60,60,.1)':'rgba(200,60,60,.07)'}; color:${d?'#f0a0a0':'#a02020'}; }

        .gi-dd-divider { height:1px; background:var(--nb-border); margin:4px 0; }

        /* Auth buttons */
        .gi-auth-login {
          padding:7px 16px; border-radius:6px;
          text-decoration:none; font-size:13px; font-weight:700;
          color:var(--nb-text); letter-spacing:.04em;
          transition:all .2s;
        }
        .gi-auth-login:hover { color:var(--nb-gold-lt); background:var(--nb-hover); }

        .gi-auth-register {
          padding:7px 18px; border-radius:6px;
          text-decoration:none; font-size:13px; font-weight:700;
          font-family:'Be Vietnam Pro',sans-serif; letter-spacing:.04em;
          color:var(--nb-gold-lt);
          background:linear-gradient(135deg,
            ${d?'rgba(200,169,110,.16)':'rgba(42,100,160,.14)'} 0%,
            ${d?'rgba(200,169,110,.26)':'rgba(42,100,160,.22)'} 100%);
          border:1px solid ${d?'rgba(200,169,110,.4)':'rgba(42,100,160,.4)'};
          transition:all .25s; position:relative; overflow:hidden;
        }
        .gi-auth-register:hover {
          border-color:${d?'rgba(200,169,110,.8)':'rgba(42,100,160,.75)'};
          box-shadow:0 0 16px var(--nb-glow);
          color:var(--nb-gold-bright, var(--nb-gold-lt));
          transform:translateY(-1px);
        }
        .gi-auth-register::after {
          content:''; position:absolute; top:0; left:-100%; width:50%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);
          animation:nbregshimmer 3s ease infinite;
        }
        @keyframes nbregshimmer { from{left:-100%} to{left:200%} }

        /* Mobile toggle */
        .gi-mobile-toggle {
          display:none; flex-direction:column; justify-content:center; gap:5px;
          width:36px; height:36px; border-radius:6px; cursor:pointer;
          background:var(--nb-hover); border:1px solid var(--nb-border);
          padding:8px; transition:all .25s; flex-shrink:0;
        }
        .gi-mobile-toggle:hover { border-color:var(--nb-gold); box-shadow:0 0 10px var(--nb-glow); }
        .gi-mobile-toggle span {
          display:block; height:1.5px; border-radius:2px;
          background:var(--nb-gold); transition:all .3s;
        }
        .gi-mobile-toggle.open span:nth-child(1){ transform:rotate(45deg) translate(5px,5px); }
        .gi-mobile-toggle.open span:nth-child(2){ opacity:0; transform:scaleX(0); }
        .gi-mobile-toggle.open span:nth-child(3){ transform:rotate(-45deg) translate(5px,-5px); }

        /* Mobile menu */
        .gi-mobile-menu {
          display:none;
          background:var(--nb-mobile-bg);
          border-top:1px solid var(--nb-border);
          padding:12px 16px 20px;
          animation:mmopen .25s ease;
        }
        @keyframes mmopen {
          from{opacity:0;transform:translateY(-8px)}
          to  {opacity:1;transform:translateY(0)}
        }
        .gi-mobile-menu.open { display:block; }

        .gi-mobile-link {
          display:flex; align-items:center; gap:10px;
          padding:12px 14px; border-radius:8px; margin-bottom:4px;
          text-decoration:none; font-size:14px; font-weight:700;
          color:var(--nb-text); transition:all .2s;
        }
        .gi-mobile-link:hover, .gi-mobile-link.active {
          background:var(--nb-active); color:var(--nb-gold-lt);
        }

        .gi-mobile-divider { height:1px; background:var(--nb-border); margin:10px 0; }

        .gi-mobile-user {
          display:flex; align-items:center; gap:10px;
          padding:12px 14px; margin-bottom:8px;
        }
        .gi-mobile-avatar {
          width:38px; height:38px; border-radius:50%;
          border:1.5px solid var(--nb-gold);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; font-weight:800; color:var(--nb-gold);
          background:radial-gradient(circle at 35% 35%, var(--nb-glow), transparent);
          overflow:hidden; flex-shrink:0;
        }
        .gi-mobile-avatar img { width:100%; height:100%; object-fit:cover; }
        .gi-mobile-uname { font-size:14px; font-weight:800; color:var(--nb-text); }
        .gi-mobile-uemail { font-size:11px; color:var(--nb-text-sub); }

        .gi-mobile-action {
          display:flex; align-items:center; gap:10px;
          padding:11px 14px; border-radius:8px; margin-bottom:4px;
          text-decoration:none; font-size:13.5px; font-weight:600;
          color:var(--nb-text); background:none; border:none; width:100%;
          cursor:pointer; font-family:'Be Vietnam Pro',sans-serif;
          transition:all .2s; text-align:left;
        }
        .gi-mobile-action:hover { background:var(--nb-hover); color:var(--nb-gold-lt); }
        .gi-mobile-action.danger { color:${d?'#f08888':'#c03030'}; }
        .gi-mobile-action.danger:hover { background:${d?'rgba(200,60,60,.1)':'rgba(200,60,60,.07)'}; }

        @media(max-width:900px){
          .gi-nav-links, .gi-nav-gem, .gi-user-wrap, .gi-auth-login, .gi-auth-register { display:none!important; }
          .gi-mobile-toggle { display:flex; }
          .gi-logo { margin-right:auto; }
        }
        @media(min-width:901px){
          .gi-mobile-menu { display:none!important; }
        }
      `}</style>

      <nav className="gi-nav">
        <div className={`gi-nav-bar ${scrolled ? 'scrolled' : ''}`}>
          <div className="gi-nav-inner">

            {/* Logo */}
            <Link className="gi-logo" to="/">
              <div className="gi-logo-icon"></div>
              <div>
                <div className="gi-logo-text">WORDSTRIDE</div>
                <div className="gi-logo-sub">✦ Journey of Words ✦</div>
              </div>
            </Link>

            {/* Gem divider */}
            {user && <div className="gi-nav-gem"/>}

            {/* Nav links */}
            {user && (
              <ul className="gi-nav-links">
                {NAV_LINKS.map(link => (
                  <li key={link.to} className="gi-nav-link-item"
                    onMouseEnter={() => setHoveredLink(link.to)}
                    onMouseLeave={() => setHoveredLink(null)}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) => `gi-nav-link ${isActive ? 'active' : ''}`}
                    >
                      <span>{link.icon}</span>
                      {link.label}
                    </NavLink>
                    {hoveredLink === link.to && (
                      <div className="gi-link-tip">{link.desc}</div>
                    )}
                  </li>
                ))}

                {user.role === 'admin' && (
                  <li style={{ marginLeft: 8 }}>
                    <NavLink to="/admin" className="gi-admin-badge">
                      ⚙️ Admin
                    </NavLink>
                  </li>
                )}
              </ul>
            )}

            {/* Right actions */}
            <div className="gi-nav-actions">

              {user ? (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {/* User info button */}
                  <div className="gi-user-wrap" ref={dropRef}>
                    <button className="gi-user-btn" onClick={() => setDropOpen(o => !o)}>
                      <div className="gi-avatar">
                        {user.avatar
                          ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar"/>
                          : avatarLetter}
                      </div>
                      <span className="gi-user-name">{user.full_name || user.username}</span>
                      <span className={`gi-chevron ${dropOpen ? 'open' : ''}`}>▼</span>
                    </button>

                    {dropOpen && (
                      <div className="gi-dropdown">
                        <div className="gi-dd-header">
                          <div className="gi-dd-avatar">
                            {user.avatar
                              ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar"/>
                              : avatarLetter}
                          </div>
                          <div className="gi-dd-info">
                            <div className="gi-dd-name">{user.full_name || user.username}</div>
                            <div className="gi-dd-email">{user.email}</div>
                            <div className="gi-dd-role">{user.role === 'admin' ? 'ADMIN' : '✦ TRAVELER'}</div>
                          </div>
                        </div>
                        <div style={{ padding:'6px 0' }}>
                          <Link className="gi-dd-item" to="/profile" onClick={() => setDropOpen(false)}>
                            Hồ sơ cá nhân
                          </Link>
                          <Link className="gi-dd-item" to="/history" onClick={() => setDropOpen(false)}>
                            Lịch sử làm bài
                          </Link>
                          {user.role === 'admin' && (
                            <Link className="gi-dd-item" to="/admin" onClick={() => setDropOpen(false)}>
                              Quản trị viên
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Three-dot settings */}
                  <div className="gi-settings-wrap" ref={settingsRef}>
                    <button className="gi-settings-btn" onClick={() => setSettingsOpen(o => !o)} title="Cài đặt">
                      ⋮
                    </button>
                    {settingsOpen && (
                      <div className="gi-settings-dropdown">
                        <div className="gi-dd-item gi-theme-row" onClick={toggleTheme}>
                          <span>{dark ? '🌙' : '☀️'}</span>
                          <span>{dark ? 'Dark Mode' : 'Light Mode'}</span>
                          <div className={`gi-toggle-switch ${dark ? 'on' : ''}`}>
                            <div className={`gi-toggle-thumb ${dark ? 'on' : ''}`}/>
                          </div>
                        </div>
                        <div className="gi-dd-divider"/>
                        <button className="gi-dd-item danger" onClick={handleLogout}>
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <NavLink className="gi-auth-login" to="/login">Đăng nhập</NavLink>
                  <NavLink className="gi-auth-register" to="/register">✦ Đăng ký</NavLink>
                  {/* Three-dot for guests — theme only */}
                  <div className="gi-settings-wrap" ref={settingsRef}>
                    <button className="gi-settings-btn" onClick={() => setSettingsOpen(o => !o)} title="Giao diện">
                      ⋮
                    </button>
                    {settingsOpen && (
                      <div className="gi-settings-dropdown">
                        <div className="gi-dd-item gi-theme-row" onClick={toggleTheme}>
                          <span>{dark ? '☀️' : '🌙'}</span>
                          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
                          <div className={`gi-toggle-switch ${dark ? 'on' : ''}`}>
                            <div className={`gi-toggle-thumb ${dark ? 'on' : ''}`}/>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Mobile toggle */}
              <button className={`gi-mobile-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(o => !o)}>
                <span/><span/><span/>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`gi-mobile-menu ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              {/* User info */}
              <div className="gi-mobile-user">
                <div className="gi-mobile-avatar">
                  {user.avatar
                    ? <img src={`http://localhost:5000${user.avatar}`} alt="avatar"/>
                    : avatarLetter}
                </div>
                <div>
                  <div className="gi-mobile-uname">{user.full_name || user.username}</div>
                  <div className="gi-mobile-uemail">{user.email}</div>
                </div>
              </div>

              <div className="gi-mobile-divider"/>

              {NAV_LINKS.map(link => (
                <NavLink key={link.to} to={link.to}
                  className={({ isActive }) => `gi-mobile-link ${isActive ? 'active' : ''}`}>
                  <span>{link.icon}</span> {link.label}
                  <span style={{ marginLeft: 'auto', fontSize: 11, opacity: .5 }}>{link.desc}</span>
                </NavLink>
              ))}

              {user.role === 'admin' && (
                <NavLink to="/admin" className="gi-mobile-link">
                  Admin Panel
                </NavLink>
              )}

              <div className="gi-mobile-divider"/>

              <Link to="/profile" className="gi-mobile-action">Hồ sơ cá nhân</Link>
              <button className="gi-mobile-action danger" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <NavLink to="/login"    className="gi-mobile-link">Đăng nhập</NavLink>
              <NavLink to="/register" className="gi-mobile-link">✦ Đăng ký</NavLink>
            </>
          )}
        </div>
      </nav>
    </>
  );
}