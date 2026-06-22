/**
 * Mock API layer — simulates a real backend with latency, auto-replies,
 * typing indicators, and status progression (sending → sent → delivered → read).
 */

import type { Conversation, Message, SearchResult } from "@/types/global";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from "@/mock/data";
import {
  idbPutConversations,
  idbPutMessages,
  idbGetMessages,
  idbGetAllConversations,
} from "@/lib/idb";

// ── Helpers ───────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
function jitter(min = 120, max = 380): Promise<void> {
  return delay(min + Math.random() * (max - min));
}

// ── In-memory session store (source of truth) ─────────────────────────────────

let _conversations: Conversation[] = MOCK_CONVERSATIONS.map((c) => ({ ...c }));

const _messages: Record<string, Message[]> = Object.fromEntries(
  Object.entries(MOCK_MESSAGES).map(([k, msgs]) => [
    k,
    msgs.map((m) => ({ ...m })),
  ])
);

// Seed IndexedDB asynchronously on first load
if (typeof window !== "undefined") {
  void idbPutConversations(_conversations).catch(() => {});
  void Promise.all(
    Object.values(_messages).map((msgs) => idbPutMessages(msgs))
  ).catch(() => {});
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function fetchConversations(): Promise<Conversation[]> {
  await jitter();
  // IDB as warm cache; fall back to in-memory
  try {
    const cached = await idbGetAllConversations();
    if (cached.length > 0) return [..._conversations]; // session overrides cache
  } catch {
    // ignore
  }
  return [..._conversations];
}

export async function fetchConversation(id: string): Promise<Conversation | null> {
  await jitter(40, 100);
  return _conversations.find((c) => c.id === id) ?? null;
}

export async function patchConversation(
  id: string,
  patch: Partial<Conversation>
): Promise<Conversation> {
  await jitter(60, 180);
  const idx = _conversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Conversation ${id} not found`);
  _conversations[idx] = { ..._conversations[idx], ...patch };
  void idbPutConversations([_conversations[idx]]).catch(() => {});
  return _conversations[idx];
}

export const archiveConversation = (id: string) =>
  patchConversation(id, { archived: true, pinned: false });

export const unarchiveConversation = (id: string) =>
  patchConversation(id, { archived: false });

export const pinConversation = (id: string) =>
  patchConversation(id, { pinned: true });

export const unpinConversation = (id: string) =>
  patchConversation(id, { pinned: false });

export const deleteConversation = async (id: string): Promise<void> => {
  _conversations = _conversations.filter((c) => c.id !== id);
};

export const markConversationRead = (id: string) =>
  patchConversation(id, { unreadCount: 0 });

// ── Messages ──────────────────────────────────────────────────────────────────

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  await jitter();
  try {
    const cached = await idbGetMessages(conversationId);
    if (cached.length > 0) return _messages[conversationId] ?? [];
  } catch {
    // ignore
  }
  return (_messages[conversationId] ?? []).map((m) => ({ ...m }));
}

export async function sendMessage(
  conversationId: string,
  text: string,
  replyTo?: string | null
): Promise<Message> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const msg: Message = {
    id,
    conversationId,
    text,
    timestamp: now,
    direction: "outgoing",
    status: "sent",
    reactions: [],
    isDeleted: false,
    replyTo: replyTo ?? null,
  };

  if (!_messages[conversationId]) _messages[conversationId] = [];
  _messages[conversationId].push(msg);

  // Update conversation preview
  const cIdx = _conversations.findIndex((c) => c.id === conversationId);
  if (cIdx !== -1) {
    _conversations[cIdx] = {
      ..._conversations[cIdx],
      lastMessage: `You: ${text}`,
      updatedAt: now,
      unreadCount: 0,
    };
  }

  void idbPutMessages([msg]).catch(() => {});

  // Status progression
  setTimeout(() => {
    msg.status = "delivered";
  }, 800 + Math.random() * 400);

  setTimeout(() => {
    msg.status = "read";
  }, 2500 + Math.random() * 2000);

  return { ...msg };
}

export async function deleteMessage(
  messageId: string,
  conversationId: string
): Promise<void> {
  await jitter(60, 150);
  const msgs = _messages[conversationId] ?? [];
  const idx = msgs.findIndex((m) => m.id === messageId);
  if (idx !== -1) {
    msgs[idx] = { ...msgs[idx], isDeleted: true, text: "This message was deleted" };
  }
}

export async function addReaction(
  messageId: string,
  conversationId: string,
  emoji: string
): Promise<Message> {
  await jitter(50, 120);
  const msgs = _messages[conversationId] ?? [];
  const idx = msgs.findIndex((m) => m.id === messageId);
  if (idx === -1) throw new Error("Message not found");

  const msg = msgs[idx];
  const existing = msg.reactions.findIndex((r) => r.emoji === emoji);

  if (existing !== -1) {
    // Toggle: decrement or remove
    msg.reactions[existing].count -= 1;
    if (msg.reactions[existing].count <= 0) {
      msg.reactions.splice(existing, 1);
    }
  } else {
    msg.reactions = [...msg.reactions, { emoji, count: 1 }];
  }

  void idbPutMessages([msg]).catch(() => {});
  return { ...msg };
}

// ── Simulated incoming messages ───────────────────────────────────────────────

const AUTO_REPLIES: Record<string, string[]> = {
  "conv-1": [
    "Love you sweetheart! 💕",
    "Make sure you're eating enough!",
    "Call me this weekend okay?",
    "I made your favorite cookies today 🍪",
  ],
  "conv-2": [
    "Got it, thanks!",
    "Sounds good to me",
    "Can we reschedule to Thursday?",
    "I'll review it this afternoon",
  ],
  "conv-3": [
    "Mark: Agreed",
    "Lisa: +1",
    "Sarah: Let's discuss in standup",
    "Tom: On it!",
  ],
  "conv-4": [
    "Haha yes exactly!",
    "Sounds like a plan",
    "Let's do it!",
    "That works for me",
  ],
  "conv-5": [
    "lol for real",
    "haha yeah",
    "no way!!",
    "that's so funny 😂",
  ],
};

export async function simulateIncomingMessage(
  conversationId: string,
  onMessage: (msg: Message) => void,
  onTyping: (typing: boolean) => void
): Promise<void> {
  const replies = AUTO_REPLIES[conversationId];
  if (!replies) return;

  const text = replies[Math.floor(Math.random() * replies.length)];

  // Show typing for 1–2.5s
  onTyping(true);
  await delay(1000 + Math.random() * 1500);
  onTyping(false);

  const msg: Message = {
    id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conversationId,
    text,
    timestamp: new Date().toISOString(),
    direction: "incoming",
    status: "read",
    reactions: [],
    isDeleted: false,
    replyTo: null,
  };

  if (!_messages[conversationId]) _messages[conversationId] = [];
  _messages[conversationId].push(msg);

  const cIdx = _conversations.findIndex((c) => c.id === conversationId);
  if (cIdx !== -1) {
    _conversations[cIdx] = {
      ..._conversations[cIdx],
      lastMessage: msg.text,
      updatedAt: msg.timestamp,
    };
  }

  void idbPutMessages([msg]).catch(() => {});
  onMessage({ ...msg });
}

// ── Pagination wrapper for MessageList ───────────────────────────────────────

export async function apiGetMessages(
  conversationId: string,
  cursor?: string,
  limit = 30
): Promise<{ messages: Message[]; hasMore: boolean; nextCursor: string | null }> {
  await jitter();
  const all = (_messages[conversationId] ?? []).map((m) => ({ ...m }));

  if (!cursor) {
    // First page: latest `limit` messages
    const slice = all.slice(Math.max(0, all.length - limit));
    const hasMore = all.length > limit;
    const nextCursor = hasMore ? all[Math.max(0, all.length - limit - 1)]?.id ?? null : null;
    return { messages: slice, hasMore, nextCursor };
  }

  // Cursor-based pagination: load `limit` messages before the cursor message
  const cursorIdx = all.findIndex((m) => m.id === cursor);
  if (cursorIdx <= 0) return { messages: [], hasMore: false, nextCursor: null };
  const slice = all.slice(Math.max(0, cursorIdx - limit), cursorIdx);
  const hasMore = cursorIdx - limit > 0;
  const nextCursor = hasMore ? all[Math.max(0, cursorIdx - limit - 1)]?.id ?? null : null;
  return { messages: slice, hasMore, nextCursor };
}

export async function apiGetConversation(id: string): Promise<Conversation | null> {
  return fetchConversation(id);
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function apiSearch(query: string): Promise<SearchResult[]> {
  return searchAll(query);
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  await jitter(200, 500);
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  // Search conversation names
  for (const conv of _conversations) {
    if (conv.archived) continue;
    if (conv.name.toLowerCase().includes(q) && !seen.has(`conv:${conv.id}`)) {
      seen.add(`conv:${conv.id}`);
      results.push({
        type: "conversation",
        conversationId: conv.id,
        conversationName: conv.name,
        messageId: null,
        text: conv.lastMessage,
        timestamp: conv.updatedAt,
      });
    }
  }

  // Search message text
  for (const [convId, msgs] of Object.entries(_messages)) {
    const conv = _conversations.find((c) => c.id === convId);
    if (!conv || conv.archived) continue;
    for (const msg of msgs) {
      if (msg.isDeleted) continue;
      if (msg.text.toLowerCase().includes(q)) {
        const key = `msg:${msg.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            type: "message",
            conversationId: conv.id,
            conversationName: conv.name,
            messageId: msg.id,
            text: msg.text,
            timestamp: msg.timestamp,
          });
        }
      }
    }
  }

  return results.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
