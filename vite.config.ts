import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // We already hand-wrote public/manifest.json and link it directly in
      // index.html (name, icons, theme colors, etc. — all verified correct
      // in the Phase 3 audit). 'injectManifest' would be overkill for an
      // app this size; 'generateSW' with manifest injection disabled lets
      // us keep our own manifest.json as the single source of truth while
      // the plugin only handles service-worker generation/registration.
      manifest: false,
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      workbox: {
        // App shell + static assets: safe to precache and serve cache-first,
        // since Vite fingerprints every filename by content hash — a stale
        // cached asset simply can't exist under an old, still-referenced URL.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Never let the service worker intercept or cache Firebase/Firestore
        // traffic. Those requests must always hit the network directly so
        // attendance data is never served stale from a cache — TanStack
        // Query already owns caching for that data, correctly, in memory.
        navigateFallbackDenylist: [/^\/__/, /firestore\.googleapis\.com/, /googleapis\.com/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname.includes('firestore.googleapis.com') ||
              url.hostname.includes('googleapis.com') ||
              url.hostname.includes('identitytoolkit.googleapis.com'),
            handler: 'NetworkOnly',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Function form required by this Vite/Rollup version's types (the
        // object-literal shorthand isn't accepted). Vendor code changes far
        // less often than app code, so splitting it out lets browsers cache
        // it across deploys instead of re-downloading it every release.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // firebase/analytics is intentionally excluded here — it's only
          // ever reached via a dynamic import() in lib/analytics.ts, and
          // forcing it into vendor-firebase would pull the whole Analytics
          // SDK into every user's initial load even when analytics is
          // disabled (no measurementId configured). Leaving it out lets
          // Rollup give it its own on-demand chunk instead (confirmed via
          // build output: it lands in its own ~10KB chunk, separate from
          // the ~543KB vendor-firebase chunk everyone downloads upfront).
          if (id.includes('firebase') && !id.includes('firebase/analytics') && !id.includes('@firebase/analytics')) {
            return 'vendor-firebase';
          }
          if (id.includes('framer-motion') || id.includes('gsap')) return 'vendor-motion';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          return undefined;
        },
      },
    },
  },
})
