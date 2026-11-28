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

  // 관리자로 로그인되어 있지 않은 경우 -> 관리자 보안 인증 화면 표시 (파란색 바탕)
  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-br from-[#06152b] via-[#0a2346] to-[#0f3460]">
        <div className="bg-[#0e274d] rounded-3xl border border-blue-800 shadow-2xl p-8 max-w-md w-full space-y-6 text-white">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-300 border border-blue-400/30">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <span className="text-[11px] font-black text-blue-300 uppercase tracking-widest block">
              SECURITY ACCESS GATE · BLUE ADMIN
            </span>
            <h1 className="text-2xl font-black text-white">
              운영관리자 인증 로그인
            </h1>
            <p className="text-xs text-blue-200 leading-relaxed">
              본 영역은 플랫폼 관리자 전용 파란색 관제 화면입니다.<br />
              지정된 운영관리자 계정 정보를 입력해 주세요.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/80 text-xs text-rose-200 font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-blue-200">
                관리자 아이디
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="예: richman2561"
                  className="w-full pl-10 pr-3.5 py-3 border border-blue-700 bg-blue-950/60 text-white rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-all font-mono placeholder:text-blue-400/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-blue-200">
                관리자 비밀번호
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="관리자 암호 입력"
                  className="w-full pl-10 pr-3.5 py-3 border border-blue-700 bg-blue-950/60 text-white rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-all font-mono placeholder:text-blue-400/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>운영관리자 모드 접속하기</span>
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-blue-300/70 border-t border-blue-800/80">
            관리자 계정: richman2561 / 11qqaazz..
          </div>
        </div>
      </div>
    );
  }

  // 관리자 인증 통과 시 정상 렌더링 (운영관리자 모드는 무조건 파란색 바탕)
  return (
    <div className="min-h-screen bg-[#07192f] text-slate-100 pb-16">
      <AdminNavTabs />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
