"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole, DEMO_USERS } from "@/contexts/RoleContext";
import {
  UtensilsCrossed,
  Search,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Truck,
  Building2,
  Receipt,
  Scale,
  ClipboardList,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser, switchRole, logout } = useRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/suppliers?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/rfq/categories");
    }
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
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-black tracking-tight text-[#6366F1] font-sans">
                견적식탁
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                식자재 숨고
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-[15px] font-semibold text-gray-800">
              <Link
                href="/rfq/categories"
                className={`transition-colors hover:text-[#6366F1] ${
                  isActive("/rfq") ? "text-[#6366F1] font-bold" : "text-gray-700"
                }`}
              >
                견적요청
              </Link>
              <Link
                href="/suppliers"
                className={`transition-colors hover:text-[#6366F1] ${
                  isActive("/suppliers") ? "text-[#6366F1] font-bold" : "text-gray-700"
                }`}
              >
                업체찾기
              </Link>
              <Link
                href="/explore"
                className={`transition-colors hover:text-[#6366F1] ${
                  isActive("/explore") ? "text-[#6366F1] font-bold" : "text-gray-700"
                }`}
              >
                둘러보기
              </Link>
              {currentUser.role === "SUPPLIER" && (
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

          {/* Right Action Links & User Dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <Link
              href="/login"
              className="text-sm font-semibold text-gray-700 hover:text-[#6366F1] px-2 py-1 transition-colors"
            >
              로그인
            </Link>

            <Link
              href="/restaurant/register"
              className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold border border-orange-200 bg-orange-50/80 hover:bg-orange-100 text-orange-700 transition-all shadow-xs"
            >
              구매자 가입
            </Link>

            <Link
              href="/supplier/register"
              className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm transition-all"
            >
              판매자 가입
            </Link>

            {/* Quick Demo Role Switcher Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-md border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                title="데모 계정 모드 전환"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      체험 계정 즉시 전환
                    </p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">
                      {currentUser.name} ({currentUser.role})
                    </p>
                  </div>

                  <div className="py-1">
                    {DEMO_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                          currentUser.id === user.id
                            ? "bg-indigo-50/70 font-bold text-indigo-700"
                            : "text-gray-700"
                        }`}
                      >
                        <span>{user.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">
                          {user.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <Link
                      href="/admin"
                      onClick={() => {
                        switchRole("ADMIN");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center space-x-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>운영 관리자 페이지로 이동</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        router.push("/login");
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-1.5 transition-colors"
                    >
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

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
          <div className="md:hidden border-t border-gray-100 py-3 space-y-2 animate-in fade-in">
            <form onSubmit={handleSearchSubmit} className="px-2 pb-2">
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
            <div className="border-t border-gray-100 pt-2 px-2 flex items-center justify-between gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-gray-700 font-bold"
              >
                로그인
              </Link>
              <div className="flex items-center space-x-1.5">
                <Link
                  href="/restaurant/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md"
                >
                  구매자 가입
                </Link>
                <Link
                  href="/supplier/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-bold text-white bg-[#6366F1] px-2.5 py-1 rounded-md"
                >
                  판매자 가입
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
