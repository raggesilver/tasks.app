import { clsx, type ClassValue } from "clsx";
import type { SerializeObject } from "nitropack";
import { FetchError } from "ofetch";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export function formatFileSize(bytes: number, decimals = 2) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  if (bytes === 0) {
    return "0 B";
  }

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizes[i]}`;
}

type ObjectWithDates = { createdAt: Date; updatedAt?: Date };

export function normalizeDates<T extends ObjectWithDates>(
  input: SerializeObject<T>,
): T;
export function normalizeDates<T extends ObjectWithDates>(
  input: SerializeObject<T>[],
): T[];

export function normalizeDates<T extends ObjectWithDates>(input: T | T[]) {
  const normalize = (input: T) => ({
    ...input,
    createdAt: new Date(input.createdAt),
    ...(input.updatedAt && { updatedAt: new Date(input.updatedAt) }),
  });

  return Array.isArray(input) ? input.map(normalize) : normalize(input);
}

/**
 * Returns a specific error message from a FetchError or a default error
 * message.
 *
 * This function will return the `{ message }` passed in to createError in the
 * backend.
 *
 * @param error - The error object to inspect for a specific message.
 * @param defaultErrorMessage - The default error message to use if the error
 *   object does not have a specific message.
 * @returns The error message extracted from the error object or the default
 *   error message.
 */
export function getFetchErrorMessage(
  error: unknown,
  defaultErrorMessage = "An unexpected error occurred.",
) {
  return (
    (error instanceof FetchError && error.data?.message) || defaultErrorMessage
  );
}
