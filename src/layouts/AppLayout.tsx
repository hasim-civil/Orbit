import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuroraBackground } from '@/components/AuroraBackground';
import { BottomNav } from '@/components/BottomNav';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { useSettingsStore } from '@/store/settingsStore';
import { trackPageView } from '@/lib/analytics';

/** Short, subtle transition between routes — a small fade + vertical
 * settle, not a "loading" style animation. Skipped entirely under Reduce
 * Motion (checked once per render via the DOM attribute useThemeSync keeps
 * in sync, same pattern already used by every other GSAP/Framer effect in
 * the app) so route changes stay instant for anyone who's opted out. */
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function AppLayout() {
  const location = useLocation();
  const manuallyReduced = useSettingsStore((s) => s.reducedMotion);
  const reduced =
    manuallyReduced ||
    (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh pb-24">
      <AuroraBackground />
      {/* Mobile-first content stays full-width on phones; on tablet/desktop
          it's capped and centered instead of stretching buttons and cards
          to disproportionate widths. The bottom nav intentionally stays
          full-viewport-width (a fixed element, matching the mobile app
          pattern used throughout) rather than being constrained with it. */}
      <div className="mx-auto max-w-2xl px-4">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={location.pathname}
            initial={reduced ? undefined : 'initial'}
            animate={reduced ? undefined : 'animate'}
            exit={reduced ? undefined : 'exit'}
            variants={pageVariants}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            <RouteErrorBoundary resetKey={location.pathname}>
              <Outlet />
            </RouteErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
