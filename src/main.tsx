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

if (isPreviewHost || isInIframe) {
  // Unregister any existing service workers in preview/iframe contexts
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
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
