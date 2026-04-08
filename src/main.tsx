import { createRoot } from "react-dom/client";
import "./i18n"; // Must be first — sets up language detection, dir, and body class
import App from "./App.tsx";
import "./index.css";

// Detect preview/iframe contexts where SW causes stale cache issues
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app");

const PREVIEW_SW_RESET_KEY = "__preview_sw_reset_v2__";

if (isPreviewHost || isInIframe) {
  // Clean SW + caches once in preview — no forced page reload
  if (!localStorage.getItem(PREVIEW_SW_RESET_KEY)) {
    void (async () => {
      const registrations =
        "serviceWorker" in navigator
          ? await navigator.serviceWorker.getRegistrations()
          : [];
      await Promise.all(registrations.map((r) => r.unregister()));
      if ("caches" in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((k) => caches.delete(k)));
      }
      localStorage.setItem(PREVIEW_SW_RESET_KEY, "1");
    })();
  }
} else {
  // Only register SW in production (not preview/iframe)
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({
      onNeedRefresh() {
        // Don't force-reload mid-session; the next natural navigation/reload
        // will pick up the new SW automatically.
        console.log("R8ESTATE: new version available — will activate on next visit");
      },
      onOfflineReady() {
        console.log("R8ESTATE is ready to work offline");
      },
    });
  });
}

const dismissBootShell = () => {
  const shell = document.getElementById("boot-shell");
  if (!shell) return;
  shell.classList.add("fade-out");
  setTimeout(() => shell.remove(), 450);
};

createRoot(document.getElementById("root")!).render(<App />);

requestAnimationFrame(() => {
  requestAnimationFrame(dismissBootShell);
});

window.addEventListener("load", dismissBootShell, { once: true });
setTimeout(dismissBootShell, 1200);
(window as any).__dismissBootShell?.();
