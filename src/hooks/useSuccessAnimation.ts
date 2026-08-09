import { useEffect, useState } from 'react';

/** Manages the show/auto-hide lifecycle for a success animation. Callers
 * just call `trigger()` after a successful mutation; the animation shows
 * for a fixed short duration and clears itself, no manual timers needed
 * at each call site. */
export function useSuccessAnimation(durationMs = 900) {
  const [visible, setVisible] = useState(false);

  const trigger = () => setVisible(true);

  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(id);
  }, [visible, durationMs]);

  return { visible, trigger };
}
