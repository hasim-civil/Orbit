# Orbit Time — Smart Attendance

A premium, mobile-first attendance, leave, and holiday tracking application. Employees check in/out, view their attendance history and reports, and request leave; admins get an organization-wide dashboard, user management, and holiday management. Installable as a PWA, with Light, Dark, and Glass themes.

Built with React 19, TypeScript, Vite, and Firebase.

## Features

**Employee**
- Check In / Check Out with live shift timer
- Attendance timeline and searchable monthly history
- Calendar view with color-coded day status
- Reports — attendance percentage, working-hours trend, status breakdown charts
- Leave requests (single day or date range) — approved immediately, no approval workflow
- Company holiday calendar
- Profile — theme (Light/Dark/Glass), reduced-motion, and notification-reminder settings

**Admin**
- Organization-wide "Today's Overview" (present/late/absent/on-leave/holiday counts)
- Searchable employee directory with live status
- Per-employee attendance history and role management
- Holiday management (add/edit/delete)

**Platform**
- Installable PWA with offline support for the app shell
- Zero-config Firebase Auth session persistence
- Real Firestore security rules — every admin/ownership check is enforced server-side, not just hidden in the UI

## Technology Stack

| Layer | Choice |
|---|---|
| Build tool | Vite 8 |
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | React Router 7 |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 |
| Backend | Firebase (Authentication + Firestore) |
| Animation | GSAP + Framer Motion |
| Charts | Recharts |
| PWA | vite-plugin-pwa (Workbox) |

## Requirements

- Node.js 20 or newer (Node 22 recommended)
- npm 10 or newer
- An existing Firebase project with **Authentication** (Email/Password) and **Firestore** enabled

This app connects to your **existing** Firebase project — it does not create one.

## Installation

```bash
npm install
```

## Environment Variables

Firebase configuration is read from environment variables, never hardcoded.

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and fill in your Firebase project's web config values (Firebase Console → Project Settings → General → Your apps → SDK setup and configuration):
   ```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   VITE_FIREBASE_MEASUREMENT_ID=
   ```
   `VITE_FIREBASE_MEASUREMENT_ID` is optional — leave it blank to disable Analytics entirely.

**`.env.local` must never be committed or uploaded to GitHub.** It is already listed in `.gitignore`. `.env.example` in this repository contains only empty placeholder variable names — no real values.

## Development

```bash
npm run dev
```

Starts the Vite dev server (default: http://localhost:5173).

## Production Build

```bash
npm run build
```

Runs the TypeScript compiler followed by the Vite production build. Output goes to `dist/`. This also generates the PWA service worker (`dist/sw.js`) and precaches the app shell.

## Preview the Production Build

```bash
npm run preview
```

Serves the built `dist/` folder locally so you can verify the production build before deploying.

## Other Scripts

```bash
npm run lint          # ESLint, zero warnings required
npm run lint:fix       # ESLint with autofix
npm run format         # Prettier — write
npm run format:check   # Prettier — check only
```

## Firebase Setup

This project uses your existing Firebase project's Authentication and Firestore. No new Firebase project should be created for it.

### Firestore Security Rules

`firestore.rules` in this repository is the actual, current rule set this app was built and tested against. Deploy it via the **Firebase Console → Firestore Database → Rules** tab (paste and publish), or with the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

The rules enforce, server-side:
- Users can only read/write their own attendance and leave records
- Only admins (role stored on the user's own document) can write holidays or change another user's role
- No client-side check in the app is the real security boundary — the rules are

### Data Model (for reference)

- `users/{uid}` — profile + role (`admin` | `employee`)
- `attendance/{uid}/records/{date}` — one document per day
- `paidLeaves/{uid}/records/{date}` — one document per leave day (a multi-day request creates one document per date)
- `holidays/{date}` — shared across all users, admin-managed

## PWA / Installability

The app ships a web manifest (`public/manifest.json`) and a generated service worker. The service worker precaches the app shell (JS/CSS/HTML/icons) for offline use and **never caches Firestore/Firebase network traffic** — attendance data is always fetched live when online, and the app shows a clear "You're offline" indicator when it isn't.

To test installability, run a production build and serve it over HTTPS (or `localhost`), then use your browser's "Install app" prompt.

## Deployment

This is a static single-page app after `npm run build` — the `dist/` folder can be deployed to any static host that supports SPA routing (Firebase Hosting, Vercel, Netlify, Cloudflare Pages, etc.).

If deploying to Firebase Hosting, make sure your hosting rewrite rules serve `index.html` for all routes (client-side routing), and remember to set the same `VITE_*` environment variables in your hosting provider's build environment — the production build needs them at build time.

Deploying is not part of this package — you control when and where this ships.

## Security Notes

- Firebase's client-side `apiKey` and related config values are not secrets — they are safe to ship in a public bundle (this is standard for Firebase web apps). The real access boundary is `firestore.rules`, enforced by Firebase's servers, not anything in this codebase.
- Never commit `.env.local`, a Firebase service-account JSON, or any private key to this repository.
- If you ever need server-side Firebase Admin access (e.g. to send push notifications via FCM), that requires a separate backend with its own credential — never put a service-account key in this frontend project.

## Project Structure

```
src/
  pages/         Route-level screens
  components/    Shared UI building blocks
  services/      The only files that call Firestore/Auth directly
  hooks/         TanStack Query wrappers around services/
  store/         Zustand stores (auth session, user settings)
  lib/           Pure business logic (status resolution, date math, analytics)
  layouts/       App shell layout, route guards
  types/         Shared TypeScript interfaces
```
