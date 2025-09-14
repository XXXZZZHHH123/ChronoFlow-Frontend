import { http } from "@/lib/http";
import type { ApiResponse } from "@/lib/type";
import { unwrap } from "@/lib/utils";
import {
  type BulkUpsertResult,
  type Member,
  MembersResponseSchema,
} from "@/lib/validation/schema";

export async function getMembers(): Promise<Member[]> {
  const fakeRes: ApiResponse<Member[]> = {
    code: 0,
    data: [
      {
        id: 1,
        name: "lushuwen",
        email: "e1241986@u.nus.edu",
        phone: "82423931",
        roles: [0, 1],
        registered: true,
      },
      {
        id: 2,
        name: "soesoe",
        email: "e1111111@u.nus.edu",
        phone: "999999",
        roles: [0],
        registered: true,
      },
      {
        id: 3,
        name: "cyl01",
        email: "1@qq.com",
        phone: "82423931",
        roles: [1],
        registered: false,
      },
    ],
    msg: "ok",
  };

  await new Promise((r) => setTimeout(r, 300));

  const raw = unwrap<Member[]>(fakeRes);
  return MembersResponseSchema.parse(raw);
}

export async function uploadMembersExcel(
  file: File
): Promise<BulkUpsertResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await http.post("/organizer/users/bulk-upsert", form);

  return unwrap<BulkUpsertResult>(res.data);
}
