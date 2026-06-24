import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password) return setError("Enter username and password.");
    setLoading(true); setError("");
    try {
      await login(form.username, form.password);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = { padding: "10px 12px", fontSize: 14, border: "1px solid #ddd", borderRadius: 7,
    outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f5f5f3", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 36, width: 380,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏛️</div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Prison IMS</h1>
          <p style={{ fontSize: 13, color: "#888", margin: "6px 0 0" }}>Inventory Management System</p>
        </div>

        {error && (
          <div style={{ background: "#FCEBEB", color: "#A32D2D", padding: "9px 12px",
            borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Username</label>
            <input style={inp} value={form.username} placeholder="Enter username"
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Password</label>
            <input style={inp} type="password" value={form.password} placeholder="Enter password"
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            style={{ padding: "10px", fontSize: 14, fontWeight: 600, background: "#1a1a1a", color: "#fff",
              border: "none", borderRadius: 7, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 4 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
