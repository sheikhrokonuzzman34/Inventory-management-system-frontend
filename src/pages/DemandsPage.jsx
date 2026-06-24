import React, { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, Card, PageHeader, Modal, Select, Textarea, Spinner, EmptyState, StatusTimeline } from "../components/UI";
import { ROLES, DEMAND_STATUS_LABELS, DEMAND_STATUS_COLORS, PRIORITY_COLORS, CAT_COLORS } from "../utils/roles";

function DemandDetail({ demand, onAction, user, showToast, onClose }) {
  const [dcList, setDcList] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [qtyApproved, setQtyApproved] = useState({});
  const [acting, setActing] = useState(false);

  const status = demand.status;
  const role = user.role;

  useEffect(() => {
    if (role === ROLES.DC) api.getUsers("demand_controller").then(setDcList);
    // Pre-fill qty_approved with qty_requested
    const init = {};
    demand.lines.forEach((l) => { init[l.id] = l.qty_approved ?? l.qty_requested; });
    setQtyApproved(init);
  }, []);

  const act = async (action) => {
    setActing(true);
    try { await onAction(demand.id, action, remarks, qtyApproved); onClose(); }
    catch (e) { showToast(e.message, "err"); }
    finally { setActing(false); }
  };

  const sc = DEMAND_STATUS_COLORS[status] || {};
  const pc = PRIORITY_COLORS[demand.priority] || {};

  // Build timeline steps
  const timelineSteps = [
    { label: "Demand Submitted", done: status !== "draft", meta: demand.requester?.full_name },
    { label: "Forwarded to Approvers", done: !["draft","submitted"].includes(status) },
    { label: "L1 Approved (Dept Head)", done: !["draft","submitted","forwarded"].includes(status), active: status === "forwarded",
      meta: demand.approval_steps?.find(s=>s.level===1)?.approver?.full_name },
    { label: "L2 Approved (CO)", done: ["approved_l2","approved_l3","issue_order_created","gate_pass_issued","withdrawn"].includes(status),
      active: status === "approved_l1" },
    { label: "L3 Approved (Commandant)", done: ["approved_l3","issue_order_created","gate_pass_issued","withdrawn"].includes(status),
      active: status === "approved_l2" },
    { label: "Issue Order Created", done: ["issue_order_created","gate_pass_issued","withdrawn"].includes(status) },
    { label: "Gate Pass Issued", done: ["gate_pass_issued","withdrawn"].includes(status) },
    { label: "Items Withdrawn", done: status === "withdrawn" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Badge label={DEMAND_STATUS_LABELS[status]} bg={sc.bg} color={sc.color} />
        <Badge label={demand.priority.toUpperCase()} bg={pc.bg} color={pc.color} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, marginBottom: 16 }}>
        <div><span style={{ color: "#888" }}>Form #:</span> <strong>{demand.form_number}</strong></div>
        <div><span style={{ color: "#888" }}>Department:</span> {demand.department}</div>
        <div><span style={{ color: "#888" }}>Requester:</span> {demand.requester?.full_name}</div>
        <div><span style={{ color: "#888" }}>DC:</span> {demand.dc?.full_name || "—"}</div>
        <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#888" }}>Purpose:</span> {demand.purpose}</div>
      </div>

      {/* Items table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: "#fafafa" }}>
            {["Item", "Requested", "Approved", "Issued", "Withdrawn"].map((h) => (
              <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: 11, color: "#888",
                borderBottom: "1px solid #eee", textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {demand.lines.map((line) => (
            <tr key={line.id}>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>
                {line.item?.name}
                {line.item?.category && (() => { const cc = CAT_COLORS[line.item.category]||{}; return <Badge label={line.item.category} bg={cc.bg} color={cc.color} style={{marginLeft:6}} />; })()}
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>{line.qty_requested} {line.item?.unit}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>
                {role === ROLES.L3 && status === "approved_l2" ? (
                  <input type="number" min={0} max={line.qty_requested} value={qtyApproved[line.id] ?? line.qty_requested}
                    onChange={(e) => setQtyApproved((q) => ({ ...q, [line.id]: Number(e.target.value) }))}
                    style={{ width: 64, padding: "4px 6px", fontSize: 12, border: "1px solid #ddd", borderRadius: 4 }} />
                ) : (line.qty_approved ?? "—")}
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>{line.qty_issued ?? "—"}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>{line.qty_withdrawn ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Approval steps */}
      {demand.approval_steps?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Approval Chain</div>
          {demand.approval_steps.map((s) => (
            <div key={s.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0",
              borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
              <span style={{ width: 20, color: "#888" }}>L{s.level}</span>
              <span style={{ flex: 1 }}>{s.approver?.full_name || "Unassigned"}</span>
              <Badge label={s.status} bg={s.status==="approved"?"#EAF3DE":s.status==="rejected"?"#FCEBEB":"#F1EFE8"}
                color={s.status==="approved"?"#3B6D11":s.status==="rejected"?"#A32D2D":"#888"} />
              {s.remarks && <span style={{ fontSize: 11, color: "#aaa" }}>{s.remarks}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Progress</div>
        <StatusTimeline steps={timelineSteps} />
      </div>

      {/* Action area */}
      {role === ROLES.DC && status === "submitted" && (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 14 }}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Remarks (optional)</div>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2}
            style={{ width: "100%", padding: "8px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6,
              outline: "none", resize: "none", marginBottom: 10, boxSizing: "border-box" }} />
          <Button onClick={() => act("forward")} disabled={acting}>{acting ? "Forwarding…" : "Forward to Approvers"}</Button>
        </div>
      )}

      {[ROLES.L1, ROLES.L2, ROLES.L3].includes(role) && (
        (() => {
          const myLevel = parseInt(role.slice(-1));
          const myStep = demand.approval_steps?.find((s) => s.level === myLevel && s.approver_id === user.id && s.status === "pending");
          const prevApproved = myLevel === 1 || demand.approval_steps?.find((s) => s.level === myLevel - 1)?.status === "approved";
          if (!myStep || !prevApproved) return null;
          return (
            <div style={{ borderTop: "1px solid #eee", paddingTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Your Decision (L{myLevel})</div>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} placeholder="Remarks…"
                style={{ width: "100%", padding: "8px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6,
                  outline: "none", resize: "none", marginBottom: 10, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button onClick={() => act("approved")} disabled={acting}>{acting ? "…" : "✓ Approve"}</Button>
                <Button variant="danger" onClick={() => act("rejected")} disabled={acting}>{acting ? "…" : "✗ Reject"}</Button>
              </div>
            </div>
          );
        })()
      )}

      {role === ROLES.DC && status === "approved_l3" && (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 14 }}>
          <Button onClick={() => act("create_issue_order")} disabled={acting}>
            {acting ? "Creating…" : "Create Issue Order"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DemandsPage({ showToast, setPage }) {
  const { user } = useAuth();
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    api.getDemands().then(setDemands).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (demandId, action, remarks, qtyApproved) => {
    if (action === "forward") {
      await api.forwardDemand(demandId, user.id);
    } else if (["approved", "rejected", "approve", "reject"].includes(action)) {
      const normalizedAction = action === "approve" ? "approved" : action === "reject" ? "rejected" : action;
      const payload = { action: normalizedAction, remarks };
      if (normalizedAction === "approved" && user.role === ROLES.L3) {
        payload.qty_approved = Object.entries(qtyApproved).map(([line_id, qty]) => ({ line_id: Number(line_id), qty }));
      }
      await api.approveDemand(demandId, payload);
    } else if (action === "create_issue_order") {
      await api.createIssueOrder({ demand_id: demandId, notes: remarks });
      showToast("Issue order created. Store Controller notified.");
    }
    load();
  };

  const filtered = demands.filter((d) => filter ? d.status === filter : true);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Demands" subtitle="Track all demand requests"
        action={user?.role === ROLES.USER && (
          <Button onClick={() => setPage("new-demand")}>+ New Demand</Button>
        )}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6, outline: "none" }}>
          <option value="">All statuses</option>
          {Object.entries(DEMAND_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState message="No demands found." /> : (
        <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Form #", "Department", "Requester", "Priority", "Items", "Status", "Date", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "#888",
                    borderBottom: "1px solid #eee", textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const sc = DEMAND_STATUS_COLORS[d.status] || {};
                const pc = PRIORITY_COLORS[d.priority] || {};
                return (
                  <tr key={d.id} style={{ background: "#fff" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", fontWeight: 500 }}>{d.form_number}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{d.department}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{d.requester?.full_name || "—"}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <Badge label={d.priority} bg={pc.bg} color={pc.color} />
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", color: "#888" }}>{d.lines?.length || 0}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <Badge label={DEMAND_STATUS_LABELS[d.status]} bg={sc.bg} color={sc.color} />
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", color: "#aaa", fontSize: 12 }}>
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <button onClick={() => setSelected(d)}
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
        <Modal title={`Demand — ${selected.form_number}`} onClose={() => { setSelected(null); load(); }} width={640}>
          <DemandDetail demand={selected} onAction={handleAction} user={user} showToast={showToast}
            onClose={() => { setSelected(null); load(); }} />
        </Modal>
      )}
    </div>
  );
}
