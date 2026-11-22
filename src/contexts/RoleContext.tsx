"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, Profile } from "@/types/database";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  description: string;
  badge: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    email: "bistro@bidplate.com",
    name: "청주 파스타공방",
    role: "RESTAURANT",
    description: "충북 청주시 흥덕구 복대동 / 이탈리안 다이닝",
    badge: "식당 업주",
  },
  {
    id: "c0000000-0000-0000-0000-000000000001",
    email: "supplier1@bidplate.com",
    name: "A종합유통 (대성푸드)",
    role: "SUPPLIER",
    description: "충북 청주 전역 / 공산품, 유제품, 식자재 종합 유통",
    badge: "종합 유통사",
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    email: "supplier2@bidplate.com",
    name: "B미트 육류전문 (하나미트)",
    role: "SUPPLIER",
    description: "청주 흥덕구·청원구 / 수입육·한우·돈육 전문 공급",
    badge: "육류 전문",
  },
  {
    id: "c0000000-0000-0000-0000-000000000003",
    email: "supplier3@bidplate.com",
    name: "C프레시 신선/유제품 (청주 프레시원)",
    role: "SUPPLIER",
    description: "청주 흥덕구·서원구 / 신선채소, 유제품, 해산물",
    badge: "신선/유제품",
  },
  {
    id: "a0000000-0000-0000-0000-000000000001",
    email: "admin@bidplate.com",
    name: "견적식탁 운영본부",
    role: "ADMIN",
    description: "시스템 관리자 / 표준 품목, 가상 유통사, 단가 모니터링",
    badge: "플랫폼 관리자",
  },
];

interface RoleContextType {
  currentUser: DemoUser;
  setCurrentUser: (user: DemoUser) => void;
  switchRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<DemoUser>(DEMO_USERS[0]);

  useEffect(() => {
    const saved = localStorage.getItem("bidplate_demo_user");
    if (saved) {
      try {
        const found = DEMO_USERS.find((u) => u.id === saved);
        if (found) setCurrentUser(found);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSetUser = (user: DemoUser) => {
    setCurrentUser(user);
    localStorage.setItem("bidplate_demo_user", user.id);
  };

  const switchRole = (role: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === role);
    if (target) {
      handleSetUser(target);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetUser,
        switchRole,
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
