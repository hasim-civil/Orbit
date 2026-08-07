import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import './StatCard.css';

export interface StatCardProps {
  icon: ReactNode;
  iconClass: 'blue' | 'purple' | 'orange' | 'red' | 'teal';
  value: string;
  label: string;
  index: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24, delay: 0.05 * i },
  }),
};

export function StatCard({ icon, iconClass, value, label, index }: StatCardProps) {
  return (
    <motion.div
      className="stat-card"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 18 } }}
      whileTap={{ scale: 0.97 }}
    >
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </motion.div>
  );
}
