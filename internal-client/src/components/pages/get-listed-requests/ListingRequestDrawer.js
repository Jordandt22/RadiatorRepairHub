import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import ListingRequestStatusBadge from "@/components/pages/get-listed-requests/ListingRequestStatusBadge";
import { formatFullDate } from "@/components/pages/dashboard/formatDate";

function DetailRow({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-border py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default function ListingRequestDrawer({ request, open, onOpenChange }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {request?.business_name || "Listing request"}
          </DrawerTitle>
          <DrawerDescription>Get Listed request details</DrawerDescription>
        </DrawerHeader>

        {request ? (
          <div className="flex-1 overflow-y-auto px-4">
            <dl>
              <DetailRow label="Business name">
                {request.business_name || "—"}
              </DetailRow>
              <DetailRow label="Email">
                {request.email ? (
                  <a
                    href={`mailto:${request.email}`}
                    className="underline underline-offset-2"
                  >
                    {request.email}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Phone">{request.phone || "—"}</DetailRow>
              <DetailRow label="Google listing">
                {request.google_maps_url ? (
                  <a
                    href={request.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all underline underline-offset-2"
                  >
                    {request.google_maps_url}
                  </a>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Place ID">
                {request.place_id ? (
                  <span className="break-all font-mono text-xs">
                    {request.place_id}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>
              <DetailRow label="Status">
                <ListingRequestStatusBadge status={request.status} />
              </DetailRow>
              <DetailRow label="Notes">
                <p className="whitespace-pre-wrap">{request.message || "—"}</p>
              </DetailRow>
              <DetailRow label="Created">
                {formatFullDate(request.created_at)}
              </DetailRow>
              <DetailRow label="Resolved at">
                {formatFullDate(request.resolved_at)}
              </DetailRow>
              <DetailRow label="Resolved by">
                {request.resolved_by || "—"}
              </DetailRow>
              <DetailRow label="Live email sent">
                {formatFullDate(request.live_email_sent_at)}
              </DetailRow>
              <DetailRow label="Request ID">
                <span className="break-all font-mono text-xs">
                  {request.listing_request_id}
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
