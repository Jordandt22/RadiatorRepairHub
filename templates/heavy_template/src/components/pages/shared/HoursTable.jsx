import { hoursRows, todayDayKey } from "@/lib/hours";

export function HoursTable({
  hours,
  hightlightClass = "bg-accent/15 text-accent",
}) {
  const today = todayDayKey(hours);

  return (
    <table className="mt-4 w-full border-separate border-spacing-0 font-medium tabular-nums">
      <tbody>
        {hoursRows(hours).map((row) => {
          const isToday = row.key === today;
          const tone = isToday
            ? `${hightlightClass} group-hover:brightness-110`
            : "group-hover:bg-white/8";
          return (
            <tr
              key={row.key}
              className={`group transition-all duration-200 hover:scale-[1.02] ${isToday ? "font-semibold" : ""}`}
              aria-current={isToday ? "date" : undefined}
            >
              <th
                scope="row"
                className={`border-b border-line px-2 py-1.5 text-left font-medium transition-all duration-200 group-hover:rounded-l-md ${tone}`}
              >
                {row.label}
              </th>
              <td
                className={`border-b border-line px-2 py-1.5 text-right transition-all duration-200 group-hover:rounded-r-md ${tone}`}
              >
                {row.value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
