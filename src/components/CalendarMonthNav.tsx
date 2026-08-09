import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function CalendarMonthNav({
  year,
  month,
  onPrev,
  onNext,
  canGoNext,
}: {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  canGoNext: boolean;
}) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const prevKey = useRef(`${year}-${month}`);

  // GSAP crossfade+shift whenever the displayed month actually changes —
  // a real timeline, not a CSS transition, per the animation requirements.
  useLayoutEffect(() => {
    const key = `${year}-${month}`;
    if (key === prevKey.current || !labelRef.current) {
      prevKey.current = key;
      return;
    }
    prevKey.current = key;

    const reduced = document.documentElement.getAttribute('data-motion') === 'off';
    if (reduced) return;

    const tween = gsap.fromTo(
      labelRef.current,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' },
    );
    return () => { tween.kill(); };
  }, [year, month]);

  return (
    <div className="flex items-center justify-between px-1">
      <button
        type="button"
        onClick={onPrev}
        className="grid h-9 w-9 place-items-center rounded-full bg-neutral-0 text-neutral-500 shadow-sm active:scale-90 transition-transform"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </button>

      <span ref={labelRef} className="text-md font-bold text-neutral-900">
        {MONTH_NAMES[month]} {year}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="grid h-9 w-9 place-items-center rounded-full bg-neutral-0 text-neutral-500 shadow-sm transition-transform enabled:active:scale-90 disabled:opacity-30"
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
