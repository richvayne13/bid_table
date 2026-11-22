"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole, DEMO_USERS } from "@/contexts/RoleContext";
import { formatPrice, formatNumber } from "@/lib/utils";
import { getStoredDemoRfqs } from "@/lib/mock-storage";
import {
  Plus,
  Clock,
  Calendar,
  MapPin,
  CreditCard,
  Scale,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Package,
  RefreshCw,
} from "lucide-react";

const DEFAULT_RESTAURANT_USER =
  DEMO_USERS.find((u) => u.role === "RESTAURANT") || DEMO_USERS[0];

function RfqListContent() {
  const searchParams = useSearchParams();
  const createdId = searchParams.get("created");
  const { currentUser } = useRole();
  const supabase = useMemo(() => createClient(), []);

  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeRestaurantId =
    currentUser?.role === "RESTAURANT"
      ? currentUser.id
      : DEFAULT_RESTAURANT_USER.id;

  const loadRfqs = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const query = supabase
        .from("rfqs")
        .select(
          "*, rfq_items(id, monthly_qty, current_unit_price, standard_items(item_name, base_unit)), bids(id, status, supplier_id), contracts(id, supplier_id, profiles(company_name))"
        )
        .order("created_at", { ascending: false });

      if (currentUser?.role === "RESTAURANT") {
        query.eq("restaurant_id", activeRestaurantId);
      }

      const localDemoRfqs = getStoredDemoRfqs();

      const { data, error } = await query;
      if (error) {
        console.warn("Supabase fetch failed, showing local demo rfqs:", error.message);
        setRfqs(localDemoRfqs);
      } else {
        // Merge Supabase items and local demo items (dedup by id)
        const combined = [...(data || [])];
        localDemoRfqs.forEach((d) => {
          if (!combined.some((c) => c.id === d.id)) {
            combined.unshift(d as any);
          }
        });
        setRfqs(combined);
      }
    } catch (err: any) {
      console.warn("loadRfqs fallback to local demo rfqs:", err?.message);
      setRfqs(getStoredDemoRfqs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRfqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.role]);

  const handleToggleClose = async (rfqId: string, nextStatus: "OPEN" | "CLOSED") => {
    try {
      setUpdatingId(rfqId);
      const { error } = await supabase
        .from("rfqs")
        .update({ status: nextStatus })
        .eq("id", rfqId);

      if (error) throw error;
      setRfqs((prev) =>
        prev.map((r) => (r.id === rfqId ? { ...r, status: nextStatus } : r))
      );
    } catch (err: any) {
      setErrorMsg(`상태 변경 실패: ${err?.message || "오류가 발생했습니다."}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = useMemo(
    () => ({
      ALL: rfqs.length,
      OPEN: rfqs.filter((r) => r.status === "OPEN").length,
      CLOSED: rfqs.filter((r) => r.status === "CLOSED").length,
      CONTRACTED: rfqs.filter((r) => r.status === "CONTRACTED").length,
      TOTAL_BIDS: rfqs.reduce((acc, r) => acc + (r.bids?.length || 0), 0),
    }),
    [rfqs]
  );

  const filteredRfqs = useMemo(() => {
    if (statusFilter === "ALL") return rfqs;
    return rfqs.filter((r) => r.status === statusFilter);
  }, [rfqs, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 inline-flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>OPEN · 입찰 진행 중</span>
          </span>
        );
      case "CONTRACTED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 inline-flex items-center space-x-1">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>CONTRACTED · 계약 체결</span>
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 inline-flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5 text-gray-500" />
            <span>CLOSED · 입찰 마감</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              내 견적 요청서 (RFQ) 목록
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 text-xs font-semibold">
              {currentUser?.role === "RESTAURANT" ? currentUser.name : "전체 공고 보기"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            등록하신 정기 식자재 견적 요청서의 진행 상태(OPEN · CLOSED · CONTRACTED)와 유통사 입찰
            건수를 확인하세요.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadRfqs}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/rfq/new"
            className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center space-x-1.5 shadow-md shadow-orange-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>새 견적 요청서 작성</span>
          </Link>
        </div>
      </div>

      {/* Created Success Banner */}
      {createdId && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>새 견적 요청서가 성공적으로 게시되었습니다!</strong> 배송 권역 유통사들에게
            공고가 오픈되었습니다.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-500">입찰 진행 중 (OPEN)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{counts.OPEN}건</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-500">입찰 마감 (CLOSED)</div>
          <div className="text-2xl font-black text-gray-700 mt-1">{counts.CLOSED}건</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-500">계약 체결 (CONTRACTED)</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{counts.CONTRACTED}건</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-xs font-semibold text-gray-500">누적 유통사 입찰 건수</div>
          <div className="text-2xl font-black text-orange-600 mt-1">
            {counts.TOTAL_BIDS}건
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-gray-400 mr-1">상태 필터:</span>
        {[
          { key: "ALL", label: `전체 (${counts.ALL})` },
          { key: "OPEN", label: `OPEN (${counts.OPEN})` },
          { key: "CLOSED", label: `CLOSED (${counts.CLOSED})` },
          { key: "CONTRACTED", label: `CONTRACTED (${counts.CONTRACTED})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RFQ List Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-gray-200 p-6 animate-pulse space-y-3"
              >
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-16 bg-gray-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          filteredRfqs.map((rfq) => {
            const rfqItems = rfq.rfq_items || [];
            const itemCount = rfqItems.length;
            const bidCount = rfq.bids?.length ?? 0;
            const estimatedMonthlyBudget = rfqItems.reduce(
              (acc: number, it: any) =>
                acc + (Number(it.current_unit_price) || 0) * (Number(it.monthly_qty) || 0),
              0
            );
            const daysLeft = Math.ceil(
              (new Date(rfq.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const isHighlighted = createdId === rfq.id;

            return (
              <div
                key={rfq.id}
                className={`bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all space-y-4 ${
                  isHighlighted
                    ? "border-orange-400 ring-2 ring-orange-200"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(rfq.status)}
                      {rfq.status === "OPEN" && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            daysLeft < 0
                              ? "bg-rose-100 text-rose-700"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {daysLeft < 0 ? "마감 기한 경과" : `D-${daysLeft}`}
                        </span>
                      )}
                      <h2 className="text-lg font-bold text-gray-900">{rfq.title}</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{rfq.region}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{rfq.contract_months}개월 계약</span>
                      </span>
                      <span>•</span>
                      <span>
                        배송: {Array.isArray(rfq.delivery_days) ? rfq.delivery_days.join(", ") : "-"}
                        요일
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                        <span>{rfq.payment_terms}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                    {rfq.status === "OPEN" && (
                      <button
                        type="button"
                        disabled={updatingId === rfq.id}
                        onClick={() => handleToggleClose(rfq.id, "CLOSED")}
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        입찰 마감 처리
                      </button>
                    )}
                    {rfq.status === "CLOSED" && (
                      <button
                        type="button"
                        disabled={updatingId === rfq.id}
                        onClick={() => handleToggleClose(rfq.id, "OPEN")}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        다시 열기 (OPEN)
                      </button>
                    )}
                    <Link
                      href={`/rfq/${rfq.id}/compare`}
                      className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 flex items-center space-x-1.5 transition-colors"
                    >
                      <Scale className="w-3.5 h-3.5 text-orange-600" />
                      <span>입찰 비교 매트릭스</span>
                    </Link>
                    {Array.isArray(rfq.contracts) && rfq.contracts.length > 0 && (
                      <Link
                        href={`/contracts/${rfq.contracts[0].id}/audit`}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center space-x-1.5 transition-colors"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>
                          단가 감시 ({rfq.contracts[0].profiles?.company_name || "계약"})
                        </span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stats Footer */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-2xl text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">요청 품목 수</span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      {itemCount}개 품목
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">유통사 입찰 건수</span>
                    <span className="font-bold text-orange-600 text-sm mt-0.5 block">
                      {bidCount}건 {bidCount > 0 ? "입찰 접수" : "(대기 중)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">입찰 마감일</span>
                    <span className="font-medium text-gray-800 text-sm mt-0.5 block">
                      {new Date(rfq.deadline).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">
                      기존 매입가 기준 월 총액
                    </span>
                    <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">
                      {estimatedMonthlyBudget > 0
                        ? formatPrice(estimatedMonthlyBudget)
                        : "단가 미입력"}
                    </span>
                  </div>
                </div>

                {/* Requested Items Chips Preview */}
                {rfqItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-gray-400 mr-1">
                      <Package className="w-3.5 h-3.5" />
                      <span>요청 품목:</span>
                    </span>
                    {rfqItems.slice(0, 6).map((it: any) => (
                      <span
                        key={it.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {it.standard_items?.item_name || "품목"}{" "}
                        <strong className="font-mono">
                          {formatNumber(it.monthly_qty)}
                          {it.standard_items?.base_unit}
                        </strong>
                      </span>
                    ))}
                    {rfqItems.length > 6 && (
                      <span className="text-[11px] text-gray-400 font-medium">
                        +{rfqItems.length - 6}개 더 있음
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {filteredRfqs.length === 0 && !loading && (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-3">
            <Clock className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">
              {statusFilter === "ALL"
                ? "등록된 견적 요청서가 없습니다"
                : `${statusFilter} 상태의 견적 요청서가 없습니다`}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              새로운 식자재 견적 요청서를 작성하고 배송 권역 유통사들의 최저가 입찰을 받아보세요.
            </p>
            <Link
              href="/rfq/new"
              className="inline-flex items-center space-x-1 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-orange-700 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>첫 견적 요청서 작성하기</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RfqListPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-sm text-gray-400">
          견적 요청서 목록을 불러오는 중...
        </div>
      }
    >
      <RfqListContent />
    </Suspense>
  );
}
