import { createRoot } from "react-dom/client";
import "./i18n"; // Must be first — sets up language detection, dir, and body class
import App from "./App.tsx";
import "./index.css";

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
