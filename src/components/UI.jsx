import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

const variantStyles = {
  primary: {
    bg: "var(--brand)",
    color: "#ffffff",
    border: "var(--brand)",
    hover: "var(--brand-hover)",
  },
  secondary: {
    bg: "var(--surface)",
    color: "var(--color-primary-700)",
    border: "var(--color-primary-100)",
    hover: "var(--color-primary-50)",
  },
  ghost: {
    bg: "transparent",
    color: "var(--text-secondary)",
    border: "transparent",
    hover: "var(--color-primary-50)",
  },
  success: {
    bg: "var(--color-success-500)",
    color: "#ffffff",
    border: "var(--color-success-500)",
    hover: "var(--color-success-600)",
  },
  danger: {
    bg: "var(--color-danger-500)",
    color: "#ffffff",
    border: "var(--color-danger-500)",
    hover: "var(--color-danger-600)",
  },
  warn: {
    bg: "var(--color-warn-500)",
    color: "var(--color-black-500)",
    border: "var(--color-warn-500)",
    hover: "var(--color-warn-600)",
  },
  info: {
    bg: "var(--color-info-500)",
    color: "#ffffff",
    border: "var(--color-info-500)",
    hover: "var(--color-info-600)",
  },
};

const sizeStyles = {
  sm: { height: 34, padding: "0 12px", fontSize: 12.5, borderRadius: 10 },
  md: { height: 42, padding: "0 16px", fontSize: 13.5, borderRadius: 12 },
  lg: { height: 50, padding: "0 20px", fontSize: 14.5, borderRadius: 14 },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  style,
  disabled,
  ...props
}) {
  const v = variantStyles[variant] || variantStyles.primary;
  const s = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        height: s.height,
        padding: s.padding,
        borderRadius: 8,
        border: `1px solid ${v.border}`,
        background: v.bg,
        color: v.color,
        fontSize: s.fontSize,
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        boxShadow:
          variant === "primary" && !disabled
            ? "0 14px 26px rgba(91, 103, 168, 0.22)"
            : "none",
        transition: "var(--transition)",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = v.hover;
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = v.bg;
        props.onMouseLeave?.(e);
      }}
    >
      {icon && <Icon icon={icon} width="18" height="18" />}
      {children}
      {iconRight && <Icon icon={iconRight} width="18" height="18" />}
    </button>
  );
}

export function Card({ children, style, hover = false, ...props }) {
  return (
    <div
      {...props}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-xs)",
        padding: 20,
        boxShadow: "var(--shadow-sm)",
        transition: "var(--transition)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "var(--shadow)";
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        }
      }}
    >
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-xs)",
              display: "grid",
              placeItems: "center",
              background: "var(--color-secondary-50)",
              color: "var(--color-secondary-600)",
              border: "1px solid var(--color-secondary-100)",
            }}
          >
            <Icon icon={icon} width="24" height="24" />
          </div>
        )}
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
              lineHeight: 1.15,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                margin: "7px 0 0",
                color: "var(--text-muted)",
                fontSize: 14.5,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div style={{ display: "flex", gap: 10 }}>{action}</div>}
    </div>
  );
}

export function Badge({
  label,
  bg = "var(--color-primary-50)",
  color = "var(--color-primary-700)",
  icon,
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 9px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 11.5,
        fontWeight: 800,
        lineHeight: 1,
        border: "1px solid rgba(3, 0, 31, 0.04)",
        whiteSpace: "nowrap",
      }}
    >
      {icon && <Icon icon={icon} width="14" height="14" />}
      {label}
    </span>
  );
}

export function Spinner({ label = "Loading..." }) {
  return (
    <div
      style={{
        padding: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        color: "var(--text-muted)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "3px solid var(--color-primary-100)",
          borderTopColor: "var(--brand)",
          animation: "spin 0.75s linear infinite",
        }}
      />
      <span style={{ fontSize: 13, fontWeight: 700 }}>{label}</span>
    </div>
  );
}

