import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';

const R = 64;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function AttendancePercentRing({ percent }: { percent: number | null }) {
  const progressRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!progressRef.current) return;
    const clamped = Math.min(100, Math.max(0, percent ?? 0));
    const target = CIRCUMFERENCE * (1 - clamped / 100);
    const reduced = document.documentElement.getAttribute('data-motion') === 'off';
    const tween = gsap.to(progressRef.current, {
      strokeDashoffset: target,
      duration: reduced ? 0 : 1,
      ease: 'power3.out',
    });
    return () => { tween.kill(); };
  }, [percent]);

  return (
    <motion.div
      className="relative mx-auto grid h-[160px] w-[160px] place-items-center"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
        <circle className="fill-none stroke-neutral-100" strokeWidth={12} cx="80" cy="80" r={R} />
        <circle
          ref={progressRef}
          className="fill-none stroke-brand"
          strokeWidth={12}
          strokeLinecap="round"
          cx="80"
          cy="80"
          r={R}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <div className="relative flex flex-col items-center">
        {percent === null ? (
          <span className="text-lg font-bold text-muted-text">--</span>
        ) : (
          <AnimatedNumber value={percent} decimals={1} suffix="%" className="text-2xl font-bold tabular-nums text-neutral-900" />
        )}
        <span className="text-2xs font-bold uppercase tracking-wide text-muted-text">Attendance</span>
      </div>
    </motion.div>
  );
}
