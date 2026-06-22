"use client";

import { motion } from "framer-motion";

export function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full gap-6 px-8"
      style={{ background: "var(--md-sys-color-background)" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: "var(--md-sys-color-surface-container)" }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 52,
            color: "var(--md-sys-color-on-surface-variant)",
            fontVariationSettings: "'FILL' 0",
          }}
          aria-hidden="true"
        >
          chat_bubble_outline
        </span>
      </div>

      {/* Headline */}
      <div className="flex flex-col items-center gap-2 max-w-sm text-center">
        <h2
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: "var(--md-sys-color-on-surface)",
            lineHeight: "1.4",
          }}
        >
          Select a conversation
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--md-sys-color-on-surface-variant)",
            lineHeight: "1.6",
          }}
        >
          Pick a conversation from the left panel to start chatting, or search for someone.
        </p>
      </div>
    </motion.div>
  );
}
