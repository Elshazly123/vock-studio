import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import StructuredData from "@/components/StructuredData";
import { getSettings } from "@/lib/settings";

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vock-studio-xqfk.vercel.app"),
  title: {
    default: "VOCK | احجز سيتك في مدينة نصر",
    template: "%s | VOCK",
  },
  description: "استوديو VOCK في مدينة نصر — سيتات تصوير جاهزة (بودكاست، ريلز، فوتوغرافي)، احجز باقتك أونلاين بديبوزيت بسيط.",
  keywords: ["استوديو تصوير", "مدينة نصر", "استوديو بودكاست", "تصوير ريلز", "حجز استوديو", "VOCK"],
  openGraph: {
    title: "VOCK | استوديو تصوير في مدينة نصر",
    description: "سيتات تصوير جاهزة — بودكاست، ريلز، فوتوغرافي. احجز أونلاين في دقايق.",
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VOCK | استوديو تصوير في مدينة نصر",
    description: "سيتات تصوير جاهزة — احجز أونلاين في دقايق.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="ar" dir="rtl" className={`${body.variable} ${mono.variable}`}>
      <body className="bg-ink font-body text-neutral-100 antialiased">
        <StructuredData />
        <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
        </div>
      </body>
    </html>
  );
}
