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
    nameEn: "Black Office Set",
    tagEn: "Modern / Business",
    descriptionEn: "A wooden desk with warm lighting and a dark curtain backdrop — great for business content and serious portraits.",
    amenitiesEn: ["Warm lighting", "A/C", "Curtain backdrop"],
  },
  {
    slug: "boho-corner",
    name: "الركن البوهيمي",
    tag: "بوهيمي / دافئ",
    description: "كرسي بيج مريح مع رف مكرمية وسجادة طبيعية، مثالي لجلسات البورتريه الهادئة ومحتوى اللايف ستايل.",
    amenities: ["اضاءة طبيعية", "ديكور بوهيمي", "سجاد طبيعي"],
    images: ["/images/sets/boho1.jpg", "/images/sets/boho2.jpg"],
    nameEn: "The Boho Corner",
    tagEn: "Boho / Warm",
    descriptionEn: "A cozy beige armchair with a macrame shelf and a natural rug — perfect for calm portraits and lifestyle content.",
    amenitiesEn: ["Natural light", "Boho decor", "Natural rug"],
  },
  {
    slug: "classic-library",
    name: "مكتبة الكلاسيك",
    tag: "كلاسيك / فاخر",
    description: "مكتبة خشب داكن بإضاءة خافتة وكرسي جلد كلاسيك، مناسب لجلسات البورتريه الفاخرة والمحتوى الأدبي.",
    amenities: ["اضاءة خافتة دافئة", "ديكور خشبي", "سجاد شرقي"],
    images: ["/images/sets/library.jpg"],
    nameEn: "Classic Library",
    tagEn: "Classic / Luxury",
    descriptionEn: "A dark wood library with warm dim lighting and a classic leather chair — ideal for luxury portraits and literary content.",
    amenitiesEn: ["Warm dim lighting", "Wooden decor", "Oriental rug"],
  },
  {
    slug: "white-studio",
    name: "الاستوديو الأبيض",
    tag: "مينيمال / منتجات",
    description: "سيكلوراما أبيض بالكامل مع إضاءة استوديو احترافية، الأنسب لتصوير المنتجات والكتالوجات والفيديو.",
    amenities: ["سيكلوراما أبيض", "اضاءة استوديو", "تحكم كامل في الإضاءة"],
    images: ["/images/sets/white.jpg"],
    nameEn: "The White Studio",
    tagEn: "Minimal / Products",
    descriptionEn: "A full white cyclorama with professional studio lighting — the best fit for product, catalog, and video shoots.",
    amenitiesEn: ["White cyclorama", "Studio lighting", "Full lighting control"],
  },
  {
    slug: "vintage-room",
    name: "غرفة الفينتاج",
    tag: "فينتاج / نوستالجيا",
    description: "ديكور فينتاج بورق حائط وردي وتليفزيون قديم وتليفون دائري، مثالي للمحتوى النوستالجي والتصوير الفني.",
    amenities: ["ديكور فينتاج اصلي", "اضاءة دافئة", "اكسسوارات قديمة"],
    images: ["/images/sets/vintage1.jpg", "/images/sets/vintage2.jpg"],
    nameEn: "The Vintage Room",
    tagEn: "Vintage / Nostalgic",
    descriptionEn: "Vintage decor with pink wallpaper, an old TV, and a rotary phone — perfect for nostalgic content and artistic shoots.",
    amenitiesEn: ["Genuine vintage decor", "Warm lighting", "Vintage props"],
  },
  {
    slug: "green-podcast",
    name: "سيت البودكاست الأخضر",
    tag: "بودكاست / محتوى",
    description: "جدار أخضر داكن مع كرسي مريح ومعدات مايك جاهزة، مصمم خصيصًا لتسجيل البودكاست والمحتوى المرئي.",
    amenities: ["معدات صوت جاهزة", "اضاءة اجواء", "مقاعد مريحة"],
    images: ["/images/sets/podcast.jpg"],
    nameEn: "Green Podcast Set",
    tagEn: "Podcast / Content",
    descriptionEn: "A dark green wall with a comfortable chair and ready mic setup — purpose-built for podcast and video content.",
    amenitiesEn: ["Ready audio gear", "Mood lighting", "Comfortable seating"],
  },
  {
    slug: "beige-lounge",
    name: "صالة البيج",
    tag: "مودرن / صالة",
    description: "صالة أنتريه بيج دافئة بديكور مودرن ونباتات طبيعية، مناسبة لجلسات العائلة والمحتوى اللايف ستايل.",
    amenities: ["اضاءة طبيعية", "نباتات طبيعية", "مساحة واسعة"],
    images: ["/images/sets/lounge.jpg"],
    nameEn: "The Beige Lounge",
    tagEn: "Modern / Lounge",
    descriptionEn: "A warm beige living room with modern decor and real plants — great for family sessions and lifestyle content.",
    amenitiesEn: ["Natural light", "Real plants", "Spacious"],
  },
];

const CATEGORIES = [
  {
    key: "podcast",
    label: "بودكاست",
    labelEn: "Podcast",
    sortOrder: 1,
    includes: ["لوكيشن", "2 كاميرا", "2 عدسة", "2 مايك", "2 لايت (Litemons)", "مصور فيديو"],
    includesEn: ["Location", "2 cameras", "2 lenses", "2 mics", "2 lights (Litemons)", "Videographer"],
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
    labelEn: "Reels",
    sortOrder: 2,
    includes: ["لوكيشن", "1 كاميرا", "1 عدسة", "1 مايك", "2 لايت (Litemons)", "مصور فيديو", "مونتاج ريل واحد مجانًا"],
    includesEn: ["Location", "1 camera", "1 lens", "1 mic", "2 lights (Litemons)", "Videographer", "One free reel edit"],
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
    labelEn: "Location Rental Only",
    sortOrder: 3,
    includes: ["لوكيشن مع Soft Boxes"],
    includesEn: ["Location with Soft Boxes"],
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
      update: {
        nameEn: s.nameEn,
        tagEn: s.tagEn,
        descriptionEn: s.descriptionEn,
        amenitiesEn: JSON.stringify(s.amenitiesEn),
      },
      create: {
        slug: s.slug,
        name: s.name,
        tag: s.tag,
        description: s.description,
        amenities: JSON.stringify(s.amenities),
        images: JSON.stringify(s.images),
        nameEn: s.nameEn,
        tagEn: s.tagEn,
        descriptionEn: s.descriptionEn,
        amenitiesEn: JSON.stringify(s.amenitiesEn),
      },
    });
  }

  console.log("🌱 إضافة فئات وأسعار VOCK...");
  for (const cat of CATEGORIES) {
    const created = await prisma.pricingCategory.upsert({
      where: { key: cat.key },
      update: {
        label: cat.label,
        includes: JSON.stringify(cat.includes),
        sortOrder: cat.sortOrder,
        labelEn: cat.labelEn,
        includesEn: JSON.stringify(cat.includesEn),
      },
      create: {
        key: cat.key,
        label: cat.label,
        sortOrder: cat.sortOrder,
        includes: JSON.stringify(cat.includes),
        labelEn: cat.labelEn,
        includesEn: JSON.stringify(cat.includesEn),
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
