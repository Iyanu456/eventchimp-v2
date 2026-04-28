"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  Globe2,
  ImagePlus,
  ListChecks,
  MapPin,
  MonitorPlay,
  Plus,
  Repeat,
  ShieldCheck,
  Ticket,
  Trash2,
  Users,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker, toDateTimeInputValue } from "@/components/ui/date-time-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import {
  AttendanceMode,
  CustomFieldType,
  EventCustomField,
  EventGuest,
  EventRecurrence,
  EventStreaming,
  ScheduleType,
  TicketTier
} from "@/types/domain";

export type EventFormValues = {
  title: string;
  category: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  ticketPrice: number;
  isFree: boolean;
  status: "draft" | "published" | "sold_out" | "cancelled";
  tags: string[];
  coverImage?: File | null;
  scheduleType: ScheduleType;
  recurrence: EventRecurrence | null;
  attendanceMode: AttendanceMode;
  streaming: EventStreaming | null;
  ticketTiers: TicketTier[];
  guests: EventGuest[];
  customFields: EventCustomField[];
};

const EVENT_CATEGORY_OPTIONS = [
  "Arts & Culture",
  "Business",
  "Community",
  "Conference",
  "Education",
  "Exhibition",
  "Fashion",
  "Lifestyle",
  "Music",
  "Networking",
  "Sports",
  "Technology",
  "Workshop"
] as const;

const createId = (prefix: string) =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createTicketTier = (index = 0): TicketTier => ({
  id: createId("ticket"),
  name: index === 0 ? "General admission" : `Ticket ${index + 1}`,
  price: 0,
  quantity: 50,
  order: index,
  perks: []
});

const createGuest = (): EventGuest => ({
  id: createId("guest"),
  name: "",
  role: "",
  imageUrl: "",
  bio: ""
});

const createCustomField = (): EventCustomField => ({
  id: createId("field"),
  label: "",
  type: "text",
  required: false,
  placeholder: "",
  options: []
});

const getPlainText = (value: string) =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const getDateTimeError = (startDate: string, endDate: string) => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && Number.isNaN(start.getTime())) {
    return { start: "Choose a valid start date and time.", end: null };
  }

  if (end && Number.isNaN(end.getTime())) {
    return { start: null, end: "Choose a valid end date and time." };
  }

  if (start && start.getTime() < now.getTime() - 60 * 1000) {
    return { start: "Start time cannot be in the past.", end: null };
  }

  if (start && end && end <= start) {
    return { start: null, end: "End time must be after the start time." };
  }

  return { start: null, end: null };
};

type EventFormError = {
  field: string;
  message: string;
};

const validateEventForm = (values: EventFormValues, ticketTiers: TicketTier[]): EventFormError[] => {
  const errors: EventFormError[] = [];

  if (!values.title.trim()) {
    errors.push({
      field: "title",
      message: "Add an event title so attendees know what they are registering for."
    });
  }

  if (!values.category.trim()) {
    errors.push({
      field: "category",
      message: "Choose a category to help position the event properly."
    });
  }

  if (!getPlainText(values.description)) {
    errors.push({
      field: "description",
      message: "Write a description before publishing so the event page does not feel empty."
    });
  }

  if (!values.location.trim()) {
    errors.push({
      field: "location",
      message: "Add a venue or location so guests know where the event is happening."
    });
  }

  if (!values.startDate) {
    errors.push({
      field: "startDate",
      message: "Set a start date and time for the event."
    });
  }

  if (!values.endDate) {
    errors.push({
      field: "endDate",
      message: "Set an end date and time for the event."
    });
  }

  const dateError = getDateTimeError(values.startDate, values.endDate);
  if (dateError.start) {
    errors.push({
      field: "startDate",
      message: dateError.start
    });
  }
  if (dateError.end) {
    errors.push({
      field: "endDate",
      message: dateError.end
    });
  }

  if (!Number.isFinite(values.capacity) || values.capacity < 1) {
    errors.push({
      field: "capacity",
      message: "Capacity should be at least one attendee."
    });
  }

  if (!ticketTiers.length) {
    errors.push({
      field: "ticketTiers",
      message: "Add at least one ticket tier before saving the event."
    });
  }

  ticketTiers.forEach((tier) => {
    if (!tier.name.trim()) {
      errors.push({
        field: `ticket-${tier.id}-name`,
        message: "Give this ticket tier a clear name."
      });
    }

    if (!Number.isFinite(tier.price) || tier.price < 0) {
      errors.push({
        field: `ticket-${tier.id}-price`,
        message: "Ticket price must be zero or higher."
      });
    }

    if (!Number.isFinite(tier.quantity) || tier.quantity < 1) {
      errors.push({
        field: `ticket-${tier.id}-quantity`,
        message: "Available quantity should be at least one ticket."
      });
    }

    if (!Number.isFinite(tier.order) || tier.order < 0) {
      errors.push({
        field: `ticket-${tier.id}-order`,
        message: "Display order must be zero or higher."
      });
    }
  });

  return errors;
};

