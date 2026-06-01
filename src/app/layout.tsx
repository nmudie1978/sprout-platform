import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-sans",
});

// Source Serif 4 — headings only (h1–h4). Inter remains the body face.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F5EF" },
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
      <body className={`${inter.variable} ${sourceSerif.variable} font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers session={session}>{children}</Providers>
        </NextIntlClientProvider>
        {/* Vercel observability — zero-config, no env vars needed.
            Only emits beacons in production on a Vercel deployment. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
