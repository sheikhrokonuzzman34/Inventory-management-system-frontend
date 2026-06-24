import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { Card, Spinner } from "../components/UI";
import { ROLES, DEMAND_STATUS_LABELS, DEMAND_STATUS_COLORS } from "../utils/roles";
import { Badge } from "../components/UI";

export default function DashboardPage({ setPage }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      [ROLES.ADMIN, ROLES.SC, ROLES.DC].includes(user?.role) ? api.getStats() : Promise.resolve(null),
      api.getDemands(),
    ]).then(([s, d]) => { setStats(s); setDemands(d); }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;

  const recent = demands.slice(0, 5);
  const pending = demands.filter((d) =>
    ["submitted", "forwarded", "approved_l1", "approved_l2", "issue_order_created", "gate_pass_issued"].includes(d.status)
  ).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Welcome, {user?.full_name}</h1>
        <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>{user?.department}</p>
      </div>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Items", value: stats.total, color: "inherit" },
            { label: "In Stock",    value: stats.in_stock,  color: "#3B6D11" },
            { label: "Low Stock",   value: stats.low_stock, color: "#854F0B" },
            { label: "Critical",    value: stats.critical,  color: "#A32D2D" },
          ].map((c) => (
            <Card key={c.label} style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 26, fontWeight: 500, color: c.color }}>{c.value}</div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: stats ? "1fr 1fr" : "1fr", gap: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Recent Demands</span>
            <button onClick={() => setPage("demands")}
              style={{ fontSize: 12, color: "#185FA5", background: "none", border: "none", cursor: "pointer" }}>
              View all →
            </button>
          </div>
          {pending > 0 && (
            <div style={{ background: "#E6F1FB", color: "#185FA5", borderRadius: 6, padding: "6px 10px",
              fontSize: 12, marginBottom: 12 }}>
              {pending} demand{pending > 1 ? "s" : ""} require your attention
            </div>
          )}
          {recent.length === 0 && <div style={{ color: "#aaa", fontSize: 13 }}>No demands yet.</div>}
          {recent.map((d) => {
            const sc = DEMAND_STATUS_COLORS[d.status] || {};
            return (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{d.form_number}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>{d.department} · {d.priority}</div>
                </div>
                <Badge label={DEMAND_STATUS_LABELS[d.status]} bg={sc.bg} color={sc.color} />
              </div>
            );
          })}
        </Card>

        {stats && (
          <Card>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {user?.role === ROLES.USER && (
                <button onClick={() => setPage("new-demand")}
                  style={{ padding: "10px 14px", background: "#1a1a1a", color: "#fff", border: "none",
                    borderRadius: 7, cursor: "pointer", fontSize: 13, textAlign: "left" }}>
                  + Submit New Demand
                </button>
              )}
              {[ROLES.ADMIN, ROLES.SC].includes(user?.role) && (
                <button onClick={() => setPage("inventory")}
                  style={{ padding: "10px 14px", background: "#1a1a1a", color: "#fff", border: "none",
                    borderRadius: 7, cursor: "pointer", fontSize: 13, textAlign: "left" }}>
                  📦 View Inventory
                </button>
              )}
              {user?.role === ROLES.DC && (
                <button onClick={() => setPage("issue-orders")}
                  style={{ padding: "10px 14px", background: "#1a1a1a", color: "#fff", border: "none",
                    borderRadius: 7, cursor: "pointer", fontSize: 13, textAlign: "left" }}>
                  📋 Manage Issue Orders
                </button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
