import { Inter, Oswald } from "next/font/google";
import "./globals.css";

// Components
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

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
  openGraph: {
    title: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
    description:
      "Connect with certified radiator repair specialists in your area. Compare services, read reviews, and keep your vehicle running cool.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
    description:
      "Connect with certified radiator repair specialists in your area. Compare services, read reviews, and keep your vehicle running cool.",
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${oswald.variable} font-sans antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
