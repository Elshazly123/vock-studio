import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import StructuredData from "@/components/StructuredData";
import { getSettings } from "@/lib/settings";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocale();
  const isAr = locale === "ar";

  return {
    metadataBase: new URL("https://vock-studio-xqfk.vercel.app"),
    title: {
      default: isAr ? "VOCK | احجز سيتك في مدينة نصر" : "VOCK | Book your set in Nasr City",
      template: "%s | VOCK",
    },
    description: isAr
      ? "استوديو VOCK في مدينة نصر — سيتات تصوير جاهزة (بودكاست، ريلز، فوتوغرافي)، احجز باقتك أونلاين بديبوزيت بسيط."
      : "VOCK Studio in Nasr City — ready-made shooting sets (podcast, reels, photography). Book your package online with a simple deposit.",
    keywords: ["photography studio", "Nasr City", "podcast studio", "reels shoot", "studio booking", "VOCK", "استوديو تصوير", "مدينة نصر"],
    openGraph: {
      title: isAr ? "VOCK | استوديو تصوير في مدينة نصر" : "VOCK | Photography Studio in Nasr City",
      description: isAr ? "سيتات تصوير جاهزة — بودكاست، ريلز، فوتوغرافي." : "Ready-made shooting sets — podcast, reels, photography.",
      locale: isAr ? "ar_EG" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "VOCK",
      description: isAr ? "احجز أونلاين في دقايق." : "Book online in minutes.",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const locale = getLocale();
  const strings = t(locale);

  return (
    <html lang={locale} dir={strings.dir} className={`${body.variable} ${mono.variable}`}>
      <body className="bg-ink font-body text-neutral-100 antialiased">
        <StructuredData />
        <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
        <div className="flex min-h-screen flex-col">
          <Header locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} locale={locale} />
        </div>
      </body>
    </html>
  );
}
