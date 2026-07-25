"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PackagePicker, { type SelectedPackage } from "./PackagePicker";
import { createBooking, getAvailableSlots, type SlotStatus } from "@/lib/booking-actions";
import { CANCELLATION_POLICY, hoursLabel, type PricingCategoryData } from "@/lib/types";

type Step = 1 | 2 | 3;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookingWizard({
  setId,
  setName,
  categories,
  preselected,
}: {
  setId: string;
  setName: string;
  categories: PricingCategoryData[];
  preselected?: { categoryId: string; hours: number };
}) {
  const router = useRouter();

  const initialPackage = (() => {
    if (!preselected) return null;
    const cat = categories.find((c) => c.id === preselected.categoryId);
    const tier = cat?.tiers.find((t) => t.hours === preselected.hours);
    if (!cat || !tier) return null;
    return {
      categoryId: cat.id,
      categoryLabel: cat.label,
      hours: tier.hours,
      price: tier.price,
      original: tier.original,
      deposit: Math.round((tier.price * 0.2) / 50) * 50,
      name: cat.label + " · " + tier.hours + " " + hoursLabel(tier.hours),
    };
  })();

  const [step, setStep] = useState<Step>(initialPackage ? 2 : 1);
  const [pkg, setPkg] = useState<SelectedPackage | null>(initialPackage);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<SlotStatus[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (step !== 2) return;
    let cancelled = false;
    setLoadingSlots(true);
    setTime(null);
    getAvailableSlots(setId, date)
      .then((slots) => {
        if (!cancelled) setAvailableSlots(slots);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, step, setId]);

  async function handleSubmit() {
    if (!pkg || !time) return;
    setSubmitting(true);
    setError(null);

    const res = await createBooking({
      setId,
      categoryId: pkg.categoryId,
      tierHours: pkg.hours,
      date,
      startTime: time,
      ...form,
    });

    if ("error" in res) {
      setError(res.error);
      setSubmitting(false);
      return;
    }

    router.push(`/book/confirm/${res.bookingId}`);
  }

  return (
    <div>
      <ol className="mb-8 flex items-center gap-3">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={
                  "flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs " +
                  (step === s
                    ? "bg-orange-600 text-white"
                    : step > s
                    ? "border border-orange-500 text-orange-500"
                    : "border border-neutral-700 text-neutral-500")
                }
              >
                {s}
              </span>
              <span className={"text-xs " + (step === s ? "text-neutral-100" : "text-neutral-500")}>
                {s === 1 ? "الباقة" : s === 2 ? "الميعاد" : "بياناتك"}
              </span>
            </div>
            {i < 2 && <span className="h-px w-6 bg-neutral-800" />}
          </div>
        ))}
      </ol>

      {step === 1 && (
        <div>
          <PackagePicker
            categories={categories}
            selectedId={pkg ? pkg.categoryId + "-" + pkg.hours : null}
            onSelect={setPkg}
          />
          <button
            disabled={!pkg}
            onClick={() => setStep(2)}
            className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-30"
          >
            التالي: اختار الميعاد
          </button>
        </div>
      )}

      {step === 2 && pkg && (
        <div>
          <div className="card-frame mb-6 flex items-center justify-between p-4">
            <span className="text-sm text-neutral-100">{pkg.name}</span>
            <button onClick={() => setStep(1)} className="font-mono text-xs text-orange-500 hover:underline">
              تغيير الباقة
            </button>
          </div>

          <label className="mb-2 block text-sm text-neutral-400">اختار اليوم</label>
          <input
            type="date"
            min={todayISO()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-4 py-3 font-mono text-sm text-neutral-100"
          />

          <p className="mb-2 mt-5 text-sm text-neutral-400">الأوقات</p>
          {loadingSlots ? (
            <p className="text-sm text-neutral-500">بنجيب الأوقات...</p>
          ) : availableSlots.every((s) => !s.available) ? (
            <p className="text-sm text-red-400">مفيش أوقات فاضية في اليوم ده، جرب يوم تاني.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setTime(slot.time)}
                  disabled={!slot.available}
                  title={slot.available ? undefined : "محجوز"}
                  className={
                    "rounded-sm border px-2 py-2 font-mono text-xs " +
                    (!slot.available
                      ? "cursor-not-allowed border-neutral-900 bg-neutral-900 text-neutral-700 line-through"
                      : time === slot.time
                      ? "border-orange-500 bg-orange-600 text-white"
                      : "border-neutral-800 text-neutral-100 hover:border-neutral-600")
                  }
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
          {!loadingSlots && availableSlots.some((s) => !s.available) && (
            <p className="mt-2 font-mono text-[10px] text-neutral-600">الأوقات المشطوبة محجوزة بالفعل.</p>
          )}

          <button
            disabled={!time}
            onClick={() => setStep(3)}
            className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-30"
          >
            التالي: بياناتك
          </button>
        </div>
      )}

      {step === 3 && pkg && (
        <div>
          <div className="card-frame mb-5 space-y-1 p-4 text-sm text-neutral-300">
            <p><span className="text-neutral-500">الباقة: </span>{pkg.name}</p>
            <p><span className="text-neutral-500">الميعاد: </span>{date} — {time}</p>
            <p><span className="text-neutral-500">الديبوزيت: </span><span className="text-orange-500">{pkg.deposit} ج.م</span></p>
          </div>

          <div className="space-y-3">
            <input
              placeholder="الاسم بالكامل"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600"
            />
            <input
              placeholder="01xxxxxxxxx"
              dir="ltr"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600"
            />
            <input
              placeholder="name@email.com"
              dir="ltr"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600"
            />
            <textarea
              placeholder="ملاحظات (اختياري)"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-sm border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600"
            />
          </div>

          <label className="mt-4 flex items-start gap-2 text-xs text-neutral-400">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
            <span>{CANCELLATION_POLICY}</span>
          </label>

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            disabled={submitting || !agreed || !form.customerName || !form.customerPhone || !form.customerEmail}
            onClick={handleSubmit}
            className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-30"
          >
            {submitting ? "جاري الحجز..." : "أكمل الحجز وادفع الديبوزيت"}
          </button>
        </div>
      )}
    </div>
  );
}
