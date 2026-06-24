import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, SectionTitle, Spinner, Table, TableRow, TD } from "../components/UI";

export default function GatePassesPage({ showToast }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    api.getGatePasses().then(setPasses).catch((e) => showToast(e.message, "err")).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        icon="solar:ticket-sale-broken"
        title="Gate Passes"
        subtitle="Track approved item withdrawals and gate pass status."
      />

      {loading ? (
        <Spinner label="Loading gate passes..." />
      ) : passes.length === 0 ? (
        <EmptyState message="No gate passes found" sub="Gate passes will appear after issue orders are processed." icon="solar:ticket-sale-broken" />
      ) : (
        <Table headers={["Gate Pass", "Issue Order", "Demand", "Department", "Status", "Issued At"]}>
          {passes.map((pass) => {
            const issueOrder = getIssueOrder(pass);
            const demand = getDemand(pass);
            const withdrawn = isWithdrawn(pass);

            return (
              <TableRow key={pass.id} onClick={() => setSelected(pass)}>
                <TD style={{ fontWeight: 900 }}>{pass.pass_number || `GP-${pass.id}`}</TD>
                <TD>{issueOrder?.order_number || `#${pass.issue_order_id || "—"}`}</TD>
                <TD>{demand?.form_number || `#${demand?.id || "—"}`}</TD>
                <TD>{demand?.department || "—"}</TD>
                <TD>
                  <Badge
                    label={withdrawn ? "Withdrawn" : "Ready for Withdrawal"}
                    bg={withdrawn ? "var(--color-success-50)" : "var(--color-warn-50)"}
                    color={withdrawn ? "var(--color-success-700)" : "var(--color-warn-800)"}
                  />
                </TD>
                <TD style={{ color: "var(--text-muted)" }}>{formatDateTime(pass.issued_at || pass.created_at)}</TD>
              </TableRow>
            );
          })}
        </Table>
      )}

      {selected && <GatePassDetail gp={selected} showToast={showToast} onClose={() => setSelected(null)} onUpdated={load} />}
    </div>
  );
}

