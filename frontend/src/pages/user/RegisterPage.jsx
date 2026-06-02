import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import {
  PARTICLES, RUNES, TEYVAT_NATIONS, SPARKS,
  RINGS, CONSTELLATION_STARS, CONSTELLATION_LINES,
  LogoIcon, SHARED_CSS,
} from '../../styles/wordstride.jsx';

const SLOGAN = 'Your Journey Begins With Words';
const STREAK_POS = ['22%', '40%', '58%', '76%'];
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#f09090', '#ffd166', '#80deea', '#81c784'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]           = useState({ username:'', email:'', password:'', full_name:'' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [mounted, setMounted]     = useState(false);
  const [activeField, setActive]  = useState('');
  const [hoveredNation, setHover] = useState(null);
  const [strength, setStrength]   = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    CONSTELLATION_LINES.forEach(([a, b]) => {
      const sa = CONSTELLATION_STARS[a], sb = CONSTELLATION_STARS[b];
      if (!sa || !sb) return;
      ctx.beginPath();
      ctx.moveTo(sa.x/100*canvas.width, sa.y/100*canvas.height);
      ctx.lineTo(sb.x/100*canvas.width, sb.y/100*canvas.height);
      ctx.strokeStyle = 'rgba(200,169,110,0.06)';
      ctx.lineWidth = 0.6; ctx.stroke();
    });
  }, [mounted]);

  const checkStrength = (pw) => {
    let s = 0;
    if (pw.length >= 6)  s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9!@#$%^&*]/.test(pw)) s++;
    setStrength(s);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'password') checkStrength(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      const res = await register(form);
      // If OTP required, redirect to OTP page
      if (res?.data?.requiresVerification) {
        const params = new URLSearchParams({ email: res.data.email || form.email });
        if (res.data.devOtp) params.set('dev', res.data.devOtp);
        navigate(`/verify-email?${params}`);
      } else {
        navigate('/');
      }
    }
    catch (err) { setError(err.response?.data?.message || 'Đăng ký thất bại'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{SHARED_CSS(true)}</style>
      <div className="ws-root">
        <div className="ws-bg"/><div className="ws-grid"/>

        {/* Constellation */}
        <div className="ws-constellation">
          <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>
          {CONSTELLATION_STARS.map(s => (
            <div key={s.id} className="ws-cstar" style={{
              left:`${s.x}%`, top:`${s.y}%`,
              width:s.size, height:s.size,
              '--op-from': s.opacity * 0.4,
              '--op-to':   s.opacity,
              animationDuration:`${s.dur}s`,
              animationDelay:`${s.delay}s`,
            }}/>
          ))}
        </div>

        {/* Particles */}
        {PARTICLES.map(p => (
          <div key={p.id} className="ws-particle" style={{
            left:`${p.x}%`, bottom:`-${p.size*2}px`,
            width:p.size, height:p.size, opacity:0,
            '--drift':`${p.drift}px`, '--pop':p.opacity,
            animationDuration:`${p.dur}s`, animationDelay:`${p.delay}s`,
          }}/>
        ))}

        {/* LEFT */}
        <div className="ws-left">
          <div className="ws-map-silhouette">
            <svg width="90%" height="90%" viewBox="0 0 600 600" fill="none">
              <path d="M80 120 Q120 60 200 80 Q280 40 340 100 Q420 60 500 120 Q540 180 520 260 Q560 340 500 400 Q460 460 380 480 Q300 520 220 490 Q140 520 100 460 Q60 400 80 320 Q40 240 80 120Z"
                stroke="rgba(200,169,110,1)" strokeWidth="1.5" fill="rgba(200,169,110,.06)"/>
              <path d="M200 80 Q240 160 220 240 Q200 320 240 400" stroke="rgba(200,169,110,.5)" strokeWidth=".8" strokeDasharray="4 6"/>
              <path d="M340 100 Q360 180 340 260 Q320 340 360 420" stroke="rgba(200,169,110,.5)" strokeWidth=".8" strokeDasharray="4 6"/>
              <path d="M80 260 Q160 280 240 260 Q320 240 400 260 Q480 280 520 260" stroke="rgba(200,169,110,.4)" strokeWidth=".7" strokeDasharray="3 8"/>
              {[[180,140],[300,120],[420,150],[160,300],[300,280],[440,300],[220,440],[360,450]].map(([cx,cy],i)=>(
                <g key={i}>
                  <circle cx={cx} cy={cy} r="4" fill="rgba(200,169,110,.5)"/>
                  <circle cx={cx} cy={cy} r="8" fill="none" stroke="rgba(200,169,110,.2)" strokeWidth=".8"/>
                </g>
              ))}
              <g transform="translate(520 520)">
                <circle cx="0" cy="0" r="28" stroke="rgba(200,169,110,.4)" strokeWidth=".8" fill="none"/>
                <path d="M0 -22 L3 -8 L0 -12 L-3 -8Z" fill="rgba(200,169,110,.7)"/>
                <path d="M0 22 L3 8 L0 12 L-3 8Z" fill="rgba(200,169,110,.3)"/>
                <path d="M-22 0 L-8 3 L-12 0 L-8 -3Z" fill="rgba(200,169,110,.5)"/>
                <path d="M22 0 L8 3 L12 0 L8 -3Z" fill="rgba(200,169,110,.5)"/>
                <circle cx="0" cy="0" r="3" fill="rgba(200,169,110,.8)"/>
              </g>
            </svg>
          </div>

          {STREAK_POS.map((top,i)=><div key={i} className="ws-streak" style={{top,animationDelay:`${i*.6}s`}}/>)}
          {SPARKS.map((s,i)=>(
            <div key={i} className="ws-spark" style={{top:s.top,left:s.left,animationDuration:s.dur,animationDelay:s.delay}}>{s.sym}</div>
          ))}

          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',top:'-8%',pointerEvents:'none'}}>
            {RINGS.map((ring,ri)=>(
              <div key={ri} className="ws-orb-ring" style={{
                width:ring.r*2,height:ring.r*2,borderColor:ring.color,
                animationDuration:ring.dur,animationDirection:ring.rev?'reverse':'normal',
                position:'absolute',top:`calc(50% - ${ring.r}px)`,left:`calc(50% - ${ring.r}px)`,
              }}>
                {ring.dots>0 && Array.from({length:ring.dots},(_,di)=>(
                  <div key={di} className="ws-orb-dot" style={{
                    background:ring.dotColor,boxShadow:`0 0 8px ${ring.dotColor}`,
                    top:`calc(50% + ${Math.sin(di/ring.dots*Math.PI*2)*ring.r-3.5}px)`,
                    left:`calc(50% + ${Math.cos(di/ring.dots*Math.PI*2)*ring.r-3.5}px)`,
                  }}/>
                ))}
              </div>
            ))}
            {RUNES.map((r,i)=>(
              <div key={i} style={{
                position:'absolute',fontFamily:"'Cinzel',serif",fontSize:10,
                color:'rgba(200,169,110,.25)',pointerEvents:'none',
                top:`calc(50% + ${Math.sin(i/RUNES.length*Math.PI*2)*205-7}px)`,
                left:`calc(50% + ${Math.cos(i/RUNES.length*Math.PI*2)*205-7}px)`,
              }}>{r}</div>
            ))}
          </div>

          <div className="ws-title-glow"/>

          <div className="ws-hero">
            <div className="ws-orn">
              <div className="ws-orn-line"/>
              <div className="ws-orn-center">
                <span className="ws-orn-gem">◆</span>
                <span className="ws-orn-gem lg">✦</span>
                <span className="ws-orn-gem">◆</span>
              </div>
              <div className="ws-orn-line r"/>
            </div>
            <h1 className="ws-brand-name">WordStride</h1>
            <div className="ws-title-bar"/>
            <p className="ws-brand-slogan">{SLOGAN}</p>
            <div className="ws-nations">
              {TEYVAT_NATIONS.map((n,i)=>(
                <div key={i} className="ws-nation"
                  style={{'--ec':n.glow,animationDelay:`${i*.22}s`,animationDuration:`${2.5+i*.18}s`}}
                  onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)}
                  onMouseOver={e=>{e.currentTarget.style.borderColor=n.color+'88';e.currentTarget.style.color=n.color;e.currentTarget.style.boxShadow=`0 4px 18px ${n.glow}, 0 0 0 1px ${n.color}33`;e.currentTarget.style.background=n.color+'14';}}
                  onMouseOut={e=>{e.currentTarget.style.borderColor='';e.currentTarget.style.color='';e.currentTarget.style.boxShadow='';e.currentTarget.style.background='';}}>
                  <span>{n.icon}</span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:'.07em'}}>{n.name}</span>
                  {hoveredNation===i && <div className="ws-nation-tip" style={{borderColor:n.color+'88',color:n.color}}>{n.element} · {n.desc}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="ws-right">
          <div className="ws-right-bg"/><div className="ws-right-border"/><div className="ws-right-shimmer"/>
          {['tl','tr','bl','br'].map(pos=>(
            <svg key={pos} className={`ws-corner ${pos}`} viewBox="0 0 64 64" fill="none">
              <path d="M2 62 L2 10 Q2 2 10 2 L62 2" stroke="rgba(200,169,110,.4)" strokeWidth="1.5"/>
              <circle cx="2" cy="62" r="3" fill="rgba(200,169,110,.6)"/>
              <circle cx="62" cy="2" r="3" fill="rgba(200,169,110,.6)"/>
              <path d="M2 34 L10 26" stroke="rgba(200,169,110,.22)" strokeWidth="1"/>
              <path d="M34 2 L26 10" stroke="rgba(200,169,110,.22)" strokeWidth="1"/>
              <circle cx="10" cy="2" r="1.5" fill="rgba(200,169,110,.3)"/>
              <circle cx="2" cy="10" r="1.5" fill="rgba(200,169,110,.3)"/>
            </svg>
          ))}

          <div className={`ws-form ${mounted?'show':''}`}>
            <div className="ws-logo-row">
              <div className="ws-logo-icon"><LogoIcon/></div>
              <div className="ws-logo-text">
                <div className="ws-logo-name">WORDSTRIDE</div>
                <div className="ws-logo-sub">✦ Teyvat Language Academy ✦</div>
              </div>
            </div>

            <div className="ws-card">
              <div className="ws-card-sub">
                <div className="ws-card-title">Create Account</div>
                <div className="ws-card-desc">✦ Begin your journey ✦</div>
              </div>
              <div className="ws-div"><div className="ws-div-line"/><span className="ws-div-gem">◆</span><div className="ws-div-line"/></div>
              {error && <div className="ws-err"><span>✦</span>{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Full name */}
                <div className="ws-field">
                  <div className={`ws-label ${activeField==='full_name'?'active':''}`}>
                    <span className="ws-label-icon">🧭</span> Traveler Name
                    <span className="ws-opt">OPTIONAL</span>
                  </div>
                  <div className={`ws-field-wrap ${activeField==='full_name'?'focused':''}`}>
                    <span className="ws-field-left-icon">🧭</span>
                    <input type="text" name="full_name" className="ws-input"
                      placeholder="Aether / Lumine..." value={form.full_name} onChange={handleChange}
                      onFocus={()=>setActive('full_name')} onBlur={()=>setActive('')} autoComplete="name"/>
                  </div>
                </div>

                {/* Username */}
                <div className="ws-field">
                  <div className={`ws-label ${activeField==='username'?'active':''}`}>
                    <span className="ws-label-icon">⚔️</span> Username <span className="ws-req">✦</span>
                  </div>
                  <div className={`ws-field-wrap ${activeField==='username'?'focused':''}`}>
                    <span className="ws-field-left-icon">⚔️</span>
                    <input type="text" name="username" className="ws-input"
                      placeholder="traveler_teyvat" value={form.username} onChange={handleChange}
                      onFocus={()=>setActive('username')} onBlur={()=>setActive('')}
                      required autoComplete="username"/>
                  </div>
                </div>

                {/* Email */}
                <div className="ws-field">
                  <div className={`ws-label ${activeField==='email'?'active':''}`}>
                    <span className="ws-label-icon">✉️</span> Email Address <span className="ws-req">✦</span>
                  </div>
                  <div className={`ws-field-wrap ${activeField==='email'?'focused':''}`}>
                    <span className="ws-field-left-icon">✉️</span>
                    <input type="email" name="email" className="ws-input"
                      placeholder="traveler@teyvat.com" value={form.email} onChange={handleChange}
                      onFocus={()=>setActive('email')} onBlur={()=>setActive('')}
                      required autoComplete="email"/>
                  </div>
                </div>

                {/* Password */}
                <div className="ws-field">
                  <div className={`ws-label ${activeField==='password'?'active':''}`}>
                    <span className="ws-label-icon">🔐</span> Password <span className="ws-req">✦</span>
                  </div>
                  <div className={`ws-field-wrap ${activeField==='password'?'focused':''}`}>
                    <span className="ws-field-left-icon">🔐</span>
                    <input type={showPass?'text':'password'} name="password" className="ws-input"
                      placeholder="Min. 6 characters" value={form.password} onChange={handleChange}
                      onFocus={()=>setActive('password')} onBlur={()=>setActive('')}
                      required autoComplete="new-password" style={{paddingRight:44}}/>
                    <button type="button" className="ws-field-action"
                      onClick={()=>setShowPass(s=>!s)} tabIndex={-1}>{showPass?'🙈':'👁'}</button>
                  </div>
                  {form.password.length > 0 && (
                    <>
                      <div className="ws-strength-bar">
                        {[1,2,3,4].map(i=>(
                          <div key={i} className="ws-strength-seg"
                            style={{background:i<=strength?strengthColor[strength]:'rgba(255,255,255,.07)'}}/>
                        ))}
                      </div>
                      <div className="ws-strength-label" style={{color:strengthColor[strength]||'var(--text-sub)'}}>
                        {strengthLabel[strength]}
                      </div>
                    </>
                  )}
                </div>

                <div className="ws-div" style={{margin:'12px 0'}}>
                  <div className="ws-div-line"/><span className="ws-div-gem" style={{fontSize:8}}>✦</span><div className="ws-div-line"/>
                </div>

                <button type="submit" className="ws-btn" disabled={loading}>
                  {loading?<><span className="ws-spin"/>CREATING ACCOUNT...</>:'✦  BEGIN YOUR JOURNEY  ✦'}
                </button>
              </form>
            </div>

            <div className="ws-bot">Already a Traveler? <Link to="/login">SIGN IN</Link></div>
            <div className="ws-rune-row">
              {['✦','◆','❋','◈','✧'].map((r,i)=><span key={i} className="ws-rune-item">{r}</span>)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

