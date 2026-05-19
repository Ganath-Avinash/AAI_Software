import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Role = "admin" | "regular" | null;

interface AuthContextType {
  role: Role;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  changePassword: (oldPass: string, newPass: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_PASSWORDS = {
  admin: "admin",
  regular: "password"
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    try {
      const stored = localStorage.getItem("auth_role");
      if (stored === "admin" || stored === "regular") return stored;
    } catch {}
    return null;
  });

  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem("auth_passwords");
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_PASSWORDS;
  });

  useEffect(() => {
    try { localStorage.setItem("auth_passwords", JSON.stringify(passwords)); } catch {}
  }, [passwords]);

  const login = (username: string, pass: string) => {
    const r = username.toLowerCase();
    if ((r === "admin" || r === "regular") && passwords[r] === pass) {
      setRole(r as Role);
      try { localStorage.setItem("auth_role", r); } catch {}
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
    try { localStorage.removeItem("auth_role"); } catch {}
  };

  const changePassword = (oldPass: string, newPass: string) => {
    if (!role) return false;
    if (passwords[role] !== oldPass) return false;
    
    setPasswords(prev => ({
      ...prev,
      [role]: newPass
    }));
    return true;
  };

  return <AuthContext.Provider value={{ role, login, logout, changePassword }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
