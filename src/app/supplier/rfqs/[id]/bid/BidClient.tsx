"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRole, DEMO_USERS, DemoUser } from "@/contexts/RoleContext";
import { formatPrice, formatNumber } from "@/lib/utils";
import { parseCatalogExcel } from "@/lib/client-api";
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
  const rfqId = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();
  const { currentUser, setCurrentUser } = useRole();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeSupplier = useMemo(() => {
    if (currentUser.role === "SUPPLIER") return currentUser;
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

        if (rfqRes.error) throw rfqRes.error;
        const rfqData = rfqRes.data;
        setRfq(rfqData);

        const catLookup: Record<
          string,
          { package_weight: number; package_price: number }
        > = {};
        (catRes.data || []).forEach((c: any) => {
          catLookup[c.standard_item_id] = {
            package_weight: Number(c.package_weight),
            package_price: Number(c.package_price),
          };
        });
        setCatalogMap(catLookup);

        const existingBid = bidRes.data;
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/supplier/rfqs"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>입찰 공고함 (/supplier/rfqs)으로 돌아가기</span>
        </Link>

        {/* Quick Supplier Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-400 font-semibold mr-1">입찰 유통사:</span>
          {SUPPLIER_DEMO_USERS.map((sup) => (
            <button
              key={sup.id}
              type="button"
              onClick={() => setCurrentUser(sup)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeSupplier.id === sup.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {sup.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          견적 요청서와 자사 단가표를 불러오는 중...
        </div>
      ) : !rfq ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-gray-800">
            해당 견적 요청서를 찾을 수 없습니다.
          </p>
          <Link
            href="/supplier/rfqs"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
          >
            공고 목록으로 이동
          </Link>
        </div>
      ) : (
        <>
          {/* RFQ Overview Header */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{activeSupplier.name} 입찰서 작성</span>
                  </span>
                  {existingBidId && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                      기존 투찰 내역 수정 모드
                    </span>
                  )}
                  {ddayNum !== null && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                      {ddayNum < 0 ? "마감 경과" : `마감 D-${ddayNum}`}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  {rfq.title}
                </h1>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 space-y-0.5">
                <div className="font-bold text-gray-800">
                  발주 식당: {rfq.profiles?.company_name || "살롱순라"}
                </div>
                <div className="flex items-center space-x-1 text-blue-700 font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{rfq.region}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center space-x-1.5 text-gray-600">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>
                  계약기간: <strong className="text-gray-900">{rfq.contract_months}개월</strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-600">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>
                  배송요일:{" "}
                  <strong className="text-gray-900">
                    {Array.isArray(rfq.delivery_days) ? rfq.delivery_days.join(", ") : "-"}
                  </strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-600">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span>
                  결제조건: <strong className="text-gray-900">{rfq.payment_terms}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-gray-600">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>
                  마감일:{" "}
                  <strong className="text-gray-900">
                    {new Date(rfq.deadline).toLocaleDateString("ko-KR")}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* 1. 기본 입찰 조건 입력 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>1. 기본 입찰 조건</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* MOQ */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  1회 최소주문금액 (MOQ, 원) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={moqAmount}
                    onChange={(e) => setMoqAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-2.5 text-xs text-gray-400 font-bold">
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
                          ? "bg-blue-50 border-blue-400 text-blue-800"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {preset / 10000}만원
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400">
                  식당의 2사 분할 최적 조합 알고리즘에서 회당 발주액 충족 검증에 사용됩니다.
                </p>
              </div>

              {/* Price Lock Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  단가 보장 유형 *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPriceLockType("FIXED")}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      priceLockType === "FIXED"
                        ? "border-blue-600 bg-blue-50/70 text-blue-950"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-extrabold text-xs">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>고정단가형 (FIXED)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      계약 기간 동안 확정 단가 100% 고정 (인상 불가)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriceLockType("INDEXED")}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      priceLockType === "INDEXED"
                        ? "border-blue-600 bg-blue-50/70 text-blue-950"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-extrabold text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      <span>시세연동 상한형 (INDEXED)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      시세 급등 시 확정 단가 대비 최대 +10% 상한 내 허용
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 자동 견적 채우기 + 품목별 단가 입력 테이블 */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Auto-fill Toolbar */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 via-indigo-50/30 to-white space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <span>2. 품목별 공급 단가 입력 및 자동 환산</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    취급 가능한 품목을 체크하고 자사 포장단위와 공급가를 입력하면 기준단위(1kg/1L/1ea)
                    환산 단가가 실시간 계산됩니다.
                  </p>
                </div>

                {/* Auto-Fill Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoMatchCatalog}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      자사 표준 단가표 자동 매칭 ({Object.keys(catalogMap).length}종)
                    </span>
                  </button>

                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
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
                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    title="현재 요청 품목 기준 엑셀 단가표 양식 다운로드"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>샘플 엑셀</span>
                  </button>
                </div>
              </div>

              {autoFillNotice && (
                <div className="p-3 rounded-xl bg-white border border-blue-200 text-xs text-blue-950 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{autoFillNotice}</span>
                </div>
              )}
            </div>

            {/* Pricing Input Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3.5 px-4 w-16 text-center">취급</th>
                    <th className="py-3.5 px-4">요청 품목 / 규격</th>
                    <th className="py-3.5 px-4 text-right">월 소요량</th>
                    <th className="py-3.5 px-4 w-36">포장단위 (kg/L/ea)</th>
                    <th className="py-3.5 px-4 w-44">포장공급가 (원)</th>
                    <th className="py-3.5 px-4 text-right bg-blue-50/60 text-blue-900 font-bold">
                      기준단위 환산 단가 (자동)
                    </th>
                    <th className="py-3.5 px-4 text-right">월 예상 공급액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
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
                          row.handled ? "bg-white" : "bg-gray-50/60 opacity-70"
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={row.handled}
                            onChange={(e) =>
                              updateRow(row.rfq_item_id, { handled: e.target.checked })
                            }
                            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                            aria-label={`${row.item_name} 취급 여부`}
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">
                              {row.item_name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                              {row.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {row.spec}
                            {row.current_unit_price
                              ? ` · 기존 매입가 ${formatPrice(row.current_unit_price)}/${row.base_unit}`
                              : ""}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">
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
