"use client";

import { useEffect, useId, useState } from "react";
import { CHROME } from "@/lib/chrome";
import { btnSecondary } from "@/lib/ui";
import { PopupDialog } from "@/components/pages/shared/PopupDialog";

function QrDialog({ url, onClose }) {
  const titleId = useId();
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((qr) => {
      const toDataURL = qr.toDataURL || qr.default?.toDataURL;
      if (!toDataURL) return;
      toDataURL(url, { margin: 1, width: 320, errorCorrectionLevel: "M" }).then((next) => {
        if (!cancelled) setDataUrl(next);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <PopupDialog labelledBy={titleId} closeLabel={CHROME.closeQr} onClose={onClose}>
      <div className="w-full max-w-sm border border-line bg-surface p-6 text-center">
        <h2 id={titleId} className="text-2xl font-bold text-ink">
          {CHROME.leaveReview}
        </h2>
        <p className="mt-1 mb-4 text-sm text-ink-muted">
          A review would go a long way in helping us improve our services and allow us to help more people!
        </p>
        <div className="mx-auto flex size-64 items-center justify-center bg-white p-3">
          {dataUrl ? (
            <img src={dataUrl} alt={CHROME.scanToReview} className="size-full" />
          ) : (
            <p className="m-0 text-sm text-neutral">{CHROME.scanToReview}</p>
          )}
        </div>
        <p className="mt-4 mb-0 text-sm text-ink-muted">{CHROME.scanToReview}</p>
      </div>
    </PopupDialog>
  );
}

export function ReviewQrButton({ url }) {
  const [open, setOpen] = useState(false);

  if (!url) return null;

  return (
    <>
      <button type="button" className={`${btnSecondary} shrink-0`} onClick={() => setOpen(true)}>
        {CHROME.showQr}
      </button>
      {open ? <QrDialog url={url} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
