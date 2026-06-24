import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.username || !form.password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await login(form.username, form.password);
    } catch (e) {
      setError(e.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: "solar:box-minimalistic-broken",
      title: "Stock Visibility",
      text: "Monitor inventory levels, movement, and item availability in real time.",
    },
    {
      icon: "solar:clipboard-check-broken",
      title: "Demand Workflow",
      text: "Create demands, manage approvals, and keep every request traceable.",
    },
    {
      icon: "solar:shield-check-broken",
      title: "Secure Access",
      text: "Role-based access for authorized inventory operation teams.",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        background:
          "radial-gradient(circle at 18% 18%, rgba(91,103,168,0.42), transparent 30%), linear-gradient(135deg, var(--color-black-500) 0%, var(--color-primary-900) 54%, var(--color-secondary-900) 100%)",
        overflow: "hidden",
      }}
    >
      <section
        style={{
          position: "relative",
          padding: "64px 72px",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.16,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 80 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 20,
                display: "grid",
                placeItems: "center",
                background: "var(--color-primary-500)",
                boxShadow: "0 22px 55px rgba(91, 103, 168, 0.38)",
              }}
            >
              <Icon icon="solar:box-minimalistic-broken" width="31" height="31" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Inventory</div>
              <div style={{ fontSize: 13, color: "var(--color-primary-100)" }}>Management System</div>
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--color-primary-50)",
              fontSize: 13,
              fontWeight: 800,
              marginBottom: 22,
            }}
          >
            <Icon icon="solar:verified-check-broken" width="17" height="17" />
            Smart Inventory Control Platform
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(42px, 5vw, 72px)",
              lineHeight: 0.98,
              letterSpacing: "-0.07em",
              maxWidth: 720,
            }}
          >
            Manage every item with clarity and control.
          </h1>

          <p
            style={{
              margin: "24px 0 0",
              maxWidth: 590,
              color: "var(--color-primary-100)",
              fontSize: 17,
              lineHeight: 1.75,
            }}
          >
            Access the dashboard to manage stock levels, demand forms, issue orders,
            gate passes, and inventory audit records from one organized system.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              style={{
                padding: 18,
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(204,208,228,0.14)",
                  color: "var(--color-primary-100)",
                  marginBottom: 14,
                }}
              >
                <Icon icon={feature.icon} width="22" height="22" />
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 14.5 }}>{feature.title}</h3>
              <p style={{ margin: 0, color: "var(--color-primary-100)", fontSize: 12.5, lineHeight: 1.55 }}>
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          placeItems: "center",
          padding: 44,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(22px)",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 480,
            background: "rgba(255,255,255,0.98)",
            borderRadius: 12,
            padding: 36,
            boxShadow: "0 36px 90px rgba(3,0,31,0.32)",
            border: "1px solid rgba(255,255,255,0.74)",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 18,
              display: "grid",
              placeItems: "center",
              background: "var(--color-secondary-50)",
              color: "var(--color-secondary-600)",
              marginBottom: 22,
            }}
          >
            <Icon icon="solar:lock-keyhole-minimalistic-broken" width="27" height="27" />
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 31,
              letterSpacing: "-0.05em",
              color: "var(--text-primary)",
            }}
          >
            Welcome back
          </h2>
          <p style={{ margin: "10px 0 28px", color: "var(--text-muted)", fontSize: 14.5 }}>
            Sign in to continue to the Inventory Management System.
          </p>

          {error && (
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "13px 14px",
                borderRadius: 16,
                background: "var(--color-danger-50)",
                color: "var(--color-danger-700)",
                border: "1px solid var(--color-danger-100)",
                fontSize: 13.5,
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              <Icon icon="solar:danger-triangle-bold" width="19" height="19" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: "grid", gap: 18 }}>
            <LoginField
              label="Username"
              icon="solar:user-rounded-broken"
              value={form.username}
              placeholder="Enter username"
              autoComplete="username"
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            />

            <LoginField
              label="Password"
              icon="solar:lock-password-broken"
              value={form.password}
              placeholder="Enter password"
              autoComplete="current-password"
              type={showPass ? "text" : "password"}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              right={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  style={{
                    width: 36,
                    height: 36,
                    border: "none",
                    borderRadius: 12,
                    background: "transparent",
                    color: "var(--text-muted)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <Icon icon={showPass ? "solar:eye-closed-broken" : "solar:eye-broken"} width="20" height="20" />
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                height: 54,
                border: "none",
                borderRadius: 8,
                background: loading ? "var(--color-primary-300)" : "var(--brand)",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 18px 36px rgba(91,103,168,0.32)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "var(--transition)",
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.35)",
                      borderTopColor: "#ffffff",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <Icon icon="solar:arrow-right-linear" width="19" height="19" />
                </>
              )}
            </button>
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 15,
              borderRadius: 18,
              background: "var(--color-primary-50)",
              color: "var(--text-secondary)",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            <Icon icon="solar:shield-user-broken" width="20" height="20" style={{ color: "var(--brand)", flexShrink: 0 }} />
            <span>Authorized access only. Inventory activities may be monitored for audit and security purposes.</span>
          </div>
        </form>
      </section>
    </main>
  );
}

function LoginField({ label, icon, right, style, ...props }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontSize: 11.5,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon
          icon={icon}
          width="20"
          height="20"
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-primary-400)",
          }}
        />
        <input
          {...props}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 8,
            border: "1.5px solid var(--color-primary-100)",
            background: "var(--color-primary-50)",
            color: "var(--text-primary)",
            padding: right ? "0 54px 0 48px" : "0 16px 0 48px",
            outline: "none",
            fontSize: 14.5,
            fontWeight: 700,
            transition: "var(--transition)",
            ...style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--brand)";
            e.target.style.background = "#ffffff";
            e.target.style.boxShadow = "0 0 0 4px rgba(91,103,168,0.12)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-primary-100)";
            e.target.style.background = "var(--color-primary-50)";
            e.target.style.boxShadow = "none";
          }}
        />
        {right && <div style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)" }}>{right}</div>}
      </div>
    </div>
  );
}
