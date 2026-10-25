import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";
import { UtilityHeader } from "@/components/layout/UtilityHeader";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { JsonLd } from "@/components/layout/JsonLd";
import { BackToTop } from "@/components/layout/BackToTop";
import { StickyCallBar } from "@/components/layout/StickyCallBar";
import { getConfig } from "@/lib/config";
import { CHROME } from "@/lib/chrome";
import { seoKeywords, siteOrigin } from "@/lib/seo";
import "./globals.css";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const source = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-source",
  display: "swap",
});

const config = getConfig();

export const viewport = {
  viewportFit: "cover",
};

export const metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: config.seo.title,
    template: `%s`,
  },
  description: config.seo.description,
  keywords: seoKeywords(config),
  openGraph: {
    siteName: config.shop.name,
    locale: "en_US",
    type: "website",
  },
  icons: config.seo.favicon ? { icon: config.seo.favicon } : undefined,
};

export default function RootLayout({ children }) {
  const { brand, features } = config;
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${source.variable}`}
      data-theme={brand.theme ?? "dark"}
      style={{ "--accent": brand.accentColor }}
    >
      <body
        className={`${source.className} bg-bg text-ink font-body antialiased text-[1.0625rem] leading-[1.55] pb-16 md:pb-0`}
      >
        <JsonLd />
        <a
          className="absolute left-3 -top-12 z-50 bg-accent text-accent-ink px-4 py-2 no-underline focus:top-3"
          href="#content"
        >
          {CHROME.skip}
        </a>
        <div id="top">
          <UtilityHeader />
          <SiteHeader />
        </div>
        <main id="content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <StickyCallBar />
        {features?.showBackToTop ? <BackToTop /> : null}
      </body>
    </html>
  );
}
