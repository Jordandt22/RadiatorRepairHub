import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  IssueBadge,
  StatusBadge,
  UrgencyBadge,
} from "@/components/pages/dashboard/ContactMessageBadges";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default function ContactMessageDrawer({ message, open, onOpenChange }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{message?.name || "Contact message"}</DrawerTitle>
          <DrawerDescription>Contact message details</DrawerDescription>
        </DrawerHeader>

        {message ? (
          <div className="flex-1 overflow-y-auto px-4">
            <dl>
              <DetailRow label="Name">{message.name}</DetailRow>
              <DetailRow label="Email">
                <a
                  href={`mailto:${message.email}`}
                  className="underline underline-offset-2"
                >
                  {message.email}
                </a>
              </DetailRow>
              <DetailRow label="Phone">{message.phone || "—"}</DetailRow>
              <DetailRow label="Vehicle">{message.vehicle || "—"}</DetailRow>
              <DetailRow label="Business">
                {message.business?.title ? (
                  message.business.slug ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_WEB_URL}/business/${message.business.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      {message.business.title}
                    </a>
                  ) : (
                    message.business.title
                  )
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Issue">
                <IssueBadge issue={message.issue} />
              </DetailRow>
              <DetailRow label="Urgency">
                <UrgencyBadge urgency={message.urgency} />
              </DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={message.status} />
              </DetailRow>
              <DetailRow label="Additional details">
                <p className="whitespace-pre-wrap">
                  {message.additional_details || "—"}
                </p>
              </DetailRow>
              <DetailRow label="Created">
                {formatFullDate(message.created_at)}
              </DetailRow>
              <DetailRow label="Sent at">
                {formatFullDate(message.sent_at)}
              </DetailRow>
              <DetailRow label="Message ID">
                <span className="break-all font-mono text-xs">
                  {message.contact_message_id}
                </span>
              </DetailRow>
              {message.business_id ? (
                <DetailRow label="Business ID">
                  <span className="break-all font-mono text-xs">
                    {message.business_id}
                  </span>
                </DetailRow>
              ) : null}
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
