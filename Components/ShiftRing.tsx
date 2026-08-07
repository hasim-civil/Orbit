import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';
import type { AttendanceRecord } from '../types/attendance';
import './ShiftRing.css';

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
      className={`shift-ring ${isRunning ? 'is-running' : ''} ${isComplete ? 'is-complete' : ''}`}
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
      <div ref={glowRef} className="shift-ring__glow" />
      <svg viewBox="0 0 190 190" aria-hidden="true">
        <circle className="shift-ring__track" cx="95" cy="95" r={R} />
        <circle
          ref={progressRef}
          className="shift-ring__progress"
          cx="95"
          cy="95"
          r={R}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <div className="shift-ring__center">
        <span className="ring-eyebrow">{eyebrow}</span>
        <span className="ring-elapsed">{elapsedMin === null ? '--:--' : formatMinutes(elapsedMin)}</span>
        <span className="ring-caption">{caption}</span>
      </div>
    </motion.div>
  );
}
