export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  DC: "demand_controller",
  L1: "approver_l1",
  L2: "approver_l2",
  L3: "approver_l3",
  SC: "store_controller",
};

export const ROLE_LABELS = {
  admin: "Admin",
  user: "Requester",
  demand_controller: "Demand Controller",
  approver_l1: "Department Approver (L1)",
  approver_l2: "Operations Approver (L2)",
  approver_l3: "Final Approver (L3)",
  store_controller: "Store Controller",
};

export const DEMAND_STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  forwarded: "Forwarded",
  approved_l1: "Approved (L1)",
  approved_l2: "Approved (L2)",
  approved_l3: "Fully Approved",
  rejected: "Rejected",
  issue_order_created: "Issue Order Created",
  gate_pass_issued: "Gate Pass Issued",
  withdrawn: "Withdrawn",
};

export const DEMAND_STATUS_COLORS = {
  draft: { bg: "var(--color-black-50)", color: "var(--color-black-400)" },
  submitted: { bg: "var(--color-info-50)", color: "var(--color-info-700)" },
  forwarded: { bg: "var(--color-secondary-50)", color: "var(--color-secondary-700)" },
  approved_l1: { bg: "var(--color-warn-50)", color: "var(--color-warn-800)" },
  approved_l2: { bg: "var(--color-primary-50)", color: "var(--color-primary-700)" },
  approved_l3: { bg: "var(--color-success-50)", color: "var(--color-success-700)" },
  rejected: { bg: "var(--color-danger-50)", color: "var(--color-danger-700)" },
  issue_order_created: { bg: "var(--color-info-50)", color: "var(--color-info-700)" },
  gate_pass_issued: { bg: "var(--color-secondary-50)", color: "var(--color-secondary-700)" },
  withdrawn: { bg: "var(--color-black-50)", color: "var(--color-black-400)" },
};

export const PRIORITY_COLORS = {
  low: { bg: "var(--color-success-50)", color: "var(--color-success-700)" },
  normal: { bg: "var(--color-info-50)", color: "var(--color-info-700)" },
  urgent: { bg: "var(--color-danger-50)", color: "var(--color-danger-700)" },
};

export function getItemStatus(item) {
  if (!item) return "ok";
  if (Number(item.quantity) === 0 || Number(item.quantity) < Number(item.min_stock || 0) * 0.5) return "critical";
  if (Number(item.quantity) < Number(item.min_stock || 0)) return "low";
  return "ok";
}

export const ITEM_STATUS_COLORS = {
  ok: { bg: "var(--color-success-50)", color: "var(--color-success-700)" },
  low: { bg: "var(--color-warn-50)", color: "var(--color-warn-800)" },
  critical: { bg: "var(--color-danger-50)", color: "var(--color-danger-700)" },
};

export const ITEM_STATUS_LABELS = {
  ok: "In Stock",
  low: "Low Stock",
  critical: "Critical",
};

export const CAT_COLORS = {
  Medical: { bg: "var(--color-info-50)", color: "var(--color-info-700)" },
  Food: { bg: "var(--color-success-50)", color: "var(--color-success-700)" },
  Clothing: { bg: "var(--color-primary-50)", color: "var(--color-primary-700)" },
  Maintenance: { bg: "var(--color-warn-50)", color: "var(--color-warn-800)" },
  "Office Supplies": { bg: "var(--color-secondary-50)", color: "var(--color-secondary-700)" },
  "Safety Equipment": { bg: "var(--color-danger-50)", color: "var(--color-danger-700)" },
  Administrative: { bg: "var(--color-secondary-50)", color: "var(--color-secondary-700)" },
  Security: { bg: "var(--color-danger-50)", color: "var(--color-danger-700)" },
};

export const CATEGORY_OPTIONS = [
  "Medical",
  "Food",
  "Clothing",
  "Maintenance",
  "Office Supplies",
  "Safety Equipment",
  "Administrative",
];
