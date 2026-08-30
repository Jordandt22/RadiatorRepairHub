"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/contexts/ToastProvider";
import BusinessSectionHeader from "@/components/businesses/BusinessSectionHeader";
import OpenStatus from "@/components/businesses/status/OpenStatus";
import { updateBusinessHours } from "@/lib/api/businessHoursUpdate";
import {
  WEEKDAYS,
  HOUR_12_OPTIONS,
  MINUTE_OPTIONS,
  PERIOD_OPTIONS,
  daysEqual,
  joinTimeParts,
  normalizeIncomingHours,
  parseTimeToMinutes,
  splitTimeParts,
} from "@/lib/businessHoursFormat";

const DEFAULT_OPEN = "09:00";
const DEFAULT_CLOSE = "17:00";

const selectClassName =
  "rounded-md border border-border bg-white px-2 py-1.5 text-sm disabled:cursor-not-allowed disabled:bg-muted";

function mapApiErrors(error) {
  const message = error?.message;
  if (message && typeof message === "object" && !Array.isArray(message)) {
    if (typeof message.days === "string") return { form: message.days };
    return { form: "Unable to update business hours." };
  }
  if (typeof message === "string") return { form: message };
  return { form: "Unable to update business hours." };
}

function TimePartSelects({ idPrefix, label, value, disabled, onChange }) {
  const parts = splitTimeParts(value);

  const updatePart = (key, nextValue) => {
    onChange(
      joinTimeParts({
        ...parts,
        [key]:
          key === "minute" || key === "hour12" ? Number(nextValue) : nextValue,
      })
    );
  };

  return (
    <div className="inline-flex items-center gap-1">
      <label className="sr-only" htmlFor={`${idPrefix}-hour`}>
        {label} hour
      </label>
      <select
        id={`${idPrefix}-hour`}
        value={parts.hour12}
        disabled={disabled}
        onChange={(e) => updatePart("hour12", e.target.value)}
        className={selectClassName}
      >
        {HOUR_12_OPTIONS.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span className="text-sm text-muted-foreground" aria-hidden>
        :
      </span>
      <label className="sr-only" htmlFor={`${idPrefix}-minute`}>
        {label} minute
      </label>
      <select
        id={`${idPrefix}-minute`}
        value={parts.minute}
        disabled={disabled}
        onChange={(e) => updatePart("minute", e.target.value)}
        className={selectClassName}
      >
        {MINUTE_OPTIONS.map((minute) => (
          <option key={minute} value={minute}>
            {String(minute).padStart(2, "0")}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor={`${idPrefix}-period`}>
        {label} AM or PM
      </label>
      <select
        id={`${idPrefix}-period`}
        value={parts.period}
        disabled={disabled}
        onChange={(e) => updatePart("period", e.target.value)}
        className={selectClassName}
      >
        {PERIOD_OPTIONS.map((period) => (
          <option key={period} value={period}>
            {period}
          </option>
        ))}
      </select>
    </div>
  );
}

function DayHoursDisplay({ hours }) {
  if (!hours || !Array.isArray(hours) || hours.length === 0) {
    return <p className="text-sm text-muted-foreground">Hours not available</p>;
  }

  return (
    <div className="space-y-2">
      {WEEKDAYS.map((dayName) => {
        const day = hours.find((item) => item.day_of_week === dayName);
        return (
          <div key={dayName} className="flex justify-between text-sm">
            <span className="font-medium text-foreground">{dayName}</span>
            <div className="text-right text-muted-foreground">
              {!day || day.is_closed ? (
                <span>Closed</span>
              ) : day.hours_text ? (
                day.hours_text.split(",").map((period, index) => (
                  <div key={`${dayName}-${index}`}>{period.trim()}</div>
                ))
              ) : (
                <span>Not Available</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BusinessHoursSectionContent({
  businessId,
  hours: initialHours = [],
  timezone,
}) {
  const router = useRouter();
  const { showCustomSuccess } = useToast();
  const initialDays = useMemo(
    () => normalizeIncomingHours(initialHours),
    [initialHours]
  );

  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(initialDays);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDays(initialDays);
    setErrors({});
  }, [open, initialDays]);

  const hasChanges = !daysEqual(days, initialDays);
  const saveDisabled = isSubmitting || !hasChanges;

  const clearErrors = () => {
    setErrors((prev) => {
      if (!prev.form && !prev.days) return prev;
      const next = { ...prev };
      delete next.form;
      delete next.days;
      return next;
    });
  };

  const updateDay = (dayOfWeek, updater) => {
    setDays((prev) =>
      prev.map((day) => (day.day_of_week === dayOfWeek ? updater(day) : day))
    );
    clearErrors();
  };

  const setClosed = (dayOfWeek, isClosed) => {
    updateDay(dayOfWeek, (day) => {
      if (isClosed) {
        return { ...day, is_closed: true, hours: [] };
      }
      return {
        ...day,
        is_closed: false,
        hours:
          day.hours?.length > 0
            ? day.hours
            : [{ open: DEFAULT_OPEN, close: DEFAULT_CLOSE }],
      };
    });
  };

  const setPeriodField = (dayOfWeek, periodIndex, field, value) => {
    updateDay(dayOfWeek, (day) => {
      const hours = [...(day.hours || [])];
      hours[periodIndex] = { ...hours[periodIndex], [field]: value };
      return { ...day, hours };
    });
  };

  const addPeriod = (dayOfWeek) => {
    updateDay(dayOfWeek, (day) => {
      if (day.is_closed || (day.hours?.length || 0) >= 2) return day;
      const previousClose =
        day.hours?.[day.hours.length - 1]?.close || DEFAULT_OPEN;
      const openMinutes = parseTimeToMinutes(previousClose) ?? 9 * 60;
      const closeMinutes = Math.min(openMinutes + 60, 23 * 60 + 45);
      const toTime = (total) => {
        const h = String(Math.floor(total / 60)).padStart(2, "0");
        const m = String(total % 60).padStart(2, "0");
        return `${h}:${m}`;
      };
      const open = toTime(openMinutes);
      const close =
        closeMinutes > openMinutes
          ? toTime(closeMinutes)
          : toTime(Math.min(openMinutes + 15, 23 * 60 + 45));
      return {
        ...day,
        hours: [...(day.hours || []), { open, close }],
      };
    });
  };

  const removePeriod = (dayOfWeek, periodIndex) => {
    updateDay(dayOfWeek, (day) => {
      const hours = (day.hours || []).filter((_, index) => index !== periodIndex);
      if (hours.length === 0) {
        return { ...day, is_closed: true, hours: [] };
      }
      return { ...day, hours };
    });
  };

  const validate = () => {
    const dayErrors = {};
    for (const day of days) {
      if (day.is_closed) continue;
      if (!day.hours?.length) {
        dayErrors[day.day_of_week] = "Add at least one open/close time.";
        continue;
      }
      for (const period of day.hours) {
        const open = parseTimeToMinutes(period.open);
        const close = parseTimeToMinutes(period.close);
        if (open == null || close == null || close <= open) {
          dayErrors[day.day_of_week] = "Close time must be after open time.";
          break;
        }
      }
      if (
        !dayErrors[day.day_of_week] &&
        day.hours.length === 2 &&
        parseTimeToMinutes(day.hours[1].open) <
          parseTimeToMinutes(day.hours[0].close)
      ) {
        dayErrors[day.day_of_week] =
          "Second period must start after the first period ends.";
      }
    }

    setErrors({ days: dayErrors });
    return Object.keys(dayErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !hasChanges) return;
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const payloadDays = days.map((day) =>
        day.is_closed
          ? { day_of_week: day.day_of_week, is_closed: true, hours: [] }
          : {
              day_of_week: day.day_of_week,
              is_closed: false,
              hours: day.hours,
            }
      );

      const { error } = await updateBusinessHours({
        businessId,
        days: payloadDays,
      });

      if (error) {
        setErrors(mapApiErrors(error));
        return;
      }

      showCustomSuccess("Business hours updated.");
      setOpen(false);
      router.refresh();
    } catch {
      setErrors({ form: "Unable to update business hours." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="order-3 rounded-lg border border-border bg-card p-4 md:p-6 lg:order-3">
      <BusinessSectionHeader
        title="Business Hours"
        businessId={businessId}
        onEdit={() => setOpen(true)}
        trailing={<OpenStatus hours={initialHours} timezone={timezone} />}
      />

      <DayHoursDisplay hours={initialHours} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Business Hours</DialogTitle>
            <DialogDescription>
              Set open and close times for each day. Closed days disable time
              inputs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {days.map((day) => {
              const disabled = day.is_closed || isSubmitting;
              return (
                <div
                  key={day.day_of_week}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {day.day_of_week}
                    </span>
                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={day.is_closed}
                        onChange={(e) =>
                          setClosed(day.day_of_week, e.target.checked)
                        }
                        disabled={isSubmitting}
                        className="rounded border-border text-primary focus:ring-ring"
                      />
                      Closed
                    </label>
                  </div>

                  <div
                    className={`space-y-2 ${day.is_closed ? "opacity-50" : ""}`}
                  >
                    {(day.is_closed
                      ? [{ open: DEFAULT_OPEN, close: DEFAULT_CLOSE }]
                      : day.hours
                    ).map((period, periodIndex) => (
                      <div
                        key={`${day.day_of_week}-period-${periodIndex}`}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <TimePartSelects
                          idPrefix={`${day.day_of_week}-open-${periodIndex}`}
                          label={`${day.day_of_week} open time ${periodIndex + 1}`}
                          value={period.open}
                          disabled={disabled}
                          onChange={(value) =>
                            setPeriodField(
                              day.day_of_week,
                              periodIndex,
                              "open",
                              value
                            )
                          }
                        />
                        <span className="text-sm text-muted-foreground">to</span>
                        <TimePartSelects
                          idPrefix={`${day.day_of_week}-close-${periodIndex}`}
                          label={`${day.day_of_week} close time ${periodIndex + 1}`}
                          value={period.close}
                          disabled={disabled}
                          onChange={(value) =>
                            setPeriodField(
                              day.day_of_week,
                              periodIndex,
                              "close",
                              value
                            )
                          }
                        />
                        {!day.is_closed && day.hours.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              removePeriod(day.day_of_week, periodIndex)
                            }
                            disabled={isSubmitting}
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-red-600 disabled:opacity-50"
                            aria-label={`Remove period ${periodIndex + 1} for ${day.day_of_week}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        ) : null}
                      </div>
                    ))}

                    {!day.is_closed && (day.hours?.length || 0) < 2 ? (
                      <button
                        type="button"
                        onClick={() => addPeriod(day.day_of_week)}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary disabled:opacity-50"
                      >
                        <Plus className="size-3.5" />
                        Add hours
                      </button>
                    ) : null}
                  </div>

                  {errors.days?.[day.day_of_week] ? (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.days[day.day_of_week]}
                    </p>
                  ) : null}
                </div>
              );
            })}

            {errors.form ? (
              <p className="text-xs text-red-600">{errors.form}</p>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveDisabled}
               
              >
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BusinessHoursSection(props) {
  return <BusinessHoursSectionContent {...props} />;
}
