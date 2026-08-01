"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, signSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";

function requirePermission(key: "canBookings" | "canSets" | "canPricing" | "canTeam" | "canSettings") {
  const user = getCurrentUser();
  if (!user || !user[key]) {
    throw new Error("مش مسموحلك تعمل الإجراء ده");
  }
  return user;
}

// ---------- تسجيل الدخول / الخروج ----------

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 دقيقة

export async function login(username: string, password: string) {
  const member = await prisma.teamMember.findUnique({ where: { username } });
  if (!member) return { error: "اسم المستخدم أو كلمة السر غلط" };

  if (member.lockedUntil && member.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((member.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `الحساب مقفول مؤقتًا بعد محاولات كتير غلط. حاول تاني بعد ${minutesLeft} دقيقة.` };
  }

  const ok = await verifyPassword(password, member.passwordHash);
  if (!ok) {
    const nextAttempts = member.failedAttempts + 1;
    const shouldLock = nextAttempts >= MAX_FAILED_ATTEMPTS;
    await prisma.teamMember.update({
      where: { id: member.id },
      data: {
        failedAttempts: shouldLock ? 0 : nextAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS) : null,
      },
    });
    if (shouldLock) {
      return { error: "محاولات كتير غلط. الحساب مقفول 15 دقيقة لحمايتك." };
    }
    return { error: "اسم المستخدم أو كلمة السر غلط" };
  }

  // دخول ناجح: نصفّر أي محاولات فاشلة سابقة
  if (member.failedAttempts > 0 || member.lockedUntil) {
    await prisma.teamMember.update({
      where: { id: member.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }

  const token = signSession({
    id: member.id,
    name: member.name,
    username: member.username,
    canBookings: member.canBookings,
    canSets: member.canSets,
    canPricing: member.canPricing,
    canTeam: member.canTeam,
    canSettings: member.canSettings,
  });

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // أسبوع
  });

  return { ok: true };
}

export async function logout() {
  cookies().delete(SESSION_COOKIE_NAME);
}

// ---------- الحجوزات ----------

export async function confirmBooking(bookingId: string) {
  requirePermission("canBookings");
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "confirmed" },
  });
}

export async function deleteBooking(bookingId: string) {
  requirePermission("canBookings");
  await prisma.booking.delete({ where: { id: bookingId } });
}

export async function createBookingAdmin(input: {
  setId: string;
  categoryId: string;
  tierHours: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  startTime: string;
  notes?: string;
}) {
  requirePermission("canBookings");

  const tier = await prisma.pricingTier.findFirst({
    where: { categoryId: input.categoryId, hours: input.tierHours },
  });
  if (!tier) throw new Error("الباقة غير متاحة");

  const depositAmount = Math.round((tier.price * 0.2) / 50) * 50;

  await prisma.booking.create({
    data: {
      setId: input.setId,
      categoryId: input.categoryId,
      tierHours: input.tierHours,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerEmail: input.customerEmail || "no-email@vockstudio.com",
      date: new Date(`${input.date}T00:00:00`),
      startTime: input.startTime,
      price: tier.price,
      depositAmount,
      notes: input.notes,
      status: "confirmed", // حجز يدوي من الأدمن بيتحط مؤكد على طول
    },
  });
}

export async function getAllBookings() {
  requirePermission("canBookings");
  return prisma.booking.findMany({
    orderBy: { date: "asc" },
    include: { set: true, category: true },
  });
}

// ---------- إدارة المواعيد المقفولة ----------

export async function getBlockedSlots() {
  requirePermission("canBookings");
  return prisma.blockedSlot.findMany({
    orderBy: { date: "asc" },
  });
}

export async function addBlockedSlot(input: { date: string; setId: string | null; reason?: string }) {
  requirePermission("canBookings");
  await prisma.blockedSlot.create({
    data: {
      date: new Date(`${input.date}T00:00:00`),
      setId: input.setId,
      reason: input.reason,
    },
  });
}

export async function removeBlockedSlot(id: string) {
  requirePermission("canBookings");
  await prisma.blockedSlot.delete({ where: { id } });
}

