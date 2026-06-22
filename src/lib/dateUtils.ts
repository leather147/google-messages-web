import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisYear,
  differenceInMinutes,
  parseISO,
} from "date-fns";

/**
 * Returns the compact timestamp label shown in the conversation list row.
 * - Today       → "3:45 PM"
 * - Yesterday   → "Yesterday"
 * - This week   → "Mon"
 * - This year   → "Jan 12"
 * - Older       → "1/12/24"
 */
export function formatConversationTime(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date, { weekStartsOn: 0 })) return format(date, "EEE");
  if (isThisYear(date)) return format(date, "MMM d");
  return format(date, "M/d/yy");
}

/**
 * Returns a date separator label for message groups.
 * - Today       → "Today"
 * - Yesterday   → "Yesterday"
 * - This week   → "Monday"
 * - This year   → "January 12"
 * - Older       → "January 12, 2024"
 */
export function formatDateSeparator(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date, { weekStartsOn: 0 })) return format(date, "EEEE");
  if (isThisYear(date)) return format(date, "MMMM d");
  return format(date, "MMMM d, yyyy");
}

/**
 * Returns the time shown inside a chat bubble.
 */
export function formatMessageTime(iso: string): string {
  return format(parseISO(iso), "h:mm a");
}

/**
 * Groups messages by calendar day for rendering date separators.
 */
export function getDateKey(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd");
}

/**
 * Whether two messages are "close enough" to be grouped together
 * (same sender, within 3 minutes).
 */
export function shouldGroupWithPrevious(
  current: { direction: string; timestamp: string },
  previous: { direction: string; timestamp: string } | null
): boolean {
  if (!previous) return false;
  if (current.direction !== previous.direction) return false;
  const diff = differenceInMinutes(
    parseISO(current.timestamp),
    parseISO(previous.timestamp)
  );
  return diff < 3;
}
