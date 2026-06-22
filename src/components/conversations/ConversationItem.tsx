"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { formatConversationTime } from "@/lib/dateUtils";
import type { Conversation } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onContextMenu?: (id: string, e: React.MouseEvent) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onContextMenu,
}: ConversationItemProps) {
  const {
    id,
    name,
    initials,
    avatar,
    avatarColor,
    lastMessage,
    updatedAt,
    pinned,
    unreadCount,
    isGroup,
  } = conversation;

  const hasUnread = unreadCount > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15 }}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors text-left relative"
        style={{
          background: isActive
            ? "var(--md-sys-color-secondary-container)"
            : "transparent",
          color: isActive
            ? "var(--md-sys-color-on-secondary-container)"
            : "var(--md-sys-color-on-surface)",
        }}
        onClick={() => onSelect(id)}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu?.(id, e);
        }}
        aria-label={`Conversation with ${name}${hasUnread ? `, ${unreadCount} unread` : ""}`}
        aria-current={isActive ? "true" : undefined}
      >
        {/* Hover / active ripple layer */}
        {!isActive && (
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: "var(--md-sys-color-surface-container-high)" }}
            aria-hidden="true"
          />
        )}

        {/* Avatar */}
        <div className="relative z-10 shrink-0">
          <Avatar
            name={name}
            initials={initials}
            avatarColor={avatarColor}
            avatar={avatar}
            size={48}
            isGroup={isGroup}
          />
        </div>

        {/* Text content */}
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-medium truncate"
              style={{
                fontSize: 15,
                color: isActive
                  ? "var(--md-sys-color-on-secondary-container)"
                  : "var(--md-sys-color-on-surface)",
              }}
            >
              {name}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {pinned && !isActive && (
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 14,
                    color: "var(--md-sys-color-primary)",
                    fontVariationSettings: "'FILL' 1",
                  }}
                  aria-label="Pinned"
                >
                  push_pin
                </span>
              )}
              <span
                className={hasUnread ? "font-semibold" : ""}
                style={{
                  fontSize: 12,
                  color: hasUnread
                    ? "var(--md-sys-color-primary)"
                    : "var(--md-sys-color-on-surface-variant)",
                }}
              >
                {formatConversationTime(updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span
              className="text-sm truncate"
              style={{
                color: isActive
                  ? "var(--md-sys-color-on-secondary-container)"
                  : "var(--md-sys-color-on-surface-variant)",
                opacity: isActive ? 0.85 : 1,
                fontSize: 13,
              }}
            >
              {lastMessage}
            </span>

            {hasUnread && (
              <div
                className="shrink-0 min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5"
                style={{
                  background: "var(--md-sys-color-primary)",
                  color: "var(--md-sys-color-on-primary)",
                  fontSize: 11,
                  fontWeight: 600,
                }}
                aria-label={`${unreadCount} unread messages`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </div>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}
