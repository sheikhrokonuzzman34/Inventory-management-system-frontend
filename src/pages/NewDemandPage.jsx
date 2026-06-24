import React, { useState, useEffect } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Select, Textarea, Card, PageHeader, Badge } from "../components/UI";
import { CAT_COLORS } from "../utils/roles";

export default function NewDemandPage({ setPage, showToast }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ department: user?.department || "", purpose: "", priority: "normal" });
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { api.getItems().then(setItems); }, []);

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) && !lines.find((l) => l.item_id === i.id)
  );

  const addLine = (item) => setLines((l) => [...l, { item_id: item.id, item, qty_requested: 1 }]);
  const removeLine = (item_id) => setLines((l) => l.filter((x) => x.item_id !== item_id));
  const setQty = (item_id, qty) => setLines((l) => l.map((x) => x.item_id === item_id ? { ...x, qty_requested: Number(qty) } : x));

  const handleSave = async (submit) => {
    if (!form.purpose.trim()) return showToast("Purpose is required.", "err");
    if (lines.length === 0) return showToast("Add at least one item.", "err");
    setSaving(true);
    try {
      const demand = await api.createDemand({
        department: form.department,
        purpose: form.purpose,
        priority: form.priority,
        lines: lines.map((l) => ({ item_id: l.item_id, qty_requested: l.qty_requested })),
      });
      if (submit) {
        await api.submitDemand(demand.id);
        showToast("Demand submitted to Demand Controller.");
      } else {
        showToast("Demand saved as draft.");
      }
      setPage("demands");
    } catch (e) {
      showToast(e.message, "err");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="New Demand Form" subtitle="Request items from the Central Store"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving}>Save Draft</Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>{saving ? "Submitting…" : "Submit to DC"}</Button>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, alignItems: "start" }}>
        {/* Left: form details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14, color: "#555" }}>Request Details</div>
            <div style={{ display: "grid", gap: 14 }}>
              <Input label="Department" value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
              <Select label="Priority" value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </Select>
              <Textarea label="Purpose / Justification *" value={form.purpose} rows={3}
                onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                placeholder="Explain why these items are needed..." />
            </div>
          </Card>

          {/* Selected items */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14, color: "#555" }}>
              Requested Items ({lines.length})
            </div>
            {lines.length === 0 && (
              <div style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "16px 0" }}>
                Search and add items from the panel →
              </div>
            )}
            {lines.map((line) => {
              const cc = CAT_COLORS[line.item.category] || CAT_COLORS["Administrative"];
              return (
                <div key={line.item_id} style={{ display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{line.item.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                      <Badge label={line.item.category} bg={cc.bg} color={cc.color} />
                      <span style={{ fontSize: 11, color: "#aaa" }}>Available: {line.item.quantity} {line.item.unit}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, color: "#666" }}>Qty:</span>
                    <input type="number" min={1} max={line.item.quantity} value={line.qty_requested}
                      onChange={(e) => setQty(line.item_id, e.target.value)}
                      style={{ width: 64, padding: "5px 8px", fontSize: 13, border: "1px solid #ddd",
                        borderRadius: 5, outline: "none" }} />
                    <span style={{ fontSize: 11, color: "#aaa" }}>{line.item.unit}</span>
                  </div>
                  <button onClick={() => removeLine(line.item_id)}
                    style={{ background: "none", border: "none", color: "#A32D2D", cursor: "pointer", fontSize: 16 }}>×</button>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Right: item picker */}
        <Card style={{ position: "sticky", top: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: "#555" }}>Add Items</div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory…"
            style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: "1px solid #ddd",
              borderRadius: 6, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {filteredItems.map((item) => {
              const cc = CAT_COLORS[item.category] || {};
              return (
                <div key={item.id} onClick={() => addLine(item)}
                  style={{ padding: "9px 10px", borderRadius: 6, cursor: "pointer", marginBottom: 4,
                    border: "1px solid #eee", transition: "background .1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                    <Badge label={item.category} bg={cc.bg} color={cc.color} />
                    <span style={{ fontSize: 11, color: "#aaa" }}>{item.quantity} {item.unit}</span>
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div style={{ color: "#aaa", fontSize: 12, textAlign: "center", padding: 16 }}>No matching items</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
