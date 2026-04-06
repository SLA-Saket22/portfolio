import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ─── API CONFIG ───────────────────────────────────────────────────
const API = "http://localhost:5000/api";

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem("admin_token");
  const res = await fetch(`${API}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// ─── AUTH CONTEXT ─────────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// ─── ICONS (inline SVG) ───────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    projects: <><path d="M2 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2z"/></>,
    blogs: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    messages: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
    skills: <><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    star: <><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    check: <><polyline points="20,6 9,17 4,12"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    userPlus: <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── TOAST ────────────────────────────────────────────────────────
const Toast = ({ toasts, remove }) => (
  <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        display:"flex", alignItems:"center", gap:12, padding:"12px 18px", borderRadius:10,
        background: t.type==="error" ? "rgba(255,59,48,.15)" : "rgba(57,255,20,.12)",
        border: `1px solid ${t.type==="error" ? "rgba(255,59,48,.4)" : "rgba(57,255,20,.4)"}`,
        backdropFilter:"blur(12px)", color:"#fff", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.8rem",
        animation:"slideIn .3s ease", minWidth:280
      }}>
        <span style={{ color: t.type==="error" ? "#ff3b30" : "#39ff14" }}>
          {t.type==="error" ? "✕" : "✓"}
        </span>
        {t.msg}
        <button onClick={() => remove(t.id)} style={{ marginLeft:"auto", background:"none", border:"none", color:"#94a3b8", cursor:"pointer" }}>×</button>
      </div>
    ))}
  </div>
);

let toastId = 0;
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type="success") => {
    const id = ++toastId;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };
  const remove = (id) => setToasts(p => p.filter(t => t.id !== id));
  return { toasts, toast: add, remove };
};

// ─── PASSWORD STRENGTH ────────────────────────────────────────────
const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Lowercase", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Symbol", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ["#374151","#ff3b30","#fbbf24","#fbbf24","#39ff14","#39ff14"];
  const labels = ["","Weak","Fair","Good","Strong","Very Strong"];

  if (!password) return null;
  return (
    <div style={{ marginTop:8 }}>
      <div style={{ display:"flex", gap:4, marginBottom:6 }}>
        {checks.map((_, i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i < score ? colors[score] : "rgba(255,255,255,.08)", transition:"background .3s" }}/>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {checks.map(c => (
            <span key={c.label} style={{ fontSize:"0.6rem", color: c.pass ? "#39ff14" : "#374151", letterSpacing:"1px" }}>
              {c.pass ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
        <span style={{ fontSize:"0.65rem", color: colors[score], fontWeight:600 }}>{labels[score]}</span>
      </div>
    </div>
  );
};

// ─── AUTH PAGE (Login + Register) ────────────────────────────────
const AuthPage = ({ onLogin }) => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({ username: "", email: "", password: "", confirm: "", inviteCode: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await api("/auth/login", { method: "POST", body: JSON.stringify(loginForm) });
      localStorage.setItem("admin_token", data.token);
      onLogin(data.username);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (regForm.password !== regForm.confirm) return setError("Passwords don't match");
    if (regForm.password.length < 8) return setError("Password must be at least 8 characters");
    setLoading(true);
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: regForm.username,
          email: regForm.email,
          password: regForm.password,
          inviteCode: regForm.inviteCode,
        }),
      });
      setSuccess("Account created! You can now log in.");
      setMode("login");
      setLoginForm({ username: regForm.username, password: "" });
      setRegForm({ username: "", email: "", password: "", confirm: "", inviteCode: "" });
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 8, padding: "11px 14px", color: "#e2e8f0", fontSize: "0.88rem",
    outline: "none", fontFamily: "'JetBrains Mono',monospace",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#060610", fontFamily: "'JetBrains Mono',monospace",
      backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(57,255,20,.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,245,255,.05) 0%, transparent 50%)"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #0d0d1f inset !important; -webkit-text-fill-color: #e2e8f0 !important; }
      `}</style>

      {/* Grid BG */}
      <div style={{ position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(57,255,20,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(57,255,20,.03) 1px,transparent 1px)", backgroundSize:"50px 50px", pointerEvents:"none" }}/>

      <div style={{ width:"100%", maxWidth:440, padding:"0 20px", animation:"fadeUp .4s ease" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2rem", color:"#39ff14", textShadow:"0 0 30px rgba(57,255,20,.5)", marginBottom:8 }}>
            SR<span style={{ color:"#fff" }}>/</span>&gt;T
          </div>
          <div style={{ color:"#94a3b8", fontSize:"0.7rem", letterSpacing:"4px", textTransform:"uppercase" }}>Admin Dashboard</div>
        </div>

        {/* Tab switcher */}
        <div style={{ display:"flex", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:4, marginBottom:24, gap:4 }}>
          {[
            { id:"login", label:"Login", icon:"lock" },
            { id:"register", label:"Register", icon:"userPlus" },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setMode(tab.id); setError(""); setSuccess(""); }} style={{
              flex:1, background: mode===tab.id ? "rgba(57,255,20,.12)" : "transparent",
              border: mode===tab.id ? "1px solid rgba(57,255,20,.3)" : "1px solid transparent",
              color: mode===tab.id ? "#39ff14" : "#64748b", fontFamily:"'JetBrains Mono',monospace",
              fontSize:"0.72rem", padding:"10px", borderRadius:9, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              letterSpacing:"2px", textTransform:"uppercase", transition:"all .2s"
            }}>
              <Icon name={tab.icon} size={14}/> {tab.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background:"rgba(13,13,31,.85)", border:"1px solid rgba(57,255,20,.15)", borderRadius:16,
          padding:"32px 30px", backdropFilter:"blur(20px)",
          boxShadow:"0 0 60px rgba(0,0,0,.5), 0 0 120px rgba(57,255,20,.05)"
        }}>

          {/* Error / Success */}
          {error && (
            <div style={{ background:"rgba(255,59,48,.1)", border:"1px solid rgba(255,59,48,.3)", borderRadius:8, padding:"10px 14px", marginBottom:20, color:"#ff6b6b", fontSize:"0.78rem" }}>
              ⚠ {error}
            </div>
          )}
          {success && (
            <div style={{ background:"rgba(57,255,20,.08)", border:"1px solid rgba(57,255,20,.3)", borderRadius:8, padding:"10px 14px", marginBottom:20, color:"#39ff14", fontSize:"0.78rem" }}>
              ✓ {success}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:"0.62rem", letterSpacing:"3px", textTransform:"uppercase", marginBottom:7 }}>Username</label>
                <input
                  type="text" placeholder="admin" value={loginForm.username} required
                  onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor="rgba(57,255,20,.5)"}
                  onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"}
                />
              </div>
              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:"0.62rem", letterSpacing:"3px", textTransform:"uppercase", marginBottom:7 }}>Password</label>
                <div style={{ position:"relative" }}>
                  <input
                    type={showPass ? "text" : "password"} placeholder="••••••••" value={loginForm.password} required
                    onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    style={{ ...inputStyle, paddingRight:44 }}
                    onFocus={e => e.target.style.borderColor="rgba(57,255,20,.5)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"}
                  />
                  <button type="button" onClick={() => setShowPass(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer" }}>
                    <Icon name={showPass ? "eyeOff" : "eye"} size={16}/>
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} style={{
                background: loading ? "rgba(57,255,20,.3)" : "linear-gradient(135deg,#39ff14,#00f5ff)",
                color:"#060610", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.75rem",
                letterSpacing:"3px", padding:"13px", borderRadius:8, border:"none",
                cursor: loading ? "default" : "pointer", textTransform:"uppercase", marginTop:4, transition:"all .2s"
              }}>
                {loading ? "AUTHENTICATING..." : "LOGIN →"}
              </button>

              <div style={{ marginTop:8, padding:"10px 12px", background:"rgba(57,255,20,.05)", borderRadius:8, border:"1px solid rgba(57,255,20,.1)" }}>
                <div style={{ color:"#64748b", fontSize:"0.65rem", letterSpacing:"1px" }}>Default credentials:</div>
                <div style={{ color:"#39ff14", fontSize:"0.7rem", marginTop:3 }}>admin / admin123</div>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:15 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ display:"block", color:"#94a3b8", fontSize:"0.62rem", letterSpacing:"3px", textTransform:"uppercase", marginBottom:7 }}>Username *</label>
                  <input
                    type="text" placeholder="john_doe" value={regForm.username} required
                    onChange={e => setRegForm(p => ({ ...p, username: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor="rgba(57,255,20,.5)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"}
                  />
                </div>
                <div>
                  <label style={{ display:"block", color:"#94a3b8", fontSize:"0.62rem", letterSpacing:"3px", textTransform:"uppercase", marginBottom:7 }}>Email *</label>
                  <input
                    type="email" placeholder="you@email.com" value={regForm.email} required
                    onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor="rgba(57,255,20,.5)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"}
                  />
                </div>
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:"0.62rem", letterSpacing:"3px", textTransform:"uppercase", marginBottom:7 }}>Password *</label>
                <div style={{ position:"relative" }}>
                  <input
                    type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={regForm.password} required
                    onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                    style={{ ...inputStyle, paddingRight:44 }}
                    onFocus={e => e.target.style.borderColor="rgba(57,255,20,.5)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"}
                  />
                  <button type="button" onClick={() => setShowPass(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer" }}>
                    <Icon name={showPass ? "eyeOff" : "eye"} size={16}/>
                  </button>
                </div>
                <PasswordStrength password={regForm.password}/>
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:"0.62rem", letterSpacing:"3px", textTransform:"uppercase", marginBottom:7 }}>Confirm Password *</label>
                <div style={{ position:"relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"} placeholder="Repeat password" value={regForm.confirm} required
                    onChange={e => setRegForm(p => ({ ...p, confirm: e.target.value }))}
                    style={{ ...inputStyle, paddingRight:44, borderColor: regForm.confirm && regForm.confirm !== regForm.password ? "rgba(255,59,48,.5)" : regForm.confirm && regForm.confirm === regForm.password ? "rgba(57,255,20,.4)" : "rgba(255,255,255,.1)" }}
                    onFocus={e => {}}
                    onBlur={e => {}}
                  />
                  <button type="button" onClick={() => setShowConfirm(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer" }}>
                    <Icon name={showConfirm ? "eyeOff" : "eye"} size={16}/>
                  </button>
                </div>
                {regForm.confirm && regForm.confirm !== regForm.password && (
                  <div style={{ color:"#ff6b6b", fontSize:"0.65rem", marginTop:5 }}>⚠ Passwords don't match</div>
                )}
              </div>

              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:"0.62rem", letterSpacing:"3px", textTransform:"uppercase", marginBottom:7 }}>
                  Invite Code <span style={{ color:"#374151" }}>(optional)</span>
                </label>
                <input
                  type="text" placeholder="ADMIN-XXXX" value={regForm.inviteCode}
                  onChange={e => setRegForm(p => ({ ...p, inviteCode: e.target.value }))}
                  style={{ ...inputStyle, letterSpacing:"2px" }}
                  onFocus={e => e.target.style.borderColor="rgba(57,255,20,.5)"}
                  onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"}
                />
                <div style={{ color:"#374151", fontSize:"0.62rem", marginTop:5 }}>Invite code grants admin access. Without it, account needs approval.</div>
              </div>

              <button type="submit" disabled={loading} style={{
                background: loading ? "rgba(57,255,20,.3)" : "linear-gradient(135deg,#39ff14,#00f5ff)",
                color:"#060610", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.75rem",
                letterSpacing:"3px", padding:"13px", borderRadius:8, border:"none",
                cursor: loading ? "default" : "pointer", textTransform:"uppercase", marginTop:4, transition:"all .2s"
              }}>
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
              </button>
            </form>
          )}
        </div>

        <div style={{ textAlign:"center", marginTop:20, color:"#374151", fontSize:"0.65rem", letterSpacing:"2px" }}>
          SECURED WITH JWT • BCRYPT ENCRYPTED
        </div>
      </div>
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, sub }) => (
  <div style={{
    background:"rgba(13,13,31,.6)", border:`1px solid ${color}22`, borderRadius:12,
    padding:"24px", position:"relative", overflow:"hidden",
    boxShadow:`0 0 30px ${color}08`
  }}>
    <div style={{ position:"absolute", top:16, right:16, color, opacity:.5 }}><Icon name={icon} size={28}/></div>
    <div style={{ color:"#64748b", fontSize:"0.65rem", letterSpacing:"3px", textTransform:"uppercase", marginBottom:10 }}>{label}</div>
    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"2.4rem", color, lineHeight:1 }}>{value ?? "–"}</div>
    {sub && <div style={{ color:"#64748b", fontSize:"0.7rem", marginTop:8 }}>{sub}</div>}
  </div>
);

