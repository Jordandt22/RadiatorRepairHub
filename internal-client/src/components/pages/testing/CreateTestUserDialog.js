"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTestUser } from "@/lib/api/testing";

function generateEmail() {
  return `test+${Date.now()}@radiatorrepairhub.com`;
}

function generatePassword() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `Test!${hex}`;
}

function CopyField({ id, label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input id={id} value={value} readOnly className="font-mono text-sm" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCopy}
          className="shrink-0 cursor-pointer rounded-full"
          aria-label={`Copy ${label}`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
    </div>
  );
}

export default function CreateTestUserDialog({
  open,
  onOpenChange,
  accessToken,
  onCreated,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    if (!open) return;
    setEmail(generateEmail());
    setPassword(generatePassword());
    setSubmitError(null);
    setCreated(null);
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = await createTestUser({
        accessToken,
        body: { email, password },
      });
      if (result.error || !result.data) {
        const message = result.error?.message;
        setSubmitError(
          typeof message === "string"
            ? message
            : message
              ? Object.values(message)[0]
              : "Unable to create test user.",
        );
        return;
      }
      setCreated(result.data);
      onCreated?.(result.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>Create test user</DialogTitle>
          <DialogDescription>
            {created
              ? "Copy these credentials now. The password is not stored here after you close this dialog."
              : "Prefills a unique email and strong password. Edit them if you want, then create the account."}
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <div className="grid gap-4">
            <CopyField id="created-test-email" label="Email" value={created.email} />
            <CopyField
              id="created-test-password"
              label="Password"
              value={created.password}
            />
            <DialogFooter>
              <Button
                type="button"
                className="cursor-pointer rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="test-user-email">Email</Label>
              <Input
                id="test-user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="test-user-password">Password</Label>
              <Input
                id="test-user-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Must include uppercase, lowercase, a number, and a symbol.
              </p>
            </div>
            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                className="cursor-pointer rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="cursor-pointer rounded-full"
              >
                {submitting ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
