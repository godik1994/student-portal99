import React, { useState } from "react";
import { supabase } from "./supabaseClient";

const ACCENT = "#5B5FEF";
const INK = "#1A1B2E";
const MUTED = "#8A8D9B";
const BORDER = "#ECEDF3";

const inputStyle = {
  width: "100%",
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  color: INK,
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default function Login() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        setInfo("Перевір пошту, щоб підтвердити акаунт, потім увійди.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || "Щось пішло не так.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F7F8FC",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ width: 360, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: ACCENT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
            S
          </div>
          <div style={{ fontWeight: 700, color: INK, fontSize: 16 }}>Student Portal</div>
        </div>

        <div style={{ display: "flex", background: "#F2F3F8", borderRadius: 8, padding: 3, marginBottom: 20 }}>
          {[
            ["login", "Увійти"],
            ["signup", "Зареєструватись"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={{
                flex: 1,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                padding: "7px 0",
                borderRadius: 6,
                background: mode === key ? "#fff" : "transparent",
                color: mode === key ? ACCENT : MUTED,
                boxShadow: mode === key ? "0 1px 2px rgba(20,20,43,0.08)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input style={inputStyle} placeholder="Ім'я" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={inputStyle} type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          {error && <div style={{ color: "#D14343", fontSize: 13 }}>{error}</div>}
          {info && <div style={{ color: "#1E9E52", fontSize: 13 }}>{info}</div>}

          <button
            type="submit"
            disabled={busy}
            style={{
              background: ACCENT,
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {busy ? "Хвилинку…" : mode === "signup" ? "Створити акаунт" : "Увійти"}
          </button>
        </form>

        {mode === "signup" && (
          <p style={{ color: MUTED, fontSize: 12, marginTop: 14, lineHeight: 1.5 }}>
            Перший, хто зареєструється, автоматично стає викладачем. Учні реєструються після — якщо вчителька вже
            додала їхній email у список учнів, їх підключить автоматично.
          </p>
        )}
      </div>
    </div>
  );
}
