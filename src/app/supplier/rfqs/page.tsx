"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole, DEMO_USERS, DemoUser } from "@/contexts/RoleContext";
import { isRegionMatched } from "@/lib/regions";
import { getUnifiedRfqs } from "@/lib/unified-rfq-store";
import { formatNumber } from "@/lib/utils";
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  Package,
  BadgeCheck,
  ChevronRight,
  CheckCircle2,
  CreditCard,
  Filter,
  RefreshCw,
  Building2,
} from "lucide-react";

const SUPPLIER_DEMO_USERS: DemoUser[] = DEMO_USERS.filter(
  (u) => u.role === "SUPPLIER"
);

function SupplierRfqsContent() {
  const searchParams = useSearchParams();
  const submittedRfqId = searchParams.get("submitted");
  const { currentUser, setCurrentUser } = useRole();
  const supabase = useMemo(() => createClient(), []);

  const activeSupplier = useMemo(() => {
    if (currentUser?.role === "SUPPLIER") return currentUser;
    return SUPPLIER_DEMO_USERS[0];
  }, [currentUser]);

  const [supplierProfile, setSupplierProfile] = useState<any>(null);
  const [catalogCount, setCatalogCount] = useState<number>(0);
  const [allOpenRfqs, setAllOpenRfqs] = useState<any[]>([]);
  const [myBidsByRfq, setMyBidsByRfq] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // 로컬 통합 스토어의 공고들 (구매자가 올린 최신 공고 즉각 포함)
      const unifiedList = getUnifiedRfqs();

      let supabaseRfqs: any[] = [];
      try {
        const [profileRes, catRes, rfqRes, bidsRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("id", activeSupplier.id)
            .single(),
          supabase
            .from("supplier_catalogs")
            .select("id", { count: "exact", head: true })
            .eq("supplier_id", activeSupplier.id),
          supabase
            .from("rfqs")
            .select(
              "*, profiles(company_name, address), rfq_items(id, monthly_qty, standard_items(item_name, base_unit, category))"
            )
            .eq("status", "OPEN")
            .order("deadline", { ascending: true }),
          supabase
            .from("bids")
            .select("*, bid_items(id)")
            .eq("supplier_id", activeSupplier.id),
        ]);

        if (profileRes.data) setSupplierProfile(profileRes.data);
        if (catRes.count !== null) setCatalogCount(catRes.count);
        supabaseRfqs = rfqRes.data || [];

        const bidMap: Record<string, any> = {};
        (bidsRes.data || []).forEach((b: any) => {
          bidMap[b.rfq_id] = b;
        });
        setMyBidsByRfq(bidMap);
      } catch (subErr) {
        console.warn("Supabase load failed, using unified store:", subErr);
      }

      // Supabase 공고와 로컬 통합 공고를 ID 기준으로 완전 병합
      const combinedMap = new Map<string, any>();
      unifiedList.forEach((r) => combinedMap.set(r.id, r));
      supabaseRfqs.forEach((r) => combinedMap.set(r.id, r));

      const mergedList = Array.from(combinedMap.values());
      setAllOpenRfqs(mergedList);

      // 통합 스토어 내 본인 입찰 상태 동기화
      const updatedBidMap: Record<string, any> = {};
      mergedList.forEach((r) => {
        const foundBid = (r.bids || []).find((b: any) => b.supplier_id === activeSupplier.id);
        if (foundBid) {
          updatedBidMap[r.id] = foundBid;
        }
      });
      setMyBidsByRfq((prev) => ({ ...prev, ...updatedBidMap }));
    } catch (err: any) {
      console.error("Failed to load supplier RFQs:", err);
      // 에러 발생 시에도 통합 스토어 데이터로 안전 표시
      const unifiedList = getUnifiedRfqs();
      setAllOpenRfqs(unifiedList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSupplier.id]);

  const deliveryRegions: string[] = useMemo(() => {
    if (Array.isArray(supplierProfile?.delivery_regions)) {
      return supplierProfile.delivery_regions;
    }
    return [];
  }, [supplierProfile]);

  // 배송 권역 일치 OPEN RFQ 필터링
  const matchedRfqs = useMemo(() => {
    return allOpenRfqs.filter((rfq) =>
      isRegionMatched(deliveryRegions, rfq.region)
    );
  }, [allOpenRfqs, deliveryRegions]);

  const handleSelectSupplier = (sup: DemoUser) => {
    setCurrentUser(sup);
  };

  const formatDday = (deadline: string) => {
    const diff = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return { label: "마감 경과", style: "bg-rose-100 text-rose-700" };
    if (diff === 0) return { label: "D-Day (오늘 마감)", style: "bg-amber-100 text-amber-800" };
    return { label: `D-${diff}`, style: "bg-blue-100 text-blue-800" };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>유통사 입찰 공고함 · 배송 권역 자동 매칭</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              배송 권역 일치 오픈 견적 요청 (OPEN)
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl">
              선택한 유통업체의 배송 가능 권역(delivery_regions)과 일치하는 식당의 OPEN 견적
              요청서만 자동 필터링하여 표시합니다.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur rounded-2xl px-4 py-3 border border-white/20 self-start md:self-auto">
            <div>
              <div className="text-[11px] text-blue-100">단가 준수 신뢰도</div>
              <div className="text-xl font-extrabold flex items-center space-x-1">
                <span>{supplierProfile?.trust_score ?? 100}점</span>
                <BadgeCheck className="w-5 h-5 text-emerald-300" />
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-[11px] text-blue-100">등록 단가표</div>
              <div className="text-xl font-extrabold">{catalogCount}종</div>
            </div>
          </div>
        </div>

        {/* Demo Supplier Switcher (3개 유통업체 원클릭 전환) */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-3.5 border border-white/15 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-blue-50 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4" />
              <span>데모 유통업체 계정 전환 (3곳 중 선택)</span>
            </span>
            <span className="text-[11px] text-blue-100">
              업체별 배송 권역 및 보유 단가표에 따라 매칭 공고가 달라집니다.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {SUPPLIER_DEMO_USERS.map((sup) => {
              const isSelected = activeSupplier.id === sup.id;
              return (
                <button
                  key={sup.id}
                  type="button"
                  onClick={() => handleSelectSupplier(sup)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-white text-blue-950 border-white shadow-md"
                      : "bg-blue-950/30 text-blue-50 border-white/20 hover:bg-blue-950/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">{sup.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? "bg-blue-100 text-blue-800"
                          : "bg-white/15 text-blue-100"
                      }`}
                    >
                      {sup.badge}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 truncate ${
                      isSelected ? "text-gray-500" : "text-blue-200"
                    }`}
                  >
                    {sup.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submitted Banner */}
      {submittedRfqId && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>입찰서가 성공적으로 제출되었습니다!</strong> 제출된 포장단위 공급가는 기준단위(kg/L/ea)로
            자동 환산되어 식당의 비교 매트릭스에 즉시 반영됩니다.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Active Supplier Delivery Regions Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center space-x-1 font-bold text-gray-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>{supplierProfile?.company_name || activeSupplier.name} 배송 권역:</span>
          </span>
          {deliveryRegions.length > 0 ? (
            deliveryRegions.map((reg) => (
              <span
                key={reg}
                className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold"
              >
                {reg}
              </span>
            ))
          ) : (
            <span className="text-gray-400">등록된 배송 권역 없음</span>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs shrink-0">
          <span className="text-gray-500">
            전체 OPEN {allOpenRfqs.length}건 중{" "}
            <strong className="text-blue-700">권역 일치 {matchedRfqs.length}건</strong>
          </span>
          <button
            type="button"
            onClick={loadData}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600"
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Matched OPEN RFQ Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-200 p-6 animate-pulse space-y-3"
              >
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-14 bg-gray-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : matchedRfqs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto" />
            <h2 className="text-base font-bold text-gray-800">
              현재 배송 권역과 일치하는 OPEN 견적 요청서가 없습니다
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              상단에서 다른 데모 유통업체를 선택하거나, 식당 모드에서{" "}
              <strong>{deliveryRegions[0] || "충북 청주시 흥덕구"}</strong> 권역의 새 견적
              요청서를 등록해 보세요.
            </p>
          </div>
        ) : (
          matchedRfqs.map((rfq) => {
            const rfqItems = rfq.rfq_items || [];
            const dday = formatDday(rfq.deadline);
            const myBid = myBidsByRfq[rfq.id];
            const myBidItemCount = myBid?.bid_items?.length ?? 0;

            return (
              <div
                key={rfq.id}
                className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all space-y-4 ${
                  submittedRfqId === rfq.id
                    ? "border-blue-400 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${dday.style}`}
                      >
                        {dday.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        OPEN
                      </span>
                      {myBid && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            투찰 완료 ({myBidItemCount}/{rfqItems.length}품목 · MOQ{" "}
                            {formatNumber(myBid.moq_amount)}원)
                          </span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-extrabold text-gray-900">
                      {rfq.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="font-semibold text-gray-800">
                        발주 식당: {rfq.profiles?.company_name || "식당"}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center space-x-1 text-blue-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{rfq.region}</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center space-x-1">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        <span>{rfq.payment_terms}</span>
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/supplier/rfqs/${rfq.id}/bid`}
                    className={`px-5 py-3 rounded-2xl text-sm font-extrabold flex items-center justify-center space-x-1.5 shadow-sm transition-all self-start lg:self-auto shrink-0 ${
                      myBid
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                    }`}
                  >
                    <span>{myBid ? "입찰서 수정하기" : "입찰하기"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-2xl text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">식당 배송 위치</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">
                      {rfq.region}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">희망 계약 기간</span>
                    <span className="font-bold text-gray-900 mt-0.5 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{rfq.contract_months}개월</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">희망 배송 요일</span>
                    <span className="font-bold text-gray-900 mt-0.5 block">
                      {Array.isArray(rfq.delivery_days)
                        ? `${rfq.delivery_days.join(", ")} (주 ${rfq.delivery_days.length}회)`
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">요청 품목 / 마감일</span>
                    <span className="font-bold text-blue-700 mt-0.5 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {rfqItems.length}개 품목 ·{" "}
                        {new Date(rfq.deadline).toLocaleDateString("ko-KR")}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Requested Items Chips */}
                {rfqItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-gray-400 mr-1">
                      <Package className="w-3.5 h-3.5" />
                      <span>요청 식자재:</span>
                    </span>
                    {rfqItems.map((it: any) => (
                      <span
                        key={it.id}
                        className="px-2.5 py-1 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-950 text-[11px] font-medium"
                      >
                        {it.standard_items?.item_name}{" "}
                        <strong className="font-mono text-blue-700">
                          {formatNumber(it.monthly_qty)}
                          {it.standard_items?.base_unit}
                        </strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function SupplierRfqsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-sm text-gray-400">
          배송 권역 일치 입찰 공고를 불러오는 중...
        </div>
      }
    >
      <SupplierRfqsContent />
    </Suspense>
  );
}
