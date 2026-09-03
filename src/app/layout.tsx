import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
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

// Editorial serif for the landing hero headline (normal + italic).
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#9BCCD4" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const SITE_NAME = "Endeavrly";
const SITE_TAGLINE = "Endeavrly — See your possible future";
const SITE_DESCRIPTION =
  "Endeavrly helps young people explore careers, understand realistic pathways, and build clarity about their future. See your possible future before you commit to it.";

/**
 * `metadataBase` is what makes every relative image and canonical URL in the
 * app resolve to an absolute one. Without it Next cannot build the absolute
 * og:image URL that link unfurlers require, so previews silently stay blank.
 * Read from the environment so preview deployments advertise themselves rather
 * than the production domain.
 */
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://endeavrly.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_TAGLINE,
    // Pages that set their own title get "<page> — Endeavrly" rather than
    // every tab in the browser reading identically.
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // The site is shared far more than it is searched — a young person sends the
  // link to a friend. These tags are what turn that into a real preview card
  // instead of a bare URL. The image itself is ./opengraph-image.tsx.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
  },
  // No upper age limit and no adult content, but the audience starts at 15 —
  // declare the site as suitable for general audiences rather than leaving
  // classifiers to guess.
  other: { rating: "general" },
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
      <body className={`${inter.variable} ${dmSerif.variable} font-sans`}>
        {/* Skip link — first focusable element, visible only on keyboard
            focus. Lets keyboard / screen-reader users jump past the nav
            straight to the page's main content (WCAG 2.4.1). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
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
