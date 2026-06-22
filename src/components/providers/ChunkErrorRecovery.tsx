"use client";

import { useEffect } from "react";

/**
 * Catches Turbopack/Webpack chunk load failures (the {"isTrusted":true} /
 * loadChunkByUrlInternal errors) that occur when the dev server recompiles
 * and emits new chunk hashes while the browser still holds references to
 * the old ones. When detected, we do a single hard reload to recover.
 */
export function ChunkErrorRecovery() {
  useEffect(() => {
    let reloading = false;

    function handleError(event: ErrorEvent) {
      if (reloading) return;
      const msg = event.message ?? "";
      // Turbopack chunk load failures surface as isTrusted network errors
      // with no useful message, or as explicit "ChunkLoadError" / "Loading chunk"
      const isChunkError =
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("loadChunkByUrl") ||
        (event.error instanceof TypeError && msg === "");
      if (isChunkError) {
        reloading = true;
        window.location.reload();
      }
    }

    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      if (reloading) return;
      const reason = event.reason;
      if (!reason) return;
      const msg: string =
        reason?.message ?? reason?.toString?.() ?? "";
      const isChunkError =
        msg.includes("ChunkLoadError") ||
        msg.includes("Loading chunk") ||
        msg.includes("loadChunkByUrl") ||
        // Turbopack emits a plain TypeError with isTrusted true and no message
        (reason instanceof TypeError && msg === "");
      if (isChunkError) {
        reloading = true;
        window.location.reload();
      }
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
