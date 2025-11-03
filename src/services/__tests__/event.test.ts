import { describe, expect, it } from "vitest";
import {
  eventStatusFilterOptions,
  getEventStatusStyles,
  getEventStatusText,
} from "../event";
import type { EventStatusCode } from "../event";

describe("services/event getEventStatusText", () => {
  const cases: Array<[EventStatusCode, string]> = [
    [0, "Not started"],
    [1, "Active"],
    [2, "Completed"],
    [null, "Unknown"],
    [undefined, "Unknown"],
    [99 as EventStatusCode, "Unknown"],
  ];

  it.each(cases)("returns %s for status %s", (status, expected) => {
    expect(getEventStatusText(status)).toBe(expected);
  });
});

describe("services/event eventStatusFilterOptions", () => {
  it("returns static filter options", () => {
    expect(eventStatusFilterOptions()).toEqual([
      { label: "Not started", value: "0" },
      { label: "Active", value: "1" },
      { label: "Completed", value: "2" },
    ]);
  });
});

describe("services/event getEventStatusStyles", () => {
  it("returns matching badge styles per status", () => {
    expect(getEventStatusStyles(0)).toEqual({
      badge: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
      dot: "bg-zinc-500",
    });
    expect(getEventStatusStyles(1)).toEqual({
      badge: "bg-violet-100 text-violet-700 ring-violet-500/20",
      dot: "bg-violet-500",
    });
    expect(getEventStatusStyles(2)).toEqual({
      badge: "bg-emerald-100 text-emerald-700 ring-emerald-500/20",
      dot: "bg-emerald-500",
    });
  });

  it("falls back to unknown styles", () => {
    expect(getEventStatusStyles(null)).toEqual({
      badge: "bg-amber-100 text-amber-700 ring-amber-500/20",
      dot: "bg-amber-500",
    });
  });
});
