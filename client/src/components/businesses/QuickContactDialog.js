"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { ToastProvider, useToast } from "@/contexts/ToastProvider";
import {
  ISSUE_LABEL_TO_ENUM,
  submitQuickContact,
} from "@/lib/api/contact-messages";

const ISSUE_OPTIONS = [
  "Overheating",
  "Coolant leak",
  "Radiator fan not working",
  "Strange noise or vibration",
  "Low/discolored coolant",
  "Radiator Replacement / Repair",
  "Routine Maintenance / Flush",
  "Other",
];

const INITIAL_FORM = {
  name: "",
  phone: "",
  email: "",
  vehicleModel: "",
  issue: null,
  urgency: "asap",
  additionalDetails: "",
};

/** US/Canada NANP: 10 digits, area + exchange start with 2–9. Allows optional leading 1. */
function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  const local =
    digits.length === 11 && digits.startsWith("1")
      ? digits.slice(1)
      : digits;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(local);
}

/** Practical email: local@domain with a real TLD (2+ letters). */
function isValidEmail(value) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(
    value
  );
}

function QuickContactDialogContent({
  businessId,
  businessName,
  trigger,
  triggerClassName,
  triggerLabel = "Quick Contact",
  showTriggerIcon = true,
  children,
}) {
  const { showCustomSuccess, showCustomError } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const next = {};
    const phone = form.phone.trim();
    const email = form.email.trim();

    if (!form.name.trim()) {
      next.name = "Name is required.";
    }

    if (!email) {
      next.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      next.email = "Please enter a valid email address.";
    }

    if (phone && !isValidPhone(phone)) {
      next.phone = "Enter a valid 10-digit phone number.";
    }

    if (!form.issue) {
      next.issue = "Please select a reason for contact.";
    }

    if (form.issue === "Other" && !form.additionalDetails.trim()) {
      next.additionalDetails =
        "Please describe your issue when selecting Other.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const issue = ISSUE_LABEL_TO_ENUM[form.issue];
      const { error } = await submitQuickContact({
        businessId: businessId || undefined,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        vehicleModel: form.vehicleModel.trim() || undefined,
        issue,
        urgency: form.urgency,
        additionalDetails: form.additionalDetails.trim() || undefined,
      });

      if (error) {
        const message =
          typeof error.message === "string"
            ? error.message
            : "Sorry, there was an error sending your message. Please try again.";
        showCustomError(message, "Message Failed");
        return;
      }

      setOpen(false);
      resetForm();
      showCustomSuccess(
        businessName
          ? `Sent to ${businessName}!`
          : "Your message was sent successfully!",
        "Message Sent Successfully"
      );
    } catch {
      showCustomError(
        "Sorry, there was an error sending your message. Please try again.",
        "Message Failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen) => {
    if (isSubmitting) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const detailsRequired = form.issue === "Other";
  const triggerElement =
    trigger ?? (
      <Button
        type="button"
        className={
          triggerClassName ??
          "w-full h-10 gap-2 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer hover:scale-95 transition-all duration-200"
        }
      />
    );
  const triggerContent =
    children ?? (
      <>
        {showTriggerIcon ? <Send className="size-4" /> : null}
        {triggerLabel}
      </>
    );

  const formButtonClassName =
    "cursor-pointer hover:scale-95 transition-all duration-200";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={triggerElement}>{triggerContent}</DialogTrigger>

      <DialogContent className="scrollbar-subtle sm:max-w-xl lg:max-w-2xl max-h-[min(90vh,44rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-4" />
            Quick Contact
          </DialogTitle>
          <DialogDescription>
            {businessName
              ? `Reach out to ${businessName}`
              : "Reach out about an issue you have"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
          <div className="grid gap-1.5">
            <label
              htmlFor="qc-name"
              className="text-sm font-medium text-foreground"
            >
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="qc-name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              aria-invalid={!!errors.name}
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="qc-email"
              className="text-sm font-medium text-foreground"
            >
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="qc-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              aria-invalid={!!errors.email}
              placeholder="example@gmail.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="qc-phone"
              className="text-sm font-medium text-foreground"
            >
              Phone{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              id="qc-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              aria-invalid={!!errors.phone}
              placeholder="(555) 123-4567"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Issue / Reason for Contact{" "}
              <span className="text-destructive">*</span>
            </label>
            <Combobox
              items={ISSUE_OPTIONS}
              value={form.issue}
              onValueChange={(value) => updateField("issue", value)}
              disabled={isSubmitting}
            >
              <ComboboxInput
                placeholder="Select an issue"
                className="w-full"
                aria-invalid={!!errors.issue}
                disabled={isSubmitting}
              />
              <ComboboxContent>
                <ComboboxEmpty>No matching issue.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {errors.issue && (
              <p className="text-xs text-destructive">{errors.issue}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="qc-vehicle"
              className="text-sm font-medium text-foreground"
            >
              Vehicle Model{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <Input
              id="qc-vehicle"
              name="vehicleModel"
              value={form.vehicleModel}
              onChange={(e) => updateField("vehicleModel", e.target.value)}
              placeholder="e.g. 2018 Honda Civic"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-foreground">
              Urgency <span className="text-destructive">*</span>
            </span>
            <RadioGroup
              value={form.urgency}
              onValueChange={(value) => updateField("urgency", value)}
              className="grid gap-2"
              disabled={isSubmitting}
            >
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="asap" />
                ASAP
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="can-wait" />
                Can Wait
              </label>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Your message will still be sent as soon as possible, this is for
              the shops.
            </p>
          </div>

          <div className="grid gap-1.5">
            <label
              htmlFor="qc-details"
              className="text-sm font-medium text-foreground"
            >
              Additional Details{" "}
              {detailsRequired ? (
                <span className="text-destructive">*</span>
              ) : (
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              )}
            </label>
            <Textarea
              id="qc-details"
              name="additionalDetails"
              value={form.additionalDetails}
              onChange={(e) =>
                updateField("additionalDetails", e.target.value)
              }
              aria-invalid={!!errors.additionalDetails}
              placeholder={
                detailsRequired
                  ? "Please describe your issue..."
                  : "Anything else the shop should know..."
              }
              rows={3}
              disabled={isSubmitting}
            />
            {errors.additionalDetails && (
              <p className="text-xs text-destructive">
                {errors.additionalDetails}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className={`px-8 ${formButtonClassName}`}
                  disabled={isSubmitting}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`gap-2 bg-blue-600 text-white hover:bg-blue-700 px-12 ${formButtonClassName}`}
            >
              <Send className="size-4" />
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function QuickContactDialog(props) {
  return (
    <ToastProvider>
      <QuickContactDialogContent {...props} />
    </ToastProvider>
  );
}
