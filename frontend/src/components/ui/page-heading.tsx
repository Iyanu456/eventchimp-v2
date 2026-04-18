import { cn } from "@/lib/utils";

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow ? <p className="utility-label">{eyebrow}</p> : null}
        <h1 className="font-display mt-2 text-[2.4rem] font-semibold tracking-[-0.05em] text-ink md:text-[3rem]">
          {title}
        </h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
