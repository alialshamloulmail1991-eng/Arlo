KRONO V3 — إصلاحات وتحسينات

تم تحديث النسخة الأساسية KRONO V2.0 Simplified لتشمل:
1. واجهة أكثر استجابة للموبايل ومقاسات مختلفة.
2. صورة ملف شخصي وصورة غلاف مع رفع إلى Firebase Storage.
3. عرض تاريخ الميلاد في الملف الشخصي.
4. البريد الإلكتروني مخفي افتراضيًا مع إعداد لإظهاره.
5. رقم الهاتف في التسجيل أصبح اختياريًا.
6. صفحة الرسائل تعرض الأشخاص ويمكن فتح المحادثة في شاشة محادثة كاملة على الموبايل.
7. أزرار مكالمة فيديو/صوت في واجهة المحادثة (واجهة جاهزة، وربط WebRTC يحتاج خدمة signaling لاحقًا).
8. إزالة زر التفاعل المكرر من المنشورات والإبقاء على تفاعل واحد.
9. أسماء مشاهدي الفيديو/الإحصاءات لا تتحول إلى روابط من شاشة الفيديو.
10. تحسين زر الرجوع والتنقل الداخلي للموبايل باستخدام history.
11. تحسين رفع صور/فيديوهات القصص مع الحفاظ على معاينة ونشر الوسائط.
12. إضافة خيار طلب إذن إشعارات الجهاز.

ملاحظة: إشعارات FCM الحقيقية والمكالمات WebRTC الحقيقية تحتاج إعداد Firebase Cloud Messaging وWebRTC/signaling بشكل منفصل؛ هذه النسخة لا تدّعي أنها نفذتهما بالكامل.

KRONO V3.1 — Account deletion sync
- If the user document is deleted from Firestore, the app detects it immediately and signs the user out.
- If the Firebase Authentication account is deleted, onAuthStateChanged signs the user out automatically.
- Added a self-delete account flow using Firebase Authentication deleteUser; recent login may be required by Firebase security.
- Full deletion of related collections/files requires Firebase Admin SDK/Cloud Functions and is not performed by the client.
