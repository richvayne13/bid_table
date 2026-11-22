"use client";

import { UserRole } from "@/types/database";

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  name: string; // 상호명 또는 식당명
  role: UserRole;
  description: string;
  badge: string;
  businessNumber?: string; // 사업자등록번호 (10자리)
  representative?: string; // 대표자명
  phone?: string; // 연락처
  categories?: string[]; // 취급 품목 (육류, 채소, 수산, 공산 등)
  regions?: string[]; // 배송 권역
  trucks?: number; // 냉장/냉동 탑차 보유 수
  moq?: string; // 최소주문금액
  createdAt: string;
}

const STORAGE_USERS_KEY = "bidplate_registered_users_v2";
const STORAGE_SESSION_KEY = "bidplate_current_session_v2";

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    email: "salon@soonra.com",
    password: "password123",
    name: "살롱순라",
    role: "RESTAURANT",
    description: "서울 종로구 율곡로 8길 75 (익선동) / 유러피안 다이닝 & 펍",
    badge: "식당 업주",
    phone: "010-8888-9999",
    createdAt: "2026-01-01",
  },
  {
    id: "c0000000-0000-0000-0000-000000000001",
    email: "supplier1@bidplate.com",
    password: "password123",
    name: "(주)한결축산 유통",
    role: "SUPPLIER",
    description: "수도권 전역 / 1등급 한돈 및 수입육 도매 전문",
    badge: "축산물 전문",
    businessNumber: "123-45-67890",
    representative: "김한결",
    phone: "010-1234-5678",
    categories: ["축산/육류"],
    regions: ["서울 전역", "경기 성남", "하남"],
    trucks: 12,
    moq: "10만원",
    createdAt: "2026-01-01",
  },
  {
    id: "c0000000-0000-0000-0000-000000000002",
    email: "supplier2@bidplate.com",
    password: "password123",
    name: "가락농산 신선물류",
    role: "SUPPLIER",
    description: "가락시장 직송 / 깐야채 및 전처리 채소 전문",
    badge: "농산물 전문",
    businessNumber: "234-56-78901",
    representative: "이신선",
    phone: "010-2345-6789",
    categories: ["채소/농산"],
    regions: ["서울 전역", "경기 고양", "일산"],
    trucks: 16,
    moq: "7만원",
    createdAt: "2026-01-01",
  },
  {
    id: "a0000000-0000-0000-0000-000000000001",
    email: "admin@bidplate.com",
    password: "password123",
    name: "견적식탁 운영본부",
    role: "ADMIN",
    description: "시스템 관리자 / 표준 품목 및 단가 감시",
    badge: "플랫폼 관리자",
    createdAt: "2026-01-01",
  },
];

export function getRegisteredUsers(): UserAccount[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const list = JSON.parse(raw) as UserAccount[];
    return list;
  } catch (e) {
    console.error("Failed to read registered users:", e);
    return DEFAULT_ACCOUNTS;
  }
}

export function registerUser(
  data: Omit<UserAccount, "id" | "createdAt">
): { success: boolean; user?: UserAccount; error?: string } {
  if (typeof window === "undefined") {
    return { success: false, error: "브라우저 환경이 아닙니다." };
  }

  const users = getRegisteredUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
  );

  if (existing) {
    return {
      success: false,
      error: "이미 가입된 이메일(아이디)입니다. 다른 이메일을 사용해 주세요.",
    };
  }

  const newAccount: UserAccount = {
    ...data,
    id: "usr-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7),
    email: data.email.trim().toLowerCase(),
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newAccount, ...users];
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));

  // 가입 즉시 세션 로그인 처리
  setCurrentSession(newAccount);

  return { success: true, user: newAccount };
}

export function loginUser(
  email: string,
  pass: string
): { success: boolean; user?: UserAccount; error?: string } {
  if (typeof window === "undefined") {
    return { success: false, error: "브라우저 환경이 아닙니다." };
  }

  const users = getRegisteredUsers();
  const target = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!target) {
    return {
      success: false,
      error: "등록되지 않은 이메일입니다. 이메일을 확인하거나 회원가입을 진행해 주세요.",
    };
  }

  // 비밀번호 일치 검사 (비밀번호가 없는 초기 계정은 어떤 비밀번호든 허용)
  if (target.password && target.password !== pass) {
    return {
      success: false,
      error: "비밀번호가 일치하지 않습니다. 다시 확인해 주세요.",
    };
  }

  setCurrentSession(target);
  return { success: true, user: target };
}

export function getCurrentSession(): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setCurrentSession(user: UserAccount | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } else {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  }
}
