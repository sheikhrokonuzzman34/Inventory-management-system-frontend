import React, { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, PageHeader, Modal, Spinner, EmptyState } from "../components/UI";
import { DEMAND_STATUS_COLORS, DEMAND_STATUS_LABELS, ROLES } from "../utils/roles";

export default function IssueOrdersPage({ showToast }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    api.getIssueOrders().then(setOrders).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Issue Orders" subtitle="View all created issue orders" />

      {orders.length === 0 ? <EmptyState message="No issue orders yet." /> : (
        <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Order #", "Demand Form", "Department", "Requester", "Created By", "Date", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "#888",
                    borderBottom: "1px solid #eee", textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const dstatus = o.demand?.status;
                const sc = DEMAND_STATUS_COLORS[dstatus] || {};
                return (
                  <tr key={o.id} style={{ background: "#fff" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", fontWeight: 500 }}>{o.order_number}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{o.demand?.form_number}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{o.demand?.department}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{o.demand?.requester?.full_name}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{o.created_by_user?.full_name}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", color: "#aaa", fontSize: 12 }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <Badge label={DEMAND_STATUS_LABELS[dstatus]} bg={sc.bg} color={sc.color} />
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <button onClick={() => setSelected(o)}
                        style={{ fontSize: 12, padding: "3px 10px", border: "1px solid #ddd",
                          borderRadius: 5, background: "transparent", cursor: "pointer" }}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal title={`Issue Order — ${selected.order_number}`} onClose={() => setSelected(null)} width={580}>
          <IssueOrderDetail order={selected} user={user} showToast={showToast} onClose={() => { setSelected(null); load(); }} />
        </Modal>
      )}
    </div>
  );
}

function IssueOrderDetail({ order, user, showToast, onClose }) {
  const demand = order.demand;
  const [creating, setCreating] = useState(false);
  const [lineQtys, setLineQtys] = useState(() => {
    const init = {};
    demand?.lines?.forEach((l) => { init[l.id] = l.qty_approved ?? l.qty_requested; });
    return init;
  });
  const [notes, setNotes] = useState("");

  const hasGatePass = !!order.gate_pass;
  const canIssueGatePass = user?.role === ROLES.SC && !hasGatePass;

  const handleCreateGatePass = async () => {
    setCreating(true);
    try {
      await api.createGatePass({
        issue_order_id: order.id,
        notes,
        line_quantities: Object.entries(lineQtys).map(([line_id, qty_issued]) => ({
          line_id: Number(line_id), qty_issued: Number(qty_issued),
        })),
      });
      showToast("Gate pass issued. All parties notified.");
      onClose();
    } catch (e) { showToast(e.message, "err"); }
    finally { setCreating(false); }
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, marginBottom: 16 }}>
        <div><span style={{ color: "#888" }}>Order #:</span> <strong>{order.order_number}</strong></div>
        <div><span style={{ color: "#888" }}>Demand:</span> {demand?.form_number}</div>
        <div><span style={{ color: "#888" }}>Requester:</span> {demand?.requester?.full_name}</div>
        <div><span style={{ color: "#888" }}>Department:</span> {demand?.department}</div>
        {order.notes && <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#888" }}>Notes:</span> {order.notes}</div>}
      </div>

      <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Items {canIssueGatePass && "— Set Issue Quantities"}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: "#fafafa" }}>
            {["Item", "Approved", "To Issue"].map((h) => (
              <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: 11, color: "#888",
                borderBottom: "1px solid #eee", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {demand?.lines?.map((line) => (
            <tr key={line.id}>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>{line.item?.name}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>{line.qty_approved ?? line.qty_requested} {line.item?.unit}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>
                {!canIssueGatePass ? (
                  <span>{line.qty_issued ?? line.qty_approved ?? line.qty_requested} {line.item?.unit}</span>
                ) : (
                  <input type="number" min={0} max={line.qty_approved ?? line.qty_requested}
                    value={lineQtys[line.id] ?? ""}
                    onChange={(e) => setLineQtys((q) => ({ ...q, [line.id]: e.target.value }))}
                    style={{ width: 72, padding: "4px 6px", fontSize: 12, border: "1px solid #ddd", borderRadius: 4 }} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hasGatePass ? (
        <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 12px", borderRadius: 7, fontSize: 13 }}>
          ✓ Gate Pass <strong>{order.gate_pass?.pass_number}</strong> has been issued.
          Status: {order.gate_pass?.status}
        </div>
      ) : canIssueGatePass ? (
        <div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for gate pass…" rows={2}
            style={{ width: "100%", padding: "8px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6,
              outline: "none", resize: "none", marginBottom: 10, boxSizing: "border-box" }} />
          <Button onClick={handleCreateGatePass} disabled={creating}>
            {creating ? "Issuing…" : "Issue Gate Pass"}
          </Button>
        </div>
      ) : (
        <div style={{ background: "#F1EFE8", color: "#5F5E5A", padding: "10px 12px", borderRadius: 7, fontSize: 13 }}>
          Waiting for Store Controller to issue the gate pass.
        </div>
      )}
    </div>
  );
}
