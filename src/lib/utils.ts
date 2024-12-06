import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { restClient } from "@polygon.io/client-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const rest = restClient(process.env.POLYGON_API_KEY);
