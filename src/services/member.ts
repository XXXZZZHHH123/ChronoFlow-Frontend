export function registeredFilterOptions() {
  return [
    { label: "Registered", value: "true" },
    { label: "Not registered", value: "false" },
  ];
}

//Bulk Member
export type MemberBulkUpsertFailure = {
  rowIndex: number;
  email: string;
  reason: string;
};

export type MemberBulkUpsertResult = {
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  failedCount: number;
  failures: MemberBulkUpsertFailure[];
};
