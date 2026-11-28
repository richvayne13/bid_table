"use client";

import React from "react";
import Link from "next/link";
import { Truck, Sparkles, Store, ArrowLeft } from "lucide-react";

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#181a1d] text-zinc-100 flex flex-col transition-colors duration-300">
      {/* SUPPLIER 블랙 테마 전용 글로벌 탑 서브바 */}
      <div className="w-full bg-[#121416] border-b border-zinc-800/90 py-2.5 px-4 text-xs font-semibold text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
              <Truck className="w-3.5 h-3.5" />
              <span>SUPPLIER 블랙 테마 모드</span>
            </span>
            <span className="text-zinc-400 hidden sm:inline">
              납품·유통사 전용 견적 투찰 & 단가 관리 콘솔
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/#buyer"
              className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>BUYER (식당 사장님 · 화이트) 모드로 전환</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SUPPLIER 메인 본문 컨테이너 */}
      <main className="flex-1 w-full text-zinc-100">
        {children}
      </main>
    </div>
  );
}
