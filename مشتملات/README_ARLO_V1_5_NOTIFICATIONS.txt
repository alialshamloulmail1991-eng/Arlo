ARLO V1.5 — MOBILE NOTIFICATIONS

Added:
- Incoming message notification watcher via Firestore chat listeners.
- Arlo notification icon in browser/device notification when permission is granted.
- Notification sound using Web Audio fallback.
- Mobile vibration using navigator.vibrate when supported.
- Notification setting respects the existing Arlo notifications toggle.
- In-app toast fallback when system Notification API is unavailable/permission is not granted.
- PWA manifest + basic service worker for installability/offline shell.

Important: true background push notifications when the app is fully closed require native Firebase Cloud Messaging/Capacitor push integration and platform credentials. This version prepares the UI and real-time foreground/background-while-running behavior without pretending that browser notifications are equivalent to FCM.
