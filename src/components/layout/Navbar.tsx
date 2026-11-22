"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole, DEMO_USERS } from "@/contexts/RoleContext";
import {
  UtensilsCrossed,
  Truck,
  ShieldCheck,
  ChevronDown,
  FileSpreadsheet,
  Scale,
  Receipt,
  Building2,
  Check,
  AlertTriangle,
  Menu,
  X,
  ClipboardList,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser, switchRole } = useRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGoAdmin = () => {
    switchRole("ADMIN");
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push("/admin");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "RESTAURANT":
        return <UtensilsCrossed className="w-4 h-4 text-orange-500" />;
      case "SUPPLIER":
        return <Truck className="w-4 h-4 text-blue-500" />;
      case "ADMIN":
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getRoleTheme = (role: string) => {
    switch (role) {
      case "RESTAURANT":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "SUPPLIER":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ADMIN":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-gray-900">
                    견적식탁
                  </span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 font-mono">
                    BidPlate
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium hidden sm:inline">
                  B2B 식자재 역경매 &amp; 단가방어 플랫폼
                </span>
              </div>
            </Link>
          </div>

          {/* Role Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentUser.role === "RESTAURANT" && (
              <>
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    isActive("/")
                      ? "bg-orange-50 text-orange-700 font-bold"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>홈 대시보드</span>
                </Link>
                <Link
                  href="/rfq"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname === "/rfq"
                      ? "bg-orange-50 text-orange-700 font-bold"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-orange-500" />
                  <span>견적 요청 목록</span>
                </Link>
                <Link
                  href="/rfq/new"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname === "/rfq/new"
                      ? "bg-orange-600 text-white font-bold shadow-sm"
                      : "text-orange-700 bg-orange-50/70 hover:bg-orange-100 font-semibold"
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>견적 요청서 작성</span>
                </Link>
                <Link
                  href="/rfq/20000000-0000-0000-0000-000000000001/compare"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname.includes("/compare")
                      ? "bg-orange-50 text-orange-700 font-bold"
                      : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Scale className="w-4 h-4 text-orange-500" />
                  <span>비교 매트릭스</span>
                </Link>
                <Link
                  href="/contracts/40000000-0000-0000-0000-000000000001/audit"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname.includes("/audit")
                      ? "bg-rose-50 text-rose-700 font-bold"
                      : "text-gray-700 hover:text-rose-600 hover:bg-rose-50"
                  }`}
                >
                  <Receipt className="w-4 h-4 text-rose-500" />
                  <span>단가 감시</span>
                </Link>
              </>
            )}

            {currentUser.role === "SUPPLIER" && (
              <>
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/")
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  유통사 홈
                </Link>
                <Link
                  href="/supplier/rfqs"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/supplier/rfqs")
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-blue-700 bg-blue-50/70 hover:bg-blue-100 font-semibold"
                  }`}
                >
                  입찰 공고함 (/supplier/rfqs)
                </Link>
                <Link
                  href="/#catalog"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  기본 공급 단가표
                </Link>
                <Link
                  href="/rfq"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  전체 RFQ 현황
                </Link>
              </>
            )}

            {currentUser.role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/admin"
                      ? "bg-emerald-50 text-emerald-700 font-bold"
                      : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  운영 대시보드
                </Link>
                <Link
                  href="/admin/items"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname === "/admin/items"
                      ? "bg-emerald-50 text-emerald-700 font-bold"
                      : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>표준 품목 관리</span>
                </Link>
                <Link
                  href="/admin/suppliers"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname === "/admin/suppliers"
                      ? "bg-emerald-50 text-emerald-700 font-bold"
                      : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>가상 유통사 &amp; 단가표</span>
                </Link>
                <Link
                  href="/admin/rfqs"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    pathname === "/admin/rfqs"
                      ? "bg-emerald-50 text-emerald-700 font-bold"
                      : "text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>대리 입찰 실행</span>
                </Link>
              </>
            )}
          </nav>

          {/* Quick Switcher Dropdown, Direct Admin Button & Mobile Toggle */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleGoAdmin}
              className={`hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold transition-all shadow-sm ${
                pathname.startsWith("/admin")
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>관리자 모드 (Admin)</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all shadow-sm hover:shadow ${getRoleTheme(
                  currentUser.role
                )}`}
              >
                <span className="flex items-center space-x-1.5">
                  {getRoleIcon(currentUser.role)}
                  <span className="font-semibold max-w-[110px] sm:max-w-none truncate">
                    {currentUser.name}
                  </span>
                </span>
                <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-white/80 border border-current">
                  {currentUser.badge}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        ⚡ 데모 계정 즉시 전환 (Quick Switcher)
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        클릭 시 해당 역할의 화면 및 권한으로 즉시 전환됩니다.
                      </div>
                    </div>

                    <div className="p-1 space-y-1">
                      {DEMO_USERS.map((user) => {
                        const isSelected = currentUser.id === user.id;
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setCurrentUser(user);
                              setDropdownOpen(false);
                              if (user.role === "ADMIN") {
                                router.push("/admin");
                              }
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start space-x-3 transition-colors ${
                              isSelected
                                ? "bg-orange-50/80 text-orange-950 font-medium"
                                : "hover:bg-gray-50 text-gray-800"
                            }`}
                          >
                            <div className="mt-0.5 p-1.5 rounded-lg bg-white shadow-sm border border-gray-100">
                              {getRoleIcon(user.role)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold truncate">
                                  {user.name}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getRoleTheme(
                                    user.role
                                  )}`}
                                >
                                  {user.badge}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                {user.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-orange-600 mt-1 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700"
            >
              홈 대시보드
            </Link>
            <Link
              href="/rfq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700"
            >
              견적 요청 목록 (/rfq)
            </Link>
            <Link
              href="/rfq/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-orange-700 bg-orange-50"
            >
              + 새 견적 요청서 작성 (/rfq/new)
            </Link>
            <Link
              href="/supplier/rfqs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-blue-700 bg-blue-50"
            >
              🚚 유통사 입찰 공고함 (/supplier/rfqs)
            </Link>
            <Link
              href="/rfq/20000000-0000-0000-0000-000000000001/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50"
            >
              ⚖️ 가로×세로 비교 매트릭스
            </Link>
            <Link
              href="/contracts/40000000-0000-0000-0000-000000000001/audit"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              🛡️ 거래명세서 단가 감시
            </Link>
            <button
              type="button"
              onClick={handleGoAdmin}
              className="w-full text-left block px-3 py-2 rounded-lg text-sm font-bold text-emerald-800 bg-emerald-50"
            >
              🛡️ 관리자 모드 (Admin) → /admin
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
