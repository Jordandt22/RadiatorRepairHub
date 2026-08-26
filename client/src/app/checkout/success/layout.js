import { buildPageMetadata, NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  ...buildPageMetadata({
    title: "Featured checkout complete | RadiatorRepairHub",
    description:
      "Your Featured listing checkout is complete. Manage billing from Settings.",
    path: "/checkout/success",
  }),
  robots: NOINDEX_ROBOTS,
};

export default function CheckoutSuccessLayout({ children }) {
  return children;
}
