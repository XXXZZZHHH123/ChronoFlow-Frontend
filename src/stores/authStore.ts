import { create } from "zustand";
import type { AuthState, AuthCredentials } from "../lib/auth-type";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  setAuth: ({ user }: AuthCredentials) => {
    set({ user });
  },

  clear: () => {
    set({ user: null });
  },
}));
