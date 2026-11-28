"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole, DEMO_USERS, DemoUser } from "@/contexts/RoleContext";
import { formatPrice, formatNumber } from "@/lib/utils";
import { parseCatalogExcel } from "@/lib/client-api";
import { getUnifiedRfqById, submitUnifiedBid } from "@/lib/unified-rfq-store";
import {
  ArrowLeft,
  Truck,
  Check,
  Sparkles,
  Upload,
  Download,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  Calculator,
  Lock,
  TrendingUp,
} from "lucide-react";

const SUPPLIER_DEMO_USERS: DemoUser[] = DEMO_USERS.filter(
  (u) => u.role === "SUPPLIER"
);

interface BidRowState {
  rfq_item_id: string;
  standard_item_id: string;
  item_name: string;
  category: string;
  spec: string;
  base_unit: string;
  monthly_qty: number;
  current_unit_price: number | null;
  handled: boolean;
  package_weight: string;
  package_price: string;
}

export default function SupplierBidPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || (typeof params?.id === "string" ? params.id : "");
  const rfqId = rawId || "d0000000-0000-0000-0000-000000000001";
  const router = useRouter();
  const { currentUser, setCurrentUser } = useRole();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeSupplier = useMemo(() => {
    if (currentUser?.role === "SUPPLIER") return currentUser;
    return SUPPLIER_DEMO_USERS[0];
  }, [currentUser]);

  const [rfq, setRfq] = useState<any>(null);
  const [catalogMap, setCatalogMap] = useState<
    Record<string, { package_weight: number; package_price: number }>
  >({});
  const [existingBidId, setExistingBidId] = useState<string | null>(null);
  const [moqAmount, setMoqAmount] = useState<number>(150000);
  const [priceLockType, setPriceLockType] = useState<"FIXED" | "INDEXED">("FIXED");
  const [rows, setRows] = useState<BidRowState[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null);

  // Load RFQ, Supplier Catalog, and any existing Bid for (rfqId, activeSupplier.id)
  useEffect(() => {
    async function loadBidContext() {
      if (!rfqId) return;
      try {
        setLoading(true);
        setErrorMsg(null);
        setAutoFillNotice(null);

        let rfqData: any = null;
        let catData: any[] = [];
        let existingBid: any = null;

        try {
          const [rfqRes, catRes, bidRes] = await Promise.all([
            supabase
              .from("rfqs")
              .select(
                "*, profiles(company_name, address), rfq_items(*, standard_items(*))"
              )
              .eq("id", rfqId)
              .single(),
            supabase
              .from("supplier_catalogs")
              .select("standard_item_id, package_weight, package_price")
              .eq("supplier_id", activeSupplier.id),
            supabase
              .from("bids")
              .select("*, bid_items(*)")
              .eq("rfq_id", rfqId)
              .eq("supplier_id", activeSupplier.id)
              .maybeSingle(),
          ]);

          if (rfqRes.data) rfqData = rfqRes.data;
          if (catRes.data) catData = catRes.data;
          if (bidRes.data) existingBid = bidRes.data;
        } catch (subErr) {
          console.warn("Supabase load failed in BidClient, using unified store:", subErr);
        }

        // Supabase에서 없거나 실패 시 통합 스토어에서 조회
        if (!rfqData) {
          rfqData = getUnifiedRfqById(rfqId);
          if (rfqData) {
            existingBid = (rfqData.bids || []).find((b: any) => b.supplier_id === activeSupplier.id);
          }
        }

        if (!rfqData) {
          throw new Error("견적 요청서를 찾을 수 없습니다.");
        }
        setRfq(rfqData);

        const catLookup: Record<
          string,
          { package_weight: number; package_price: number }
        > = {};
        catData.forEach((c: any) => {
          catLookup[c.standard_item_id] = {
            package_weight: Number(c.package_weight),
            package_price: Number(c.package_price),
          };
        });
        setCatalogMap(catLookup);

        const existingBidItemsByRfqItem: Record<string, any> = {};
        if (existingBid) {
          setExistingBidId(existingBid.id);
          setMoqAmount(Number(existingBid.moq_amount) || 150000);
          setPriceLockType(
            existingBid.price_lock_type === "INDEXED" ? "INDEXED" : "FIXED"
          );
          (existingBid.bid_items || []).forEach((bi: any) => {
            existingBidItemsByRfqItem[bi.rfq_item_id] = bi;
          });
        } else {
          setExistingBidId(null);
          // Default MOQ per demo supplier
          if (activeSupplier.id.endsWith("002")) {
            setMoqAmount(200000);
            setPriceLockType("INDEXED");
          } else if (activeSupplier.id.endsWith("003")) {
            setMoqAmount(100000);
            setPriceLockType("FIXED");
          } else {
            setMoqAmount(150000);
            setPriceLockType("FIXED");
          }
        }

        const initialRows: BidRowState[] = (rfqData.rfq_items || []).map(
          (item: any) => {
            const std = item.standard_items;
            const prevBidItem = existingBidItemsByRfqItem[item.id];
            return {
              rfq_item_id: item.id,
              standard_item_id: item.standard_item_id,
              item_name: std?.item_name || "품목",
              category: std?.category || "",
              spec: std?.spec || "",
              base_unit: std?.base_unit || "kg",
              monthly_qty: Number(item.monthly_qty) || 0,
              current_unit_price:
                item.current_unit_price !== null
                  ? Number(item.current_unit_price)
                  : null,
              handled: Boolean(prevBidItem),
              package_weight: prevBidItem
                ? String(prevBidItem.package_weight)
                : "",
              package_price: prevBidItem ? String(prevBidItem.package_price) : "",
            };
          }
        );

        setRows(initialRows);
      } catch (err: any) {
        console.error("Failed to load bid page:", err);
        setErrorMsg(err?.message || "견적 요청서 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadBidContext();
  }, [rfqId, activeSupplier.id, supabase]);

  const updateRow = (
    rfqItemId: string,
    patch: Partial<Pick<BidRowState, "handled" | "package_weight" | "package_price">>
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.rfq_item_id !== rfqItemId) return row;
        const updated = { ...row, ...patch };
        // Auto-check handled if user types package_weight or package_price
        if (
          (patch.package_weight !== undefined && patch.package_weight !== "") ||
          (patch.package_price !== undefined && patch.package_price !== "")
        ) {
          updated.handled = true;
        }
        return updated;
      })
    );
  };

  // 자동 견적 채우기 1: 자사 표준 단가표 자동 매칭 (supplier_catalogs)
  const handleAutoMatchCatalog = () => {
    let matchedCount = 0;
    setRows((prev) =>
      prev.map((row) => {
        const entry = catalogMap[row.standard_item_id];
        if (!entry) return row;
        matchedCount += 1;
        return {
          ...row,
          handled: true,
          package_weight: String(entry.package_weight),
          package_price: String(entry.package_price),
        };
      })
    );

    if (matchedCount > 0) {
      setAutoFillNotice(
        `자사 표준 단가표(${activeSupplier.name})에서 ${matchedCount}개 품목의 포장단위·공급가를 자동 매칭했습니다!`
      );
    } else {
      setAutoFillNotice(
        `자사 표준 단가표에 일치하는 품목이 없습니다. 직접 입력하거나 엑셀/CSV 단가표를 업로드해 주세요.`
      );
    }
  };

  // 자동 견적 채우기 2: 자사 단가표 CSV/Excel 업로드 (/api/parse-catalog SheetJS 서버 파싱)
  const handleSpreadsheetUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseCatalogExcel(file);
      if (!data.success) {
        setAutoFillNotice("엑셀/CSV 파일 파싱에 실패했습니다.");
        return;
      }

      const parsedCatalog: Array<{ name: string; weight: number; price: number }> =
        data.items || [];

      if (parsedCatalog.length === 0) {
        setAutoFillNotice(
          "업로드한 파일에서 유효한 품목/포장단위/공급가 행을 찾지 못했습니다. (컬럼명: 품목명, 포장단위, 포장공급가)"
        );
        return;
      }

      const normalizeName = (s: string) => s.replace(/\s+/g, "").toLowerCase();
      let matchedCount = 0;

      setRows((prev) =>
        prev.map((row) => {
          const target = normalizeName(row.item_name);
          const hit = parsedCatalog.find((p) => {
            const pNorm = normalizeName(p.name);
            return (
              pNorm === target || pNorm.includes(target) || target.includes(pNorm)
            );
          });
          if (!hit) return row;
          matchedCount += 1;
          return {
            ...row,
            handled: true,
            package_weight: String(hit.weight),
            package_price: String(Math.round(hit.price)),
          };
        })
      );

      setAutoFillNotice(
        matchedCount > 0
          ? `업로드 파일("${file.name}")에서 총 ${parsedCatalog.length}행 중 ${matchedCount}개 요청 품목을 자동 매칭하여 채웠습니다!`
          : `업로드 파일("${file.name}")에서 요청 품목명과 일치하는 행을 찾지 못했습니다. (컬럼명: 품목명, 포장단위, 포장공급가)`
      );
    } catch (err) {
      console.error("Spreadsheet parse error:", err);
      setAutoFillNotice(
        "엑셀/CSV 파일 파싱 중 오류가 발생했습니다. 파일 형식을 확인해 주세요."
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 샘플 CSV 단가표 다운로드 (UTF-8 BOM, Excel 호환)
  const handleDownloadSampleCsv = () => {
    const header = "품목명,포장단위,포장공급가,기준단위";
    const lines = rows.map((row) => {
      const cat = catalogMap[row.standard_item_id];
      const fallbackUnit = row.current_unit_price
        ? Math.round(row.current_unit_price * 0.9)
        : 15000;
      const w = cat ? cat.package_weight : 1;
      const p = cat ? cat.package_price : fallbackUnit;
      return `"${row.item_name}",${w},${p},${row.base_unit}`;
    });
    const csvContent = "\uFEFF" + [header, ...lines].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeSupplier.name}_입찰단가표_샘플.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Real-time normalized unit price & bid summary
  const summary = useMemo(() => {
    let handledCount = 0;
    let validCount = 0;
    let estimatedMonthlyTotal = 0;

    rows.forEach((row) => {
      if (!row.handled) return;
      handledCount += 1;
      const w = Number(row.package_weight);
      const p = Number(row.package_price);
      if (Number.isFinite(w) && w > 0 && Number.isFinite(p) && p >= 0) {
        validCount += 1;
        const unitPrice = p / w;
        estimatedMonthlyTotal += unitPrice * row.monthly_qty;
      }
    });

    const deliveryFreqPerWeek = Array.isArray(rfq?.delivery_days)
      ? Math.max(1, rfq.delivery_days.length)
      : 2;
    const perDeliveryEstimate = estimatedMonthlyTotal / (deliveryFreqPerWeek * 4);
    const coveragePct =
      rows.length > 0 ? Math.round((handledCount / rows.length) * 100) : 0;

    return {
      handledCount,
      validCount,
      estimatedMonthlyTotal,
      perDeliveryEstimate,
      moqSatisfied: perDeliveryEstimate >= moqAmount,
      coveragePct,
    };
  }, [rows, rfq, moqAmount]);

  // Submit bid -> Supabase bids + bid_items
  const handleSubmitBid = async () => {
    const handledRows = rows.filter((r) => r.handled);
    if (handledRows.length === 0) {
      setErrorMsg("최소 1개 이상의 취급 품목을 체크하고 포장단위와 공급가를 입력해 주세요.");
      return;
    }

    for (const row of handledRows) {
      const w = Number(row.package_weight);
      const p = Number(row.package_price);
      if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(p) || p <= 0) {
        setErrorMsg(
          `"${row.item_name}" 품목의 포장단위(0보다 큰 숫자)와 포장공급가(원)를 정확히 입력해 주세요.`
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // 통합 스토어에 즉각 입찰 반영 (구매자 매트릭스 및 관리자 전역 즉시 연동)
      submitUnifiedBid(
        rfqId,
        {
          id: activeSupplier.id,
          name: currentUser?.name || activeSupplier.name,
          businessNumber: (currentUser as any)?.businessNumber || "123-45-67890",
          phone: (currentUser as any)?.phone || "010-1234-5678",
          description: currentUser?.description || "식자재 유통 전문",
        },
        {
          moq_amount: Math.max(0, Number(moqAmount) || 0),
          price_lock_type: priceLockType,
          items: handledRows.map((row) => ({
            rfq_item_id: row.rfq_item_id,
            package_weight: Number(row.package_weight),
            package_price: Number(row.package_price),
          })),
        }
      );

      try {
        // 1. Upsert into bids on (rfq_id, supplier_id)
        const { data: savedBid, error: bidError } = await supabase
          .from("bids")
          .upsert(
            {
              rfq_id: rfqId,
              supplier_id: activeSupplier.id,
              moq_amount: Math.max(0, Number(moqAmount) || 0),
              price_lock_type: priceLockType,
              status: "SUBMITTED",
            },
            { onConflict: "rfq_id,supplier_id" }
          )
          .select()
          .single();

        if (bidError) throw bidError;

        // 2. Replace bid_items cleanly for this bid
        const { error: deleteErr } = await supabase
          .from("bid_items")
          .delete()
          .eq("bid_id", savedBid.id);

        if (deleteErr) throw deleteErr;

        const bidItemsPayload = handledRows.map((row) => ({
          bid_id: savedBid.id,
          rfq_item_id: row.rfq_item_id,
          package_weight: Number(row.package_weight),
          package_price: Number(row.package_price),
        }));

        const { error: insertErr } = await supabase
          .from("bid_items")
          .insert(bidItemsPayload);

        if (insertErr) throw insertErr;
      } catch (subErr) {
        console.warn("Supabase submit failed, continuing with unified store:", subErr);
      }

      router.push(`/supplier/rfqs?submitted=${rfqId}`);
    } catch (err: any) {
      console.error("Failed to submit bid:", err);
      setErrorMsg(`입찰서 제출 실패: ${err?.message || "오류가 발생했습니다."}`);
    } finally {
      setSubmitting(false);
    }
  };

  const ddayNum = rfq
    ? Math.ceil(
        (new Date(rfq.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-zinc-100">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/supplier/rfqs"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>입찰 공고함 (/supplier/rfqs)으로 돌아가기</span>
        </Link>

        {/* Quick Supplier Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-zinc-500 font-semibold mr-1">입찰 유통사:</span>
          {SUPPLIER_DEMO_USERS.map((sup) => (
            <button
              key={sup.id}
              type="button"
              onClick={() => setCurrentUser(sup)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeSupplier.id === sup.id
                  ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
                  : "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {sup.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-[#22252a] rounded-3xl border border-zinc-800 p-12 text-center text-sm text-zinc-400">
          견적 요청서와 자사 단가표를 불러오는 중...
        </div>
      ) : !rfq ? (
        <div className="bg-[#22252a] rounded-3xl border border-zinc-800 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-zinc-300">
            해당 견적 요청서를 찾을 수 없습니다.
          </p>
          <Link
            href="/supplier/rfqs"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            공고 목록으로 이동
          </Link>
        </div>
      ) : (
        <>
          {/* RFQ Overview Header */}
          <div className="bg-[#22252a] rounded-3xl border border-zinc-800 p-6 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{activeSupplier.name} 입찰서 작성 (검은색 테마)</span>
                  </span>
                  {existingBidId && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-700/60">
                      기존 투찰 내역 수정 모드
                    </span>
                  )}
                  {ddayNum !== null && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-600/50">
                      {ddayNum < 0 ? "마감 경과" : `마감 D-${ddayNum}`}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                  {rfq.title}
                </h1>
              </div>

              <div className="text-xs text-zinc-400 bg-[#181a1d] border border-zinc-800 rounded-2xl px-4 py-2.5 space-y-0.5">
                <div className="font-bold text-zinc-200">
                  발주 식당: {rfq.profiles?.company_name || "살롱순라"}
                </div>
                <div className="flex items-center space-x-1 text-emerald-400 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{rfq.region}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-800 text-xs">
              <div className="flex items-center space-x-1.5 text-zinc-400">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>
                  계약기간: <strong className="text-zinc-200">{rfq.contract_months}개월</strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-zinc-400">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>
                  배송요일:{" "}
                  <strong className="text-zinc-200">
                    {Array.isArray(rfq.delivery_days) ? rfq.delivery_days.join(", ") : "-"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-zinc-400">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>
                  결제조건: <strong className="text-zinc-200">{rfq.payment_terms}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-zinc-400">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>
                  마감일:{" "}
                  <strong className="text-zinc-200">
                    {new Date(rfq.deadline).toLocaleDateString("ko-KR")}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* 1. 기본 입찰 조건 입력 */}
          <div className="bg-[#22252a] rounded-3xl border border-zinc-800 p-6 shadow-md space-y-5">
            <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>1. 기본 입찰 조건</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MOQ */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300">
                  1회 최소주문금액 (MOQ, 원) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={moqAmount}
                    onChange={(e) => setMoqAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-[#181a1d] text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-zinc-500 font-bold">
                    원 / 회
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[100000, 150000, 200000, 300000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMoqAmount(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                        moqAmount === preset
                          ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {preset / 10000}만원
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500">
                  식당의 2사 분할 최적 조합 알고리즘에서 회당 발주액 충족 검증에 사용됩니다.
                </p>
              </div>

              {/* Price Lock Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-300">
                  단가 보장 유형 *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPriceLockType("FIXED")}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      priceLockType === "FIXED"
                        ? "border-emerald-500 bg-emerald-950/30 text-white"
                        : "border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-extrabold text-xs">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>고정단가형 (FIXED)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      계약 기간 동안 확정 단가 100% 고정 (인상 불가)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriceLockType("INDEXED")}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      priceLockType === "INDEXED"
                        ? "border-emerald-500 bg-emerald-950/30 text-white"
                        : "border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-extrabold text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>시세연동 상한형 (INDEXED)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      시세 급등 시 확정 단가 대비 최대 +10% 상한 내 허용
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 자동 견적 채우기 + 품목별 단가 입력 테이블 */}
          <div className="bg-[#22252a] rounded-3xl border border-zinc-800 shadow-md overflow-hidden">
            {/* Auto-fill Toolbar */}
            <div className="p-6 border-b border-zinc-800 bg-[#1e2126] space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <Calculator className="w-5 h-5 text-emerald-400" />
                    <span>2. 품목별 공급 단가 입력 및 자동 환산</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    취급 가능한 품목을 체크하고 자사 포장단위와 공급가를 입력하면 기준단위(1kg/1L/1ea)
                    환산 단가가 실시간 계산됩니다.
                  </p>
                </div>

                {/* Auto-Fill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoMatchCatalog}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      자사 표준 단가표 자동 매칭 ({Object.keys(catalogMap).length}종)
                    </span>
                  </button>

                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center space-x-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>엑셀/CSV 단가표 업로드</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleSpreadsheetUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    title="현재 요청 품목 기준 엑셀 단가표 양식 다운로드"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>샘플 엑셀</span>
                  </button>
                </div>
              </div>

              {autoFillNotice && (
                <div className="p-3 rounded-xl bg-[#181a1d] border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{autoFillNotice}</span>
                </div>
              )}
            </div>

            {/* Pricing Input Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-200">
                <thead className="bg-[#181a1d] text-xs text-zinc-400 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">취급</th>
                    <th className="py-3.5 px-4">요청 품목 / 규격</th>
                    <th className="py-3.5 px-4 text-right">월 소요량</th>
                    <th className="py-3.5 px-4 w-36">포장단위 (kg/L/ea)</th>
                    <th className="py-3.5 px-4 w-44">포장공급가 (원)</th>
                    <th className="py-3.5 px-4 text-right bg-emerald-950/30 text-emerald-400 font-bold">
                      기준단위 환산 단가 (자동)
                    </th>
                    <th className="py-3.5 px-4 text-right">월 예상 공급액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {rows.map((row) => {
                    const weightNum = Number(row.package_weight);
                    const priceNum = Number(row.package_price);
                    const normalizedUnit =
                      row.handled &&
                      Number.isFinite(weightNum) &&
                      weightNum > 0 &&
                      Number.isFinite(priceNum) &&
                      priceNum > 0
                        ? Math.round((priceNum / weightNum) * 100) / 100
                        : null;
                    const monthlySubtotal =
                      normalizedUnit !== null ? normalizedUnit * row.monthly_qty : null;
                    const diffPct =
                      normalizedUnit !== null &&
                      row.current_unit_price &&
                      row.current_unit_price > 0
                        ? Math.round(
                            ((row.current_unit_price - normalizedUnit) /
                              row.current_unit_price) *
                              100
                          )
                        : null;

                    return (
                      <tr
                        key={row.rfq_item_id}
                        className={`transition-colors ${
                          row.handled ? "bg-[#22252a] hover:bg-zinc-800/50" : "bg-zinc-900/60 opacity-60"
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={row.handled}
                            onChange={(e) =>
                              updateRow(row.rfq_item_id, { handled: e.target.checked })
                            }
                            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                            aria-label={`${row.item_name} 취급 여부`}
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-white text-xs sm:text-sm">
                              {row.item_name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                              {row.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {row.spec}
                            {row.current_unit_price
                              ? ` · 기존 매입가 ${formatPrice(row.current_unit_price)}/${row.base_unit}`
                              : ""}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-zinc-300 whitespace-nowrap">
                          {formatNumber(row.monthly_qty)} {row.base_unit}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              disabled={!row.handled}
                              placeholder="예: 5"
                              value={row.package_weight}
                              onChange={(e) =>
                                updateRow(row.rfq_item_id, {
                                  package_weight: e.target.value,
                                })
                              }
                              className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold text-right bg-white disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-xs font-mono font-semibold text-gray-500">
                              {row.base_unit}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="0"
                              step="100"
                              disabled={!row.handled}
                              placeholder="예: 165000"
                              value={row.package_price}
                              onChange={(e) =>
                                updateRow(row.rfq_item_id, {
                                  package_price: e.target.value,
                                })
                              }
                              className="w-28 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold text-right bg-white disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-500">원</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right bg-blue-50/40 whitespace-nowrap">
                          {normalizedUnit !== null ? (
                            <div className="space-y-0.5">
                              <div className="font-extrabold text-blue-700 text-sm font-mono">
                                {formatPrice(normalizedUnit)} / {row.base_unit}
                              </div>
                              {diffPct !== null && (
                                <div
                                  className={`text-[10px] font-bold ${
                                    diffPct > 0 ? "text-emerald-600" : "text-rose-500"
                                  }`}
                                >
                                  {diffPct > 0
                                    ? `기존 대비 ${diffPct}% 저렴`
                                    : diffPct < 0
                                    ? `기존 대비 ${Math.abs(diffPct)}% 높음`
                                    : "기존 단가 동일"}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {row.handled ? "단가 입력 대기" : "미취급"}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-xs text-gray-800 whitespace-nowrap">
                          {monthlySubtotal !== null ? formatPrice(monthlySubtotal) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary & Submit Bar */}
            <div className="p-6 bg-slate-50 border-t border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block">취급 품목 (취급률)</span>
                  <span className="text-base font-extrabold text-gray-900">
                    {summary.handledCount} / {rows.length}개 ({summary.coveragePct}%)
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">예상 월 수주액</span>
                  <span className="text-base font-extrabold text-blue-700">
                    {formatPrice(summary.estimatedMonthlyTotal)}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-gray-400 block">회당 예상 발주 vs MOQ</span>
                  <span
                    className={`text-sm font-bold ${
                      summary.moqSatisfied ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {formatPrice(Math.round(summary.perDeliveryEstimate))}{" "}
                    {summary.moqSatisfied ? "(MOQ 충족)" : "(MOQ 미만)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 self-end lg:self-auto">
                <Link
                  href="/supplier/rfqs"
                  className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold text-sm"
                >
                  취소
                </Link>
                <button
                  type="button"
                  onClick={handleSubmitBid}
                  disabled={submitting || summary.handledCount === 0}
                  className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {submitting
                      ? "입찰서 저장 중..."
                      : existingBidId
                      ? "입찰서 수정 제출하기"
                      : "입찰서 제출하기"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