// ---------- السيتات والصور ----------

export async function getAllSetsAdmin() {
  requirePermission("canSets");
  return prisma.set.findMany({ orderBy: { name: "asc" } });
}

export async function addSet() {
  requirePermission("canSets");
  const created = await prisma.set.create({
    data: {
      slug: "set-" + Date.now(),
      name: "سيت جديد",
      tag: "بدون تصنيف",
      description: "اكتب وصف السيت هنا.",
      amenities: "[]",
      images: "[]",
    },
  });
  return created.id;
}

export async function updateSet(
  id: string,
  fields: { name?: string; tag?: string; description?: string; isActive?: boolean }
) {
  requirePermission("canSets");
  await prisma.set.update({ where: { id }, data: fields });
}

export async function deleteSet(id: string) {
  requirePermission("canSets");
  try {
    await prisma.set.delete({ where: { id } });
    return { mode: "deleted" as const };
  } catch {
    // فيه حجوزات مرتبطة بالسيت ده، فمينفعش يتمسح نهائي (عشان محتفظين بسجل
    // الحجوزات القديمة). بدل كده بنخفيه من الموقع بس (isActive: false).
    await prisma.set.update({ where: { id }, data: { isActive: false } });
    return { mode: "archived" as const };
  }
}

// الصورة بتتخزن كـ data URL جوه عمود images (JSON array) بدل ملف على الديسك —
// اختيار مقصود عشان يشتغل صح على استضافات serverless زي Vercel اللي نظام
// الملفات فيها مؤقت. لو حجم الصور الكلي كبر أوي، الخطوة الجاية المنطقية هي
// النقل لتخزين خارجي (S3 / Cloudinary) بدل الداتابيز.
export async function addSetImage(setId: string, dataUrl: string) {
  requirePermission("canSets");
  const set = await prisma.set.findUnique({ where: { id: setId } });
  if (!set) throw new Error("السيت مش موجود");
  const images = JSON.parse(set.images) as string[];
  images.push(dataUrl);
  await prisma.set.update({ where: { id: setId }, data: { images: JSON.stringify(images) } });
}

export async function removeSetImage(setId: string, index: number) {
  requirePermission("canSets");
  const set = await prisma.set.findUnique({ where: { id: setId } });
  if (!set) throw new Error("السيت مش موجود");
  const images = JSON.parse(set.images) as string[];
  images.splice(index, 1);
  await prisma.set.update({ where: { id: setId }, data: { images: JSON.stringify(images) } });
}

// ---------- الأسعار ----------

export async function getCategoriesAdmin() {
  requirePermission("canPricing");
  return prisma.pricingCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { tiers: { orderBy: { hours: "asc" } } },
  });
}

export async function updateTier(tierId: string, price: number, original: number) {
  requirePermission("canPricing");
  await prisma.pricingTier.update({ where: { id: tierId }, data: { price, original } });
}

export async function addCategory(input: { label: string; includes: string[] }) {
  requirePermission("canPricing");
  const key = input.label
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/(^-|-$)/g, "") || "category-" + Date.now();

  const count = await prisma.pricingCategory.count();

  return prisma.pricingCategory.create({
    data: {
      key: key + "-" + Date.now().toString().slice(-5),
      label: input.label,
      includes: JSON.stringify(input.includes),
      sortOrder: count + 1,
    },
  });
}

export async function deleteCategory(id: string) {
  requirePermission("canPricing");
  try {
    await prisma.pricingCategory.delete({ where: { id } });
    return { mode: "deleted" as const };
  } catch {
    // فيه حجوزات مرتبطة بالفئة دي، فبنخفيها بدل ما نمسحها نهائي
    await prisma.pricingCategory.update({ where: { id }, data: { isActive: false } });
    return { mode: "archived" as const };
  }
}

export async function setCategoryActive(id: string, isActive: boolean) {
  requirePermission("canPricing");
  await prisma.pricingCategory.update({ where: { id }, data: { isActive } });
}

export async function addTier(categoryId: string, hours: number, price: number, original: number) {
  requirePermission("canPricing");
  await prisma.pricingTier.create({ data: { categoryId, hours, price, original } });
}

