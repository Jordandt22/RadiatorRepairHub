import { hoursRows, todayDayKey } from "@/lib/hours";

export function HoursTable({
  hours,
  hightlightClass = "bg-accent/15 text-accent",
}) {
  const today = todayDayKey(hours);

  return (
    <table className="mt-4 w-full border-collapse font-medium tabular-nums">
      <tbody>
        {hoursRows(hours).map((row) => {
          const isToday = row.key === today;
          return (
            <tr
              key={row.key}
              className={`hover:scale-[1.02] transition-transform duration-200${isToday ? ` ${hightlightClass} font-semibold` : ""}`}
              aria-current={isToday ? "date" : undefined}
            >
              <th
                scope="row"
                className="border-b border-line px-2 py-1.5 text-left font-medium"
              >
                {row.label}
              </th>
              <td className="border-b border-line px-2 py-1.5 text-right">
                {row.value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