export function EmptyState({
  message = "No data found.",
  sub = "There is nothing to show here yet.",
  icon = "solar:box-minimalistic-broken",
  action,
}) {
  return (
    <Card style={{ textAlign: "center", padding: 44 }}>
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 20,
          margin: "0 auto 16px",
          display: "grid",
          placeItems: "center",
          background: "var(--color-primary-50)",
          color: "var(--color-primary-500)",
        }}
      >
        <Icon icon={icon} width="30" height="30" />
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
        {message}
      </div>
      {sub && (
        <div style={{ color: "var(--text-muted)", fontSize: 13.5 }}>{sub}</div>
      )}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </Card>
  );
}

let activeModalCount = 0;
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";

function useBodyScrollLock() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (activeModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousBodyPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      if (scrollbarWidth > 0) {
        const currentPaddingRight =
          parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
        document.body.style.paddingRight = `${
          currentPaddingRight + scrollbarWidth
        }px`;
      }

      document.body.style.overflow = "hidden";
    }

    activeModalCount += 1;

    return () => {
      activeModalCount = Math.max(activeModalCount - 1, 0);

      if (activeModalCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        document.body.style.paddingRight = previousBodyPaddingRight;
      }
    };
  }, []);
}

export function Modal({ title, subtitle, children, onClose, width = 720 }) {
  useBodyScrollLock();

  const modalWidth = typeof width === "number" ? `${width}px` : width;

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        background: "rgba(3, 0, 31, 0.56)",
        display: "grid",
        placeItems: "center",
        padding: 22,
        zIndex: 9999,
        backdropFilter: "blur(8px)",
        overflow: "hidden",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          width: `min(100%, ${modalWidth})`,
          maxHeight: "calc(100dvh - 44px)",
          overflow: "auto",
          overscrollBehavior: "contain",
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--color-primary-100)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "22px 24px",
            borderBottom: "1px solid var(--border-soft)",
            gap: 16,
            position: "sticky",
            top: 0,
            background: "var(--surface)",
            zIndex: 1,
          }}
        >
          <div>
            <h2
              id="modal-title"
              style={{ margin: 0, fontSize: 20, letterSpacing: "-0.03em" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: 38,
              height: 38,
              borderRadius: "var(--radius-xs)",
              border: "1px solid var(--border-soft)",
              background: "var(--color-primary-50)",
              color: "var(--text-secondary)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              flex: "0 0 auto",
            }}
          >
            <Icon icon="solar:close-circle-broken" width="22" height="22" />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Toast({ toast }) {
  if (!toast) return null;

  const map = {
    ok: {
      bg: "var(--color-success-50)",
      color: "var(--color-success-800)",
      border: "var(--color-success-100)",
      icon: "solar:check-circle-bold",
    },
    err: {
      bg: "var(--color-danger-50)",
      color: "var(--color-danger-800)",
      border: "var(--color-danger-100)",
      icon: "solar:danger-triangle-bold",
    },
    warn: {
      bg: "var(--color-warn-50)",
      color: "var(--color-warn-800)",
      border: "var(--color-warn-100)",
      icon: "solar:info-circle-bold",
    },
  };
  const s = map[toast.type] || map.ok;

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 1200,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: "var(--shadow)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontWeight: 800,
        maxWidth: 420,
      }}
    >
      <Icon icon={s.icon} width="20" height="20" />
      {toast.msg}
    </div>
  );
}

export function FieldLabel({ children }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 7,
        fontSize: 11.5,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-secondary)",
      }}
    >
      {children}
    </label>
  );
}

const controlStyle = {
  width: "100%",
  minHeight: 42,
  border: "1.5px solid var(--color-primary-100)",
  borderRadius: 4,
  background: "#ffffff",
  color: "var(--text-primary)",
  outline: "none",
  padding: "0 13px",
  fontSize: 13.5,
  fontWeight: 600,
  transition: "var(--transition)",
};

function focusControl(e) {
  e.target.style.borderColor = "var(--brand)";
  e.target.style.boxShadow = "0 0 0 4px rgba(91, 103, 168, 0.12)";
}

function blurControl(e) {
  e.target.style.borderColor = "var(--color-primary-100)";
  e.target.style.boxShadow = "none";
}

