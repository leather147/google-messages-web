"use client";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

export function Skeleton({ className = "", width, height, rounded = "rounded-md" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--md-sys-color-surface-container-high)] ${rounded} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Skeleton width={48} height={48} rounded="rounded-full" className="shrink-0" />
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Skeleton height={14} className="w-32" />
          <Skeleton height={11} className="w-10" />
        </div>
        <Skeleton height={13} className="w-4/5" />
      </div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div aria-label="Loading conversations" aria-busy="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  );
}

export function MessageSkeleton({ outgoing = false }: { outgoing?: boolean }) {
  return (
    <div className={`flex ${outgoing ? "justify-end" : "justify-start"} px-4 py-1`}>
      <Skeleton
        height={40}
        rounded="rounded-2xl"
        className={outgoing ? "w-48" : "w-56"}
      />
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div aria-label="Loading messages" aria-busy="true" className="flex flex-col gap-1 p-4">
      <MessageSkeleton />
      <MessageSkeleton outgoing />
      <MessageSkeleton />
      <MessageSkeleton />
      <MessageSkeleton outgoing />
      <MessageSkeleton />
      <MessageSkeleton outgoing />
    </div>
  );
}
