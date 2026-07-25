import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SETS = [
  {
    slug: "black-office",
    name: "سيت المكتب الأسود",
    tag: "مودرن / بيزنس",
    description: "مكتب خشبي بإضاءة دافئة وخلفية ستائر داكنة، مناسب لتصوير محتوى بيزنس وبورتريهات جادة.",
    amenities: ["اضاءة دافئة", "تكييف", "خلفية ستائر"],
    images: ["/images/sets/office.jpg"],
  },
  {
    slug: "boho-corner",
    name: "الركن البوهيمي",
    tag: "بوهيمي / دافئ",
    description: "كرسي بيج مريح مع رف مكرمية وسجادة طبيعية، مثالي لجلسات البورتريه الهادئة ومحتوى اللايف ستايل.",
    amenities: ["اضاءة طبيعية", "ديكور بوهيمي", "سجاد طبيعي"],
    images: ["/images/sets/boho1.jpg", "/images/sets/boho2.jpg"],
  },
  {
    slug: "classic-library",
    name: "مكتبة الكلاسيك",
    tag: "كلاسيك / فاخر",
    description: "مكتبة خشب داكن بإضاءة خافتة وكرسي جلد كلاسيك، مناسب لجلسات البورتريه الفاخرة والمحتوى الأدبي.",
    amenities: ["اضاءة خافتة دافئة", "ديكور خشبي", "سجاد شرقي"],
    images: ["/images/sets/library.jpg"],
  },
  {
    slug: "white-studio",
    name: "الاستوديو الأبيض",
    tag: "مينيمال / منتجات",
    description: "سيكلوراما أبيض بالكامل مع إضاءة استوديو احترافية، الأنسب لتصوير المنتجات والكتالوجات والفيديو.",
    amenities: ["سيكلوراما أبيض", "اضاءة استوديو", "تحكم كامل في الإضاءة"],
    images: ["/images/sets/white.jpg"],
  },
  {
    slug: "vintage-room",
    name: "غرفة الفينتاج",
    tag: "فينتاج / نوستالجيا",
    description: "ديكور فينتاج بورق حائط وردي وتليفزيون قديم وتليفون دائري، مثالي للمحتوى النوستالجي والتصوير الفني.",
    amenities: ["ديكور فينتاج اصلي", "اضاءة دافئة", "اكسسوارات قديمة"],
    images: ["/images/sets/vintage1.jpg", "/images/sets/vintage2.jpg"],
  },
  {
    slug: "green-podcast",
    name: "سيت البودكاست الأخضر",
    tag: "بودكاست / محتوى",
    description: "جدار أخضر داكن مع كرسي مريح ومعدات مايك جاهزة، مصمم خصيصًا لتسجيل البودكاست والمحتوى المرئي.",
    amenities: ["معدات صوت جاهزة", "اضاءة اجواء", "مقاعد مريحة"],
    images: ["/images/sets/podcast.jpg"],
  },
  {
    slug: "beige-lounge",
    name: "صالة البيج",
    tag: "مودرن / صالة",
    description: "صالة أنتريه بيج دافئة بديكور مودرن ونباتات طبيعية، مناسبة لجلسات العائلة والمحتوى اللايف ستايل.",
    amenities: ["اضاءة طبيعية", "نباتات طبيعية", "مساحة واسعة"],
    images: ["/images/sets/lounge.jpg"],
  },
];

const CATEGORIES = [
  {
    key: "podcast",
    label: "بودكاست",
    sortOrder: 1,
    includes: ["لوكيشن", "2 كاميرا", "2 عدسة", "2 مايك", "2 لايت (Litemons)", "مصور فيديو"],
    tiers: [
      { hours: 1, price: 2550, original: 3650 },
      { hours: 2, price: 4900, original: 7000 },
      { hours: 4, price: 9400, original: 13400 },
      { hours: 6, price: 13400, original: 19100 },
    ],
  },
  {
    key: "reels",
    label: "ريلز",
    sortOrder: 2,
    includes: ["لوكيشن", "1 كاميرا", "1 عدسة", "1 مايك", "2 لايت (Litemons)", "مصور فيديو", "مونتاج ريل واحد مجانًا"],
    tiers: [
      { hours: 1, price: 1860, original: 2650 },
      { hours: 2, price: 3480, original: 4950 },
      { hours: 4, price: 6650, original: 9500 },
      { hours: 6, price: 9650, original: 13750 },
    ],
  },
  {
    key: "location",
    label: "تأجير لوكيشن فقط",
    sortOrder: 3,
    includes: ["لوكيشن مع Soft Boxes"],
    tiers: [
      { hours: 1, price: 400, original: 500 },
      { hours: 8, price: 3200, original: 4000 },
      { hours: 12, price: 4800, original: 6000 },
      { hours: 20, price: 7000, original: 8000 },
      { hours: 40, price: 12000, original: 16000 },
      { hours: 60, price: 14500, original: 24000 },
    ],
  },
];

async function main() {
  console.log("🌱 إضافة سيتات VOCK...");
  for (const s of SETS) {
    await prisma.set.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        name: s.name,
        tag: s.tag,
        description: s.description,
        amenities: JSON.stringify(s.amenities),
        images: JSON.stringify(s.images),
      },
    });
  }

  console.log("🌱 إضافة فئات وأسعار VOCK...");
  for (const cat of CATEGORIES) {
    const created = await prisma.pricingCategory.upsert({
      where: { key: cat.key },
      update: { label: cat.label, includes: JSON.stringify(cat.includes), sortOrder: cat.sortOrder },
      create: {
        key: cat.key,
        label: cat.label,
        sortOrder: cat.sortOrder,
        includes: JSON.stringify(cat.includes),
      },
    });

    for (const tier of cat.tiers) {
      await prisma.pricingTier.upsert({
        where: { categoryId_hours: { categoryId: created.id, hours: tier.hours } },
        update: { price: tier.price, original: tier.original },
        create: {
          categoryId: created.id,
          hours: tier.hours,
          price: tier.price,
          original: tier.original,
        },
      });
    }
  }

  console.log("🌱 إضافة حساب صاحب الاستوديو...");
  const ownerPassword = process.env.OWNER_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(ownerPassword, 10);
  await prisma.teamMember.upsert({
    where: { username: "admin" },
    update: { passwordHash, canSettings: true },
    create: {
      name: "صاحب الاستوديو",
      username: "admin",
      passwordHash,
      isOwner: true,
      canBookings: true,
      canSets: true,
      canPricing: true,
      canTeam: true,
      canSettings: true,
    },
  });

  console.log("🌱 إضافة إعدادات الموقع الافتراضية...");
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  console.log("✅ خلصنا. حساب الدخول الافتراضي: admin / " + ownerPassword);
  console.log("⚠️ غيّر كلمة السر دي فورًا بعد أول نشر فعلي (متغير البيئة OWNER_PASSWORD).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
