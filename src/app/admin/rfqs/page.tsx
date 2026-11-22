"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatNumber } from "@/lib/utils";
import { getUnifiedRfqs } from "@/lib/unified-rfq-store";
import {
  Gavel,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Scale,
  RefreshCw,
  Building2,
  Truck,
} from "lucide-react";

export default function AdminProxyBidPage() {
  const supabase = useMemo(() => createClient(), []);

  const [rfqs, setRfqs] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [catalogsBySupplier, setCatalogsBySupplier] = useState<
    Record<string, Record<string, { package_weight: number; package_price: number }>>
  >({});

  // Per-RFQ selected proxy supplier, MOQ, price lock
  const [selectedSupplierByRfq, setSelectedSupplierByRfq] = useState<
    Record<string, string>
  >({});
  const [moqByRfq, setMoqByRfq] = useState<Record<string, number>>({});
  const [lockByRfq, setLockByRfq] = useState<Record<string, "FIXED" | "INDEXED">>({});

  const [loading, setLoading] = useState(true);
  const [submittingRfqId, setSubmittingRfqId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
    rfqId?: string;
  } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const unifiedList = getUnifiedRfqs();

      let rfqList: any[] = [];
      let supList: any[] = [];

      try {
        const [rfqRes, supRes, catRes] = await Promise.all([
          supabase
            .from("rfqs")
            .select(
              "*, profiles(company_name), rfq_items(*, standard_items(*)), bids(id, supplier_id, moq_amount, price_lock_type, profiles(company_name, is_admin_managed))"
            )
            .eq("status", "OPEN")
            .order("created_at", { ascending: false }),
          supabase
            .from("profiles")
            .select("*")
            .eq("role", "SUPPLIER")
            .order("is_admin_managed", { ascending: false })
            .order("company_name", { ascending: true }),
          supabase.from("supplier_catalogs").select("*"),
        ]);

        rfqList = rfqRes.data || [];
        supList = supRes.data || [];

        const catMap: Record<
          string,
          Record<string, { package_weight: number; package_price: number }>
        > = {};
        (catRes.data || []).forEach((c: any) => {
          if (!catMap[c.supplier_id]) catMap[c.supplier_id] = {};
          catMap[c.supplier_id][c.standard_item_id] = {
            package_weight: Number(c.package_weight),
            package_price: Number(c.package_price),
          };
        });
        setCatalogsBySupplier(catMap);
      } catch (subErr) {
        console.warn("Supabase load failed in admin, using unified store:", subErr);
      }

      // Supabase 데이터와 통합 스토어 데이터 병합
      const combinedMap = new Map<string, any>();
      unifiedList.forEach((r) => combinedMap.set(r.id, r));
      rfqList.forEach((r) => combinedMap.set(r.id, r));

      const mergedRfqs = Array.from(combinedMap.values());
      setRfqs(mergedRfqs);
      setSuppliers(supList);

      // Default select first virtual supplier (or first non-bidding supplier) for each RFQ
      const defaultSel: Record<string, string> = {};
      const defaultMoq: Record<string, number> = {};
      const defaultLock: Record<string, "FIXED" | "INDEXED"> = {};

      rfqList.forEach((r: any) => {
        const biddedIds = new Set((r.bids || []).map((b: any) => b.supplier_id));
        const unbiddedVirtual = supList.find(
          (s: any) => s.is_admin_managed && !biddedIds.has(s.id)
        );
        const unbiddedAny = supList.find((s: any) => !biddedIds.has(s.id));
        defaultSel[r.id] =
          selectedSupplierByRfq[r.id] ||
          unbiddedVirtual?.id ||
          unbiddedAny?.id ||
          supList[0]?.id ||
          "";
        defaultMoq[r.id] = moqByRfq[r.id] ?? 150000;
        defaultLock[r.id] = lockByRfq[r.id] ?? "FIXED";
      });

      setSelectedSupplierByRfq(defaultSel);
      setMoqByRfq(defaultMoq);
      setLockByRfq(defaultLock);
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err?.message || "대리 입찰 데이터를 불러오지 못했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProxyBid = async (rfq: any) => {
    const supplierId = selectedSupplierByRfq[rfq.id];
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplierId || !supplier) {
      setNotice({ type: "error", text: "대리 입찰할 유통업체를 선택해 주세요." });
      return;
    }

    // Duplicate bid prevention
    const alreadyBid = (rfq.bids || []).some(
      (b: any) => b.supplier_id === supplierId
    );
    if (alreadyBid) {
      setNotice({
        type: "error",
        text: `${supplier.company_name}은(는) 이미 해당 견적 요청서에 입찰 완료된 업체입니다.`,
      });
      return;
    }

    const supCatalog = catalogsBySupplier[supplierId] || {};
    const matchedItems = (rfq.rfq_items || [])
      .map((it: any) => {
        const entry = supCatalog[it.standard_item_id];
        if (!entry) return null;
        return {
          rfq_item_id: it.id,
          package_weight: entry.package_weight,
          package_price: entry.package_price,
        };
      })
      .filter(Boolean);

    if (matchedItems.length === 0) {
      setNotice({
        type: "error",
        text: `${supplier.company_name}의 단가표에 이 공고의 요청 품목과 매칭되는 품목이 없습니다. 먼저 '가상 유통사 & 단가표'에서 단가를 등록해 주세요.`,
      });
      return;
    }

    try {
      setSubmittingRfqId(rfq.id);
      setNotice(null);

      // 1. Insert into bids
      const { data: newBid, error: bidErr } = await supabase
        .from("bids")
        .insert({
          rfq_id: rfq.id,
          supplier_id: supplierId,
          moq_amount: Number(moqByRfq[rfq.id]) || 150000,
          price_lock_type: lockByRfq[rfq.id] || "FIXED",
          status: "SUBMITTED",
        })
        .select()
        .single();

      if (bidErr) throw bidErr;

      // 2. Insert matched bid_items
      const { error: itemsErr } = await supabase.from("bid_items").insert(
        matchedItems.map((m: any) => ({
          bid_id: newBid.id,
          rfq_item_id: m.rfq_item_id,
          package_weight: m.package_weight,
          package_price: m.package_price,
        }))
      );

      if (itemsErr) throw itemsErr;

      setNotice({
        type: "success",
        rfqId: rfq.id,
        text: `[대리 입찰 완료] ${supplier.company_name} 명의로 "${rfq.title}"에 ${matchedItems.length}개 품목 입찰서가 자동 생성되었습니다!`,
      });
      await loadData();
    } catch (err: any) {
      setNotice({
        type: "error",
        text: `대리 입찰 실행 실패: ${err?.message || "오류가 발생했습니다."}`,
      });
    } finally {
      setSubmittingRfqId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            원클릭 대리 입찰 실행 (OPEN RFQ)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            진행 중인 식당 견적 요청서에 가상 유통업체를 선택해 `[대리 입찰 넣기]`를 누르면
            업체 단가표(`supplier_catalogs`)와 자동 매칭되어 `bids`·`bid_items`가 즉시 생성됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>새로고침</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            notice.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notice.type === "error" ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-semibold">{notice.text}</span>
          </div>
          {notice.rfqId && (
            <Link
              href={`/rfq/${notice.rfqId}/compare`}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shrink-0 inline-flex items-center space-x-1"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>매트릭스 반영 결과 확인 →</span>
            </Link>
          )}
        </div>
      )}

      {/* OPEN RFQ List */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          진행 중인 견적 요청서와 가상 유통사 단가표를 불러오는 중...
        </div>
      ) : rfqs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center space-y-2">
          <Gavel className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">
            현재 OPEN 상태의 견적 요청서가 없습니다.
          </p>
          <Link
            href="/rfq/new"
            className="inline-flex px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            새 견적 요청서 작성하러 가기
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {rfqs.map((rfq) => {
            const rfqItems = rfq.rfq_items || [];
            const existingBids = rfq.bids || [];
            const biddedSupplierIds = new Set(
              existingBids.map((b: any) => b.supplier_id)
            );
            const selectedSupId = selectedSupplierByRfq[rfq.id] || "";
            const isDuplicate = biddedSupplierIds.has(selectedSupId);
            const supCatalog = catalogsBySupplier[selectedSupId] || {};

            // Calculate live matching preview
            let matchCount = 0;
            let previewMonthlyTotal = 0;
            rfqItems.forEach((it: any) => {
              const entry = supCatalog[it.standard_item_id];
              if (entry && entry.package_weight > 0) {
                matchCount += 1;
                previewMonthlyTotal +=
                  (entry.package_price / entry.package_weight) *
                  Number(it.monthly_qty || 0);
              }
            });

            return (
              <div
                key={rfq.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5"
              >
                {/* RFQ Title & Current Bidders */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        OPEN
                      </span>
                      <h2 className="text-lg font-extrabold text-gray-900">
                        {rfq.title}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span className="font-semibold text-gray-800">
                        발주 식당: {rfq.profiles?.company_name || "식당"}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{rfq.region}</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {rfq.contract_months}개월 · 요청 {rfqItems.length}품목
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 self-start lg:self-auto">
                    <Link
                      href={`/rfq/${rfq.id}/compare`}
                      className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold inline-flex items-center space-x-1.5 transition-colors"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>매트릭스 비교 ({existingBids.length}개사)</span>
                    </Link>
                    <Link
                      href={`/supplier/rfqs/${rfq.id}/bid`}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold inline-flex items-center space-x-1.5 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>판매자 입찰서 보기</span>
                    </Link>
                  </div>
                </div>

                {/* Current Bidders Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-gray-400 font-semibold mr-1">
                    현재 입찰 완료 업체:
                  </span>
                  {existingBids.length === 0 ? (
                    <span className="text-gray-400">아직 입찰 없음</span>
                  ) : (
                    existingBids.map((b: any) => (
                      <span
                        key={b.id}
                        className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold inline-flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{b.profiles?.company_name || "유통사"}</span>
                        {b.profiles?.is_admin_managed && (
                          <span className="text-[10px] text-emerald-700">(가상)</span>
                        )}
                      </span>
                    ))
                  )}
                </div>

                {/* Proxy Bid Control Panel */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        대리 입찰할 유통업체 선택 (가상업체 우선 표시)
                      </label>
                      <select
                        value={selectedSupId}
                        onChange={(e) =>
                          setSelectedSupplierByRfq((prev) => ({
                            ...prev,
                            [rfq.id]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold"
                      >
                        {suppliers.map((s) => {
                          const already = biddedSupplierIds.has(s.id);
                          return (
                            <option key={s.id} value={s.id}>
                              {s.is_admin_managed ? "[가상업체] " : "[가입업체] "}
                              {s.company_name}
                              {already ? " — (이미 입찰 완료)" : ""}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        1회 MOQ (원)
                      </label>
                      <input
                        type="number"
                        step="10000"
                        min="0"
                        value={moqByRfq[rfq.id] ?? 150000}
                        onChange={(e) =>
                          setMoqByRfq((prev) => ({
                            ...prev,
                            [rfq.id]: Math.max(0, Number(e.target.value)),
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-mono font-bold text-right"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        단가 유형
                      </label>
                      <select
                        value={lockByRfq[rfq.id] ?? "FIXED"}
                        onChange={(e) =>
                          setLockByRfq((prev) => ({
                            ...prev,
                            [rfq.id]: e.target.value as "FIXED" | "INDEXED",
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold"
                      >
                        <option value="FIXED">고정단가형</option>
                        <option value="INDEXED">시세연동형</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <button
                        type="button"
                        disabled={
                          isDuplicate ||
                          matchCount === 0 ||
                          submittingRfqId === rfq.id
                        }
                        onClick={() => handleProxyBid(rfq)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all ${
                          isDuplicate
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 disabled:opacity-50"
                        }`}
                      >
                        <Gavel className="w-4 h-4" />
                        <span>
                          {submittingRfqId === rfq.id
                            ? "대리 입찰 생성 중..."
                            : isDuplicate
                            ? "이미 입찰 완료 (중복 방지)"
                            : "대리 입찰 넣기"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Auto-matching preview */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white rounded-xl p-3 border border-emerald-200/70">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        단가표 자동 매칭 미리보기:{" "}
                        <strong className="text-emerald-800">
                          {matchCount} / {rfqItems.length}개 품목 매칭
                        </strong>
                        {matchCount === 0 && (
                          <Link
                            href="/admin/suppliers"
                            className="ml-2 text-blue-600 underline font-semibold"
                          >
                            단가표 등록하러 가기 →
                          </Link>
                        )}
                      </span>
                    </div>
                    {matchCount > 0 && (
                      <div className="font-extrabold text-emerald-800">
                        예상 투찰 월 총액: {formatPrice(Math.round(previewMonthlyTotal))}
                      </div>
                    )}
                  </div>

                  {/* Per-item matched price chips */}
                  {rfqItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {rfqItems.map((it: any) => {
                        const entry = supCatalog[it.standard_item_id];
                        const unitPrice =
                          entry && entry.package_weight > 0
                            ? Math.round(entry.package_price / entry.package_weight)
                            : null;
                        return (
                          <span
                            key={it.id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                              unitPrice !== null
                                ? "bg-white border-emerald-200 text-gray-800"
                                : "bg-gray-50 border-gray-200 text-gray-400"
                            }`}
                          >
                            {it.standard_items?.item_name}{" "}
                            {formatNumber(it.monthly_qty)}
                            {it.standard_items?.base_unit}:{" "}
                            <strong
                              className={
                                unitPrice !== null ? "text-emerald-700 font-mono" : ""
                              }
                            >
                              {unitPrice !== null ? formatPrice(unitPrice) : "미등록"}
                            </strong>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
