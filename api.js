const BASE = "http://localhost:8000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  login: (username, password) => {
    const body = new URLSearchParams({ username, password });
    return fetch(`${BASE}/auth/login`, { method: "POST", body }).then(async (r) => {
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail); }
      return r.json();
    });
  },
  me: () => request("/auth/me"),

  // Users (admin)
  getUsers: (role) => request(`/users${role ? "?role=" + role : ""}`),
  createUser: (data) => request("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),

  // Items
  getItems: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString();
    return request(`/items${qs ? "?" + qs : ""}`);
  },
  createItem: (data) => request("/items", { method: "POST", body: JSON.stringify(data) }),
  updateItem: (id, data) => request(`/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  adjustQuantity: (id, delta, note) => request(`/items/${id}/quantity`, { method: "PATCH", body: JSON.stringify({ delta, note }) }),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE" }),
  getStats: () => request("/stats"),
  getCategories: () => request("/categories"),
  getAudit: (itemId) => request(`/audit${itemId ? "?item_id=" + itemId : ""}`),

  // Demand Forms
  getDemands: () => request("/demands"),
  getDemand: (id) => request(`/demands/${id}`),
  createDemand: (data) => request("/demands", { method: "POST", body: JSON.stringify(data) }),
  submitDemand: (id) => request(`/demands/${id}/submit`, { method: "POST" }),
  forwardDemand: (id, dc_id) => request(`/demands/${id}/forward`, { method: "POST", body: JSON.stringify({ dc_id }) }),
  approveDemand: (id, data) => request(`/demands/${id}/approve`, { method: "POST", body: JSON.stringify(data) }),

  // Issue Orders
  getIssueOrders: () => request("/issue-orders"),
  getIssueOrder: (id) => request(`/issue-orders/${id}`),
  createIssueOrder: (data) => request("/issue-orders", { method: "POST", body: JSON.stringify(data) }),

  // Gate Passes
  getGatePasses: () => request("/gate-passes"),
  getGatePass: (id) => request(`/gate-passes/${id}`),
  createGatePass: (data) => request("/gate-passes", { method: "POST", body: JSON.stringify(data) }),
  withdrawItems: (id) => request(`/gate-passes/${id}/withdraw`, { method: "POST" }),

  // Notifications
  getNotifications: () => request("/notifications"),
  markRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request("/notifications/read-all", { method: "POST" }),
};