const defaultValues: EventFormValues = {
  title: "",
  category: "",
  description: "",
  location: "",
  startDate: "",
  endDate: "",
  capacity: 100,
  ticketPrice: 0,
  isFree: true,
  status: "published",
  tags: [],
  coverImage: null,
  scheduleType: "single",
  recurrence: {
    frequency: "weekly",
    interval: 1,
    until: "",
    daysOfWeek: []
  },
  attendanceMode: "in_person",
  streaming: {
    provider: "zoom",
    url: "",
    meetingCode: "",
    password: "",
    notes: ""
  },
  ticketTiers: [createTicketTier()],
  guests: [],
  customFields: []
};

function Field({
  label,
  hint,
  error,
  fieldId,
  children
}: {
  label: string;
  hint?: string;
  error?: string | null;
  fieldId?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2.5" data-error-anchor={fieldId}>
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {hint ? <p className="mt-1 text-xs leading-6 text-muted">{hint}</p> : null}
      </div>
      {children}
      {error ? (
        <p className="flex items-start gap-2 rounded-[12px] border border-[#f0ccd2] bg-[#fff6f7] px-3 py-2 text-xs font-medium leading-5 text-[#923647]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </label>
  );
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-panel p-6">
      <div className="border-b border-line/80 pb-5">
        <h2 className="font-display text-[1.55rem] font-semibold tracking-[-0.04em] text-ink">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{description}</p>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function ToggleGroup<T extends string>({
  value,
  options,
  onChange
}: {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition",
            value === option.value ? "bg-accent text-white" : "bg-[#f0eff4] text-[#6f697b]"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function EventForm({
  initialValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  payoutReady = true,
  showStatusField = true
}: {
  initialValues?: Partial<EventFormValues>;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (values: EventFormValues) => void;
  payoutReady?: boolean;
  showStatusField?: boolean;
}) {
  const mergedInitialValues: EventFormValues = {
    ...defaultValues,
    ...initialValues,
    recurrence: initialValues?.recurrence ?? defaultValues.recurrence,
    streaming: initialValues?.streaming ?? defaultValues.streaming,
    ticketTiers: initialValues?.ticketTiers?.length ? initialValues.ticketTiers : defaultValues.ticketTiers,
    guests: initialValues?.guests ?? [],
    customFields: initialValues?.customFields ?? []
  };

  const [form, setForm] = useState<EventFormValues>(mergedInitialValues);
  const [tagInput, setTagInput] = useState(mergedInitialValues.tags.join(", "));
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [categoryMode, setCategoryMode] = useState<"preset" | "other">(
    EVENT_CATEGORY_OPTIONS.includes(mergedInitialValues.category as (typeof EVENT_CATEGORY_OPTIONS)[number])
      ? "preset"
      : "other"
  );

  const parsedTags = useMemo(
    () =>
      tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagInput]
  );

  const normalizedTicketTiers = useMemo(() => {
    const sorted = [...form.ticketTiers].sort((a, b) => a.order - b.order);
    return sorted.map((tier) => ({
      ...tier,
      perks: tier.perks.map((perk) => perk.trim()).filter(Boolean)
    }));
  }, [form.ticketTiers]);

  const lowestTierPrice = Math.min(...normalizedTicketTiers.map((tier) => tier.price));
  const allTiersFree = normalizedTicketTiers.every((tier) => tier.price === 0);
  const minimumDateTime = useMemo(() => toDateTimeInputValue(new Date()), []);
  const dateTimeError = getDateTimeError(form.startDate, form.endDate);
  const startDateError = fieldErrors.startDate ?? dateTimeError.start;
  const endDateError = fieldErrors.endDate ?? dateTimeError.end;

  const clearFieldError = (field: string) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const scrollToFieldError = (field: string) => {
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(`[data-error-anchor="${field}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });

      const focusTarget = target?.querySelector<HTMLElement>("input, textarea, button, [contenteditable='true']");
      focusTarget?.focus({ preventScroll: true });
    });
  };

  const updateTicketTier = (tierId: string, patch: Partial<TicketTier>) => {
    setForm((current) => ({
      ...current,
      ticketTiers: current.ticketTiers.map((tier) => (tier.id === tierId ? { ...tier, ...patch } : tier))
    }));
  };

  const updateGuest = (guestId: string, patch: Partial<EventGuest>) => {
    setForm((current) => ({
      ...current,
      guests: current.guests.map((guest) => (guest.id === guestId ? { ...guest, ...patch } : guest))
    }));
  };

  const updateCustomField = (fieldId: string, patch: Partial<EventCustomField>) => {
    setForm((current) => ({
      ...current,
      customFields: current.customFields.map((field) => (field.id === fieldId ? { ...field, ...patch } : field))
    }));
  };

  return (
    <form
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]"
      onSubmit={(event) => {
        event.preventDefault();
        const nextValues = {
          ...form,
          tags: parsedTags,
          ticketTiers: normalizedTicketTiers,
          ticketPrice: Number.isFinite(lowestTierPrice) ? Math.max(lowestTierPrice, 0) : 0,
          isFree: allTiersFree
        };
        const validationErrors = validateEventForm(nextValues, normalizedTicketTiers);

        if (validationErrors.length) {
          const nextErrors = validationErrors.reduce<Record<string, string>>((acc, item) => {
            if (!acc[item.field]) {
              acc[item.field] = item.message;
            }
            return acc;
          }, {});
          setFieldErrors(nextErrors);
          setFormNotice("Some required details are missing. We took you to the first field that needs attention.");
          scrollToFieldError(validationErrors[0].field);
          return;
        }

        setFormNotice(null);
        setFieldErrors({});
        onSubmit({
          ...nextValues
        });
      }}
    >
      <div className="space-y-6">
        {formNotice ? (
          <div
            className="flex items-start gap-3 rounded-[18px] border border-[#f0ccd2] bg-[#fff6f7] px-4 py-4 text-sm text-[#923647]"
            aria-live="polite"
          >
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#c7465f] shadow-soft">
              <AlertCircle className="h-4 w-4" />
            </span>
            <div className="space-y-1">
              <p className="font-semibold text-[#7b2336]">A few event details still need attention</p>
              <p className="leading-6">{formNotice}</p>
            </div>
          </div>
        ) : null}

        <Section
          title="Event details"
          description="Shape the public story first. This is where organizers define what the event is, who it is for, and what makes it worth showing up for."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Event title" fieldId="title" error={fieldErrors.title}>
              <Input
                value={form.title}
                className={fieldErrors.title ? "border-[#f0a7b3] bg-white ring-4 ring-[#f0ccd2]/40" : undefined}
                aria-invalid={Boolean(fieldErrors.title)}
                onChange={(event) => {
                  clearFieldError("title");
                  setForm({ ...form, title: event.target.value });
                }}
              />
            </Field>
            <Field label="Category" fieldId="category" error={fieldErrors.category}>
              <div className="space-y-3">
                <Select
                  className={fieldErrors.category ? "border-[#f0a7b3] bg-white ring-4 ring-[#f0ccd2]/40" : undefined}
                  value={
                    categoryMode === "other" || !EVENT_CATEGORY_OPTIONS.includes(form.category as (typeof EVENT_CATEGORY_OPTIONS)[number])
                      ? "other"
                      : form.category
                  }
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    if (nextValue === "other") {
                      setCategoryMode("other");
                      clearFieldError("category");
                      setForm((current) => ({ ...current, category: "" }));
                      return;
                    }

                    setCategoryMode("preset");
                    clearFieldError("category");
                    setForm((current) => ({ ...current, category: nextValue }));
                  }}
                >
                  <option value="">Select a category</option>
                  {EVENT_CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </Select>
                {categoryMode === "other" ? (
                  <Input
                    value={form.category}
                    className={fieldErrors.category ? "border-[#f0a7b3] bg-white ring-4 ring-[#f0ccd2]/40" : undefined}
                    aria-invalid={Boolean(fieldErrors.category)}
                    onChange={(event) => {
                      clearFieldError("category");
                      setForm({ ...form, category: event.target.value });
                    }}
                    placeholder="Enter custom category"
                  />
                ) : null}
              </div>
            </Field>
          </div>
          <div className="mt-5">
            <Field
              label="Description"
              fieldId="description"
              error={fieldErrors.description}
              hint="Use headings, bullets, quotes and links to make the event page feel editorial instead of flat."
            >
              <RichTextEditor
                value={form.description}
                className={fieldErrors.description ? "border-[#f0a7b3] ring-4 ring-[#f0ccd2]/40" : undefined}
                onChange={(description) => {
                  clearFieldError("description");
                  setForm({ ...form, description });
                }}
                placeholder="Describe the experience, audience, agenda and why guests should care."
              />
            </Field>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Location" fieldId="location" error={fieldErrors.location}>
              <Input
                value={form.location}
                className={fieldErrors.location ? "border-[#f0a7b3] bg-white ring-4 ring-[#f0ccd2]/40" : undefined}
                aria-invalid={Boolean(fieldErrors.location)}
                onChange={(event) => {
                  clearFieldError("location");
                  setForm({ ...form, location: event.target.value });
                }}
              />
            </Field>
            <Field label="Tags" hint="Comma separated">
              <Input value={tagInput} onChange={(event) => setTagInput(event.target.value)} />
            </Field>
          </div>
        </Section>

        <Section
          title="Schedule and access"
          description="Set whether this runs once or repeats, and whether guests attend in person, virtually, or in a hybrid format."
        >
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[18px] border border-line bg-surface-subtle p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
                <Clock3 className="h-4 w-4 text-accent" />
                Event cadence
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Single event",
                    value: "single" as ScheduleType,
                    description: "One date and time",
                    icon: CalendarDays
                  },
                  {
                    label: "Recurring",
                    value: "recurring" as ScheduleType,
                    description: "Repeats over time",
                    icon: Repeat
                  }
                ].map((option) => {
                  const active = form.scheduleType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "rounded-[16px] border bg-white p-4 text-left shadow-soft transition",
                        active ? "border-accent ring-4 ring-accent/10" : "border-line hover:border-accent/35"
                      )}
                      onClick={() => setForm({ ...form, scheduleType: option.value })}
                    >
                      <span
                        className={cn(
                          "inline-flex h-10 w-10 items-center justify-center rounded-full",
                          active ? "bg-accent text-white" : "bg-accent/10 text-accent"
                        )}
                      >
                        <option.icon className="h-4 w-4" />
                      </span>
                      <span className="mt-4 block text-sm font-semibold text-ink">{option.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[18px] border border-line bg-surface-subtle p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Access mode
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "In person", value: "in_person" as AttendanceMode, icon: MapPin },
                  { label: "Virtual", value: "virtual" as AttendanceMode, icon: MonitorPlay },
                  { label: "Hybrid", value: "hybrid" as AttendanceMode, icon: Globe2 }
                ].map((option) => {
                  const active = form.attendanceMode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={cn(
                        "rounded-[16px] border bg-white p-4 text-left shadow-soft transition",
                        active ? "border-accent ring-4 ring-accent/10" : "border-line hover:border-accent/35"
                      )}
                      onClick={() => setForm({ ...form, attendanceMode: option.value })}
                    >
                      <span
                        className={cn(
                          "inline-flex h-10 w-10 items-center justify-center rounded-full",
                          active ? "bg-accent text-white" : "bg-accent/10 text-accent"
                        )}
                      >
                        <option.icon className="h-4 w-4" />
                      </span>
                      <span className="mt-4 block text-sm font-semibold text-ink">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-5 rounded-[18px] border border-line bg-white p-5 shadow-soft md:grid-cols-2">
            <div data-error-anchor="startDate">
              <DateTimePicker
                label="Start date and time"
                value={form.startDate}
                min={minimumDateTime}
                error={startDateError}
                hint="Pick when guests can start attending."
                onChange={(startDate) => {
                  clearFieldError("startDate");
                  clearFieldError("endDate");
                  const nextStart = startDate;
                  const currentEnd = form.endDate ? new Date(form.endDate) : null;
                  const start = nextStart ? new Date(nextStart) : null;
                  const shouldMoveEnd = start && currentEnd && currentEnd <= start;
                  const nextEnd = shouldMoveEnd
                    ? toDateTimeInputValue(new Date(start.getTime() + 60 * 60 * 1000))
                    : form.endDate;

                  setForm({ ...form, startDate: nextStart, endDate: nextEnd });
                }}
              />
            </div>
            <div data-error-anchor="endDate">
              <DateTimePicker
                label="End date and time"
                value={form.endDate}
                min={form.startDate || minimumDateTime}
                error={endDateError}
                hint="End time is always kept after the start."
                onChange={(endDate) => {
                  clearFieldError("endDate");
                  setForm({ ...form, endDate });
                }}
              />
            </div>
          </div>

          {form.scheduleType === "recurring" && form.recurrence ? (
            <div className="mt-5 grid gap-5 rounded-[18px] border border-accent/15 bg-accent/5 p-5 md:grid-cols-3">
              <Field label="Frequency">
                <Select
                  value={form.recurrence.frequency}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      recurrence: { ...form.recurrence!, frequency: event.target.value as EventRecurrence["frequency"] }
                    })
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </Field>
              <Field label="Repeat every">
                <Input
                  type="number"
                  min={1}
                  value={form.recurrence.interval}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      recurrence: { ...form.recurrence!, interval: Number(event.target.value) }
                    })
                  }
                />
              </Field>
              <Field label="Repeat until">
                <Input
                  type="date"
                  value={form.recurrence.until ? String(form.recurrence.until).slice(0, 10) : ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      recurrence: { ...form.recurrence!, until: event.target.value }
                    })
                  }
                />
              </Field>
            </div>
          ) : null}

          {form.attendanceMode !== "in_person" && form.streaming ? (
            <div className="mt-5 rounded-[18px] border border-accent/15 bg-accent/5 p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Streaming platform">
                  <Select
                    value={form.streaming.provider}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        streaming: { ...form.streaming!, provider: event.target.value }
                      })
                    }
                  >
                    <option value="zoom">Zoom</option>
                    <option value="google-meet">Google Meet</option>
                    <option value="youtube">YouTube</option>
                    <option value="loom">Loom</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>
                <Field label="Streaming link">
                  <Input
                    placeholder="https://..."
                    value={form.streaming.url ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        streaming: { ...form.streaming!, url: event.target.value }
                      })
                    }
                  />
                </Field>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <Field label="Meeting code">
                  <Input
                    placeholder="Optional meeting code"
                    value={form.streaming.meetingCode ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        streaming: { ...form.streaming!, meetingCode: event.target.value }
                      })
                    }
                  />
                </Field>
                <Field label="Password">
                  <Input
                    placeholder="Optional passcode"
                    value={form.streaming.password ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        streaming: { ...form.streaming!, password: event.target.value }
                      })
                    }
                  />
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Streaming notes" hint="Use this for access notes, start instructions, or host reminders.">
                  <Input
                    placeholder="Lobby opens 15 minutes early"
                    value={form.streaming.notes ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        streaming: { ...form.streaming!, notes: event.target.value }
                      })
                    }
                  />
                </Field>
              </div>
            </div>
          ) : null}

          <div
            className={cn(
              "mt-5 grid gap-5 rounded-[18px] border border-line bg-white p-5 shadow-soft",
              showStatusField ? "md:grid-cols-2" : ""
            )}
          >
            <Field label="Capacity" fieldId="capacity" error={fieldErrors.capacity}>
              <Input
                type="number"
                value={form.capacity}
                className={fieldErrors.capacity ? "border-[#f0a7b3] bg-white ring-4 ring-[#f0ccd2]/40" : undefined}
                aria-invalid={Boolean(fieldErrors.capacity)}
                onChange={(event) => {
                  clearFieldError("capacity");
                  setForm({ ...form, capacity: Number(event.target.value) });
                }}
              />
            </Field>
            {showStatusField ? (
              <Field label="Current status">
                <Select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as EventFormValues["status"] })}
                >
                  <option value="published">Published</option>
                  <option value="sold_out">Sold out</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Field>
            ) : (
              <div className="rounded-[16px] border border-line bg-[#faf7fd] px-4 py-4 text-sm text-muted">
                New events go live immediately after creation once your verified payout profile is active.
              </div>
            )}
          </div>
        </Section>

        <Section
          title="Ticket setup"
          description="Create realistic ticket tiers with names, pricing, available quantities, and perks. Guests will pick from these during checkout."
        >
          <div className="space-y-4" data-error-anchor="ticketTiers">
            {fieldErrors.ticketTiers ? (
              <p className="flex items-start gap-2 rounded-[12px] border border-[#f0ccd2] bg-[#fff6f7] px-3 py-2 text-xs font-medium leading-5 text-[#923647]">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {fieldErrors.ticketTiers}
              </p>
            ) : null}
            {form.ticketTiers.map((tier, index) => (
              <div key={tier.id} className="rounded-[16px] border border-line bg-surface-subtle p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">Ticket tier {index + 1}</p>
                    <p className="mt-1 text-xs leading-6 text-muted">Use perks to explain what makes this tier special.</p>
                  </div>
                  {form.ticketTiers.length > 1 ? (
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-line bg-white text-[#7b7487] transition hover:text-danger"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          ticketTiers: current.ticketTiers.filter((item) => item.id !== tier.id)
                        }))
                      }
                      aria-label={`Remove ${tier.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <Field
                    label="Ticket name"
                    fieldId={`ticket-${tier.id}-name`}
                    error={fieldErrors[`ticket-${tier.id}-name`]}
                  >
                    <Input
                      value={tier.name}
                      className={fieldErrors[`ticket-${tier.id}-name`] ? "border-[#f0a7b3] bg-white ring-4 ring-[#f0ccd2]/40" : undefined}
                      aria-invalid={Boolean(fieldErrors[`ticket-${tier.id}-name`])}
                      onChange={(event) => {
                        clearFieldError(`ticket-${tier.id}-name`);
                        updateTicketTier(tier.id, { name: event.target.value });
                      }}
                    />
                  </Field>
                  <Field
                    label="Price"
                    fieldId={`ticket-${tier.id}-price`}
                    error={fieldErrors[`ticket-${tier.id}-price`]}
                  >
                    <Input
                      type="number"
                      min={0}
                      value={tier.price}
                      className={fieldErrors[`ticket-${tier.id}-price`] ? "border-[#f0a7b3] bg-white ring-4 ring-[#f0ccd2]/40" : undefined}
                      aria-invalid={Boolean(fieldErrors[`ticket-${tier.id}-price`])}
                      onChange={(event) => {
                        clearFieldError(`ticket-${tier.id}-price`);
                        updateTicketTier(tier.id, { price: Number(event.target.value) });
                      }}
                    />
                  </Field>
                  <Field
                    label="Available quantity"
                    fieldId={`ticket-${tier.id}-quantity`}
                    error={fieldErrors[`ticket-${tier.id}-quantity`]}
                  >
                    <Input
                      type="number"
                      min={1}
                      value={tier.quantity}
                      className={fieldErrors[`ticket-${tier.id}-quantity`] ? "border-[#f0a7b3] bg-white ring-4 ring-[#f0ccd2]/40" : undefined}
                      aria-invalid={Boolean(fieldErrors[`ticket-${tier.id}-quantity`])}
                      onChange={(event) => {
                        clearFieldError(`ticket-${tier.id}-quantity`);
                        updateTicketTier(tier.id, { quantity: Number(event.target.value) });
                      }}
                    />
                  </Field>
                  <Field
                    label="Display order"
                    fieldId={`ticket-${tier.id}-order`}
                    error={fieldErrors[`ticket-${tier.id}-order`]}
                  >
                    <Input
                      type="number"
                      min={0}
                      value={tier.order}
                      className={fieldErrors[`ticket-${tier.id}-order`] ? "border-[#f0a7b3] bg-white ring-4 ring-[#f0ccd2]/40" : undefined}
                      aria-invalid={Boolean(fieldErrors[`ticket-${tier.id}-order`])}
                      onChange={(event) => {
                        clearFieldError(`ticket-${tier.id}-order`);
                        updateTicketTier(tier.id, { order: Number(event.target.value) });
                      }}
                    />
                  </Field>
                </div>
                <div className="mt-5">
                  <Field label="Perks" hint="One perk per line">
                    <textarea
                      className="min-h-[120px] w-full rounded-[16px] border border-line bg-white px-4 py-3 text-sm text-ink shadow-soft outline-none transition focus:border-accent"
                      value={tier.perks.join("\n")}
                      onChange={(event) =>
                        updateTicketTier(tier.id, {
                          perks: event.target.value.split("\n").map((perk) => perk.trim()).filter(Boolean)
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-5 rounded-full"
            onClick={() =>
              setForm((current) => ({
                ...current,
                ticketTiers: [...current.ticketTiers, createTicketTier(current.ticketTiers.length)]
              }))
            }
          >
            <Plus className="h-4 w-4" />
            Add ticket tier
          </Button>
        </Section>

        <Section
          title="Guests and registration fields"
          description="Capture who is appearing on the lineup and what extra information guests should answer at checkout."
        >
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Featured guests</p>
                  <p className="mt-1 text-xs leading-6 text-muted">Speakers, DJs, panelists, hosts, or any notable faces on the event page.</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => setForm((current) => ({ ...current, guests: [...current.guests, createGuest()] }))}
                >
                  <Plus className="h-4 w-4" />
                  Add guest
                </Button>
              </div>
              {form.guests.length ? (
                form.guests.map((guest) => (
                  <div key={guest.id} className="rounded-[16px] border border-line bg-surface-subtle p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid flex-1 gap-5 md:grid-cols-2">
                        <Field label="Name">
                          <Input value={guest.name} onChange={(event) => updateGuest(guest.id, { name: event.target.value })} />
                        </Field>
                        <Field label="Role">
                          <Input value={guest.role} onChange={(event) => updateGuest(guest.id, { role: event.target.value })} />
                        </Field>
                        <Field label="Image URL">
                          <Input
                            value={guest.imageUrl ?? ""}
                            onChange={(event) => updateGuest(guest.id, { imageUrl: event.target.value })}
                          />
                        </Field>
                        <Field label="Bio" hint="Optional">
                          <Input value={guest.bio ?? ""} onChange={(event) => updateGuest(guest.id, { bio: event.target.value })} />
                        </Field>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-line bg-white text-[#7b7487] transition hover:text-danger"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            guests: current.guests.filter((item) => item.id !== guest.id)
                          }))
                        }
                        aria-label={`Remove ${guest.name || "guest"}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[16px] border border-dashed border-line bg-surface-subtle px-5 py-6 text-sm text-muted">
                  No guests added yet.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Custom checkout fields</p>
                  <p className="mt-1 text-xs leading-6 text-muted">Great for school, branch, department, chapter, or referral questions.</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      customFields: [...current.customFields, createCustomField()]
                    }))
                  }
                >
                  <Plus className="h-4 w-4" />
                  Add field
                </Button>
              </div>
              {form.customFields.length ? (
                form.customFields.map((field) => (
                  <div key={field.id} className="rounded-[16px] border border-line bg-surface-subtle p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid flex-1 gap-5">
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field label="Field label">
                            <Input value={field.label} onChange={(event) => updateCustomField(field.id, { label: event.target.value })} />
                          </Field>
                          <Field label="Field type">
                            <Select
                              value={field.type}
                              onChange={(event) =>
                                updateCustomField(field.id, { type: event.target.value as CustomFieldType })
                              }
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="select">Select</option>
                            </Select>
                          </Field>
                        </div>
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field label="Placeholder">
                            <Input
                              value={field.placeholder ?? ""}
                              onChange={(event) => updateCustomField(field.id, { placeholder: event.target.value })}
                            />
                          </Field>
                          <label className="flex items-center gap-3 rounded-[16px] border border-line bg-white px-4 py-4 text-sm text-ink shadow-soft">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(event) => updateCustomField(field.id, { required: event.target.checked })}
                            />
                            Required answer
                          </label>
                        </div>
                        {field.type === "select" ? (
                          <Field label="Options" hint="One option per line">
                            <textarea
                              className="min-h-[100px] w-full rounded-[16px] border border-line bg-white px-4 py-3 text-sm text-ink shadow-soft outline-none transition focus:border-accent"
                              value={field.options.join("\n")}
                              onChange={(event) =>
                                updateCustomField(field.id, {
                                  options: event.target.value.split("\n").map((option) => option.trim()).filter(Boolean)
                                })
                              }
                            />
                          </Field>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-line bg-white text-[#7b7487] transition hover:text-danger"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            customFields: current.customFields.filter((item) => item.id !== field.id)
                          }))
                        }
                        aria-label={`Remove ${field.label || "field"}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[16px] border border-dashed border-line bg-surface-subtle px-5 py-6 text-sm text-muted">
                  No custom registration fields yet.
                </div>
              )}
            </div>
          </div>
        </Section>

        <Section
          title="Visuals and publishing"
          description="Finish the setup with the public artwork and final availability state."
        >
          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <label className="surface-soft flex min-h-[238px] cursor-pointer flex-col justify-between border-dashed border-[#d7d1e5] p-6">
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/12 text-accent">
                  <ImagePlus className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-5 text-[1.45rem] font-semibold tracking-[-0.04em] text-ink">Upload cover image</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Use one clear visual that can hold up across explore, event detail, and social promos.
                </p>
              </div>
              <div>
                <Input
                  type="file"
                  onChange={(event) => setForm({ ...form, coverImage: event.target.files?.[0] ?? null })}
                />
                {form.coverImage ? <p className="mt-3 text-xs text-muted">Selected: {form.coverImage.name}</p> : null}
              </div>
            </label>

            <div className="surface-soft p-5">
              <p className="text-sm font-semibold text-ink">Checkout snapshot</p>
              <div className="mt-4 rounded-[16px] bg-white px-4 py-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Starting from</p>
                <p className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink">
                  {allTiersFree ? "FREE" : formatCurrency(Number.isFinite(lowestTierPrice) ? lowestTierPrice : 0)}
                </p>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-accent" />
                  <span>{normalizedTicketTiers.length} ticket tier{normalizedTicketTiers.length === 1 ? "" : "s"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-accent" />
                  <span>{form.scheduleType === "single" ? "Single date" : "Recurring schedule"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-accent" />
                  <span>{form.attendanceMode.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span>{form.customFields.length} custom registration field{form.customFields.length === 1 ? "" : "s"}</span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                The checkout flow will use your ticket tiers, attendee questions, and streaming setup directly.
              </p>
            </div>
          </div>
        </Section>
      </div>

      <aside className="space-y-6">
        <section className="surface-panel overflow-hidden">
          <div className="dashboard-wave-card px-5 py-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">Live preview</p>
            <h2 className="font-display mt-4 text-[1.9rem] font-semibold tracking-[-0.04em]">
              {form.title || "Your event title"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="default" className="bg-white text-[#4b2a76]">
                {form.category || "Category"}
              </Badge>
              <Badge tone="default" className="bg-white/14 text-white">
                {form.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="space-y-5 p-5">
            <div className="space-y-3 text-sm text-muted">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-accent" />
                <span>{form.startDate ? new Date(form.startDate).toLocaleString() : "Date and time"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span>{form.location || "Venue to be announced"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-accent" />
                <span>{allTiersFree ? "Free tickets" : `From ${formatCurrency(Number.isFinite(lowestTierPrice) ? lowestTierPrice : 0)}`}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {parsedTags.length ? (
                  parsedTags.map((tag) => (
                    <Badge key={tag} tone="default">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted">No tags yet</span>
                )}
              </div>
            </div>
            <div className="rounded-[16px] bg-[#f7f4fb] px-4 py-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#4d3170]">
                <ListChecks className="h-4 w-4 text-accent" />
                Checkout tip
              </div>
              <p className="mt-2 text-sm leading-7 text-muted">
                Strong ticket labels and a couple of thoughtful registration fields make checkout feel tailored instead of generic.
              </p>
            </div>
            <Button type="submit" variant="pill" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </section>
      </aside>
    </form>
  );
}
