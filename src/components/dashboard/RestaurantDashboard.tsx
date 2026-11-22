"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { formatPrice, formatNumber } from "@/lib/utils";
import {
  UtensilsCrossed,
  TrendingDown,
  FileCheck2,
  Scale,
  Sparkles,
  ShieldAlert,
  Clock,
  Plus,
  ClipboardList,
} from "lucide-react";

export function RestaurantDashboard() {
  const { currentUser } = useRole();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [rfqRes, contractRes, auditRes] = await Promise.all([
          supabase
            .from("rfqs")
            .select("*, rfq_items(*, standard_items(*))")
            .eq("restaurant_id", currentUser?.id || "b0000000-0000-0000-0000-000000000001")
            .order("created_at", { ascending: false }),
          supabase.from("contracts").select("*, profiles(*)").limit(5),
          supabase
            .from("invoice_audits")
            .select("*, contracts(*, profiles(*))")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const rfqList = rfqRes.data || [];
        setRfqs(rfqList);
        setContracts(contractRes.data || []);
        setAudits(auditRes.data || []);

        if (rfqList.length > 0) {
          // Prefer seeded/active RFQ that has bids or the latest one
          const defaultRfq = rfqList[0];
          setSelectedRfqId(defaultRfq.id);
        }
      } catch (err) {
        console.error("Failed to load restaurant data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [supabase, currentUser?.id]);

  useEffect(() => {
    async function loadBids() {
      if (!selectedRfqId) {
        setBids([]);
        return;
      }
      const { data: bidsData } = await supabase
        .from("bids")
        .select("*, bid_items(*), profiles(*)")
        .eq("rfq_id", selectedRfqId);
      setBids(bidsData || []);
    }
    loadBids();
  }, [selectedRfqId, supabase]);

  const activeRfq = rfqs.find((r) => r.id === selectedRfqId) || rfqs[0] || null;
  const items = activeRfq?.rfq_items || [];
  const openRfqCount = rfqs.filter((r) => r.status === "OPEN").length;

  // Compute current baseline total & best split total from real bids
  const matrixAnalysis = useMemo(() => {
    let baselineTotal = 0;
    let bestSplitTotal = 0;
    let coveredItems = 0;

    items.forEach((item: any) => {
      const qty = Number(item.monthly_qty) || 0;
      const curPrice = Number(item.current_unit_price) || 0;
      if (curPrice > 0) baselineTotal += curPrice * qty;

      let lowest: number | null = null;
      bids.forEach((b: any) => {
        const bi = b.bid_items?.find((x: any) => x.rfq_item_id === item.id);
        if (bi) {
          const unitPrice = Number(bi.normalized_unit_price);
          if (lowest === null || unitPrice < lowest) lowest = unitPrice;
        }
      });

      if (lowest !== null) {
        coveredItems += 1;
        bestSplitTotal += lowest * qty;
      } else if (curPrice > 0) {
        bestSplitTotal += curPrice * qty;
      }
    });

    const monthlySavings =
      baselineTotal > 0 && coveredItems > 0
        ? Math.max(0, baselineTotal - bestSplitTotal)
        : 0;
    const savingsRate =
      baselineTotal > 0 && monthlySavings > 0
        ? (monthlySavings / baselineTotal) * 100
        : 0;

    return {
      baselineTotal,
      bestSplitTotal,
      monthlySavings,
      savingsRate,
      coveredItems,
    };
  }, [items, bids]);

  const totalViolations = audits.reduce(
    (acc, a) => acc + (Number(a.violation_count) || 0),
    0
  );
  const totalOvercharge = audits.reduce(
    (acc, a) => acc + (Number(a.total_overcharge) || 0),
    0
  );

  const daysUntilDeadline = activeRfq
    ? Math.ceil(
        (new Date(activeRfq.deadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>식당 업주 모드 · {currentUser?.name || "식당 업주"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              식자재 역경매 및 단가방어 대시보드
            </h2>
            <p className="text-blue-100 text-sm max-w-xl">
              등록하신 월간 식자재 품목에 대해 유통사들이 기준 단위(kg/L/ea)로 경쟁 입찰 중입니다.
              새로운 견적 요청서를 작성하거나 실시간 매트릭스 뷰에서 최저가를 확인하세요.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <Link
                href="/rfq/new"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>새 견적 요청서 작성하기</span>
              </Link>
              <Link
                href="/rfq"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-700/40 hover:bg-blue-700/60 border border-white/30 text-white font-bold text-xs transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                <span>내 견적 요청서 목록 ({rfqs.length}건)</span>
              </Link>
            </div>
          </div>
          <div className="flex sm:flex-col items-end justify-between gap-1 bg-white/10 backdrop-blur rounded-2xl px-5 py-4 border border-white/20">
            <span className="text-xs text-blue-100 font-medium">
              선택 공고 예상 절감률
            </span>
            <span className="text-3xl font-extrabold tracking-tight">
              {matrixAnalysis.savingsRate > 0
                ? `${matrixAnalysis.savingsRate.toFixed(1)}%`
                : "대기 중"}{" "}
              {matrixAnalysis.savingsRate > 0 && (
                <span className="text-base font-normal">절감</span>
              )}
            </span>
            {matrixAnalysis.monthlySavings > 0 && (
              <span className="text-xs text-blue-100">
                월 {formatPrice(matrixAnalysis.monthlySavings)} 절감 가능
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/rfq"
          className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:border-blue-300 transition-colors flex items-center space-x-4"
        >
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">진행 중 역경매</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {openRfqCount}건{" "}
              {daysUntilDeadline !== null && daysUntilDeadline >= 0
                ? `(D-${daysUntilDeadline})`
                : ""}
            </div>
            <div className="text-[11px] text-blue-600 font-medium">
              전체 {rfqs.length}건 중 {bids.length}개사 투찰
            </div>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">예상 월 절감액</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {matrixAnalysis.monthlySavings > 0
                ? formatPrice(matrixAnalysis.monthlySavings)
                : "입찰 대기"}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              기존 매입가 대비 최저가 기준
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">체결된 정기 계약</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {contracts.length}건
            </div>
            <div className="text-[11px] text-blue-600 font-medium">
              {contracts[0]?.profiles?.company_name
                ? `${contracts[0].profiles.company_name} 외`
                : "확정 단가 스냅샷 보장"}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">단가 인상 감시 적발</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">
              {totalViolations}건 적발
            </div>
            <div className="text-[11px] text-rose-600 font-medium">
              {formatPrice(totalOvercharge)} 과다청구 차단
            </div>
          </div>
        </div>
      </div>

      {/* Matrix View Section (가로×세로 매트릭스 뷰) */}
      <div
        id="matrix"
        className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                <Scale className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                실시간 가로×세로 입찰 비교 매트릭스 뷰
              </h3>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                단위 자동 정합화 (kg/L/ea)
              </span>
            </div>
            <p className="text-xs text-gray-500">
              유통사별 포장 규격 및 공급가를 표준 단위로 자동 환산하여 한눈에 최저가를 비교합니다.
            </p>
          </div>

          {rfqs.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-semibold text-gray-500 shrink-0">
                비교 공고:
              </label>
              <select
                value={activeRfq?.id || ""}
                onChange={(e) => setSelectedRfqId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-800 max-w-xs"
              >
                {rfqs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.status})
                  </option>
                ))}
              </select>
              {activeRfq && (
                <Link
                  href={`/rfq/${activeRfq.id}/compare`}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  상세 시뮬레이터 열기 →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-400">
              Supabase에서 견적 및 입찰 데이터를 불러오는 중...
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm text-gray-500">
                등록된 견적 요청 품목이 없습니다. 새 견적 요청서를 작성해 보세요.
              </p>
              <Link
                href="/rfq/new"
                className="inline-flex items-center space-x-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
                <span>견적 요청서 작성하기</span>
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">요청 품목 및 규격</th>
                  <th className="py-3.5 px-4 text-center">월 예상 소요량</th>
                  <th className="py-3.5 px-4 text-right">기존 매입단가</th>
                  {bids.map((b) => (
                    <th
                      key={b.id}
                      className="py-3.5 px-4 text-right bg-blue-50/30 border-l border-gray-100"
                    >
                      <div>{b.profiles?.company_name || "유통사"}</div>
                      <span className="block text-[10px] font-normal text-gray-400">
                        MOQ {formatNumber(b.moq_amount)}원 ·{" "}
                        {b.price_lock_type === "FIXED" ? "고정단가" : "시세연동"}
                      </span>
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-center bg-gray-100/60 font-bold text-gray-700">
                    품목별 최저가
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item: any) => {
                  const std = item.standard_items;
                  let minBid: { price: number; supplier: string } | null = null;

                  bids.forEach((b: any) => {
                    const bi = b.bid_items?.find(
                      (x: any) => x.rfq_item_id === item.id
                    );
                    if (bi) {
                      const p = Number(bi.normalized_unit_price);
                      if (!minBid || p < minBid.price) {
                        minBid = {
                          price: p,
                          supplier: b.profiles?.company_name || "유통사",
                        };
                      }
                    }
                  });

                  const savingsPct =
                    minBid && item.current_unit_price
                      ? Math.round(
                          ((item.current_unit_price - (minBid as { price: number }).price) /
                            item.current_unit_price) *
                            100
                        )
                      : null;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">
                          {std?.item_name}
                        </div>
                        <div className="text-xs text-gray-400">{std?.spec}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium">
                        {formatNumber(item.monthly_qty)} {std?.base_unit}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-500">
                        {item.current_unit_price
                          ? formatPrice(item.current_unit_price)
                          : "-"}
                      </td>

                      {bids.map((b: any) => {
                        const bi = b.bid_items?.find(
                          (x: any) => x.rfq_item_id === item.id
                        );
                        const price = bi ? Number(bi.normalized_unit_price) : null;
                        const isLowest =
                          price !== null &&
                          minBid !== null &&
                          price === (minBid as { price: number }).price;

                        return (
                          <td
                            key={b.id}
                            className="py-3.5 px-4 text-right border-l border-gray-100"
                          >
                            {price !== null ? (
                              <span
                                className={
                                  isLowest
                                    ? "font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded"
                                    : "text-gray-700"
                                }
                              >
                                {formatPrice(price)}/{std?.base_unit}
                                {isLowest ? " ⭐" : ""}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-3.5 px-4 text-center bg-gray-50/30">
                        {minBid ? (
                          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-md">
                            {(minBid as { supplier: string }).supplier}
                            {savingsPct !== null && savingsPct > 0
                              ? ` (${savingsPct}% 절감)`
                              : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">입찰 대기</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Summary Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-slate-50/70 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  기존 매입가 기준 월 예상 총액
                </span>
                <span className="text-xs text-gray-500">
                  요청 {items.length}개 품목
                </span>
              </div>
              <div className="pt-2 flex justify-between items-baseline border-t border-gray-100">
                <span className="text-xs text-gray-500">현재 예상 월 발주액</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(matrixAnalysis.baselineTotal)}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 rounded-2xl border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-200 text-blue-900 inline-flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>최저가 조합 시 예상 월 발주총액</span>
                </span>
                <span className="text-xs font-bold text-blue-800">
                  참여 {bids.length}개 유통사
                </span>
              </div>
              <div className="pt-2 flex justify-between items-baseline border-t border-blue-200/60">
                <span className="text-xs text-blue-900 font-medium">
                  품목별 최저가 합산
                </span>
                <span className="text-xl font-extrabold text-blue-600">
                  {matrixAnalysis.coveredItems > 0
                    ? `${formatPrice(matrixAnalysis.bestSplitTotal)} (${formatPrice(
                        matrixAnalysis.monthlySavings
                      )} 절감)`
                    : "유통사 입찰 대기 중"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Audit Monitoring Section (단가 인상 방어 감시) */}
      <div
        id="audits"
        className="bg-white rounded-3xl border border-rose-200 shadow-sm p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                거래명세서 OCR 대조 단가 인상 감시 센터
              </h3>
              <p className="text-xs text-gray-500">
                납품 후 업로드된 거래명세서의 공급단가를 계약 확정 단가 스냅샷과 실시간 자동
                대조합니다.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {totalViolations > 0 && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 text-rose-700">
                🚨 무단 인상 {totalViolations}건 감지
              </span>
            )}
            {contracts[0]?.id && (
              <Link
                href={`/contracts/${contracts[0].id}/audit`}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                OCR 대조 센터 열기 →
              </Link>
            )}
          </div>
        </div>

        {audits.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">
            현재 감시된 단가 위반 내역이 없습니다.
          </p>
        ) : (
          audits.map((audit) => (
            <div
              key={audit.id}
              className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-950">
                  계약사: {audit.contracts?.profiles?.company_name || "B미트 육류전문"}
                </span>
                <span className="text-gray-500">
                  {new Date(audit.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-rose-100 space-y-2 text-xs">
                <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-1">
                  <span>적발 품목</span>
                  <span className="text-right">계약 단가</span>
                  <span className="text-right">청구 단가</span>
                  <span className="text-right text-rose-600">초과 차액</span>
                </div>
                {audit.parsed_items?.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-4 items-center py-0.5"
                  >
                    <span className="font-medium text-gray-900">
                      {p.item_name} ({p.qty}kg)
                    </span>
                    <span className="text-right text-gray-500">
                      {formatPrice(p.contract_unit_price)}
                    </span>
                    <span
                      className={`text-right font-bold ${
                        p.is_violation ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {formatPrice(p.invoiced_unit_price)}
                    </span>
                    <span className="text-right">
                      {p.is_violation ? (
                        <span className="font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          +{formatPrice(p.diff * p.qty)} 무단 인상
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">정상</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
