import { Sparkles } from "lucide-react";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface-panel bg-[linear-gradient(180deg,#ffffff_0%,#faf8fd_100%)] px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/12 text-accent">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="font-display mt-5 text-2xl font-semibold tracking-[-0.03em] text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
