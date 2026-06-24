import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  SectionTitle,
  Select,
  Spinner,
  StatCard,
  Table,
  TableRow,
  TD,
  Textarea,
} from "../components/UI";
import {
  CATEGORY_OPTIONS,
  CAT_COLORS,
  getItemStatus,
  ITEM_STATUS_COLORS,
  ITEM_STATUS_LABELS,
  ROLES,
} from "../utils/roles";

export default function InventoryPage({ showToast, auditOnly = false }) {
  const { user } = useAuth();
  const canEdit = [ROLES.ADMIN, ROLES.SC].includes(user?.role);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: "", category: "", status: "" });
  const [modal, setModal] = useState(null);
  const [auditItem, setAuditItem] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.allSettled([api.getItems(), api.getStats()])
      .then(([itemsRes, statsRes]) => {
        if (itemsRes.status === "fulfilled") setItems(itemsRes.value || []);
        if (statsRes.status === "fulfilled") setStats(statsRes.value || {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = filters.q.toLowerCase();
      const matchesQ = [
        item.name,
        item.category,
        item.supplier,
        item.unit,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q),
      );
      const matchesCat = filters.category
        ? item.category === filters.category
        : true;
      const matchesStatus = filters.status
        ? getItemStatus(item) === filters.status
        : true;
      return matchesQ && matchesCat && matchesStatus;
    });
  }, [items, filters]);

  const lowStockCount = items.filter(
    (item) => getItemStatus(item) === "low",
  ).length;
  const criticalCount = items.filter(
    (item) => getItemStatus(item) === "critical",
  ).length;
  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const handleSave = async (data) => {
    try {
      if (modal?.id) await api.updateItem(modal.id, data);
      else await api.createItem(data);
      showToast(
        modal?.id ? "Inventory item updated." : "Inventory item created.",
      );
      setModal(null);
      load();
    } catch (e) {
      showToast(e.message, "err");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from inventory?`)) return;
    try {
      await api.deleteItem(item.id);
      showToast("Inventory item deleted.", "warn");
      load();
    } catch (e) {
      showToast(e.message, "err");
    }
  };

  const adjustQuantity = async (item, delta) => {
    await api.adjustQuantity(
      item.id,
      delta,
      delta > 0 ? "Manual increment" : "Manual decrement",
    );
    load();
  };

  const openAudit = async (item) => {
    setAuditItem(item);
    setAuditLoading(true);
    try {
      const logs = await api.getAudit(item?.id);
      setAuditLogs(logs || []);
    } catch (e) {
      showToast(e.message, "err");
    } finally {
      setAuditLoading(false);
    }
  };

  const pageTitle = auditOnly ? "Inventory Audit Log" : "Inventory";
  const pageSubtitle = auditOnly
    ? "Review stock changes and item movement history."
    : "Manage stock records, quantities, categories, and inventory health.";

  return (
    <div>
      <PageHeader
        icon={auditOnly ? "solar:history-broken" : "solar:box-broken"}
        title={pageTitle}
        subtitle={pageSubtitle}
        action={
          !auditOnly && canEdit ? (
            <Button icon="solar:add-square-broken" onClick={() => setModal({})}>
              Add Item
            </Button>
          ) : null
        }
      />

      {!auditOnly && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <StatCard
            title="Inventory Items"
            value={stats?.total_items ?? items.length}
            icon="solar:box-broken"
            tone="primary"
          />
          <StatCard
            title="Total Quantity"
            value={stats?.total_quantity ?? totalQuantity}
            icon="solar:layers-minimalistic-broken"
            tone="secondary"
          />
          <StatCard
            title="Low Stock"
            value={stats?.low_stock ?? lowStockCount}
            icon="solar:danger-triangle-broken"
            tone="warn"
          />
          <StatCard
            title="Critical"
            value={stats?.critical_stock ?? criticalCount}
            icon="solar:close-circle-broken"
            tone="danger"
          />
        </div>
      )}

      <Card style={{ marginBottom: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 220px 200px",
            gap: 14,
            alignItems: "end",
          }}
        >
          <div>
            <label style={labelStyle}>Search Inventory</label>
            <div style={{ position: "relative" }}>
              <Icon
                icon="solar:magnifer-broken"
                width="20"
                height="20"
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                value={filters.q}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, q: e.target.value }))
                }
                placeholder="Search by item, category, supplier..."
                style={{ ...inputStyle, paddingLeft: 44 }}
              />
            </div>
          </div>
          <Select
            label="Category"
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Select
            label="Stock Status"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="">All Status</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="critical">Critical</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading inventory..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          message="No inventory items found"
          sub="Try changing your filters or add a new inventory item."
          action={
            !auditOnly && canEdit ? (
              <Button
                icon="solar:add-square-broken"
                onClick={() => setModal({})}
              >
                Add First Item
              </Button>
            ) : null
          }
        />
      ) : (
        <Table
          headers={[
            "Item",
            "Category",
            "Quantity",
            "Min Stock",
            "Status",
            "Updated",
            "Actions",
          ]}
          colWidths={["16%", "13%", "17%", "9%", "11%", "13%", "12%"]}
        >
          {/* FIXED: Changed from items.map to filtered.map */}
          {filtered.map((item) => {
            const s = getItemStatus(item);
            const sc = ITEM_STATUS_COLORS[s];
            const cc =
              CAT_COLORS[item.category] || CAT_COLORS["Administrative"];
            return (
              <TableRow key={item.id}>
                <TD style={{ fontWeight: 600 }}>
                  {item.name}
                  {item.supplier && (
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--text-muted)",
                        fontWeight: 400,
                        marginTop: 2,
                      }}
                    >
                      {item.supplier}
                    </div>
                  )}
                </TD>
                <TD>
                  <Badge label={item.category} bg={cc.bg} color={cc.color} />
                </TD>
                <TD>
                  {canEdit ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <button
                        onClick={() => adjustQuantity(item, -1)}
                        style={{
                          width: 24,
                          height: 24,
                          border: "1.5px solid var(--border)",
                          background: "var(--surface-alt)",
                          borderRadius: 5,
                          cursor: "pointer",
                          fontSize: 14,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-primary)",
                          transition: "all 0.12s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--border)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "var(--surface-alt)")
                        }
                      >
                        −
                      </button>
                      <span
                        style={{
                          minWidth: 32,
                          textAlign: "center",
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => adjustQuantity(item, 1)}
                        style={{
                          width: 24,
                          height: 24,
                          border: "1.5px solid var(--border)",
                          background: "var(--surface-alt)",
                          borderRadius: 5,
                          cursor: "pointer",
                          fontSize: 14,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-primary)",
                          transition: "all 0.12s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--border)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "var(--surface-alt)")
                        }
                      >
                        +
                      </button>
                      <span
                        style={{ fontSize: 11.5, color: "var(--text-muted)" }}
                      >
                        {item.unit}
                      </span>
                    </div>
                  ) : (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                      }}
                    >
                      {item.quantity}{" "}
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-body)",
                          fontWeight: 400,
                        }}
                      >
                        {item.unit}
                      </span>
                    </span>
                  )}
                </TD>
                <TD muted style={{ fontFamily: "var(--font-mono)" }}>
                  {item.min_stock}
                </TD>
                <TD>
                  <Badge
                    label={ITEM_STATUS_LABELS[s]}
                    bg={sc.bg}
                    color={sc.color}
                  />
                </TD>
                <TD muted style={{ fontSize: 12 }}>
                  {item.updated_at
                    ? new Date(item.updated_at).toLocaleDateString()
                    : "—"}
                </TD>
                <TD>
                  <div style={{ display: "flex", gap: 5 }}>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setModal(item)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openAudit(item)}
                    >
                      Log
                    </Button>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(item)}
                      >
                        Del
                      </Button>
                    )}
                  </div>
                </TD>
              </TableRow>
            );
          })}
        </Table>
      )}

      {modal !== null && (
        <ItemModal
          item={modal?.id ? modal : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {auditItem && (
        <AuditModal
          item={auditItem}
          logs={auditLogs}
          loading={auditLoading}
          onClose={() => setAuditItem(null)}
        />
      )}
    </div>
  );
}

function ItemModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    name: "",
    category: CATEGORY_OPTIONS[0],
    quantity: 0,
    min_stock: 10,
    unit: "unit",
    supplier: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        category: item.category || CATEGORY_OPTIONS[0],
        quantity: item.quantity ?? 0,
        min_stock: item.min_stock ?? 10,
        unit: item.unit || "unit",
        supplier: item.supplier || "",
        notes: item.notes || "",
      });
    }
  }, [item]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        quantity: Number(form.quantity),
        min_stock: Number(form.min_stock),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={item ? "Edit Inventory Item" : "Add Inventory Item"}
      subtitle="Use clean inventory information for easy tracking."
      onClose={onClose}
      width={760}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <Input
          label="Item Name"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Printer Paper"
        />
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Select
            label="Category"
            value={form.category}
            onChange={set("category")}
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Input
            label="Unit"
            value={form.unit}
            onChange={set("unit")}
            placeholder="unit, box, kg, litre"
          />
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Input
            label="Quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={set("quantity")}
          />
          <Input
            label="Minimum Stock"
            type="number"
            min="0"
            value={form.min_stock}
            onChange={set("min_stock")}
          />
        </div>
        <Input
          label="Supplier"
          value={form.supplier}
          onChange={set("supplier")}
          placeholder="Supplier name"
        />
        <Textarea
          label="Notes"
          rows={3}
          value={form.notes}
          onChange={set("notes")}
          placeholder="Optional notes"
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 22,
        }}
      >
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button icon="solar:diskette-broken" onClick={save} disabled={saving}>
          {saving ? "Saving..." : item ? "Save Changes" : "Create Item"}
        </Button>
      </div>
    </Modal>
  );
}

function AuditModal({ item, logs, loading, onClose }) {
  return (
    <Modal
      title={`Audit Log — ${item.name}`}
      subtitle="Stock movement and item update history"
      onClose={onClose}
      width={860}
    >
      {loading ? (
        <Spinner label="Loading audit log..." />
      ) : logs.length === 0 ? (
        <EmptyState
          message="No audit records"
          sub="No activity has been recorded for this item yet."
          icon="solar:history-broken"
        />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {logs.map((log) => (
            <Card
              key={log.id || `${log.created_at}-${log.action}`}
              style={{
                boxShadow: "none",
                background: "var(--color-primary-50)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>
                    {log.action || "Inventory Update"}
                  </div>
                  <div
                    style={{
                      color: "var(--text-muted)",
                      marginTop: 5,
                      fontSize: 13,
                    }}
                  >
                    {log.note || log.remarks || "—"}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    color: "var(--text-muted)",
                    fontSize: 12.5,
                  }}
                >
                  <div>{formatDateTime(log.created_at)}</div>
                  <div>
                    {log.user?.full_name || log.user?.username || "System"}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Modal>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 7,
  fontSize: 11.5,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--text-secondary)",
};

const inputStyle = {
  width: "100%",
  height: 42,
  border: "1.5px solid var(--color-primary-100)",
  borderRadius: 4,
  background: "#ffffff",
  outline: "none",
  padding: "0 13px",
  fontSize: 13.5,
  fontWeight: 650,
};

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}
