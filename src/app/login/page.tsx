"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import { loginUser, getRegisteredUsers } from "@/lib/auth-storage";
import {
  UtensilsCrossed,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [socialModal, setSocialModal] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("아이디(이메일)를 입력해 주세요.");
      return;
    }

    const result = loginUser(email, password);
    if (!result.success || !result.user) {
      setError(result.error || "로그인에 실패했습니다.");
      return;
    }

    // RoleContext에 로그인 사용자 반영
    setCurrentUser(result.user);

    // 역할별 페이지 이동
    if (result.user.role === "SUPPLIER") {
      router.push("/supplier/rfqs");
    } else if (result.user.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass = "password123") => {
    const result = loginUser(demoEmail, demoPass);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      if (result.user.role === "SUPPLIER") router.push("/supplier/rfqs");
      else if (result.user.role === "ADMIN") router.push("/admin");
      else router.push("/");
    }
  };

  const registeredUsers = typeof window !== "undefined" ? getRegisteredUsers() : [];

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 bg-gray-50/50">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-200 shadow-xl p-8 space-y-6">
        {/* 타이틀 (숨고 캡처 6 디자인 매칭) */}
        <div className="text-center">
          <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider">
            BIDPLATE LOGIN
          </span>
          <h1 className="text-2xl font-black text-gray-900 mt-0.5">로그인</h1>
          <p className="text-xs text-gray-400 mt-1">
            식당 사장님과 유통사를 잇는 식자재 숨고, 견적식탁
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
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
              className="w-full px-3.5 py-3 border border-gray-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해 주세요."
              className="w-full px-3.5 py-3 border border-gray-200 focus:border-indigo-500 rounded-xl text-sm focus:outline-none transition-all placeholder:text-gray-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-black text-sm shadow-md transition-all"
          >
            이메일 로그인
          </button>
        </form>

        {/* 구매자 / 판매자 회원가입 선택 링크 */}
        <div className="pt-1 pb-1">
          <p className="text-[11px] font-bold text-gray-400 text-center mb-2">
            아직 견적식탁 회원이 아니신가요?
          </p>
          <div className="grid grid-cols-2 gap-2 text-center">
            <Link
              href="/restaurant/register"
              className="py-2.5 px-3 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors"
            >
              🍝 구매자(식당) 가입
            </Link>
            <Link
              href="/supplier/register"
              className="py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
            >
              🥩 판매자(유통사) 가입
            </Link>
          </div>
        </div>

        {/* 소셜 로그인 버튼들 (카카오 & 네이버 숨고 스타일) */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => setSocialModal("카카오")}
            className="w-full py-3 rounded-xl bg-[#FEE500] hover:brightness-95 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <span className="text-sm">💬</span>
            <span>카카오로 시작하기</span>
          </button>

          <button
            type="button"
            onClick={() => setSocialModal("네이버")}
            className="w-full py-3 rounded-xl bg-[#03C75A] hover:brightness-95 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <span className="font-black text-sm">N</span>
            <span>네이버로 시작하기</span>
          </button>
        </div>

        {/* 빠른 원클릭 체험 로그인 섹션 */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 text-center mb-2">
            체험용 계정 원클릭 즉시 접속
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-center">
            <button
              onClick={() => handleQuickLogin("bistro@bidplate.com")}
              className="p-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-bold transition-colors"
            >
              🍝 식당 (파스타공방)
            </button>
            <button
              onClick={() => handleQuickLogin("supplier1@bidplate.com")}
              className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors"
            >
              🥩 유통사 (한결축산)
            </button>
          </div>
        </div>
      </div>

      {/* 카카오/네이버 소셜 로그인 연동 안내 모달 */}
      {socialModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4">
            <button
              onClick={() => setSocialModal(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-xl">
                {socialModal === "카카오" ? "💬" : "🟢"}
              </span>
              <h3 className="text-base font-black text-gray-900">
                {socialModal} 로그인 연동 안내
              </h3>
            </div>

            <div className="text-xs text-gray-600 space-y-2 leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
              <p>
                현재 카카오/네이버 로그인은 <strong>UI 디자인 프리뷰</strong> 상태입니다.
              </p>
              <p>
                실제 사용자의 카카오/네이버 계정으로 연동하려면 <strong>카카오 디벨로퍼스(REST API 키)</strong> 및 <strong>네이버 개발자 센터(Client ID)</strong>의 개발자 앱 등록이 필요합니다.
              </p>
              <p className="font-bold text-indigo-700">
                지금 바로 개별 계정을 생성하여 로그인하시려면 상단의 [판매자 회원가입]을 통해 고유한 아이디/비밀번호로 즉시 가입하고 로그인하실 수 있습니다!
              </p>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSocialModal(null);
                  handleQuickLogin("bistro@bidplate.com");
                }}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200"
              >
                1초 체험 로그인
              </button>
              <Link
                href="/supplier/register"
                onClick={() => setSocialModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#6366F1] text-white font-bold text-xs text-center hover:bg-[#4F46E5]"
              >
                진짜 회원가입 하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
