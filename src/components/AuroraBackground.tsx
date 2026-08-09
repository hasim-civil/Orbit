import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './AuroraBackground.css';

/**
 * Full-bleed animated aurora, driven entirely by a GSAP timeline (no CSS
 * @keyframes). Four blobs drift on independent, overlapping loops so the
 * wash never repeats in an obviously cyclical way and never fully stops.
 */
export function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const blobs = blobRefs.current.filter(Boolean) as HTMLDivElement[];
    if (blobs.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const manuallyReduced = document.documentElement.getAttribute('data-motion') === 'off';
    if (prefersReducedMotion || manuallyReduced) return;

    const ctx = gsap.context(() => {
      blobs.forEach((blob, i) => {
        // Each blob gets its own infinite, yoyo-ing timeline with a
        // distinct duration/path so the four never fall into lockstep.
        const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } });
        const dx = 6 + i * 2.5; // vw
        const dy = 7 + i * 2;   // vh
        const scaleTo = 1.12 + i * 0.03;
        const duration = 9 + i * 2.5;

        tl.to(blob, {
          xPercent: dx,
          yPercent: -dy,
          scale: scaleTo,
          duration,
        }).to(blob, {
          xPercent: -dx * 0.8,
          yPercent: dy * 0.9,
          scale: 1,
          duration: duration * 1.15,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="aurora-bg" aria-hidden="true">
      <div ref={(el) => { blobRefs.current[0] = el; }} className="aurora-blob aurora-blob--violet" />
      <div ref={(el) => { blobRefs.current[1] = el; }} className="aurora-blob aurora-blob--teal" />
      <div ref={(el) => { blobRefs.current[2] = el; }} className="aurora-blob aurora-blob--lavender" />
      <div ref={(el) => { blobRefs.current[3] = el; }} className="aurora-blob aurora-blob--cyan" />
    </div>
  );
}
