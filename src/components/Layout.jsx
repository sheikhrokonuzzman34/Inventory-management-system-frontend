import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { Button } from "./UI";
import { ROLE_LABELS, ROLES } from "../utils/roles";

const NAV_BY_ROLE = {
  [ROLES.ADMIN]: [
    { key: "dashboard", label: "Dashboard", icon: "solar:widget-5-broken" },
    { key: "inventory", label: "Inventory", icon: "solar:box-broken" },
    { key: "users", label: "Users", icon: "solar:users-group-rounded-broken" },
    { key: "demands", label: "Demands", icon: "solar:clipboard-list-broken" },
    { key: "audit", label: "Audit Log", icon: "solar:history-broken" },
  ],
  [ROLES.USER]: [
    { key: "dashboard", label: "Dashboard", icon: "solar:widget-5-broken" },
    { key: "demands", label: "My Demands", icon: "solar:clipboard-list-broken" },
    { key: "new-demand", label: "New Demand", icon: "solar:add-square-broken" },
  ],
  [ROLES.DC]: [
    { key: "dashboard", label: "Dashboard", icon: "solar:widget-5-broken" },
    { key: "demands", label: "Demands", icon: "solar:clipboard-list-broken" },
    { key: "issue-orders", label: "Issue Orders", icon: "solar:document-add-broken" },
  ],
  [ROLES.L1]: [
    { key: "dashboard", label: "Dashboard", icon: "solar:widget-5-broken" },
    { key: "approvals", label: "Approvals", icon: "solar:checklist-minimalistic-broken" },
  ],
  [ROLES.L2]: [
    { key: "dashboard", label: "Dashboard", icon: "solar:widget-5-broken" },
    { key: "approvals", label: "Approvals", icon: "solar:checklist-minimalistic-broken" },
  ],
  [ROLES.L3]: [
    { key: "dashboard", label: "Dashboard", icon: "solar:widget-5-broken" },
    { key: "approvals", label: "Approvals", icon: "solar:checklist-minimalistic-broken" },
  ],
  [ROLES.SC]: [
    { key: "dashboard", label: "Dashboard", icon: "solar:widget-5-broken" },
    { key: "inventory", label: "Inventory", icon: "solar:box-broken" },
    { key: "issue-orders", label: "Issue Orders", icon: "solar:document-add-broken" },
    { key: "gate-passes", label: "Gate Passes", icon: "solar:ticket-sale-broken" },
  ],
};

const pageTitles = {
  dashboard: "Dashboard",
  "new-demand": "New Demand",
  demands: "Demand Forms",
  approvals: "Approvals",
  "issue-orders": "Issue Orders",
  "gate-passes": "Gate Passes",
  inventory: "Inventory",
  users: "Users",
  audit: "Audit Log",
};

export default function Layout({ children, currentPage, setPage }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const navItems = NAV_BY_ROLE[user?.role] || NAV_BY_ROLE[ROLES.USER];
  const unread = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = () => {
    api.getNotifications().then(setNotifications).catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => {
    api.markAllRead().then(fetchNotifications).catch(() => {});
    setShowNotif(false);
  };

  const markRead = (id) => {
    api.markRead(id).then(fetchNotifications).catch(() => {});
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        background: "var(--layout-bg)",
      }}
    >
      <aside
        style={{
          background:
            "linear-gradient(180deg, var(--color-black-500) 0%, var(--color-black-700) 100%)",
          color: "#ffffff",
          padding: 20,
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "18px 0 50px rgba(3, 0, 31, 0.18)",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 6px 18px" }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: "var(--color-primary-500)",
              boxShadow: "0 16px 34px rgba(91, 103, 168, 0.34)",
            }}
          >
            <Icon icon="solar:box-minimalistic-broken" width="26" height="26" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.12 }}>Inventory</div>
            <div style={{ fontSize: 12, color: "var(--color-primary-100)", marginTop: 3 }}>Management System</div>
          </div>
        </div>

        <nav style={{ display: "grid", gap: 6 }}>
          {navItems.map((item) => {
            const active = item.key === currentPage;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                style={{
                  height: 44,
                  width: "100%",
                  border: active ? "1px solid var(--color-primary-700)" : "1px solid transparent",
                  borderRadius: 8,
                  background: active ? "rgba(91, 103, 168, 0.24)" : "transparent",
                  color: active ? "#ffffff" : "var(--color-black-100)",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "0 13px",
                  cursor: "pointer",
                  fontWeight: active ? 800 : 650,
                  textAlign: "left",
                  transition: "var(--transition)",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon icon={item.icon} width="20" height="20" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            padding: 14,
            borderRadius: 8,
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            position: "absolute",
            bottom: 10
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 13,
                display: "grid",
                placeItems: "center",
                background: "var(--color-secondary-500)",
                fontWeight: 800,
              }}
            >
              {(user?.full_name || user?.username || "U").slice(0, 1).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.full_name || user?.username || "User"}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--color-primary-100)", marginTop: 2 }}>
                {ROLE_LABELS[user?.role] || user?.role || "Authorized User"}
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon="solar:logout-2-broken"
            onClick={logout}
            style={{ width: "100%", background: "#ffffff" }}
          >
            Logout
          </Button>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <header
          style={{
            height: 76,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 30px",
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border-soft)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 800 }}>IMS CONTROL PANEL</div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em" }}>
              {pageTitles[currentPage] || "Dashboard"}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotif((v) => !v)}
                style={{
                  height: 40,
                  minWidth: 44,
                  borderRadius: 999,
                  border: "1px solid var(--color-primary-100)",
                  background: "var(--surface)",
                  color: "var(--color-primary-700)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontWeight: 800,    
                  position: "relative",
                }}
              >
                <Icon icon="solar:bell-broken" width="20" height="20" />
                {unread > 0 && (
                  <span style={{ background: "var(--color-danger-500)", color: "#fff", borderRadius: 999, fontSize: 11, padding: "1px 5px",  position: "absolute",
                  top: 4,
                  right: 5 }}>
                    {unread}
                  </span>
                )}
              </button>

              {showNotif && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 10px)",
                    width: 370,
                    maxHeight: 430,
                    overflowY: "auto",
                    background: "var(--surface)",
                    border: "1px solid var(--color-primary-100)",
                    borderRadius: 18,
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 200,
                  }}
                >
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>Notifications</strong>
                    {unread > 0 && (
                      <button onClick={markAllRead} style={{ border: 0, background: "transparent", color: "var(--color-primary-600)", cursor: "pointer", fontWeight: 800, fontSize: 12 }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontWeight: 700 }}>No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "12px 16px",
                          border: 0,
                          borderBottom: "1px solid var(--border-soft)",
                          background: n.is_read ? "#fff" : "var(--color-info-50)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontWeight: n.is_read ? 700 : 900, color: "var(--text-primary)", fontSize: 13.5 }}>{n.title}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: 12.5, marginTop: 4, lineHeight: 1.45 }}>{n.message}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 11.5, marginTop: 5 }}>{formatDateTime(n.created_at)}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 999,
                background: "var(--color-primary-50)",
                color: "var(--color-primary-700)",
                fontWeight: 800,
                fontSize: 12.5,
              }}
            >
              <Icon icon="solar:shield-check-broken" width="18" height="18" />
              Secure Inventory Access
            </div>
          </div>
        </header>
        <section className="page-enter">{children}</section>
      </main>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}
