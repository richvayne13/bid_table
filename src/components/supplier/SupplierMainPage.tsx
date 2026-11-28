"use client";

import React from "react";
import Link from "next/link";
import { useRole } from "@/contexts/RoleContext";
import { SupplierHomeDashboard } from "@/components/supplier/SupplierHomeDashboard";
import { Sparkles, Utensils, Briefcase } from "lucide-react";

interface SupplierMainPageProps {
  onSwitchView?: (view: "service" | "buyer" | "supplier") => void;
}

export function SupplierMainPage({ onSwitchView }: SupplierMainPageProps) {
  const { currentUser } = useRole();
  const isSupplier = currentUser?.role === "SUPPLIER";

  return (
    <div className="relative min-h-screen bg-slate-900 text-white">
      {/* 상단 뷰 모드 알림 및 스위처 바 */}
      <div className="bg-slate-950 text-white px-4 py-2.5 border-b border-slate-800 text-xs sticky top-16 sm:top-20 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-extrabold text-emerald-400">
              [👔 SUPPLIER 판매자 모드 가동 중] {isSupplier ? "(벨엘미트 납품사 로그인)" : "(마장동 유통사 시점 화면)"}
            </span>
            <span className="text-slate-400 hidden sm:inline">| 권역별(종로구 등) 식당 발굴 및 자율 역제안</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {onSwitchView ? (
              <button
                onClick={() => onSwitchView("buyer")}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition shadow-xs flex items-center gap-1 shrink-0"
              >
                <Utensils className="w-3.5 h-3.5" /> 🍽️ 식당 사장님(BUYER) 화면 전환
              </button>
            ) : (
              <Link
                href="/buyer"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition shadow-xs flex items-center gap-1 shrink-0"
              >
                <Utensils className="w-3.5 h-3.5" /> 🍽️ 식당 사장님(BUYER) 화면 전환
              </Link>
            )}

            {onSwitchView ? (
              <button
                onClick={() => onSwitchView("service")}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium border border-slate-700 transition shrink-0"
              >
                서비스소개 보기
              </button>
            ) : (
              <Link
                href="/#service"
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium border border-slate-700 transition shrink-0"
              >
                서비스소개 보기
              </Link>
            )}

            <Link
              href="/prototypes"
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg font-bold border border-slate-700 transition shrink-0"
            >
              🎨 도안 20선 쇼케이스
            </Link>
            <Link
              href="/supplier/catalog"
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-black transition shrink-0"
            >
              📋 엑셀 단가표 등록
            </Link>
          </div>
        </div>
      </div>

      <SupplierHomeDashboard />
    </div>
  );
}
