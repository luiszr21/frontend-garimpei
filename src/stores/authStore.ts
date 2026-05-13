import { create } from "zustand";

type Role = "user" | "admin" | null;

function isRole(value: string | null): value is Exclude<Role, null> {
  return value === "user" || value === "admin";
}

function readRoleFromStorage(): Role {
  const storedRole = localStorage.getItem("role");

  return isRole(storedRole) ? storedRole : null;
}

interface AuthState {
  token: string | null;
  role: Role;
  userId: string | null;

  login: (data: {
    token: string;
    role: Role;
    userId: string;
  }) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Ler dados persistidos do localStorage apenas na inicialização
  const storedToken = localStorage.getItem("token");
  const storedRole = readRoleFromStorage();
  const storedUserId = localStorage.getItem("userId");

  return {
    token: storedToken,
    role: storedRole,
    userId: storedUserId,

    login: ({ token, role, userId }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "");
      localStorage.setItem("userId", userId);

      set({ token, role, userId });
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");

      set({ token: null, role: null, userId: null });
    }
  };
});
