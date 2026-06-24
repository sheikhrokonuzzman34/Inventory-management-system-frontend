import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Badge, Button, Card, EmptyState, Input, Modal, PageHeader, Select, Spinner, Table, TableRow, TD } from "../components/UI";
import { ROLE_LABELS, ROLES } from "../utils/roles";

const ROLE_OPTIONS = Object.entries(ROLE_LABELS);

export default function UsersPage({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");

  const load = () => {
    setLoading(true);
    api.getUsers(roleFilter || undefined).then(setUsers).catch((e) => showToast(e.message, "err")).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [roleFilter]);

  const handleSave = async (form) => {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (form.id) await api.updateUser(form.id, payload);
    else await api.createUser(payload);
    showToast(form.id ? "User updated successfully." : "User created successfully.");
    load();
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    try {
      await api.deleteUser(user.id);
      showToast("User deleted.", "warn");
      load();
    } catch (e) {
      showToast(e.message, "err");
    }
  };

  return (
    <div>
      <PageHeader
        icon="solar:users-group-rounded-broken"
        title="User Management"
        subtitle="Manage Inventory Management System users, roles, and access status."
        action={<Button icon="solar:user-plus-broken" onClick={() => setModal({})}>Create User</Button>}
      />

      <Card style={{ marginBottom: 18 }}>
        <div style={{ maxWidth: 280 }}>
          <Select label="Filter by role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </div>
      </Card>

      {loading ? (
        <Spinner label="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState message="No users found" sub="Create a user account to provide system access." icon="solar:users-group-rounded-broken" />
      ) : (
        <Table headers={["Name", "Username", "Email", "Role", "Department", "Status", "Actions"]}>
          {users.map((user) => {
            const rc = roleColor(user.role);
            return (
              <TableRow key={user.id}>
                <TD style={{ fontWeight: 900 }}>{user.full_name || "—"}</TD>
                <TD>{user.username}</TD>
                <TD style={{ color: "var(--text-muted)" }}>{user.email || "—"}</TD>
                <TD><Badge label={ROLE_LABELS[user.role] || user.role} bg={rc.bg} color={rc.color} /></TD>
                <TD>{user.department || "—"}</TD>
                <TD>
                  <Badge
                    label={user.is_active ? "Active" : "Disabled"}
                    bg={user.is_active ? "var(--color-success-50)" : "var(--color-black-50)"}
                    color={user.is_active ? "var(--color-success-700)" : "var(--color-black-300)"}
                  />
                </TD>
                <TD>
                  <div style={{ display: "flex", gap: 7 }}>
                    <Button size="sm" variant="secondary" icon="solar:pen-new-square-broken" onClick={() => setModal(user)}>Edit</Button>
                    <Button size="sm" variant="danger" icon="solar:trash-bin-minimalistic-broken" onClick={() => handleDelete(user)}>Delete</Button>
                  </div>
                </TD>
              </TableRow>
            );
          })}
        </Table>
      )}

      {modal !== null && <UserModal user={modal?.id ? modal : null} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  );
}

function UserModal({ user, onSave, onClose }) {
  const editing = !!user?.id;
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    role: ROLES.USER,
    department: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) setForm({ ...user, password: "" });
  }, [user]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = async () => {
    if (!form.full_name || !form.email || (!editing && (!form.username || !form.password))) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? "Edit User" : "Create User"} subtitle="Assign access roles for the Inventory Management System." onClose={onClose} width={760}>
      <div style={{ display: "grid", gap: 16 }}>
        <Input label="Username" value={form.username} onChange={set("username")} disabled={editing} placeholder="username" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input label="Full Name" value={form.full_name} onChange={set("full_name")} placeholder="Full name" />
          <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="email@example.com" />
        </div>
        <Input
          label={editing ? "New Password (optional)" : "Password"}
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder={editing ? "Leave blank to keep current password" : "Set password"}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Select label="Role" value={form.role} onChange={set("role")}>
            {ROLE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <Input label="Department" value={form.department || ""} onChange={set("department")} placeholder="Department" />
        </div>
        {editing && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, color: "var(--text-secondary)" }}>
            <input type="checkbox" checked={!!form.is_active} onChange={set("is_active")} />
            Active account
          </label>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button icon="solar:diskette-broken" onClick={save} disabled={saving}>{saving ? "Saving..." : editing ? "Save Changes" : "Create User"}</Button>
      </div>
    </Modal>
  );
}

function roleColor(role) {
  const map = {
    admin: { bg: "var(--color-danger-50)", color: "var(--color-danger-700)" },
    demand_controller: { bg: "var(--color-info-50)", color: "var(--color-info-700)" },
    store_controller: { bg: "var(--color-warn-50)", color: "var(--color-warn-800)" },
    user: { bg: "var(--color-success-50)", color: "var(--color-success-700)" },
    approver_l1: { bg: "var(--color-secondary-50)", color: "var(--color-secondary-700)" },
    approver_l2: { bg: "var(--color-secondary-50)", color: "var(--color-secondary-700)" },
    approver_l3: { bg: "var(--color-secondary-50)", color: "var(--color-secondary-700)" },
  };
  return map[role] || { bg: "var(--color-primary-50)", color: "var(--color-primary-700)" };
}
