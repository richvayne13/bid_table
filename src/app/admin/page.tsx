"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatNumber } from "@/lib/utils";
import { getUnifiedRfqs, UnifiedRfq } from "@/lib/unified-rfq-store";
import { getRegisteredUsers } from "@/lib/auth-storage";
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  Scale,
  RefreshCw,
  Clock,
  Sparkles,
  CheckCircle2,
  Receipt,
  Store,
  Truck,
  ArrowRight,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rfqs, setRfqs] = useState<UnifiedRfq[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<string>("");
  const [registeredUsersCount, setRegisteredUsersCount] = useState({ restaurants: 1, suppliers: 2 });
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    const list = getUnifiedRfqs();
    setRfqs(list);
    if (!selectedRfqId && list.length > 0) {
      setSelectedRfqId(list[0].id);
    }

    const users = getRegisteredUsers();
    const restaurants = users.filter((u) => u.role === "RESTAURANT").length;
    const suppliers = users.filter((u) => u.role === "SUPPLIER").length;
    setRegisteredUsersCount({ restaurants, suppliers });

    setTimeout(() => {
      setLoading(false);
    }, 200);
  };

  useEffect(() => {
    loadData();

    // 실시간 커뮤니티 동기화 리스너: A구매자 공고 등록 또는 판매자 투찰 시 즉시 새로고침
    const handleSync = () => {
      loadData();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("selfbuyer:rfq_updated", handleSync);
      window.addEventListener("storage", handleSync);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("selfbuyer:rfq_updated", handleSync);
        window.removeEventListener("storage", handleSync);
      }
    };
  }, []);

  // 현재 선택된 공고 (A구매자 공고 또는 살롱순라)
  const activeRfq = useMemo(() => {
    return rfqs.find((r) => r.id === selectedRfqId) || rfqs[0] || null;
  }, [rfqs, selectedRfqId]);

  // 전체 통합 수치화 통계 계산
  const metrics = useMemo(() => {
    let totalVolume = 0;
    let totalBids = 0;

    rfqs.forEach((r) => {
      totalBids += r.bids?.length || 0;
      (r.rfq_items || []).forEach((item) => {
        if (item.current_unit_price && item.monthly_qty) {
          totalVolume += item.current_unit_price * item.monthly_qty;
        } else if (item.monthly_qty) {
          totalVolume += item.monthly_qty * 32000;
        }
      });
    });

    const estimatedSaving = Math.round(totalVolume * 0.095); // 평균 9.5% 절감
    const savingRate = 9.5;

    return {
      totalVolume: totalVolume > 0 ? totalVolume : 6555000,
      estimatedSaving,
      savingRate,
      bidCount: totalBids || 2,
      totalRfqs: rfqs.length,
      trustRate: 99.8,
    };
  }, [rfqs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      {/* 1. 상단 관리자 환영 및 상태 바 (파란색 테마) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/80 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold mb-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>최고 운영관리자 본부 (BLUE ADMIN) · richman2561</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            구매자 ↔ 판매자 유기적 역경매 통합 관제 센터
          </h1>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            외식업 구매자(살롱순라)와 유통 공급사 간의 실시간 입찰 현황, 단가 절감 통계 및 단가 방어 감시를 유기적으로 총괄합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/admin/members"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span>입점 회원 엑셀 명부</span>
          </Link>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-900/60 border border-blue-700/80 hover:bg-blue-800 text-xs font-bold text-blue-200 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
            <span>실시간 새로고침</span>
          </button>
        </div>
      </div>

      {/* 2. 핵심 수치화 KPI 지표 (파란색 카드 테마) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 지표 1: 실시간 견적 거래 규모 */}
        <div className="bg-[#0b2240] p-5 rounded-2xl border border-blue-800/80 shadow-md flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-300">등록된 월간 식자재 규모</div>
            <div className="text-2xl font-black text-white mt-0.5">
              {formatPrice(metrics.totalVolume)}
            </div>
            <div className="text-[11px] text-blue-400 font-bold">
              살롱순라 1건 집중 관제 중
            </div>
          </div>
        </div>

        {/* 지표 2: 역경매 원가 절감액 및 절감율 */}
        <div className="bg-[#0b2240] p-5 rounded-2xl border border-blue-800/80 shadow-md flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-300">역경매 매칭 예상 절감액</div>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {formatPrice(metrics.estimatedSaving)}
            </div>
            <div className="text-[11px] text-emerald-400 font-bold">
              평균 {metrics.savingRate}% 원가 절감 효과
            </div>
          </div>
        </div>

        {/* 지표 3: 입찰 경쟁률 */}
        <div className="bg-[#0b2240] p-5 rounded-2xl border border-blue-800/80 shadow-md flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-300">유통사 투찰 경쟁률</div>
            <div className="text-2xl font-black text-indigo-300 mt-0.5">
              {metrics.bidCount}개사 참여
            </div>
            <div className="text-[11px] text-indigo-400 font-bold">
              한결축산 · 가락농산 투찰 완료
            </div>
          </div>
        </div>

        {/* 지표 4: 계약 단가 준수율 */}
        <div className="bg-[#0b2240] p-5 rounded-2xl border border-blue-800/80 shadow-md flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-300">단가 잠금(Price-Lock) 준수율</div>
            <div className="text-2xl font-black text-purple-300 mt-0.5">
              {metrics.trustRate}%
            </div>
            <div className="text-[11px] text-purple-400 font-bold">
              OCR 명세서 대조 무단인상 0건
            </div>
          </div>
        </div>
      </div>

      {/* 3. 구매자 - 판매자 - 관리자 유기적 원클릭 링크 매트릭스 허브 */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
            UNIFIED CONNECTIVITY HUB
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            구매자 · 판매자 · 관리자 유기적 연동 바로가기 링크
          </h2>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            세 화면이 독립적으로 분리되지 않고 하나의 데이터 허브로 묶여 있습니다. 관리자는 언제든지 구매자가 보는 견적서, 판매자가 보는 입찰서, 그리고 단가 감사 화면으로 직통 이동할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* A. 구매자 (살롱순라) 영역 */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-blue-300">
              <Store className="w-4 h-4" />
              <span className="text-xs font-extrabold uppercase">1. 구매자 (식당) 영역</span>
            </div>
            <p className="text-xs text-gray-300">
              살롱순라 식당 업주가 보는 견적 요청서 및 최저가 매트릭스
            </p>
            <div className="space-y-1.5 pt-1">
              <Link
                href="/rfq/d0000000-0000-0000-0000-000000000001/compare"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white text-gray-900 font-bold text-xs hover:bg-blue-50 transition-colors"
              >
                <span>살롱순라 비교 매트릭스</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </Link>
              <Link
                href="/mypage"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                <span>구매자 마이페이지 뷰</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* B. 판매자 (유통사) 영역 */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-300">
              <Truck className="w-4 h-4" />
              <span className="text-xs font-extrabold uppercase">2. 판매자 (유통사) 영역</span>
            </div>
            <p className="text-xs text-gray-300">
              (주)한결축산 등 유통사가 오픈 공고를 보고 투찰하는 입찰서
            </p>
            <div className="space-y-1.5 pt-1">
              <Link
                href="/supplier/rfqs/d0000000-0000-0000-0000-000000000001/bid"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white text-gray-900 font-bold text-xs hover:bg-blue-50 transition-colors"
              >
                <span>살롱순라 공고 투찰하기</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
              </Link>
              <Link
                href="/supplier/rfqs"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                <span>판매자 공고 목록 보기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* C. 관리자 (Admin) 감사 영역 */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-300">
              <Receipt className="w-4 h-4" />
              <span className="text-xs font-extrabold uppercase">3. 단가 방어 감사 영역</span>
            </div>
            <p className="text-xs text-gray-300">
              계약 후 납품된 실물 거래명세서 OCR 대조 및 무단 인상 방어
            </p>
            <div className="space-y-1.5 pt-1">
              <Link
                href="/contracts/e0000000-0000-0000-0000-000000000001/audit"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white text-gray-900 font-bold text-xs hover:bg-emerald-50 transition-colors"
              >
                <span>거래명세서 OCR 단가 감시</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </Link>
              <Link
                href="/admin/rfqs"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                <span>관리자 대리입찰 센터</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* D. 회원 관리 (엑셀 스프레드시트) 영역 */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center space-x-2 text-amber-300">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="text-xs font-extrabold uppercase">4. 회원 명부 엑셀 뷰</span>
            </div>
            <p className="text-xs text-gray-300">
              구매자(식당) 및 유통사 가입 데이터를 엑셀로 조회 및 다운로드
            </p>
            <div className="space-y-1.5 pt-1">
              <Link
                href="/admin/members"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs transition-colors"
              >
                <span>회원 관리 엑셀 뷰 열기</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-950" />
              </Link>
              <Link
                href="/admin/suppliers"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                <span>가상 유통사 및 단가표 관리</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 실시간 활성 역경매 공고 전체 관제 피드 (A구매자 포함) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-black text-white">
              실시간 활성 역경매 공고 피드 (총 {rfqs.length}건 관제)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold animate-pulse">
              실시간 LIVE
            </span>
          </div>
          <span className="text-xs text-blue-300">
            A구매자 등 신규 견적 요청서 등록 시 실시간 자동 반영
          </span>
        </div>

        {/* 공고 선택 탭 바 (모든 구매자 공고 탭) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {rfqs.map((r, idx) => {
            const isSelected = activeRfq?.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRfqId(r.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-400 shadow-md font-black"
                    : "bg-[#0b2240] text-blue-300 border-blue-800/80 hover:bg-blue-900/60 hover:text-white"
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{r.profiles?.company_name || `구매자 공고 ${idx + 1}`}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-blue-950 text-blue-300"
                }`}>
                  {r.rfq_items?.length || 0}개 품목 · 입찰 {r.bids?.length || 0}건
                </span>
              </button>
            );
          })}
        </div>

        {/* 활성 공고 상세 관제 카드 */}
        {activeRfq && (
          <div className="bg-[#0b2240] rounded-3xl border border-blue-800 p-6 sm:p-7 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-800/80 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-black text-xs border border-blue-400/30">
                    발주처: {activeRfq.profiles?.company_name || "A구매자 매장"}
                  </span>
                  <span className="text-xs text-blue-200">
                    {activeRfq.region}
                  </span>
                </div>
                <h4 className="text-xl font-black text-white mt-1">
                  {activeRfq.title}
                </h4>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href={`/rfq/d0000000-0000-0000-0000-000000000001/compare`}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Scale className="w-4 h-4" />
                  <span>비교 매트릭스 보기</span>
                </Link>
                <Link
                  href={`/supplier/rfqs/demo/bid?id=${activeRfq.id}`}
                  className="px-4 py-2.5 rounded-xl border border-blue-700 bg-blue-900/40 hover:bg-blue-900/80 text-blue-200 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Truck className="w-4 h-4 text-blue-300" />
                  <span>유통사 입찰서 보기</span>
                </Link>
              </div>
            </div>

            {/* 조건 요약 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-blue-950/60 border border-blue-900/60 p-4 rounded-2xl">
              <div>
                <span className="text-blue-300 block">배송 권역</span>
                <span className="font-bold text-white">{activeRfq.region}</span>
              </div>
              <div>
                <span className="text-blue-300 block">희망 계약 기간</span>
                <span className="font-bold text-white">{activeRfq.contract_months}개월 고정단가</span>
              </div>
              <div>
                <span className="text-blue-300 block">정기 배송 요일</span>
                <span className="font-bold text-blue-300">{activeRfq.delivery_days?.join(", ") || "월, 수, 금"} (새벽배송)</span>
              </div>
              <div>
                <span className="text-blue-300 block">결제 조건</span>
                <span className="font-bold text-white">{activeRfq.payment_terms}</span>
              </div>
            </div>

            {/* 요청 품목 리스트 */}
            <div>
              <h5 className="text-xs font-bold text-blue-300 mb-2">
                {activeRfq.profiles?.company_name} 요청 식자재 품목 (총 {activeRfq.rfq_items?.length || 0}건)
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(activeRfq.rfq_items || []).map((it) => (
                  <div key={it.id} className="p-3 rounded-xl border border-blue-800/80 bg-blue-950/50 shadow-xs">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-300 font-bold">
                      {it.standard_items?.category || "식자재"}
                    </span>
                    <p className="text-xs font-black text-white mt-1 truncate">
                      {it.standard_items?.item_name}
                    </p>
                    <div className="flex justify-between items-center text-[11px] text-blue-200 mt-1">
                      <span>월 {formatNumber(it.monthly_qty)}{it.standard_items?.base_unit || "kg"}</span>
                      <span className="font-bold text-blue-400">
                        {it.current_unit_price ? `${formatPrice(it.current_unit_price)}/${it.standard_items?.base_unit || "kg"}` : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 입찰 참여사 현황 배지 */}
            <div className="pt-3 border-t border-blue-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-blue-300 font-bold">투찰 완료 유통사 (총 {activeRfq.bids?.length || 0}건):</span>
                {(activeRfq.bids && activeRfq.bids.length > 0) ? (
                  activeRfq.bids.map((b) => (
                    <span
                      key={b.id}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 font-bold"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{b.profiles?.company_name}</span>
                      <span className="text-[10px] text-blue-300">({b.price_lock_type === "FIXED" ? "단가고정" : "변동연동"})</span>
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-400 text-xs">현재 유통사 투찰 대기 중 (실시간 공고 진행 중)</span>
                )}
              </div>

              <div className="text-blue-300 text-[11px]">
                최적 조합: <strong className="text-emerald-400 font-black">역경매 최저가 알고리즘 가동 중</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
