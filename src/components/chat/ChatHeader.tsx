"use client";

import { Avatar } from "@/components/ui/Avatar";
import { useChatStore } from "@/store/useChatStore";
import type { Conversation } from "@/types/global";

interface ChatHeaderProps {
  conversation: Conversation;
  isTyping: boolean;
}

export function ChatHeader({ conversation, isTyping }: ChatHeaderProps) {
  const { setSidebarOpen, setActiveConversationId } = useChatStore();

  function handleBack() {
    setActiveConversationId(null);
    setSidebarOpen(true);
  }

  return (
    <header
      className="flex items-center gap-3 px-2 shrink-0"
      style={{
        height: 64,
        background: "var(--md-sys-color-surface-container-low)",
        borderBottom: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      {/* Back button — visible on mobile */}
      <button
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full
                   hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
        onClick={handleBack}
        aria-label="Back to conversations"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 24, color: "var(--md-sys-color-on-surface-variant)" }}
          aria-hidden="true"
        >
          arrow_back
        </span>
      </button>

      {/* Avatar */}
      <Avatar
        name={conversation.name}
        initials={conversation.initials}
        avatarColor={conversation.avatarColor}
        avatar={conversation.avatar}
        size={40}
        isGroup={conversation.isGroup}
      />

      {/* Name + status */}
      <div className="flex flex-col min-w-0 flex-1">
        <h2
          className="font-medium truncate leading-tight"
          style={{ fontSize: 16, color: "var(--md-sys-color-on-surface)" }}
        >
          {conversation.name}
        </h2>
        <p
          className="truncate leading-tight"
          style={{
            fontSize: 12,
            color: "var(--md-sys-color-on-surface-variant)",
            minHeight: 16,
          }}
          aria-live="polite"
        >
          {isTyping ? (
            <span className="animate-pulse">typing...</span>
          ) : conversation.phone ? (
            conversation.phone
          ) : conversation.isGroup ? (
            "Group conversation"
          ) : null}
        </p>
      </div>

      {/* Header actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full
                     hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
          aria-label="Voice call"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 22, color: "var(--md-sys-color-on-surface-variant)" }}
            aria-hidden="true"
          >
            call
          </span>
        </button>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full
                     hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
          aria-label="Video call"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 22, color: "var(--md-sys-color-on-surface-variant)" }}
            aria-hidden="true"
          >
            videocam
          </span>
        </button>
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full
                     hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
          aria-label="More options"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 22, color: "var(--md-sys-color-on-surface-variant)" }}
            aria-hidden="true"
          >
            more_vert
          </span>
        </button>
      </div>
    </header>
  );
}
