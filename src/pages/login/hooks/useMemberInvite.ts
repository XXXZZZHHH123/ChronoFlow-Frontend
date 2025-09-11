import { getTenantMemberInfo } from "@/api/registrationApi";
import type { MemberLookup, MemberPrefill } from "@/lib/validation/schema";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export type UseMemberInviteType = {
  prefill: MemberPrefill | null;
  loading: boolean;
  err: string | null;
  lookup: (params: MemberLookup) => Promise<MemberPrefill>;
  fromInviteLink: boolean;
  userId: string | null;
  clearInvite: () => void;
};

export function useMemberInvite(): UseMemberInviteType {
  const [params] = useSearchParams();
  const [prefill, setPrefill] = useState<MemberPrefill | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const lookup = useCallback(
    async ({ organisation_id, user_id }: MemberLookup) => {
      setLoading(true);
      setErr(null);
      try {
        const result = await getTenantMemberInfo({ organisation_id, user_id });

        const p: MemberPrefill = {
          organisation_name: result.organisation_name,
          email: result.email,
        };

        setPrefill(p);
        setUserId(user_id);
        return p;
      } catch (e: any) {
        const msg = e?.message ?? "Lookup failed";
        setErr(msg);
        setPrefill(null);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearInvite = useCallback(() => {
    setPrefill(null);
    setUserId(null);
    setErr(null);
  }, []);

  useEffect(() => {
    const eid = params.get("organisation_id");
    const uid = params.get("user_id");
    if (!eid || !uid) return;

    (async () => {
      try {
        await lookup({ organisation_id: eid, user_id: uid });
        setUserId(uid);
      } catch {}
    })();
  }, [params, lookup]);

  const fromInviteLink = !!(
    params.get("organisation_id") && params.get("user_id")
  );

  return { prefill, loading, err, lookup, fromInviteLink, userId, clearInvite };
}
