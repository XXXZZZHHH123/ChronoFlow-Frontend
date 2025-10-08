import { describe, expect, it } from "vitest";
import {
  MemberBulkUpsertResult,
  registeredFilterOptions,
} from "../member";

describe("services/member registeredFilterOptions", () => {
  it("returns registered filter pair", () => {
    expect(registeredFilterOptions()).toEqual([
      { label: "Registered", value: "true" },
      { label: "Not registered", value: "false" },
    ]);
  });
});

describe("services/member types", () => {
  it("allows creating MemberBulkUpsertResult shape", () => {
    const result: MemberBulkUpsertResult = {
      totalRows: 4,
      createdCount: 2,
      updatedCount: 1,
      failedCount: 1,
      failures: [
        {
          rowIndex: 3,
          email: "failed@example.com",
          reason: "Duplicate",
        },
      ],
    };

    expect(result.failures[0].reason).toBe("Duplicate");
  });
});
