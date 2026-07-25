import { CANCELLATION_POLICY } from "@/lib/types";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "سياسة الخصوصية والشروط | VOCK" };

export default async function PolicyPage() {
  const settings = await getSettings();

  return (
    <section className="mx-auto max-w-2xl px-5 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-orange-500">VOCK</p>
      <h1 className="mt-2 font-black tracking-tight text-3xl text-neutral-50">
        سياسة الخصوصية وشروط الاستخدام
      </h1>
      <p className="mt-2 text-xs text-neutral-500">آخر تحديث: يوليو 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-300">
        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">البيانات اللي بناخدها منك</h2>
          <p>
            وقت ما تعمل حجز، بناخد الاسم بالكامل، رقم الموبايل، والإيميل، وصورة إثبات تحويل
            الديبوزيت، وأي ملاحظات تكتبها اختياريًا عن الجلسة. البيانات دي بتتستخدم بس عشان نأكد
            الحجز ونتواصل معاك بخصوصه (تأكيد، تذكير بالميعاد، أو أي تغيير يخص جلستك).
          </p>
        </div>

        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">إزاي بنحافظ على بياناتك</h2>
          <p>
            بياناتك متخزنة في قاعدة بيانات خاصة بينا، ومش بنبيعها ولا بنشاركها مع أي جهة تالتة
            لأغراض تسويقية. بيوصلها بس فريق VOCK المسؤول عن الحجوزات.
          </p>
        </div>

        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">الديبوزيت والدفع</h2>
          <p>
            تأكيد الحجز بيتطلب دفع ديبوزيت عن طريق تحويل فودافون كاش أو InstaPay، مع إرفاق صورة
            إثبات التحويل. الديبوزيت بيتراجع من فريقنا يدويًا وبيتأكد الحجز بعد التأكد من وصول
            التحويل.
          </p>
        </div>

        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">سياسة الإلغاء والاسترداد</h2>
          <p>{CANCELLATION_POLICY}</p>
        </div>

        <div>
          <h2 className="mb-2 font-semibold text-neutral-50">تواصل معنا</h2>
          <p>
            لو عندك أي سؤال عن البيانات بتاعتك أو الحجز، تواصل معنا على واتساب{" "}
            <span dir="ltr" className="text-orange-400">{settings.whatsappNumber}</span>، أو زورنا في{" "}
            {settings.address}.
          </p>
        </div>
      </div>
    </section>
  );
}
