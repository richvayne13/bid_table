"use client";

import { UserRole } from "@/types/database";

export interface UserAccount {
  id: string;
  email: string; // 아이디 또는 이메일
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

const STORAGE_USERS_KEY = "bidplate_registered_users_v3";
const STORAGE_SESSION_KEY = "bidplate_current_session_v3";
const STORAGE_ACTIVE_TOKENS_KEY = "bidplate_active_session_tokens_v3";

export interface ActiveSessionInfo {
  email: string;
  sessionToken: string;
  loginAt: string;
  userAgent?: string;
}

export const ADMIN_ACCOUNT: UserAccount = {
  id: "admin-richman2561",
  email: "richman2561",
  password: "11qqaazz..",
  name: "운영관리자 (richman2561)",
  role: "ADMIN",
  description: "견적식탁 플랫폼 최고 운영관리자 본부",
  badge: "운영관리자",
  phone: "010-0000-0000",
  createdAt: "2026-01-01",
};

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  ADMIN_ACCOUNT,
  {
    id: "b0000000-0000-0000-0000-000000000001",
    email: "salon@soonra.com",
    password: "password123",
    name: "살롱순라",
    role: "RESTAURANT",
    description: "서울 종로구 율곡로 8길 75 (익선동) / 한옥 캐주얼 다이닝 & 와인바 (스테이크/우육 전문)",
    badge: "입점 식당 (구매자)",
    businessNumber: "222-32-16745",
    representative: "살롱순라 대표",
    phone: "010-8888-9999",
    categories: ["육류 (소고기/돼지고기)"],
    regions: ["서울 종로구 율곡로"],
    createdAt: "2026-01-01",
  },
  {
    id: "c0000000-0000-0000-0000-000000000001",
    email: "belel@meat.com",
    password: "password123",
    name: "벨엘미트",
    role: "SUPPLIER",
    description: "서울특별시 성동구 마장로27길 6 (마장동 1층) / 도·소매 식육판매업",
    badge: "마장동 축산 공식 납품사",
    businessNumber: "258-40-00129",
    representative: "김지선",
    phone: "010-7475-7410",
    categories: ["축산/육류 (우육/수입육)"],
    regions: ["서울 전역", "종로구 익선동 직송"],
    trucks: 6,
    moq: "10만원 (1박스 이상)",
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
    // 항상 ADMIN_ACCOUNT가 최신 비밀번호(11qqaazz..)로 존재하도록 보장
    const adminIdx = list.findIndex(
      (u) => u.email.toLowerCase() === "richman2561" || u.id === "admin-richman2561"
    );
    if (adminIdx === -1) {
      list.unshift(ADMIN_ACCOUNT);
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
    } else {
      list[adminIdx] = { ...list[adminIdx], ...ADMIN_ACCOUNT };
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
    }
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
  const inputEmail = data.email.trim().toLowerCase();
  const inputPassword = (data.password || "").trim();

  // 관리자 아이디 충돌 방지
  if (inputEmail === "richman2561" || inputEmail === "admin") {
    return {
      success: false,
      error: "해당 아이디는 예약된 관리자 전용 아이디입니다.",
    };
  }

  const existing = users.find(
    (u) =>
      u.email.toLowerCase() === inputEmail ||
      (inputEmail.includes("@") && u.email.toLowerCase().split("@")[0] === inputEmail.split("@")[0])
  );
  if (existing) {
    return {
      success: false,
      error: "이미 가입된 아이디(이메일)입니다. 다른 아이디를 사용해 주세요.",
    };
  }

  // 고유 세션 토큰 생성
  const { sessionToken } = registerActiveSession(inputEmail);

  const newAccount: UserAccount & { sessionToken?: string } = {
    ...data,
    id: "usr-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 7),
    email: inputEmail,
    password: inputPassword,
    sessionToken,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const updated = [newAccount, ...users];
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save registered user:", e);
  }

  // 가입 즉시 세션 로그인 처리
  setCurrentSession(newAccount);

  return { success: true, user: newAccount };
}

export function getActiveSessionMap(): Record<string, ActiveSessionInfo> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_ACTIVE_TOKENS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function registerActiveSession(email: string): { sessionToken: string; hadPreviousSession: boolean } {
  if (typeof window === "undefined") return { sessionToken: "", hadPreviousSession: false };
  const map = getActiveSessionMap();
  const normalized = email.trim().toLowerCase();
  const hadPreviousSession = !!map[normalized];

  const sessionToken = "tok_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8);
  map[normalized] = {
    email: normalized,
    sessionToken,
    loginAt: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };

  try {
    localStorage.setItem(STORAGE_ACTIVE_TOKENS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to store active session:", e);
  }

  return { sessionToken, hadPreviousSession };
}

export function isSessionValid(email: string, token: string): boolean {
  if (typeof window === "undefined" || !email || !token) return true;
  const map = getActiveSessionMap();
  const current = map[email.trim().toLowerCase()];
  if (!current) return true;
  return current.sessionToken === token;
}

export function clearActiveSession(email: string) {
  if (typeof window === "undefined" || !email) return;
  const map = getActiveSessionMap();
  delete map[email.trim().toLowerCase()];
  try {
    localStorage.setItem(STORAGE_ACTIVE_TOKENS_KEY, JSON.stringify(map));
  } catch (e) {}
}

export function isEmailRegistered(email: string): boolean {
  if (typeof window === "undefined") return false;
  const normalized = email.trim().toLowerCase();
  if (normalized === "richman2561" || normalized === "admin") return true;
  const users = getRegisteredUsers();
  return users.some((u) => u.email.toLowerCase() === normalized);
}

export function loginUser(
  loginId: string,
  pass: string
): { success: boolean; user?: UserAccount; error?: string; hadPreviousSession?: boolean } {
  if (typeof window === "undefined") {
    return { success: false, error: "브라우저 환경이 아닙니다." };
  }

  const normalized = loginId.trim().toLowerCase();
  const inputPass = pass.trim();

  // 1. 운영관리자 전용 계정 인증 (아이디: richman2561, 비밀번호: 11qqaazz..)
  if (
    normalized === "richman2561" ||
    normalized === "richman2561@bidtable.com" ||
    normalized === "richman2561@bidplate.com"
  ) {
    if (inputPass === "11qqaazz..") {
      const { sessionToken, hadPreviousSession } = registerActiveSession(ADMIN_ACCOUNT.email);
      setCurrentSession({ ...ADMIN_ACCOUNT, sessionToken });
      return { success: true, user: ADMIN_ACCOUNT, hadPreviousSession };
    } else {
      return {
        success: false,
        error: "운영관리자 비밀번호가 일치하지 않습니다. (지정된 관리자 암호를 입력하세요)",
      };
    }
  }

  // 2. 일반 구매자/판매자 계정 인증
  const users = getRegisteredUsers();
  const target = users.find(
    (u) =>
      u.email.toLowerCase() === normalized ||
      u.email.toLowerCase().split("@")[0] === normalized ||
      (normalized.includes("@") && u.email.toLowerCase() === normalized)
  );

  if (!target) {
    return {
      success: false,
      error: "등록되지 않은 아이디(이메일)입니다. 가입하신 이메일 주소를 다시 확인해 주세요.",
    };
  }

  // 비밀번호 일치 검사 (앞뒤 공백 무시)
  const storedPassword = (target.password || "").trim();
  if (storedPassword && storedPassword !== inputPass) {
    return {
      success: false,
      error: "비밀번호가 일치하지 않습니다. 다시 확인해 주세요.",
    };
  }

  // 이메일 기준 중복 로그인 감지 및 고유 세션 발급
  const { sessionToken, hadPreviousSession } = registerActiveSession(target.email);
  const userWithToken = { ...target, sessionToken };
  setCurrentSession(userWithToken);

  return { success: true, user: userWithToken, hadPreviousSession };
}

export function getCurrentSession(): (UserAccount & { sessionToken?: string }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setCurrentSession(user: (UserAccount & { sessionToken?: string }) | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    const prev = getCurrentSession();
    if (prev?.email) {
      clearActiveSession(prev.email);
    }
    localStorage.removeItem(STORAGE_SESSION_KEY);
  } else {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  }
}
