import { Suspense } from "react";
import CheckoutSuccessContent from "@/components/checkout/CheckoutSuccessContent";
import PageHeader from "@/components/layout/Header/PageHeader";

function CheckoutSuccessFallback() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Checkout", url: "/checkout/success" },
        ]}
        pageTitle="Confirming your upgrade"
        pageDescription="Thanks for upgrading. We’re confirming payment with Stripe and applying Featured placement—this usually takes a few seconds."
      />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
