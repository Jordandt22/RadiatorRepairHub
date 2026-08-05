import { ImageIcon } from "lucide-react";

export default function UploadPhotosEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <ImageIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No upload jobs</p>
        <p className="text-sm text-muted-foreground">
          Start an upload to pull Google Place photos into Cloudinary for
          businesses that are not yet on the CDN.
        </p>
      </div>
    </div>
  );
}
