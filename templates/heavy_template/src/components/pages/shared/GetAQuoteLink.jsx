import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CHROME } from "@/lib/chrome";

export function GetAQuoteLink({ className = "" }) {
  return (
    <Link className={`${className} gap-2`.trim()} href="/contact">
      {CHROME.getAQuote}
      <ArrowRight size={18} strokeWidth={2} aria-hidden />
    </Link>
  );
}
