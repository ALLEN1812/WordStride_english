// WordStride · Premium Fantasy English Learning
// Shared theme — import in LoginPage & RegisterPage

// ── NATIONS with element colors ──────────────────────────
export const TEYVAT_NATIONS = [
  { name:'Mondstadt', element:'Anemo',   icon:'🌬️', desc:'City of Freedom',      color:'#80cbc4', glow:'rgba(128,203,196,.35)' },
  { name:'Liyue',     element:'Geo',     icon:'🪨',  desc:'Harbor of Contracts',  color:'#ffcc02', glow:'rgba(255,204,2,.35)'   },
  { name:'Inazuma',   element:'Electro', icon:'⚡',  desc:'Eternal Isolation',    color:'#ce93d8', glow:'rgba(206,147,216,.35)' },
  { name:'Sumeru',    element:'Dendro',  icon:'🌿',  desc:'Forest of Wisdom',     color:'#81c784', glow:'rgba(129,199,132,.35)' },
  { name:'Fontaine',  element:'Hydro',   icon:'💧',  desc:'Nation of Justice',    color:'#4fc3f7', glow:'rgba(79,195,247,.35)'  },
  { name:'Natlan',    element:'Pyro',    icon:'🔥',  desc:'Land of Conflict',     color:'#ff8a65', glow:'rgba(255,138,101,.35)' },
  { name:'Snezhnaya', element:'Cryo',    icon:'❄️',  desc:"The Tsaritsa's Realm", color:'#80deea', glow:'rgba(128,222,234,.35)' },
];

// ── PARTICLES ─────────────────────────────────────────────
export const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 137.5) % 100,
  dur: 6 + (i % 6) * 1.8,
  delay: (i * 0.45) % 8,
  drift: (i % 2 === 0 ? 1 : -1) * (10 + (i % 5) * 9),
  size: 1.2 + (i % 4) * 0.6,
  opacity: 0.4 + (i % 3) * 0.2,
}));

// ── CONSTELLATION stars ───────────────────────────────────
export const CONSTELLATION_STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: (i * 173.3) % 100,
  y: (i * 97.7) % 100,
  size: 1 + (i % 3) * 0.8,
  dur: 2 + (i % 5) * 0.8,
  delay: (i * 0.35) % 5,
  opacity: 0.2 + (i % 4) * 0.15,
}));

// Constellation lines connecting pairs
export const CONSTELLATION_LINES = [
  [0,4],[4,12],[12,20],[20,8],[8,0],
  [15,23],[23,31],[31,39],[39,47],[47,15],
  [5,17],[17,29],[29,41],[41,53],
  [2,10],[10,22],[22,34],[34,46],
];

// ── ORBITAL RINGS ─────────────────────────────────────────
export const RINGS = [
  { r: 230, color: 'rgba(200,169,110,.06)',  dur: '90s',  dots: 0 },
  { r: 178, color: 'rgba(200,169,110,.11)',  dur: '65s',  dots: 7, dotColor: 'rgba(200,169,110,.5)'  },
  { r: 125, color: 'rgba(125,211,232,.09)',  dur: '44s',  dots: 5, dotColor: 'rgba(125,211,232,.6)',  rev: true },
  { r:  78, color: 'rgba(200,169,110,.17)',  dur: '28s',  dots: 4, dotColor: 'rgba(200,169,110,.85)' },
];

// ── SPARKS ────────────────────────────────────────────────
export const SPARKS = [
  {top:'7%', left:'7%',   delay:'0s',   dur:'2.4s', sym:'✦'},
  {top:'11%',left:'87%',  delay:'.5s',  dur:'3s',   sym:'◆'},
  {top:'84%',left:'9%',   delay:'1s',   dur:'2.6s', sym:'✦'},
  {top:'79%',left:'89%',  delay:'1.5s', dur:'3.2s', sym:'❋'},
  {top:'44%',left:'4%',   delay:'2s',   dur:'2.2s', sym:'◈'},
  {top:'49%',left:'93%',  delay:'2.4s', dur:'2.8s', sym:'✧'},
  {top:'24%',left:'6%',   delay:'.7s',  dur:'3.4s', sym:'◆'},
  {top:'68%',left:'91%',  delay:'1.6s', dur:'2s',   sym:'✦'},
  {top:'5%', left:'44%',  delay:'1.2s', dur:'3s',   sym:'❖'},
  {top:'91%',left:'52%',  delay:'.3s',  dur:'3.6s', sym:'✦'},
  {top:'32%',left:'95%',  delay:'2.1s', dur:'2.4s', sym:'◆'},
  {top:'62%',left:'5%',   delay:'.9s',  dur:'2.6s', sym:'✧'},
  {top:'18%',left:'50%',  delay:'1.8s', dur:'2.2s', sym:'◈'},
  {top:'75%',left:'48%',  delay:'.4s',  dur:'3.2s', sym:'✦'},
];

