"use client";

import CountUp from "@/components/ui/CountUp";

export default function BusinessCount({ count, className = "" }) {
  const n = Number(count) || 0;
  const label = n === 1 ? "Business" : "Businesses";

  return (
    <>
      <CountUp
        to={n}
        from={0}
        duration={1.4}
        separator=","
        className={`font-semibold text-green-700 ${className}`.trim()}
      />{" "}
      {label}
    </>
  );
}
