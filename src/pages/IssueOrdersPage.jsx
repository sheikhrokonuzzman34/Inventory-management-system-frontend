import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, SectionTitle, Spinner, Table, TableRow, TD, Textarea } from "../components/UI";
import { CAT_COLORS, DEMAND_STATUS_COLORS, DEMAND_STATUS_LABELS } from "../utils/roles";

export default function IssueOrdersPage({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    api.getIssueOrders().then(setOrders).catch((e) => showToast(e.message, "err")).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        icon="solar:document-add-broken"
        title="Issue Orders"
        subtitle="Create gate passes from approved issue orders and track dispatch readiness."
      />

      {loading ? (
        <Spinner label="Loading issue orders..." />
      ) : orders.length === 0 ? (
        <EmptyState message="No issue orders found" sub="Fully approved demands will appear here once an issue order is created." icon="solar:document-add-broken" />
      ) : (
        <Table headers={["Issue Order", "Demand", "Department", "Status", "Gate Pass", "Created"]}>
          {orders.map((order) => {
            const status = order.demand?.status;
            const sc = DEMAND_STATUS_COLORS[status] || {};
            return (
              <TableRow key={order.id} onClick={() => setSelected(order)}>
                <TD style={{ fontWeight: 900 }}>#{order.id}</TD>
                <TD>#{order.demand?.id || "—"}</TD>
                <TD>{order.demand?.department || "—"}</TD>
                <TD><Badge label={DEMAND_STATUS_LABELS[status] || status || "—"} bg={sc.bg} color={sc.color} /></TD>
                <TD>
                  {order.gate_pass ? (
                    <Badge label={`Gate Pass #${order.gate_pass.id}`} bg="var(--color-success-50)" color="var(--color-success-700)" />
                  ) : (
                    <Badge label="Not Created" bg="var(--color-warn-50)" color="var(--color-warn-800)" />
                  )}
                </TD>
                <TD style={{ color: "var(--text-muted)" }}>{formatDate(order.created_at)}</TD>
              </TableRow>
            );
          })}
        </Table>
      )}

      {selected && <IssueOrderDetail order={selected} showToast={showToast} onClose={() => setSelected(null)} onUpdated={load} />}
    </div>
  );
}

function IssueOrderDetail({ order, showToast, onClose, onUpdated }) {
  const demand = order.demand;
  const [creating, setCreating] = useState(false);
  const [notes, setNotes] = useState("");
  const [lineQtys, setLineQtys] = useState(() => {
    const init = {};
    demand?.lines?.forEach((line) => {
      init[line.id] = line.qty_approved ?? line.qty_requested;
    });
    return init;
  });

  const hasGatePass = !!order.gate_pass;

  const handleCreateGatePass = async () => {
    setCreating(true);
    try {
      await api.createGatePass({
        issue_order_id: order.id,
        notes,
        line_quantities: Object.entries(lineQtys).map(([line_id, qty]) => ({ line_id: Number(line_id), qty_issued: Number(qty) })),
      });
      showToast("Gate pass created successfully.");
      onUpdated?.();
      onClose();
    } catch (e) {
      showToast(e.message, "err");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal title={`Issue Order #${order.id}`} subtitle="Review approved demand details and prepare gate pass." onClose={onClose} width={960}>
      <div style={{ display: "grid", gap: 20 }}>
        <Card style={{ boxShadow: "none", background: "var(--color-primary-50)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            <Info label="Demand" value={`#${demand?.id || "—"}`} />
            <Info label="Department" value={demand?.department || "—"} />
            <Info label="Requester" value={demand?.requester?.full_name || demand?.requester?.username || "—"} />
            <Info label="Created" value={formatDate(order.created_at)} />
          </div>
        </Card>

        <div>
          <SectionTitle icon="solar:box-broken">Issue Items</SectionTitle>
          <Table headers={["Item", "Category", "Approved Qty", "Gate Pass Qty"]}>
            {(demand?.lines || []).map((line) => {
              const cc = CAT_COLORS[line.item?.category] || CAT_COLORS.Administrative;
              return (
                <TableRow key={line.id}>
                  <TD style={{ fontWeight: 900 }}>{line.item?.name || "—"}</TD>
                  <TD><Badge label={line.item?.category || "General"} bg={cc.bg} color={cc.color} /></TD>
                  <TD>{line.qty_approved ?? line.qty_requested} {line.item?.unit}</TD>
                  <TD>
                    {hasGatePass ? (
                      `${line.qty_issued ?? line.qty_approved ?? line.qty_requested} ${line.item?.unit || ""}`
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max={line.qty_approved ?? line.qty_requested}
                        value={lineQtys[line.id] ?? line.qty_approved ?? line.qty_requested}
                        onChange={(e) => setLineQtys((prev) => ({ ...prev, [line.id]: e.target.value }))}
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
                    )}
                  </TD>
                </TableRow>
              );
            })}
          </Table>
        </div>

        {hasGatePass ? (
          <Card style={{ boxShadow: "none", background: "var(--color-success-50)" }}>
            <SectionTitle icon="solar:ticket-sale-broken">Gate Pass Already Created</SectionTitle>
            <p style={{ margin: 0, color: "var(--color-success-800)", fontWeight: 700 }}>
              Gate Pass #{order.gate_pass.id} has already been created for this issue order.
            </p>
          </Card>
        ) : (
          <Card style={{ boxShadow: "none", background: "var(--color-secondary-50)" }}>
            <SectionTitle icon="solar:ticket-sale-broken">Create Gate Pass</SectionTitle>
            <Textarea label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add gate pass notes if needed..." />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
              <Button icon="solar:ticket-sale-broken" onClick={handleCreateGatePass} disabled={creating}>
                {creating ? "Creating..." : "Create Gate Pass"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ marginTop: 5, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return value;
  }
}
