"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
  Gavel,
} from "lucide-react";

const ADMIN_TABS = [
  {
    href: "/admin",
    label: "운영 대시보드",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/members",
    label: "회원명부 엑셀",
    icon: FileSpreadsheet,
    exact: false,
  },
  {
    href: "/admin/items",
    label: "표준 품목 관리",
    icon: FileSpreadsheet,
    exact: false,
  },
  {
    href: "/admin/suppliers",
    label: "가상 유통사 & 단가표",
    icon: Building2,
    exact: false,
  },
  {
    href: "/admin/rfqs",
    label: "대리 입찰 실행",
    icon: Gavel,
    exact: false,
  },
];

export function AdminNavTabs() {
  const pathname = usePathname();

  return (
    <div className="bg-[#0b1f3a] text-white border-b border-blue-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30">
              <ShieldCheck className="w-4 h-4 text-blue-300" />
            </span>
            <div>
              <div className="text-sm font-black tracking-tight flex items-center space-x-2">
                <span>셀프바이어 최고 운영관리자 콘솔 (ADMIN)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/40 text-blue-200 font-mono border border-blue-400/30">
                  블루 모드
                </span>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1.5">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = tab.exact
                ? pathname === tab.href
                : pathname === tab.href || pathname.startsWith(tab.href + "/");
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    active
                      ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400 font-black"
                      : "text-blue-200 hover:bg-blue-900/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
