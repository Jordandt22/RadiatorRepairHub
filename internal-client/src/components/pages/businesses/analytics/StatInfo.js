"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const infoButtonClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export default function StatInfo({ label, description }) {
  const [open, setOpen] = useState(false);

  if (!description) return null;

  return (
    <>
      <div className="hidden md:block">
        <Tooltip>
          <TooltipTrigger
            type="button"
            className={infoButtonClass}
            aria-label={`About ${label}`}
          >
            <Info className="size-3.5" aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="end"
            className="max-w-xs px-3 py-2 text-left whitespace-normal"
          >
            {description}
          </TooltipContent>
        </Tooltip>
      </div>

      <button
        type="button"
        className={`${infoButtonClass} md:hidden`}
        aria-label={`About ${label}`}
        onClick={() => setOpen(true)}
      >
        <Info className="size-3.5" aria-hidden="true" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Close
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
