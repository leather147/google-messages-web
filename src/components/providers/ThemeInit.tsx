"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";

/** Applies system theme preference on first mount. */
export default function ThemeInit() {
  const setTheme = useChatStore((s) => s.setTheme);

  useEffect(() => {
    setTheme("system");

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setTheme]);

  return null;
}
