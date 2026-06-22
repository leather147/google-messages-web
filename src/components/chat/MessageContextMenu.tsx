"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store/useChatStore";
import { deleteMessage } from "@/services/mockApi";
import { useQueryClient } from "@tanstack/react-query";

interface MenuItem {
  icon: string;
  label: string;
  action: () => void;
  danger?: boolean;
}

export function MessageContextMenu() {
  const {
    contextMenu,
    closeContextMenu,
    openReactionPicker,
    patchMessage,
    messages,
  } = useChatStore();

  const menuRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { open, messageId, conversationId, x, y } = contextMenu;

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeContextMenu();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, closeContextMenu]);

  if (!messageId || !conversationId) return null;

  const convMessages = messages[conversationId] ?? [];
  const message = convMessages.find((m) => m.id === messageId);
  const isOutgoing = message?.direction === "outgoing";

  // Keep menu inside viewport
  const vw = typeof window !== "undefined" ? window.innerWidth : 800;
  const vh = typeof window !== "undefined" ? window.innerHeight : 600;
  const menuW = 200;
  const menuH = 240;
  const left = Math.min(x, vw - menuW - 8);
  const top = Math.min(y, vh - menuH - 8);

  const menuItems: MenuItem[] = [
    {
      icon: "add_reaction",
      label: "Add reaction",
      action: () => {
        closeContextMenu();
        openReactionPicker(messageId, conversationId);
      },
    },
    {
      icon: "content_copy",
      label: "Copy",
      action: () => {
        if (message?.text) navigator.clipboard.writeText(message.text).catch(() => {});
        closeContextMenu();
      },
    },
    {
      icon: "forward",
      label: "Forward",
      action: () => closeContextMenu(),
    },
    {
      icon: "star_border",
      label: "Star message",
      action: () => closeContextMenu(),
    },
    ...(isOutgoing
      ? [
          {
            icon: "delete",
            label: "Delete",
            danger: true,
            action: async () => {
              closeContextMenu();
              await deleteMessage(messageId, conversationId);
              patchMessage(messageId, conversationId, {
                isDeleted: true,
                text: "This message was deleted",
              });
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
            },
          },
        ]
      : []),
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <div
            className="fixed inset-0 z-[998]"
            onClick={closeContextMenu}
            aria-hidden="true"
          />

          {/* Menu */}
          <motion.div
            ref={menuRef}
            role="menu"
            aria-label="Message options"
            initial={{ opacity: 0, scale: 0.88, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -6 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="fixed z-[999] rounded-2xl overflow-hidden py-2"
            style={{
              left,
              top,
              minWidth: menuW,
              background: "var(--md-sys-color-surface-container-high)",
              boxShadow:
                "0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)",
            }}
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                role="menuitem"
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3
                           hover:bg-[var(--md-sys-color-surface-container-highest)]
                           transition-colors text-left"
                style={{
                  fontSize: 14,
                  color: item.danger
                    ? "var(--md-sys-color-error)"
                    : "var(--md-sys-color-on-surface)",
                }}
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
        </>
      )}
    </AnimatePresence>
  );
}
