import type { MessageStatus } from "@/types/global";

interface StatusIconProps {
  status: MessageStatus;
  className?: string;
}

export default function StatusIcon({ status, className = "" }: StatusIconProps) {
  const iconMap: Record<MessageStatus, { icon: string; title: string; color: string }> = {
    sent: { icon: "done", title: "Sent", color: "var(--md-sys-color-on-surface-variant)" },
    delivered: { icon: "done_all", title: "Delivered", color: "var(--md-sys-color-on-surface-variant)" },
    read: { icon: "done_all", title: "Read", color: "var(--md-sys-color-primary)" },
  };

  const { icon, title, color } = iconMap[status];

  return (
    <span
      title={title}
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: 14, color, lineHeight: 1 }}
      aria-label={title}
    >
      {icon}
    </span>
  );
}
