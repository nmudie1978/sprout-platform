import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#DADEE2" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: "Endeavrly — See your possible future",
  description: "Endeavrly helps young people explore careers, understand realistic pathways, and build clarity about their future. See your possible future before you commit to it.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, messages, session] = await Promise.all([
    getLocale(),
    getMessages(),
    getServerSession(authOptions),
  ]);

  return (
    // className="dark" on <html> guarantees the very first paint is
    // dark mode — sign-in, every server-rendered page, and the flash
    // before next-themes hydrates. next-themes will swap the class
    // only if the user has explicitly opted into light via the toggle.
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers session={session}>{children}</Providers>
        </NextIntlClientProvider>
        {/* No analytics / tracking beacons. The Cookie Policy promises no
            third-party analytics and consent-before-any-future-analytics;
            Vercel <Analytics/> + <SpeedInsights/> were removed to honour
            that (a regulator-visible contradiction on a minors' service). */}
      </body>
    </html>
  );
}
