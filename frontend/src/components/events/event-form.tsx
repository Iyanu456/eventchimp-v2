"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ImagePlus, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

type EventFormValues = {
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
  isFree: false,
  status: "draft",
  tags: []
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
  const mergedInitialValues = { ...defaultValues, ...initialValues };
  const [form, setForm] = useState<EventFormValues>(mergedInitialValues);
  const [tagInput, setTagInput] = useState(mergedInitialValues.tags.join(", "));

  const parsedTags = useMemo(
    () =>
      tagInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagInput]
  );

  return (
    <form
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...form,
          tags: parsedTags
        });
      }}
    >
      <div className="space-y-6">
        <Section
          title="Event details"
          description="Define the title, category and story first. This is the part guests scan before deciding whether your event feels worth their time."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Event title">
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </Field>
            <Field label="Category">
              <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
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
          title="Schedule and status"
          description="Set when the event happens and how it should appear in the workspace."
        >
          <div className="grid gap-5 md:grid-cols-2">
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
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <Field label="Capacity">
              <Input
                type="number"
                value={form.capacity}
                onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })}
              />
            </Field>
            <Field label="Ticket price">
              <Input
                type="number"
                value={form.ticketPrice}
                onChange={(event) => setForm({ ...form, ticketPrice: Number(event.target.value) })}
              />
            </Field>
            <Field label="Current status">
              <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EventFormValues["status"] })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="sold_out">Sold out</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Sold out", value: "sold_out" },
              { label: "Cancelled", value: "cancelled" }
            ].map((status) => (
              <button
                key={status.value}
                type="button"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  form.status === status.value ? "bg-accent text-white" : "bg-[#f0eff4] text-[#6f697b]"
                )}
                onClick={() => setForm({ ...form, status: status.value as EventFormValues["status"] })}
              >
                {status.label}
              </button>
            ))}
          </div>
        </Section>

        <Section
          title="Visuals and access"
          description="Keep the cover art and ticket setup clean. The backend still owns final checkout totals and verification."
        >
          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <label className="surface-soft flex min-h-[238px] cursor-pointer flex-col justify-between border-dashed border-[#d7d1e5] p-6">
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/12 text-accent">
                  <ImagePlus className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-5 text-[1.45rem] font-semibold tracking-[-0.04em] text-ink">Upload cover image</h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  Use one striking cover to carry the event across explore, detail and branding surfaces.
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
              <p className="text-sm font-semibold text-ink">Ticket setup</p>
              <label className="mt-4 flex items-center gap-3 rounded-[16px] bg-white px-4 py-4 text-sm text-ink shadow-soft">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(event) => setForm({ ...form, isFree: event.target.checked })}
                />
                Mark this as a free event
              </label>
              <div className="mt-4 rounded-[16px] bg-white px-4 py-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Base price</p>
                <p className="mt-2 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink">
                  {form.isFree ? "FREE" : formatCurrency(form.ticketPrice)}
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                Service fees and final organizer share remain backend-driven. This form only controls the public setup.
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
                <Sparkles className="h-4 w-4 text-accent" />
                Publishing tip
              </div>
              <p className="mt-2 text-sm leading-7 text-muted">
                Pages land best when the promise, cover and date block all feel immediate and unmistakable.
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
