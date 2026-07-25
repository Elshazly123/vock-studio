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
});

export type BookingInput = z.infer<typeof bookingSchema>;

export type SlotStatus = { time: string; available: boolean };

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
    select: { startTime: true },
  });

  const taken = new Set(existing.map((b) => b.startTime));
  return DAILY_SLOTS.map((time) => ({ time, available: !taken.has(time) }));
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
      status: { in: ["pending_deposit", "pending_verification", "confirmed"] },
    },
  });
  if (clash) return { error: "الميعاد ده اتحجز لحظة قبلك، اختار وقت تاني" };

  const depositAmount = Math.round((tier.price * 0.2) / 50) * 50;

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
      price: tier.price,
      depositAmount,
      notes: data.notes,
      status: "pending_deposit",
    },
  });

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
