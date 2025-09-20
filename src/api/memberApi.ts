import { http } from "@/lib/http";
import type { MemberBulkUpsertResult } from "@/services/member";
import { unwrap } from "@/lib/utils";
import {
  type Member,
  type MemberConfig,
  MembersResponseSchema,
} from "@/lib/validation/schema";

export async function getMembers(): Promise<Member[]> {
  const res = await http.get("/organizer/users");
  const raw = unwrap<Member[]>(res.data);
  return MembersResponseSchema.parse(raw);
}

export async function uploadMembersExcel(
  file: File
): Promise<MemberBulkUpsertResult> {
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await http.post("/organizer/users/bulk-upsert", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap<MemberBulkUpsertResult>(res.data);
}

export async function createMember(input: MemberConfig) {
  const payload = {
    email: input.email,
    roleIds: input.roleIds,
    ...(input.remark ? { remark: input.remark } : {}),
  };

  const res = await http.post("/organizer/create/user", payload);
  return unwrap(res.data);
}

export async function updateMember(id: string, input: MemberConfig) {
  const payload = {
    email: input.email,
    roleIds: input.roleIds,
    ...(input.remark ? { remark: input.remark } : {}),
  };

  const res = await http.patch(`/organizer/update/user/${id}`, payload);
  return unwrap(res.data);
}

export async function deleteMember(id: string) {
  const res = await http.delete(`/organizer/delete/user/${id}`);
  return unwrap(res.data);
}
