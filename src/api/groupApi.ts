// src/api/groupApi.ts
import { http } from "@/lib/http";
import { unwrap } from "@/lib/utils";
import type {
  Group,
  GroupConfig,
  CreateGroupConfig,
  GroupMember,
} from "@/lib/validation/schema";

export async function getGroupsByEvent(eventId: string): Promise<Group[]> {
  const res = await http.get(`/system/group/list?eventId=${eventId}`);
  return unwrap<Group[]>(res.data);
}

export async function createGroup(input: CreateGroupConfig) {
  const payload = {
    name: input.name,
    eventId: input.eventId,
    leadUserId: input.leadUserId || null,
    remark: input.remark || null,
    sort: input.sort || 0,
  };
  const res = await http.post("/system/group/create", payload);
  return unwrap(res.data);
}

export async function updateGroup(id: string, input: GroupConfig) {
  const payload = {
    id: id,
    name: input.name,
    leadUserId: input.leadUserId || null,
    remark: input.remark || null,
    sort: input.sort,
    status: input.status,
  };
  const res = await http.put("/system/group/update", payload);
  return unwrap(res.data);
}

export async function deleteGroup(id: string) {
  const res = await http.delete(`/system/group/delete/${id}`);
  return unwrap(res.data);
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const res = await http.get(`/system/group/${groupId}/members`);
  return unwrap<GroupMember[]>(res.data);
}

export async function addMemberToGroup(groupId: string, userId: string) {
  const res = await http.post(`/system/group/${groupId}/members/${userId}`);
  return unwrap(res.data);
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const res = await http.delete(`/system/group/${groupId}/members/${userId}`);
  return unwrap(res.data);
}

export async function addMembersToGroup(groupId: string, userIds: string[]) {
  const res = await http.post(`/system/group/${groupId}/members/batch`, {
    userIds: userIds,
  });
  return unwrap(res.data);
}

export async function removeMembersFromGroup(
  groupId: string,
  userIds: string[]
) {
  const res = await http.delete(`/system/group/${groupId}/members/batch`, {
    data: userIds,
  });
  return unwrap(res.data);
}