// ─── MODAL ────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={{
    position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center",
    background:"rgba(6,6,16,.85)", backdropFilter:"blur(8px)", padding:20
  }}>
    <div style={{
      background:"#0d0d1f", border:"1px solid rgba(57,255,20,.2)", borderRadius:16,
      width:"100%", maxWidth:640, maxHeight:"90vh", overflow:"auto",
      boxShadow:"0 0 80px rgba(0,0,0,.8)"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <h3 style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700, fontSize:"1rem" }}>{title}</h3>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,.06)", border:"none", color:"#94a3b8", cursor:"pointer", borderRadius:6, padding:"6px 10px", fontSize:"1.1rem" }}>×</button>
      </div>
      <div style={{ padding:"24px" }}>{children}</div>
    </div>
  </div>
);

// ─── FORM FIELD ───────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ marginBottom:18 }}>
    <label style={{ display:"block", color:"#94a3b8", fontSize:"0.65rem", letterSpacing:"3px", textTransform:"uppercase", marginBottom:8 }}>{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input {...props} style={{
    width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)",
    borderRadius:8, padding:"10px 12px", color:"#e2e8f0", fontSize:"0.88rem",
    outline:"none", fontFamily:"'JetBrains Mono',monospace", ...props.style
  }}
  onFocus={e => e.target.style.borderColor="rgba(57,255,20,.5)"}
  onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"}
  />
);

