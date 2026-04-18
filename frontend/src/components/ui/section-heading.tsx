export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="utility-label text-accent">{eyebrow}</p>
      <h2 className="font-display text-[2rem] font-semibold tracking-[-0.05em] text-ink md:text-[2.45rem]">{title}</h2>
      <p className="text-sm leading-7 text-muted md:text-base">{description}</p>
    </div>
  );
}
