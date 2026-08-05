"use client";

import { useState } from "react";
import Link from "next/link";
import { markTransferSent } from "@/lib/booking-actions";
import { formatEGP, cancellationPolicy } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";

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

function buildCalendarLink(input: { title: string; date: string; startTime: string; durationHours: number; location: string; details: string }) {
  const [h, m] = input.startTime.split(":").map(Number);
  const start = new Date(`${input.date}T00:00:00`);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + input.durationHours * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: input.location,
    details: input.details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function DepositPayment({
  bookingId,
  setName,
  packageName,
  date,
  startTime,
  durationHours,
  depositAmount,
  customerName,
  initialStatus,
  transferNumber,
  address,
  locale,
}: {
  bookingId: string;
  setName: string;
  packageName: string;
  date: string;
  startTime: string;
  durationHours: number;
  depositAmount: number;
  customerName: string;
  initialStatus: string;
  transferNumber: string;
  address: string;
  locale: Locale;
}) {
  const s = t(locale);
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
      setError(locale === "ar" ? "لازم ترفع صورة إثبات التحويل الأول" : "You need to upload a proof of transfer first");
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
          {s.confirmed_greeting} {customerName.split(" ")[0]}, {locale === "ar" ? "حجزك اتأكد" : "your booking is confirmed"}
        </h1>
        <p className="mt-3 text-sm text-neutral-400">{s.confirmed_body}</p>
        <SummaryCard s={s} setName={setName} packageName={packageName} date={date} startTime={startTime} amount={depositAmount} amountLabel={locale === "ar" ? "الديبوزيت المدفوع" : "Deposit paid"} locale={locale} />
        <a
          href={buildCalendarLink({
            title: `VOCK Studio Session — ${setName}`,
            date,
            startTime,
            durationHours,
            location: address,
            details: `${s.package_label}: ${packageName}`,
          })}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary mt-4 inline-flex"
        >
          {s.add_to_calendar}
        </a>
        <br />
        <Link href="/" className="btn-secondary mt-3 inline-flex">{s.back_home}</Link>
      </div>
    );
  }

  if (status === "pending_verification") {
    return (
      <div className="text-center">
        <p className="mb-3 text-3xl text-orange-500">⏳</p>
        <h1 className="font-black tracking-tight text-2xl text-neutral-50">{s.pending_verification_title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">{s.pending_verification_body}</p>
        <SummaryCard s={s} setName={setName} packageName={packageName} date={date} startTime={startTime} amount={depositAmount} amountLabel={s.deposit_label} locale={locale} />
        <Link href="/" className="btn-secondary mt-6 inline-flex">{s.back_home}</Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="mb-3 text-3xl text-orange-500">🔒</p>
      <h1 className="font-black tracking-tight text-2xl text-neutral-50">{s.pending_deposit_title}</h1>
      <p className="mt-3 text-sm text-neutral-400">{s.pending_deposit_body}</p>

      <div className="mt-5 rounded-sm border border-orange-500/40 bg-neutral-900 p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">{s.transfer_number_label}</p>
        <p dir="ltr" className="mt-1 font-black tracking-tight text-2xl text-orange-500">{transferNumber}</p>
        <p className="mt-1 text-xs text-neutral-500">{s.transfer_hint}</p>
      </div>

      <SummaryCard s={s} setName={setName} packageName={packageName} date={date} startTime={startTime} amount={depositAmount} amountLabel={s.required_amount} bold locale={locale} />

      <div className="mt-6 text-right">
        <label className="mb-2 block text-sm text-neutral-400">{s.proof_label}</label>
        {proofPreview ? (
          <div className="relative">
            <img src={proofPreview} alt="proof" className="max-h-56 w-full rounded-sm border border-neutral-800 object-contain" />
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
            <span className="text-xs">{s.upload_proof}</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </label>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button onClick={handleMarkSent} disabled={loading || !proofPreview} className="btn-primary mt-6 w-full disabled:opacity-50">
        {loading ? s.marking : s.mark_sent}
      </button>
      <p className="mt-3 font-mono text-[10px] text-neutral-600">{s.manual_review_note}</p>
      <p className="mt-2 text-[11px] text-neutral-500">{cancellationPolicy(locale)}</p>
    </div>
  );
}

function SummaryCard({
  s,
  setName,
  packageName,
  date,
  startTime,
  amount,
  amountLabel,
  bold,
  locale,
}: {
  s: ReturnType<typeof t>;
  setName: string;
  packageName: string;
  date: string;
  startTime: string;
  amount: number;
  amountLabel: string;
  bold?: boolean;
  locale: Locale;
}) {
  return (
    <div className="card-frame mt-6 space-y-2 p-4 text-right text-sm text-neutral-300">
      <Row label={s.set_label} value={setName} />
      <Row label={s.package_label} value={packageName} />
      <Row label={s.time_label} value={`${date} — ${startTime}`} />
      <Row label={amountLabel} value={formatEGP(amount, locale)} bold={bold} />
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
