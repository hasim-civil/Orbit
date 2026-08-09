import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer: ReactNode | null;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Focus management: remember what had focus before opening, move focus
  // into the dialog on open, trap Tab within it while open, restore focus
  // to the trigger on close. Escape closes the dialog from anywhere inside it.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Focus the first focusable element inside the dialog once it's mounted
    // (a microtask delay lets the entrance animation's initial render land
    // first, so focus doesn't fight the transform-in).
    const focusTimer = window.setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? dialogRef.current)?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null, // skip hidden elements
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown, true);
      // Restore focus to whatever triggered the modal, so a keyboard user
      // lands back where they were instead of at the top of the page.
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[400] flex items-end justify-center bg-neutral-900/42"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            ref={dialogRef}
            className="flex max-h-[92dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] bg-neutral-0/94 shadow-[0_-8px_40px_rgba(23,23,38,0.18)] backdrop-blur-xl [padding-bottom:env(safe-area-inset-bottom,0px)] focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4.5">
              <h3 id={titleId} className="m-0 text-md font-bold text-neutral-900">{title}</h3>
              <button
                type="button"
                className="cursor-pointer border-none bg-transparent px-2 py-1 text-2xl leading-none text-muted-text"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto p-5">{children}</div>
            {footer && (
              <div className="flex gap-3 border-t border-neutral-100 px-5 py-4 [&>*]:flex-1">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
