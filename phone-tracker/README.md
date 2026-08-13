# Beacon — Find My Phone (web app)

A web app for locating a phone you own if it's lost or misplaced. Works on
both Android and iOS through the browser — no app store, no install.

**How it works:**
1. Sign in on your main device (or a laptop) and add a device.
2. Generate a tracking link for that device.
3. Open the link on the phone you want to be able to locate. Leave the tab
   open, or "Add to Home Screen" to keep it handy.
4. While that page is open, it reports the phone's GPS location. View it live
   on the dashboard's map.

## Important limitation — read this first

Browsers only report location while the page is **open and active**. There
is no way for a plain web page to report location after the tab is closed or
the phone is locked, on either Android or iOS. This app is good for:

- "Share my live location for the next hour"
- Keeping a browser tab open on a device you want to be able to find
- Periodic check-ins when the page is reopened

It will **not** silently track a phone that's been closed, locked in your
pocket for hours, or stolen and closed by someone else. A true always-on
tracker requires a native app with background permissions (and even then,
iOS restricts this heavily). If you need that, this project is a good
starting point but you'd eventually want a native companion app.

## Stack

- React + Vite
- Firebase Auth (email/password) + Firestore (device + location storage)
- Leaflet + OpenStreetMap/CartoDB tiles (no Google Maps API key needed)
- PWA-enabled (installable to home screen)

## Setup

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → Create a project.
2. Add a Web app (</> icon) — copy the config values it shows you.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Enable **Firestore Database** (start in production mode).
5. Deploy the security rules in this repo (see below) — the default
   production rules lock everything down, which will break the app until
   the custom rules are deployed.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in the six `VITE_FIREBASE_*` values from your Firebase web app config.

### 3. Install and run locally

```bash
npm install
npm run dev
```

Visit the printed local URL. Note: browsers only allow geolocation on
`localhost` or `https://` — it will not work over plain `http://` on a real
device, so for testing on your phone you'll need to deploy (below) or use a
tool like `ngrok` to get an HTTPS tunnel.

### 4. Deploy Firestore rules and hosting (optional but recommended)

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # pick your project
npm run build
firebase deploy
```

This deploys both the security rules (`firestore.rules`) and the built app
to Firebase Hosting, giving you a real `https://` URL you can open on any
phone.

## Security model

- Only the signed-in owner can see their device list and location history.
- The tracked-device page (`/b/:token`) doesn't require login — it uses a
  random 24-character share token that maps to one device. Anyone who has
  the exact link can report location for that device, so treat the link
  like a password: don't post it publicly, and regenerate a device's link
  if you think it leaked (currently done by creating a new device — see
  "Next steps" below for adding link revocation).
- Firestore rules restrict anonymous writes to only the two location fields
  on a device, and only with valid latitude/longitude — an anonymous
  visitor can't read data, delete devices, or write arbitrary fields.

## Project structure

```
src/
  lib/
    firebase.js       Firebase app/auth/db initialization
    devices.js         Firestore reads/writes for devices + location pings
    shareLinks.js       Share-link token creation/resolution
    AuthContext.jsx     React auth state provider
  components/
    LiveMap.jsx         Leaflet map showing a device's last known location
  pages/
    Login.jsx           Sign in / sign up
    Dashboard.jsx        Device list + live map (the owner's view)
    Beacon.jsx            The page opened on the tracked phone
firestore.rules        Firestore security rules
firebase.json           Firebase Hosting + rules config
```

## Next steps / ideas

- Add link revocation (delete a `shareLinks/{token}` doc to invalidate it).
- Show location history as a trail on the map, not just the latest point.
- Push notifications when a device goes stale (hasn't reported in X minutes).
- A native companion app (React Native/Flutter) for true background
  tracking, using this same Firestore backend.
