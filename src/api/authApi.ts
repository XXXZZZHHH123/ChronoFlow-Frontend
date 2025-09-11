import { useAuthStore } from "@/lib/auth-store";
import { http } from "@/lib/http";
import type { User, AuthCredentials } from "@/lib/auth-type";
import type { LoginUser } from "@/lib/validation/schema";
import type { ApiResponse } from "@/lib/type";
import { unwrap } from "@/lib/utils";

let refreshing: Promise<boolean> | null = null;

function setAuthFromServer(payload: AuthCredentials) {
  const s = useAuthStore.getState();
  const credentials: AuthCredentials = {
    user: (payload.user ?? s.user) as User,
  };
  s.setAuth(credentials);
}

export async function login(credentials: LoginUser) {
  const res = await http.post<ApiResponse<{ user: User }>>(
    "/system/auth/login",
    credentials
  );
  const data = unwrap(res.data);
  if (data?.user) {
    setAuthFromServer({ user: data.user });
  }
  return data;
}

export async function logout() {
  try {
    await http.post("/system/auth/logout", {});
  } catch {
    // ignore network errors
  } finally {
    useAuthStore.getState().clear();
  }
}

export function refresh(): Promise<boolean> {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    try {
      const r = await http.post("/system/auth/refresh", {});
      const { user } = r.data?.data ?? {};
      if (user) setAuthFromServer({ user });
      return true;
    } catch {
      useAuthStore.getState().clear();
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}
