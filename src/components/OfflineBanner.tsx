import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';

/** Tracks the browser's online/offline state via the standard events. This
 * only reflects whether the device has *a* network connection, not whether
 * Firebase specifically is reachable — that's a coarser signal, but it's
 * exactly what's needed for "you're offline" messaging: Firestore's own
 * per-request error handling (see attendanceService/authService callers)
 * already covers the "connected but Firebase unreachable" case separately. */
function useOnlineStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}

/** Small, non-blocking banner shown app-wide while offline. Does not claim
 * any action succeeded — it only informs; every mutation still shows its
 * own real success/failure via the existing toast system once it actually
 * resolves against Firebase. */
export function OfflineBanner() {
  const online = useOnlineStatus();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          className="fixed inset-x-0 top-0 z-[700] flex items-center justify-center gap-2 bg-neutral-900 px-4 py-2 text-center text-xs font-semibold text-white [padding-top:env(safe-area-inset-top,0px)]"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        >
          <WifiOff size={14} />
          You're offline — some data may be unavailable.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
