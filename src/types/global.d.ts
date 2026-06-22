// ---------------------------------------------------------------------------
// Data model types
// ---------------------------------------------------------------------------

export type MessageStatus = "sent" | "delivered" | "read";
export type MessageDirection = "incoming" | "outgoing";

export interface Reaction {
  emoji: string;
  count: number;
}

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  timestamp: string;
  direction: MessageDirection;
  status: MessageStatus;
  reactions: Reaction[];
  isDeleted: boolean;
  replyTo: string | null;
}

export interface Conversation {
  id: string;
  name: string;
  avatar: string | null;
  avatarColor: string;
  initials: string;
  phone: string | null;
  lastMessage: string;
  updatedAt: string;
  pinned: boolean;
  archived: boolean;
  unreadCount: number;
  isGroup: boolean;
  isSpam: boolean;
  muted?: boolean;
  typing?: boolean;
}

export interface SearchResult {
  conversationId: string;
  conversationName: string;
  messageId: string | null;
  text: string;
  timestamp: string;
  type: "conversation" | "message";
}

// ---------------------------------------------------------------------------
// Material Web Component JSX declarations (React 19 custom-element support)
// ---------------------------------------------------------------------------

type MWCProps<T extends Record<string, unknown> = Record<string, unknown>> =
  React.HTMLAttributes<HTMLElement> &
    T & {
      class?: string;
      ref?: React.RefObject<HTMLElement | null>;
    };

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      // Text fields
      "md-filled-text-field": MWCProps<{
        label?: string;
        value?: string;
        type?: string;
        disabled?: boolean;
        required?: boolean;
        placeholder?: string;
        rows?: number;
        maxlength?: number;
        "supporting-text"?: string;
        error?: boolean;
        "error-text"?: string;
        readonly?: boolean;
      }>;
      "md-outlined-text-field": MWCProps<{
        label?: string;
        value?: string;
        type?: string;
        disabled?: boolean;
        required?: boolean;
        placeholder?: string;
        rows?: number;
        maxlength?: number;
      }>;

      // Buttons
      "md-filled-button": MWCProps<{ disabled?: boolean; href?: string }>;
      "md-outlined-button": MWCProps<{ disabled?: boolean; href?: string }>;
      "md-text-button": MWCProps<{ disabled?: boolean; href?: string }>;
      "md-tonal-button": MWCProps<{ disabled?: boolean; href?: string }>;
      "md-elevated-button": MWCProps<{ disabled?: boolean; href?: string }>;

      // Icon buttons
      "md-icon-button": MWCProps<{
        disabled?: boolean;
        toggle?: boolean;
        selected?: boolean;
        href?: string;
        "aria-label"?: string;
      }>;
      "md-filled-icon-button": MWCProps<{
        disabled?: boolean;
        toggle?: boolean;
        selected?: boolean;
      }>;
      "md-tonal-icon-button": MWCProps<{
        disabled?: boolean;
        toggle?: boolean;
        selected?: boolean;
      }>;

      // FAB
      "md-fab": MWCProps<{
        variant?: "surface" | "primary" | "secondary" | "tertiary";
        size?: "small" | "medium" | "large";
        label?: string;
        lowered?: boolean;
      }>;
      "md-branded-fab": MWCProps<{
        size?: "medium" | "large";
        label?: string;
        lowered?: boolean;
      }>;

      // Icon
      "md-icon": MWCProps;

      // Chips
      "md-chip-set": MWCProps;
      "md-filter-chip": MWCProps<{
        label?: string;
        selected?: boolean;
        disabled?: boolean;
        removable?: boolean;
      }>;
      "md-assist-chip": MWCProps<{
        label?: string;
        disabled?: boolean;
        href?: string;
      }>;
      "md-input-chip": MWCProps<{
        label?: string;
        disabled?: boolean;
        removable?: boolean;
      }>;
      "md-suggestion-chip": MWCProps<{
        label?: string;
        disabled?: boolean;
        href?: string;
      }>;

      // Lists
      "md-list": MWCProps;
      "md-list-item": MWCProps<{
        disabled?: boolean;
        type?: string;
        href?: string;
        interactive?: boolean;
      }>;

      // Dialogs
      "md-dialog": MWCProps<{ open?: boolean; quick?: boolean }>;

      // Menus
      "md-menu": MWCProps<{
        open?: boolean;
        anchor?: string;
        positioning?: string;
        quick?: boolean;
      }>;
      "md-menu-item": MWCProps<{
        disabled?: boolean;
        href?: string;
        type?: string;
      }>;
      "md-sub-menu": MWCProps<{ "menu-corner"?: string; "anchor-corner"?: string }>;

      // Divider
      "md-divider": MWCProps<{
        inset?: boolean;
        "inset-start"?: boolean;
        "inset-end"?: boolean;
      }>;

      // Progress
      "md-circular-progress": MWCProps<{
        value?: number;
        max?: number;
        indeterminate?: boolean;
      }>;
      "md-linear-progress": MWCProps<{
        value?: number;
        max?: number;
        indeterminate?: boolean;
        buffer?: number;
      }>;

      // Misc
      "md-ripple": MWCProps;
      "md-focus-ring": MWCProps;
      "md-badge": MWCProps<{ value?: number }>;

      // Tabs
      "md-tabs": MWCProps;
      "md-primary-tab": MWCProps<{
        active?: boolean;
        "inline-icon"?: boolean;
      }>;
      "md-secondary-tab": MWCProps<{ active?: boolean }>;

      // Switch / Checkbox / Radio
      "md-switch": MWCProps<{
        selected?: boolean;
        disabled?: boolean;
        icons?: boolean;
      }>;
      "md-checkbox": MWCProps<{
        checked?: boolean;
        indeterminate?: boolean;
        disabled?: boolean;
      }>;
      "md-radio": MWCProps<{
        checked?: boolean;
        disabled?: boolean;
        name?: string;
        value?: string;
      }>;

      // Slider
      "md-slider": MWCProps<{
        min?: number;
        max?: number;
        value?: number;
        step?: number;
        disabled?: boolean;
        labeled?: boolean;
        ticks?: boolean;
      }>;
    }
  }
}

export {};
