"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types/database";
import {
  UserAccount,
  DEFAULT_ACCOUNTS,
  getRegisteredUsers,
  getCurrentSession,
  setCurrentSession,
} from "@/lib/auth-storage";

export type DemoUser = UserAccount;
export const DEMO_USERS = DEFAULT_ACCOUNTS;

interface RoleContextType {
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEFAULT_ACCOUNTS[0]);

  useEffect(() => {
    // 1. 현재 저장된 세션이 있는지 확인
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
      return;
    }

    // 2. 과거 bidplate_demo_user 키 fallback 확인
    const saved = localStorage.getItem("bidplate_demo_user");
    if (saved) {
      const users = getRegisteredUsers();
      const found = users.find((u) => u.id === saved);
      if (found) {
        setCurrentUser(found);
        setCurrentSession(found);
      }
    }
  }, []);

  const handleSetUser = (user: UserAccount) => {
    setCurrentUser(user);
    setCurrentSession(user);
    localStorage.setItem("bidplate_demo_user", user.id);
  };

  const switchRole = (role: UserRole) => {
    const users = getRegisteredUsers();
    const target = users.find((u) => u.role === role) || DEFAULT_ACCOUNTS.find((u) => u.role === role);
    if (target) {
      handleSetUser(target);
    }
  };

  const logout = () => {
    setCurrentSession(null);
    localStorage.removeItem("bidplate_demo_user");
    setCurrentUser(DEFAULT_ACCOUNTS[0]);
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetUser,
        switchRole,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
