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
  user: "User (Demander)",
  demand_controller: "Demand Controller",
  approver_l1: "Dept Head (L1)",
  approver_l2: "CO (L2)",
  approver_l3: "Commandant (L3)",
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
  draft: { bg: "#F1EFE8", color: "#5F5E5A" },
  submitted: { bg: "#E6F1FB", color: "#185FA5" },
  forwarded: { bg: "#EEEDFE", color: "#534AB7" },
  approved_l1: { bg: "#FFF3E0", color: "#E65100" },
  approved_l2: { bg: "#FFF3E0", color: "#BF360C" },
  approved_l3: { bg: "#EAF3DE", color: "#3B6D11" },
  rejected: { bg: "#FCEBEB", color: "#A32D2D" },
  issue_order_created: { bg: "#E6F1FB", color: "#185FA5" },
  gate_pass_issued: { bg: "#EEEDFE", color: "#534AB7" },
  withdrawn: { bg: "#F1EFE8", color: "#5F5E5A" },
};

export const PRIORITY_COLORS = {
  low:    { bg: "#F1EFE8", color: "#5F5E5A" },
  normal: { bg: "#E6F1FB", color: "#185FA5" },
  urgent: { bg: "#FCEBEB", color: "#A32D2D" },
};

export function getItemStatus(item) {
  if (item.quantity === 0 || item.quantity < item.min_stock * 0.5) return "critical";
  if (item.quantity < item.min_stock) return "low";
  return "ok";
}

export const ITEM_STATUS_COLORS = {
  ok: { bg: "#EAF3DE", color: "#3B6D11" },
  low: { bg: "#FAEEDA", color: "#854F0B" },
  critical: { bg: "#FCEBEB", color: "#A32D2D" },
};
export const ITEM_STATUS_LABELS = { ok: "In Stock", low: "Low Stock", critical: "Critical" };

export const CAT_COLORS = {
  Medical:        { bg: "#E6F1FB", color: "#185FA5" },
  Food:           { bg: "#EAF3DE", color: "#3B6D11" },
  Clothing:       { bg: "#F1EFE8", color: "#5F5E5A" },
  Maintenance:    { bg: "#FAEEDA", color: "#854F0B" },
  Security:       { bg: "#FCEBEB", color: "#A32D2D" },
  Administrative: { bg: "#EEEDFE", color: "#534AB7" },
};
