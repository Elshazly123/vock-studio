"use client";

import { useState } from "react";
import Link from "next/link";
import { markTransferSent } from "@/lib/booking-actions";
import { formatEGP, CANCELLATION_POLICY } from "@/lib/types";

const INSTAPAY_NUMBER = "01005523731";

export default function DepositPayment({
  bookingId,
  setName,
  packageName,
  date,
  startTime,
  depositAmount,
  customerName,
  initialStatus,
}: {
  bookingId: string;
  setName: string;
  packageName: string;
  date: string;
  startTime: string;
  depositAmount: number;
  customerName: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function handleMarkSent() {
    setLoading(true);
    await markTransferSent(bookingId);
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
      <p className="mt-3 text-sm text-neutral-400">حجزك محجوز مؤقتًا. حوّل الديبوزيت عن طريق InstaPay على الرقم ده:</p>

      <div className="mt-5 rounded-sm border border-orange-500/40 bg-neutral-900 p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">رقم InstaPay</p>
        <p dir="ltr" className="mt-1 font-black tracking-tight text-2xl text-orange-500">{INSTAPAY_NUMBER}</p>
        <p className="mt-1 text-xs text-neutral-500">حوّل من تطبيق InstaPay أو أي بنك بيدعم التحويل الفوري</p>
      </div>

      <SummaryCard setName={setName} packageName={packageName} date={date} startTime={startTime} amount={depositAmount} amountLabel="المطلوب تحويله" bold />

      <button onClick={handleMarkSent} disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-50">
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
