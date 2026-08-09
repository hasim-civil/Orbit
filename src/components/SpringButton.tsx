import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SpringButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

const variantClasses: Record<NonNullable<SpringButtonProps['variant']>, string> = {
  primary: 'bg-brand text-white shadow-[0_8px_22px_rgba(107,78,255,0.26)]',
  success: 'bg-success text-white shadow-[0_8px_22px_rgba(18,161,80,0.24)]',
  danger: 'bg-danger/55 text-white shadow-[0_8px_22px_rgba(229,72,77,0.18)]',
  secondary: 'bg-neutral-50 text-neutral-900 border border-neutral-200',
};

/** Spring-physics button: hover/press motion comes entirely from Framer
 * Motion's whileHover/whileTap, never from a CSS transition, so it stays
 * physically responsive rather than easing on a timer. */
export function SpringButton({
  children,
  onClick,
  variant = 'primary',
  disabled,
  fullWidth,
  className = '',
  type = 'button',
}: SpringButtonProps) {
  return (
    <motion.button
      type={type}
      className={cn(
        'inline-flex min-h-13 items-center justify-center gap-2 rounded-[var(--radius-md)] px-6 py-3.5 text-base font-bold tracking-tight disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale-[0.5]',
        variantClasses[variant],
        fullWidth && 'w-full',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
      whileTap={disabled ? undefined : { scale: 0.95, transition: { type: 'spring', stiffness: 500, damping: 20 } }}
    >
      {children}
    </motion.button>
  );
}
