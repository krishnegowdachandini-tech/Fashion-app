import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const login = (email, password) => {
    const stored = JSON.parse(localStorage.getItem(`user_${email}`) || "null");
    if (!stored || stored.password !== password) {
      return { success: false, message: "Invalid email or password" };
    }
    const session = { name: stored.name, email: stored.email };
    setUser(session);
    localStorage.setItem("user", JSON.stringify(session));
    return { success: true };
  };

  const register = (name, email, password) => {
    if (localStorage.getItem(`user_${email}`)) {
      return { success: false, message: "Email already registered" };
    }
    const record = { name, email, password };
    localStorage.setItem(`user_${email}`, JSON.stringify(record));
    const session = { name, email };
    setUser(session);
    localStorage.setItem("user", JSON.stringify(session));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
