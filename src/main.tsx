import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const APP_VERSION = (window as any).__APP_VERSION__ || '2026.04.28.01';

// Execute aggressive cache clearing before React mounts if versions mismatch
if (localStorage.getItem('v_cache') !== APP_VERSION) {
    // 1. Clear all Service Workers
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            if (regs) regs.forEach(r => r.unregister());
        }).catch(e => console.warn("SW Clear Error:", e));
    }

    // 2. Clear all Browser Caches
    if ('caches' in window && window.caches) {
        caches.keys().then(names => {
            if (names) names.forEach(name => caches.delete(name));
        }).catch(e => console.warn("Caches Clear Error:", e));
    }

    // 3. Update version and force nuclear reload via URL mutation (Bypasses legacy device caching)
    localStorage.setItem('v_cache', APP_VERSION);
    setTimeout(() => window.location.reload(), 500);
}

// Set title dynamically so WhatsApp crawler misses it but browsers show it
document.title = "UMKM eL Vision";

createRoot(document.getElementById("root")!).render(<App />);
