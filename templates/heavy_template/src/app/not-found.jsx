import Link from "next/link";
import { PageCta } from "@/components/pages/shared/PageCta";
import { CHROME } from "@/lib/chrome";
import { getConfig } from "@/lib/config";
import { callLabel, telHref } from "@/lib/phone";
import { btnPrimary, btnRow, btnSecondary, h1, muted, section, wrap } from "@/lib/ui";

export default function NotFound() {
  const { shop } = getConfig();

  return (
    <>
      <section className={section}>
        <div className={`${wrap} flex flex-col items-center text-center`}>
          <p className="mb-2 text-2xl font-bold tracking-wide text-ink-muted uppercase">
            404
          </p>
          <h1 className={h1}>{CHROME.notFoundHeading}</h1>
          <p className={`${muted} mb-6 max-w-md`}>{CHROME.notFoundBody}</p>
          <div className={`${btnRow} justify-center`}>
            <Link className={btnSecondary} href="/">
              {CHROME.nav.home}
            </Link>
            <a className={btnPrimary} href={telHref(shop)}>
              {callLabel(shop)}
            </a>
          </div>
        </div>
      </section>
      <PageCta line={CHROME.ctaContact} />
    </>
  );
}
