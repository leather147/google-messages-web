/**
 * IndexedDB wrapper for Google Messages Web
 * Provides offline persistence for conversations and messages.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Conversation, Message } from "@/types/global";

const DB_NAME = "google-messages";
const DB_VERSION = 1;

interface MessagesDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: { "by-updated": string };
  };
  messages: {
    key: string;
    value: Message;
    indexes: { "by-conversation": string };
  };
  metadata: {
    key: string;
    value: { key: string; value: unknown };
  };
}

let dbPromise: Promise<IDBPDatabase<MessagesDB>> | null = null;

function getDB(): Promise<IDBPDatabase<MessagesDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB not available in SSR"));
  }
  if (!dbPromise) {
    dbPromise = openDB<MessagesDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("conversations")) {
          const s = db.createObjectStore("conversations", { keyPath: "id" });
          s.createIndex("by-updated", "updatedAt");
        }
        if (!db.objectStoreNames.contains("messages")) {
          const s = db.createObjectStore("messages", { keyPath: "id" });
          s.createIndex("by-conversation", "conversationId");
        }
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

// ── Conversations ──────────────────────────────────────────────────────────

export async function idbGetAllConversations(): Promise<Conversation[]> {
  try {
    const db = await getDB();
    return db.getAll("conversations");
  } catch { return []; }
}

export async function idbPutConversation(conv: Conversation): Promise<void> {
  try {
    const db = await getDB();
    await db.put("conversations", conv);
  } catch { /* best-effort cache */ }
}

export async function idbPutConversations(convs: Conversation[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction("conversations", "readwrite");
    await Promise.all([...convs.map((c) => tx.store.put(c)), tx.done]);
  } catch { /* best-effort cache */ }
}

// ── Messages ───────────────────────────────────────────────────────────────

export async function idbGetMessages(conversationId: string): Promise<Message[]> {
  try {
    const db = await getDB();
    const all = await db.getAllFromIndex("messages", "by-conversation", conversationId);
    return all.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch { return []; }
}

export async function idbPutMessage(msg: Message): Promise<void> {
  try {
    const db = await getDB();
    await db.put("messages", msg);
  } catch { /* best-effort cache */ }
}

export async function idbPutMessages(msgs: Message[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction("messages", "readwrite");
    await Promise.all([...msgs.map((m) => tx.store.put(m)), tx.done]);
  } catch { /* best-effort cache */ }
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function idbGetMeta<T>(key: string): Promise<T | undefined> {
  try {
    const db = await getDB();
    const record = await db.get("metadata", key);
    return record?.value as T | undefined;
  } catch { return undefined; }
}

export async function idbSetMeta(key: string, value: unknown): Promise<void> {
  try {
    const db = await getDB();
    await db.put("metadata", { key, value });
  } catch { /* best-effort cache */ }
}
