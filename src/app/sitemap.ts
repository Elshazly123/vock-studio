import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://vock-studio-xqfk.vercel.app";
  const sets = await prisma.set.findMany({ where: { isActive: true }, select: { slug: true } });

  return [
    { url: base, priority: 1 },
    { url: `${base}/sets`, priority: 0.9 },
    { url: `${base}/policy`, priority: 0.3 },
    ...sets.map((s) => ({ url: `${base}/sets/${s.slug}`, priority: 0.7 })),
  ];
}
