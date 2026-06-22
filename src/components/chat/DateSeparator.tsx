"use client";

import { formatDateSeparator } from "@/lib/dateUtils";

interface DateSeparatorProps {
  isoDate: string;
}

export function DateSeparator({ isoDate }: DateSeparatorProps) {
  const label = formatDateSeparator(isoDate);
  return (
    <div
      className="flex items-center justify-center py-3 px-4"
      role="separator"
      aria-label={label}
    >
      <div
        className="px-4 py-1 rounded-full"
        style={{
          background: "var(--md-sys-color-surface-container-high)",
          color: "var(--md-sys-color-on-surface-variant)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </div>
    </div>
  );
}
