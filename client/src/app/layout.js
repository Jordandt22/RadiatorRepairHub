import { Inter, Oswald } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
import "./globals.css";

// Components
import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import BackToTop from "@/components/layout/BackToTop/BackToTop";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata = {
  title:
    "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services Near You",
  description:
    "RadiatorRepairHub helps you find trusted auto radiator repair shops near you. Browse by city, compare services, read reviews, and keep your car running cool. Connect with certified radiator repair specialists.",
  keywords:
    "radiator repair, auto radiator, car radiator, radiator service, cooling system repair, automotive repair, radiator replacement, car maintenance",
  authors: [{ name: "RadiatorRepairHub" }],
  creator: "RadiatorRepairHub",
  publisher: "RadiatorRepairHub",
  applicationName: "RadiatorRepairHub",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://radiatorrepairhub.com"),
  alternates: {
    canonical: "https://radiatorrepairhub.com",
  },
  openGraph: {
    title: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
    description:
      "Connect with certified radiator repair specialists in your area. Compare services, read reviews, and keep your vehicle running cool.",
    type: "website",
    locale: "en_US",
    url: "https://radiatorrepairhub.com",
    siteName: "RadiatorRepairHub",
    images: [
      {
        url: "https://radiatorrepairhub.com/assets/logos/logo.png",
        width: 1200,
        height: 630,
        alt: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
  other: {
    "apple-mobile-web-app-title": "RadiatorRepairHub",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "mobile-web-app-capable": "yes",
    "theme-color": "#2563eb",
    "msapplication-TileColor": "#2563eb",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://radiatorrepairhub.com/#organization",
    name: "RadiatorRepairHub",
    url: "https://radiatorrepairhub.com",
    logo: {
      "@type": "ImageObject",
      url: "https://radiatorrepairhub.com/assets/logos/logo.png",
      width: 200,
      height: 200,
    },
    description:
      "Find trusted auto radiator repair services near you. Connect with certified radiator repair specialists across the United States.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: process.env.BUSINESS_EMAIL,
      availableLanguage: "English",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    foundingDate: "2024",
    knowsAbout: [
      "Radiator Repair",
      "Auto Repair",
      "Cooling System Repair",
      "Automotive Services",
    ],
  };

  // WebSite Schema with SearchAction
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://radiatorrepairhub.com/#website",
    url: "https://radiatorrepairhub.com",
    name: "RadiatorRepairHub",
    description: "Find trusted auto radiator repair services near you",
    publisher: {
      "@id": "https://radiatorrepairhub.com/#organization",
    },
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate:
            "https://radiatorrepairhub.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    ],
    inLanguage: "en-US",
  };

  return (
    <html lang="en">
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        {/* Preload critical resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="//streetviewpixels-pa.googleapis.com" />

        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${oswald.variable} font-sans antialiased`}
      >
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}

        <Navbar />

        {children}

        <Footer />

        <BackToTop />

        <Toaster
          toastOptions={{
            style: {
              background: "transparent",
              boxShadow: "none",
            },
          }}
        />
      </body>
    </html>
  );
}
