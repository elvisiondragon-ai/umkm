import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ServiceWorkerUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000); // Check every minute
      }
    },
    onRegisterError(error) {
      console.log('SW registration error:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      console.log('New content available, updating service worker...');
      updateServiceWorker(true); // This will force a reload
    }
  }, [needRefresh, updateServiceWorker]);

  return null; // This component doesn't render anything
}

export default ServiceWorkerUpdater;
