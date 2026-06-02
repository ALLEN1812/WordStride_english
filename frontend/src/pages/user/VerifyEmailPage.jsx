import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

export default function VerifyEmailPage() {
  const [sp]            = useSearchParams();
  const navigate        = useNavigate();
  const { loginWithToken } = useAuth();
  const email           = sp.get('email') || '';
  const devOtp          = sp.get('dev') || ''; // dev mode: prefill OTP

  const [digits,  setDigits]  = useState(() =>
    devOtp.length === 6 ? devOtp.split('') : ['','','','','','']
  );
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cd,      setCd]      = useState(0); // resend countdown
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState('');

  const inputs = useRef([]);

  // Start with resend cooldown so they don't spam immediately
  useEffect(() => { setCd(60); }, []);
  useEffect(() => {
    if (cd <= 0) return;
    const t = setTimeout(() => setCd(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cd]);

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (digits.every(d => d !== '')) handleVerify();
  }, [digits]);

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits]; next[i] = '';
        setDigits(next); setError('');
      } else if (i > 0) {
        const next = [...digits]; next[i-1] = '';
        setDigits(next);
        inputs.current[i-1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0)  { inputs.current[i-1]?.focus(); }
    else if (e.key === 'ArrowRight' && i < 5)   { inputs.current[i+1]?.focus(); }
  };

  const handleInput = (i, val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return;
    // Handle paste of 6 digits
    if (clean.length >= 6) {
      const next = clean.slice(0, 6).split('');
      setDigits(next); setError('');
      inputs.current[5]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean[clean.length - 1];
    setDigits(next); setError('');
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    const next = [...digits];
    text.split('').forEach((c, i) => { if (i < 6) next[i] = c; });
    setDigits(next); setError('');
    inputs.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < 6) return;
    setLoading(true); setError('');
    try {
      const r = await api.post('/auth/verify-otp', { email, otp });
      loginWithToken(r.data.token, r.data.data);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1800);
    } catch (e) {
      const msg = e.response?.data?.message || 'Mã OTP không đúng';
      setError(msg);
      setDigits(['','','','','','']);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setSending(true); setSentMsg(''); setError('');
    try {
      const r = await api.post('/auth/resend-otp', { email });
      const newDevOtp = r.data?.devOtp;
      if (newDevOtp) {
        setDigits(newDevOtp.split(''));
        setSentMsg(`(Dev) Mã OTP mới: ${newDevOtp}`);
      } else {
        setSentMsg('Mã OTP mới đã được gửi!');
        setDigits(['','','','','','']);
        inputs.current[0]?.focus();
      }
      setCd(60);
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi gửi OTP');
    } finally { setSending(false); }
  };

  if (!email) return (
    <div style={wrapStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize:52, marginBottom:12 }}>❌</div>
        <h5 style={{ color:'#e8dcc8', fontWeight:700 }}>Link không hợp lệ</h5>
        <Link to="/register" style={{ color:'#c8a96e', fontSize:13 }}>← Đăng ký lại</Link>
      </div>
    </div>
  );

  return (
    <div style={wrapStyle}>
      <div style={cardStyle}>

        {success ? (
          <>
            <div style={{ fontSize:64, marginBottom:12 }}>🎉</div>
            <h4 style={{ color:'#81c784', fontWeight:800, margin:'0 0 8px' }}>Xác thực thành công!</h4>
            <p style={{ color:'#8a7f6a', fontSize:14 }}>Chào mừng bạn đến với WordStride...</p>
            <div style={{ height:3, background:'rgba(129,199,132,.2)', borderRadius:2, overflow:'hidden', marginTop:16 }}>
              <div style={{ height:'100%', background:'#81c784', borderRadius:2, animation:'grow 1.8s linear forwards' }}/>
            </div>
          </>
        ) : (
          <>
            {/* Dev mode banner */}
            {devOtp && (
              <div style={{ background:'rgba(99,102,241,.15)', border:'1px solid rgba(99,102,241,.4)',
                borderRadius:8, padding:'8px 14px', marginBottom:16, fontSize:12, color:'#a5b4fc', textAlign:'center' }}>
                🛠️ <strong>Dev mode</strong> — mã OTP đã được điền sẵn
              </div>
            )}

            {/* Header */}
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ fontSize:48, marginBottom:10 }}>✉️</div>
              <h4 style={{ color:'#e8dcc8', fontWeight:800, margin:'0 0 8px' }}>Nhập mã OTP</h4>
              <p style={{ color:'#8a7f6a', fontSize:13, margin:0, lineHeight:1.7 }}>
                {devOtp
                  ? <><span style={{ color:'#ffd54f' }}>⚠️ Mail chưa cấu hình</span><br/>OTP được in trong console backend</>
                  : <>Chúng tôi đã gửi mã 6 số đến<br/><strong style={{ color:'#c8a96e' }}>{email}</strong></>
                }
              </p>
            </div>

            {/* OTP inputs */}
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:20 }}>
              {digits.map((d, i) => (
                <input key={i}
                  ref={el => inputs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={6}
                  value={d}
                  onChange={e => handleInput(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={e => e.target.select()}
                  style={{
                    width:50, height:60, textAlign:'center',
                    fontSize:24, fontWeight:900,
                    background: d ? 'rgba(99,102,241,.15)' : 'rgba(255,255,255,.05)',
                    border: `2px solid ${error ? '#f44336' : d ? '#6366f1' : 'rgba(200,169,110,.25)'}`,
                    borderRadius:10, color:'#e8dcc8', outline:'none',
                    transition:'all .15s', caretColor:'transparent',
                    fontFamily: 'monospace',
                  }}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{ color:'#f08888', fontSize:13, textAlign:'center', marginBottom:16,
                background:'rgba(244,67,54,.1)', border:'1px solid rgba(244,67,54,.25)',
                borderRadius:8, padding:'8px 14px' }}>
                {error}
              </div>
            )}

            {/* Sent success */}
            {sentMsg && (
              <div style={{ color:'#81c784', fontSize:13, textAlign:'center', marginBottom:16,
                background:'rgba(76,175,80,.1)', border:'1px solid rgba(76,175,80,.25)',
                borderRadius:8, padding:'8px 14px' }}>
                ✅ {sentMsg}
              </div>
            )}

            {/* Verify button */}
            <button onClick={handleVerify}
              disabled={loading || digits.some(d => d === '')}
              style={{ width:'100%', padding:'14px', borderRadius:12, border:'none',
                background: digits.every(d=>d) ? 'linear-gradient(135deg,#4338ca,#6366f1)' : 'rgba(99,102,241,.3)',
                color:'white', fontWeight:800, fontSize:15, cursor: digits.every(d=>d) ? 'pointer':'default',
                transition:'all .15s', marginBottom:16,
                boxShadow: digits.every(d=>d) ? '0 4px 16px rgba(99,102,241,.4)' : 'none' }}>
              {loading ? (
                <span><span style={{ display:'inline-block', animation:'spin 1s linear infinite', marginRight:8 }}>⏳</span>Đang xác thực...</span>
              ) : '✓  Xác thực'}
            </button>

            {/* Timer */}
            <div style={{ textAlign:'center', fontSize:13, color:'#8a7f6a' }}>
              {cd > 0 ? (
                <span>Gửi lại mã sau <strong style={{ color:'#c8a96e' }}>{cd}s</strong></span>
              ) : (
                <button onClick={handleResend} disabled={sending}
                  style={{ border:'none', background:'none', color:'#c8a96e', fontWeight:700,
                    cursor:'pointer', fontSize:13, padding:0 }}>
                  {sending ? '⏳ Đang gửi...' : '📨 Gửi lại mã OTP'}
                </button>
              )}
            </div>

            <div style={{ textAlign:'center', marginTop:20 }}>
              <Link to="/register" style={{ color:'#6a5030', fontSize:12, textDecoration:'none' }}>
                ← Dùng email khác
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes grow { from{width:0} to{width:100%} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const wrapStyle = {
  minHeight: '100vh',
  background: '#060e1f',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const cardStyle = {
  background: 'rgba(10,20,34,.95)',
  border: '1px solid rgba(200,169,110,.2)',
  borderRadius: 20,
  padding: '40px 36px',
  maxWidth: 400,
  width: '100%',
  boxShadow: '0 12px 48px rgba(0,0,0,.6)',
};
