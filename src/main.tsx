import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./i18n"; // Must be first — sets up language detection, dir, and body class
import App from "./App.tsx";
import "./index.css";

// Register service worker with auto-update
// When a new version is deployed, the SW updates silently and reloads the page
const updateSW = registerSW({
  onNeedRefresh() {
    // Auto-reload when new content is available
    updateSW(true);
  },
  onOfflineReady() {
    console.log("R8ESTATE is ready to work offline");
  },
});

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