export async function deleteTier(tierId: string) {
  requirePermission("canPricing");
  await prisma.pricingTier.delete({ where: { id: tierId } });
}

// ---------- الكوبونات ----------

export async function getCoupons() {
  requirePermission("canPricing");
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function addCoupon(input: {
  code: string;
  type: "percent" | "fixed";
  value: number;
  usageLimit: number | null;
  expiresAt: string | null;
}) {
  requirePermission("canPricing");
  await prisma.coupon.create({
    data: {
      code: input.code.toUpperCase().trim(),
      type: input.type,
      value: input.value,
      usageLimit: input.usageLimit,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
  });
}

export async function toggleCoupon(id: string, isActive: boolean) {
  requirePermission("canPricing");
  await prisma.coupon.update({ where: { id }, data: { isActive } });
}

export async function deleteCoupon(id: string) {
  requirePermission("canPricing");
  await prisma.coupon.delete({ where: { id } });
}

// ---------- قايمة الانتظار ----------

export async function getWaitlist() {
  requirePermission("canBookings");
  return prisma.waitlistEntry.findMany({ orderBy: { date: "asc" } });
}

export async function removeWaitlistEntry(id: string) {
  requirePermission("canBookings");
  await prisma.waitlistEntry.delete({ where: { id } });
}

// ---------- إحصائيات ----------

export async function getStats() {
  requirePermission("canBookings");

  const bookings = await prisma.booking.findMany({
    where: { status: { in: ["confirmed", "pending_verification"] } },
    include: { set: true, category: true },
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0);
  const totalBookings = bookings.length;

  const bySet: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  bookings.forEach((b) => {
    bySet[b.set.name] = (bySet[b.set.name] || 0) + 1;
    byCategory[b.category.label] = (byCategory[b.category.label] || 0) + 1;
  });

  const topSet = Object.entries(bySet).sort((a, b) => b[1] - a[1])[0];
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return {
    totalRevenue,
    totalBookings,
    topSetName: topSet?.[0] ?? "—",
    topSetCount: topSet?.[1] ?? 0,
    topCategoryName: topCategory?.[0] ?? "—",
    topCategoryCount: topCategory?.[1] ?? 0,
  };
}

// ---------- بوستات انستجرام مختارة ----------

export async function updateInstagramPosts(posts: string[]) {
  requirePermission("canSettings");
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: { instagramPosts: JSON.stringify(posts) },
    create: { id: "main", instagramPosts: JSON.stringify(posts) },
  });
}

// ---------- إعدادات الموقع العامة ----------

export async function updateSettings(data: {
  whatsappNumber: string;
  address: string;
  transferNumber: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
}) {
  requirePermission("canSettings");
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });
}

// ---------- الفريق ----------

export async function getTeam() {
  requirePermission("canTeam");
  return prisma.teamMember.findMany({ orderBy: { createdAt: "asc" } });
}

export async function addTeamMember(input: {
  name: string;
  username: string;
  password: string;
  canBookings: boolean;
  canSets: boolean;
  canPricing: boolean;
  canTeam: boolean;
  canSettings: boolean;
}) {
  requirePermission("canTeam");
  const passwordHash = await hashPassword(input.password);
  await prisma.teamMember.create({
    data: {
      name: input.name,
      username: input.username,
      passwordHash,
      canBookings: input.canBookings,
      canSets: input.canSets,
      canPricing: input.canPricing,
      canTeam: input.canTeam,
      canSettings: input.canSettings,
    },
  });
}

export async function removeTeamMember(id: string) {
  requirePermission("canTeam");
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (member?.isOwner) throw new Error("مينفعش تشيل الحساب الأساسي");
  await prisma.teamMember.delete({ where: { id } });
}

export async function toggleTeamPermission(
  id: string,
  key: "canBookings" | "canSets" | "canPricing" | "canTeam" | "canSettings",
  value: boolean
) {
  requirePermission("canTeam");
  await prisma.teamMember.update({ where: { id }, data: { [key]: value } });
}
