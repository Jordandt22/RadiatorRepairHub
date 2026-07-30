import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import BusinessClaimedBadge from "@/components/pages/businesses/BusinessClaimedBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-border py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default function BusinessDrawer({ business, open, onOpenChange }) {
  const businessUrl =
    business?.slug && process.env.NEXT_PUBLIC_WEB_URL
      ? `${process.env.NEXT_PUBLIC_WEB_URL}/business/${business.slug}`
      : null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{business?.title || "Business"}</DrawerTitle>
          <DrawerDescription>Business listing details</DrawerDescription>
        </DrawerHeader>

        {business ? (
          <div className="flex-1 overflow-y-auto px-4">
            <dl>
              <DetailRow label="Business">
                {business.title ? (
                  businessUrl ? (
                    <a
                      href={businessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      {business.title}
                    </a>
                  ) : (
                    business.title
                  )
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Slug">
                {business.slug ? `/business/${business.slug}` : "—"}
              </DetailRow>
              <DetailRow label="Address">{business.address || "—"}</DetailRow>
              <DetailRow label="Phone">{business.phone || "—"}</DetailRow>
              <DetailRow label="Email">
                {business.email ? (
                  <a
                    href={`mailto:${business.email}`}
                    className="underline underline-offset-2"
                  >
                    {business.email}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Website">
                {business.website ? (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all underline underline-offset-2"
                  >
                    {business.website}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Claimed">
                <BusinessClaimedBadge
                  isClaimed={Boolean(business.is_claimed)}
                />
              </DetailRow>
              <DetailRow label="Owner UID">
                {business.owner_uid ? (
                  <span className="break-all font-mono text-xs">
                    {business.owner_uid}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Last edited">
                {formatFullDate(business.last_edited_at)}
              </DetailRow>
              <DetailRow label="Created">
                {formatFullDate(business.created_at)}
              </DetailRow>
              <DetailRow label="Place ID">
                {business.place_id ? (
                  <span className="break-all font-mono text-xs">
                    {business.place_id}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Business ID">
                <span className="break-all font-mono text-xs">
                  {business.id}
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
