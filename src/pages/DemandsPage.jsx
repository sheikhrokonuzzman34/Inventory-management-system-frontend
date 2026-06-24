import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  InfoGrid,
  Modal,
  PageHeader,
  SectionTitle,
  Select,
  Spinner,
  StatusTimeline,
  Table,
  TableRow,
  TD,
  Textarea,
} from "../components/UI";
import {
  CAT_COLORS,
  DEMAND_STATUS_COLORS,
  DEMAND_STATUS_LABELS,
  PRIORITY_COLORS,
  ROLES,
} from "../utils/roles";

const FILTERS = [
  ["", "All Statuses"],
  ["draft", "Draft"],
  ["submitted", "Submitted"],
  ["forwarded", "Forwarded"],
  ["approved_l1", "Approved L1"],
  ["approved_l2", "Approved L2"],
  ["approved_l3", "Fully Approved"],
  ["rejected", "Rejected"],
  ["issue_order_created", "Issue Order Created"],
  ["gate_pass_issued", "Gate Pass Issued"],
  ["withdrawn", "Withdrawn"],
];

export default function DemandsPage({ showToast, setPage }) {
  const { user } = useAuth();
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");

  const load = () => {
    setLoading(true);
    api.getDemands().then(setDemands).catch((e) => showToast(e.message, "err")).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (demandId, action, remarks, qtyApproved) => {
    if (action === "forward") {
      await api.forwardDemand(demandId, user.id);
    } else if (action === "create_issue_order") {
      await api.createIssueOrder({ demand_id: demandId, notes: remarks });
    } else if (["approve", "reject", "approved", "rejected"].includes(action)) {
      const normalizedAction = action === "approve" ? "approved" : action === "reject" ? "rejected" : action;
      const payload = { action: normalizedAction, remarks };
      if (normalizedAction === "approved" && user?.role === ROLES.L3) {
        payload.qty_approved = Object.entries(qtyApproved || {}).map(([line_id, qty]) => ({
          line_id: Number(line_id),
          qty: Number(qty),
        }));
      }
      await api.approveDemand(demandId, payload);
    }

    showToast(actionMessage(action));
    load();
  };

  const filtered = demands.filter((demand) => (filter ? demand.status === filter : true));

  return (
    <div>
      <PageHeader
        icon="solar:clipboard-list-broken"
        title="Demand Forms"
        subtitle="Review item requests, approvals, issue orders, and withdrawal progress."
        action={<Button icon="solar:add-square-broken" onClick={() => setPage("new-demand")}>New Demand</Button>}
      />

      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "end" }}>
          <Select label="Filter by status" value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <div style={{ color: "var(--text-muted)", fontWeight: 700, paddingBottom: 10 }}>
            Showing {filtered.length} of {demands.length} demand form{demands.length === 1 ? "" : "s"}
          </div>
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading demand forms..." />
      ) : filtered.length === 0 ? (
        <EmptyState message="No demand forms found" sub="Create a new demand or change the selected filter." icon="solar:clipboard-remove-broken" />
      ) : (
        <Table headers={["Demand", "Department", "Purpose", "Priority", "Status", "Requester", "Created"]}>
          {filtered.map((demand) => {
            const sc = DEMAND_STATUS_COLORS[demand.status] || {};
            const pc = PRIORITY_COLORS[demand.priority] || {};
            return (
              <TableRow key={demand.id} onClick={() => setSelected(demand)}>
                <TD style={{ fontWeight: 900 }}>#{demand.id}</TD>
                <TD>{demand.department || "—"}</TD>
                <TD style={{ maxWidth: 260, color: "var(--text-secondary)" }}>{demand.purpose || "—"}</TD>
                <TD><Badge label={demand.priority || "normal"} bg={pc.bg} color={pc.color} icon="solar:flag-broken" /></TD>
                <TD><Badge label={DEMAND_STATUS_LABELS[demand.status] || demand.status} bg={sc.bg} color={sc.color} /></TD>
                <TD>{demand.requester?.full_name || demand.requester?.username || "—"}</TD>
                <TD style={{ color: "var(--text-muted)" }}>{formatDate(demand.created_at)}</TD>
              </TableRow>
            );
          })}
        </Table>
      )}

      {selected && (
        <DemandDetail
          demand={selected}
          user={user}
          showToast={showToast}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}

function DemandDetail({ demand, user, showToast, onClose, onAction }) {
  const [remarks, setRemarks] = useState("");
  const [qtyApproved, setQtyApproved] = useState({});
  const [acting, setActing] = useState(false);

  const status = demand.status;
  const role = user?.role;
  const statusColor = DEMAND_STATUS_COLORS[status] || {};
  const priorityColor = PRIORITY_COLORS[demand.priority] || {};

  useEffect(() => {
    const init = {};
    demand.lines?.forEach((line) => {
      init[line.id] = line.qty_approved ?? line.qty_requested;
    });
    setQtyApproved(init);
  }, [demand]);

  const timelineSteps = [
    { label: "Demand Submitted", done: status !== "draft", meta: demand.requester?.full_name || demand.requester?.username },
    { label: "Forwarded to Approvers", done: !["draft", "submitted"].includes(status), active: status === "submitted" },
    { label: "Department Approval (L1)", done: !["draft", "submitted", "forwarded"].includes(status), active: status === "forwarded" },
    { label: "Operations Approval (L2)", done: ["approved_l2", "approved_l3", "issue_order_created", "gate_pass_issued", "withdrawn"].includes(status), active: status === "approved_l1" },
    { label: "Final Approval (L3)", done: ["approved_l3", "issue_order_created", "gate_pass_issued", "withdrawn"].includes(status), active: status === "approved_l2" },
    { label: "Issue Order Created", done: ["issue_order_created", "gate_pass_issued", "withdrawn"].includes(status), active: status === "approved_l3" },
    { label: "Gate Pass & Withdrawal", done: status === "withdrawn", active: status === "gate_pass_issued" },
  ];

  const act = async (action) => {
    setActing(true);
    try {
      await onAction(demand.id, action, remarks, qtyApproved);
      onClose();
    } catch (e) {
      showToast(e.message, "err");
    } finally {
      setActing(false);
    }
  };

  const canApprove = [ROLES.L1, ROLES.L2, ROLES.L3].includes(role) && hasPendingStep(demand, user);
  const canEditApprovedQty = canApprove && role === ROLES.L3 && status === "approved_l2";
  const canForward = role === ROLES.DC && status === "submitted";
  const canCreateIssueOrder = role === ROLES.DC && status === "approved_l3";

  return (
    <Modal title={`Demand Form #${demand.id}`} subtitle="Demand details and workflow actions" onClose={onClose} width={980}>
      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Badge label={DEMAND_STATUS_LABELS[status] || status} bg={statusColor.bg} color={statusColor.color} />
          <Badge label={demand.priority || "normal"} bg={priorityColor.bg} color={priorityColor.color} icon="solar:flag-broken" />
        </div>

        <InfoGrid
          columns={3}
          items={[
            { label: "Department", value: demand.department },
            { label: "Requester", value: demand.requester?.full_name || demand.requester?.username },
            { label: "Created", value: formatDate(demand.created_at) },
          ]}
        />

        <Card style={{ boxShadow: "none", background: "var(--color-primary-50)" }}>
          <SectionTitle icon="solar:document-text-broken">Purpose / Justification</SectionTitle>
          <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>{demand.purpose || "—"}</p>
        </Card>

        <div>
          <SectionTitle icon="solar:box-broken">Requested Items</SectionTitle>
          <Table headers={["Item", "Category", "Requested", "Approved Quantity"]}>
            {(demand.lines || []).map((line) => {
              const cc = CAT_COLORS[line.item?.category] || CAT_COLORS.Administrative;
              return (
                <TableRow key={line.id}>
                  <TD style={{ fontWeight: 800 }}>{line.item?.name || "—"}</TD>
                  <TD><Badge label={line.item?.category || "General"} bg={cc.bg} color={cc.color} /></TD>
                  <TD>{line.qty_requested} {line.item?.unit}</TD>
                  <TD>
                    {canEditApprovedQty ? (
                      <input
                        type="number"
                        min="0"
                        max={line.qty_requested}
                        value={qtyApproved[line.id] ?? line.qty_requested}
                        onChange={(e) => setQtyApproved((prev) => ({ ...prev, [line.id]: Number(e.target.value) }))}
                        style={{
                          width: 110,
                          height: 36,
                          borderRadius: 10,
                          border: "1.5px solid var(--color-primary-100)",
                          padding: "0 10px",
                          outline: "none",
                          fontWeight: 800,
                        }}
                      />
                    ) : (
                      `${line.qty_approved ?? line.qty_requested} ${line.item?.unit || ""}`
                    )}
                  </TD>
                </TableRow>
              );
            })}
          </Table>
        </div>

        {demand.approval_steps?.length > 0 && (
          <Card style={{ boxShadow: "none" }}>
            <SectionTitle icon="solar:user-check-broken">Approval Steps</SectionTitle>
            <div style={{ display: "grid", gap: 10 }}>
              {demand.approval_steps.map((step) => {
                const approved = step.status === "approved";
                const rejected = step.status === "rejected";
                return (
                  <div key={step.id || step.level} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: 12, borderRadius: 14, background: "var(--color-primary-50)" }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>Level {step.level}: {step.approver?.full_name || step.approver?.username || "Approver"}</div>
                      {step.remarks && <div style={{ color: "var(--text-muted)", fontSize: 12.5, marginTop: 4 }}>{step.remarks}</div>}
                    </div>
                    <Badge
                      label={step.status || "pending"}
                      bg={approved ? "var(--color-success-50)" : rejected ? "var(--color-danger-50)" : "var(--color-warn-50)"}
                      color={approved ? "var(--color-success-700)" : rejected ? "var(--color-danger-700)" : "var(--color-warn-800)"}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card style={{ boxShadow: "none" }}>
          <SectionTitle icon="solar:route-broken">Progress Timeline</SectionTitle>
          <StatusTimeline steps={timelineSteps} />
        </Card>

        {(canForward || canApprove || canCreateIssueOrder) && (
          <Card style={{ background: "var(--color-secondary-50)", boxShadow: "none" }}>
            <SectionTitle icon="solar:pen-new-square-broken">Action Required</SectionTitle>
            <Textarea label="Remarks" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add remarks if needed..." />
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {canForward && <Button icon="solar:forward-2-broken" onClick={() => act("forward")} disabled={acting}>{acting ? "Forwarding..." : "Forward to Approval Chain"}</Button>}
              {canApprove && (
                <>
                  <Button variant="success" icon="solar:check-circle-broken" onClick={() => act("approve")} disabled={acting}>Approve</Button>
                  <Button variant="danger" icon="solar:close-circle-broken" onClick={() => act("reject")} disabled={acting}>Reject</Button>
                </>
              )}
              {canCreateIssueOrder && <Button icon="solar:document-add-broken" onClick={() => act("create_issue_order")} disabled={acting}>Create Issue Order</Button>}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
}

function hasPendingStep(demand, user) {
  if (!user?.role?.startsWith("approver_l")) return false;
  const myLevel = Number(user.role.replace("approver_l", ""));
  const myStep = demand.approval_steps?.find((step) => step.level === myLevel && step.approver_id === user.id && step.status === "pending");
  const prevStep = demand.approval_steps?.find((step) => step.level === myLevel - 1);
  const prevApproved = myLevel === 1 || ["approved", "approve"].includes(prevStep?.status);
  return !!myStep && prevApproved;
}

function actionMessage(action) {
  const map = {
    forward: "Demand forwarded successfully.",
    approve: "Demand approved successfully.",
    approved: "Demand approved successfully.",
    reject: "Demand rejected.",
    rejected: "Demand rejected.",
    create_issue_order: "Issue order created successfully.",
  };
  return map[action] || "Action completed.";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return value;
  }
}
