"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useChatStore } from "@/store/useChatStore";
import {
  fetchConversations,
  archiveConversation,
  unarchiveConversation,
  pinConversation,
  unpinConversation,
  deleteConversation,
  markConversationRead,
} from "@/services/mockApi";
import { idbGetAllConversations, idbPutConversations } from "@/lib/idb";
import { ConversationItem } from "./ConversationItem";
import { ConversationListSkeleton } from "@/components/ui/Skeleton";
import type { Conversation } from "@/types/global";
import { useEffect, useRef, useState } from "react";

// ── Context menu for conversation list item ───────────────────────────────

interface ConvContextMenuProps {
  conversationId: string;
  position: { x: number; y: number };
  onClose: () => void;
  conv: Conversation;
}

function ConvContextMenu({ conversationId, position, onClose, conv }: ConvContextMenuProps) {
  const queryClient = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  async function handlePin() {
    if (conv.pinned) await unpinConversation(conversationId);
    else await pinConversation(conversationId);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    onClose();
  }

  async function handleArchive() {
    if (conv.archived) await unarchiveConversation(conversationId);
    else await archiveConversation(conversationId);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    onClose();
  }

  async function handleMarkRead() {
    await markConversationRead(conversationId);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    onClose();
  }

  async function handleDelete() {
    await deleteConversation(conversationId);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    onClose();
  }

  // Adjust position so menu stays inside viewport
  const style: React.CSSProperties = {
    position: "fixed",
    top: Math.min(position.y, window.innerHeight - 200),
    left: Math.min(position.x, window.innerWidth - 200),
    zIndex: 9999,
  };

  const menuItems = [
    { icon: conv.pinned ? "push_pin" : "push_pin", label: conv.pinned ? "Unpin" : "Pin", onClick: handlePin },
    { icon: conv.archived ? "unarchive" : "archive", label: conv.archived ? "Unarchive" : "Archive", onClick: handleArchive },
    { icon: "done_all", label: "Mark as read", onClick: handleMarkRead },
    { icon: "delete", label: "Delete", onClick: handleDelete, danger: true },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -4 }}
      transition={{ duration: 0.12 }}
      className="rounded-2xl overflow-hidden elevation-3 py-2 min-w-[180px]"
      role="menu"
      aria-label="Conversation options"
      style={{
        ...style,
        background: "var(--md-sys-color-surface-container-high)",
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors text-left"
          style={{
            color: item.danger
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

// ── Main ConversationList ─────────────────────────────────────────────────

export function ConversationList() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const setSidebarOpen = useChatStore((s) => s.setSidebarOpen);
  const activeTab = useChatStore((s) => s.activeTab);

  const [contextMenu, setContextMenu] = useState<{
    conversationId: string;
    position: { x: number; y: number };
  } | null>(null);

  const isArchived = activeTab === "archived";

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      try {
        const data = await fetchConversations();
        await idbPutConversations(data);
        return data;
      } catch {
        // Offline fallback
        return idbGetAllConversations();
      }
    },
    placeholderData: [],
  });

  // Filter and sort by tab
  const displayConversations = (conversations ?? [])
    .filter((c) => {
      if (activeTab === "pinned") return c.pinned && !c.archived;
      if (activeTab === "archived") return c.archived;
      return !c.archived;
    })
    .sort((a, b) => {
      if (activeTab === "messages") {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  function handleSelectConversation(id: string) {
    setActiveConversationId(id);
    // On mobile, hide sidebar when conversation selected
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function handleContextMenu(convId: string, e: React.MouseEvent) {
    setContextMenu({
      conversationId: convId,
      position: { x: e.clientX, y: e.clientY },
    });
  }

  const contextConv = contextMenu
    ? displayConversations.find((c) => c.id === contextMenu.conversationId)
    : null;

  if (isLoading) return <ConversationListSkeleton />;

  if (!displayConversations.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 py-12">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 64, color: "var(--md-sys-color-outline)" }}
          aria-hidden="true"
        >
          {isArchived ? "archive" : activeTab === "pinned" ? "push_pin" : "chat_bubble_outline"}
        </span>
        <p
          className="text-center"
          style={{ color: "var(--md-sys-color-on-surface-variant)", fontSize: 14 }}
        >
          {isArchived
            ? "No archived conversations"
            : activeTab === "pinned"
            ? "No pinned conversations"
            : "No messages yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-y-auto" role="list" aria-label="Conversations">
      <AnimatePresence initial={false}>
        {displayConversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={activeConversationId === conv.id}
            onSelect={handleSelectConversation}
            onContextMenu={handleContextMenu}
          />
        ))}
      </AnimatePresence>

      {/* Context menu portal */}
      <AnimatePresence>
        {contextMenu && contextConv && (
          <ConvContextMenu
            key="conv-context-menu"
            conversationId={contextMenu.conversationId}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
            conv={contextConv}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
