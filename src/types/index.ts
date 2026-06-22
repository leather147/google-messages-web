// Re-export everything from the canonical type file so both
// "@/types" and "@/types/global" resolve identically.
export type {
  MessageStatus,
  MessageDirection,
  Reaction,
  Message,
  Conversation,
  SearchResult,
} from "./global";

export type ConversationTab = "messages" | "pinned" | "archived";
