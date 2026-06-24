import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Badge, Button, Modal, PageHeader, Spinner, EmptyState } from "../components/UI";

export default function GatePassesPage({ showToast }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    api.getGatePasses().then(setPasses).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Gate Passes" subtitle="Issue vouchers and confirm withdrawals" />

      {passes.length === 0 ? <EmptyState message="No gate passes yet." /> : (
        <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Pass #", "Issue Order", "Requester", "Department", "Issued By", "Status", "Issued At", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "#888",
                    borderBottom: "1px solid #eee", textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {passes.map((gp) => {
                const statusColor = gp.status === "withdrawn"
                  ? { bg: "#EAF3DE", color: "#3B6D11" }
                  : { bg: "#E6F1FB", color: "#185FA5" };
                return (
                  <tr key={gp.id} style={{ background: "#fff" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", fontWeight: 500 }}>{gp.pass_number}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{gp.issue_order?.order_number}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{gp.issue_order?.demand?.requester?.full_name}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{gp.issue_order?.demand?.department}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>{gp.issued_by_user?.full_name}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <Badge label={gp.status.charAt(0).toUpperCase() + gp.status.slice(1)} bg={statusColor.bg} color={statusColor.color} />
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", color: "#aaa", fontSize: 12 }}>
                      {new Date(gp.issued_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <button onClick={() => setSelected(gp)}
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
        <Modal title={`Gate Pass — ${selected.pass_number}`} onClose={() => setSelected(null)} width={560}>
          <GatePassDetail gp={selected} showToast={showToast} onClose={() => { setSelected(null); load(); }} />
        </Modal>
      )}
    </div>
  );
}

function GatePassDetail({ gp, showToast, onClose }) {
  const [withdrawing, setWithdrawing] = useState(false);
  const demand = gp.issue_order?.demand;

  const handleWithdraw = async () => {
    if (!window.confirm("Confirm that the user has collected all issued items? This will deduct quantities from the inventory.")) return;
    setWithdrawing(true);
    try {
      await api.withdrawItems(gp.id);
      showToast("Items withdrawn. Inventory updated.");
      onClose();
    } catch (e) { showToast(e.message, "err"); }
    finally { setWithdrawing(false); }
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, marginBottom: 16 }}>
        <div><span style={{ color: "#888" }}>Pass #:</span> <strong>{gp.pass_number}</strong></div>
        <div><span style={{ color: "#888" }}>Order #:</span> {gp.issue_order?.order_number}</div>
        <div><span style={{ color: "#888" }}>Requester:</span> {demand?.requester?.full_name}</div>
        <div><span style={{ color: "#888" }}>Department:</span> {demand?.department}</div>
        <div><span style={{ color: "#888" }}>Issued By:</span> {gp.issued_by_user?.full_name}</div>
        <div><span style={{ color: "#888" }}>Issued At:</span> {new Date(gp.issued_at).toLocaleString()}</div>
        {gp.withdrawn_at && <div><span style={{ color: "#888" }}>Withdrawn:</span> {new Date(gp.withdrawn_at).toLocaleString()}</div>}
      </div>

      <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Items to Collect
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: "#fafafa" }}>
            {["Item", "Issued Qty", "Unit", "Withdrawn"].map((h) => (
              <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: 11, color: "#888",
                borderBottom: "1px solid #eee", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {demand?.lines?.filter((l) => l.qty_issued).map((line) => (
            <tr key={line.id}>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>{line.item?.name}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>{line.qty_issued}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5", color: "#888" }}>{line.item?.unit}</td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #f5f5f5" }}>
                {line.qty_withdrawn != null
                  ? <Badge label={`${line.qty_withdrawn} collected`} bg="#EAF3DE" color="#3B6D11" />
                  : <Badge label="Pending" bg="#F1EFE8" color="#888" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {gp.status === "issued" ? (
        <div>
          <div style={{ background: "#FFF3E0", color: "#E65100", padding: "10px 12px", borderRadius: 7,
            fontSize: 13, marginBottom: 12 }}>
            ⚠️ Confirm item collection to deduct quantities from inventory.
          </div>
          <Button onClick={handleWithdraw} disabled={withdrawing} variant="success">
            {withdrawing ? "Processing…" : "✓ Confirm Items Withdrawn"}
          </Button>
        </div>
      ) : (
        <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "10px 12px", borderRadius: 7, fontSize: 13 }}>
          ✓ All items have been collected and inventory has been updated.
        </div>
      )}
    </div>
  );
}