// ── RUNE symbols ──────────────────────────────────────────
export const RUNES = ['✦','◆','❋','◈','✧','❖','⬡','✦'];

// ── FANTASY LOGO SVG ─────────────────────────────────────
export const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    {/* Compass base */}
    <circle cx="16" cy="16" r="13" stroke="url(#logoGrad)" strokeWidth="1.2" fill="rgba(200,169,110,.08)"/>
    {/* Compass cross */}
    <path d="M16 5 L16 27 M5 16 L27 16" stroke="url(#logoGrad)" strokeWidth=".8" opacity=".5"/>
    {/* Compass needle N */}
    <path d="M16 6 L14 13 L16 12 L18 13 Z" fill="#e8d5a3"/>
    {/* Compass needle S */}
    <path d="M16 26 L14 19 L16 20 L18 19 Z" fill="rgba(200,169,110,.4)"/>
    {/* Book pages */}
    <path d="M11 11 Q16 10 16 16 Q16 10 21 11 L21 22 Q16 21 16 16 Q16 21 11 22 Z"
      fill="rgba(200,169,110,.15)" stroke="url(#logoGrad)" strokeWidth=".8"/>
    {/* Star center */}
    <circle cx="16" cy="16" r="1.5" fill="#e8d5a3" filter="url(#logoBlur)"/>
    <circle cx="16" cy="16" r=".7"  fill="#ffffff"/>
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f0e4c0"/>
        <stop offset="50%" stopColor="#c8a96e"/>
        <stop offset="100%" stopColor="#8a6030"/>
      </linearGradient>
      <filter id="logoBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5"/>
      </filter>
    </defs>
  </svg>
);

