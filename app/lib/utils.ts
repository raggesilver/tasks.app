import { clsx, type ClassValue } from "clsx";
import type { SerializeObject } from "nitropack";
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
