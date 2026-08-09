/** Shared Framer Motion transition presets, so "a card entering" or "a
 * button pressing" feels the same everywhere instead of ~20 slightly
 * different hand-tuned spring configs. Existing per-component values were
 * all reasonable individually; this just gives new/updated components one
 * source of truth instead of another one-off number. */

/** Cards, panels, and sheets entering the screen. */
export const springEnter = { type: 'spring' as const, stiffness: 280, damping: 24 };

/** Small UI feedback — button presses, toggles, list-item taps. */
export const springTap = { type: 'spring' as const, stiffness: 400, damping: 20 };

/** Modal/sheet open-close, where a slightly heavier settle reads as more
 * deliberate than a quick UI tap. */
export const springSheet = { type: 'spring' as const, stiffness: 320, damping: 30 };

/** Fast micro-interactions — status badges, small icon swaps. */
export const springQuick = { type: 'spring' as const, stiffness: 400, damping: 30 };
