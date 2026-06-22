"use client";

import { create } from "zustand";
import type { Conversation, Message, SearchResult } from "@/types/global";
import type { ConversationTab } from "@/types";

interface ContextMenuState {
  open: boolean;
  messageId: string | null;
  conversationId: string | null;
  x: number;
  y: number;
}

interface ChatStore {
  // ── Conversations ───────────────────────────────────────────────────────
  conversations: Conversation[];
  setConversations: (convs: Conversation[]) => void;
  patchConversation: (id: string, patch: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;

  // ── Active conversation ─────────────────────────────────────────────────
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;

  // ── Messages ────────────────────────────────────────────────────────────
  messages: Record<string, Message[]>;
  setMessages: (conversationId: string, msgs: Message[]) => void;
  appendMessage: (msg: Message) => void;
  patchMessage: (id: string, conversationId: string, patch: Partial<Message>) => void;

  // ── Typing ──────────────────────────────────────────────────────────────
  typingConversationIds: Set<string>;
  setTyping: (conversationId: string, typing: boolean) => void;

  // ── Search ──────────────────────────────────────────────────────────────
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];
  setSearchResults: (r: SearchResult[]) => void;
  searchLoading: boolean;
  setSearchLoading: (v: boolean) => void;

  // ── Tabs ────────────────────────────────────────────────────────────────
  activeTab: ConversationTab;
  setActiveTab: (tab: ConversationTab) => void;

  // ── Theme ───────────────────────────────────────────────────────────────
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // ── Sidebar (mobile) ────────────────────────────────────────────────────
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  // ── Context menu ────────────────────────────────────────────────────────
  contextMenu: ContextMenuState;
  openContextMenu: (messageId: string, conversationId: string, x: number, y: number) => void;
  closeContextMenu: () => void;

  // ── Reaction picker ─────────────────────────────────────────────────────
  reactionPicker: { open: boolean; messageId: string | null; conversationId: string | null };
  openReactionPicker: (messageId: string, conversationId: string) => void;
  closeReactionPicker: () => void;

  // ── Composer ────────────────────────────────────────────────────────────
  composerDraft: Record<string, string>;
  setComposerDraft: (conversationId: string, text: string) => void;

  // ── Reply-to ────────────────────────────────────────────────────────────
  replyingTo: Record<string, string | null>;
  setReplyingTo: (conversationId: string, messageId: string | null) => void;

  // ── Offline ─────────────────────────────────────────────────────────────
  isOffline: boolean;
  setIsOffline: (v: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  // ── Conversations ───────────────────────────────────────────────────────
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  patchConversation: (id, patch) =>
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    })),
  removeConversation: (id) =>
    set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),

  // ── Active conversation ─────────────────────────────────────────────────
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  // ── Messages ────────────────────────────────────────────────────────────
  messages: {},
  setMessages: (conversationId, msgs) =>
    set((s) => ({ messages: { ...s.messages, [conversationId]: msgs } })),
  appendMessage: (msg) =>
    set((s) => {
      const prev = s.messages[msg.conversationId] ?? [];
      return { messages: { ...s.messages, [msg.conversationId]: [...prev, msg] } };
    }),
  patchMessage: (id, conversationId, patch) =>
    set((s) => {
      const msgs = s.messages[conversationId] ?? [];
      return {
        messages: {
          ...s.messages,
          [conversationId]: msgs.map((m) =>
            m.id === id ? { ...m, ...patch } : m
          ),
        },
      };
    }),

  // ── Typing ──────────────────────────────────────────────────────────────
  typingConversationIds: new Set(),
  setTyping: (conversationId, typing) =>
    set((s) => {
      const next = new Set(s.typingConversationIds);
      typing ? next.add(conversationId) : next.delete(conversationId);
      return { typingConversationIds: next };
    }),

  // ── Search ──────────────────────────────────────────────────────────────
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  searchResults: [],
  setSearchResults: (searchResults) => set({ searchResults }),
  searchLoading: false,
  setSearchLoading: (searchLoading) => set({ searchLoading }),

  // ── Tabs ────────────────────────────────────────────────────────────────
  activeTab: "messages",
  setActiveTab: (activeTab) => set({ activeTab }),

  // ── Theme ────────────────────────────���──────────────────────────────────
  theme: "system",
  setTheme: (theme) => {
    set({ theme });
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const dark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) {
      html.setAttribute("data-theme", "dark");
      html.classList.add("dark");
    } else {
      html.removeAttribute("data-theme");
      html.classList.remove("dark");
    }
  },

  // ── Sidebar ─────────────────────────────────────────────────────────────
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  // ── Context menu ────────────────────────────────────────────────────────
  contextMenu: { open: false, messageId: null, conversationId: null, x: 0, y: 0 },
  openContextMenu: (messageId, conversationId, x, y) =>
    set({ contextMenu: { open: true, messageId, conversationId, x, y } }),
  closeContextMenu: () =>
    set((s) => ({ contextMenu: { ...s.contextMenu, open: false } })),

  // ── Reaction picker ─────────────────────────────────────────────────────
  reactionPicker: { open: false, messageId: null, conversationId: null },
  openReactionPicker: (messageId, conversationId) =>
    set({ reactionPicker: { open: true, messageId, conversationId } }),
  closeReactionPicker: () =>
    set({ reactionPicker: { open: false, messageId: null, conversationId: null } }),

  // ── Composer ────────────────────────────────────────────────────────────
  composerDraft: {},
  setComposerDraft: (conversationId, text) =>
    set((s) => ({
      composerDraft: { ...s.composerDraft, [conversationId]: text },
    })),

  // ── Reply-to ────────────────────────────────────────────────────────────
  replyingTo: {},
  setReplyingTo: (conversationId, messageId) =>
    set((s) => ({
      replyingTo: { ...s.replyingTo, [conversationId]: messageId },
    })),

  // ── Offline ─────────────────────────────────────────────────────────────
  isOffline: false,
  setIsOffline: (isOffline) => set({ isOffline }),
}));

// Convenience selectors
export const selectConversation = (id: string) => (s: ChatStore) =>
  s.conversations.find((c) => c.id === id);

export const selectMessages = (id: string) => (s: ChatStore) =>
  s.messages[id] ?? [];
