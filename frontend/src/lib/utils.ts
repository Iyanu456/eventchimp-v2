import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { isAxiosError } from "axios";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(value);

export const formatEventDate = (value: string) => format(new Date(value), "EEE, MMM d - h:mm a");

export const getRequestErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again.") => {
  if (isAxiosError<{ message?: string }>(error)) {
    if (!error.response) {
      return "Network error. Check your connection and try again.";
    }

    return error.response.data?.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
