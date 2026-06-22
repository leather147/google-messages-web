"use client";

import { motion } from "framer-motion";
import { formatMessageTime } from "@/lib/dateUtils";
import type { Message } from "@/types/global";

interface MessageBubbleProps {
  message: Message;
  isGrouped: boolean; // same sender, within 3 min of previous
  isLastInGroup: boolean; // last in a consecutive run
  onContextMenu: (messageId: string, e: React.MouseEvent) => void;
  onReactionClick: (messageId: string, e?: React.MouseEvent) => void;
  isOptimistic?: boolean;
  replyToMessage?: Message | null;
}

const STATUS_ICONS: Record<string, string> = {
  sent: "check",
  delivered: "done",
  read: "done_all",
};

export function MessageBubble({
  message,
  isGrouped,
  isLastInGroup,
  onContextMenu,
  onReactionClick,
  isOptimistic = false,
  replyToMessage,
}: MessageBubbleProps) {
  const isOutgoing = message.direction === "outgoing";

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"} px-4 py-0.5`}>
        <div
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl"
          style={{
            background: "transparent",
            border: "1px solid var(--md-sys-color-outline-variant)",
            color: "var(--md-sys-color-on-surface-variant)",
            fontStyle: "italic",
            fontSize: 13,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
            block
          </span>
          Message deleted
        </div>
      </div>
    );
  }

  // Bubble shape: Material 3 "chat bubble" style
  // Outgoing: rounded except bottom-right corner (tail)
  // Incoming: rounded except bottom-left corner (tail)
  const outgoingRadius = isLastInGroup
    ? "20px 20px 4px 20px"
    : "20px 20px 20px 20px";
  const incomingRadius = isLastInGroup
    ? "20px 20px 20px 4px"
    : "20px 20px 20px 20px";
  const groupedRadius = "20px";

  const borderRadius = isGrouped
    ? groupedRadius
    : isOutgoing
    ? outgoingRadius
    : incomingRadius;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: isOptimistic ? 0.7 : 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`flex flex-col ${isOutgoing ? "items-end" : "items-start"} px-4 ${
        isGrouped ? "py-0.5" : "py-1"
      }`}
    >
      {/* Bubble */}
      <div
        className="group relative max-w-[75%] lg:max-w-[65%] cursor-pointer"
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(message.id, e);
        }}
      >
        <div
          className="text-sm leading-relaxed break-words select-text"
          style={{
            borderRadius,
            background: isOutgoing
              ? "var(--md-sys-color-primary)"
              : "var(--md-sys-color-surface-container-high)",
            color: isOutgoing
              ? "var(--md-sys-color-on-primary)"
              : "var(--md-sys-color-on-surface)",
            fontSize: 14,
            lineHeight: "1.5",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            overflow: "hidden",
          }}
        >
          {/* Reply quote block */}
          {replyToMessage && !replyToMessage.isDeleted && (
            <div
              className="flex items-stretch gap-2 px-3 pt-2 pb-1"
              style={{
                borderBottom: isOutgoing
                  ? "1px solid rgba(255,255,255,0.2)"
                  : "1px solid var(--md-sys-color-outline-variant)",
              }}
            >
              <div
                className="w-0.5 shrink-0 rounded-full"
                style={{
                  background: isOutgoing
                    ? "rgba(255,255,255,0.6)"
                    : "var(--md-sys-color-primary)",
                  minHeight: 28,
                }}
              />
              <div className="min-w-0 flex-1">
                <p
                  className="font-medium truncate"
                  style={{
                    fontSize: 11,
                    color: isOutgoing
                      ? "rgba(255,255,255,0.8)"
                      : "var(--md-sys-color-primary)",
                    marginBottom: 1,
                  }}
                >
                  {replyToMessage.direction === "outgoing" ? "You" : "Them"}
                </p>
                <p
                  className="truncate"
                  style={{
                    fontSize: 12,
                    color: isOutgoing
                      ? "rgba(255,255,255,0.75)"
                      : "var(--md-sys-color-on-surface-variant)",
                  }}
                >
                  {replyToMessage.text}
                </p>
              </div>
            </div>
          )}
          <div className="px-4 py-2">{message.text}</div>
        </div>

        {/* Quick reaction hover button */}
        <button
          className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            [isOutgoing ? "left" : "right"]: -36,
            top: "50%",
            transform: "translateY(-50%)",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--md-sys-color-surface-container-high)",
            border: "1px solid var(--md-sys-color-outline-variant)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={(e) => onReactionClick(message.id, e)}
          aria-label="Add reaction"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 16, color: "var(--md-sys-color-on-surface-variant)" }}
            aria-hidden="true"
          >
            add_reaction
          </span>
        </button>
      </div>

      {/* Reactions */}
      {message.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {message.reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full transition-colors"
              style={{
                background: "var(--md-sys-color-surface-container-high)",
                border: "1px solid var(--md-sys-color-outline-variant)",
                fontSize: 12,
                cursor: "pointer",
              }}
              onClick={(e) => onReactionClick(message.id, e)}
              aria-label={`${reaction.emoji} reaction, ${reaction.count}`}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 1 && (
                <span style={{ color: "var(--md-sys-color-on-surface-variant)", fontSize: 11 }}>
                  {reaction.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Timestamp + status (only on last in group or single) */}
      {isLastInGroup && (
        <div
          className="flex items-center gap-1 mt-0.5"
          style={{
            color: "var(--md-sys-color-on-surface-variant)",
            fontSize: 11,
          }}
        >
          <span>{formatMessageTime(message.timestamp)}</span>
          {isOutgoing && (
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 14,
                color:
                  message.status === "read"
                    ? "var(--md-sys-color-primary)"
                    : "var(--md-sys-color-on-surface-variant)",
                fontVariationSettings: "'FILL' 0",
              }}
              aria-label={message.status}
            >
              {STATUS_ICONS[message.status] ?? "check"}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