export function Input({ label, style, ...props }) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        {...props}
        onFocus={focusControl}
        onBlur={blurControl}
        style={{ ...controlStyle, ...style }}
      />
    </div>
  );
}

export function Select({ label, children, style, ...props }) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <select
        {...props}
        onFocus={focusControl}
        onBlur={blurControl}
        style={{ ...controlStyle, ...style }}
      >
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, rows = 3, style, ...props }) {
  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <textarea
        {...props}
        rows={rows}
        onFocus={focusControl}
        onBlur={blurControl}
        style={{
          ...controlStyle,
          minHeight: rows * 26 + 24,
          padding: "11px 13px",
          resize: "vertical",
          ...style,
        }}
      />
    </div>
  );
}

export function StatCard({
  title,
  value,
  icon,
  tone = "primary",
  sub,
  onClick,
}) {
  const toneMap = {
    primary: ["var(--color-primary-50)", "var(--color-primary-600)"],
    secondary: ["var(--color-secondary-50)", "var(--color-secondary-600)"],
    success: ["var(--color-success-50)", "var(--color-success-600)"],
    danger: ["var(--color-danger-50)", "var(--color-danger-600)"],
    info: ["var(--color-info-50)", "var(--color-info-600)"],
    warn: ["var(--color-warn-50)", "var(--color-warn-700)"],
  };
  const [bg, color] = toneMap[tone] || toneMap.primary;

  return (
    <Card
      hover={!!onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 16 }}
      >
        <div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 12.5,
              fontWeight: 800,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            {value ?? 0}
          </div>
          {sub && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12.5,
                color: "var(--text-muted)",
              }}
            >
              {sub}
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: bg,
              color,
              flexShrink: 0,
            }}
          >
            <Icon icon={icon} width="25" height="25" />
          </div>
        )}
      </div>
    </Card>
  );
}

export function SectionTitle({ children, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 800,
        color: "var(--text-primary)",
        marginBottom: 14,
      }}
    >
      {icon && (
        <Icon
          icon={icon}
          width="18"
          height="18"
          style={{ color: "var(--brand)" }}
        />
      )}
      {children}
    </div>
  );
}

export function Table({ children, headers = [], style, ...props }) {
  return (
    <div
      {...props}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-xs)",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
        ...style,
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}
        >
          {headers.length > 0 && (
            <thead>
              <tr style={{ background: "var(--color-primary-50)" }}>
                {headers.map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 16px",
                      textAlign: "left",
                      color: "var(--text-secondary)",
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: "1px solid var(--border-soft)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function TableRow({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        transition: "var(--transition)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--color-primary-50)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
    >
      {children}
    </tr>
  );
}

export function TD({ children, style }) {
  return (
    <td
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid var(--border-soft)",
        fontSize: 13.5,
        verticalAlign: "middle",
        color: "var(--text-primary)",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

export function InfoGrid({ items = [], columns = 3 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 12,
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            padding: 14,
            borderRadius: 14,
            background: "var(--color-primary-50)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              marginTop: 5,
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            {item.value || "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusTimeline({ steps = [] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {steps.map((step, index) => (
        <div
          key={step.label}
          style={{ display: "flex", gap: 12, position: "relative" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: step.done
                  ? "var(--color-success-500)"
                  : step.active
                    ? "var(--color-primary-500)"
                    : "var(--color-primary-100)",
                color:
                  step.done || step.active
                    ? "#ffffff"
                    : "var(--color-primary-600)",
                zIndex: 1,
              }}
            >
              <Icon
                icon={
                  step.done
                    ? "solar:check-circle-bold"
                    : "solar:clock-circle-broken"
                }
                width="16"
                height="16"
              />
            </div>
            {index < steps.length - 1 && (
              <div
                style={{
                  width: 2,
                  flex: 1,
                  minHeight: 18,
                  background: "var(--color-primary-100)",
                }}
              />
            )}
          </div>
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>{step.label}</div>
            {step.meta && (
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: 12.5,
                  marginTop: 2,
                }}
              >
                {step.meta}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
