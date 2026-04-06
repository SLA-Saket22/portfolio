import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Bebas+Neue&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .cf-root {
    min-height: 100vh;
    background: #080810;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    font-family: 'Space Mono', monospace;
    position: relative;
    overflow: hidden;
  }

  .cf-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 10% 20%, rgba(57,255,20,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 90% 80%, rgba(0,200,255,0.06) 0%, transparent 60%);
    pointer-events: none;
  }

  .cf-grid-overlay {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(57,255,20,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(57,255,20,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  .cf-card {
    width: 100%;
    max-width: 620px;
    position: relative;
    z-index: 1;
  }

  .cf-header {
    margin-bottom: 40px;
  }

  .cf-tag {
    font-family: 'Space Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 4px;
    color: #39ff14;
    text-transform: uppercase;
    opacity: 0.8;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .cf-tag::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background: #39ff14;
  }

  .cf-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 10vw, 5.5rem);
    color: #f0f4f8;
    line-height: 0.9;
    letter-spacing: 2px;
    margin-bottom: 16px;
  }

  .cf-title span {
    color: #39ff14;
    display: block;
  }

  .cf-subtitle {
    font-size: 0.72rem;
    color: #4a5568;
    letter-spacing: 1px;
    line-height: 1.7;
  }

  .cf-form {
    display: flex;
    flex-direction: column;
    gap: 0;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 2px;
    overflow: hidden;
    background: rgba(255,255,255,0.02);
  }

  .cf-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .cf-field {
    position: relative;
    border-right: 1px solid rgba(255,255,255,0.06);
  }

  .cf-field:last-child {
    border-right: none;
  }

  .cf-field-single {
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .cf-field-last {
    border-bottom: none;
  }

  .cf-label {
    display: block;
    font-size: 0.55rem;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #2d3748;
    padding: 14px 20px 0;
    transition: color 0.2s;
  }

  .cf-field:focus-within .cf-label {
    color: #39ff14;
  }

  .cf-input {
    display: block;
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #e2e8f0;
    font-family: 'Space Mono', monospace;
    font-size: 0.82rem;
    padding: 8px 20px 16px;
    line-height: 1.5;
    transition: background 0.2s;
  }

  .cf-input::placeholder {
    color: #2d3748;
    font-style: italic;
  }

  .cf-textarea {
    resize: none;
    min-height: 130px;
  }

  .cf-field:focus-within {
    background: rgba(57,255,20,0.02);
  }

  .cf-focus-line {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #39ff14, #00c8ff);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  .cf-field:focus-within .cf-focus-line {
    transform: scaleX(1);
  }

  .cf-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
    background: rgba(0,0,0,0.2);
    gap: 16px;
  }

  .cf-hint {
    font-size: 0.6rem;
    color: #2d3748;
    letter-spacing: 1px;
  }

  .cf-btn {
    background: #39ff14;
    color: #060610;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1rem;
    letter-spacing: 3px;
    padding: 12px 32px;
    border: none;
    cursor: pointer;
    border-radius: 1px;
    transition: all 0.2s;
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }

  .cf-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.15);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .cf-btn:hover::after { opacity: 1; }
  .cf-btn:active { transform: scale(0.98); }

  .cf-btn:disabled {
    background: rgba(57,255,20,0.3);
    cursor: default;
  }

  .cf-btn:disabled::after { display: none; }

  .cf-error {
    margin: 0 0 0 0;
    padding: 12px 20px;
    background: rgba(255,59,48,0.07);
    border-bottom: 1px solid rgba(255,59,48,0.2);
    color: #ff6b6b;
    font-size: 0.7rem;
    letter-spacing: 1px;
  }

  .cf-success {
    text-align: center;
    padding: 60px 40px;
    border: 1px solid rgba(57,255,20,0.15);
    border-radius: 2px;
    background: rgba(57,255,20,0.03);
    position: relative;
    overflow: hidden;
  }

  .cf-success::before {
    content: 'SENT';
    position: absolute;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14rem;
    color: rgba(57,255,20,0.03);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    letter-spacing: 10px;
    white-space: nowrap;
  }

  .cf-success-icon {
    width: 56px;
    height: 56px;
    border: 2px solid #39ff14;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    color: #39ff14;
    font-size: 1.4rem;
  }

  .cf-success-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.5rem;
    color: #39ff14;
    letter-spacing: 4px;
    margin-bottom: 10px;
  }

  .cf-success-sub {
    color: #4a5568;
    font-size: 0.72rem;
    letter-spacing: 1px;
    margin-bottom: 32px;
    line-height: 1.8;
  }

  .cf-success-btn {
    background: transparent;
    border: 1px solid rgba(57,255,20,0.3);
    color: #39ff14;
    font-family: 'Space Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 3px;
    padding: 12px 28px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
  }

  .cf-success-btn:hover {
    background: rgba(57,255,20,0.08);
    border-color: rgba(57,255,20,0.6);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .cf-card { animation: fadeUp 0.5s ease both; }
`;

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  const update = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <>
      <style>{styles}</style>
      <div className="cf-root">
        <div className="cf-grid-overlay" />
        <div className="cf-card">
          <div className="cf-header">
            <div className="cf-tag">Get in touch</div>
            <h1 className="cf-title">
              Let's make<span>something.</span>
            </h1>
            <p className="cf-subtitle">
              Drop me a message — I'll respond within 24 hours.
            </p>
          </div>

          {status === "success" ? (
            <div className="cf-success">
              <div className="cf-success-icon">✓</div>
              <div className="cf-success-title">Message Sent</div>
              <p className="cf-success-sub">
                Got it. I'll be in touch soon.
              </p>
              <button className="cf-success-btn" onClick={() => setStatus(null)}>
                Send another
              </button>
            </div>
          ) : (
            <form className="cf-form" onSubmit={handleSubmit}>
              {error && <div className="cf-error">⚠ {error}</div>}

              <div className="cf-row">
                <div className="cf-field">
                  <label className="cf-label">Name</label>
                  <input className="cf-input" type="text" required placeholder="Your name" value={form.name} onChange={update("name")} />
                  <div className="cf-focus-line" />
                </div>
                <div className="cf-field">
                  <label className="cf-label">Email</label>
                  <input className="cf-input" type="email" required placeholder="your@email.com" value={form.email} onChange={update("email")} />
                  <div className="cf-focus-line" />
                </div>
              </div>

              <div className="cf-field cf-field-single">
                <label className="cf-label">Subject</label>
                <input className="cf-input" type="text" placeholder="What's this about?" value={form.subject} onChange={update("subject")} />
                <div className="cf-focus-line" />
              </div>

              <div className="cf-field cf-field-last">
                <label className="cf-label">Message</label>
                <textarea className="cf-input cf-textarea" required placeholder="Tell me about your project..." value={form.message} onChange={update("message")} />
                <div className="cf-focus-line" />
              </div>

              <div className="cf-footer">
                <span className="cf-hint">// All fields marked required *</span>
                <button className="cf-btn" type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Sending..." : "Send Message →"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}