"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShallow } from "zustand/shallow";
import { useQuery } from "@tanstack/react-query";
import { useChatStore } from "@/store/useChatStore";
import { Avatar } from "@/components/ui/Avatar";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { ContextMenu } from "./ContextMenu";
import { ReactionPicker } from "./ReactionPicker";
import { fetchConversations } from "@/services/mockApi";
import { idbGetAllConversations } from "@/lib/idb";
import type { Message } from "@/types/global";

const EMPTY_MESSAGES: Message[] = [];

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  // Look up conversation metadata from the shared React Query cache — the
  // same cache that ConversationList populates — so we always have fresh data
  // without an extra network request.
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      try {
        return await fetchConversations();
      } catch {
        return idbGetAllConversations();
      }
    },
    staleTime: Infinity, // reuse the cache already populated by ConversationList
  });
  const conversation = conversations.find((c) => c.id === conversationId) ?? null;

  // Stable state subscriptions for messages ───────────────────────────────
  const messages = useChatStore(
    useShallow((s) => s.messages[conversationId] ?? EMPTY_MESSAGES)
  );

  // UI-only local state ────────────────────────────────────────────────────
  const [contextMenuState, setContextMenuState] = useState<{
    messageId: string;
    position: { x: number; y: number };
  } | null>(null);

  const [reactionPicker, setReactionPicker] = useState<{
    messageId: string;
    position: { x: number; y: number };
  } | null>(null);

  // Look up the context message only when the context menu is open.
  // Stored in state so the identity is stable during the menu's lifecycle.
  const contextMessage: Message | undefined = contextMenuState
    ? messages.find((m) => m.id === contextMenuState.messageId)
    : undefined;

  // Handlers ───────────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    const { setActiveConversationId, setSidebarOpen } = useChatStore.getState();
    setActiveConversationId(null);
    setSidebarOpen(true);
  }, []);

  const handleContextMenu = useCallback(
    (messageId: string, e: React.MouseEvent) => {
      e.preventDefault();
      setReactionPicker(null);
      setContextMenuState({ messageId, position: { x: e.clientX, y: e.clientY } });
    },
    []
  );

  const handleReactionClick = useCallback(
    (messageId: string, e?: React.MouseEvent) => {
      setContextMenuState(null);
      const x = e ? e.clientX : window.innerWidth / 2;
      const y = e ? Math.max(e.clientY - 56, 80) : 120;
      setReactionPicker({ messageId, position: { x, y } });
    },
    []
  );

  return (
    <motion.div
      className="flex flex-col h-full"
      style={{ background: "var(--md-sys-color-background)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      {/* App bar */}
      <header
        className="flex items-center gap-2 px-2 shrink-0"
        style={{
          height: 64,
          background: "var(--md-sys-color-surface)",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        {/* Back button (mobile only) */}
        <button
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors shrink-0"
          onClick={handleBack}
          aria-label="Back"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }} aria-hidden="true">
            arrow_back
          </span>
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
          {conversation && (
            <Avatar
              name={conversation.name ?? ""}
              initials={conversation.initials ?? ""}
              avatarColor={conversation.avatarColor}
              avatar={conversation.avatar}
              size={40}
              isGroup={conversation.isGroup}
            />
          )}
          <div className="flex flex-col min-w-0">
            <span
              className="font-medium truncate"
              style={{ fontSize: 16, color: "var(--md-sys-color-on-surface)" }}
            >
              {conversation?.name ?? "Loading..."}
            </span>
            {conversation?.phone && (
              <span
                className="truncate"
                style={{ fontSize: 12, color: "var(--md-sys-color-on-surface-variant)" }}
              >
                {conversation.phone}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
            aria-label="Voice call"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">
              call
            </span>
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
            aria-label="Video call"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">
              videocam
            </span>
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
            aria-label="More options"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">
              more_vert
            </span>
          </button>
        </div>
      </header>

      {/* Message list */}
      <MessageList
        conversationId={conversationId}
        onContextMenu={handleContextMenu}
        onReactionClick={handleReactionClick}
      />

      {/* Composer */}
      <MessageComposer conversationId={conversationId} />

      {/* Context menu portal */}
      <AnimatePresence>
        {contextMenuState && contextMessage && (
          <ContextMenu
            key="context-menu"
            message={contextMessage}
            position={contextMenuState.position}
            onClose={() => setContextMenuState(null)}
            onReact={(id) => {
              setContextMenuState(null);
              setReactionPicker({ messageId: id, position: contextMenuState.position });
            }}
            onReply={(id) => {
              useChatStore.getState().setReplyingTo(conversationId, id);
              setContextMenuState(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Reaction picker portal */}
      <AnimatePresence>
        {reactionPicker && (
          <ReactionPicker
            key="reaction-picker"
            messageId={reactionPicker.messageId}
            conversationId={conversationId}
            position={reactionPicker.position}
            onClose={() => setReactionPicker(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
