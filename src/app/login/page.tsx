"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole, DEMO_USERS } from "@/contexts/RoleContext";
import { UtensilsCrossed, Truck, ShieldCheck, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("이메일을 입력해 주세요.");
      return;
    }
    // 기본으로 식당 계정으로 로그인 처리
    const restaurantUser = DEMO_USERS.find((u) => u.role === "RESTAURANT") || DEMO_USERS[0];
    setCurrentUser(restaurantUser);
    router.push("/");
  };

  const handleQuickLogin = (userId: string) => {
    const target = DEMO_USERS.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      if (target.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-xl p-8 space-y-6">
        {/* 타이틀 (숨고 캡처 6 디자인 매칭) */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900">로그인</h1>
          <p className="text-xs text-gray-400 mt-1">
            식당 사장님과 유통사를 잇는 식자재 숨고, 견적식탁
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@bidtable.com"
              className="w-full px-3.5 py-3 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요."
              className="w-full px-3.5 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-black text-sm shadow-md transition-all"
          >
            이메일 로그인
          </button>
        </form>

        {/* 이메일 찾기 / 비밀번호 찾기 */}
        <div className="flex items-center justify-center space-x-3 text-xs text-gray-400">
          <button type="button" className="hover:text-gray-600 transition-colors">
            이메일 찾기
          </button>
          <span>|</span>
          <button type="button" className="hover:text-gray-600 transition-colors">
            비밀번호 찾기
          </button>
          <span>|</span>
          <Link href="/supplier-join" className="text-indigo-600 font-bold hover:underline">
            회원가입
          </Link>
        </div>

        {/* 소셜 로그인 버튼들 (카카오 & 네이버 숨고 스타일) */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("10000000-0000-0000-0000-000000000001")}
            className="w-full py-3 rounded-xl bg-[#FEE500] hover:brightness-95 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <span className="text-sm">💬</span>
            <span>카카오로 시작하기</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("10000000-0000-0000-0000-000000000001")}
            className="w-full py-3 rounded-xl bg-[#03C75A] hover:brightness-95 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <span className="font-black text-sm">N</span>
            <span>네이버로 시작하기</span>
          </button>
        </div>

        {/* 빠른 데모 체험 선택기 */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 text-center mb-2">
            원클릭 데모 모드로 바로 둘러보기
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <button
              onClick={() => handleQuickLogin("10000000-0000-0000-0000-000000000001")}
              className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-bold transition-colors"
            >
              식당 사장님
            </button>
            <button
              onClick={() => handleQuickLogin("30000000-0000-0000-0000-000000000001")}
              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-colors"
            >
              식자재 유통사
            </button>
            <button
              onClick={() => handleQuickLogin("00000000-0000-0000-0000-000000000001")}
              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors"
            >
              관리자 모드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
