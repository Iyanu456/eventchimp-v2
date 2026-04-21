"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ImagePlus,
  ListChecks,
  MapPin,
  Plus,
  Repeat,
  Ticket,
  Trash2,
  Users,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const validateEventForm = (values: EventFormValues, ticketTiers: TicketTier[]) => {
  const errors: string[] = [];

  if (!values.title.trim()) {
    errors.push("Add an event title so attendees know what they are registering for.");
  }

  if (!values.category.trim()) {
    errors.push("Choose a category to help position the event properly.");
  }

  if (!getPlainText(values.description)) {
    errors.push("Write a description before publishing so the event page does not feel empty.");
  }

  if (!values.location.trim()) {
    errors.push("Add a venue or location so guests know where the event is happening.");
  }

  if (!values.startDate) {
    errors.push("Set a start date and time for the event.");
  }

  if (!values.endDate) {
    errors.push("Set an end date and time for the event.");
  }

  if (values.startDate && values.endDate && new Date(values.endDate) <= new Date(values.startDate)) {
    errors.push("The event end time has to be after the start time.");
  }

  if (!Number.isFinite(values.capacity) || values.capacity < 1) {
    errors.push("Capacity should be at least one attendee.");
  }

  if (!ticketTiers.length) {
    errors.push("Add at least one ticket tier before saving the event.");
  }

  if (
    ticketTiers.some(
      (tier) =>
        !tier.name.trim() ||
        !Number.isFinite(tier.quantity) ||
        tier.quantity < 1 ||
        !Number.isFinite(tier.order) ||
        tier.order < 0 ||
        tier.price < 0
    )
  ) {
    errors.push("Complete the ticket setup with a name, price, quantity, and valid order for each tier.");
  }

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
  status: "draft",
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
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2.5">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {hint ? <p className="mt-1 text-xs leading-6 text-muted">{hint}</p> : null}
      </div>
      {children}
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
  onSubmit
}: {
  initialValues?: Partial<EventFormValues>;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (values: EventFormValues) => void;
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
          setFormNotice(validationErrors[0]);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        setFormNotice(null);
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
            <Field label="Event title">
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </Field>
            <Field label="Category">
              <div className="space-y-3">
                <Select
                  value={
                    categoryMode === "other" || !EVENT_CATEGORY_OPTIONS.includes(form.category as (typeof EVENT_CATEGORY_OPTIONS)[number])
                      ? "other"
                      : form.category
                  }
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    if (nextValue === "other") {
                      setCategoryMode("other");
                      setForm((current) => ({ ...current, category: "" }));
                      return;
                    }

                    setCategoryMode("preset");
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
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    placeholder="Enter custom category"
                  />
                ) : null}
              </div>
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Description" hint="Use headings, bullets, quotes and links to make the event page feel editorial instead of flat.">
              <RichTextEditor
                value={form.description}
                onChange={(description) => setForm({ ...form, description })}
                placeholder="Describe the experience, audience, agenda and why guests should care."
              />
            </Field>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Location">
              <Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
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
          <div className="grid gap-6 lg:grid-cols-2">
            <Field label="Event cadence">
              <ToggleGroup<ScheduleType>
                value={form.scheduleType}
                options={[
                  { label: "Single event", value: "single" },
                  { label: "Recurring event", value: "recurring" }
                ]}
                onChange={(scheduleType) => setForm({ ...form, scheduleType })}
              />
            </Field>
            <Field label="Attendance mode">
              <ToggleGroup<AttendanceMode>
                value={form.attendanceMode}
                options={[
                  { label: "In person", value: "in_person" },
                  { label: "Virtual", value: "virtual" },
                  { label: "Hybrid", value: "hybrid" }
                ]}
                onChange={(attendanceMode) => setForm({ ...form, attendanceMode })}
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Start date and time">
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              />
            </Field>
            <Field label="End date and time">
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              />
            </Field>
          </div>

          {form.scheduleType === "recurring" && form.recurrence ? (
            <div className="mt-5 grid gap-5 rounded-[16px] border border-line bg-surface-subtle p-5 md:grid-cols-3">
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
            <div className="mt-5 rounded-[16px] border border-line bg-surface-subtle p-5">
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

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Capacity">
              <Input
                type="number"
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })}
              />
            </Field>
            <Field label="Current status">
              <Select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as EventFormValues["status"] })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="sold_out">Sold out</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </Field>
          </div>
        </Section>

        <Section
          title="Ticket setup"
          description="Create realistic ticket tiers with names, pricing, available quantities, and perks. Guests will pick from these during checkout."
        >
          <div className="space-y-4">
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
                  <Field label="Ticket name">
                    <Input value={tier.name} onChange={(event) => updateTicketTier(tier.id, { name: event.target.value })} />
                  </Field>
                  <Field label="Price">
                    <Input
                      type="number"
                      min={0}
                      value={tier.price}
                      onChange={(event) => updateTicketTier(tier.id, { price: Number(event.target.value) })}
                    />
                  </Field>
                  <Field label="Available quantity">
                    <Input
                      type="number"
                      min={1}
                      value={tier.quantity}
                      onChange={(event) => updateTicketTier(tier.id, { quantity: Number(event.target.value) })}
                    />
                  </Field>
                  <Field label="Display order">
                    <Input
                      type="number"
                      min={0}
                      value={tier.order}
                      onChange={(event) => updateTicketTier(tier.id, { order: Number(event.target.value) })}
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
