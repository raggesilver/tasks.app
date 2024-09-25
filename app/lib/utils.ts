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
