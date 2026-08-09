import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

const THEME_COLORS: Record<string, string> = {
  light: '#FFFFFF',
  dark: '#101019',
  glass: '#120B2E',
};

/** Mount once at the app root. Keeps <html data-theme>, <html data-motion>,
 * and the theme-color meta tag in sync with persisted preferences — the
 * React equivalent of ui.js's Theme.set() / motion toggle. */
export function useThemeSync() {
  const theme = useSettingsStore((s) => s.theme);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme] ?? THEME_COLORS.light);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-motion', reducedMotion ? 'off' : 'on');
  }, [reducedMotion]);
}
