"use client";

import { motion } from "framer-motion";
import { useChatStore } from "@/store/useChatStore";

interface NavItem {
  key: "messages" | "pinned" | "archived";
  icon: string;
  activeIcon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "messages",
    icon: "chat_bubble_outline",
    activeIcon: "chat_bubble",
    label: "Messages",
  },
  {
    key: "pinned",
    icon: "push_pin",
    activeIcon: "push_pin",
    label: "Pinned",
  },
  {
    key: "archived",
    icon: "archive",
    activeIcon: "archive",
    label: "Archived",
  },
];

export function BottomNavBar() {
  const activeTab = useChatStore((s) => s.activeTab);
  const setActiveTab = useChatStore((s) => s.setActiveTab);
  const setSidebarOpen = useChatStore((s) => s.setSidebarOpen);
  const setActiveConversationId = useChatStore(
    (s) => s.setActiveConversationId
  );

  function handleTabSelect(tab: NavItem["key"]) {
    setActiveTab(tab);
    // On mobile switching tab always shows the sidebar (conversation list)
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setActiveConversationId(null);
      setSidebarOpen(true);
    }
  }

  return (
    <nav
      className="md:hidden flex shrink-0"
      style={{
        height: 80,
        background: "var(--md-sys-color-surface-container)",
        borderTop: "1px solid var(--md-sys-color-outline-variant)",
      }}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <button
            key={item.key}
            className="flex-1 flex flex-col items-center justify-center gap-1 relative overflow-hidden focus-visible:outline-none"
            onClick={() => handleTabSelect(item.key)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            {/* State layer */}
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
              style={{
                background: "var(--md-sys-color-on-surface)",
                opacity: 0,
              }}
              aria-hidden="true"
            />

            {/* Active indicator pill */}
            <div className="relative flex flex-col items-center gap-1">
              <div className="relative flex items-center justify-center" style={{ height: 32, width: 64 }}>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "var(--md-sys-color-secondary-container)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span
                  className="relative z-10 material-symbols-outlined"
                  style={{
                    fontSize: 22,
                    color: isActive
                      ? "var(--md-sys-color-on-secondary-container)"
                      : "var(--md-sys-color-on-surface-variant)",
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    transition: "color 0.15s",
                  }}
                  aria-hidden="true"
                >
                  {isActive ? item.activeIcon : item.icon}
                </span>
              </div>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: isActive
                    ? "var(--md-sys-color-on-surface)"
                    : "var(--md-sys-color-on-surface-variant)",
                  transition: "color 0.15s",
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
