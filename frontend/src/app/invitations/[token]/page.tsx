"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, LoaderCircle, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/stores/session-store";
import { getRequestErrorMessage } from "@/lib/utils";

export default function InvitationAcceptPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const currentUser = useSessionStore((state) => state.currentUser);
  const { acceptEventInvitation } = useAppMutations();
  const [error, setError] = useState<string | null>(null);
  const nextPath = `/invitations/${params.token}`;

  return (
    <div className="page-shell py-16">
      <div className="surface-panel mx-auto max-w-2xl px-6 py-8 text-center sm:px-10 sm:py-12">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1eb] text-[#ff5a1f]">
          <MailCheck className="h-6 w-6" />
        </span>
        <h1 className="font-display mt-5 text-[2.3rem] font-semibold tracking-[-0.05em] text-ink">Accept your EventChimp invitation</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
          This invite will attach your account to the event workspace with the exact role the organizer assigned.
        </p>

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        {!currentUser ? (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
              <Button variant="pill" className="bg-[#ff5a1f] hover:bg-[#e64d16]">
                Sign in
              </Button>
            </Link>
            <Link href={`/signup?next=${encodeURIComponent(nextPath)}`}>
              <Button variant="secondary">
                Create account
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <Button
              variant="pill"
              className="bg-[#ff5a1f] hover:bg-[#e64d16]"
              disabled={acceptEventInvitation.isPending}
              onClick={async () => {
                setError(null);
                try {
                  const response = await acceptEventInvitation.mutateAsync(params.token);
                  const destination =
                    response.data.role === "scanner"
                      ? `/dashboard/events/${response.data.eventId}/scanner`
                      : `/dashboard/events/${response.data.eventId}`;
                  router.push(destination);
                } catch (acceptError) {
                  setError(getRequestErrorMessage(acceptError, "We could not accept that invitation right now."));
                }
              }}
            >
              {acceptEventInvitation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Accept invitation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
