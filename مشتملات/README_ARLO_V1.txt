ARLO V1 — social platform prototype

Brand update:
- App name: Arlo
- Dark brown + gold visual identity
- Arlo logo asset: arlo-logo-reference.png
- Stories appear above posts on the home feed
- Publishing is opened from the center + button in the bottom navigation
- Bottom profile navigation item uses the user's profile image when available
- Outline icon system with gold active/hover states
- Long-press on Like opens the reaction picker
- Existing Firebase/Auth/Firestore/Storage prototype preserved

Important:
This ZIP is a UI/prototype build. Firebase credentials and backend services remain connected to the existing project configuration so existing test data is not silently moved or deleted.

Run locally:
1. Open this folder in VS Code.
2. Serve it with a local web server (for example Live Server).
3. Open the local URL in a browser.

For APK packaging later, use Capacitor from a project root containing package.json, then add/sync Android.


V1.1 UI FIX: unified reference-style outline icons for home, groups, messages, profile, like, comment, save, share, plus. Arlo logo visibility improved in splash/auth/header and favicon added.
