import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { Badge, Button, Card, EmptyState, Input, PageHeader, Select, Textarea } from "../components/UI";
import { CAT_COLORS, PRIORITY_COLORS } from "../utils/roles";

export default function NewDemandPage({ setPage, showToast }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ department: user?.department || "", purpose: "", priority: "normal" });
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getItems().then(setItems).catch((e) => showToast?.(e.message, "err"));
  }, []);

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      !lines.find((line) => line.item_id === item.id) &&
      [item.name, item.category, item.supplier].some((value) => String(value || "").toLowerCase().includes(q))
    );
  });

  const addLine = (item) => setLines((prev) => [...prev, { item_id: item.id, item, qty_requested: 1 }]);
  const removeLine = (itemId) => setLines((prev) => prev.filter((line) => line.item_id !== itemId));
  const setQty = (itemId, qty) =>
    setLines((prev) => prev.map((line) => (line.item_id === itemId ? { ...line, qty_requested: Number(qty) } : line)));

  const handleSave = async (submit) => {
    if (!form.department.trim()) return showToast("Department is required.", "err");
    if (!form.purpose.trim()) return showToast("Purpose is required.", "err");
    if (lines.length === 0) return showToast("Add at least one inventory item.", "err");

    setSaving(true);
    try {
      const demand = await api.createDemand({
        department: form.department,
        purpose: form.purpose,
        priority: form.priority,
        lines: lines.map((line) => ({ item_id: line.item_id, qty_requested: Number(line.qty_requested) })),
      });

      if (submit) {
        await api.submitDemand(demand.id);
        showToast("Demand submitted successfully.");
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
      <PageHeader
        icon="solar:add-square-broken"
        title="New Demand Form"
        subtitle="Request inventory items and submit them for approval."
        action={
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" icon="solar:diskette-broken" onClick={() => handleSave(false)} disabled={saving}>Save Draft</Button>
            <Button icon="solar:send-square-broken" onClick={() => handleSave(true)} disabled={saving}>{saving ? "Submitting..." : "Submit Demand"}</Button>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 18 }}>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 16 }}>
              <Input
                label="Department"
                value={form.department}
                placeholder="Enter requesting department"
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              />
              <Select label="Priority" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
            <div style={{ marginTop: 16 }}>
              <Textarea
                label="Purpose / Justification"
                value={form.purpose}
                rows={4}
                placeholder="Explain why these inventory items are needed..."
                onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
              />
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>Requested Items</h3>
                <p style={{ margin: "5px 0 0", color: "var(--text-muted)", fontSize: 13 }}>{lines.length} item{lines.length === 1 ? "" : "s"} selected</p>
              </div>
              <Badge label={form.priority} bg={PRIORITY_COLORS[form.priority]?.bg} color={PRIORITY_COLORS[form.priority]?.color} icon="solar:flag-broken" />
            </div>

            {lines.length === 0 ? (
              <EmptyState message="No items selected" sub="Search and add inventory items from the right panel." icon="solar:box-minimalistic-broken" />
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {lines.map((line) => {
                  const cc = CAT_COLORS[line.item.category] || CAT_COLORS.Administrative;
                  return (
                    <div
                      key={line.item_id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 170px 38px",
                        gap: 12,
                        alignItems: "center",
                        padding: 14,
                        borderRadius: 4,
                        background: "var(--color-primary-50)",
                        border: "1px solid var(--border-soft)",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800 }}>{line.item.name}</div>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            marginTop: 7,
                          }}
                        >
                          <Badge
                            label={line.item.category || "General"}
                            bg={cc.bg}
                            color={cc.color}
                          />
                          <span
                            style={{ fontSize: 12, color: "var(--text-muted)" }}
                          >
                            Available: {line.item.quantity} {line.item.unit}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="number"
                          min="1"
                          max={line.item.quantity}
                          value={line.qty_requested}
                          onChange={(e) => setQty(line.item_id, e.target.value)}
                          style={{
                            width: 84,
                            height: 38,
                            borderRadius: 4,
                            border: "1.5px solid var(--color-primary-100)",
                            padding: "0 10px",
                            fontWeight: 800,
                            outline: "none",
                          }}
                        />
                        <span
                          style={{ fontSize: 12.5, color: "var(--text-muted)" }}
                        >
                          {line.item.unit}
                        </span>
                      </div>
                      <button
                        onClick={() => removeLine(line.item_id)}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 4,
                          border: "none",
                          background: "var(--color-danger-50)",
                          color: "var(--color-danger-600)",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Icon
                          icon="solar:trash-bin-minimalistic-broken"
                          width="20"
                          height="20"
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <Card style={{ position: "sticky", top: 96 }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>Add Inventory Items</h3>
          <p style={{ margin: "0 0 14px", color: "var(--text-muted)", fontSize: 13 }}>Search items and add them to this demand.</p>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <Icon icon="solar:magnifer-broken" width="20" height="20" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory..."
              style={{
                width: "100%",
                height: 44,
                borderRadius: 14,
                border: "1.5px solid var(--color-primary-100)",
                padding: "0 14px 0 44px",
                outline: "none",
                fontWeight: 650,
              }}
            />
          </div>

          <div style={{ maxHeight: 520, overflowY: "auto", display: "grid", gap: 8 }}>
            {filteredItems.length === 0 ? (
              <EmptyState message="No matching items" sub="Try another keyword or add more stock first." icon="solar:magnifer-broken" />
            ) : (
              filteredItems.map((item) => {
                const cc = CAT_COLORS[item.category] || CAT_COLORS.Administrative;
                return (
                  <button
                    key={item.id}
                    onClick={() => addLine(item)}
                    style={{
                      width: "100%",
                      border: "1px solid var(--border-soft)",
                      background: "#ffffff",
                      borderRadius: 16,
                      padding: 13,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "var(--transition)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-50)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 800 }}>{item.name}</div>
                      <Icon icon="solar:add-circle-broken" width="21" height="21" style={{ color: "var(--brand)" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                      <Badge label={item.category || "General"} bg={cc.bg} color={cc.color} />
                      <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{item.quantity} {item.unit}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
