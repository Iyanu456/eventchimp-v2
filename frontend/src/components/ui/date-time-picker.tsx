"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

type DateTimePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  error?: string | null;
  hint?: string;
};

const splitDateTime = (value: string) => {
  const [date = "", time = ""] = value.split("T");
  return {
    date,
    time: time.slice(0, 5)
  };
};

const joinDateTime = (date: string, time: string) => (date && time ? `${date}T${time}` : "");

export const toDateTimeInputValue = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

export function DateTimePicker({ label, value, onChange, min, error, hint }: DateTimePickerProps) {
  const current = splitDateTime(value);
  const minParts = min ? splitDateTime(min) : { date: "", time: "" };
  const timeMin = minParts.date && current.date === minParts.date ? minParts.time : undefined;

  return (
    <div
      className={cn(
        "rounded-[18px] border bg-surface-subtle p-4 transition",
        error ? "border-[#f0ccd2] bg-[#fff6f7]" : "border-line"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          {hint ? <p className="mt-1 text-xs leading-6 text-muted">{hint}</p> : null}
        </div>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-soft">
          <CalendarDays className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
        <label className="relative">
          <span className="sr-only">{label} date</span>
          <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          <input
            type="date"
            value={current.date}
            min={minParts.date || undefined}
            onChange={(event) => onChange(joinDateTime(event.target.value, current.time || minParts.time || "09:00"))}
            className="h-12 w-full rounded-[14px] border border-transparent bg-white pl-11 pr-4 text-sm text-ink shadow-soft outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/8"
          />
        </label>
        <label className="relative">
          <span className="sr-only">{label} time</span>
          <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          <input
            type="time"
            value={current.time}
            min={timeMin}
            onChange={(event) => onChange(joinDateTime(current.date || minParts.date, event.target.value))}
            className="h-12 w-full rounded-[14px] border border-transparent bg-white pl-11 pr-4 text-sm text-ink shadow-soft outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/8"
          />
        </label>
      </div>

      {error ? <p className="mt-3 text-xs font-medium leading-6 text-[#923647]">{error}</p> : null}
    </div>
  );
}
