ARLO V1.2 — FINAL FIX PACKAGE

What was fixed/added:
- Reworked post action icons to a clean outline/line style matching the Arlo reference: Like, Comment, Save, Share.
- Reworked bottom navigation icons: Home, Groups, Create (+), Messages, Profile.
- Kept the Arlo gold A logo visible in splash/auth/header/favicon and profile navigation uses the real user avatar when available.
- Stories remain above posts; posts remain below stories; the bottom + button is the post/story creation entry point.
- Post editor now supports text, background color, text color, font choice, image/video, and optional music.
- Post media and music display with proper controls after successful upload.
- Upload UI now shows a real progress bar and has a 120-second timeout instead of silently staying at 0% forever.
- Image optimization now has a timeout and safely releases object URLs.
- Voice messages were added to 1-to-1 chats using the device microphone and Firebase Storage.
- AI Arlo screen remains available.
- Communities/channels, stories, reactions, comments, saves, reports, profile/cover media, notifications, data saver, dark/light theme, etc. remain in the package.

IMPORTANT FOR THE 0% UPLOAD ISSUE:
If the browser console shows ERR_BLOCKED_BY_CLIENT, that is usually a browser extension/privacy/ad blocker blocking Firebase. Disable the blocker for the local app page and reload.
If upload still fails, check Firebase Storage Rules and make sure Storage is enabled in the Firebase project.

APK build (from the project root):
1) npm install
2) npx cap sync android
3) npx cap open android
Then build the APK from Android Studio.

This package is an application prototype; WebRTC video/voice calls and a production AI backend still require their respective service integrations.
