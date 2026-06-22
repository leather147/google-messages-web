# Google Messages Web Clone

A high-fidelity web implementation of Google Messages UI built with **Next.js 15**, **Material Design 3 Web Components**, and a modern real-time messaging architecture.

This project focuses on **UI accuracy, responsiveness, and production-grade frontend architecture**, not backend integration with Google services.

---

## 🚀 Features

### UI / UX (Google Messages parity)
- Split-view layout (conversation list + chat)
- Mobile-first adaptive navigation
- Material Design 3 components (`@material/web`)
- Conversation list with avatars, previews, timestamps
- Chat thread with grouped messages
- Message composer with attachments + actions
- Search overlay (global + in-chat)
- Context menu for messages
- Message reactions UI (UI layer only)
- Typing indicator (mocked)
- Read / sent status indicators

---

### Architecture
- Next.js 15 App Router
- TypeScript
- Zustand state management
- TanStack Query (data layer abstraction)
- IndexedDB caching layer
- Mock realtime service (WebSocket abstraction)
- Clean modular component architecture

---

### UI System
- Material Design 3 tokens
- Dark / Light theme support
- Dynamic surface elevation system
- Material motion transitions
- Fully responsive breakpoints:
  - Desktop: Split view
  - Tablet: Rail + split
  - Mobile: Full-screen navigation

---

### Performance
- Virtualized message rendering
- Lazy-loaded conversation threads
- Optimized re-rendering via store slicing
- Cached conversation state in IndexedDB

---

## 🧱 Tech Stack

- Next.js 15
- React 18+
- TypeScript
- @material/web (Material 3 Web Components)
- Zustand
- TanStack Query
- Framer Motion
- idb (IndexedDB wrapper)
- date-fns

---

## 📁 Project Structure

```txt
src/
├── app/                  # Next.js routes
├── components/           # UI components
│   ├── chat/
│   ├── conversations/
│   ├── navigation/
│   ├── search/
│   └── shared/
├── store/               # Zustand stores
├── services/            # Mock + realtime layer
├── lib/                 # helpers
├── mock/                # fake dataset
├── hooks/               # reusable hooks
└── styles/              # theme system