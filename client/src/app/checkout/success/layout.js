import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  title: "Checkout complete | RadiatorRepairHub",
  description: "Your Featured listing upgrade is being applied.",
  robots: NOINDEX_ROBOTS,
};

export default function CheckoutSuccessLayout({ children }) {
  return children;
}
