"use client";

import CountUp from "@/components/ui/CountUp";

export default function HeroStatBox({ label, value, heroInView }) {
  const count = Number(value) || 0;

  return (
    <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur-sm">
      <p className="text-2xl font-semibold tabular-nums text-white md:text-3xl">
        <CountUp
          to={count}
          from={0}
          duration={1.6}
          separator=","
          startWhen={heroInView}
          className="font-semibold text-white"
        />
      </p>
      <p className="mt-1 text-xs font-medium tracking-wide text-white/75 uppercase md:text-sm">
        {label}
      </p>
    </div>
  );
}
