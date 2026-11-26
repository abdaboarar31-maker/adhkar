1) ارفع مجلد adhkar كاملًا داخل مشروع موقعك (بجانب index.html) ثم انشره.
2) من داخل مجلد worker:
   npx web-push generate-vapid-keys        (انسخ المفتاحين)
   npx wrangler kv namespace create SUBS   (انسخ id إلى wrangler.toml)
   npx wrangler secret put VAPID_PUBLIC    (الصق المفتاح العام)
   npx wrangler secret put VAPID_PRIVATE   (الصق المفتاح الخاص)
   npx wrangler deploy                     (انسخ عنوان الـ Worker)
3) في app.js: ضع عنوان الـ Worker في W والمفتاح العام في V، ثم أعد النشر.
4) افتح البرنامج على التلفون، أضفه للشاشة الرئيسية، افتحه من الأيقونة، واضغط «تفعيل الإشعارات».
