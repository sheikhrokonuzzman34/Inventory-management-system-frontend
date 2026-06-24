import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Badge, Button, Card, EmptyState, Modal, PageHeader, SectionTitle, Spinner, Table, TableRow, TD } from "../components/UI";
import { CAT_COLORS } from "../utils/roles";

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
        <Table headers={["Gate Pass", "Issue Order", "Demand", "Department", "Status", "Created"]}>
          {passes.map((pass) => {
            const withdrawn = !!pass.withdrawn_at || pass.status === "withdrawn";
            return (
              <TableRow key={pass.id} onClick={() => setSelected(pass)}>
                <TD style={{ fontWeight: 900 }}>#{pass.id}</TD>
                <TD>#{pass.issue_order?.id || "—"}</TD>
                <TD>#{pass.issue_order?.demand?.id || "—"}</TD>
                <TD>{pass.issue_order?.demand?.department || "—"}</TD>
                <TD>
                  <Badge
                    label={withdrawn ? "Withdrawn" : "Ready for Withdrawal"}
                    bg={withdrawn ? "var(--color-success-50)" : "var(--color-warn-50)"}
                    color={withdrawn ? "var(--color-success-700)" : "var(--color-warn-800)"}
                  />
                </TD>
                <TD style={{ color: "var(--text-muted)" }}>{formatDate(pass.created_at)}</TD>
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
  const demand = gp.issue_order?.demand;
  const withdrawn = !!gp.withdrawn_at || gp.status === "withdrawn";

  const handleWithdraw = async () => {
    if (!window.confirm("Confirm item withdrawal for this gate pass?")) return;
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
    <Modal title={`Gate Pass #${gp.id}`} subtitle="Gate pass details and withdrawal confirmation." onClose={onClose} width={920}>
      <div style={{ display: "grid", gap: 20 }}>
        <Card style={{ boxShadow: "none", background: "var(--color-primary-50)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
            <Info label="Issue Order" value={`#${gp.issue_order?.id || "—"}`} />
            <Info label="Demand" value={`#${demand?.id || "—"}`} />
            <Info label="Department" value={demand?.department || "—"} />
            <Info label="Status" value={withdrawn ? "Withdrawn" : "Ready"} />
          </div>
        </Card>

        <div>
          <SectionTitle icon="solar:box-broken">Items for Withdrawal</SectionTitle>
          <Table headers={["Item", "Category", "Quantity"]}>
            {(demand?.lines || []).map((line) => {
              const cc = CAT_COLORS[line.item?.category] || CAT_COLORS.Administrative;
              return (
                <TableRow key={line.id}>
                  <TD style={{ fontWeight: 900 }}>{line.item?.name || "—"}</TD>
                  <TD><Badge label={line.item?.category || "General"} bg={cc.bg} color={cc.color} /></TD>
                  <TD>{line.qty_withdrawn ?? line.qty_issued ?? line.qty_approved ?? line.qty_requested} {line.item?.unit || ""}</TD>
                </TableRow>
              );
            })}
          </Table>
        </div>

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
              {withdrawing ? "Processing..." : "Confirm Withdrawal"}
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
