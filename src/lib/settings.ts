import { prisma } from "./prisma";
import type { SiteSettingsData } from "./types";

const DEFAULTS: SiteSettingsData = {
  whatsappNumber: "201036263424",
  address: "18 شارع عزت سلامة، مدينة نصر، القاهرة",
  transferNumber: "01005523731",
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  instagramPosts: [],
  heroImages: [],
  heroVideoUrl: null,
};

function safeArray(json: string): string[] {
  try {
    const parsed = JSON.parse(json || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getSettings(): Promise<SiteSettingsData> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!row) return DEFAULTS;
  return {
    whatsappNumber: row.whatsappNumber,
    address: row.address,
    transferNumber: row.transferNumber,
    instagramUrl: row.instagramUrl,
    facebookUrl: row.facebookUrl,
    tiktokUrl: row.tiktokUrl,
    instagramPosts: safeArray(row.instagramPosts),
    heroImages: safeArray(row.heroImages),
    heroVideoUrl: row.heroVideoUrl,
  };
}
