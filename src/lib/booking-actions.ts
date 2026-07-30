"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DAILY_SLOTS } from "@/lib/types";

const bookingSchema = z.object({
  setId: z.string().min(1),
  categoryId: z.string().min(1),
  tierHours: z.number().int().positive(),
  customerName: z.string().min(2, "الاسم قصير جدًا"),
  customerPhone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الموبايل غير صحيح"),
  customerEmail: z.string().email("الإيميل غير صحيح"),
  date: z.string().min(1),
  startTime: z.string().min(1),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export type SlotStatus = { time: string; available: boolean };

const PENDING_EXPIRY_MS = 2 * 60 * 60 * 1000; // ساعتين

export async function getAvailableSlots(setId: string, date: string): Promise<SlotStatus[]> {
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59`);

  const blocked = await prisma.blockedSlot.findFirst({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      OR: [{ setId }, { setId: null }],
    },
  });
  if (blocked) return DAILY_SLOTS.map((time) => ({ time, available: false }));

  const existing = await prisma.booking.findMany({
    where: {
      setId,
      date: { gte: dayStart, lte: dayEnd },
      status: { in: ["pending_deposit", "pending_verification", "confirmed"] },
    },
    select: { startTime: true, status: true, createdAt: true },
  });

  // حجز لسه "مستني تحويل" (العميل ما رفعش صورة إثبات) من أكتر من ساعتين
  // بيعتبر متروك، ومنسيبوش يقفل المعاد للأبد.
  const now = Date.now();
  const stillBlocking = existing.filter((b) => {
    if (b.status !== "pending_deposit") return true;
    return now - b.createdAt.getTime() < PENDING_EXPIRY_MS;
  });

  const taken = new Set(stillBlocking.map((b) => b.startTime));
  return DAILY_SLOTS.map((time) => ({ time, available: !taken.has(time) }));
}

// بيتأكد إن الكوبون شغال (فعّال، معملش تجاوز الحد، ولسه معملوش انتهاء) ويرجع قيمة الخصم
export async function validateCoupon(code: string, price: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!coupon || !coupon.isActive) return { error: "الكوبون غير صحيح" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: "الكوبون منتهي" };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { error: "الكوبون خلص استخدامه" };
  }
  const discount = coupon.type === "percent" ? Math.round((price * coupon.value) / 100) : coupon.value;
  const finalPrice = Math.max(0, price - discount);
  return { discount, finalPrice };
}

export async function createBooking(input: BookingInput) {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;

  const tier = await prisma.pricingTier.findFirst({
    where: { categoryId: data.categoryId, hours: data.tierHours },
  });
  if (!tier) return { error: "الباقة غير متاحة" };

  const dayStart = new Date(`${data.date}T00:00:00`);
  const dayEnd = new Date(`${data.date}T23:59:59`);

  const blocked = await prisma.blockedSlot.findFirst({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      OR: [{ setId: data.setId }, { setId: null }],
    },
  });
  if (blocked) return { error: "الاستوديو مقفول في اليوم ده، اختار يوم تاني" };

  const clash = await prisma.booking.findFirst({
    where: {
      setId: data.setId,
      date: { gte: dayStart, lte: dayEnd },
      startTime: data.startTime,
      OR: [
        { status: { in: ["pending_verification", "confirmed"] } },
        { status: "pending_deposit", createdAt: { gte: new Date(Date.now() - PENDING_EXPIRY_MS) } },
      ],
    },
  });
  if (clash) return { error: "الميعاد ده اتحجز لحظة قبلك، اختار وقت تاني" };

  let finalPrice = tier.price;
  let discountAmount = 0;
  let couponCode: string | null = null;

  if (data.couponCode) {
    const result = await validateCoupon(data.couponCode, tier.price);
    if ("error" in result) return { error: result.error };
    finalPrice = result.finalPrice;
    discountAmount = result.discount;
    couponCode = data.couponCode.toUpperCase().trim();
  }

  const depositAmount = Math.round((finalPrice * 0.2) / 50) * 50;

  const booking = await prisma.booking.create({
    data: {
      setId: data.setId,
      categoryId: data.categoryId,
      tierHours: data.tierHours,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      date: new Date(`${data.date}T00:00:00`),
      startTime: data.startTime,
      price: finalPrice,
      depositAmount,
      couponCode,
      discountAmount,
      notes: data.notes,
      status: "pending_deposit",
    },
  });

  if (couponCode) {
    await prisma.coupon.update({
      where: { code: couponCode },
      data: { usedCount: { increment: 1 } },
    });
  }

  return { bookingId: booking.id };
}

export async function markTransferSent(bookingId: string, paymentProofUrl: string) {
  if (!paymentProofUrl) {
    return { error: "لازم ترفع صورة إثبات التحويل الأول" };
  }
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { error: "الحجز غير موجود" };
  if (booking.status !== "pending_deposit") return { ok: true };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "pending_verification", paymentProofUrl },
  });
  return { ok: true };
}

export async function joinWaitlist(input: { setId: string; date: string; customerName: string; customerPhone: string }) {
  if (!input.customerName || !/^01[0125][0-9]{8}$/.test(input.customerPhone)) {
    return { error: "بيانات غير صحيحة" };
  }
  await prisma.waitlistEntry.create({
    data: {
      setId: input.setId,
      date: new Date(`${input.date}T00:00:00`),
      customerName: input.customerName,
      customerPhone: input.customerPhone,
    },
  });
  return { ok: true };
}
