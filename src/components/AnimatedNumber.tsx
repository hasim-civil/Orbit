import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  className,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    if (!ref.current) return;
    const reduced = document.documentElement.getAttribute('data-motion') === 'off';
    const obj = { val: reduced ? value : prevValue.current };

    const tween = gsap.to(obj, {
      val: value,
      duration: reduced ? 0 : 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = `${obj.val.toFixed(decimals)}${suffix}`;
      },
    });

    prevValue.current = value;
    return () => { tween.kill(); };
  }, [value, decimals, suffix]);

  return <span ref={ref} className={className}>{value.toFixed(decimals)}{suffix}</span>;
}
