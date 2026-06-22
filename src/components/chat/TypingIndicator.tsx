"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1" aria-live="polite" aria-label="Someone is typing">
      <div
        className="flex items-center gap-1 px-4 py-3 rounded-[20px] rounded-bl-sm"
        style={{
          background: "var(--md-sys-color-surface-container-high)",
          minHeight: 40,
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--md-sys-color-on-surface-variant)" }}
            animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
