import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const APP_VERSION = '2026.03.01.02'; // <-- Change this number to force an update

// Execute aggressive cache clearing before React mounts if versions mismatch
if (localStorage.getItem('v_cache') !== APP_VERSION) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

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

    // Using replace with a timestamp forces the browser to treat it as a brand new page request
    const currentUrl = window.location.href.split('?')[0];

    if (isIOS) {
        // iOS Safari PWA is incredibly stubborn. 
        // We force a hard reload via true parameter, 
        // wrapped in timeout to allow SW unregistration.
        setTimeout(() => {
            (window.location as any).reload(true); // cast to any to force bypass cache
        }, 500);
    } else {
        // Android Chrome is compliant but aggressive. 
        // A direct URL mutation works perfectly.
        window.location.replace(`${currentUrl}?v=${new Date().getTime()}`);
    }
}

// Set title dynamically so WhatsApp crawler misses it but browsers show it
document.title = "UMKM eL Vision";

createRoot(document.getElementById("root")!).render(<App />);
