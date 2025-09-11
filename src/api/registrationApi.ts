import { http } from "@/lib/http";
import { unwrap } from "@/lib/utils";
import type {
  MemberCompleteRegistration,
  MemberLookup,
  MemberPrefill,
  OrganizerRegistration,
} from "@/lib/validation/schema";

export async function registerOrganizer(input: OrganizerRegistration) {
  const payload = {
    name: input.name,
    username: input.user_name,
    userPassword: input.user_password,
    userEmail: input.user_email,
    mobile: input.user_mobile,
    organizationName: input.organisation_name,
    organizationAddress: input.organisation_address,
  };

  const res = await http.post("/system/reg/organizer", payload);
  return unwrap(res.data);
}

export async function registerMember(input: MemberCompleteRegistration) {
  const payload = {
    userId: Number(input.user_id),
    username: input.user_name,
    password: input.user_password,
    phone: input.user_mobile,
  };

  const res = await http.post("/system/reg/member", payload);
  return unwrap(res.data);
}

export async function getTenantMemberInfo(
  input: MemberLookup
): Promise<MemberPrefill> {
  const payload = {
    organizationId: input.organisation_id,
    userId: input.user_id,
  };

  const res = await http.post("/system/reg/search", payload);
  const body = unwrap(res.data) as any;

  return {
    organisation_name: body.organizationName,
    email: body.email,
  };
}
