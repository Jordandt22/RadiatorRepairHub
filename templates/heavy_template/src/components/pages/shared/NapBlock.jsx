import { getConfig } from "@/lib/config";
import { mapsHref } from "@/lib/maps";
import { phoneDisplay, telHref } from "@/lib/phone";

export function NapBlock() {
  const config = getConfig();
  const { shop } = config;
  return (
    <address className="m-0 whitespace-pre-line not-italic">
      <span className="inline-block text-2xl font-bold mb-1">{shop.name}</span>
      {"\n"}
      <a
        href={mapsHref(config)}
        rel="noopener noreferrer"
        target="_blank"
        className="inline-block hover:underline mb-3"
      >
        {shop.address}
        {"\n"}
        {`${shop.city}, ${shop.state} ${shop.zip}`}
      </a>
      {"\n"}
      <a href={telHref(shop)} className="inline-block hover:underline mb-3">
        {phoneDisplay(shop)}
      </a>
    </address>
  );
}
