"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/contexts/RoleContext";
import { createClient } from "@/lib/supabase/client";
import { RestaurantDashboard } from "@/components/dashboard/RestaurantDashboard";
import { SupplierDashboard } from "@/components/dashboard/SupplierDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import {
  UtensilsCrossed,
  Truck,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
  ClipboardList,
  Database,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Receipt,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { currentUser, switchRole } = useRole();
  const [dbStatus, setDbStatus] = useState<{
    checked: boolean;
    connected: boolean;
    standardItemCount: number;
    rfqCount: number;
    errorMessage?: string;
  }>({
    checked: false,
    connected: false,
    standardItemCount: 0,
    rfqCount: 0,
  });

  useEffect(() => {
    async function checkSupabase() {
      const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
      const hasKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      if (!hasUrl || !hasKey) {
        setDbStatus({
          checked: true,
          connected: false,
          standardItemCount: 0,
          rfqCount: 0,
          errorMessage: ".env.local에 Supabase 환경변수가 설정되지 않았습니다.",
        });
        return;
      }

      try {
        const supabase = createClient();
        const [stdRes, rfqRes] = await Promise.all([
          supabase.from("standard_items").select("id", { count: "exact", head: true }),
          supabase.from("rfqs").select("id", { count: "exact", head: true }),
        ]);

        if (stdRes.error) {
          setDbStatus({
            checked: true,
            connected: false,
            standardItemCount: 0,
            rfqCount: 0,
            errorMessage: stdRes.error.message,
          });
        } else {
          setDbStatus({
            checked: true,
            connected: true,
            standardItemCount: stdRes.count ?? 0,
            rfqCount: rfqRes.count ?? 0,
          });
        }
      } catch (err: any) {
        setDbStatus({
          checked: true,
          connected: false,
          standardItemCount: 0,
          rfqCount: 0,
          errorMessage: err?.message || "Supabase 연결 확인 실패",
        });
      }
    }

    checkSupabase();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Demo Switcher Notice Banner */}
      <div className="bg-slate-900 text-white py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-orange-500 font-bold uppercase tracking-wider text-[10px]">
              DEMO MODE
            </span>
            <span>
              현재 활성 모드:{" "}
              <strong className="text-orange-300">{currentUser.name}</strong> (
              {currentUser.badge})
            </span>
            {dbStatus.checked && (
              <span
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  dbStatus.connected
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {dbStatus.connected ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>
                      Supabase 연결됨 (표준품목 {dbStatus.standardItemCount}종 · RFQ{" "}
                      {dbStatus.rfqCount}건)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    <span>Supabase 설정 필요</span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-gray-400 hidden sm:inline">원클릭 역할 전환:</span>
            <button
              type="button"
              onClick={() => switchRole("RESTAURANT")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                currentUser.role === "RESTAURANT"
                  ? "bg-orange-600 text-white font-bold"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              🍽️ 식당 모드
            </button>
            <button
              type="button"
              onClick={() => switchRole("SUPPLIER")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                currentUser.role === "SUPPLIER"
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              🚚 유통사 모드
            </button>
            <button
              type="button"
              onClick={() => switchRole("ADMIN")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                currentUser.role === "ADMIN"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              🛡️ 관리자 모드
            </button>
          </div>
        </div>
      </div>

      {/* Service Intro & 3-Mode Quick Launch Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 space-y-5">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Service Value Proposition */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>B2B 식자재 역경매 &amp; 단가방어 매칭 플랫폼 · BidPlate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                식자재 단가 비교부터 무단 인상 감시까지,{" "}
                <span className="text-orange-600">견적식탁</span>에서 한 번에
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                식당 업주가 월간 식자재 소요량을 올리면 배송 권역 유통사들이 표준 단위(kg/L/ea)로
                역경매 입찰에 참여합니다. 1사 전담 vs 최적 2사 분할 조합을 자동 계산하고, 계약 후
                거래명세서 OCR 대조로 무단 단가 인상을 차단합니다.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
              <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-100 text-center">
                <Scale className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-gray-900">단위 정합화</div>
                <div className="text-[11px] text-gray-500">kg/L/ea 자동환산</div>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-center">
                <Sparkles className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-gray-900">AI 명세서 추출</div>
                <div className="text-[11px] text-gray-500">Vision OCR 지원</div>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
                <Receipt className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-gray-900">단가 인상 방어</div>
                <div className="text-[11px] text-gray-500">계약 스냅샷 대조</div>
              </div>
            </div>
          </div>

          {/* 3-Mode Quick Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Restaurant Mode Card */}
            <div
              className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 ${
                currentUser.role === "RESTAURANT"
                  ? "border-orange-500 bg-orange-50/40 shadow-sm"
                  : "border-gray-200 bg-white hover:border-orange-300"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>식당 업주 모드 (RESTAURANT)</span>
                  </span>
                  {currentUser.role === "RESTAURANT" && (
                    <span className="text-[11px] font-bold text-orange-600">● 활성 중</span>
                  )}
                </div>
                <h2 className="text-base font-extrabold text-gray-900">
                  견적 요청서 작성 &amp; 최적 조합 비교
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  표준 품목 검색 또는 거래명세서 사진 AI 추출로 3분 만에 견적 요청서를 게시하고,
                  입찰 현황과 최적 1사/2사 조합을 비교합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/rfq/new"
                  onClick={() => switchRole("RESTAURANT")}
                  className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>견적 요청서 작성</span>
                </Link>
                <Link
                  href="/rfq"
                  onClick={() => switchRole("RESTAURANT")}
                  className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-white border border-orange-200 hover:bg-orange-50 text-orange-800 text-xs font-bold transition-colors"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>내 목록</span>
                </Link>
              </div>
            </div>

            {/* 2. Supplier Mode Card */}
            <div
              className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 ${
                currentUser.role === "SUPPLIER"
                  ? "border-blue-500 bg-blue-50/40 shadow-sm"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    <Truck className="w-3.5 h-3.5" />
                    <span>유통사 모드 (SUPPLIER)</span>
                  </span>
                  {currentUser.role === "SUPPLIER" && (
                    <span className="text-[11px] font-bold text-blue-600">● 활성 중</span>
                  )}
                </div>
                <h2 className="text-base font-extrabold text-gray-900">
                  권역별 오픈 공고 입찰 &amp; 단가표 관리
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  배송 가능 권역의 오픈 RFQ를 확인하고, 박스/팩 단위 공급가와 1회 최소주문금액(MOQ)을
                  제출해 정기 납품 계약을 수주합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/supplier/rfqs"
                  onClick={() => switchRole("SUPPLIER")}
                  className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  <span>입찰 공고함 이동</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    switchRole("SUPPLIER");
                    document
                      .getElementById("role-dashboard")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-white border border-blue-200 hover:bg-blue-50 text-blue-800 text-xs font-bold transition-colors"
                >
                  <span>대시보드</span>
                </button>
              </div>
            </div>

            {/* 3. Admin Mode Card */}
            <div
              className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 ${
                currentUser.role === "ADMIN"
                  ? "border-emerald-500 bg-emerald-50/40 shadow-sm"
                  : "border-gray-200 bg-white hover:border-emerald-300"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>관리자 모드 (ADMIN)</span>
                  </span>
                  {currentUser.role === "ADMIN" && (
                    <span className="text-[11px] font-bold text-emerald-600">● 활성 중</span>
                  )}
                </div>
                <h2 className="text-base font-extrabold text-gray-900">
                  표준 품목 마스터 &amp; 가상 유통사 운영
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  표준 식자재 50종 카탈로그, 가상 유통업체 단가표 및 대리 입찰, 단가 준수 신뢰도
                  점수를 중앙에서 관리합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/admin"
                  onClick={() => switchRole("ADMIN")}
                  className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  <span>관리자 콘솔 (/admin)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/admin/rfqs"
                  onClick={() => switchRole("ADMIN")}
                  className="inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors"
                >
                  <span>대리 입찰</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Local .env.local Supabase Setup Guide (shown if disconnected or collapsible status bar) */}
          {dbStatus.checked && !dbStatus.connected && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-900">
                <Database className="w-4 h-4 text-amber-600" />
                <span>로컬 Supabase 연결 안내 (.env.local)</span>
              </div>
              <p className="text-amber-800">
                {dbStatus.errorMessage} 프로젝트 루트의 <code className="font-mono font-bold">.env.local</code>{" "}
                파일에 아래 키를 설정한 뒤 개발 서버를 재시작해 주세요. (참고 템플릿: <code className="font-mono">.env.example</code>)
              </p>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
OPENAI_API_KEY=<optional-for-real-vision-ocr>`}
              </pre>
            </div>
          )}
        </div>
      </section>

      {/* Render Active Role Dashboard */}
      <div id="role-dashboard">
        {currentUser.role === "RESTAURANT" && <RestaurantDashboard />}
        {currentUser.role === "SUPPLIER" && <SupplierDashboard />}
        {currentUser.role === "ADMIN" && <AdminDashboard />}
      </div>
    </div>
  );
}
