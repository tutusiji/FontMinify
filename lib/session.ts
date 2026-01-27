export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  // Use a simple session storage key to persist across hot reloads in dev,
  // but logically we treat it as per-session.
  // Actually, user wants refresh to clear. So per-page-load is correct.
  // We can just store it in a module-level variable, but React Fast Refresh might keep it.
  // To ensure "refresh clears", we want a new ID on hard refresh.
  // Module level variable is fine for that.

  if (!window.__FONT_SESSION_ID__) {
    // Polyfill for crypto.randomUUID in insecure contexts (HTTP)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      window.__FONT_SESSION_ID__ = crypto.randomUUID();
    } else {
      // Fallback implementation (RFC4122 version 4)
      window.__FONT_SESSION_ID__ =
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    }
  }

  return window.__FONT_SESSION_ID__;
}

declare global {
  interface Window {
    __FONT_SESSION_ID__?: string;
  }
}
