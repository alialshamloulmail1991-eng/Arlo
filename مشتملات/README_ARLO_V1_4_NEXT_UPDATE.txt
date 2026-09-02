ARLO V1.4 — NEXT UPDATE
========================
Base: ARLO V1.3.8 CALL / VIDEO / SETTINGS FIXED

Included saved updates:
- Arlo dark brown + gold brand identity retained.
- Arlo logo kept visible across splash/auth/header/app branding.
- Desktop and mobile use the same features/data/identity; only layout adapts.
- Messaging desktop keeps conversation list visible and uses the wide screen.
- Messaging controls remain visible: voice call, video call, emoji, attachments, mic, send.
- Posts/stories/profile/communities/channels/AI retained.
- Verification badge purchase UI retained.
- Forgot password flow added using Firebase email reset link.
- Account type selection added: Personal, Business, Gaming, Creator.
- Birth date remains part of registration and is used for age-aware content.
- Post composer now supports General / 18+ age rating.
- 18+ posts are hidden from accounts whose registered age is under 18.
- Upload progress and prior messaging/icon fixes retained.

NOTE:
Phone-number password recovery requires Firebase Phone Authentication or a secure backend OTP flow.
This client-only build uses Firebase's secure email password-reset flow and does not expose account ownership data.

All changes are additive and preserve the existing project files.