const Textarea = (props) => (
  <textarea {...props} style={{
    width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)",
    borderRadius:8, padding:"10px 12px", color:"#e2e8f0", fontSize:"0.88rem",
    outline:"none", fontFamily:"'JetBrains Mono',monospace", resize:"vertical", minHeight:100, ...props.style
  }}
  onFocus={e => e.target.style.borderColor="rgba(57,255,20,.5)"}
  onBlur={e => e.target.style.borderColor="rgba(255,255,255,.1)"}
  />
);

const Btn = ({ children, onClick, color="#39ff14", outline, small, style={}, ...rest }) => (
  <button onClick={onClick} {...rest} style={{
    background: outline ? "transparent" : color==="red" ? "rgba(255,59,48,.15)" : `${color}18`,
    border: `1px solid ${color==="red" ? "rgba(255,59,48,.4)" : color+"44"}`,
    color: color==="red" ? "#ff6b6b" : color,
    fontFamily:"'JetBrains Mono',monospace", fontSize: small ? "0.68rem" : "0.75rem",
    padding: small ? "6px 12px" : "9px 18px", borderRadius:7, cursor:"pointer",
    display:"flex", alignItems:"center", gap:6, letterSpacing:"1px",
    transition:"all .15s", ...style
  }}>
    {children}
  </button>
);

