"use client";

import { useEffect } from "react";

/**
 * Dynamically imports all @material/web components on the client only.
 * Mounted once at the root so elements are defined before any MWC JSX renders.
 */
export function MWCLoader() {
  useEffect(() => {
    import("@material/web/all.js").catch(() => {});
  }, []);
  return null;
}
