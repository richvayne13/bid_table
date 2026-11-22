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
    <div className="bg-emerald-950 text-white border-b border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
            </span>
            <div>
              <div className="text-sm font-extrabold tracking-tight flex items-center space-x-2">
                <span>견적식탁 관리자 콘솔 (ADMIN)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-mono">
                  /admin
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
                      ? "bg-white text-emerald-950 shadow-sm"
                      : "text-emerald-100 hover:bg-emerald-900/80 hover:text-white"
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
