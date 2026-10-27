import Image from "next/image";
import Link from "next/link";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { getConfig } from "@/lib/config";
import { callLabel, telHref } from "@/lib/phone";

export function SiteHeader() {
  const { shop, brand } = getConfig();
  const logoSvg = brand.logoPath?.endsWith(".svg");

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95">
      <HeaderNav callHref={telHref(shop)} callText={callLabel(shop)}>
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-semibold text-ink no-underline transition-colors duration-200 hover:text-ink/75 hover:no-underline"
        >
          {brand.logoPath ? (
            <Image
              src={brand.logoPath}
              alt=""
              width={40}
              height={40}
              unoptimized={logoSvg}
              className="h-10 w-auto shrink-0"
              priority
            />
          ) : null}
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            {shop.name}
          </span>
        </Link>
      </HeaderNav>
    </header>
  );
}