// ── SHARED CSS ────────────────────────────────────────────
export const SHARED_CSS = (dark) => {
  const d = dark;
  return `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Nunito:wght@300;400;500;600;700&display=swap');

    /* ── DESIGN TOKENS ── */
    .ws-root {
      --gold:        #c8a96e;
      --gold-lt:     #e8d5a3;
      --gold-bright: #f5ecd4;
      --gold-dim:    #7a6040;
      --gold-deep:   #4a3820;
      --cyan:        #7dd3e8;
      --cyan-dim:    #4a9ab5;
      --navy:        #060e1f;
      --navy2:       #0a1422;
      --navy3:       #0e1a2e;
      --text:        #e8dcc8;
      --text-sub:    #8a7f6a;
      --text-dim:    #5a5040;
      --border:      rgba(200,169,110,.2);
      --border-act:  rgba(200,169,110,.6);
      --glow-gold:   rgba(200,169,110,.3);
      --glow-cyan:   rgba(125,211,232,.15);
      --err-bg:      rgba(180,50,50,.14);
      --err-border:  rgba(200,70,70,.3);
      --err-text:    #f09090;

      height:100vh; display:flex;
      font-family:'Nunito',sans-serif;
      position:relative; overflow:hidden;
      background:var(--navy);
    }

    /* ── BACKGROUND ── */
    .ws-bg {
      position:absolute; inset:0;
      background:
        radial-gradient(ellipse 90% 70% at 10% 50%, rgba(30,55,120,.55) 0%,transparent 65%),
        radial-gradient(ellipse 60% 80% at 85% 20%, rgba(15,40,90,.45)  0%,transparent 58%),
        radial-gradient(ellipse 70% 50% at 55% 95%, rgba(90,50,10,.3)   0%,transparent 55%),
        radial-gradient(ellipse 50% 40% at 50% 0%,  rgba(20,60,120,.25) 0%,transparent 50%);
    }

    /* Fine grid */
    .ws-grid {
      position:absolute; inset:0;
      background-image:
        linear-gradient(rgba(200,169,110,.03) 1px,transparent 1px),
        linear-gradient(90deg,rgba(200,169,110,.03) 1px,transparent 1px);
      background-size:52px 52px;
    }

    /* ── CONSTELLATION LAYER ── */
    .ws-constellation {
      position:absolute; inset:0; pointer-events:none; overflow:hidden;
    }
    .ws-cstar {
      position:absolute; border-radius:50%;
      background:#fff;
      animation:cstartwinkle ease-in-out infinite alternate;
    }
    @keyframes cstartwinkle {
      from{opacity:var(--op-from);transform:scale(.7);}
      to  {opacity:var(--op-to);  transform:scale(1.3);}
    }

    /* ── PARTICLES ── */
    .ws-particle {
      position:absolute; border-radius:50%;
      background:var(--gold);
      animation:wspfloat linear infinite;
      pointer-events:none;
    }
    @keyframes wspfloat {
      0%  {transform:translate(0,0) scale(1);opacity:0;}
      8%  {opacity:var(--pop);}
      92% {opacity:calc(var(--pop)*.4);}
      100%{transform:translate(var(--drift),calc(-100vh - 40px)) scale(.15);opacity:0;}
    }

    /* ── SPARKS ── */
    .ws-spark {
      position:absolute; font-size:9px;
      color:var(--gold); pointer-events:none;
      animation:sparkle ease-in-out infinite alternate;
    }
    @keyframes sparkle {
      from{opacity:.1;transform:scale(.6) rotate(-20deg);}
      to  {opacity:.85;transform:scale(1.4) rotate(20deg);
           filter:drop-shadow(0 0 5px rgba(200,169,110,.8));}
    }

    /* ── STREAK LINES ── */
    .ws-streak {
      position:absolute; left:0; right:0; height:1px;
      background:linear-gradient(90deg,
        transparent 0%, transparent 5%,
        rgba(200,169,110,.06) 25%,
        rgba(200,169,110,.15) 50%,
        rgba(200,169,110,.06) 75%,
        transparent 95%, transparent 100%);
      pointer-events:none;
      animation:streakpulse 4s ease-in-out infinite alternate;
    }
    @keyframes streakpulse {
      from{opacity:.4;} to{opacity:.9;}
    }

    /* ── LEFT PANEL ── */
    .ws-left {
      flex:1; position:sticky; top:0; height:100vh;
      align-self:flex-start; flex-shrink:0;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      overflow:hidden;
      border-right:1px solid var(--border);
    }

    /* Teyvat map silhouette — SVG drawn background */
    .ws-map-silhouette {
      position:absolute; inset:0;
      display:flex; align-items:center; justify-content:center;
      pointer-events:none; opacity:.055;
    }

    /* Orbital rings */
    .ws-orb-ring {
      position:absolute; border-radius:50%; border:1px solid;
      animation:orbspin linear infinite;
    }
    @keyframes orbspin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .ws-orb-dot {
      position:absolute; border-radius:50%; width:7px; height:7px;
    }

    /* Ambient glow blob */
    .ws-title-glow {
      position:absolute;
      width:520px; height:280px; border-radius:50%;
      background:radial-gradient(ellipse,rgba(200,169,110,.12) 0%,transparent 68%);
      pointer-events:none;
      animation:glowpulse 5s ease-in-out infinite alternate;
    }
    @keyframes glowpulse {
      from{opacity:.5;transform:scale(.93);}
      to  {opacity:1; transform:scale(1.07);}
    }

    /* ── HERO TEXT ── */
    .ws-hero {
      position:relative; z-index:5;
      display:flex; flex-direction:column;
      align-items:center; text-align:center;
      padding:0 40px; width:100%; max-width:680px;
    }

    /* Ornament top */
    .ws-orn {
      display:flex; align-items:center; gap:16px; margin-bottom:24px;
    }
    .ws-orn-line {
      flex:1; height:1px; max-width:80px;
      background:linear-gradient(90deg,transparent,var(--gold-dim));
    }
    .ws-orn-line.r{background:linear-gradient(90deg,var(--gold-dim),transparent);}
    .ws-orn-center {
      display:flex; align-items:center; gap:8px;
    }
    .ws-orn-gem {
      font-size:11px; color:var(--gold);
      animation:gemglow 2.2s ease-in-out infinite alternate;
      filter:drop-shadow(0 0 4px var(--glow-gold));
    }
    .ws-orn-gem.lg{font-size:15px;animation-delay:.3s;}
    @keyframes gemglow {
      from{filter:drop-shadow(0 0 3px rgba(200,169,110,.35));opacity:.6;}
      to  {filter:drop-shadow(0 0 10px rgba(200,169,110,.9));opacity:1;}
    }

    /* Main title */
    .ws-brand-name {
      font-family:'Cinzel',serif;
      font-size:clamp(3rem,5.6vw,5.4rem);
      font-weight:900;
      letter-spacing:.08em;
      line-height:1;
      color:transparent;
      background:linear-gradient(
        172deg,
        #fff8e8 0%, #f5ecd4 12%,
        #e8d5a3 28%, #c8a96e 50%,
        #9a7540 68%, #c8a96e 82%,
        #f0e0b0 100%
      );
      -webkit-background-clip:text;
      background-clip:text;
      filter:drop-shadow(0 0 36px rgba(200,169,110,.6))
             drop-shadow(0 6px 14px rgba(0,0,0,.75));
      animation:heroshine 6s ease-in-out infinite alternate;
      margin:0 0 0;
    }
    @keyframes heroshine {
      from{filter:drop-shadow(0 0 22px rgba(200,169,110,.45)) drop-shadow(0 6px 12px rgba(0,0,0,.75));}
      to  {filter:drop-shadow(0 0 58px rgba(200,169,110,.8))  drop-shadow(0 6px 16px rgba(0,0,0,.75));}
    }

    /* Decorative bar under title */
    .ws-title-bar {
      position:relative; width:90%; height:1.5px;
      margin:16px auto 0;
      background:linear-gradient(90deg,
        transparent 0%, var(--gold-deep) 12%,
        var(--gold) 32%, var(--gold-bright) 50%,
        var(--gold) 68%, var(--gold-deep) 88%, transparent 100%);
      animation:barshine 4s ease-in-out infinite alternate;
    }
    .ws-title-bar::before,.ws-title-bar::after {
      content:'◆'; position:absolute; top:50%; transform:translateY(-50%);
      font-size:10px; color:var(--gold);
      filter:drop-shadow(0 0 6px rgba(200,169,110,.8));
    }
    .ws-title-bar::before{left:-16px;}
    .ws-title-bar::after {right:-16px;}
    @keyframes barshine {
      from{opacity:.55;box-shadow:none;}
      to  {opacity:1;box-shadow:0 0 16px var(--glow-gold);}
    }

    /* Slogan */
    .ws-brand-slogan {
      font-family:'Cinzel',serif;
      font-size:clamp(.58rem,.92vw,.78rem);
      font-weight:400;
      letter-spacing:.38em;
      text-transform:uppercase;
      color:var(--text-sub);
      margin:14px 0 38px;
      opacity:.85;
    }

    /* Nations */
    .ws-nations {
      display:flex; gap:7px; flex-wrap:wrap;
      justify-content:center; max-width:460px;
    }
    .ws-nation {
      position:relative; display:flex; align-items:center; gap:5px;
      padding:5px 12px; border-radius:20px;
      border:1px solid rgba(200,169,110,.18);
      font-family:'Nunito',sans-serif;
      font-size:11px; font-weight:600;
      color:var(--text-sub); letter-spacing:.06em;
      background:rgba(255,255,255,.03);
      cursor:default; transition:all .3s;
      animation:nationsway 3s ease-in-out infinite alternate;
    }
    .ws-nation:hover {
      transform:translateY(-3px);
    }
    @keyframes nationsway {
      from{box-shadow:0 0 0 rgba(200,169,110,0);}
      to  {box-shadow:0 0 8px var(--ec,rgba(200,169,110,.15));}
    }
    .ws-nation-tip {
      position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%);
      background:rgba(6,14,31,.97); border:1px solid var(--border-act);
      border-radius:6px; padding:4px 11px;
      font-family:'Cinzel',serif; font-size:9px;
      color:var(--gold-lt); letter-spacing:.1em; white-space:nowrap;
      pointer-events:none; z-index:20;
      animation:tipfade .18s ease;
    }
    @keyframes tipfade {
      from{opacity:0;transform:translateX(-50%) translateY(5px);}
      to  {opacity:1;transform:translateX(-50%) translateY(0);}
    }

    /* ── RIGHT PANEL ── */
    .ws-right {
      width:480px; position:relative;
      display:flex; align-items:flex-start; justify-content:center;
      padding:44px 52px;
      overflow-y:auto; overflow-x:hidden;
      height:100vh;
    }

    /* Right panel glass bg */
    .ws-right-bg {
      position:absolute; inset:0;
      background:linear-gradient(160deg, rgba(10,20,38,.97) 0%, rgba(8,15,30,.99) 100%);
      backdrop-filter:blur(2px);
    }
    .ws-right-border {
      position:absolute; inset:0;
      border-left:1px solid var(--border);
    }
    /* Top shimmer line */
    .ws-right-shimmer {
      position:absolute; top:0; left:0; right:0; height:1.5px;
      background:linear-gradient(90deg,transparent,var(--gold-dim),var(--gold),var(--gold-dim),transparent);
      background-size:200% 100%;
      animation:shimline 4s linear infinite;
      opacity:.5;
    }
    @keyframes shimline{from{background-position:200% 0}to{background-position:-200% 0}}

    /* Corner decorations */
    .ws-corner{position:absolute;width:64px;height:64px;pointer-events:none;z-index:3;}
    .ws-corner.tl{top:0;left:0;}
    .ws-corner.tr{top:0;right:0;transform:scaleX(-1);}
    .ws-corner.bl{bottom:0;left:0;transform:scaleY(-1);}
    .ws-corner.br{bottom:0;right:0;transform:scale(-1,-1);}

    /* Form wrapper */
    .ws-form {
      width:100%; opacity:0; transform:translateY(30px);
      transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1);
      position:relative; z-index:2;
      margin:auto 0;
    }
    .ws-form.show{opacity:1;transform:translateY(0);}

    /* ── LOGO ── */
    .ws-logo-row {
      display:flex; align-items:center; gap:12px;
      justify-content:center; margin-bottom:18px;
    }
    .ws-logo-icon {
      width:48px; height:48px; border-radius:50%;
      background:radial-gradient(circle at 38% 35%,
        rgba(200,169,110,.2), rgba(125,211,232,.08), rgba(6,14,31,.92));
      border:1.5px solid rgba(200,169,110,.4);
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 0 24px rgba(200,169,110,.25),
                 0 0 48px rgba(200,169,110,.1),
                 inset 0 0 16px rgba(125,211,232,.06);
      animation:logopulse 3.5s ease-in-out infinite;
    }
    @keyframes logopulse {
      0%,100%{box-shadow:0 0 24px rgba(200,169,110,.22),0 0 48px rgba(200,169,110,.08),inset 0 0 16px rgba(125,211,232,.05);}
      50%    {box-shadow:0 0 40px rgba(200,169,110,.4), 0 0 70px rgba(200,169,110,.15),inset 0 0 24px rgba(125,211,232,.1);}
    }
    .ws-logo-text {
      display:flex; flex-direction:column; align-items:flex-start;
    }
    .ws-logo-name {
      font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700;
      color:var(--gold-lt); letter-spacing:.12em;
      text-shadow:0 0 16px var(--glow-gold);
      line-height:1;
    }
    .ws-logo-sub {
      font-size:.6rem; color:var(--text-dim); letter-spacing:.2em;
      text-transform:uppercase; margin-top:2px;
    }

    /* ── FORM CARD ── */
    .ws-card {
      background:linear-gradient(145deg,
        rgba(255,255,255,.04) 0%,
        rgba(200,169,110,.04) 50%,
        rgba(255,255,255,.02) 100%);
      border:1px solid;
      border-image:linear-gradient(145deg,
        rgba(200,169,110,.4) 0%,
        rgba(200,169,110,.15) 40%,
        rgba(125,211,232,.15) 60%,
        rgba(200,169,110,.4) 100%) 1;
      border-radius:8px;
      padding:28px;
      position:relative; overflow:hidden;
      box-shadow:
        inset 0 1px 0 rgba(200,169,110,.15),
        inset 0 -1px 0 rgba(200,169,110,.08),
        0 0 40px rgba(200,169,110,.06),
        0 20px 60px rgba(0,0,0,.4);
    }
    .ws-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:1px;
      background:linear-gradient(90deg,transparent,rgba(200,169,110,.5),rgba(125,211,232,.3),rgba(200,169,110,.5),transparent);
    }

    /* ── DIVIDER ── */
    .ws-div{display:flex;align-items:center;gap:10px;margin:14px 0;}
    .ws-div-line{flex:1;height:1px;
      background:linear-gradient(90deg,transparent,rgba(200,169,110,.3),transparent);}
    .ws-div-gem{color:var(--gold);font-size:10px;
      filter:drop-shadow(0 0 4px rgba(200,169,110,.7));}

    /* ── SUBTITLE ── */
    .ws-card-sub {
      text-align:center; margin-bottom:20px;
    }
    .ws-card-title {
      font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700;
      color:var(--gold-lt); letter-spacing:.1em;
      text-shadow:0 0 14px var(--glow-gold); margin-bottom:3px;
    }
    .ws-card-desc {
      font-size:.72rem; color:var(--text-sub); letter-spacing:.18em;
      text-transform:uppercase;
    }

    /* ── HINT ── */
    .ws-hint {
      display:flex; align-items:center; gap:8px;
      border:1px solid rgba(200,169,110,.18);
      border-radius:6px; padding:9px 13px; margin-bottom:18px;
      background:rgba(200,169,110,.05);
      font-size:11.5px; color:var(--text-sub); letter-spacing:.02em;
    }
    .ws-hint strong{color:var(--gold-lt);}

    /* ── ERROR ── */
    .ws-err {
      display:flex; align-items:center; gap:8px;
      background:var(--err-bg); border:1px solid var(--err-border);
      border-radius:6px; padding:10px 13px; color:var(--err-text);
      font-size:13px; margin-bottom:14px;
      animation:wsshake .4s ease;
    }
    @keyframes wsshake {
      0%,100%{transform:translateX(0)}
      25%{transform:translateX(-5px)} 75%{transform:translateX(5px)}
    }

    /* ── FIELDS ── */
    .ws-field{margin-bottom:16px;}
    .ws-label {
      font-family:'Cinzel',serif; font-size:9px; font-weight:600;
      letter-spacing:.2em; text-transform:uppercase;
      color:var(--text-sub); margin-bottom:7px;
      display:flex; align-items:center; gap:7px;
      transition:color .25s;
    }
    .ws-label.active{color:var(--gold);}
    .ws-label-icon{
      font-size:12px; opacity:.7;
      transition:opacity .25s, filter .25s;
    }
    .ws-label.active .ws-label-icon{opacity:1;filter:drop-shadow(0 0 4px rgba(200,169,110,.6));}

    .ws-field-wrap{position:relative;}
    .ws-input {
      width:100%; padding:12px 44px 12px 42px;
      background:rgba(255,255,255,.04);
      border:1px solid rgba(200,169,110,.18);
      border-radius:6px;
      font-family:'Nunito',sans-serif; font-size:14px; font-weight:500;
      color:var(--text); outline:none;
      transition:all .25s;
      letter-spacing:.02em;
    }
    .ws-input::placeholder{color:rgba(138,127,106,.38);font-weight:400;}
    .ws-input:focus {
      border-color:rgba(200,169,110,.55);
      background:rgba(200,169,110,.05);
      box-shadow:
        0 0 0 1px rgba(200,169,110,.18),
        inset 0 0 20px rgba(200,169,110,.04),
        0 0 16px rgba(200,169,110,.1);
    }
    /* Animated underline */
    .ws-field-wrap::after {
      content:''; position:absolute; bottom:0; left:50%; right:50%; height:1.5px;
      background:linear-gradient(90deg,var(--cyan-dim),var(--gold),var(--gold-lt),var(--gold),var(--cyan-dim));
      transition:left .35s ease, right .35s ease;
      border-radius:0 0 6px 6px;
    }
    .ws-field-wrap.focused::after{left:0;right:0;}
    /* Left field icon */
    .ws-field-left-icon {
      position:absolute; left:13px; top:50%; transform:translateY(-50%);
      font-size:15px; pointer-events:none; opacity:.5;
      transition:opacity .25s;
    }
    .ws-field-wrap.focused .ws-field-left-icon{opacity:.9;}
    /* Right action */
    .ws-field-action {
      position:absolute; right:12px; top:50%; transform:translateY(-50%);
      color:var(--gold-dim); font-size:14px; cursor:pointer;
      background:none; border:none; padding:2px; line-height:1;
      transition:color .2s;
    }
    .ws-field-action:hover{color:var(--gold);}

    /* ── BUTTON ── */
    .ws-btn {
      width:100%; padding:14px 24px;
      background:linear-gradient(135deg,
        rgba(200,169,110,.14) 0%,
        rgba(200,169,110,.26) 40%,
        rgba(200,169,110,.14) 100%);
      border:1px solid rgba(200,169,110,.45);
      border-radius:6px; color:var(--gold-lt);
      font-family:'Cinzel',serif; font-size:12px; font-weight:600;
      letter-spacing:.2em; text-transform:uppercase;
      cursor:pointer; position:relative; overflow:hidden;
      transition:all .3s; margin-top:4px;
    }
    /* Inner glow layer */
    .ws-btn::before {
      content:''; position:absolute; inset:0;
      background:radial-gradient(ellipse at 50% 120%,rgba(200,169,110,.22),transparent 70%);
      opacity:0; transition:opacity .3s;
    }
    /* Shimmer sweep */
    .ws-btn::after {
      content:''; position:absolute; top:0; left:-110%; width:55%; height:100%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);
      animation:btnshimmer 3.5s ease infinite;
    }
    @keyframes btnshimmer{from{left:-110%}to{left:210%}}

    .ws-btn:hover:not(:disabled) {
      border-color:rgba(200,169,110,.8);
      color:var(--gold-bright);
      background:linear-gradient(135deg,
        rgba(200,169,110,.2) 0%,
        rgba(200,169,110,.38) 40%,
        rgba(200,169,110,.2) 100%);
      box-shadow:
        0 0 28px rgba(200,169,110,.35),
        0 0 60px rgba(200,169,110,.15),
        inset 0 0 20px rgba(200,169,110,.08);
      transform:translateY(-1px);
    }
    .ws-btn:hover:not(:disabled)::before{opacity:1;}
    .ws-btn:active:not(:disabled){transform:translateY(1px);
      box-shadow:0 0 12px rgba(200,169,110,.2);}
    .ws-btn:disabled{opacity:.4;cursor:not-allowed;}

    /* Spinner */
    .ws-spin {
      display:inline-block; width:13px; height:13px;
      border:2px solid rgba(200,169,110,.3); border-top-color:var(--gold);
      border-radius:50%; animation:wssp .7s linear infinite;
      vertical-align:middle; margin-right:8px;
    }
    @keyframes wssp{to{transform:rotate(360deg)}}

    /* ── BOTTOM LINK ── */
    .ws-bot{
      text-align:center; margin-top:16px;
      font-size:12.5px; color:var(--text-sub); letter-spacing:.04em;
    }
    .ws-bot a{
      color:var(--gold); text-decoration:none;
      font-family:'Cinzel',serif; font-size:10.5px; letter-spacing:.1em;
      border-bottom:1px solid transparent; transition:all .2s;
    }
    .ws-bot a:hover{color:var(--gold-bright);border-bottom-color:var(--gold);}

    /* Rune row */
    .ws-rune-row{display:flex;justify-content:center;gap:14px;margin-top:12px;}
    .ws-rune-item{
      font-size:10px; color:var(--gold-dim);
      animation:wsrunepulse 2s ease-in-out infinite alternate; cursor:default;
    }
    .ws-rune-item:nth-child(2){animation-delay:.3s}
    .ws-rune-item:nth-child(3){animation-delay:.6s}
    .ws-rune-item:nth-child(4){animation-delay:.9s}
    .ws-rune-item:nth-child(5){animation-delay:1.2s}
    @keyframes wsrunepulse {
      from{opacity:.2;text-shadow:none;}
      to  {opacity:.85;text-shadow:0 0 7px rgba(200,169,110,.7);}
    }

    /* ── FIELD ERROR ── */
    .ws-field-err {
      font-size:11px; color:var(--err-text);
      margin-top:5px; display:flex; align-items:center; gap:5px;
      letter-spacing:.02em; animation:wsshake .3s ease;
    }

    /* Optional / required badges */
    .ws-opt{font-size:8px;color:var(--text-dim);letter-spacing:.1em;
      margin-left:6px;font-family:'Cinzel',serif;}
    .ws-req{font-size:9px;color:#c07070;margin-left:3px;}

    /* Password strength */
    .ws-strength-bar{display:flex;gap:4px;margin-top:5px;}
    .ws-strength-seg{flex:1;height:2px;border-radius:2px;
      background:rgba(255,255,255,.07);transition:background .35s;}
    .ws-strength-label{
      font-family:'Cinzel',serif;font-size:8.5px;letter-spacing:.14em;
      margin-top:3px;text-align:right;transition:color .35s;
    }

    @media(max-width:768px){
      .ws-left{display:none;}
      .ws-right{width:100%;padding:32px 20px;}
    }
  `;
};