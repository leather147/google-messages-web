"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChatStore } from "@/store/useChatStore";
import { NavigationRail } from "@/components/navigation/NavigationRail";
import { Sidebar } from "@/components/conversations/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { EmptyState } from "@/components/chat/EmptyState";

export function AppShell() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const sidebarOpen = useChatStore((s) => s.sidebarOpen);
  const setSidebarOpen = useChatStore((s) => s.setSidebarOpen);

  // Global keyboard shortcuts
  useEffect(() => {
    const setSearchOpen = useChatStore.getState().setSearchOpen;
    const setActiveConversationId = useChatStore.getState().setActiveConversationId;

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Ctrl/Cmd + F → open search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Escape → close search or deselect conversation on mobile
      if (e.key === "Escape" && !isInput) {
        const state = useChatStore.getState();
        if (state.searchOpen) {
          setSearchOpen(false);
        } else if (state.activeConversationId && window.innerWidth < 768) {
          setActiveConversationId(null);
          setSidebarOpen(true);
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setSidebarOpen]);

  // Responsive: on resize to desktop, always show sidebar
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setSidebarOpen]);

  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ background: "var(--md-sys-color-background)" }}
    >
      {/* Navigation rail — tablet/desktop (md+) */}
      <NavigationRail />

      {/*
        Split-view container
        - Mobile:  sidebar overlays chat (one panel visible at a time)
        - Desktop: sidebar + chat side by side
      */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Sidebar panel */}
        <AnimatePresence initial={false}>
          {(sidebarOpen || typeof window === "undefined") && (
            <motion.div
              key="sidebar"
              className="flex flex-col overflow-hidden"
              style={{
                width: "100%",
                maxWidth: 400,
                minWidth: 280,
                // On desktop, always a fixed column
                position: undefined,
                borderRight: "1px solid var(--md-sys-color-outline-variant)",
              }}
              // Mobile: slide in from left
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <AnimatePresence mode="wait">
            {activeConversationId ? (
              <motion.div
                key={activeConversationId}
                className="flex-1 flex flex-col overflow-hidden"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                style={{ height: "100%" }}
              >
                <ChatWindow conversationId={activeConversationId} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="flex-1 flex flex-col overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ height: "100%" }}
              >
                {/* Hide empty state on mobile when sidebar is showing */}
                <div className={`h-full ${!activeConversationId && sidebarOpen ? "hidden md:flex" : "flex"} flex-col`}>
                  <EmptyState />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
