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
  const setOffline = useChatStore((s) => s.setIsOffline);

  useEffect(() => {
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setOffline(!navigator.onLine);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [setOffline]);

  return null;
}

function ThemeInitializer() {
  const theme = useChatStore((s) => s.theme);
  const setTheme = useChatStore((s) => s.setTheme);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Persist & restore theme from localStorage
    const saved = localStorage.getItem("messages-theme") as "light" | "dark" | "system" | null;
    if (saved) {
      setTheme(saved);
    } else {
      setTheme("system");
    }
  }, [setTheme]);

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
