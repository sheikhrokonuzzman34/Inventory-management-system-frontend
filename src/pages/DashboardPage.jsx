import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, Card, EmptyState, PageHeader, SectionTitle, Spinner, StatCard, Table, TableRow, TD } from "../components/UI";
import { DEMAND_STATUS_COLORS, DEMAND_STATUS_LABELS, getItemStatus, ITEM_STATUS_COLORS, ITEM_STATUS_LABELS } from "../utils/roles";

export default function DashboardPage({ setPage }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [demands, setDemands] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.getStats(), api.getDemands(), api.getItems()])
      .then(([statsRes, demandsRes, itemsRes]) => {
        if (statsRes.status === "fulfilled") setStats(statsRes.value || {});
        if (demandsRes.status === "fulfilled") setDemands(demandsRes.value || []);
        if (itemsRes.status === "fulfilled") setItems(itemsRes.value || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;

  const recentDemands = demands.slice(0, 6);
  const pendingDemands = demands.filter((d) => ["submitted", "forwarded", "approved_l1", "approved_l2"].includes(d.status));
  const lowStock = items.filter((item) => ["low", "critical"].includes(getItemStatus(item)));
  const totalStockValue = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <div>
      <PageHeader
        icon="solar:widget-5-broken"
        title={`Welcome, ${user?.full_name || user?.username || "User"}`}
        subtitle="Here is the latest overview of your Inventory Management System."
        action={<Button icon="solar:add-square-broken" onClick={() => setPage("new-demand")}>New Demand</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, marginBottom: 22 }}>
        <StatCard title="Total Items" value={stats?.total_items ?? items.length} icon="solar:box-broken" tone="primary" sub="Active inventory records" />
        <StatCard title="Stock Quantity" value={stats?.total_quantity ?? totalStockValue} icon="solar:layers-minimalistic-broken" tone="secondary" sub="Total available quantity" />
        <StatCard title="Pending Demands" value={stats?.pending_demands ?? pendingDemands.length} icon="solar:clipboard-list-broken" tone="warn" sub="Waiting for action" onClick={() => setPage("demands")} />
        <StatCard title="Low Stock" value={stats?.low_stock ?? lowStock.length} icon="solar:danger-triangle-broken" tone="danger" sub="Needs attention" onClick={() => setPage("inventory")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: 18, alignItems: "start" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionTitle icon="solar:clipboard-list-broken">Recent Demand Forms</SectionTitle>
            <Button variant="secondary" size="sm" iconRight="solar:arrow-right-linear" onClick={() => setPage("demands")}>View All</Button>
          </div>

          {recentDemands.length === 0 ? (
            <EmptyState message="No demands yet" sub="Create a new demand to start an inventory request workflow." icon="solar:clipboard-remove-broken" />
          ) : (
            <Table headers={["Demand", "Department", "Priority", "Status", "Requested By"]}>
              {recentDemands.map((d) => {
                const sc = DEMAND_STATUS_COLORS[d.status] || {};
                return (
                  <TableRow key={d.id} onClick={() => setPage("demands")}>
                    <TD style={{ fontWeight: 800 }}>#{d.id}</TD>
                    <TD>{d.department || "—"}</TD>
                    <TD style={{ textTransform: "capitalize" }}>{d.priority || "normal"}</TD>
                    <TD><Badge label={DEMAND_STATUS_LABELS[d.status] || d.status} bg={sc.bg} color={sc.color} /></TD>
                    <TD>{d.requester?.full_name || d.requester?.username || "—"}</TD>
                  </TableRow>
                );
              })}
            </Table>
          )}
        </Card>

        <div style={{ display: "grid", gap: 18 }}>
          <Card>
            <SectionTitle icon="solar:bolt-circle-broken">Quick Actions</SectionTitle>
            <div style={{ display: "grid", gap: 10 }}>
              <QuickAction icon="solar:add-square-broken" label="Create Demand" sub="Request items from inventory" onClick={() => setPage("new-demand")} />
              <QuickAction icon="solar:box-broken" label="Manage Inventory" sub="View and update items" onClick={() => setPage("inventory")} />
              <QuickAction icon="solar:ticket-sale-broken" label="Gate Passes" sub="Track item withdrawal" onClick={() => setPage("gate-passes")} />
            </div>
          </Card>

          <Card>
            <SectionTitle icon="solar:danger-triangle-broken">Stock Alerts</SectionTitle>
            {lowStock.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--color-success-700)", fontWeight: 800 }}>
                <Icon icon="solar:check-circle-bold" width="20" height="20" />
                All stock levels look good.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {lowStock.slice(0, 6).map((item) => {
                  const status = getItemStatus(item);
                  const sc = ITEM_STATUS_COLORS[status];
                  return (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5 }}>{item.name}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{item.quantity} {item.unit} left</div>
                      </div>
                      <Badge label={ITEM_STATUS_LABELS[status]} bg={sc.bg} color={sc.color} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: 14,
        borderRadius: 16,
        border: "1px solid var(--border-soft)",
        background: "var(--color-primary-50)",
        cursor: "pointer",
        textAlign: "left",
        transition: "var(--transition)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-secondary-50)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-primary-50)")}
    >
      <span style={{ width: 38, height: 38, borderRadius: 14, display: "grid", placeItems: "center", background: "#ffffff", color: "var(--brand)", flexShrink: 0 }}>
        <Icon icon={icon} width="21" height="21" />
      </span>
      <span>
        <span style={{ display: "block", fontWeight: 800, color: "var(--text-primary)" }}>{label}</span>
        <span style={{ display: "block", color: "var(--text-muted)", fontSize: 12.5, marginTop: 2 }}>{sub}</span>
      </span>
    </button>
  );
}
