"use client";

import CountUp from "@/components/ui/CountUp";

export default function HeroStatBox({
  label,
  value,
  heroInView,
  live = false,
}) {
  const count = Number(value) || 0;

  return (
    <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
      <p className="inline-flex items-center justify-center gap-2 text-2xl font-semibold tabular-nums text-white md:text-3xl">
        {live ? (
          <span
            className="relative flex size-2.5 shrink-0"
            title="Updated hourly"
            aria-hidden="true"
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
        ) : null}
        <CountUp
          to={count}
          from={0}
          duration={1.6}
          separator=","
          startWhen={heroInView}
          className="font-semibold text-white"
        />
        {live ? <span className="sr-only">Live, updated hourly</span> : null}
      </p>
      <p className="mt-1 text-xs font-medium tracking-wide text-white/75 uppercase md:text-sm">
        {label}
      </p>
    </div>
  );
}
