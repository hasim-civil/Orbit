import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import './SpringButton.css';

export interface SpringButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

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
      className={`spring-btn spring-btn--${variant} ${fullWidth ? 'spring-btn--full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
      whileTap={disabled ? undefined : { scale: 0.95, transition: { type: 'spring', stiffness: 500, damping: 20 } }}
    >
      {children}
    </motion.button>
  );
}
