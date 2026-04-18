import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  note,
  className
}: {
  label: string;
  value: string;
  note?: string;
  className?: string;
}) {
  return (
    <div className={cn("surface-panel p-5 md:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-medium text-muted">{label}</p>
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
      </div>
      <p className="font-display metric-value mt-5">{value}</p>
      {note ? <p className="mt-2 text-sm leading-6 text-muted">{note}</p> : null}
    </div>
  );
}
