import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ApiResponse } from "./type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function unwrap<T>(res: ApiResponse<T>): T {
  if (res.code !== 0) {
    throw new Error(res.msg || "An unexpected error occurred");
  }
  return res.data as T;
}
