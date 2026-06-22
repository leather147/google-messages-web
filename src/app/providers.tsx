"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/useChatStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function OfflineDetector() {
  useEffect(() => {
    const { setIsOffline } = useChatStore.getState();
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return null;
}

function ThemeInitializer() {
  const theme = useChatStore((s) => s.theme);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const { setTheme } = useChatStore.getState();
    // Persist & restore theme from localStorage
    const saved = localStorage.getItem("messages-theme") as "light" | "dark" | "system" | null;
    if (saved) {
      setTheme(saved);
    } else {
      setTheme("system");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("messages-theme", theme);
  }, [theme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineDetector />
      <ThemeInitializer />
      {children}
    </QueryClientProvider>
  );
}
