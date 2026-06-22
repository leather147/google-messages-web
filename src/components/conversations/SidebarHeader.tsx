"use client";

import { useChatStore } from "@/store/useChatStore";
import { motion, AnimatePresence } from "framer-motion";
import type { ConversationTab } from "@/types";

const TABS: { value: ConversationTab; label: string }[] = [
  { value: "messages", label: "Messages" },
  { value: "pinned", label: "Pinned" },
  { value: "archived", label: "Archived" },
];

export function SidebarHeader() {
  const { activeTab, setActiveTab, setSearchOpen, theme, setTheme } = useChatStore();
  const isDark = theme === "dark";

  return (
    <div
      className="flex flex-col shrink-0"
      style={{
        background: "var(--md-sys-color-surface-container-low)",
        borderBottom: "1px solid var(--md-sys-color-outline-variant)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--md-sys-color-primary)" }}
            aria-hidden="true"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20, color: "#fff", fontVariationSettings: "'FILL' 1" }}
            >
              chat
            </span>
          </div>
          <h1
            className="font-medium"
            style={{ fontSize: 20, color: "var(--md-sys-color-on-surface)" }}
          >
            Messages
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors
                       hover:bg-[var(--md-sys-color-surface-container-highest)]"
            aria-label="Search"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: "var(--md-sys-color-on-surface-variant)" }}
              aria-hidden="true"
            >
              search
            </span>
          </button>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors
                       hover:bg-[var(--md-sys-color-surface-container-highest)]"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, color: "var(--md-sys-color-on-surface-variant)" }}
              aria-hidden="true"
            >
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <button
            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors
                       hover:bg-[var(--md-sys-color-surface-container-highest)]"
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
      </div>

      {/* Tab strip */}
      <div
        className="flex items-center px-2"
        role="tablist"
        aria-label="Conversation filters"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.value)}
              className="relative flex-1 flex items-center justify-center py-2.5 px-3 rounded-t
                         transition-colors cursor-pointer"
              style={{
                color: isActive
                  ? "var(--md-sys-color-primary)"
                  : "var(--md-sys-color-on-surface-variant)",
              }}
            >
              <span className="font-medium" style={{ fontSize: 13, letterSpacing: "0.1px" }}>
                {tab.label}
              </span>

              {/* Active indicator underline */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-3 right-3 rounded-full"
                    style={{
                      height: 3,
                      background: "var(--md-sys-color-primary)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}
