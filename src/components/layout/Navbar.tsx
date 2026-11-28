"use client";

import React, { useState } from "react";
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

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleNavModeClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: "buyer" | "supplier" | "service"
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(`/#${targetId}`);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Main Nav Links */}
          <div className="flex items-center space-x-8 sm:space-x-12">
            <BidTableLogo size="md" />

            {/* Desktop Navigation: 서비스소개 / BUYER / SUPPLIER */}
            <nav className="hidden xl:flex items-center space-x-6 text-[15px] font-semibold text-gray-700 whitespace-nowrap">
              <Link
                href="/#service"
                onClick={(e) => handleNavModeClick(e, "service")}
                className="transition-colors hover:text-blue-600 hover:scale-105 transform text-gray-700 font-bold whitespace-nowrap shrink-0"
              >
                서비스소개
              </Link>
              <Link
                href="/#buyer"
                onClick={(e) => handleNavModeClick(e, "buyer")}
                className="transition-colors hover:text-blue-600 hover:scale-105 transform text-gray-700 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-blue-50/60 whitespace-nowrap shrink-0"
              >
                <span>BUYER</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-200 whitespace-nowrap">
                  매장 사장님
                </span>
              </Link>
              <Link
                href="/#supplier"
                onClick={(e) => handleNavModeClick(e, "supplier")}
                className="transition-colors hover:text-zinc-900 hover:scale-105 transform text-gray-700 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-zinc-100 whitespace-nowrap shrink-0"
              >
                <span>SUPPLIER</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium border border-zinc-200 whitespace-nowrap">
                  공급·유통사
                </span>
              </Link>
              <Link
                href="/pilot"
                className="transition-colors hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs whitespace-nowrap shrink-0"
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
                  className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-1 shrink-0 whitespace-nowrap"
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
                <Link
                  href="/#buyer"
                  onClick={(e) => handleNavModeClick(e, "buyer")}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>시작하기</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 px-2 space-y-3 bg-white animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-1">
              <Link
                href="/#service"
                onClick={(e) => handleNavModeClick(e, "service")}
                className="px-3 py-2.5 rounded-lg font-bold text-gray-800 hover:bg-blue-50 hover:text-blue-600 text-sm"
              >
                서비스소개
              </Link>
              <Link
                href="/#buyer"
                onClick={(e) => handleNavModeClick(e, "buyer")}
                className="px-3 py-2.5 rounded-lg font-bold text-gray-800 hover:bg-blue-50 hover:text-blue-600 text-sm flex items-center justify-between"
              >
                <span>BUYER</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">외식업 사장님 (화이트)</span>
              </Link>
              <Link
                href="/#supplier"
                onClick={(e) => handleNavModeClick(e, "supplier")}
                className="px-3 py-2.5 rounded-lg font-bold text-gray-800 hover:bg-zinc-100 hover:text-zinc-900 text-sm flex items-center justify-between"
              >
                <span>SUPPLIER</span>
                <span className="text-xs text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full font-medium">공급·유통업체 (블랙)</span>
              </Link>
              <Link
                href="/pilot"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-sm flex items-center justify-between"
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
                  className="px-3 py-2.5 rounded-lg font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-sm flex items-center justify-between border border-emerald-200"
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
                  <Link
                    href="/#buyer"
                    onClick={(e) => handleNavModeClick(e, "buyer")}
                    className="flex-1 py-2 text-center rounded-lg bg-blue-600 text-white text-xs font-bold"
                  >
                    시작하기
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
