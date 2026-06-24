import React from "react";

export function Badge({ label, bg, color, style = {} }) {
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, padding: "2px 9px",
      borderRadius: 20, background: bg, color, whiteSpace: "nowrap", ...style }}>
      {label}
    </span>
  );
}

export function Button({ children, onClick, variant = "primary", size = "md", disabled, style = {} }) {
  const base = { cursor: disabled ? "not-allowed" : "pointer", borderRadius: 6, fontWeight: 500,
    border: "none", transition: "opacity .15s", opacity: disabled ? 0.6 : 1, ...style };
  const variants = {
    primary:  { background: "#1a1a1a", color: "#fff", padding: size === "sm" ? "5px 12px" : "8px 18px", fontSize: size === "sm" ? 12 : 14 },
    secondary:{ background: "transparent", color: "#1a1a1a", border: "1px solid #ddd", padding: size === "sm" ? "4px 11px" : "7px 17px", fontSize: size === "sm" ? 12 : 14 },
    danger:   { background: "transparent", color: "#A32D2D", border: "1px solid #f0c0c0", padding: size === "sm" ? "4px 11px" : "7px 17px", fontSize: size === "sm" ? 12 : 14 },
    success:  { background: "#3B6D11", color: "#fff", padding: size === "sm" ? "5px 12px" : "8px 18px", fontSize: size === "sm" ? 12 : 14 },
  };
  return <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: "#666" }}>{label}</label>}
      <input style={{ padding: "8px 10px", fontSize: 14, border: `1px solid ${error ? "#f0c0c0" : "#ddd"}`,
        borderRadius: 6, outline: "none", ...style }} {...props} />
      {error && <span style={{ fontSize: 11, color: "#A32D2D" }}>{error}</span>}
    </div>
  );
}

export function Select({ label, children, style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: "#666" }}>{label}</label>}
      <select style={{ padding: "8px 10px", fontSize: 14, border: "1px solid #ddd",
        borderRadius: 6, outline: "none", background: "#fff", ...style }} {...props}>
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: "#666" }}>{label}</label>}
      <textarea style={{ padding: "8px 10px", fontSize: 14, border: "1px solid #ddd",
        borderRadius: 6, outline: "none", resize: "vertical", minHeight: 72, ...style }} {...props} />
    </div>
  );
}

export function Card({ children, style = {} }) {
  return <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 20, ...style }}>{children}</div>;
}

export function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 200 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, width, maxWidth: "95vw",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 500, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#888", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;
  const colors = {
    ok:   { bg: "#EAF3DE", color: "#3B6D11" },
    warn: { bg: "#FAEEDA", color: "#854F0B" },
    err:  { bg: "#FCEBEB", color: "#A32D2D" },
  };
  const c = colors[toast.type] || colors.ok;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, background: c.bg, color: c.color,
      padding: "10px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500,
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 500, maxWidth: 340 }}>
      {toast.msg}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      marginBottom: 24, borderBottom: "1px solid #eee", paddingBottom: 16 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ message = "No records found." }) {
  return <div style={{ padding: "48px 0", textAlign: "center", color: "#aaa", fontSize: 14 }}>{message}</div>;
}

export function Spinner() {
  return <div style={{ padding: "48px 0", textAlign: "center", color: "#aaa", fontSize: 14 }}>Loading…</div>;
}

export function StatusTimeline({ steps }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", marginTop: 4,
              background: s.done ? "#3B6D11" : s.active ? "#185FA5" : "#ddd", flexShrink: 0 }} />
            {i < steps.length - 1 && <div style={{ width: 2, height: 28, background: "#eee" }} />}
          </div>
          <div style={{ paddingBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: s.done ? "#3B6D11" : s.active ? "#185FA5" : "#aaa" }}>{s.label}</div>
            {s.meta && <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{s.meta}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
