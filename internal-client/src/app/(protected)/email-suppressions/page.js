import { Suspense } from "react";
import EmailSuppressionsPageContent from "@/components/pages/email-suppressions/EmailSuppressionsPageContent";

export default function EmailSuppressionsPage() {
  return (
    <Suspense fallback={null}>
      <EmailSuppressionsPageContent />
    </Suspense>
  );
}
