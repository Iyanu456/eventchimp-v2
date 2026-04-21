import { EventModel } from "../models/Event";
import { OrganizerProfileModel } from "../models/OrganizerProfile";
import { AppError } from "../utils/app-error";
import {
  createOrUpdatePaystackSubaccount,
  listPaystackBanks,
  resolvePaystackAccount
} from "./paystack.service";

type UpsertPayoutProfileInput = {
  bankCode: string;
  accountNumber: string;
};

const maskAccountNumber = (accountNumber: string) =>
  accountNumber.length < 4 ? accountNumber : `${"*".repeat(accountNumber.length - 4)}${accountNumber.slice(-4)}`;

const syncEventPayoutReady = async (organizerId: string, payoutReady: boolean) => {
  await EventModel.updateMany({ organizerId }, { $set: { payoutReady } });
};

export const getPayoutBanks = async () => listPaystackBanks();

export const resolveOrganizerPayoutAccount = async (input: UpsertPayoutProfileInput) => {
  const resolved = await resolvePaystackAccount(input.accountNumber, input.bankCode);

  return {
    accountName: resolved.account_name,
    accountNumber: resolved.account_number,
    bankCode: input.bankCode
  };
};

export const getOrganizerPayoutStatus = async (userId: string) => {
  const organizerProfile = await OrganizerProfileModel.findOne({ userId });
  if (!organizerProfile) {
    throw new AppError("Organizer profile not found", 404);
  }

  return {
    payoutReady: organizerProfile.payoutReady,
    payoutStatus: organizerProfile.payoutStatus,
    riskStatus: organizerProfile.riskStatus,
    businessName: organizerProfile.payoutProfile.businessName,
    bankCode: organizerProfile.payoutProfile.bankCode,
    bankName: organizerProfile.payoutProfile.bankName,
    accountNumberMasked: maskAccountNumber(organizerProfile.payoutProfile.accountNumber),
    accountName: organizerProfile.payoutProfile.accountName,
    currency: organizerProfile.payoutProfile.currency,
    subaccountCode: organizerProfile.payoutProfile.subaccountCode,
    settlementSchedule: organizerProfile.payoutProfile.settlementSchedule,
    reviewNote: organizerProfile.payoutProfile.reviewNote
  };
};

export const upsertOrganizerPayoutProfile = async (userId: string, input: UpsertPayoutProfileInput) => {
  const organizerProfile = await OrganizerProfileModel.findOne({ userId });
  if (!organizerProfile) {
    throw new AppError("Organizer profile not found", 404);
  }

  if (organizerProfile.riskStatus === "blocked") {
    throw new AppError("Payout changes are blocked for this organizer", 403);
  }

  const resolved = await resolvePaystackAccount(input.accountNumber, input.bankCode);
  const subaccount = await createOrUpdatePaystackSubaccount(
    {
      businessName: resolved.account_name,
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      percentageCharge: 0
    },
    organizerProfile.payoutProfile.subaccountCode || undefined
  );

  organizerProfile.payoutReady = true;
  organizerProfile.payoutStatus = "verified";
  organizerProfile.payoutProfile = {
    businessName: resolved.account_name,
    bankCode: input.bankCode,
    bankName: subaccount.settlement_bank || organizerProfile.payoutProfile.bankName,
    accountNumber: resolved.account_number,
    accountName: resolved.account_name,
    currency: "NGN",
    subaccountCode: subaccount.subaccount_code,
    subaccountId: subaccount.id,
    settlementSchedule: subaccount.settlement_schedule ?? "AUTO",
    percentageCharge: subaccount.percentage_charge ?? 0,
    verifiedAt: new Date(),
    reviewNote: ""
  } as never;

  await organizerProfile.save();
  await syncEventPayoutReady(userId, true);

  return getOrganizerPayoutStatus(userId);
};

export const reviewOrganizerPayout = async (
  userId: string,
  input: {
    payoutStatus?: "pending_review" | "verified" | "rejected" | "suspended";
    riskStatus?: "clear" | "under_review" | "blocked";
    reviewNote?: string;
  }
) => {
  const organizerProfile = await OrganizerProfileModel.findOne({ userId });
  if (!organizerProfile) {
    throw new AppError("Organizer profile not found", 404);
  }

  if (input.payoutStatus) {
    organizerProfile.payoutStatus = input.payoutStatus;
  }

  if (input.riskStatus) {
    organizerProfile.riskStatus = input.riskStatus;
  }

  if (input.reviewNote !== undefined) {
    organizerProfile.payoutProfile.reviewNote = input.reviewNote;
  }

  organizerProfile.payoutReady =
    organizerProfile.payoutStatus === "verified" && organizerProfile.riskStatus !== "blocked";

  await organizerProfile.save();
  await syncEventPayoutReady(userId, organizerProfile.payoutReady);

  return getOrganizerPayoutStatus(userId);
};
