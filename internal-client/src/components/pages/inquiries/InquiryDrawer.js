import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import InquiryStatusBadge from "@/components/pages/inquiries/InquiryStatusBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-border py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default function InquiryDrawer({ inquiry, open, onOpenChange }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{inquiry?.name || "Contact inquiry"}</DrawerTitle>
          <DrawerDescription>Contact inquiry details</DrawerDescription>
        </DrawerHeader>

        {inquiry ? (
          <div className="flex-1 overflow-y-auto px-4">
            <dl>
              <DetailRow label="Name">{inquiry.name || "—"}</DetailRow>
              <DetailRow label="Email">
                {inquiry.email ? (
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="underline underline-offset-2"
                  >
                    {inquiry.email}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Phone">{inquiry.phone || "—"}</DetailRow>
              <DetailRow label="Subject">{inquiry.subject || "—"}</DetailRow>
              <DetailRow label="Status">
                <InquiryStatusBadge status={inquiry.status} />
              </DetailRow>
              <DetailRow label="Message">
                <p className="whitespace-pre-wrap">{inquiry.message || "—"}</p>
              </DetailRow>
              <DetailRow label="Created">
                {formatFullDate(inquiry.created_at)}
              </DetailRow>
              <DetailRow label="Resolved at">
                {formatFullDate(inquiry.resolved_at)}
              </DetailRow>
              <DetailRow label="Resolved by">
                {inquiry.resolved_by || "—"}
              </DetailRow>
              <DetailRow label="Inquiry ID">
                <span className="break-all font-mono text-xs">
                  {inquiry.contact_inquiry_id}
                </span>
              </DetailRow>
            </dl>
          </div>
        ) : null}

        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
