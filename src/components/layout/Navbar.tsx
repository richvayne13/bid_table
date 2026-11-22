"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import {
  UtensilsCrossed,
  Search,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Truck,
  User,
  LogOut,
  Building2,
  Store,
} from "lucide-react";
import BidTableLogo from "@/components/layout/BidTableLogo";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isLoggedIn } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/suppliers?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/rfq/categories");
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Main Nav Links */}
          <div className="flex items-center space-x-8">
            <BidTableLogo size="sm" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-[15px] font-semibold text-gray-800">
              <Link
                href="/rfq/categories"
                className={`transition-colors hover:text-blue-600 ${
                  isActive("/rfq") ? "text-blue-600 font-bold" : "text-gray-700"
                }`}
              >
                견적요청
              </Link>
              <Link
                href="/suppliers"
                className={`transition-colors hover:text-blue-600 ${
                  isActive("/suppliers") ? "text-blue-600 font-bold" : "text-gray-700"
                }`}
              >
                업체찾기
              </Link>
              <Link
                href="/explore"
                className={`transition-colors hover:text-blue-600 ${
                  isActive("/explore") ? "text-blue-600 font-bold" : "text-gray-700"
                }`}
              >
                둘러보기
              </Link>

              {/* 로그인 상태별 전용 링크 */}
              {currentUser?.role === "SUPPLIER" && (
                <Link
                  href="/supplier/rfqs"
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                    isActive("/supplier/rfqs")
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>내 입찰공고함</span>
                </Link>
              )}

              {currentUser?.role === "RESTAURANT" && (
                <Link
                  href="/rfq/new"
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                    isActive("/rfq/new")
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>견적 요청서 작성</span>
                </Link>
              )}

              {currentUser?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                    isActive("/admin")
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>운영 관리자</span>
                </Link>
              )}
            </nav>
          </div>

          {/* Center Search Bar (Soomgo style) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-md relative"
          >
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="식당 식자재 찾을 땐 견적식탁"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-24 py-2 bg-gray-100 hover:bg-gray-50 focus:bg-white text-sm rounded-full border border-transparent focus:border-indigo-400 focus:outline-none transition-all placeholder:text-gray-400 text-gray-800"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-[#6366F1] hover:bg-indigo-50 rounded-full transition-colors"
              >
                <Sparkles className="w-3 h-3 text-[#6366F1]" />
                <span>AI 견적</span>
              </button>
            </div>
          </form>

          {/* Right Action Links (실제 로그인 상태에 따른 완벽한 UI 분기) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {currentUser ? (
              // 1. 로그인 상태일 때 (마이페이지 & 로그아웃 & 사용자 프로필 뱃지)
              <div className="flex items-center space-x-2">
                <Link
                  href="/mypage"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold transition-all shadow-xs"
                >
                  {currentUser.role === "RESTAURANT" && (
                    <Store className="w-3.5 h-3.5 text-blue-500" />
                  )}
                  {currentUser.role === "SUPPLIER" && (
                    <Truck className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  {currentUser.role === "ADMIN" && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-white text-gray-500 border border-gray-200 font-semibold">
                    {currentUser.role === "RESTAURANT"
                      ? "식당"
                      : currentUser.role === "SUPPLIER"
                      ? "유통사"
                      : "관리자"}
                  </span>
                </Link>

                <Link
                  href="/mypage"
                  className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>마이페이지</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-1"
                  title="로그아웃"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">로그아웃</span>
                </button>
              </div>
            ) : (
              // 2. 비로그인 상태일 때 (로그인, 구매자 가입, 판매자 가입)
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-blue-600 px-2 py-1.5 transition-colors"
                >
                  로그인
                </Link>

                <Link
                  href="/restaurant/register"
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 transition-all shadow-xs"
                >
                  구매자 가입
                </Link>

                <Link
                  href="/supplier/register"
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                >
                  판매자 가입
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-3 animate-in fade-in">
            <form onSubmit={handleSearchSubmit} className="px-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="식당 식자재 찾을 땐 견적식탁"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-100 text-sm rounded-lg border-0 focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </form>

            <div className="grid grid-cols-3 gap-1 px-2 text-center text-sm font-semibold">
              <Link
                href="/rfq/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600"
              >
                견적요청
              </Link>
              <Link
                href="/suppliers"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600"
              >
                업체찾기
              </Link>
              <Link
                href="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600"
              >
                둘러보기
              </Link>
            </div>

            {/* Mobile Auth Drawer */}
            <div className="border-t border-gray-100 pt-3 px-2">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{currentUser.name} 님</p>
                      <p className="text-[10px] text-gray-400">{currentUser.email}</p>
                    </div>
                    <Link
                      href="/mypage"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1 rounded-md bg-[#6366F1] text-white text-xs font-bold"
                    >
                      마이페이지
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 text-center text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-gray-700 font-bold px-2 py-1"
                  >
                    로그인
                  </Link>
                  <div className="flex items-center space-x-1.5">
                    <Link
                      href="/restaurant/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1.5 rounded-md"
                    >
                      구매자 가입
                    </Link>
                    <Link
                      href="/supplier/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-white bg-[#6366F1] px-2.5 py-1.5 rounded-md"
                    >
                      판매자 가입
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
