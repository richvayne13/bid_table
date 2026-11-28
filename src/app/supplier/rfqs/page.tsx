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

    // 실시간 커뮤니티 동기화: A구매자가 견적을 올리면 즉시 화면 갱신
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSupplier.id]);

  const deliveryRegions: string[] = useMemo(() => {
    if (Array.isArray(supplierProfile?.delivery_regions)) {
      return supplierProfile.delivery_regions;
    }
    return [];
  }, [supplierProfile]);

  // 실시간 피드 탭: "all" (전체 커뮤니티 공고) | "matched" (권역 일치)
  const [rfqFilterTab, setRfqFilterTab] = useState<"all" | "matched">("all");

  // 배송 권역 일치 OPEN RFQ 필터링
  const matchedRfqs = useMemo(() => {
    if (rfqFilterTab === "all" || deliveryRegions.length === 0) {
      return allOpenRfqs;
    }
    const filtered = allOpenRfqs.filter((rfq) =>
      isRegionMatched(deliveryRegions, rfq.region)
    );
    return filtered.length > 0 ? filtered : allOpenRfqs;
  }, [allOpenRfqs, deliveryRegions, rfqFilterTab]);

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
      {/* Top Header - SUPPLIER 블랙 테마 */}
      <div className="bg-[#1f2329] border border-zinc-800 rounded-3xl p-6 sm:p-8 text-zinc-100 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>유통사 입찰 공고함 · 배송 권역 자동 매칭 (블랙 테마)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              배송 권역 일치 오픈 견적 요청 (OPEN)
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl">
              선택한 유통업체의 배송 가능 권역(delivery_regions)과 일치하는 식당의 OPEN 견적
              요청서만 자동 필터링하여 표시합니다.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-zinc-900/90 rounded-2xl px-4 py-3 border border-zinc-700/80 self-start md:self-auto">
            <div>
              <div className="text-[11px] text-zinc-400">단가 준수 신뢰도</div>
              <div className="text-xl font-extrabold flex items-center space-x-1 text-white">
                <span>{supplierProfile?.trust_score ?? 100}점</span>
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-700" />
<div>
              <div className="text-[11px] text-zinc-400">실시간 대기 견적</div>
              <div className="text-xl font-extrabold text-emerald-400">{allOpenRfqs.length}건</div>
            </div>
          </div>
        </div>

        {/* Demo Supplier Switcher (3개 유통업체 원클릭 전환) */}
        <div className="bg-zinc-900/80 rounded-2xl p-3.5 border border-zinc-800 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-zinc-200 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>데모 유통업체 계정 전환 (3곳 중 선택)</span>
            </span>
            <span className="text-[11px] text-zinc-400">
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
                      ? "bg-zinc-800 text-white border-emerald-500 shadow-lg ring-1 ring-emerald-500/40"
                      : "bg-[#181a1d] text-zinc-300 border-zinc-800 hover:bg-zinc-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">{sup.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {sup.badge}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 truncate ${
                      isSelected ? "text-zinc-300" : "text-zinc-500"
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
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/60 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>입찰서가 성공적으로 제출되었습니다!</strong> 제출된 포장단위 공급가는 기준단위(kg/L/ea)로
            자동 환산되어 식당의 비교 매트릭스에 즉시 반영됩니다.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Active Supplier Delivery Regions Bar & 실시간 커뮤니티 필터 탭 */}
      <div className="bg-[#22252a] rounded-2xl border border-zinc-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-zinc-200">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 커뮤니티 탭 */}
          <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-700/80 mr-2">
            <button
              type="button"
              onClick={() => setRfqFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                rfqFilterTab === "all"
                  ? "bg-emerald-500 text-zinc-950 font-black shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>실시간 커뮤니티 전체 피드 ({allOpenRfqs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setRfqFilterTab("matched")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                rfqFilterTab === "matched"
                  ? "bg-emerald-500 text-zinc-950 font-black shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>배송 권역 매칭 ({matchedRfqs.length})</span>
            </button>
          </div>

          <span className="inline-flex items-center space-x-1 font-bold text-zinc-300">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>{supplierProfile?.company_name || activeSupplier.name} 배송 권역:</span>
          </span>
          {deliveryRegions.length > 0 ? (
            deliveryRegions.map((reg) => (
              <span
                key={reg}
                className="px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-700/50 font-semibold"
              >
                {reg}
              </span>
            ))
          ) : (
            <span className="text-zinc-500">등록된 배송 권역 없음 (전체 권역 수신 가능)</span>
          )}
        </div>

        <div className="flex items-center space-x-3 text-xs shrink-0">
          <span className="text-zinc-400">
            총 <strong className="text-emerald-400">{matchedRfqs.length}건</strong> 공고 수신 중
          </span>
          <button
            type="button"
            onClick={loadData}
            className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1"
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            <span className="text-[11px] hidden sm:inline">실시간 새로고침</span>
          </button>
        </div>
      </div>

      {/* 실시간 견적 요청 긴급 수신 알림 배너 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-900 border border-amber-500/50 shadow-lg text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-300 font-extrabold text-xs sm:text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <span>🚨 [실시간 견적 요청 알림] 구매자가 견적을 요청하고 공급사의 금액 제출을 대기하고 있습니다!</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">실시간 알림 수신 중</span>
        </div>
        <p className="text-zinc-300 text-[11px] sm:text-xs leading-relaxed">
          공급업체는 사전에 등록된 기준단가가 아닌, 아래 공고를 확인하고 <strong>해당 견적 건에 대해 금액을 일일이 직접 입력</strong>하여 최적의 단가를 제안해 주세요.
        </p>
      </div>

      {/* Matched OPEN RFQ Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#22252a] rounded-3xl border border-zinc-800 p-6 animate-pulse space-y-3"
              >
                <div className="h-5 bg-zinc-800 rounded w-1/3" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
                <div className="h-14 bg-zinc-800/60 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : matchedRfqs.length === 0 ? (
          <div className="bg-[#22252a] rounded-3xl border border-dashed border-zinc-800 p-12 text-center space-y-3">
            <MapPin className="w-10 h-10 text-zinc-600 mx-auto" />
            <h2 className="text-base font-bold text-zinc-300">
              현재 배송 권역과 일치하는 OPEN 견적 요청서가 없습니다
            </h2>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              상단에서 다른 데모 유통업체를 선택하거나, 식당 모드에서{" "}
              <strong className="text-zinc-400">{deliveryRegions[0] || "충북 청주시 흥덕구"}</strong> 권역의 새 견적
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
                className={`bg-[#22252a] rounded-3xl border p-6 shadow-lg transition-all space-y-4 ${
                  submittedRfqId === rfq.id
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-zinc-800 text-amber-300 border border-amber-500/30"
                      >
                        {dday.label}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        OPEN
                      </span>
                      {myBid && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            투찰 완료 ({myBidItemCount}/{rfqItems.length}품목 · MOQ{" "}
                            {formatNumber(myBid.moq_amount)}원)
                          </span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-extrabold text-white">
                      {rfq.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-300">
                        발주 식당: {rfq.profiles?.company_name || "식당"}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{rfq.region}</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center space-x-1">
                        <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{rfq.payment_terms}</span>
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/supplier/rfqs/demo/bid?id=${rfq.id}`}
                    className={`px-5 py-3 rounded-2xl text-sm font-extrabold flex items-center justify-center space-x-1.5 shadow-md transition-all self-start lg:self-auto shrink-0 ${
                      myBid
                        ? "bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-emerald-500/40"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                    }`}
                  >
                    <span>{myBid ? "입찰 금액 수정하기" : "금액 직접 입력 & 견적 제출"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#181a1d] p-3.5 rounded-2xl text-xs border border-zinc-800/80">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">식당 배송 위치</span>
                    <span className="font-bold text-zinc-200 mt-0.5 block">
                      {rfq.region}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">희망 계약 기간</span>
                    <span className="font-bold text-zinc-200 mt-0.5 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{rfq.contract_months}개월</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">희망 배송 요일</span>
                    <span className="font-bold text-zinc-200 mt-0.5 block">
                      {Array.isArray(rfq.delivery_days)
                        ? `${rfq.delivery_days.join(", ")} (주 ${rfq.delivery_days.length}회)`
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">요청 품목 / 마감일</span>
                    <span className="font-bold text-emerald-400 mt-0.5 flex items-center space-x-1">
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
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-zinc-500 mr-1">
                      <Package className="w-3.5 h-3.5" />
                      <span>요청 식자재:</span>
                    </span>
                    {rfqItems.map((it: any) => (
                      <span
                        key={it.id}
                        className="px-2.5 py-1 rounded-lg bg-[#181a1d] border border-zinc-800 text-zinc-300 text-[11px] font-medium"
                      >
                        {it.standard_items?.item_name}{" "}
                        <strong className="font-mono text-emerald-400">
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
