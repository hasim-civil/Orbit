import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { registerSW } from 'virtual:pwa-register'

// registerType: 'autoUpdate' (see vite.config.ts) means a new service worker
// activates and takes over automatically on the next load — no "update
// available" prompt needed for an app this size. This call just performs
// the registration itself; onRegisterError surfaces a real failure to the
// console instead of silently leaving the app without offline support.
registerSW({
  onRegisterError(error) {
    console.error('Service worker registration failed:', error);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
