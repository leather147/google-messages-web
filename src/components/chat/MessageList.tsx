"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useChatStore } from "@/store/useChatStore";
import { fetchMessages } from "@/services/mockApi";
import { idbGetMessages, idbPutMessages } from "@/lib/idb";
import { MessageBubble } from "./MessageBubble";
import { DateSeparator } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { MessageListSkeleton } from "@/components/ui/Skeleton";
import { getDateKey, shouldGroupWithPrevious } from "@/lib/dateUtils";
import type { Message } from "@/types/global";

interface MessageListProps {
  conversationId: string;
  onContextMenu: (messageId: string, e: React.MouseEvent) => void;
  onReactionClick: (messageId: string, e?: React.MouseEvent) => void;
}

export function MessageList({
  conversationId,
  onContextMenu,
  onReactionClick,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const storeMessages = useChatStore((s) => s.messages[conversationId] ?? []);
  const typingConversationIds = useChatStore((s) => s.typingConversationIds);
  const isTyping = typingConversationIds.has(conversationId);

  const PAGE_SIZE = 30;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam }) => {
      try {
        const all = await fetchMessages(conversationId);
        await idbPutMessages(all);
        // Client-side pagination: newest messages first in pages
        const offset = (pageParam as number) ?? 0;
        const slice = all.slice(
          Math.max(0, all.length - PAGE_SIZE - offset),
          all.length - offset
        );
        const hasMore = all.length - PAGE_SIZE - offset > 0;
        return { messages: slice, hasMore, nextOffset: offset + PAGE_SIZE };
      } catch {
        const cached = await idbGetMessages(conversationId);
        return { messages: cached, hasMore: false, nextOffset: PAGE_SIZE };
      }
    },
    initialPageParam: 0 as number,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    staleTime: 10_000,
  });

  // Merge API messages + store (optimistic) messages, dedupe by id
  const apiMessages: Message[] = data?.pages.flatMap((p) => p.messages) ?? [];
  const allMessages = [...apiMessages];

  // Add store messages that aren't in API result (optimistic / newly arrived)
  for (const msg of storeMessages) {
    if (!allMessages.find((m) => m.id === msg.id)) {
      allMessages.push(msg);
    } else {
      // Replace with store version (may have updated status)
      const idx = allMessages.findIndex((m) => m.id === msg.id);
      if (idx !== -1) allMessages[idx] = msg;
    }
  }

  allMessages.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Scroll tracking
  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 80;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    // Infinite scroll upward
    if (el.scrollTop < 80 && hasNextPage && !isFetchingNextPage) {
      const prevScrollHeight = el.scrollHeight;
      fetchNextPage().then(() => {
        // Restore scroll position after loading older messages
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight - prevScrollHeight;
        });
      });
    }
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages.length, isTyping]);

  // Scroll to bottom on first load
  useEffect(() => {
    if (!isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [isLoading, conversationId]);

  if (isLoading) return <MessageListSkeleton />;

  // Group messages by date key and compute grouping
          type RenderedItem =
    | { type: "separator"; key: string; isoDate: string }
    | { type: "message"; key: string; message: Message; isGrouped: boolean; isLastInGroup: boolean; replyToMessage: Message | null };

  const items: RenderedItem[] = [];
  let lastDateKey = "";

  for (let i = 0; i < allMessages.length; i++) {
    const msg = allMessages[i];
    const dateKey = getDateKey(msg.timestamp);

    if (dateKey !== lastDateKey) {
      items.push({ type: "separator", key: `sep-${dateKey}`, isoDate: msg.timestamp });
      lastDateKey = dateKey;
    }

    const prev = allMessages[i - 1] ?? null;
    const next = allMessages[i + 1] ?? null;
    const isGrouped = shouldGroupWithPrevious(msg, prev);
    const isLastInGroup = !shouldGroupWithPrevious(
      next ?? { direction: "", timestamp: "" },
      msg
    );

    const replyToMessage = msg.replyTo
      ? allMessages.find((m) => m.id === msg.replyTo) ?? null
      : null;

    items.push({
      type: "message",
      key: msg.id,
      message: msg,
      isGrouped,
      isLastInGroup,
      replyToMessage,
    });
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden py-2"
      onScroll={handleScroll}
      role="log"
      aria-label="Messages"
      aria-live="polite"
    >
      {/* Load more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-3">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{
              borderColor: "var(--md-sys-color-outline-variant)",
              borderTopColor: "var(--md-sys-color-primary)",
            }}
            aria-label="Loading older messages"
          />
        </div>
      )}

      {/* Messages */}
      <AnimatePresence initial={false}>
        {items.map((item) => {
          if (item.type === "separator") {
            return <DateSeparator key={item.key} isoDate={item.isoDate} />;
          }
          return (
            <MessageBubble
              key={item.key}
              message={item.message}
              isGrouped={item.isGrouped}
              isLastInGroup={item.isLastInGroup}
              onContextMenu={onContextMenu}
              onReactionClick={onReactionClick}
              isOptimistic={item.message.id.startsWith("opt-")}
              replyToMessage={item.replyToMessage}
            />
          );
        })}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {isTyping && <TypingIndicator key="typing" />}
      </AnimatePresence>

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
