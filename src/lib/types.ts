import type { Locale } from "./i18n";

export type SetSummary = {
  id: string;
  slug: string;
  name: string;
  tag: string;
  address: string;
  description: string;
  amenities: string[];
  images: string[];
  nameEn: string;
  tagEn: string;
  descriptionEn: string;
  amenitiesEn: string[];
};

export function parseSet(s: {
  id: string;
  slug: string;
  name: string;
  tag: string;
  address: string;
  description: string;
  amenities: string;
  images: string;
  nameEn?: string;
  tagEn?: string;
  descriptionEn?: string;
  amenitiesEn?: string;
}): SetSummary {
  return {
    ...s,
    amenities: safeJsonArray(s.amenities),
    images: safeJsonArray(s.images),
    nameEn: s.nameEn ?? "",
    tagEn: s.tagEn ?? "",
    descriptionEn: s.descriptionEn ?? "",
    amenitiesEn: safeJsonArray(s.amenitiesEn ?? "[]"),
  };
}

// بيرجع نسخة السيت بلغة العرض المطلوبة (بيرجع للعربي لو الترجمة الإنجليزية لسه فاضية)
export function localizeSet(s: SetSummary, locale: Locale) {
  if (locale === "ar") return { name: s.name, tag: s.tag, description: s.description, amenities: s.amenities };
  return {
    name: s.nameEn || s.name,
    tag: s.tagEn || s.tag,
    description: s.descriptionEn || s.description,
    amenities: s.amenitiesEn.length ? s.amenitiesEn : s.amenities,
  };
}

function safeJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function formatEGP(amount: number, locale: Locale = "ar"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const DEPOSIT_PERCENT = 0.2;

export function depositFor(price: number): number {
  return Math.round((price * DEPOSIT_PERCENT) / 50) * 50;
}

// صيغة الجمع الصحيحة للساعات: عربي (1=ساعة، 2=ساعتين، 3-10=ساعات، 11+=ساعة تمييز) أو إنجليزي بسيط
export function hoursLabel(hours: number, locale: Locale = "ar"): string {
  if (locale === "en") return hours === 1 ? "hour" : "hours";
  if (hours === 1) return "ساعة";
  if (hours === 2) return "ساعتين";
  if (hours >= 3 && hours <= 10) return "ساعات";
  return "ساعة";
}

// أوقات الحجز المتاحة يوميًا (Placeholder ثابت). في الإنتاج ينفع تتحول
// لجدول دوام حقيقي يتغير حسب اليوم.
export const DAILY_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
];

export type PricingTierData = {
  id: string;
  hours: number;
  price: number;
  original: number;
};

export type PricingCategoryData = {
  id: string;
  key: string;
  label: string;
  includes: string[];
  labelEn: string;
  includesEn: string[];
  tiers: PricingTierData[];
};

export function parseCategory(c: {
  id: string;
  key: string;
  label: string;
  includes: string;
  labelEn?: string;
  includesEn?: string;
  tiers: { id: string; hours: number; price: number; original: number }[];
}): PricingCategoryData {
  return {
    ...c,
    includes: safeJsonArray(c.includes),
    labelEn: c.labelEn ?? "",
    includesEn: safeJsonArray(c.includesEn ?? "[]"),
  };
}

export function localizeCategory(c: PricingCategoryData, locale: Locale) {
  if (locale === "ar") return { label: c.label, includes: c.includes };
  return {
    label: c.labelEn || c.label,
    includes: c.includesEn.length ? c.includesEn : c.includes,
  };
}

export type SiteSettingsData = {
  whatsappNumber: string;
  address: string;
  transferNumber: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  instagramPosts: string[];
};

// بيصيغ رقم الموبايل المصري (01xxxxxxxxx) لصيغة دولية (20xxxxxxxxxx) للينكات واتساب
export function toWhatsappLink(localNumber: string, message?: string): string {
  const digits = localNumber.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "2" + digits : digits;
  const base = `https://wa.me/${intl}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function cancellationPolicy(locale: Locale): string {
  if (locale === "en") {
    return "If you cancel or reschedule 24 hours or more before your session, we'll refund the full deposit. Cancelling less than 24 hours before is non-refundable.";
  }
  return "لو حبيت تلغي أو تأجل الحجز قبل الميعاد بـ 24 ساعة أو أكتر، بنرجعلك الديبوزيت كامل. الإلغاء في أقل من 24 ساعة من الميعاد، الديبوزيت مش قابل للاسترداد.";
}
