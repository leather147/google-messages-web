"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "@/store/useChatStore";
import { deleteMessage } from "@/services/mockApi";
import type { Message } from "@/types/global";

interface ContextMenuProps {
  message: Message;
  position: { x: number; y: number };
  onClose: () => void;
  onReact: (messageId: string) => void;
  onReply: (messageId: string) => void;
}

export function ContextMenu({ message, position, onClose, onReact, onReply }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust to stay inside viewport
  const menuWidth = 200;
  const menuHeight = 230;
  const adjustedX = Math.min(position.x, window.innerWidth - menuWidth - 8);
  const adjustedY = Math.min(position.y, window.innerHeight - menuHeight - 8);

  async function handleDelete() {
    useChatStore.getState().patchMessage(message.id, message.conversationId, { isDeleted: true });
    await deleteMessage(message.id, message.conversationId);
    queryClient.invalidateQueries({ queryKey: ["messages", message.conversationId] });
    onClose();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.text);
    } catch {
      // Clipboard not available
    }
    onClose();
  }

  const menuItems = [
    {
      icon: "add_reaction",
      label: "React",
      onClick: () => {
        onReact(message.id);
        onClose();
      },
    },
    {
      icon: "reply",
      label: "Reply",
      onClick: () => {
        onReply(message.id);
        onClose();
      },
    },
    {
      icon: "content_copy",
      label: "Copy text",
      onClick: handleCopy,
    },
    {
      icon: "forward",
      label: "Forward",
      onClick: onClose,
    },
    ...(message.direction === "outgoing"
      ? [
          {
            icon: "delete",
            label: "Delete",
            onClick: handleDelete,
            danger: true,
          },
        ]
      : []),
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.12 }}
      style={{
        position: "fixed",
        top: adjustedY,
        left: adjustedX,
        zIndex: 9999,
        background: "var(--md-sys-color-surface-container-high)",
        borderRadius: 16,
        minWidth: menuWidth,
        boxShadow: "0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)",
        overflow: "hidden",
        paddingTop: 8,
        paddingBottom: 8,
      }}
      role="menu"
      aria-label="Message options"
    >
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors text-left"
          style={{
            color: (item as { danger?: boolean }).danger
              ? "var(--md-sys-color-error)"
              : "var(--md-sys-color-on-surface)",
            fontSize: 14,
          }}
          role="menuitem"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: "inherit" }}
            aria-hidden="true"
          >
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}
