import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Badge, Button, Modal, Card, PageHeader, Spinner, EmptyState } from "../components/UI";
import { getItemStatus, ITEM_STATUS_COLORS, ITEM_STATUS_LABELS, CAT_COLORS } from "../utils/roles";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/roles";

const inp = { padding: "8px 10px", fontSize: 14, border: "1px solid #ddd", borderRadius: 6,
  outline: "none", boxSizing: "border-box" };
const lbl = { fontSize: 12, color: "#666", display: "block", marginBottom: 4 };

const CATS = ["Medical", "Food", "Clothing", "Maintenance", "Security", "Administrative"];

function ItemModal({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState({ name: "", category: "Medical", quantity: 0, min_stock: 10, unit: "unit", supplier: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  useEffect(() => { if (item) setForm({ name: item.name, category: item.category, quantity: item.quantity, min_stock: item.min_stock, unit: item.unit || "unit", supplier: item.supplier || "", notes: item.notes || "" }); }, [item]);
  const save = async () => {
    setSaving(true);
    try { await onSave({ ...form, quantity: Number(form.quantity), min_stock: Number(form.min_stock) }); onClose(); }
    finally { setSaving(false); }
  };
  return (
    <Modal title={item ? "Edit Item" : "Add Item"} onClose={onClose}>
      <div style={{ display: "grid", gap: 14 }}>
        <div><label style={lbl}>Name *</label><input style={{ ...inp, width: "100%" }} value={form.name} onChange={set("name")} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Category</label>
            <select style={{ ...inp, width: "100%" }} value={form.category} onChange={set("category")}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Unit</label><input style={{ ...inp, width: "100%" }} value={form.unit} onChange={set("unit")} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Quantity</label><input style={{ ...inp, width: "100%" }} type="number" min="0" value={form.quantity} onChange={set("quantity")} /></div>
          <div><label style={lbl}>Min Stock</label><input style={{ ...inp, width: "100%" }} type="number" min="0" value={form.min_stock} onChange={set("min_stock")} /></div>
        </div>
        <div><label style={lbl}>Supplier</label><input style={{ ...inp, width: "100%" }} value={form.supplier} onChange={set("supplier")} /></div>
        <div><label style={lbl}>Notes</label><textarea style={{ ...inp, width: "100%", minHeight: 60, resize: "vertical" }} value={form.notes} onChange={set("notes")} /></div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : item ? "Save Changes" : "Add Item"}</Button>
      </div>
    </Modal>
  );
}

export default function InventoryPage({ showToast }) {
  const { user } = useAuth();
  const canEdit = [ROLES.ADMIN, ROLES.SC].includes(user?.role);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", category: "all", status: "" });
  const [modal, setModal] = useState(null);
  const [auditItem, setAuditItem] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getItems({ search: filters.search, category: filters.category, status: filters.status }),
      api.getStats(),
    ]).then(([i, s]) => { setItems(i); setStats(s); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filters]);

  const openAudit = (item) => {
    setAuditItem(item);
    api.getAudit(item.id).then(setAuditLogs);
  };

  const handleSave = async (data) => {
    if (modal?.id) await api.updateItem(modal.id, data);
    else await api.createItem(data);
    showToast(modal?.id ? "Item updated." : "Item added.");
    load();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.name}"?`)) return;
    await api.deleteItem(item.id);
    showToast("Item removed.", "warn");
    load();
  };

  const adj = async (item, delta) => {
    await api.adjustQuantity(item.id, delta, delta > 0 ? "Manual increment" : "Manual decrement");
    load();
  };

  const TABS = ["all", ...CATS];

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Central Store"
        action={canEdit && <Button onClick={() => setModal({})}>+ Add Item</Button>}
      />

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total", value: stats.total, color: "inherit" },
            { label: "In Stock", value: stats.in_stock, color: "#3B6D11" },
            { label: "Low Stock", value: stats.low_stock, color: "#854F0B" },
            { label: "Critical", value: stats.critical, color: "#A32D2D" },
          ].map((c) => (
            <div key={c.label} style={{ background: "#f5f5f3", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 500, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: 14 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setFilters((f) => ({ ...f, category: t }))}
            style={{ padding: "7px 14px", fontSize: 13, border: "none", background: "transparent", cursor: "pointer",
              borderBottom: filters.category === t ? "2px solid #1a1a1a" : "2px solid transparent",
              color: filters.category === t ? "#1a1a1a" : "#888", fontWeight: filters.category === t ? 500 : 400, marginBottom: -1 }}>
            {t === "all" ? "All" : t}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input value={filters.search} placeholder="Search…" onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          style={{ flex: 1, padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6, outline: "none" }} />
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          style={{ padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6, outline: "none" }}>
          <option value="">All status</option>
          <option value="ok">In stock</option>
          <option value="low">Low stock</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState /> : (
        <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Item", "Category", "Quantity", "Min", "Status", "Updated", ""].map((h, i) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "#888",
                    borderBottom: "1px solid #eee", textTransform: "uppercase", letterSpacing: "0.03em",
                    width: ["26%","13%","15%","8%","11%","12%","15%"][i] }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const s = getItemStatus(item);
                const sc = ITEM_STATUS_COLORS[s];
                const cc = CAT_COLORS[item.category] || CAT_COLORS["Administrative"];
                return (
                  <tr key={item.id} style={{ background: "#fff" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", fontWeight: 500 }}>
                      {item.name}
                      {item.supplier && <div style={{ fontSize: 11, color: "#aaa" }}>{item.supplier}</div>}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <Badge label={item.category} bg={cc.bg} color={cc.color} />
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      {canEdit ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button onClick={() => adj(item, -1)}
                            style={{ width: 22, height: 22, border: "1px solid #ddd", background: "transparent", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>−</button>
                          <span style={{ minWidth: 28, textAlign: "center" }}>{item.quantity}</span>
                          <button onClick={() => adj(item, 1)}
                            style={{ width: 22, height: 22, border: "1px solid #ddd", background: "transparent", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>+</button>
                          <span style={{ fontSize: 11, color: "#aaa" }}>{item.unit}</span>
                        </div>
                      ) : <span>{item.quantity} {item.unit}</span>}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", color: "#888" }}>{item.min_stock}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <Badge label={ITEM_STATUS_LABELS[s]} bg={sc.bg} color={sc.color} />
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", color: "#aaa", fontSize: 12 }}>{item.updated_at || "—"}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {canEdit && <Button size="sm" variant="secondary" onClick={() => setModal(item)}>Edit</Button>}
                        <Button size="sm" variant="secondary" onClick={() => openAudit(item)}>Log</Button>
                        {canEdit && <Button size="sm" variant="danger" onClick={() => handleDelete(item)}>Del</Button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <ItemModal item={modal?.id ? modal : null} categories={CATS} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {auditItem && (
        <Modal title={`Audit — ${auditItem.name}`} onClose={() => setAuditItem(null)}>
          {auditLogs.length === 0 ? <EmptyState message="No audit records." /> : auditLogs.map((log) => (
            <div key={log.id} style={{ padding: "9px 0", borderBottom: "1px solid #f5f5f5", display: "flex", gap: 10, fontSize: 13 }}>
              <Badge label={log.action} bg="#f0f0f0" color="#444" />
              <div style={{ flex: 1 }}>
                <div>{log.note}</div>
                {log.old_quantity != null && <div style={{ fontSize: 11, color: "#aaa" }}>Qty: {log.old_quantity} → {log.new_quantity}</div>}
              </div>
              <span style={{ fontSize: 11, color: "#aaa" }}>{log.created_at ? new Date(log.created_at).toLocaleString() : ""}</span>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
