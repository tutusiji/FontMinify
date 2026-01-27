export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  // Use a simple session storage key to persist across hot reloads in dev,
  // but logically we treat it as per-session.
  // Actually, user wants refresh to clear. So per-page-load is correct.
  // We can just store it in a module-level variable, but React Fast Refresh might keep it.
  // To ensure "refresh clears", we want a new ID on hard refresh.
  // Module level variable is fine for that.

  if (!window.__FONT_SESSION_ID__) {
    window.__FONT_SESSION_ID__ = crypto.randomUUID();
  }

  return window.__FONT_SESSION_ID__;
}

declare global {
  interface Window {
    __FONT_SESSION_ID__?: string;
  }
}
