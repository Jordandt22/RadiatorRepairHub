"use client";

import { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function escapePrintText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function printDocumentHtml(dataUrl, shopTitle) {
  const title = escapePrintText(
    shopTitle ? `${shopTitle} review code` : "Review code"
  );
  const caption = escapePrintText(
    shopTitle ? `Scan to review ${shopTitle}` : "Scan to leave a review"
  );
  const imageSrc = escapePrintText(dataUrl);
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
    <style>
      body { font-family: sans-serif; text-align: center; margin: 48px; }
      img { width: 280px; height: 280px; }
      p { margin-top: 16px; font-size: 18px; }
    </style>
  </head>
  <body>
    <img src="${imageSrc}" alt="" />
    <p>${caption}</p>
  </body>
</html>`;
}

function printQrCode(dataUrl, shopTitle) {
  const html = printDocumentHtml(dataUrl, shopTitle);
  const popup = window.open("", "_blank");
  if (popup) {
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.focus();
    popup.print();
    return;
  }

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  document.body.appendChild(frame);
  const frameWindow = frame.contentWindow;
  if (!frameWindow) {
    frame.remove();
    return;
  }
  frameWindow.addEventListener("afterprint", () => frame.remove(), { once: true });
  frameWindow.document.open();
  frameWindow.document.write(html);
  frameWindow.document.close();
  frameWindow.focus();
  frameWindow.print();
}

export default function ReviewQrCode({ reviewUrl, shopTitle }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!reviewUrl) {
      setDataUrl("");
      return undefined;
    }
    let cancelled = false;
    import("qrcode").then((qr) => {
      const toDataURL = qr.toDataURL || qr.default?.toDataURL;
      if (!toDataURL) return;
      toDataURL(reviewUrl, {
        margin: 1,
        width: 320,
        errorCorrectionLevel: "M",
      }).then((url) => {
        if (!cancelled) setDataUrl(url);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [reviewUrl]);

  if (!reviewUrl) {
    return (
      <p className="text-sm text-muted-foreground">
        A review code is unavailable until this listing has a Google place ID.
      </p>
    );
  }

  const fileName = `${(shopTitle || "review").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-review-code.png`;

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex size-52 items-center justify-center rounded-lg border border-border bg-white p-3">
        {dataUrl ? (
          <img src={dataUrl} alt={`QR code to review ${shopTitle || "this shop"}`} className="size-full" />
        ) : (
          <p className="text-sm text-muted-foreground">Preparing code…</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!dataUrl}
          onClick={() => printQrCode(dataUrl, shopTitle)}
        >
          <Printer aria-hidden="true" />
          Print
        </Button>
        <a
          href={dataUrl || undefined}
          download={fileName}
          className={cn(
            buttonVariants({ variant: "outline" }),
            !dataUrl && "pointer-events-none opacity-50"
          )}
          aria-disabled={!dataUrl}
        >
          <Download aria-hidden="true" />
          Download
        </a>
      </div>
    </div>
  );
}
