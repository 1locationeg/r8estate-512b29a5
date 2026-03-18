import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Set initial direction based on saved language
const savedLanguage = localStorage.getItem('language') || 'en';
document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = savedLanguage;

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
