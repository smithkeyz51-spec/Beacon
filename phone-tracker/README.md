# Beacon — Find My Phone (web app)

A web app for locating a phone you own if it's lost or misplaced. Works on
both Android and iOS through the browser — no app store, no install.

## Important limitation

Browsers only report location while the page is **open and active**. There's
no way for a plain web page to report location after the tab is closed or
the phone is locked. Good for "share my live location," not for a silent
always-on tracker after the phone's closed — that needs a native app.

## Setup

### 1. Firebase project
1. [console.firebase.google.com](https://console.firebase.google.com) → Create project → Add Web app, copy config.
2. Enable **Authentication → Email/Password**.
3. Enable **Firestore Database**.
4. Deploy `firestore.rules` (see below) — without it, the default rules block everything.

### 2. Environment variables
```bash
cp .env.example .env
```
Fill in the six `VITE_FIREBASE_*` values.

### 3. Run locally
```bash
npm install
npm run dev
```

### 4. Deploy

**Vercel:** connect the GitHub repo, then in Project Settings → Environment
Variables add all six `VITE_FIREBASE_*` keys (must be added to Vercel
directly — your local `.env` is gitignored and never gets pushed). The
included `vercel.json` handles SPA routing so client-side routes like
`/b/:token` don't 404 or blank out on load/refresh.

**Firebase Hosting (alternative):**
```bash
npm install -g firebase-tools
firebase login
firebase use --add
npm run build
firebase deploy
```

## Troubleshooting a blank screen

This app fails loudly instead of silently — if you see a blank dark page
with no error text at all, it usually means:

1. **Env vars not applied yet.** In Vercel, adding/changing environment
   variables requires a **redeploy** (Deployments tab → ⋯ → Redeploy) —
   they don't retroactively apply to an existing build.
2. **Wrong env var scope.** Make sure the variables are added for the
   **Production** environment (or whichever one you're viewing), not just
   Preview/Development.
3. **Hard refresh on a route.** If you loaded `/` fine but a direct link
   to `/b/xyz` is blank, that's the SPA-rewrite issue `vercel.json` fixes —
   redeploy after adding it if you didn't have it before.

If you see red monospace error text instead of a truly blank screen, that
text tells you exactly what's missing (e.g. which Firebase key).

## Security model

- Only the signed-in owner can see their device list and location history.
- The tracked-device page (`/b/:token`) doesn't require login — a random
  24-character share token maps to one device. Treat the link like a
  password.
- Firestore rules restrict anonymous writes to only valid lat/lng on the
  two location fields — no reads, no deletes, no arbitrary fields.

## Project structure

```
src/
  lib/           firebase.js, devices.js, shareLinks.js, AuthContext.jsx
  components/    LiveMap.jsx
  pages/         Login.jsx, Dashboard.jsx, Beacon.jsx
  ErrorBoundary.jsx
firestore.rules
firebase.json
vercel.json
```

## Next steps

- Link revocation
- Location history trail on the map
- Push notifications when a device goes stale
- Native companion app for true background tracking
