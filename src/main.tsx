import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const APP_VERSION = '2026.02.27.02'; // <-- Change this number to force an update

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

    // 3. Update version and Hard Reload
    localStorage.setItem('v_cache', APP_VERSION);
    window.location.reload();
}

// Set title dynamically so WhatsApp crawler misses it but browsers show it
document.title = "UMKM eL Vision";

createRoot(document.getElementById("root")!).render(<App />);
