import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Role = "admin" | "regular" | null;

interface AuthContextType {
  role: Role;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    try {
      const stored = localStorage.getItem("auth_role");
      if (stored === "admin" || stored === "regular") return stored as Role;
    } catch {}
    return null;
  });

  const login = async (username: string, pass: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        const r = data.role as Role;
        setRole(r);
        localStorage.setItem("auth_role", r as string);
        localStorage.setItem("auth_token", data.token);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_token");
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return <AuthContext.Provider value={{ role, login, logout, changePassword }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