// ─── PROJECTS PANEL ───────────────────────────────────────────────
const ProjectsPanel = ({ toast }) => {
  const [projects, setProjects] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try { setProjects(await api("/projects")); } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ title:"", description:"", tech:"", liveUrl:"", githubUrl:"", image:"", featured:false }); setModal("add"); };
  const openEdit = (p) => { setForm({ ...p, tech: p.tech?.join(", ") || "" }); setModal(p); };

  const save = async () => {
    setLoading(true);
    try {
      const payload = { ...form, tech: form.tech ? form.tech.split(",").map(t=>t.trim()).filter(Boolean) : [] };
      if (modal === "add") await api("/projects", { method:"POST", body: JSON.stringify(payload) });
      else await api(`/projects/${modal._id}`, { method:"PUT", body: JSON.stringify(payload) });
      toast(modal==="add" ? "Project added!" : "Project updated!");
      setModal(null); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this project?")) return;
    try { await api(`/projects/${id}`, { method:"DELETE" }); toast("Project deleted"); load(); }
    catch (err) { toast(err.message, "error"); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700 }}>Projects</h2>
        <Btn onClick={openAdd}><Icon name="plus" size={15}/> Add Project</Btn>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {projects.map(p => (
          <div key={p._id} style={{ background:"rgba(13,13,31,.6)", border:"1px solid rgba(57,255,20,.1)", borderRadius:12, padding:"18px 20px", display:"flex", alignItems:"center", gap:16 }}>
            {p.image && <img src={p.image} style={{ width:56, height:56, borderRadius:8, objectFit:"cover", border:"1px solid rgba(255,255,255,.1)" }} alt="" />}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <span style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700 }}>{p.title}</span>
                {p.featured && <span style={{ background:"rgba(57,255,20,.15)", color:"#39ff14", fontSize:"0.6rem", padding:"2px 8px", borderRadius:20, letterSpacing:"2px" }}>FEATURED</span>}
              </div>
              <div style={{ color:"#64748b", fontSize:"0.78rem", marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.description}</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {p.tech?.map(t => <span key={t} style={{ background:"rgba(0,245,255,.08)", color:"#00f5ff", fontSize:"0.63rem", padding:"2px 8px", borderRadius:20, letterSpacing:"1px" }}>{t}</span>)}
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn small onClick={() => openEdit(p)}><Icon name="edit" size={13}/></Btn>
              <Btn small color="red" onClick={() => del(p._id)}><Icon name="trash" size={13}/></Btn>
            </div>
          </div>
        ))}
        {!projects.length && <div style={{ textAlign:"center", color:"#64748b", padding:"40px 0", fontSize:"0.85rem" }}>No projects yet. Add your first one!</div>}
      </div>
      {modal && (
        <Modal title={modal==="add" ? "Add Project" : "Edit Project"} onClose={() => setModal(null)}>
          <Field label="Title"><Input value={form.title||""} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Project name"/></Field>
          <Field label="Description"><Textarea value={form.description||""} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Brief description..."/></Field>
          <Field label="Tech Stack (comma-separated)"><Input value={form.tech||""} onChange={e=>setForm(p=>({...p,tech:e.target.value}))} placeholder="React, Node.js, MongoDB"/></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Live URL"><Input value={form.liveUrl||""} onChange={e=>setForm(p=>({...p,liveUrl:e.target.value}))} placeholder="https://..."/></Field>
            <Field label="GitHub URL"><Input value={form.githubUrl||""} onChange={e=>setForm(p=>({...p,githubUrl:e.target.value}))} placeholder="https://github.com/..."/></Field>
          </div>
          <Field label="Image URL"><Input value={form.image||""} onChange={e=>setForm(p=>({...p,image:e.target.value}))} placeholder="https://..."/></Field>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:20 }}>
            <input type="checkbox" checked={form.featured||false} onChange={e=>setForm(p=>({...p,featured:e.target.checked}))} style={{ accentColor:"#39ff14", width:16, height:16 }}/>
            <span style={{ color:"#94a3b8", fontSize:"0.8rem" }}>Featured project</span>
          </label>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn outline onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save} style={{ opacity: loading ? .6 : 1 }}>{loading ? "Saving..." : "Save Project"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── BLOGS PANEL ──────────────────────────────────────────────────
const BlogsPanel = ({ toast }) => {
  const [blogs, setBlogs] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try { setBlogs(await api("/blogs")); } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ title:"", content:"", excerpt:"", tags:"", published:false }); setModal("add"); };
  const openEdit = (b) => { setForm({ ...b, tags: b.tags?.join(", ")||"" }); setModal(b); };

  const save = async () => {
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(",").map(t=>t.trim()).filter(Boolean) : [] };
      if (modal==="add") await api("/blogs", { method:"POST", body: JSON.stringify(payload) });
      else await api(`/blogs/${modal._id}`, { method:"PUT", body: JSON.stringify(payload) });
      toast(modal==="add" ? "Blog post added!" : "Blog updated!");
      setModal(null); load();
    } catch (err) { toast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    try { await api(`/blogs/${id}`, { method:"DELETE" }); toast("Blog deleted"); load(); }
    catch (err) { toast(err.message, "error"); }
  };

  const togglePublish = async (b) => {
    try {
      await api(`/blogs/${b._id}`, { method:"PUT", body: JSON.stringify({ published: !b.published }) });
      toast(b.published ? "Blog unpublished" : "Blog published!"); load();
    } catch (err) { toast(err.message, "error"); }
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700 }}>Blog Posts</h2>
        <Btn onClick={openAdd}><Icon name="plus" size={15}/> New Post</Btn>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {blogs.map(b => (
          <div key={b._id} style={{ background:"rgba(13,13,31,.6)", border:"1px solid rgba(57,255,20,.1)", borderRadius:12, padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <span style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700 }}>{b.title}</span>
                  <span style={{ background: b.published ? "rgba(57,255,20,.15)" : "rgba(255,255,255,.06)", color: b.published ? "#39ff14" : "#64748b", fontSize:"0.6rem", padding:"2px 8px", borderRadius:20, letterSpacing:"2px" }}>
                    {b.published ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>
                <div style={{ color:"#64748b", fontSize:"0.78rem", marginBottom:8 }}>{b.excerpt || b.content?.slice(0,100)+"..."}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {b.tags?.map(t => <span key={t} style={{ background:"rgba(139,92,246,.1)", color:"#a78bfa", fontSize:"0.63rem", padding:"2px 8px", borderRadius:20 }}>{t}</span>)}
                </div>
              </div>
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <Btn small color={b.published ? "#94a3b8" : "#39ff14"} onClick={() => togglePublish(b)}>
                  <Icon name={b.published ? "x" : "check"} size={13}/>
                </Btn>
                <Btn small onClick={() => openEdit(b)}><Icon name="edit" size={13}/></Btn>
                <Btn small color="red" onClick={() => del(b._id)}><Icon name="trash" size={13}/></Btn>
              </div>
            </div>
          </div>
        ))}
        {!blogs.length && <div style={{ textAlign:"center", color:"#64748b", padding:"40px 0", fontSize:"0.85rem" }}>No blog posts yet.</div>}
      </div>
      {modal && (
        <Modal title={modal==="add" ? "New Blog Post" : "Edit Blog Post"} onClose={() => setModal(null)}>
          <Field label="Title"><Input value={form.title||""} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Blog title"/></Field>
          <Field label="Excerpt"><Input value={form.excerpt||""} onChange={e=>setForm(p=>({...p,excerpt:e.target.value}))} placeholder="Short description..."/></Field>
          <Field label="Content (Markdown supported)"><Textarea value={form.content||""} onChange={e=>setForm(p=>({...p,content:e.target.value}))} placeholder="Write your blog content here..." style={{ minHeight:180 }}/></Field>
          <Field label="Tags (comma-separated)"><Input value={form.tags||""} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="react, webdev, tutorial"/></Field>
          <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:20 }}>
            <input type="checkbox" checked={form.published||false} onChange={e=>setForm(p=>({...p,published:e.target.checked}))} style={{ accentColor:"#39ff14", width:16, height:16 }}/>
            <span style={{ color:"#94a3b8", fontSize:"0.8rem" }}>Publish immediately</span>
          </label>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <Btn outline onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save}>{loading ? "Saving..." : "Save Post"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── MESSAGES PANEL ───────────────────────────────────────────────
const MessagesPanel = ({ toast, onRead }) => {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      const msgs = await api(`/messages${filter!=="all" ? `?filter=${filter}` : ""}`);
      setMessages(msgs); onRead?.();
    } catch {}
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const markRead = async (id, read) => {
    try { await api(`/messages/${id}`, { method:"PUT", body: JSON.stringify({ read }) }); load(); } catch {}
  };
  const star = async (id, starred) => {
    try { await api(`/messages/${id}`, { method:"PUT", body: JSON.stringify({ starred }) }); load(); } catch {}
  };
  const del = async (id) => {
    if (!confirm("Delete this message?")) return;
    try { await api(`/messages/${id}`, { method:"DELETE" }); toast("Message deleted"); setSelected(null); load(); }
    catch (err) { toast(err.message, "error"); }
  };
  const openMsg = (m) => { setSelected(m); if (!m.read) markRead(m._id, true); };
  const unread = messages.filter(m => !m.read).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700 }}>
          Messages {unread > 0 && <span style={{ background:"#39ff14", color:"#060610", fontSize:"0.65rem", padding:"2px 8px", borderRadius:20, marginLeft:8, fontFamily:"'JetBrains Mono',monospace" }}>{unread}</span>}
        </h2>
        <div style={{ display:"flex", gap:8 }}>
          {["all","unread","starred"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter===f ? "rgba(57,255,20,.15)" : "transparent",
              border:"1px solid rgba(57,255,20,.2)", color: filter===f ? "#39ff14" : "#64748b",
              fontFamily:"'JetBrains Mono',monospace", fontSize:"0.65rem", padding:"6px 12px",
              borderRadius:6, cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase"
            }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {messages.map(m => (
            <div key={m._id} onClick={() => openMsg(m)} style={{
              background: selected?._id===m._id ? "rgba(57,255,20,.08)" : "rgba(13,13,31,.6)",
              border: `1px solid ${selected?._id===m._id ? "rgba(57,255,20,.3)" : m.read ? "rgba(255,255,255,.06)" : "rgba(57,255,20,.2)"}`,
              borderRadius:10, padding:"14px 16px", cursor:"pointer", transition:"all .15s"
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    {!m.read && <div style={{ width:6, height:6, borderRadius:"50%", background:"#39ff14", flexShrink:0 }}/>}
                    <span style={{ color:"#e2e8f0", fontWeight: m.read ? 400 : 600, fontSize:"0.85rem", fontFamily:"'Syne',sans-serif" }}>{m.name}</span>
                    <span style={{ color:"#64748b", fontSize:"0.7rem" }}>{m.email}</span>
                  </div>
                  <div style={{ color:"#94a3b8", fontSize:"0.78rem", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {m.subject && <strong>{m.subject}: </strong>}{m.message}
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();star(m._id,!m.starred)}} style={{ background:"none", border:"none", color: m.starred ? "#fbbf24" : "#374151", cursor:"pointer", marginLeft:12 }}>
                  <Icon name="star" size={14}/>
                </button>
              </div>
              <div style={{ color:"#374151", fontSize:"0.65rem", marginTop:6 }}>
                {new Date(m.createdAt).toLocaleDateString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" })}
              </div>
            </div>
          ))}
          {!messages.length && <div style={{ textAlign:"center", color:"#64748b", padding:"40px 0", fontSize:"0.85rem" }}>No messages yet.</div>}
        </div>
        {selected && (
          <div style={{ background:"rgba(13,13,31,.8)", border:"1px solid rgba(57,255,20,.15)", borderRadius:12, padding:"20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700, fontSize:"1.05rem", marginBottom:4 }}>{selected.name}</div>
                <a href={`mailto:${selected.email}`} style={{ color:"#39ff14", fontSize:"0.78rem", textDecoration:"none" }}>{selected.email}</a>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn small color="red" onClick={() => del(selected._id)}><Icon name="trash" size={13}/></Btn>
                <button onClick={() => setSelected(null)} style={{ background:"rgba(255,255,255,.06)", border:"none", color:"#94a3b8", cursor:"pointer", borderRadius:6, padding:"6px 10px" }}>×</button>
              </div>
            </div>
            {selected.subject && <div style={{ color:"#94a3b8", fontSize:"0.75rem", letterSpacing:"2px", textTransform:"uppercase", marginBottom:12 }}>{selected.subject}</div>}
            <div style={{ color:"#e2e8f0", fontSize:"0.88rem", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{selected.message}</div>
            <div style={{ marginTop:20 }}>
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject||"Your message"}`}
                style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(57,255,20,.12)", border:"1px solid rgba(57,255,20,.3)", color:"#39ff14", padding:"10px 18px", borderRadius:8, textDecoration:"none", fontSize:"0.75rem", fontFamily:"'JetBrains Mono',monospace" }}>
                <Icon name="mail" size={14}/> Reply via Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── OVERVIEW ─────────────────────────────────────────────────────
const Overview = ({ stats }) => (
  <div>
    <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700, marginBottom:24 }}>Overview</h2>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:32 }}>
      <StatCard label="Total Projects" value={stats?.projects} icon="projects" color="#39ff14" />
      <StatCard label="Published Blogs" value={stats?.blogs} icon="blogs" color="#00f5ff" />
      <StatCard label="Total Messages" value={stats?.messages} icon="messages" color="#a78bfa" />
      <StatCard label="Unread Messages" value={stats?.unread} icon="mail" color="#fbbf24" sub="Needs attention" />
    </div>
    <div style={{ background:"rgba(13,13,31,.6)", border:"1px solid rgba(57,255,20,.1)", borderRadius:12, padding:"24px" }}>
      <div style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700, marginBottom:16 }}>Quick Actions</div>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        {[
          { label:"Add Project", icon:"plus", color:"#39ff14" },
          { label:"New Blog Post", icon:"blogs", color:"#00f5ff" },
          { label:"View Messages", icon:"messages", color:"#a78bfa" },
        ].map(a => (
          <div key={a.label} style={{
            background:`${a.color}0d`, border:`1px solid ${a.color}22`, borderRadius:10,
            padding:"14px 20px", display:"flex", alignItems:"center", gap:10, cursor:"pointer",
            color: a.color, fontFamily:"'JetBrains Mono',monospace", fontSize:"0.78rem", letterSpacing:"1px"
          }}>
            <Icon name={a.icon} size={16}/> {a.label}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── SETTINGS PANEL ───────────────────────────────────────────────
const SettingsPanel = ({ toast, username }) => {
  const [form, setForm] = useState({ currentPassword:"", newPassword:"", confirm:"" });
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (form.newPassword !== form.confirm) return toast("Passwords don't match", "error");
    setLoading(true);
    try {
      await api("/auth/change-password", { method:"POST", body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) });
      toast("Password changed successfully!");
      setForm({ currentPassword:"", newPassword:"", confirm:"" });
    } catch (err) { toast(err.message, "error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:500 }}>
      <h2 style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700, marginBottom:24 }}>Settings</h2>
      <div style={{ background:"rgba(13,13,31,.6)", border:"1px solid rgba(57,255,20,.1)", borderRadius:12, padding:"24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, paddingBottom:20, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(57,255,20,.15)", display:"flex", alignItems:"center", justifyContent:"center", color:"#39ff14" }}>
            <Icon name="user" size={22}/>
          </div>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", color:"#e2e8f0", fontWeight:700 }}>{username}</div>
            <div style={{ color:"#39ff14", fontSize:"0.7rem", letterSpacing:"2px" }}>ADMINISTRATOR</div>
          </div>
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", color:"#94a3b8", fontWeight:600, marginBottom:16, fontSize:"0.85rem" }}>Change Password</div>
        <Field label="Current Password"><Input type="password" value={form.currentPassword} onChange={e=>setForm(p=>({...p,currentPassword:e.target.value}))} placeholder="••••••••"/></Field>
        <Field label="New Password"><Input type="password" value={form.newPassword} onChange={e=>setForm(p=>({...p,newPassword:e.target.value}))} placeholder="••••••••"/></Field>
        <Field label="Confirm Password"><Input type="password" value={form.confirm} onChange={e=>setForm(p=>({...p,confirm:e.target.value}))} placeholder="••••••••"/></Field>
        <Btn onClick={changePassword} style={{ marginTop:8 }}>{loading ? "Updating..." : "Update Password"}</Btn>
      </div>
    </div>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────
const Dashboard = ({ username, onLogout }) => {
  const [active, setActive] = useState("overview");
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toasts, toast, remove } = useToast();

  const loadStats = useCallback(async () => {
    try { setStats(await api("/stats")); } catch {}
  }, []);
  useEffect(() => { loadStats(); }, [loadStats]);

  const NAV = [
    { id:"overview", label:"Overview", icon:"dashboard" },
    { id:"projects", label:"Projects", icon:"projects" },
    { id:"blogs", label:"Blogs", icon:"blogs" },
    { id:"messages", label:"Messages", icon:"messages", badge: stats?.unread },
    { id:"settings", label:"Settings", icon:"settings" },
  ];

  const panels = {
    overview: <Overview stats={stats}/>,
    projects: <ProjectsPanel toast={toast}/>,
    blogs: <BlogsPanel toast={toast}/>,
    messages: <MessagesPanel toast={toast} onRead={loadStats}/>,
    settings: <SettingsPanel toast={toast} username={username}/>,
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#060610", fontFamily:"'JetBrains Mono',monospace",
      backgroundImage:"radial-gradient(ellipse at 0% 0%, rgba(57,255,20,.04) 0%, transparent 50%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(57,255,20,.2); border-radius:2px; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #0d0d1f inset !important; -webkit-text-fill-color: #e2e8f0 !important; }
      `}</style>
      <aside style={{ width: sidebarOpen ? 240 : 70, flexShrink:0, background:"rgba(6,6,16,.95)", borderRight:"1px solid rgba(57,255,20,.1)", display:"flex", flexDirection:"column", transition:"width .25s ease", overflow:"hidden", position:"sticky", top:0, height:"100vh" }}>
        <div style={{ padding:"24px 20px", borderBottom:"1px solid rgba(57,255,20,.08)", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.2rem", color:"#39ff14", textShadow:"0 0 20px rgba(57,255,20,.4)", flexShrink:0 }}>
            {sidebarOpen ? <>SR<span style={{color:"#fff"}}>/</span>&gt;T</> : "S"}
          </div>
          {sidebarOpen && <div style={{ color:"#374151", fontSize:"0.6rem", letterSpacing:"2px" }}>ADMIN</div>}
        </div>
        <nav style={{ flex:1, padding:"12px 0", overflowY:"auto" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActive(n.id)} style={{
              width:"100%", background: active===n.id ? "rgba(57,255,20,.1)" : "transparent",
              border:"none", borderLeft: active===n.id ? "2px solid #39ff14" : "2px solid transparent",
              color: active===n.id ? "#39ff14" : "#64748b", cursor:"pointer", padding:"12px 20px",
              display:"flex", alignItems:"center", gap:12, transition:"all .15s",
              fontFamily:"'JetBrains Mono',monospace", fontSize:"0.75rem", letterSpacing:"1px", textTransform:"uppercase"
            }}>
              <span style={{ flexShrink:0 }}><Icon name={n.icon} size={17}/></span>
              {sidebarOpen && (
                <span style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
                  {n.label}
                  {n.badge > 0 && <span style={{ background:"#39ff14", color:"#060610", fontSize:"0.6rem", padding:"1px 6px", borderRadius:20, fontWeight:700 }}>{n.badge}</span>}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding:"12px 0", borderTop:"1px solid rgba(57,255,20,.08)" }}>
          <button onClick={onLogout} style={{ width:"100%", background:"none", border:"none", borderLeft:"2px solid transparent", color:"#64748b", cursor:"pointer", padding:"12px 20px", display:"flex", alignItems:"center", gap:12, fontFamily:"'JetBrains Mono',monospace", fontSize:"0.75rem", letterSpacing:"1px", textTransform:"uppercase", transition:"color .15s" }}
            onMouseEnter={e => e.currentTarget.style.color="#ff6b6b"}
            onMouseLeave={e => e.currentTarget.style.color="#64748b"}>
            <Icon name="logout" size={17}/>
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"auto" }}>
        <header style={{ padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(57,255,20,.08)", background:"rgba(6,6,16,.8)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:10 }}>
          <button onClick={() => setSidebarOpen(p=>!p)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}>
            <Icon name="menu" size={20}/>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#39ff14", boxShadow:"0 0 8px #39ff14" }}/>
            <span style={{ color:"#64748b", fontSize:"0.7rem", letterSpacing:"2px" }}>{username?.toUpperCase()}</span>
          </div>
        </header>
        <main style={{ flex:1, padding:"32px" }}>
          {panels[active]}
        </main>
      </div>
      <Toast toasts={toasts} remove={remove}/>
    </div>
  );
};

// ─── APP ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("admin_token");
    const username = localStorage.getItem("admin_username");
    return token ? { token, username } : null;
  });

  const handleLogin = (username) => {
    localStorage.setItem("admin_username", username);
    setAuth({ token: localStorage.getItem("admin_token"), username });
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_username");
    setAuth(null);
  };

  if (!auth) return <AuthPage onLogin={handleLogin}/>;
  return <Dashboard username={auth.username} onLogout={handleLogout}/>;
}