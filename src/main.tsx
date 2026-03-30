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

const PREVIEW_SW_RESET_KEY = "__preview_sw_reset__";

if (isPreviewHost || isInIframe) {
  // Aggressively clean SW + caches in preview/iframe contexts so latest code is always shown
  void (async () => {
    const registrations =
      "serviceWorker" in navigator
        ? await navigator.serviceWorker.getRegistrations()
        : [];

    const hadActiveServiceWorker =
      registrations.length > 0 || Boolean(navigator.serviceWorker?.controller);

    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    }

    // One-time hard refresh after cleanup to immediately escape stale SW-controlled render
    if (hadActiveServiceWorker && !sessionStorage.getItem(PREVIEW_SW_RESET_KEY)) {
      sessionStorage.setItem(PREVIEW_SW_RESET_KEY, "1");
      window.location.reload();
    }
  })();
} else {
  // Only register SW in production (not preview/iframe)
  import("virtual:pwa-register").then(({ registerSW }) => {
    const updateSW = registerSW({
      onNeedRefresh() {
        updateSW(true);
      },
      onOfflineReady() {
        console.log("R8ESTATE is ready to work offline");
      },
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);

// Fade out boot shell after React has painted
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const shell = document.getElementById("boot-shell");
    if (shell) {
      shell.classList.add("fade-out");
      setTimeout(() => shell.remove(), 450);
    }
  });
});
