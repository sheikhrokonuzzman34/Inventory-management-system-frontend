import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Badge, Button, Modal, PageHeader, Spinner, EmptyState } from "../components/UI";
import { ROLE_LABELS, ROLES } from "../utils/roles";

const ROLE_OPTIONS = Object.entries(ROLE_LABELS);
const inp = { padding: "8px 10px", fontSize: 14, border: "1px solid #ddd", borderRadius: 6, outline: "none", width: "100%", boxSizing: "border-box" };
const lbl = { fontSize: 12, color: "#666", display: "block", marginBottom: 4 };

function UserModal({ user, onSave, onClose }) {
  const editing = !!user?.id;
  const [form, setForm] = useState({ username: "", full_name: "", email: "", password: "", role: ROLES.USER, department: "", is_active: true });
  const [saving, setSaving] = useState(false);
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  useEffect(() => { if (user?.id) setForm({ ...user, password: "" }); }, [user]);
  const save = async () => {
    setSaving(true);
    try { await onSave(form); onClose(); } finally { setSaving(false); }
  };
  return (
    <Modal title={editing ? "Edit User" : "Create User"} onClose={onClose}>
      <div style={{ display: "grid", gap: 14 }}>
        <div><label style={lbl}>Username {!editing && "*"}</label><input style={inp} value={form.username} onChange={set("username")} disabled={editing} /></div>
        <div><label style={lbl}>Full Name *</label><input style={inp} value={form.full_name} onChange={set("full_name")} /></div>
        <div><label style={lbl}>Email *</label><input style={inp} value={form.email} onChange={set("email")} /></div>
        <div><label style={lbl}>{editing ? "New Password (leave blank to keep)" : "Password *"}</label>
          <input style={inp} type="password" value={form.password} onChange={set("password")} placeholder={editing ? "Leave blank to keep current" : ""} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Role</label>
            <select style={inp} value={form.role} onChange={set("role")}>
              {ROLE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Department</label><input style={inp} value={form.department || ""} onChange={set("department")} /></div>
        </div>
        {editing && (
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
            <input type="checkbox" checked={form.is_active} onChange={set("is_active")} /> Active account
          </label>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : editing ? "Save Changes" : "Create User"}</Button>
      </div>
    </Modal>
  );
}

export default function UsersPage({ showToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");

  const load = () => {
    setLoading(true);
    api.getUsers(roleFilter || undefined).then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [roleFilter]);

  const handleSave = async (form) => {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (form.id) await api.updateUser(form.id, payload);
    else await api.createUser(payload);
    showToast(form.id ? "User updated." : "User created.");
    load();
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    await api.deleteUser(user.id);
    showToast("User deleted.", "warn");
    load();
  };

  const roleColor = (role) => {
    const map = { admin: { bg: "#FCEBEB", color: "#A32D2D" }, demand_controller: { bg: "#E6F1FB", color: "#185FA5" },
      store_controller: { bg: "#FAEEDA", color: "#854F0B" }, user: { bg: "#EAF3DE", color: "#3B6D11" },
      approver_l1: { bg: "#EEEDFE", color: "#534AB7" }, approver_l2: { bg: "#EEEDFE", color: "#534AB7" }, approver_l3: { bg: "#EEEDFE", color: "#534AB7" } };
    return map[role] || { bg: "#f0f0f0", color: "#666" };
  };

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage system accounts and roles"
        action={<Button onClick={() => setModal({})}>+ Create User</Button>}
      />

      <div style={{ marginBottom: 16 }}>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: "8px 10px", fontSize: 13, border: "1px solid #ddd", borderRadius: 6, outline: "none" }}>
          <option value="">All roles</option>
          {ROLE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : users.length === 0 ? <EmptyState message="No users found." /> : (
        <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                {["Name", "Username", "Email", "Role", "Department", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: "#888",
                    borderBottom: "1px solid #eee", textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const rc = roleColor(u.role);
                return (
                  <tr key={u.id} style={{ background: "#fff" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", fontWeight: 500 }}>{u.full_name}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", color: "#888" }}>{u.username}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", color: "#888" }}>{u.email}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <Badge label={ROLE_LABELS[u.role]} bg={rc.bg} color={rc.color} />
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5", color: "#888" }}>{u.department || "—"}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <Badge label={u.is_active ? "Active" : "Disabled"} bg={u.is_active ? "#EAF3DE" : "#f0f0f0"} color={u.is_active ? "#3B6D11" : "#888"} />
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Button size="sm" variant="secondary" onClick={() => setModal(u)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(u)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && <UserModal user={modal?.id ? modal : null} onSave={handleSave} onClose={() => setModal(null)} />}
    </div>
  );
}
