import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { ROLE_LABELS, ROLES } from "../utils/roles";
import { Badge } from "./UI";

const NAV_BY_ROLE = {
  [ROLES.ADMIN]:  [{ label: "Dashboard", page: "dashboard" }, { label: "Inventory", page: "inventory" }, { label: "Users", page: "users" }, { label: "Demands", page: "demands" }, { label: "Audit Log", page: "audit" }],
  [ROLES.USER]:   [{ label: "Dashboard", page: "dashboard" }, { label: "My Demands", page: "demands" }, { label: "New Demand", page: "new-demand" }],
  [ROLES.DC]:     [{ label: "Dashboard", page: "dashboard" }, { label: "Demands", page: "demands" }, { label: "Issue Orders", page: "issue-orders" }],
  [ROLES.L1]:     [{ label: "Dashboard", page: "dashboard" }, { label: "Approvals", page: "approvals" }],
  [ROLES.L2]:     [{ label: "Dashboard", page: "dashboard" }, { label: "Approvals", page: "approvals" }],
  [ROLES.L3]:     [{ label: "Dashboard", page: "dashboard" }, { label: "Approvals", page: "approvals" }],
  [ROLES.SC]:     [{ label: "Dashboard", page: "dashboard" }, { label: "Inventory", page: "inventory" }, { label: "Issue Orders", page: "issue-orders" }, { label: "Gate Passes", page: "gate-passes" }],
};

export default function Layout({ currentPage, setPage, children }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

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

  const unread = notifications.filter((n) => !n.is_read).length;
  const navItems = NAV_BY_ROLE[user?.role] || [];

  const markAllRead = () => {
    api.markAllRead().then(fetchNotifications);
    setShowNotif(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#1a1a1a", color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid #2e2e2e" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>🏛️ Prison IMS</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>Inventory Management</div>
        </div>
        <nav style={{ flex: 1, padding: "8px 0" }}>
          {navItems.map((item) => (
            <button key={item.page} onClick={() => setPage(item.page)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 16px",
                background: currentPage === item.page ? "#2e2e2e" : "transparent",
                color: currentPage === item.page ? "#fff" : "#aaa",
                border: "none", cursor: "pointer", fontSize: 14,
                borderLeft: currentPage === item.page ? "2px solid #fff" : "2px solid transparent" }}>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #2e2e2e" }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>{user?.full_name}</div>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>{ROLE_LABELS[user?.role]}</div>
          <button onClick={logout} style={{ fontSize: 12, color: "#888", background: "none", border: "1px solid #333",
            borderRadius: 5, padding: "4px 10px", cursor: "pointer", width: "100%" }}>
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <div style={{ height: 52, background: "#fff", borderBottom: "1px solid #eee", display: "flex",
          alignItems: "center", justifyContent: "flex-end", padding: "0 24px", gap: 12, flexShrink: 0 }}>
          <div ref={notifRef} style={{ position: "relative" }}>
            <button onClick={() => setShowNotif((v) => !v)}
              style={{ background: "none", border: "1px solid #eee", borderRadius: 6, padding: "5px 10px",
                cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              🔔 {unread > 0 && <span style={{ background: "#A32D2D", color: "#fff", borderRadius: 10,
                fontSize: 10, padding: "1px 5px", fontWeight: 700 }}>{unread}</span>}
            </button>
            {showNotif && (
              <div style={{ position: "absolute", right: 0, top: "110%", width: 340, background: "#fff",
                border: "1px solid #eee", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 300, maxHeight: 420, overflowY: "auto" }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #eee", display: "flex",
                  justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>Notifications</span>
                  {unread > 0 && <button onClick={markAllRead}
                    style={{ fontSize: 11, background: "none", border: "none", cursor: "pointer", color: "#185FA5" }}>
                    Mark all read
                  </button>}
                </div>
                {notifications.length === 0 && (
                  <div style={{ padding: 20, textAlign: "center", color: "#aaa", fontSize: 13 }}>No notifications</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} onClick={() => { api.markRead(n.id).then(fetchNotifications); }}
                    style={{ padding: "10px 14px", borderBottom: "1px solid #f5f5f5", cursor: "pointer",
                      background: n.is_read ? "#fff" : "#f8f9ff" }}>
                    <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600, color: "#1a1a1a" }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span style={{ fontSize: 13, color: "#888" }}>{user?.department}</span>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
