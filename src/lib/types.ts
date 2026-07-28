export type SetSummary = {
  id: string;
  slug: string;
  name: string;
  tag: string;
  address: string;
  description: string;
  amenities: string[];
  images: string[];
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
}): SetSummary {
  return {
    ...s,
    amenities: safeJsonArray(s.amenities),
    images: safeJsonArray(s.images),
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

export function formatEGP(amount: number): string {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const DEPOSIT_PERCENT = 0.2;

export function depositFor(price: number): number {
  return Math.round((price * DEPOSIT_PERCENT) / 50) * 50;
}

// صيغة الجمع الصحيحة للساعات بالعربي: 1=ساعة، 2=ساعتين، 3-10=ساعات، 11+=ساعة (تمييز)
export function hoursLabel(hours: number): string {
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
  tiers: PricingTierData[];
};

export function parseCategory(c: {
  id: string;
  key: string;
  label: string;
  includes: string;
  tiers: { id: string; hours: number; price: number; original: number }[];
}): PricingCategoryData {
  return { ...c, includes: safeJsonArray(c.includes) };
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
export function toWhatsappLink(localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "2" + digits : digits;
  return `https://wa.me/${intl}`;
}

export const CANCELLATION_POLICY =
  "لو حبيت تلغي أو تأجل الحجز قبل الميعاد بـ 24 ساعة أو أكتر، بنرجعلك الديبوزيت كامل. الإلغاء في أقل من 24 ساعة من الميعاد، الديبوزيت مش قابل للاسترداد.";
