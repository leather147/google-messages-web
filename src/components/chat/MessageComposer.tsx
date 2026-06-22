"use client";

import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store/useChatStore";
import { sendMessage, simulateIncomingMessage } from "@/services/mockApi";
import { idbPutMessages } from "@/lib/idb";
import { useShallow } from "zustand/shallow";
import type { Message } from "@/types/global";
import { nanoid } from "@/lib/nanoid";

const EMPTY_MESSAGES: Message[] = [];

interface MessageComposerProps {
  conversationId: string;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Actions via getState() — identity is stable so no snapshot loop risk.
  const appendMessage = useChatStore.getState().appendMessage;
  const setTyping = useChatStore.getState().setTyping;
  const setReplyingTo = useChatStore.getState().setReplyingTo;
  // State subscriptions
  const replyingToId = useChatStore((s) => s.replyingTo[conversationId] ?? null);
  const messages = useChatStore(
    useShallow((s) => s.messages[conversationId] ?? EMPTY_MESSAGES)
  );

  const replyingToMessage: Message | null = replyingToId
    ? (messages.find((m) => m.id === replyingToId) ?? null)
    : null;

  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setText(val);

      // Auto-resize textarea
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 120) + "px";
      }

      // Typing indicator — debounced off
      if (val.trim()) {
        setTyping(conversationId, true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
          setTyping(conversationId, false);
        }, 2000);
      } else {
        setTyping(conversationId, false);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      }
    },
    [conversationId, setTyping]
  );

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const currentReplyTo = replyingToId;

    setSending(true);
    setText("");
    setTyping(conversationId, false);
    setReplyingTo(conversationId, null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Optimistic message
    const optimisticMsg: Message = {
      id: `opt-${nanoid()}`,
      conversationId,
      text: trimmed,
      timestamp: new Date().toISOString(),
      direction: "outgoing",
      status: "sent",
      reactions: [],
      isDeleted: false,
      replyTo: currentReplyTo,
    };

    appendMessage(optimisticMsg);

    try {
      const confirmedMsg = await sendMessage(conversationId, trimmed, currentReplyTo);
      appendMessage(confirmedMsg);
      await idbPutMessages([confirmedMsg]);

      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Simulate an auto-reply for conversations that support it
      setTimeout(() => {
        simulateIncomingMessage(
          conversationId,
          (incomingMsg) => {
            appendMessage(incomingMsg);
            idbPutMessages([incomingMsg]);
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          },
          (typing) => setTyping(conversationId, typing)
        );
      }, 800 + Math.random() * 1200);
    } catch {
      // Keep optimistic message visible; mark as failed silently
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
    // Escape clears reply
    if (e.key === "Escape" && replyingToId) {
      setReplyingTo(conversationId, null);
    }
  }

  const canSend = text.trim().length > 0 && !sending;

  return (
    <div
      className="shrink-0"
      style={{
        background: "var(--md-sys-color-surface)",
        borderTop: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      {/* Reply preview bar */}
      <AnimatePresence>
        {replyingToMessage && (
          <motion.div
            key="reply-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center gap-3 px-4 py-2"
              style={{
                background: "var(--md-sys-color-surface-container-low)",
                borderBottom: "1px solid var(--md-sys-color-outline-variant)",
              }}
            >
              {/* Vertical accent bar */}
              <div
                className="w-0.5 self-stretch rounded-full shrink-0"
                style={{ background: "var(--md-sys-color-primary)", minHeight: 24 }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="font-medium truncate"
                  style={{ fontSize: 12, color: "var(--md-sys-color-primary)" }}
                >
                  {replyingToMessage.direction === "outgoing" ? "You" : "Them"}
                </p>
                <p
                  className="truncate"
                  style={{
                    fontSize: 13,
                    color: "var(--md-sys-color-on-surface-variant)",
                  }}
                >
                  {replyingToMessage.text}
                </p>
              </div>
              {/* Dismiss */}
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
                onClick={() => setReplyingTo(conversationId, null)}
                aria-label="Cancel reply"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 18 }}
                  aria-hidden="true"
                >
                  close
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer row */}
      <div className="flex items-end gap-2 px-3 py-2" style={{ minHeight: 64 }}>
        {/* Emoji button */}
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors self-end mb-0.5"
          aria-label="Insert emoji"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 24 }}
            aria-hidden="true"
          >
            sentiment_satisfied
          </span>
        </button>

        {/* Text input */}
        <div
          className="flex-1 flex items-end rounded-3xl px-4 py-2"
          style={{
            background: "var(--md-sys-color-surface-container-high)",
            minHeight: 44,
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none leading-relaxed"
            style={{
              color: "var(--md-sys-color-on-surface)",
              fontSize: 15,
              fontFamily: "inherit",
              lineHeight: "1.5",
              maxHeight: 120,
            }}
            aria-label="Type a message"
            aria-multiline="true"
          />
        </div>

        {/* Send / Mic button */}
        <motion.button
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 self-end mb-0.5 transition-colors"
          style={{
            background: canSend
              ? "var(--md-sys-color-primary)"
              : "transparent",
            color: canSend
              ? "var(--md-sys-color-on-primary)"
              : "var(--md-sys-color-on-surface-variant)",
          }}
          onClick={send}
          animate={{ scale: canSend ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label={canSend ? "Send message" : "Voice message"}
          disabled={sending}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 22 }}
            aria-hidden="true"
          >
            {canSend ? "send" : "mic"}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
