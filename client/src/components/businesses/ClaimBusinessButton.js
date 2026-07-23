"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToastProvider, useToast } from "@/contexts/ToastProvider";
import { claimBusiness } from "@/lib/api/businesses";

function ClaimStatusLabel({ children }) {
  return (
    <p className="mt-3 text-center text-sm font-medium text-gray-500">
      {children}
    </p>
  );
}

function ClaimBusinessButtonContent({ businessId }) {
  const { showCustomError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");

  const handleClaim = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await claimBusiness(businessId);

      if (error) {
        showCustomError(
          typeof error.message === "string"
            ? error.message
            : "Unable to start the claim process. Please try again."
        );
        return;
      }

      setMaskedEmail(data?.maskedEmail || "");
      setSuccessOpen(true);
    } catch {
      showCustomError("Unable to start the claim process. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full rounded-full gap-2 text-sm font-medium border-2 border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
        disabled={isSubmitting}
        onClick={handleClaim}
      >
        <BadgeCheck className="size-4" />
        {isSubmitting ? "Sending..." : "Claim"}
      </Button>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check your inbox</DialogTitle>
            <DialogDescription>
              We&apos;ve sent a verification code to{" "}
              {maskedEmail || "the email"} on file for this business. Check your
              inbox and click the link to complete your claim.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button type="button" className="w-full sm:w-auto bg-blue-500 px-8 hover:bg-blue-600 hover:scale-95" />}
            >
              Got it
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ClaimBusinessButton({
  businessId,
  email,
  isClaimed = false,
}) {
  if (isClaimed) {
    return <ClaimStatusLabel>Claimed</ClaimStatusLabel>;
  }

  const hasEmail =
    typeof email === "string" ? Boolean(email.trim()) : Boolean(email);

  if (!hasEmail) {
    return <ClaimStatusLabel>Unclaimable</ClaimStatusLabel>;
  }

  return (
    <ToastProvider>
      <ClaimBusinessButtonContent businessId={businessId} />
    </ToastProvider>
  );
}
