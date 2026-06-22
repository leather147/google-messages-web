"use client";

import { useChatStore } from "@/store/useChatStore";
import { AnimatePresence, motion } from "framer-motion";

export function OfflineBanner() {
  const isOffline = useChatStore((s) => s.isOffline);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
          role="alert"
        >
          <div
            className="flex items-center justify-center gap-2 px-4 py-2"
            style={{
              background: "var(--md-sys-color-error-container)",
              color: "var(--md-sys-color-on-error-container)",
              fontSize: 13,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden="true">
              wifi_off
            </span>
            <span>You&apos;re offline. Messages will be sent when reconnected.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
