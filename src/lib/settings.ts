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
};

export async function getSettings(): Promise<SiteSettingsData> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!row) return DEFAULTS;
  let instagramPosts: string[] = [];
  try {
    const parsed = JSON.parse(row.instagramPosts || "[]");
    if (Array.isArray(parsed)) instagramPosts = parsed;
  } catch {
    instagramPosts = [];
  }
  return {
    whatsappNumber: row.whatsappNumber,
    address: row.address,
    transferNumber: row.transferNumber,
    instagramUrl: row.instagramUrl,
    facebookUrl: row.facebookUrl,
    tiktokUrl: row.tiktokUrl,
    instagramPosts,
  };
}
