"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatNumber } from "@/lib/utils";
import { getStoredDemoRfqs } from "@/lib/mock-storage";
import { getUnifiedRfqById } from "@/lib/unified-rfq-store";
import {
  CompareBid,
  CompareRfqItem,
  SelectionMap,
  computeBestSingleSupplier,
  computeOptimalTwoSupplierSplit,
  evaluateSelection,
} from "@/lib/compare-engine";
import {
  ArrowLeft,
  Scale,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Lock,
  TrendingUp,
  Check,
  FileCheck2,
  Table2,
  LayoutGrid,
  MapPin,
  Calendar,
} from "lucide-react";

interface MatrixRow {
  item: CompareRfqItem;
  lowestUnitPrice: number | null;
  lowestSupplierIds: string[];
}

const columnHelper = createColumnHelper<MatrixRow>();

export default function RfqComparePage() {
  const params = useParams();
  const rfqId = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [rfq, setRfq] = useState<any>(null);
  const [items, setItems] = useState<CompareRfqItem[]>([]);
  const [bids, setBids] = useState<CompareBid[]>([]);
  const [existingContracts, setExistingContracts] = useState<any[]>([]);
  const [selection, setSelection] = useState<SelectionMap>({});
  const [activePreset, setActivePreset] = useState<
    "SINGLE" | "SPLIT2" | "MANUAL" | null
  >(null);
  const [simNotice, setSimNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"TABLE" | "CARDS">("TABLE");

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompareData() {
      if (!rfqId) return;
      try {
        setLoading(true);
        setErrorMsg(null);

        const [rfqRes, bidsRes, contractsRes] = await Promise.all([
          supabase
            .from("rfqs")
            .select(
              "*, profiles(company_name), rfq_items(*, standard_items(*))"
            )
            .eq("id", rfqId)
            .single(),
          supabase
            .from("bids")
            .select("*, profiles(company_name, trust_score), bid_items(*)")
            .eq("rfq_id", rfqId)
            .order("created_at", { ascending: true }),
          supabase
            .from("contracts")
            .select("id, supplier_id, profiles(company_name)")
            .eq("rfq_id", rfqId)
            .order("created_at", { ascending: false }),
        ]);

        let rfqData = rfqRes.data;
        let bidsData = bidsRes.data || [];

        // 통합 스토어에서 조회 (구매자가 올린 공고 및 판매자가 제출한 실시간 입찰 통합)
        const unified = getUnifiedRfqById(rfqId);
        if (unified) {
          if (!rfqData) rfqData = unified as any;
          if (bidsData.length === 0 && unified.bids?.length) {
            bidsData = unified.bids as any;
          }
        }

        // Fallback: Supabase 및 통합에 없으면 로컬 데모 스토리지 조회
        if (!rfqData) {
          const stored = getStoredDemoRfqs();
          const found = stored.find((s) => s.id === rfqId) || stored[0];
          if (found) {
            rfqData = found as any;
            bidsData = (found.bids || []) as any;
          }
        }

        if (!rfqData) {
          throw new Error("해당 견적 요청서를 찾을 수 없습니다.");
        }

        setRfq(rfqData);
        setExistingContracts(contractsRes.data || []);

        const normalizedItems: CompareRfqItem[] = (rfqData.rfq_items || []).map(
          (it: any) => ({
            id: it.id,
            standard_item_id: it.standard_item_id,
            item_name: it.standard_items?.item_name || "품목",
            category: it.standard_items?.category || "",
            spec: it.standard_items?.spec || "",
            base_unit: it.standard_items?.base_unit || "kg",
            monthly_qty: Number(it.monthly_qty) || 0,
            current_unit_price:
              it.current_unit_price !== null ? Number(it.current_unit_price) : null,
          })
        );

        // 만약 bidsData에 입찰 세부 품목이 없으면 데모 입찰가 자동 생성
        const suppliers = [
          { id: "c0000000-0000-0000-0000-000000000001", name: "A종합유통 (대성푸드)", moq: 150000, trust: 98.5, mult: 0.95 },
          { id: "c0000000-0000-0000-0000-000000000002", name: "B미트 육류전문 (하나미트)", moq: 200000, trust: 99.2, mult: 0.88, catPref: "육류" },
          { id: "c0000000-0000-0000-0000-000000000003", name: "C프레시 신선/유제품 (청주 프레시원)", moq: 100000, trust: 97.0, mult: 0.86, catPref: "채소/과일" },
        ];

        let normalizedBids: CompareBid[] = [];

        if (bidsData.length > 0 && bidsData.some((b: any) => b.bid_items?.length > 0)) {
          normalizedBids = bidsData.map((b: any) => {
            const itemsByRfqItemId: CompareBid["itemsByRfqItemId"] = {};
            (b.bid_items || []).forEach((bi: any) => {
              itemsByRfqItemId[bi.rfq_item_id] = {
                rfq_item_id: bi.rfq_item_id,
                package_weight: Number(bi.package_weight) || 1,
                package_price: Number(bi.package_price) || 0,
                normalized_unit_price: Number(bi.normalized_unit_price) || 0,
              };
            });
            return {
              id: b.id,
              rfq_id: b.rfq_id || rfqId,
              supplier_id: b.supplier_id,
              supplier_name: b.profiles?.company_name || "유통사",
              trust_score: b.profiles?.trust_score ?? 98,
              moq_amount: Number(b.moq_amount) || 0,
              price_lock_type: b.price_lock_type || "FIXED",
              status: b.status,
              itemsByRfqItemId,
            };
          });
        } else {
          // 데모 자동 입찰 매트릭스 생성
          normalizedBids = suppliers.map((sup) => {
            const itemsByRfqItemId: CompareBid["itemsByRfqItemId"] = {};
            normalizedItems.forEach((it) => {
              const baseP = it.current_unit_price || 15000;
              let itemMult = sup.mult;
              if (sup.catPref && it.category === sup.catPref) {
                itemMult -= 0.05; // 주력 카테고리는 5% 추가 할인
              } else if (sup.catPref && it.category !== sup.catPref) {
                itemMult += 0.08; // 비주력 카테고리는 약간 높음
              }
              const unitPrice = Math.round((baseP * itemMult) / 100) * 100;
              itemsByRfqItemId[it.id] = {
                rfq_item_id: it.id,
                package_weight: 1,
                package_price: unitPrice,
                normalized_unit_price: unitPrice,
              };
            });

            return {
              id: `demo-bid-${sup.id}`,
              rfq_id: rfqId,
              supplier_id: sup.id,
              supplier_name: sup.name,
              trust_score: sup.trust,
              moq_amount: sup.moq,
              price_lock_type: sup.id.endsWith("3") ? "INDEXED" : "FIXED",
              status: "SUBMITTED",
              itemsByRfqItemId,
            };
          });
        }

        setItems(normalizedItems);
        setBids(normalizedBids);

        // Default initial view: Optimal 2-supplier split simulation
        if (normalizedItems.length > 0 && normalizedBids.length > 0) {
          const initialSplit = computeOptimalTwoSupplierSplit(
            normalizedItems,
            normalizedBids
          );
          setSelection(initialSplit.selection);
          setActivePreset("SPLIT2");
          setSimNotice(initialSplit.note);
        }
      } catch (err: any) {
        console.error("Failed to load RFQ compare data:", err);
        setErrorMsg(err?.message || "견적 비교 데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadCompareData();
  }, [rfqId, supabase]);

  // Matrix rows with per-item lowest unit price
  const tableData: MatrixRow[] = useMemo(() => {
    return items.map((item) => {
      let lowest: number | null = null;
      let lowestSupplierIds: string[] = [];

      bids.forEach((b) => {
        const bi = b.itemsByRfqItemId[item.id];
        if (!bi) return;
        if (lowest === null || bi.normalized_unit_price < lowest) {
          lowest = bi.normalized_unit_price;
          lowestSupplierIds = [b.supplier_id];
        } else if (bi.normalized_unit_price === lowest) {
          lowestSupplierIds.push(b.supplier_id);
        }
      });

      return {
        item,
        lowestUnitPrice: lowest,
        lowestSupplierIds,
      };
    });
  }, [items, bids]);

  // Per-supplier full bid summary (for top summary bar)
  const supplierSummaries = useMemo(() => {
    return bids.map((bid) => {
      let fullBidMonthlyTotal = 0;
      let handledCount = 0;
      items.forEach((item) => {
        const bi = bid.itemsByRfqItemId[item.id];
        if (bi) {
          handledCount += 1;
          fullBidMonthlyTotal += bi.normalized_unit_price * item.monthly_qty;
        }
      });
      return {
        bid,
        fullBidMonthlyTotal,
        handledCount,
        coveragePct:
          items.length > 0 ? Math.round((handledCount / items.length) * 100) : 0,
      };
    });
  }, [bids, items]);

  const evaluation = useMemo(
    () => evaluateSelection(items, bids, selection),
    [items, bids, selection]
  );

  // One-click simulations
  const handleSelectSingleBest = () => {
    const res = computeBestSingleSupplier(items, bids);
    setSelection(res.selection);
    setActivePreset("SINGLE");
    setSimNotice(res.note);
  };

  const handleSelectOptimalTwoSplit = () => {
    const res = computeOptimalTwoSupplierSplit(items, bids);
    setSelection(res.selection);
    setActivePreset("SPLIT2");
    setSimNotice(res.note);
  };

  const handleResetManual = () => {
    setSelection({});
    setActivePreset("MANUAL");
    setSimNotice(
      "선택이 초기화되었습니다. 표의 각 업체 단가 셀을 직접 클릭해 품목별로 배정해 보세요."
    );
  };

  const handleToggleCell = (rfqItemId: string, supplierId: string) => {
    setActivePreset("MANUAL");
    setSelection((prev) => {
      const next = { ...prev };
      if (next[rfqItemId] === supplierId) {
        delete next[rfqItemId];
      } else {
        next[rfqItemId] = supplierId;
      }
      return next;
    });
    setSimNotice(null);
  };

  // @tanstack/react-table columns definition
  const columns = useMemo<ColumnDef<MatrixRow, any>[]>(() => {
    const itemCol = columnHelper.accessor((row) => row.item.item_name, {
      id: "item",
      header: () => (
        <div className="text-left">
          <div className="font-extrabold text-gray-900">요청 품목 / 월 소요량</div>
          <div className="text-[10px] font-normal text-gray-400">
            기존 매입단가 기준 참고
          </div>
        </div>
      ),
      cell: ({ row }) => {
        const { item } = row.original;
        return (
          <div className="min-w-[180px] sm:min-w-[210px]">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-gray-900 text-xs sm:text-sm">
                {item.item_name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                {item.category}
              </span>
            </div>
            <div className="text-[11px] text-gray-400 truncate mt-0.5">
              {item.spec}
            </div>
            <div className="mt-1 flex items-center space-x-2 text-[11px]">
              <span className="font-mono font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
                월 {formatNumber(item.monthly_qty)} {item.base_unit}
              </span>
              {item.current_unit_price && (
                <span className="text-gray-400 line-through">
                  기존 {formatPrice(item.current_unit_price)}
                </span>
              )}
            </div>
          </div>
        );
      },
    });

    const supplierCols = bids.map((bid) =>
      columnHelper.display({
        id: `supplier-${bid.supplier_id}`,
        header: () => {
          const stat = evaluation.supplierStats.find(
            (s) => s.supplierId === bid.supplier_id
          );
          return (
            <div className="text-right min-w-[175px] space-y-0.5">
              <div className="font-extrabold text-gray-900 text-xs sm:text-sm truncate">
                {bid.supplier_name}
              </div>
              <div className="flex items-center justify-end space-x-1 text-[10px]">
                <span
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    bid.price_lock_type === "FIXED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {bid.price_lock_type === "FIXED" ? "고정단가" : "시세연동"}
                </span>
                <span className="text-gray-500">
                  MOQ {formatNumber(bid.moq_amount)}원
                </span>
              </div>
              {stat && (
                <div
                  className={`text-[10px] font-bold ${
                    stat.isMoqMet ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  선택 {stat.assignedItemCount}건 ·{" "}
                  {stat.isMoqMet ? "MOQ 충족" : "MOQ 미달"}
                </div>
              )}
            </div>
          );
        },
        cell: ({ row }) => {
          const { item, lowestSupplierIds } = row.original;
          const bi = bid.itemsByRfqItemId[item.id];
          if (!bi) {
            return (
              <div className="text-center py-2 text-xs text-gray-300 select-none">
                미취급
              </div>
            );
          }

          const isLowest = lowestSupplierIds.includes(bid.supplier_id);
          const isSelected = selection[item.id] === bid.supplier_id;
          const monthlySubtotal = bi.normalized_unit_price * item.monthly_qty;

          return (
            <button
              type="button"
              onClick={() => handleToggleCell(item.id, bid.supplier_id)}
              className={`w-full text-right p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "ring-2 ring-orange-500 border-orange-400 bg-orange-50/80 shadow-sm"
                  : isLowest
                  ? "bg-emerald-50/80 border-emerald-200 hover:border-emerald-400"
                  : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs">
                  {isLowest ? (
                    <span
                      title="품목별 최저가"
                      className="inline-flex items-center text-[11px] font-extrabold text-emerald-700"
                    >
                      ⭐ 최저가
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400">
                      {bi.package_weight}
                      {item.base_unit} 포장
                    </span>
                  )}
                </span>
                {isSelected && (
                  <span className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full bg-orange-600 text-white text-[10px] font-bold">
                    <Check className="w-2.5 h-2.5" />
                    <span>선택</span>
                  </span>
                )}
              </div>

              <div
                className={`font-mono font-extrabold text-sm ${
                  isSelected
                    ? "text-orange-900"
                    : isLowest
                    ? "text-emerald-800"
                    : "text-gray-900"
                }`}
              >
                {formatPrice(bi.normalized_unit_price)}
                <span className="text-[11px] font-normal text-gray-500">
                  /{item.base_unit}
                </span>
              </div>
              <div className="text-[11px] text-gray-600 font-medium mt-0.5">
                월 {formatPrice(monthlySubtotal)}
              </div>
            </button>
          );
        },
      })
    );

    return [itemCol, ...supplierCols];
  }, [bids, selection, evaluation.supplierStats]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Confirm contract -> save snapshot(s) to contracts, update rfq & bids, redirect to /contracts/[id]/audit
  const handleConfirmContract = async () => {
    if (evaluation.supplierStats.length === 0) {
      setErrorMsg("최소 1개 이상의 품목에서 공급사를 선택해 주세요.");
      return;
    }

    try {
      setConfirming(true);
      setErrorMsg(null);

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (Number(rfq?.contract_months) || 3));
      const startStr = startDate.toISOString().split("T")[0];
      const endStr = endDate.toISOString().split("T")[0];

      const bidBySupplier = new Map<string, CompareBid>();
      bids.forEach((b) => bidBySupplier.set(b.supplier_id, b));

      // Group assigned items by supplier
      const itemsBySupplier = new Map<string, any[]>();
      items.forEach((item) => {
        const sid = selection[item.id];
        if (!sid) return;
        const bid = bidBySupplier.get(sid);
        const bi = bid?.itemsByRfqItemId[item.id];
        if (!bid || !bi) return;

        const list = itemsBySupplier.get(sid) || [];
        list.push({
          item_name: item.item_name,
          normalized_unit_price: bi.normalized_unit_price,
          base_unit: item.base_unit,
          package_weight: bi.package_weight,
          package_price: bi.package_price,
          monthly_qty: item.monthly_qty,
          price_lock_type: bid.price_lock_type,
        });
        itemsBySupplier.set(sid, list);
      });

      const contractsPayload = Array.from(itemsBySupplier.entries()).map(
        ([supplierId, contractItems]) => ({
          rfq_id: rfqId,
          supplier_id: supplierId,
          contract_items: contractItems,
          start_date: startStr,
          end_date: endStr,
        })
      );

      const { data: insertedContracts, error: contractErr } = await supabase
        .from("contracts")
        .insert(contractsPayload)
        .select();

      if (contractErr) throw contractErr;

      // Update RFQ status -> CONTRACTED
      await supabase
        .from("rfqs")
        .update({ status: "CONTRACTED" })
        .eq("id", rfqId);

      // Update Bids status -> WON / LOST
      const winningSupplierIds = new Set(itemsBySupplier.keys());
      await Promise.all(
        bids.map((b) =>
          supabase
            .from("bids")
            .update({
              status: winningSupplierIds.has(b.supplier_id) ? "WON" : "LOST",
            })
            .eq("id", b.id)
        )
      );

      const primaryContractId = insertedContracts?.[0]?.id;
      if (primaryContractId) {
        router.push(`/contracts/${primaryContractId}/audit?confirmed=1`);
      } else {
        router.push("/rfq");
      }
    } catch (err: any) {
      console.error("Failed to confirm contract:", err);
      setErrorMsg(`계약 확정 저장 실패: ${err?.message || "오류가 발생했습니다."}`);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/rfq"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>내 견적 요청 목록 (/rfq)으로 돌아가기</span>
        </Link>

        {existingContracts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {existingContracts.map((c) => (
              <Link
                key={c.id}
                href={`/contracts/${c.id}/audit`}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>
                  체결 계약 단가 감시 ({c.profiles?.company_name || "계약사"}) →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          입찰 비교 매트릭스를 불러오는 중...
        </div>
      ) : !rfq ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-gray-800">
            해당 견적 요청서를 찾을 수 없습니다.
          </p>
          <Link
            href="/rfq"
            className="inline-flex px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            목록으로 이동
          </Link>
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/30 text-orange-200 text-xs font-bold">
                  <Scale className="w-3.5 h-3.5" />
                  <span>가로×세로 매트릭스 견적 비교 · 1사 vs 2사 최적 조합 시뮬레이터</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {rfq.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                  <span className="inline-flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span>{rfq.region}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    <span>{rfq.contract_months}개월 계약</span>
                  </span>
                  <span>•</span>
                  <span>요청 {items.length}품목 · 참여 유통사 {bids.length}곳</span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-2xl px-4 py-3 text-right">
                <div className="text-[11px] text-slate-300">현재 선택 조합 월 총액</div>
                <div className="text-2xl font-black text-orange-300">
                  {formatPrice(evaluation.totalMonthlyAmount)}
                </div>
                {evaluation.monthlySavings > 0 && (
                  <div className="text-[11px] text-emerald-300 font-bold">
                    기존 대비 월 {formatPrice(evaluation.monthlySavings)} (
                    {evaluation.savingsRatePct.toFixed(1)}%) 절감
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live MOQ Warning Banner */}
          {evaluation.moqViolations.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm space-y-2">
              <div className="flex items-center space-x-2 text-rose-800 font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  최소주문금액(MOQ) 미달 경고 ({evaluation.moqViolations.length}개 업체)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {evaluation.moqViolations.map((v) => (
                  <span
                    key={v.supplierId}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs text-rose-800 font-semibold"
                  >
                    <strong>{v.supplierName}</strong>
                    <span>
                      주 2회 기준 회당{" "}
                      <strong className="text-rose-600">
                        {formatPrice(Math.round(v.perDeliveryAmount))}
                      </strong>{" "}
                      / MOQ {formatPrice(v.moqAmount)} (회당{" "}
                      {formatPrice(v.moqShortfall)} 부족)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Supplier Summary Bar */}
          {bids.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center space-y-3">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
              <h2 className="text-base font-bold text-gray-800">
                아직 제출된 유통사 입찰서가 없습니다
              </h2>
              <p className="text-xs text-gray-500">
                유통사 모드에서 이 견적 요청서에 입찰서를 제출하면 가로×세로 매트릭스 비교가
                활성화됩니다.
              </p>
              <Link
                href={`/supplier/rfqs/${rfqId}/bid`}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                <span>유통사 입찰서 작성하러 가기 →</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supplierSummaries.map(
                  ({ bid, fullBidMonthlyTotal, handledCount, coveragePct }) => {
                    const assigned = evaluation.supplierStats.find(
                      (s) => s.supplierId === bid.supplier_id
                    );
                    const hasMoqWarn = assigned && !assigned.isMoqMet;

                    return (
                      <div
                        key={bid.id}
                        className={`bg-white rounded-2xl border-2 p-4 shadow-sm transition-all space-y-3 ${
                          hasMoqWarn
                            ? "border-rose-400 bg-rose-50/30"
                            : assigned
                            ? "border-orange-400 bg-orange-50/20"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-extrabold text-sm text-gray-900">
                              {bid.supplier_name}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              취급 품목 {handledCount}/{items.length}개 ({coveragePct}%)
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              bid.price_lock_type === "FIXED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {bid.price_lock_type === "FIXED" ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            <span>
                              {bid.price_lock_type === "FIXED"
                                ? "고정단가형"
                                : "시세연동형"}
                            </span>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/90 rounded-xl p-2.5">
                          <div>
                            <span className="text-[10px] text-gray-400 block">
                              예상 월 총액 (입찰품목)
                            </span>
                            <span className="font-extrabold text-gray-900">
                              {formatPrice(fullBidMonthlyTotal)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">
                              1회 최소주문금액 (MOQ)
                            </span>
                            <span className="font-bold text-gray-800">
                              {formatPrice(bid.moq_amount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">
                              단가 준수율 (신뢰도)
                            </span>
                            <span className="font-bold text-emerald-700 inline-flex items-center space-x-0.5">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{bid.trust_score.toFixed(1)}%</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block">
                              현재 선택 배정액
                            </span>
                            {assigned ? (
                              <span
                                className={`font-extrabold ${
                                  assigned.isMoqMet
                                    ? "text-orange-700"
                                    : "text-rose-600"
                                }`}
                              >
                                {formatPrice(assigned.monthlyTotal)}
                              </span>
                            ) : (
                              <span className="text-gray-400">미선택</span>
                            )}
                          </div>
                        </div>

                        {assigned && (
                          <div
                            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                              assigned.isMoqMet
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            <span>
                              주 2회 기준 회당{" "}
                              {formatPrice(Math.round(assigned.perDeliveryAmount))}
                            </span>
                            <span>
                              {assigned.isMoqMet ? "✓ MOQ 충족" : "⚠ MOQ 미달"}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* 3 One-Click Simulation Controls + View Switcher */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-gray-500 mr-1">
                      ⚡ 원클릭 시뮬레이션:
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectSingleBest}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center space-x-1.5 ${
                        activePreset === "SINGLE"
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>단일 업체 최저가</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSelectOptimalTwoSplit}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center space-x-1.5 ${
                        activePreset === "SPLIT2"
                          ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                          : "bg-white text-gray-800 border-gray-300 hover:bg-orange-50 hover:border-orange-300"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>최적 2사 분할 조합</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetManual}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                        activePreset === "MANUAL" && evaluation.coveredCount === 0
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>직접 선택 초기화</span>
                    </button>
                  </div>

                  {/* Responsive Table / Mobile Card Toggle */}
                  <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl self-start lg:self-auto">
                    <button
                      type="button"
                      onClick={() => setViewMode("TABLE")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                        viewMode === "TABLE"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      <Table2 className="w-3.5 h-3.5" />
                      <span>매트릭스 표</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("CARDS")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 ${
                        viewMode === "CARDS"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500"
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>카드 보기</span>
                    </button>
                  </div>
                </div>

                {simNotice && (
                  <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-xs text-orange-950 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                    <span className="font-medium">{simNotice}</span>
                  </div>
                )}
              </div>

              {/* Matrix View (@tanstack/react-table) with Sticky Header & Sticky First Column */}
              {viewMode === "TABLE" ? (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      각 업체의 단가 셀을 클릭하여 품목별 공급사를 직접 지정하거나 변경할 수
                      있습니다.
                    </span>
                    <span className="font-semibold text-emerald-700">
                      ⭐ 연한 초록색 = 품목별 최저가
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative">
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 z-30 bg-gray-50 shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr
                            key={headerGroup.id}
                            className="border-b border-gray-200"
                          >
                            {headerGroup.headers.map((header, idx) => (
                              <th
                                key={header.id}
                                className={`py-3.5 px-4 align-bottom ${
                                  idx === 0
                                    ? "sticky left-0 z-40 bg-gray-50 border-r border-gray-200 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]"
                                    : "bg-gray-50 border-r border-gray-100 last:border-r-0"
                                }`}
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className="hover:bg-slate-50/40 transition-colors"
                          >
                            {row.getVisibleCells().map((cell, idx) => (
                              <td
                                key={cell.id}
                                className={`py-3 px-3 align-middle ${
                                  idx === 0
                                    ? "sticky left-0 z-20 bg-white border-r border-gray-200 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.05)] px-4"
                                    : "border-r border-gray-100 last:border-r-0"
                                }`}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Mobile-friendly Card View */
                <div className="space-y-4">
                  {tableData.map(({ item, lowestSupplierIds }) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                        <div>
                          <div className="font-extrabold text-sm text-gray-900">
                            {item.item_name}{" "}
                            <span className="text-[11px] font-normal text-gray-400">
                              ({item.spec})
                            </span>
                          </div>
                          <div className="text-xs text-orange-700 font-bold mt-0.5">
                            월 {formatNumber(item.monthly_qty)} {item.base_unit}
                            {item.current_unit_price && (
                              <span className="text-gray-400 line-through font-normal ml-2">
                                기존 {formatPrice(item.current_unit_price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {bids.map((bid) => {
                          const bi = bid.itemsByRfqItemId[item.id];
                          if (!bi) {
                            return (
                              <div
                                key={bid.id}
                                className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-400 flex items-center justify-between"
                              >
                                <span>{bid.supplier_name}</span>
                                <span>미취급</span>
                              </div>
                            );
                          }
                          const isLowest = lowestSupplierIds.includes(bid.supplier_id);
                          const isSelected = selection[item.id] === bid.supplier_id;
                          return (
                            <button
                              key={bid.id}
                              type="button"
                              onClick={() => handleToggleCell(item.id, bid.supplier_id)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? "ring-2 ring-orange-500 border-orange-400 bg-orange-50/80"
                                  : isLowest
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-gray-900 truncate">
                                  {bid.supplier_name}
                                </span>
                                {isLowest && (
                                  <span className="text-emerald-700 shrink-0">⭐ 최저가</span>
                                )}
                              </div>
                              <div className="mt-1 font-mono font-extrabold text-sm text-gray-900">
                                {formatPrice(bi.normalized_unit_price)}/{item.base_unit}
                              </div>
                              <div className="text-[11px] text-gray-500">
                                월 {formatPrice(bi.normalized_unit_price * item.monthly_qty)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Sticky Bottom Action Bar: [선택한 조합으로 계약 확정하기] */}
      {bids.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
              <div>
                <span className="text-gray-400 block text-[11px]">선택된 공급사</span>
                <span className="font-extrabold text-gray-900">
                  {evaluation.supplierStats.length > 0
                    ? evaluation.supplierStats.map((s) => s.supplierName).join(" + ")
                    : "선택 없음"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">배정 품목</span>
                <span className="font-extrabold text-gray-900">
                  {evaluation.coveredCount} / {evaluation.totalItemCount}개
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[11px]">확정 예상 월 총액</span>
                <span className="font-black text-base text-orange-600">
                  {formatPrice(evaluation.totalMonthlyAmount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmContract}
              disabled={confirming || evaluation.coveredCount === 0}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>
                {confirming
                  ? "계약 스냅샷 저장 중..."
                  : "선택한 조합으로 계약 확정하기"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
