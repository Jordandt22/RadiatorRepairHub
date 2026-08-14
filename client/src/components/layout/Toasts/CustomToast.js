"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { toast } from "sonner";

const TONE_STYLES = {
  red: {
    container: "border-red-200 bg-red-50 text-red-950",
    iconWrap: "bg-red-100 text-red-700",
    title: "text-red-950",
    message: "text-red-800/90",
    dismiss: "text-red-700/70 hover:bg-red-100 hover:text-red-900",
    Icon: CircleAlert,
    ariaPrefix: "Error",
    live: "assertive",
    role: "alert",
  },
  green: {
    container: "border-green-200 bg-green-50 text-green-950",
    iconWrap: "bg-green-100 text-green-700",
    title: "text-green-950",
    message: "text-green-800/90",
    dismiss: "text-green-700/70 hover:bg-green-100 hover:text-green-900",
    Icon: CircleCheck,
    ariaPrefix: "Success",
    live: "polite",
    role: "status",
  },
  blue: {
    container: "border-primary/25 bg-tint text-foreground",
    iconWrap: "bg-white/70 text-primary",
    title: "text-foreground",
    message: "text-muted-foreground",
    dismiss: "text-muted-foreground hover:bg-white/60 hover:text-foreground",
    Icon: Info,
    ariaPrefix: "Notification",
    live: "polite",
    role: "status",
  },
};

export default function CustomToast({ message, title, id, color = "blue" }) {
  const tone = TONE_STYLES[color] ?? TONE_STYLES.blue;
  const Icon = tone.Icon;
  const heading = title || tone.ariaPrefix;

  return (
    <div
      className={`relative flex w-full md:min-w-sm md:max-w-lg items-start gap-3 rounded-2xl border p-4 shadow-none ${tone.container}`}
      role={tone.role}
      aria-live={tone.live}
      aria-label={`${tone.ariaPrefix}: ${heading}`}
    >
      <span
        className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full ${tone.iconWrap}`}
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1 pr-6">
        <h4 className={`text-sm font-semibold ${tone.title}`}>{heading}</h4>
        <p className={`mt-0.5 text-sm leading-relaxed ${tone.message}`}>
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => toast.dismiss(id)}
        className={`absolute top-3 right-3 rounded-full p-1 transition-colors ${tone.dismiss}`}
        aria-label={`Dismiss ${heading} notification`}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
