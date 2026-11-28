"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import {
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";
import BidTableLogo from "@/components/layout/BidTableLogo";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string>("service");

  // 현재 브라우저 URL의 view 파라미터나 라우트 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateCurrentView = () => {
        if (pathname === "/buyer") {
          setCurrentView("buyer");
        } else if (pathname === "/supplier") {
          setCurrentView("supplier");
        } else if (pathname === "/") {
          const params = new URLSearchParams(window.location.search);
          const v = params.get("view");
          if (v === "buyer" || v === "supplier" || v === "service") {
            setCurrentView(v);
          } else {
            setCurrentView("service");
          }
        } else {
          setCurrentView("");
        }
      };

      updateCurrentView();
      window.addEventListener("popstate", updateCurrentView);
      return () => window.removeEventListener("popstate", updateCurrentView);
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleNavMode = (targetMode: "buyer" | "supplier" | "service") => {
    setMobileMenuOpen(false);
    setCurrentView(targetMode);
    router.push(`/?view=${targetMode}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Main Nav Links */}
          <div className="flex items-center space-x-6 sm:space-x-10">
            <BidTableLogo size="md" />

            {/* Desktop Navigation: 서비스소개 / BUYER / SUPPLIER */}
            <nav className="hidden xl:flex items-center space-x-4 text-[15px] font-semibold whitespace-nowrap">
              {/* 1. 서비스소개 */}
              <button
                type="button"
                onClick={() => handleNavMode("service")}
                className={`px-3 py-1.5 rounded-full transition-all text-[15px] font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === "service"
                    ? "bg-gray-100 text-gray-950 shadow-xs"
                    : "text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                }`}
              >
                서비스소개
              </button>

              {/* 2. BUYER (이전 구매자 메인페이지) */}
              <button
                type="button"
                onClick={() => handleNavMode("buyer")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all text-[15px] font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === "buyer"
                    ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80"
                }`}
              >
                <span>BUYER</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                    currentView === "buyer"
                      ? "bg-white/20 text-white"
                      : "bg-blue-50 text-blue-600 border border-blue-200"
                  }`}
                >
                  매장 사장님
                </span>
              </button>

              {/* 3. SUPPLIER (이전 판매자 메인페이지) */}
              <button
                type="button"
                onClick={() => handleNavMode("supplier")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all text-[15px] font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === "supplier"
                    ? "bg-[#272a2e] text-white shadow-sm ring-2 ring-gray-900/20"
                    : "text-gray-700 hover:text-gray-950 hover:bg-gray-100"
                }`}
              >
                <span>SUPPLIER</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                    currentView === "supplier"
                      ? "bg-white/20 text-emerald-300"
                      : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                  }`}
                >
                  공급·유통사
                </span>
              </button>

              {/* 4. 시범체험 */}
              <Link
                href="/pilot"
                className="transition-colors hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>시범체험 (Pilot)</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 whitespace-nowrap">
            {currentUser ? (
              <div className="flex items-center space-x-2 shrink-0 whitespace-nowrap">
                {currentUser.role === "ADMIN" && (
                  <Link
                    href="/admin/members"
                    className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-xs shrink-0 whitespace-nowrap"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>회원명부 엑셀</span>
                  </Link>
                )}
                <Link
                  href="/mypage"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs sm:text-sm font-bold transition-all shrink-0 whitespace-nowrap"
                >
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="whitespace-nowrap">{currentUser.name}</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-1 shrink-0 whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 whitespace-nowrap">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-blue-600 px-2 py-1.5 transition-colors whitespace-nowrap"
                >
                  로그인
                </Link>
                <button
                  type="button"
                  onClick={() => handleNavMode("buyer")}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>시작하기</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-gray-100 py-4 px-2 space-y-3 bg-white animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-1.5">
              <button
                type="button"
                onClick={() => handleNavMode("service")}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  currentView === "service"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                서비스소개
              </button>

              <button
                type="button"
                onClick={() => handleNavMode("buyer")}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-between transition-all ${
                  currentView === "buyer"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <span>BUYER</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    currentView === "buyer"
                      ? "bg-white/20 text-white"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  구매자 메인 대시보드
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavMode("supplier")}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-between transition-all ${
                  currentView === "supplier"
                    ? "bg-[#272a2e] text-white"
                    : "text-gray-700 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span>SUPPLIER</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    currentView === "supplier"
                      ? "bg-white/20 text-emerald-300"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  판매자 메인 대시보드
                </span>
              </button>

              <Link
                href="/pilot"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-sm flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>시범 사이트 체험 (Pilot)</span>
                </span>
                <span className="text-xs text-indigo-500 font-normal">구매업무 경감</span>
              </Link>

              {currentUser?.role === "ADMIN" && (
                <Link
                  href="/admin/members"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-sm flex items-center justify-between border border-emerald-200"
                >
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>입점 회원 엑셀 명부</span>
                  </span>
                  <span className="text-xs text-emerald-600 font-normal">관리자 전용</span>
                </Link>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-center text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  로그아웃
                </button>
              ) : (
                <div className="w-full flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2 text-center rounded-lg border border-gray-200 text-xs font-bold text-gray-700"
                  >
                    로그인
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleNavMode("buyer")}
                    className="flex-1 py-2 text-center rounded-lg bg-blue-600 text-white text-xs font-bold"
                  >
                    시작하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
