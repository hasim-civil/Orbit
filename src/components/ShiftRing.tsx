import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AttendanceRecord } from '@/types/attendance';

const SHIFT_HOURS = 8;
const R = 76;
const CIRCUMFERENCE = 2 * Math.PI * R;

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function ShiftRing({ record }: { record: AttendanceRecord | null }) {
  const progressRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const glowTweenRef = useRef<gsap.core.Tween | null>(null);
  const [now, setNow] = useState(() => new Date());

  const checkInDate = record?.checkIn ? (record.checkIn as unknown as { toDate: () => Date }).toDate() : null;
  const checkOutDate = record?.checkOut ? (record.checkOut as unknown as { toDate: () => Date }).toDate() : null;
  const isRunning = !!checkInDate && !checkOutDate;
  const isComplete = !!checkInDate && !!checkOutDate;

  // Tick once a minute while a shift is running, matching the original's
  // "smallest unit anyone reads here" reasoning and battery-friendly cadence.
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [isRunning]);

  const { elapsedMin, caption, eyebrow, fraction } = useMemo(() => {
    if (!checkInDate) {
      return { elapsedMin: null as number | null, caption: 'Not checked in', eyebrow: 'Today', fraction: 0 };
    }
    if (checkOutDate) {
      const worked = Math.max(0, (checkOutDate.getTime() - checkInDate.getTime()) / 60000);
      return { elapsedMin: worked, caption: 'Shift complete', eyebrow: 'Worked', fraction: worked / (SHIFT_HOURS * 60) };
    }
    const worked = Math.max(0, (now.getTime() - checkInDate.getTime()) / 60000);
    const left = SHIFT_HOURS * 60 - worked;
    return {
      elapsedMin: worked,
      caption: left > 0 ? `${formatMinutes(left)} left` : 'Full day reached',
      eyebrow: 'On the clock',
      fraction: worked / (SHIFT_HOURS * 60),
    };
  }, [checkInDate, checkOutDate, now]);

  // GSAP drives the actual ring fill — a real tween, not a CSS transition.
  useEffect(() => {
    if (!progressRef.current) return;
    const clamped = Math.min(1, Math.max(0, fraction));
    const target = CIRCUMFERENCE * (1 - clamped);
    gsap.to(progressRef.current, {
      strokeDashoffset: target,
      duration: 1.1,
      ease: 'power3.out',
      onUpdate: () => {
        // A round linecap on a near-zero-length arc still paints a visible
        // dot at 0%. Hide the stroke until there's a real sliver to show.
        if (progressRef.current) {
          progressRef.current.style.opacity = clamped <= 0.002 ? '0' : '1';
        }
      },
    });
  }, [fraction]);

  // Soft pulsing glow while a shift is running — a GSAP timeline, not a
  // CSS keyframe animation.
  useEffect(() => {
    glowTweenRef.current?.kill();
    if (!glowRef.current) return;
    if (isRunning) {
      glowTweenRef.current = gsap.to(glowRef.current, {
        opacity: 0.9,
        scale: 1.06,
        duration: 1.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    } else {
      gsap.set(glowRef.current, { opacity: 0, scale: 1 });
    }
    return () => { glowTweenRef.current?.kill(); };
  }, [isRunning]);

  return (
    <motion.div
      className="relative mx-auto mb-6 mt-1 grid h-[190px] w-[190px] shrink-0 place-items-center"
      role="img"
      aria-label={
        !checkInDate
          ? 'Not checked in today'
          : isComplete
            ? `Shift complete, ${formatMinutes(elapsedMin ?? 0)} worked`
            : `${formatMinutes(elapsedMin ?? 0)} worked so far today`
      }
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
    >
      <div
        ref={glowRef}
        className={cn(
          'pointer-events-none absolute inset-2.5 rounded-full opacity-0 blur-[6px]',
          isComplete
            ? '[background:radial-gradient(circle,rgba(18,161,80,0.24)_0%,rgba(95,217,209,0.14)_55%,transparent_75%)]'
            : '[background:radial-gradient(circle,rgba(107,78,255,0.28)_0%,rgba(95,217,209,0.16)_55%,transparent_75%)]',
        )}
      />
      <svg viewBox="0 0 190 190" className="absolute inset-0 h-full w-full -rotate-90">
        <circle className="fill-none stroke-neutral-100" strokeWidth={12} cx="95" cy="95" r={R} />
        <circle
          ref={progressRef}
          className={cn('fill-none', isComplete ? 'stroke-success' : 'stroke-brand')}
          strokeWidth={12}
          strokeLinecap="round"
          cx="95"
          cy="95"
          r={R}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <div className="relative flex flex-col items-center gap-0.5 text-center">
        <span className="text-2xs font-bold uppercase tracking-wide text-muted-text">{eyebrow}</span>
        <span className={cn('text-[1.75rem] font-bold leading-tight tracking-tight tabular-nums', isComplete ? 'text-success' : 'text-neutral-900')}>
          {elapsedMin === null ? '--:--' : formatMinutes(elapsedMin)}
        </span>
        <span className="text-sm font-medium text-neutral-600">{caption}</span>
      </div>
    </motion.div>
  );
}
