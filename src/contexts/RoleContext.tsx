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
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. 현재 저장된 세션이 있는지 확인
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }

    // 2. 다른 탭/창에서 세션 변경 또는 중복 로그인 발생 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "bidplate_current_session_v3" || e.key === "bidplate_active_session_tokens_v3") {
        const latestSession = getCurrentSession();
        if (!latestSession) {
          setCurrentUser(null);
        } else {
          setCurrentUser(latestSession);
        }
      }
    };

    // 3. 주기적 중복 로그인 세션 무효화 체크 (5초마다 검사)
    const checkInterval = setInterval(() => {
      const current = getCurrentSession();
      if (current && current.email && (current as any).sessionToken) {
        // 전역 활성 토큰과 내 토큰 대조
        const rawMap = localStorage.getItem("bidplate_active_session_tokens_v3");
        if (rawMap) {
          try {
            const map = JSON.parse(rawMap);
            const active = map[current.email.trim().toLowerCase()];
            if (active && active.sessionToken !== (current as any).sessionToken) {
              // 다른 기기나 창에서 새로 로그인된 경우 -> 중복 로그인 차단
              setCurrentSession(null);
              setCurrentUser(null);
              alert(
                `[중복 로그인 감지]\n'${current.email}' 계정으로 다른 기기나 브라우저에서 새로 접속하여 현재 기기의 연결이 안전하게 종료되었습니다.`
              );
            }
          } catch (e) {}
        }
      }
    }, 4000);

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(checkInterval);
    };
  }, []);

  const handleSetUser = (user: UserAccount | null) => {
    setCurrentUser(user);
    setCurrentSession(user);
    if (user) {
      localStorage.setItem("bidplate_demo_user", user.id);
    } else {
      localStorage.removeItem("bidplate_demo_user");
    }
  };

  const switchRole = (role: UserRole) => {
    const users = getRegisteredUsers();
    const target =
      users.find((u) => u.role === role) ||
      DEFAULT_ACCOUNTS.find((u) => u.role === role);
    if (target) {
      handleSetUser(target);
    }
  };

  const logout = () => {
    handleSetUser(null);
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetUser,
        switchRole,
        logout,
        isLoggedIn: Boolean(currentUser),
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
