import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
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
  title: "VOCK | احجز سيتك في مدينة نصر",
  description: "استوديو VOCK — سيتات تصوير جاهزة في مدينة نصر، احجز باقتك أونلاين.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="ar" dir="rtl" className={`${body.variable} ${mono.variable}`}>
      <body className="bg-ink font-body text-neutral-100 antialiased">
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
