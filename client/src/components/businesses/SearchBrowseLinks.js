import Link from "next/link";
import {
  SEARCH_DIRECTORY_LINKS,
  SEARCH_POPULAR_CITY_LINKS,
  SEARCH_POPULAR_STATE_LINKS,
} from "@/lib/data/searchBrowseLinks";

const chipClassName =
  "inline-flex rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-interactive hover:border-white/40 hover:bg-white/15";

function LinkGroup({ label, links, className }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      <span className="text-sm font-medium text-white/60">{label}</span>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={chipClassName}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export default function SearchBrowseLinks() {
  return (
    <nav
      aria-label="Browse radiator repair by location and category"
      className="mt-6 space-y-3 border-t border-white/15 pt-6"
    >
      <LinkGroup label="Browse:" links={SEARCH_DIRECTORY_LINKS} />
      <LinkGroup
        label="Popular states:"
        links={SEARCH_POPULAR_STATE_LINKS}
        className="hidden md:flex"
      />
      <LinkGroup label="Popular cities:" links={SEARCH_POPULAR_CITY_LINKS} />
    </nav>
  );
}
