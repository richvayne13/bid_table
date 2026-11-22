"use client";

import React, { useState } from "react";
import { AdminNavTabs } from "@/components/admin/AdminNavTabs";
import { useRole } from "@/contexts/RoleContext";
import { loginUser } from "@/lib/auth-storage";
import { ShieldCheck, Lock, AlertCircle, ArrowRight, UserCheck } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, setCurrentUser } = useRole();
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = loginUser(adminId, adminPassword);
    if (result.success && result.user && result.user.role === "ADMIN") {
      setCurrentUser(result.user);
    } else {
      setErrorMsg(
        result.error || "운영관리자 아이디 또는 비밀번호가 일치하지 않습니다."
      );
    }
  };

  // 관리자로 로그인되어 있지 않은 경우 -> 관리자 보안 인증 화면 표시
  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gray-50/70">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-700 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest block">
              SECURITY ACCESS GATE
            </span>
            <h1 className="text-2xl font-black text-gray-900">
              운영관리자 인증 로그인
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              본 영역은 플랫폼 관리자 전용 관제 화면입니다.<br />
              지정된 운영관리자 계정 정보를 입력해 주세요.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                관리자 아이디
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="예: richman2561"
                  className="w-full pl-10 pr-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">
                관리자 비밀번호
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="관리자 암호 입력"
                  className="w-full pl-10 pr-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>운영관리자 모드 접속하기</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-100">
            관리자 계정 분실 시 시스템 개발자에게 문의하세요.
          </div>
        </div>
      </div>
    );
  }

  // 관리자 인증 통과 시 정상 렌더링
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AdminNavTabs />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
