import { getSettings } from "@/lib/settings";

export default async function StructuredData() {
  const settings = await getSettings();

  const data = {
    "@context": "https://schema.org",
    "@type": "PhotographyBusiness",
    name: "VOCK Studio",
    description: "استوديو تصوير في مدينة نصر يقدم سيتات جاهزة للبودكاست والريلز والفوتوغرافي.",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "القاهرة",
      addressCountry: "EG",
    },
    telephone: "+" + settings.whatsappNumber,
    priceRange: "$$",
    sameAs: [settings.instagramUrl, settings.facebookUrl, settings.tiktokUrl].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
