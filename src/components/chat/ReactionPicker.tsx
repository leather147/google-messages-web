"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "@/store/useChatStore";
import { addReaction } from "@/services/mockApi";
import type { Message } from "@/types/global";

const EMPTY_MESSAGES: Message[] = [];
const COMMON_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥"];

interface ReactionPickerProps {
  messageId: string;
  conversationId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ReactionPicker({
  messageId,
  conversationId,
  position,
  onClose,
}: ReactionPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const patchMessage = useChatStore((s) => s.patchMessage);
  const messages = useChatStore((s) => s.messages[conversationId] ?? EMPTY_MESSAGES);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
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

  const pickerWidth = COMMON_REACTIONS.length * 44 + 8;
  const adjustedX = Math.min(position.x - pickerWidth / 2, window.innerWidth - pickerWidth - 8);
  const adjustedY = Math.max(position.y - 64, 8);

  async function handleReact(emoji: string) {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) { onClose(); return; }

    const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
    const newReactions = existingReaction
      ? msg.reactions
          .map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
      : [...msg.reactions, { emoji, count: 1 }];

    patchMessage(messageId, conversationId, { reactions: newReactions });
    await addReaction(messageId, conversationId, emoji);
    onClose();
  }

  return (
    <motion.div
      ref={pickerRef}
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 8 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{
        position: "fixed",
        top: adjustedY,
        left: Math.max(8, adjustedX),
        zIndex: 9999,
        background: "var(--md-sys-color-surface-container-high)",
        borderRadius: 32,
        padding: "6px 4px",
        boxShadow: "0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)",
        display: "flex",
        gap: 2,
      }}
      role="dialog"
      aria-label="Choose a reaction"
    >
      {COMMON_REACTIONS.map((emoji) => (
        <motion.button
          key={emoji}
          onClick={() => handleReact(emoji)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors"
          style={{ fontSize: 22, cursor: "pointer" }}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
}
