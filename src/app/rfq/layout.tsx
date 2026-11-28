"use client";

import React from "react";
import Link from "next/link";
import { Store, Truck } from "lucide-react";

export default function RfqBuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/60 text-gray-900 flex flex-col transition-colors duration-300">
      {/* BUYER 화이트 테마 전용 글로벌 탑 서브바 */}
      <div className="w-full bg-white border-b border-gray-200/80 py-2.5 px-4 text-xs font-semibold text-gray-600 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
              <Store className="w-3.5 h-3.5" />
              <span>BUYER 화이트 테마 모드</span>
            </span>
            <span className="text-gray-500 hidden sm:inline">
              외식업 매장 사장님 전용 견적 요청 & 단가 비교 플랫폼
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/#supplier"
              className="text-gray-600 hover:text-zinc-950 flex items-center gap-1 transition-colors font-medium"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SUPPLIER (유통사 · 블랙) 모드로 전환</span>
            </Link>
          </div>
        </div>
      </div>

      {/* BUYER 메인 본문 컨테이너 */}
      <main className="flex-1 w-full text-gray-900">
        {children}
      </main>
    </div>
  );
}
