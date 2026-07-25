"use client";

import { useState } from "react";
import Link from "next/link";
import { markTransferSent } from "@/lib/booking-actions";
import { formatEGP, CANCELLATION_POLICY } from "@/lib/types";

// بتاخد صورة مرفوعة من العميل وتصغّرها/تضغطها قبل الإرسال، عشان الحجم يفضل معقول
function resizeImageFile(file: File, maxWidth = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function DepositPayment({
  bookingId,
  setName,
  packageName,
  date,
  startTime,
  depositAmount,
  customerName,
  initialStatus,
  transferNumber,
}: {
  bookingId: string;
  setName: string;
  packageName: string;
  date: string;
  startTime: string;
  depositAmount: number;
  customerName: string;
  initialStatus: string;
  transferNumber: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const dataUrl = await resizeImageFile(file);
    setProofPreview(dataUrl);
    setError(null);
  }

  async function handleMarkSent() {
    if (!proofPreview) {
      setError("لازم ترفع صورة إثبات التحويل الأول");
      return;
    }
    setLoading(true);
    const res = await markTransferSent(bookingId, proofPreview);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    setStatus("pending_verification");
    setLoading(false);
  }

  if (status === "confirmed") {
    return (
      <div className="text-center">
        <p className="mb-3 text-3xl text-orange-500">✓</p>
        <h1 className="font-black tracking-tight text-2xl text-neutral-50">
          مبروك يا {customerName.split(" ")[0]}، حجزك اتأكد
        </h1>
        <p className="mt-3 text-sm text-neutral-400">هيوصلك تأكيد بكل التفاصيل على الإيميل والموبايل.</p>
        <SummaryCard setName={setName} packageName={packageName} date={date} startTime={startTime} amount={depositAmount} amountLabel="الديبوزيت المدفوع" />
        <Link href="/" className="btn-secondary mt-6 inline-flex">العودة للرئيسية</Link>
      </div>
    );
  }

  if (status === "pending_verification") {
    return (
      <div className="text-center">
        <p className="mb-3 text-3xl text-orange-500">⏳</p>
        <h1 className="font-black tracking-tight text-2xl text-neutral-50">تم استلام إشعارك</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          فريق VOCK هيتأكد من التحويل ويأكد حجزك خلال ساعات. هيوصلك تأكيد على الواتساب أو الموبايل فور ما نتأكد.
        </p>
        <SummaryCard setName={setName} packageName={packageName} date={date} startTime={startTime} amount={depositAmount} amountLabel="الديبوزيت" />
        <Link href="/" className="btn-secondary mt-6 inline-flex">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="mb-3 text-3xl text-orange-500">🔒</p>
      <h1 className="font-black tracking-tight text-2xl text-neutral-50">حوّل الديبوزيت لتأكيد الحجز</h1>
      <p className="mt-3 text-sm text-neutral-400">
        حجزك محجوز مؤقتًا. حوّل الديبوزيت عن طريق فودافون كاش أو InstaPay على الرقم ده:
      </p>

      <div className="mt-5 rounded-sm border border-orange-500/40 bg-neutral-900 p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">رقم التحويل</p>
        <p dir="ltr" className="mt-1 font-black tracking-tight text-2xl text-orange-500">{transferNumber}</p>
        <p className="mt-1 text-xs text-neutral-500">فودافون كاش أو InstaPay — أي طريقة تريحك</p>
      </div>

      <SummaryCard setName={setName} packageName={packageName} date={date} startTime={startTime} amount={depositAmount} amountLabel="المطلوب تحويله" bold />

      <div className="mt-6 text-right">
        <label className="mb-2 block text-sm text-neutral-400">صورة إثبات التحويل (إجباري)</label>
        {proofPreview ? (
          <div className="relative">
            <img src={proofPreview} alt="إثبات التحويل" className="max-h-56 w-full rounded-sm border border-neutral-800 object-contain" />
            <button
              onClick={() => setProofPreview(null)}
              className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-neutral-700 text-neutral-500 hover:border-orange-500 hover:text-orange-500">
            <span className="text-2xl">+</span>
            <span className="text-xs">ارفع صورة سكرين شوت التحويل</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button onClick={handleMarkSent} disabled={loading || !proofPreview} className="btn-primary mt-6 w-full disabled:opacity-50">
        {loading ? "جاري التأكيد..." : "حوّلت الديبوزيت ✓"}
      </button>
      <p className="mt-3 font-mono text-[10px] text-neutral-600">
        هنراجع التحويل ونأكد حجزك يدويًا. لحد ما نرقّي الموقع لبوابة دفع أوتوماتيكية.
      </p>
      <p className="mt-2 text-[11px] text-neutral-500">{CANCELLATION_POLICY}</p>
    </div>
  );
}

function SummaryCard({
  setName,
  packageName,
  date,
  startTime,
  amount,
  amountLabel,
  bold,
}: {
  setName: string;
  packageName: string;
  date: string;
  startTime: string;
  amount: number;
  amountLabel: string;
  bold?: boolean;
}) {
  return (
    <div className="card-frame mt-6 space-y-2 p-4 text-right text-sm text-neutral-300">
      <Row label="السيت" value={setName} />
      <Row label="الباقة" value={packageName} />
      <Row label="الميعاد" value={`${date} — ${startTime}`} />
      <Row label={amountLabel} value={formatEGP(amount)} bold={bold} />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500">{label}</span>
      <span className={bold ? "font-semibold text-orange-500" : ""}>{value}</span>
    </div>
  );
}
