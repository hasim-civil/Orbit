import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarCheck, CalendarDays, BarChart3, User } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck, end: false },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/reports', label: 'Reports', icon: BarChart3, end: false },
  { to: '/profile', label: 'Profile', icon: User, end: false },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[250] h-16 border-t border-neutral-200 bg-neutral-0/86 backdrop-blur-xl [padding-bottom:env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex h-full max-w-2xl">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center justify-center gap-0.5 text-2xs font-medium transition-colors ${
                isActive ? 'text-brand font-bold' : 'text-muted-text'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 h-0.5 w-10 rounded-full bg-brand"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.span
                  animate={isActive ? { y: -2, scale: 1.08 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <Icon size={20} />
                </motion.span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
