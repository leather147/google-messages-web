"use client";

import { useChatStore } from "@/store/useChatStore";
import { motion } from "framer-motion";

interface NavItem {
  icon: string;
  activeIcon: string;
  label: string;
  tab: "messages" | "pinned" | "archived";
}

const NAV_ITEMS: NavItem[] = [
  { icon: "chat_bubble_outline", activeIcon: "chat_bubble", label: "Messages", tab: "messages" },
  { icon: "push_pin", activeIcon: "push_pin", label: "Pinned", tab: "pinned" },
  { icon: "archive", activeIcon: "archive", label: "Archived", tab: "archived" },
];

export function NavigationRail() {
  const activeTab = useChatStore((s) => s.activeTab);
  const setActiveTab = useChatStore((s) => s.setActiveTab);
  const openSearch = useChatStore((s) => s.setSearchOpen);
  const setTheme = useChatStore((s) => s.setTheme);
  const theme = useChatStore((s) => s.theme);

  const isDark = theme === "dark";

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <nav
      className="hidden md:flex flex-col items-center py-4 gap-1 shrink-0"
      style={{
        width: 80,
        background: "var(--md-sys-color-surface)",
        borderRight: "1px solid var(--md-sys-color-outline-variant)",
      }}
      aria-label="Main navigation"
    >
      {/* Google Messages Logo */}
      <div className="mb-3 flex flex-col items-center">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
          style={{ background: "var(--md-sys-color-primary-container)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "var(--md-sys-color-primary)", fontSize: 22 }}
            aria-hidden="true"
          >
            chat
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className="relative flex flex-col items-center gap-1 w-full py-2 rounded-2xl cursor-pointer transition-colors"
              style={{
                background: isActive
                  ? "var(--md-sys-color-secondary-container)"
                  : "transparent",
                color: isActive
                  ? "var(--md-sys-color-on-secondary-container)"
                  : "var(--md-sys-color-on-surface-variant)",
              }}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-rail-indicator"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: "var(--md-sys-color-secondary-container)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span
                className="material-symbols-outlined relative z-10"
                style={{ fontSize: 22, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                aria-hidden="true"
              >
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span
                className="relative z-10 text-center leading-none"
                style={{ fontSize: 11, fontWeight: 500 }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* Search button */}
      <button
        onClick={() => openSearch(true)}
        className="flex flex-col items-center gap-1 w-full px-2 py-2 rounded-2xl cursor-pointer transition-colors hover:bg-[var(--md-sys-color-surface-container-high)]"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        aria-label="Search"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">
          search
        </span>
        <span style={{ fontSize: 11, fontWeight: 500 }}>Search</span>
      </button>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="flex flex-col items-center gap-1 w-full px-2 py-2 rounded-2xl cursor-pointer transition-colors hover:bg-[var(--md-sys-color-surface-container-high)]"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">
          {isDark ? "light_mode" : "dark_mode"}
        </span>
        <span style={{ fontSize: 11, fontWeight: 500 }}>
          {isDark ? "Light" : "Dark"}
        </span>
      </button>

      {/* More options */}
      <button
        className="flex flex-col items-center gap-1 w-full px-2 py-2 rounded-2xl cursor-pointer transition-colors hover:bg-[var(--md-sys-color-surface-container-high)]"
        style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        aria-label="More options"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">
          more_vert
        </span>
        <span style={{ fontSize: 11, fontWeight: 500 }}>More</span>
      </button>
    </nav>
  );
}
