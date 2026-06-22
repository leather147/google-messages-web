import React from "react";

interface IconButtonProps {
  icon: string;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "standard" | "filled" | "tonal";
  badge?: number;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const SIZE_MAP = {
  sm: { btn: 32, icon: 18 },
  md: { btn: 40, icon: 24 },
  lg: { btn: 48, icon: 24 },
};

export default function IconButton({
  icon,
  label,
  onClick,
  disabled = false,
  size = "md",
  variant = "standard",
  badge,
  className = "",
  type = "button",
}: IconButtonProps) {
  const dims = SIZE_MAP[size];

  const variantStyles: Record<string, string> = {
    standard:
      "hover:bg-[var(--md-sys-color-on-surface)]/8 active:bg-[var(--md-sys-color-on-surface)]/12",
    filled:
      "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:brightness-110",
    tonal:
      "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:brightness-110",
  };

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`
        relative flex items-center justify-center rounded-full
        transition-colors duration-100 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-[var(--md-sys-color-primary)]
        focus-visible:outline-offset-2
        ${variantStyles[variant]}
        ${className}
      `}
      style={{ width: dims.btn, height: dims.btn, minWidth: dims.btn }}
    >
      <span
        className="material-symbols-outlined select-none"
        style={{
          fontSize: dims.icon,
          color:
            variant === "standard"
              ? "var(--md-sys-color-on-surface-variant)"
              : "inherit",
        }}
        aria-hidden="true"
      >
        {icon}
      </span>

      {badge !== undefined && badge > 0 && (
        <span
          className="absolute top-0.5 right-0.5 flex items-center justify-center
                     rounded-full text-[10px] font-medium leading-none"
          style={{
            minWidth: 16,
            height: 16,
            padding: "0 4px",
            background: "var(--md-sys-color-error)",
            color: "var(--md-sys-color-on-error)",
          }}
          aria-label={`${badge} unread`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}
