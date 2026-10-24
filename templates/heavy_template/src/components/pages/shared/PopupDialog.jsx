"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { easeOut } from "@/lib/motion";

const DURATION = 0.28;

/**
 * Top-layer dialog. The backdrop fades and the panel eases in; closing
 * plays the same motion back before unmounting.
 */
export function PopupDialog({ labelledBy, closeLabel, onClose, children }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const finishedRef = useRef(false);
  const reduced = useReducedMotion();
  const [closing, setClosing] = useState(false);

  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    if (!dialog) return;

    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onCancel = (event) => {
      event.preventDefault();
      requestClose();
    };
    dialog.addEventListener("cancel", onCancel);

    return () => {
      dialog.removeEventListener("cancel", onCancel);
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      if (trigger instanceof HTMLElement) trigger.focus();
    };
    // Mount once. Close is requested through requestClose, then the parent unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onCloseRef.current();
  }

  function requestClose() {
    if (finishedRef.current || closing) return;
    if (reduced) {
      finish();
      return;
    }
    setClosing(true);
  }

  const transition = { duration: reduced ? 0 : DURATION, ease: easeOut };

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 text-ink backdrop:bg-transparent"
      onClick={requestClose}
    >
      <div className="relative flex h-full items-center justify-center p-4 sm:p-8">
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          transition={transition}
        />
        <motion.button
          type="button"
          className="absolute top-4 right-4 z-10 inline-flex size-11 items-center justify-center rounded-btn border-2 border-ink/40 bg-bg text-ink transition-colors duration-200 hover:border-ink"
          aria-label={closeLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: closing ? 0 : 1 }}
          transition={transition}
          onClick={(event) => {
            event.stopPropagation();
            requestClose();
          }}
        >
          <X size={20} strokeWidth={2} aria-hidden />
        </motion.button>
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={closing ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
          transition={transition}
          onAnimationComplete={() => {
            if (closing) finish();
          }}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </motion.div>
      </div>
    </dialog>,
    document.body,
  );
}
