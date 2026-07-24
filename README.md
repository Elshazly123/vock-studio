# VOCK — منصة حجز سيتات التصوير

موقع حجز أونلاين لاستوديو VOCK (مدينة نصر): عرض كل السيتات والباقات (بودكاست/ريلز)
مع نظام حجز كامل، دفع ديبوزيت عبر InstaPay بمراجعة يدوية، ولوحة تحكم فيها فريق
وصلاحيات حقيقية.

## التقنيات

- **Next.js 14** (App Router) + TypeScript
- **Prisma** — SQLite للتطوير، قابل للتبديل لـ Postgres في الإنتاج
- **Tailwind CSS** بهوية VOCK (أسود دافئ + Gradient برتقالي↔أحمر)
- **Server Actions** لكل العمليات (حجز، دفع، إدارة) بدل API routes تقليدية — كود أقل وأوضح
- **bcryptjs** لتشفير كلمات سر الفريق + جلسة موقّعة (HMAC) بكوكي httpOnly

## هيكل المشروع

```
prisma/schema.prisma     Set, PricingCategory, PricingTier, Booking, TeamMember
prisma/seed.ts           7 سيتات حقيقية + فئتين أسعار (بودكاست/ريلز) + حساب admin
public/images/sets/      صور السيتات الحقيقية (jpg)
src/lib/auth.ts          تشفير باسوردات + توقيع/فك جلسات الأدمن
src/lib/session.ts       قراءة جلسة الأدمن الحالية من الكوكي
src/lib/booking-actions.ts   إنشاء حجز، تأكيد تحويل الديبوزيت (Server Actions)
src/lib/admin-actions.ts    كل عمليات لوحة التحكم (محمية بالصلاحيات)
src/app/                 الصفحات (الرئيسية، السيتات، الحجز، لوحة التحكم)
src/components/          مكونات الواجهة (Gallery, PackagePicker, BookingWizard, AdminDashboard...)
```

## التشغيل محليًا

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

افتح `http://localhost:3000`. لوحة التحكم على `http://localhost:3000/admin/login`
بحساب `admin` / كلمة السر اللي حطيتها في `OWNER_PASSWORD` (افتراضيًا `admin123`).

> ملاحظة: الكود اتكتب يدويًا في بيئة بدون إنترنت، فمقدرش أشغّل `npm install`
> هنا للتأكد النهائي. جرّب الأوامر عندك؛ لو ظهر خطأ ابعتهولي وهصلحه فورًا.

## نظام الفريق والصلاحيات (حقيقي، مش شكلي)

- كلمات السر متشفّرة بـ bcrypt في قاعدة البيانات، مش نص عادي.
- جلسة الأدمن كوكي httpOnly موقّع بـ HMAC — أقوى من باسورد واحد بسيط، لكنه أبسط
  من نظام جلسات كامل (NextAuth). كافي لحجم الفريق الحالي؛ لو الفريق كبر واحتجت
  إلغاء جلسات فورًا أو تسجيل دخول بجوجل، الخطوة الجاية المنطقية هي NextAuth.
- كل عملية حساسة (تأكيد حجز، تعديل سعر، إضافة مدير) بتتفحص صلاحيتها **من السيرفر**
  (`requirePermission` في `admin-actions.ts`) مش بس بإخفاء الزرار في الواجهة.
- **مهم:** غيّر `SESSION_SECRET` و `OWNER_PASSWORD` في `.env` قبل أي نشر فعلي.

## تخزين صور السيتات

الصور الأساسية ملفات حقيقية في `public/images/sets/`. لما الأدمن يضيف صورة جديدة
من لوحة التحكم، بتتخزن كـ **data URL جوه عمود `images` في قاعدة البيانات** بدل
ملف على الديسك — قرار مقصود عشان يشتغل صح على استضافات serverless زي Vercel
(نظام الملفات فيها مؤقت وبيتصفر مع كل deploy). لو عدد الصور والحجم كبر مع الوقت،
الخطوة الطبيعية بعدين هي الانتقال لتخزين خارجي حقيقي (S3 / Cloudinary) بدل الداتابيز.

## الدفع: InstaPay يدوي دلوقتي

العميل بيشوف رقم InstaPay بعد الحجز، يحوّل الديبوزيت، ويضغط "حوّلت الديبوزيت".
الحجز يبقى "بانتظار المراجعة" لحد ما فريق الاستوديو (بصلاحية "متابعة الحجوزات")
يتأكد من التحويل ويضغط "تأكيد" من لوحة التحكم.

**للترقية لبوابة أوتوماتيكية (Paymob غالبًا الأنسب في مصر):**
1. افتح حساب تاجر مع Paymob واحصل على API Keys.
2. عدّل `src/lib/booking-actions.ts::markTransferSent` (أو أضف فعل جديد) لإنشاء
   Payment Intention والرجوع برابط/iframe الدفع بدل التعليمات النصية.
3. أضف Webhook route (`src/app/api/webhooks/paymob/route.ts`) يستقبل تأكيد
   الدفع الفعلي من Paymob ويحدّث حالة الحجز — مش الفرونت إند.

## رفع المشروع على GitHub والنشر

```bash
cd studio-booking
git init && git add . && git commit -m "VOCK: الإصدار الأول"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

للنشر على [Vercel](https://vercel.com):
1. **New Project** من الريبو.
2. اعمل قاعدة بيانات Postgres حقيقية ([Neon](https://neon.tech) مجاني للبداية)
   وغيّر `provider` في `prisma/schema.prisma` من `sqlite` لـ `postgresql`.
3. في Environment Variables ضيف: `DATABASE_URL`, `SESSION_SECRET` (قوي وعشوائي!),
   `OWNER_PASSWORD`.
4. بعد أول Deploy شغّل مرة واحدة: `npx prisma db push` ثم `npx tsx prisma/seed.ts`.

## سياسة الإلغاء (ظاهرة للعميل في الموقع)

> لو حبيت تلغي أو تأجل الحجز قبل الميعاد بـ 24 ساعة أو أكتر، بنرجعلك الديبوزيت
> كامل. الإلغاء في أقل من 24 ساعة من الميعاد، الديبوزيت مش قابل للاسترداد.

النص ده موجود في `src/lib/types.ts::CANCELLATION_POLICY` — غيّره من مكان واحد
وهيتحدث في كل الموقع.

## اللي لسه ناقص عمدًا

- **آراء العملاء**: مفيش آراء حقيقية اتضافت لحد دلوقتي عشان محدش يحس إنها مصطنعة.
  أول ما تجهز آراء حقيقية من عملاء (انستجرام/جوجل)، ابعتها وهتتضاف كقسم منفصل.
- **فئة الفوتوغرافي**: هتتضاف لما تجهز البرايس ليست بتاعتها بنفس شكل بودكاست/ريلز.
- **إشعارات واتساب/SMS أوتوماتيكية**: دلوقتي التواصل عن الحجز يدوي بالكامل.
  الخطوة الجاية المقترحة.
