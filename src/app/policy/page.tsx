import { cancellationPolicy } from "@/lib/types";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export async function generateMetadata() {
  const locale = getLocale();
  return { title: t(locale).policy_title + " | VOCK" };
}

export default async function PolicyPage() {
  const settings = await getSettings();
  const locale = getLocale();
  const s = t(locale);
  const isAr = locale === "ar";

  return (
    <section className="mx-auto max-w-2xl px-5 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-orange-500">VOCK</p>
      <h1 className="mt-2 font-black tracking-tight text-3xl text-neutral-50">{s.policy_title}</h1>
      <p className="mt-2 text-xs text-neutral-500">{isAr ? "آخر تحديث: يوليو 2026" : "Last updated: July 2026"}</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-300">
        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">{isAr ? "البيانات اللي بناخدها منك" : "What data we collect"}</h2>
          <p>
            {isAr
              ? "وقت ما تعمل حجز، بناخد الاسم بالكامل، رقم الموبايل، والإيميل، وصورة إثبات تحويل الديبوزيت، وأي ملاحظات تكتبها اختياريًا عن الجلسة. البيانات دي بتتستخدم بس عشان نأكد الحجز ونتواصل معاك بخصوصه."
              : "When you make a booking, we collect your full name, phone number, email, a proof-of-transfer screenshot, and any optional notes about the session. This data is used only to confirm your booking and contact you about it."}
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">{isAr ? "إزاي بنحافظ على بياناتك" : "How we protect your data"}</h2>
          <p>
            {isAr
              ? "بياناتك متخزنة في قاعدة بيانات خاصة بينا، ومش بنبيعها ولا بنشاركها مع أي جهة تالتة لأغراض تسويقية. بيوصلها بس فريق VOCK المسؤول عن الحجوزات."
              : "Your data is stored in our private database. We don't sell or share it with third parties for marketing. Only the VOCK team responsible for bookings can access it."}
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">{isAr ? "الديبوزيت والدفع" : "Deposit & payment"}</h2>
          <p>
            {isAr
              ? "تأكيد الحجز بيتطلب دفع ديبوزيت عن طريق تحويل فودافون كاش أو InstaPay، مع إرفاق صورة إثبات التحويل. الديبوزيت بيتراجع من فريقنا يدويًا وبيتأكد الحجز بعد التأكد من وصول التحويل."
              : "Confirming a booking requires a deposit via Vodafone Cash or InstaPay transfer, with a proof-of-transfer screenshot. Our team reviews the transfer manually and confirms the booking once verified."}
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">{isAr ? "سياسة الإلغاء والاسترداد" : "Cancellation & refund policy"}</h2>
          <p>{cancellationPolicy(locale)}</p>
        </div>
        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">{isAr ? "تواصل معنا" : "Contact us"}</h2>
          <p>
            {isAr ? "لو عندك أي سؤال عن البيانات بتاعتك أو الحجز، تواصل معنا على واتساب" : "If you have any questions about your data or booking, reach us on WhatsApp"}{" "}
            <span dir="ltr" className="text-orange-400">{settings.whatsappNumber}</span>
            {isAr ? "، أو زورنا في " : ", or visit us at "}
            {settings.address}.
          </p>
        </div>
      </div>
    </section>
  );
}
