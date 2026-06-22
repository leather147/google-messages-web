"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useChatStore } from "@/store/useChatStore";
import { apiSearch } from "@/services/mockApi";
import { Avatar } from "@/components/ui/Avatar";
import { formatConversationTime } from "@/lib/dateUtils";
import type { SearchResult } from "@/types";
import { MOCK_CONVERSATIONS } from "@/mock/data";

interface SearchOverlayProps {
  onClose: () => void;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "var(--md-sys-color-primary-container)",
          color: "var(--md-sys-color-on-primary-container)",
          borderRadius: 2,
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const setSidebarOpen = useChatStore((s) => s.setSidebarOpen);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard: Escape closes
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: () => apiSearch(query),
    enabled: query.trim().length >= 1,
    staleTime: 5_000,
  });

  function handleResultClick(result: SearchResult) {
    setActiveConversationId(result.conversationId);
    if (window.innerWidth < 768) setSidebarOpen(false);
    onClose();
  }

  const conversations = MOCK_CONVERSATIONS;

  function getConvForResult(r: SearchResult) {
    return conversations.find((c) => c.id === r.conversationId);
  }

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col"
      style={{ background: "var(--md-sys-color-surface)" }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
    >
      {/* Search bar */}
      <div
        className="flex items-center gap-2 px-2 shrink-0"
        style={{
          height: 64,
          borderBottom: "1px solid var(--md-sys-color-outline-variant)",
        }}
      >
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors shrink-0"
          onClick={onClose}
          aria-label="Back"
          style={{ color: "var(--md-sys-color-on-surface-variant)" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }} aria-hidden="true">
            arrow_back
          </span>
        </button>

        <div className="flex-1 flex items-center gap-2">
          <span
            className="material-symbols-outlined shrink-0"
            style={{ fontSize: 22, color: "var(--md-sys-color-on-surface-variant)" }}
            aria-hidden="true"
          >
            search
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations and messages"
            className="flex-1 bg-transparent outline-none"
            style={{
              color: "var(--md-sys-color-on-surface)",
              fontSize: 16,
              fontFamily: "inherit",
            }}
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors shrink-0"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              style={{ color: "var(--md-sys-color-on-surface-variant)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }} aria-hidden="true">
                close
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isFetching && query.trim() && (
          <div className="flex justify-center py-6">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{
                borderColor: "var(--md-sys-color-outline-variant)",
                borderTopColor: "var(--md-sys-color-primary)",
              }}
              aria-label="Searching"
            />
          </div>
        )}

        {!isFetching && query.trim() && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 56, color: "var(--md-sys-color-outline)" }}
              aria-hidden="true"
            >
              search_off
            </span>
            <p
              style={{ color: "var(--md-sys-color-on-surface-variant)", fontSize: 14 }}
            >
              No results for &ldquo;{query}&rdquo;
            </p>
          </div>
        )}

        {!query.trim() && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 56, color: "var(--md-sys-color-outline)" }}
              aria-hidden="true"
            >
              search
            </span>
            <p
              style={{ color: "var(--md-sys-color-on-surface-variant)", fontSize: 14 }}
            >
              Search for people, groups, and messages
            </p>
          </div>
        )}

        {results.map((result) => {
          const conv = getConvForResult(result);
          return (
            <button
              key={`${result.conversationId}-${result.messageId ?? "conv"}`}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors text-left"
              onClick={() => handleResultClick(result)}
            >
              {conv && (
                <Avatar
                  name={conv.name}
                  initials={conv.initials}
                  avatarColor={conv.avatarColor}
                  avatar={conv.avatar}
                  size={40}
                  isGroup={conv.isGroup}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className="font-medium truncate"
                    style={{ fontSize: 14, color: "var(--md-sys-color-on-surface)" }}
                  >
                    {highlightMatch(result.conversationName, query)}
                  </span>
                  <span
                    style={{ fontSize: 11, color: "var(--md-sys-color-on-surface-variant)", flexShrink: 0 }}
                  >
                    {formatConversationTime(result.timestamp)}
                  </span>
                </div>
                {result.type === "message" && (
                  <p
                    className="text-sm truncate mt-0.5"
                    style={{ color: "var(--md-sys-color-on-surface-variant)", fontSize: 13 }}
                  >
                    {highlightMatch(result.text, query)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
