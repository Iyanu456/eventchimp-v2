"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BadgeCheck, CheckCircle2, Landmark, LoaderCircle } from "lucide-react";
import { request } from "@/apiServices/requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAppMutations } from "@/hooks/mutations/use-app-mutations";
import { usePayoutBanksQuery } from "@/hooks/queries/use-payout-banks-query";
import { usePayoutStatusQuery } from "@/hooks/queries/use-payout-status-query";
import { queryKeys } from "@/lib/query-keys";
import { getRequestErrorMessage } from "@/lib/utils";

export function PayoutProfileForm() {
  const { data: payoutStatus } = usePayoutStatusQuery();
  const { data: banks } = usePayoutBanksQuery();
  const { upsertPayoutProfile } = useAppMutations();
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const canResolveAccount = Boolean(bankCode && accountNumber.length === 10);

  const {
    data: resolvedAccount,
    error: resolveError,
    isFetching: isResolvingAccount
  } = useQuery({
    queryKey: queryKeys.organizer.resolveAccount(bankCode, accountNumber),
    queryFn: async () =>
      (
        await request.resolvePayoutAccount({
          bankCode,
          accountNumber
        })
      ).data,
    enabled: canResolveAccount,
    retry: false
  });

  useEffect(() => {
    if (!payoutStatus) {
      return;
    }

    setBankCode((current) => current || payoutStatus.bankCode || "");
  }, [payoutStatus]);

  const accountResolveMessage =
    canResolveAccount && resolveError
      ? getRequestErrorMessage(resolveError, "We could not verify that bank account.")
      : null;
  const accountName = resolvedAccount?.accountName || payoutStatus?.accountName || "";

  return (
    <section className="surface-panel p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">Payout profile</p>
          <p className="mt-2 text-sm leading-7 text-muted">
            Event creation is only enabled after this bank profile is verified and connected to a Paystack subaccount.
          </p>
        </div>
        {payoutStatus?.payoutReady ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#dff7ef] px-3 py-1 text-xs font-semibold text-success">
            <BadgeCheck className="h-4 w-4" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fff2df] px-3 py-1 text-xs font-semibold text-[#ca8a2b]">
            <AlertCircle className="h-4 w-4" />
            Setup needed
          </span>
        )}
      </div>

      {formError ? (
        <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-[#f0ccd2] bg-[#fff6f7] px-4 py-3 text-sm text-[#923647]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{formError}</p>
        </div>
      ) : null}

      <form
        className="mt-6 grid gap-5 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setFormError(null);

          try {
            await upsertPayoutProfile.mutateAsync({
              bankCode,
              accountNumber
            });
          } catch (error) {
            setFormError(getRequestErrorMessage(error, "We could not save your payout profile."));
          }
        }}
      >
        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Bank</span>
          <Select value={bankCode} onChange={(event) => setBankCode(event.target.value)} required>
            <option value="">Select bank</option>
            {(banks ?? []).map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-ink">Account number</span>
          <Input
            value={accountNumber}
            onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="0123456789"
            inputMode="numeric"
            required
          />
        </label>

        <div className="md:col-span-2">
          <div className="rounded-[16px] border border-line bg-surface-subtle px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">Verified account name</p>
                <p className="mt-1 text-xs leading-6 text-muted">
                  This name is fetched from the selected bank and account number.
                </p>
              </div>
              {resolvedAccount ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#dff7ef] px-3 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Resolved
                </span>
              ) : isResolvingAccount ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f5effd] px-3 py-1 text-xs font-semibold text-accent">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Checking
                </span>
              ) : null}
            </div>
            <div className="mt-4 rounded-[14px] border border-line/80 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-soft">
              {isResolvingAccount ? "Resolving account name..." : accountName || "Enter bank and 10-digit account number"}
            </div>
          </div>
        </div>

        {accountResolveMessage ? (
          <div className="md:col-span-2 flex items-start gap-3 rounded-[16px] border border-[#f0ccd2] bg-[#fff6f7] px-4 py-3 text-sm text-[#923647]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{accountResolveMessage}</p>
          </div>
        ) : null}

        <div className="md:col-span-2">
          <Button
            type="submit"
            variant="pill"
            disabled={upsertPayoutProfile.isPending || isResolvingAccount || !resolvedAccount}
          >
            {upsertPayoutProfile.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
            Save payout profile
          </Button>
        </div>
      </form>
    </section>
  );
}
