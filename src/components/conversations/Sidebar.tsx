"use client";

import { useChatStore } from "@/store/useChatStore";
import { ConversationList } from "./ConversationList";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { key: "messages" as const, label: "Messages", icon: "chat_bubble_outline" },
  { key: "pinned" as const, label: "Pinned", icon: "push_pin" },
  { key: "archived" as const, label: "Archived", icon: "archive" },
];

export function Sidebar() {
  const activeTab = useChatStore((s) => s.activeTab);
  const setActiveTab = useChatStore((s) => s.setActiveTab);
  const searchOpen = useChatStore((s) => s.searchOpen);
  const setSearchOpen = useChatStore((s) => s.setSearchOpen);
  const setTheme = useChatStore((s) => s.setTheme);
  const theme = useChatStore((s) => s.theme);
  const isOffline = useChatStore((s) => s.isOffline);

  const isDark = theme === "dark";

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--md-sys-color-surface)" }}
    >
      {/* Top app bar */}
      <header
        className="flex items-center px-4 shrink-0"
        style={{
          height: 64,
          background: "var(--md-sys-color-surface)",
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        {/* Google Messages wordmark area */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "var(--md-sys-color-primary-container)" }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 18,
                color: "var(--md-sys-color-primary)",
                fontVariationSettings: "'FILL' 1",
              }}
              aria-hidden="true"
            >
              chat
            </span>
          </div>
          <span
            className="font-medium truncate"
            style={{ fontSize: 18, color: "var(--md-sys-color-on-surface)" }}
          >
            Messages
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Search */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">
              search
            </span>
          </button>

          {/* Theme toggle */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light" : "Switch to dark"}
            style={{ color: "var(--md-sys-color-on-surface-variant)" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* More options */}
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

      {/* Offline banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center gap-2 px-4 py-2"
              style={{
                background: "var(--md-sys-color-error-container)",
                color: "var(--md-sys-color-on-error-container)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
                wifi_off
              </span>
              <span style={{ fontSize: 13 }}>No internet connection</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab strip — md:hidden, visible on mobile */}
      <div
        className="flex md:hidden shrink-0 border-b"
        style={{ borderColor: "var(--md-sys-color-outline-variant)" }}
        role="tablist"
        aria-label="Conversation categories"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              className="flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors"
              style={{
                color: isActive
                  ? "var(--md-sys-color-primary)"
                  : "var(--md-sys-color-on-surface-variant)",
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                aria-hidden="true"
              >
                {tab.icon}
              </span>
              <span style={{ fontSize: 11, fontWeight: 500 }}>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "var(--md-sys-color-primary)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Conversations list — takes remaining space */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ConversationList />
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay key="search" onClose={() => setSearchOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