function GatePassDetail({ gp, showToast, onClose, onUpdated }) {
  const [withdrawing, setWithdrawing] = useState(false);

  const issueOrder = getIssueOrder(gp);
  const demand = getDemand(gp);
  const lines = getDemandLines(gp);
  const withdrawn = isWithdrawn(gp);

  const passNumber = gp.pass_number || gp.gate_pass_number || gp.number || `GP-${gp.id || "—"}`;
  const orderNumber = issueOrder?.order_number || issueOrder?.issue_order_number || issueOrder?.number || issueOrder?.id || "—";

  const handleWithdraw = async () => {
    if (!window.confirm("Confirm item collection and deduct quantities from inventory?")) return;
    setWithdrawing(true);
    try {
      await api.withdrawItems(gp.id);
      showToast("Items withdrawn successfully.");
      onUpdated?.();
      onClose();
    } catch (e) {
      showToast(e.message, "err");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <Modal title={`Gate Pass — ${passNumber}`} subtitle="Gate pass details and withdrawal confirmation." onClose={onClose} width={920}>
      <div style={{ display: "grid", gap: 20 }}>
        <Card style={{ boxShadow: "none", background: "var(--color-primary-50)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 }}>
            <Info label="Pass #" value={passNumber} />
            <Info label="Order #" value={orderNumber !== "—" ? orderNumber : "—"} />
            <Info label="Requester" value={formatUser(demand?.requester || demand?.requester_user || gp.requester || gp.requester_user, "Demander")} />
            <Info label="Department" value={demand?.department || gp.department || "—"} />
            <Info label="Issued By" value={formatUser(gp.issued_by_user || gp.issued_by || gp.storekeeper || gp.created_by_user, "Storekeeper")} />
            <Info label="Issued At" value={formatDateTime(gp.issued_at || gp.created_at)} />
          </div>
        </Card>

        <div>
          <SectionTitle icon="solar:box-broken">Items to Collect</SectionTitle>
          <Table headers={["Item", "Issued Qty", "Unit", "Withdrawn"]}>
            {lines.length > 0 ? (
              lines.map((line) => {
                const issuedQty = line.qty_issued ?? line.issued_qty ?? line.qty_withdrawn ?? line.withdrawn_qty ?? line.qty_approved ?? line.approved_qty ?? line.qty_requested ?? line.requested_qty ?? "—";
                const lineWithdrawn = withdrawn || Number(line.qty_withdrawn || line.withdrawn_qty || 0) > 0;

                return (
                  <TableRow key={line.id || line.item_id || line.item?.id || line.item_name}>
                    <TD style={{ fontWeight: 900 }}>{line.item?.name || line.item_name || "—"}</TD>
                    <TD>{issuedQty}</TD>
                    <TD>{line.item?.unit || line.unit || "—"}</TD>
                    <TD>
                      <Badge
                        label={lineWithdrawn ? "Withdrawn" : "Pending"}
                        bg={lineWithdrawn ? "var(--color-success-50)" : "var(--color-warn-50)"}
                        color={lineWithdrawn ? "var(--color-success-700)" : "var(--color-warn-800)"}
                      />
                    </TD>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TD style={{ color: "var(--text-muted)" }}>No item lines found.</TD>
                <TD>—</TD>
                <TD>—</TD>
                <TD>—</TD>
              </TableRow>
            )}
          </Table>
        </div>

        {!withdrawn && (
          <Card
            style={{
              boxShadow: "none",
              background: "var(--color-warn-50)",
              color: "var(--color-warn-800)",
              border: "1px solid var(--color-warn-100)",
              padding: "13px 16px",
            }}
          >
            ⚠️ Confirm item collection to deduct quantities from inventory.
          </Card>
        )}

        {gp.notes && (
          <Card style={{ boxShadow: "none", background: "var(--color-secondary-50)" }}>
            <SectionTitle icon="solar:notes-broken">Notes</SectionTitle>
            <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.7 }}>{gp.notes}</p>
          </Card>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          {!withdrawn && (
            <Button variant="success" icon="solar:check-circle-broken" onClick={handleWithdraw} disabled={withdrawing}>
              {withdrawing ? "Processing..." : "Confirm Items Withdrawn"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ marginTop: 5, fontWeight: 900 }}>{value || "—"}</div>
    </div>
  );
}

function getIssueOrder(gp) {
  return gp.issue_order || gp.issueOrder || gp.order || {};
}

function getDemand(gp) {
  const issueOrder = getIssueOrder(gp);
  return issueOrder.demand || gp.demand || {};
}

function getDemandLines(gp) {
  const issueOrder = getIssueOrder(gp);
  const demand = getDemand(gp);
  return demand.lines || issueOrder.lines || gp.lines || [];
}

function formatUser(user, fallbackRole) {
  if (!user) return "—";

  if (typeof user === "string") return user;

  const name = user.full_name || user.name || user.username || "—";
  if (name === "—") return name;

  // Backend full_name already comes like "Jane Smith (Demander)" / "Sam Store (Storekeeper)".
  // So do not add the role again if it already exists in the name.
  if (/\([^)]*\)/.test(name)) return name;

  const role = prettyRole(user.role || fallbackRole);
  return role ? `${name} (${role})` : name;
}

function prettyRole(role) {
  if (!role) return "";

  const map = {
    user: "Demander",
    demander: "Demander",
    store_controller: "Storekeeper",
    storekeeper: "Storekeeper",
    demand_controller: "DC",
    approver_l1: "Dept Head",
    approver_l2: "CO",
    approver_l3: "Commandant",
  };

  return map[String(role).toLowerCase()] || role;
}

function isWithdrawn(gp) {
  return !!gp.withdrawn_at || String(gp.status || "").toLowerCase() === "withdrawn";
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return value;
  }
}

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return value;
  }
}
