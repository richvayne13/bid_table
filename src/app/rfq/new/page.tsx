"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRole, DEMO_USERS } from "@/contexts/RoleContext";
import { StandardItem } from "@/types/database";
import { formatPrice, formatNumber } from "@/lib/utils";
import { parseItemsFromImage } from "@/lib/client-api";
import { DEFAULT_STANDARD_ITEMS } from "@/lib/default-items";
import { saveDemoRfq } from "@/lib/mock-storage";
import { REGION_TREE } from "@/lib/regions";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  Trash2,
  Sparkles,
  Upload,
  Search,
  AlertCircle,
  CheckCircle2,
  Wand2,
  FileImage,
  UtensilsCrossed,
} from "lucide-react";

interface SelectedRfqItem {
  standard_item_id: string;
  item_name: string;
  category: string;
  spec: string;
  base_unit: string;
  monthly_qty: number;
  current_unit_price: number | null;
}

const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"];
const CATEGORIES = ["ALL", "육류", "해산물", "유제품", "채소/과일", "소스/공산품"];

const DEFAULT_RESTAURANT_USER =
  DEMO_USERS.find((u) => u.role === "RESTAURANT") || DEMO_USERS[0];

export default function NewRfqPage() {
  const router = useRouter();
  const { currentUser, switchRole } = useRole();
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [standardItems, setStandardItems] = useState<StandardItem[]>(DEFAULT_STANDARD_ITEMS);
  const [loadingItems, setLoadingItems] = useState(false);

  // Step 1: 기본 계약 조건
  const [title, setTitle] = useState("살롱순라 정기 이탈리안 식자재 견적 요청서");
  const [city, setCity] = useState("서울시");
  const [district, setDistrict] = useState("종로구");
  const [dong, setDong] = useState("익선동");
  const [contractMonths, setContractMonths] = useState<1 | 3 | 6>(3);
  const [deliveryDays, setDeliveryDays] = useState<string[]>(["월", "수", "금"]);
  const [paymentTerms, setPaymentTerms] = useState<"선결제" | "월말정산" | "카드결제">(
    "월말정산"
  );

  const minDateStr = useMemo(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  }, []);

  const [deadline, setDeadline] = useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  });

  // Step 2: 품목 리스트 구성
  const [itemAddMode, setItemAddMode] = useState<"MANUAL" | "AI">("MANUAL");
  const [selectedItems, setSelectedItems] = useState<SelectedRfqItem[]>([]);
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>("ALL");
  const [itemSearchTerm, setItemSearchTerm] = useState<string>("");

  // Step 2 - 방식 B (AI 자동 추출)
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrNotice, setOcrNotice] = useState<{
    type: "success" | "info" | "error";
    text: string;
    isMock?: boolean;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const districts = Object.keys(REGION_TREE[city] || {});
  const dongs = REGION_TREE[city]?.[district] || [];
  const fullRegion =
    district === "세종시 전체" ? `${city} ${dong}` : `${city} ${district} ${dong}`;

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);
    const nextDistricts = Object.keys(REGION_TREE[nextCity] || {});
    const firstDist = nextDistricts[0] || "";
    setDistrict(firstDist);
    const nextDongs = REGION_TREE[nextCity]?.[firstDist] || [];
    setDong(nextDongs[0] || "");
  };

  const handleDistrictChange = (nextDistrict: string) => {
    setDistrict(nextDistrict);
    const nextDongs = REGION_TREE[city]?.[nextDistrict] || [];
    setDong(nextDongs[0] || "");
  };

  // Load standard_items from Supabase (fallback to DEFAULT_STANDARD_ITEMS)
  useEffect(() => {
    async function loadStandards() {
      try {
        const { data, error } = await supabase
          .from("standard_items")
          .select("*")
          .order("category")
          .order("item_name");

        if (error) {
          // Supabase 연결 없어도 내장된 85종 기본 품목 유지
          console.warn("Using embedded default standard items:", error.message);
        } else if (data && data.length > 0) {
          // Merge Supabase items with defaults
          const existingNames = new Set(data.map((d: any) => d.item_name));
          const extraDefaults = DEFAULT_STANDARD_ITEMS.filter(
            (def) => !existingNames.has(def.item_name)
          );
          setStandardItems([...(data as StandardItem[]), ...extraDefaults]);
        }
      } catch (err: any) {
        console.warn("Supabase fetch fallback:", err?.message);
      } finally {
        setLoadingItems(false);
      }
    }
    loadStandards();
  }, [supabase]);

  // Cleanup preview object URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toggleDeliveryDay = (day: string) => {
    setDeliveryDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addItem = (item: StandardItem) => {
    if (selectedItems.some((s) => s.standard_item_id === item.id)) return;
    setSelectedItems((prev) => [
      ...prev,
      {
        standard_item_id: item.id,
        item_name: item.item_name,
        category: item.category,
        spec: item.spec,
        base_unit: item.base_unit,
        monthly_qty: 10,
        current_unit_price: null,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.standard_item_id !== id));
  };

  const updateItemQty = (id: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((i) =>
        i.standard_item_id === id
          ? { ...i, monthly_qty: Number.isFinite(qty) && qty > 0 ? qty : 0.5 }
          : i
      )
    );
  };

  const updateItemPrice = (id: string, price: number | null) => {
    setSelectedItems((prev) =>
      prev.map((i) =>
        i.standard_item_id === id ? { ...i, current_unit_price: price } : i
      )
    );
  };

  // Match extracted AI item to standard_items
  const findBestStandardMatch = (extractedName: string): StandardItem | undefined => {
    const normalized = extractedName.replace(/\s+/g, "").toLowerCase();
    // 1. Exact or substring match
    const direct = standardItems.find((si) => {
      const target = si.item_name.replace(/\s+/g, "").toLowerCase();
      return (
        target === normalized ||
        target.includes(normalized) ||
        normalized.includes(target)
      );
    });
    if (direct) return direct;

    // 2. Token overlap match
    const tokens = extractedName
      .split(/[\s(),/]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length >= 2);
    return standardItems.find((si) => {
      const haystack = `${si.item_name} ${si.spec}`.toLowerCase();
      return tokens.some((tok) => haystack.includes(tok));
    });
  };

  const runParseItems = async (file: File | null, forceMock = false) => {
    try {
      setOcrLoading(true);
      setOcrNotice(null);

      if (file) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
      }

      const data = await parseItemsFromImage(file || null, forceMock);
      if (!data.success) {
        setOcrNotice({
          type: "error",
          text: "이미지 분석에 실패했습니다.",
        });
        return;
      }

      const extractedList: any[] = data.items || [];
      let addedCount = 0;
      let updatedCount = 0;
      const unmatchedNames: string[] = [];

      setSelectedItems((prev) => {
        const next = [...prev];

        extractedList.forEach((extracted) => {
          const match = findBestStandardMatch(extracted.item_name || "");
          if (!match) {
            unmatchedNames.push(extracted.item_name);
            return;
          }

          const existingIdx = next.findIndex(
            (s) => s.standard_item_id === match.id
          );
          if (existingIdx >= 0) {
            next[existingIdx] = {
              ...next[existingIdx],
              monthly_qty: Number(extracted.monthly_qty) || next[existingIdx].monthly_qty,
              current_unit_price:
                extracted.current_unit_price ?? next[existingIdx].current_unit_price,
            };
            updatedCount += 1;
          } else {
            next.push({
              standard_item_id: match.id,
              item_name: match.item_name,
              category: match.category,
              spec: match.spec,
              base_unit: match.base_unit,
              monthly_qty: Number(extracted.monthly_qty) || 10,
              current_unit_price:
                extracted.current_unit_price !== undefined
                  ? extracted.current_unit_price
                  : null,
            });
            addedCount += 1;
          }
        });

        return next;
      });

      const unmatchedSuffix =
        unmatchedNames.length > 0
          ? ` (표준 품목 미매칭 ${unmatchedNames.length}건: ${unmatchedNames.join(", ")})`
          : "";

      setOcrNotice({
        type: "success",
        isMock: data.isMock,
        text: `${data.message || "추출 완료"} → 신규 ${addedCount}건 추가${
          updatedCount > 0 ? `, 기존 ${updatedCount}건 수량·단가 업데이트` : ""
        }.${unmatchedSuffix}`,
      });
    } catch (err) {
      console.error(err);
      setOcrNotice({
        type: "error",
        text: "AI 품목 추출 요청 중 네트워크 오류가 발생했습니다.",
      });
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runParseItems(file, false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      runParseItems(file, false);
    }
  };

  const validateStep1 = (): boolean => {
    if (!title.trim()) {
      setErrorMsg("견적 요청서 제목을 입력해 주세요.");
      return false;
    }
    if (deliveryDays.length === 0) {
      setErrorMsg("희망 배송 요일을 최소 1개 이상 선택해 주세요.");
      return false;
    }
    if (!deadline) {
      setErrorMsg("입찰 마감일을 선택해 주세요.");
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const goToStep = (target: 1 | 2 | 3) => {
    if (target > 1 && !validateStep1()) return;
    if (target === 3 && selectedItems.length === 0) {
      setErrorMsg("Step 2에서 최소 1개 이상의 식자재 품목을 추가해 주세요.");
      return;
    }
    setErrorMsg(null);
    setStep(target);
  };

  // Calculations
  const totalCurrentBudget = useMemo(
    () =>
      selectedItems.reduce(
        (acc, cur) => acc + (cur.current_unit_price || 0) * cur.monthly_qty,
        0
      ),
    [selectedItems]
  );

  const pricedItemCount = selectedItems.filter(
    (i) => i.current_unit_price !== null && i.current_unit_price > 0
  ).length;

  const activeRestaurantId =
    currentUser.role === "RESTAURANT"
      ? currentUser.id
      : DEFAULT_RESTAURANT_USER.id;

  // Submit to Supabase (rfqs + rfq_items)
  const handleSubmit = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (selectedItems.length === 0) {
      setErrorMsg("최소 1개 이상의 품목을 추가해야 합니다.");
      setStep(2);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // 1. Insert into rfqs
      const { data: newRfq, error: rfqError } = await supabase
        .from("rfqs")
        .insert({
          restaurant_id: activeRestaurantId,
          title: title.trim(),
          region: fullRegion,
          contract_months: contractMonths,
          delivery_days: deliveryDays,
          payment_terms: paymentTerms,
          deadline: new Date(`${deadline}T23:59:59+09:00`).toISOString(),
          status: "OPEN",
        })
        .select()
        .single();

      if (rfqError) throw rfqError;

      // 2. Insert into rfq_items
      const itemsToInsert = selectedItems.map((item) => ({
        rfq_id: newRfq.id,
        standard_item_id: item.standard_item_id,
        monthly_qty: item.monthly_qty,
        current_unit_price: item.current_unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("rfq_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      router.push(`/rfq?created=${newRfq.id}`);
    } catch (err: any) {
      console.warn("Supabase submit failed, saving to local demo storage:", err?.message);
      // Fallback: Supabase 키 미설정 또는 네트워크 오류 시 로컬 데모 스토리지에 안전 저장
      const demoRfq = saveDemoRfq(
        {
          restaurant_id: activeRestaurantId,
          title: title.trim(),
          region: fullRegion,
          contract_months: contractMonths,
          delivery_days: deliveryDays,
          payment_terms: paymentTerms,
          deadline: new Date(`${deadline}T23:59:59+09:00`).toISOString(),
        },
        selectedItems
      );
      router.push(`/rfq?created=${demoRfq.id}&demo=true`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStandardItems = useMemo(() => {
    const q = itemSearchTerm.trim().toLowerCase();
    return standardItems.filter((item) => {
      const matchCat =
        itemCategoryFilter === "ALL" || item.category === itemCategoryFilter;
      const matchSearch =
        q === "" ||
        item.item_name.toLowerCase().includes(q) ||
        item.spec.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [standardItems, itemCategoryFilter, itemSearchTerm]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Link
          href="/rfq"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>내 견적 요청 목록 (/rfq)으로 돌아가기</span>
        </Link>
        <div className="text-xs text-gray-500">
          발주 식당:{" "}
          <span className="font-bold text-gray-900">
            {currentUser.role === "RESTAURANT"
              ? currentUser.name
              : DEFAULT_RESTAURANT_USER.name}
          </span>
        </div>
      </div>

      {/* Role Notice if currently in SUPPLIER or ADMIN mode */}
      {currentUser.role !== "RESTAURANT" && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-orange-900">
            <UtensilsCrossed className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              현재 <strong>{currentUser.badge}</strong> 모드입니다. 견적 요청서는 식당 업주(
              <strong>{DEFAULT_RESTAURANT_USER.name}</strong>) 계정으로 저장됩니다.
            </span>
          </div>
          <button
            type="button"
            onClick={() => switchRole("RESTAURANT")}
            className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shrink-0"
          >
            식당 모드로 전환
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-200" />
          <div
            className="absolute top-5 left-6 h-0.5 bg-orange-500 transition-all duration-300"
            style={{
              width:
                step === 1
                  ? "0%"
                  : step === 2
                  ? "calc(50% - 24px)"
                  : "calc(100% - 48px)",
            }}
          />

          {[
            { num: 1 as const, label: "기본 계약 조건" },
            { num: 2 as const, label: "품목 리스트 구성" },
            { num: 3 as const, label: "검토 및 게시" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => goToStep(s.num)}
              className="relative z-10 flex flex-col items-center space-y-1.5"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= s.num
                    ? "bg-orange-600 text-white shadow-md shadow-orange-500/20"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs font-bold ${
                  step === s.num ? "text-orange-700" : "text-gray-600"
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: 기본 계약 조건 */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-xl font-extrabold text-gray-900">
              Step 1. 기본 계약 및 배송 조건 설정
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              배송 권역이 일치하는 유통사들이 정확히 입찰할 수 있도록 매장 조건을 입력해 주세요.
            </p>
          </div>

          <div className="space-y-5">
            {/* 요청서 제목 */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                요청서 제목 <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 살롱순라 익선점 정기 이탈리안 식자재 견적 요청서"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
              />
            </div>

            {/* 매장 배송 권역 (시 / 구 / 동 3단계 선택) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>
                    매장 배송 권역 (시 / 구 / 동 선택){" "}
                    <span className="text-orange-600">*</span>
                  </span>
                </label>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  선택 권역: {fullRegion}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="block text-[11px] text-gray-400 mb-1">시 / 도</span>
                  <select
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                  >
                    {Object.keys(REGION_TREE).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="block text-[11px] text-gray-400 mb-1">구 / 군</span>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                  >
                    {districts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="block text-[11px] text-gray-400 mb-1">동 / 읍 / 면</span>
                  <select
                    value={dong}
                    onChange={(e) => setDong(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium bg-white"
                  >
                    {dongs.map((dn) => (
                      <option key={dn} value={dn}>
                        {dn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 희망 계약 기간 & 입찰 마감일 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  <span>
                    희망 계약 기간 <span className="text-orange-600">*</span>
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {([1, 3, 6] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setContractMonths(m)}
                      className={`py-2.5 px-3 rounded-xl border text-center font-bold text-sm transition-all ${
                        contractMonths === m
                          ? "border-orange-500 bg-orange-50 text-orange-900 shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {m}개월
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>
                    입찰 마감일 <span className="text-orange-600">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                />
              </div>
            </div>

            {/* 희망 배송 요일 (월~일 다중 선택) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                희망 배송 요일 (월~일 다중 선택) <span className="text-orange-600">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = deliveryDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDeliveryDay(day)}
                      className={`w-11 h-11 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                        isSelected
                          ? "bg-orange-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                선택됨: 주 {deliveryDays.length}회 ({deliveryDays.join(", ") || "없음"}) · 2사 분할
                최소주문금액(MOQ) 검증 기준으로 활용됩니다.
              </p>
            </div>

            {/* 결제 조건 */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 flex items-center space-x-1">
                <CreditCard className="w-3.5 h-3.5 text-orange-600" />
                <span>
                  결제 조건 <span className="text-orange-600">*</span>
                </span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["월말정산", "선결제", "카드결제"] as const).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setPaymentTerms(term)}
                    className={`py-3 px-4 rounded-2xl border text-center font-bold text-sm transition-all ${
                      paymentTerms === term
                        ? "border-orange-500 bg-orange-50 text-orange-950 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center space-x-1.5 shadow-md shadow-orange-500/20"
            >
              <span>다음: 품목 리스트 구성</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: 품목 리스트 구성 (방식 A + 방식 B) */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Step 2. 품목 리스트 구성 ({selectedItems.length}개 선택됨)
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                표준 식자재에서 검색해 추가하거나, 거래명세서·메뉴판 이미지를 업로드해 AI로 자동
                추출하세요.
              </p>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-auto">
              <button
                type="button"
                onClick={() => setItemAddMode("MANUAL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  itemAddMode === "MANUAL"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                방식 A · 수동/검색 추가
              </button>
              <button
                type="button"
                onClick={() => setItemAddMode("AI")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  itemAddMode === "AI"
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-orange-600"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>방식 B · AI 자동 추출</span>
              </button>
            </div>
          </div>

          {/* 방식 A: 수동/검색 추가 */}
          {itemAddMode === "MANUAL" && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setItemCategoryFilter(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        itemCategoryFilter === c
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {c === "ALL"
                        ? `전체 (${standardItems.length})`
                        : `${c} (${standardItems.filter((i) => i.category === c).length})`}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="품목명 또는 규격 검색..."
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs w-full sm:w-52 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {loadingItems ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Supabase에서 표준 식자재 목록을 불러오는 중...
                </div>
              ) : filteredStandardItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  검색 조건에 맞는 표준 품목이 없습니다.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pr-1">
                  {filteredStandardItems.map((item) => {
                    const isSelected = selectedItems.some(
                      (s) => s.standard_item_id === item.id
                    );
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-orange-50/60 border-orange-200 text-orange-950"
                            : "bg-white border-gray-200 hover:border-orange-300 text-gray-800"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs truncate">
                              {item.item_name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 shrink-0">
                              {item.base_unit}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 truncate mt-0.5">
                            {item.category} · {item.spec}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addItem(item)}
                          disabled={isSelected}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                            isSelected
                              ? "bg-emerald-100 text-emerald-800 cursor-default"
                              : "bg-orange-600 hover:bg-orange-700 text-white"
                          }`}
                        >
                          {isSelected ? "추가됨" : "+ 추가"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 방식 B: AI 자동 추출 */}
          {itemAddMode === "AI" && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50/40 to-white border border-orange-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-orange-500 text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      AI 거래명세서 / 메뉴판 자동 추출 (gpt-4o-mini Vision)
                    </h3>
                    <p className="text-xs text-gray-600">
                      이미지를 업로드하면 `/api/parse-items`가 품목·수량·단가를 JSON으로 추출해
                      표준 품목에 자동 매핑합니다.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={ocrLoading || loadingItems}
                  onClick={() => runParseItems(null, true)}
                  className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-orange-300 hover:bg-orange-50 text-orange-800 text-xs font-bold shadow-sm transition-colors shrink-0 disabled:opacity-50"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>샘플 명세서로 Mock 체험</span>
                </button>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${
                  isDragging
                    ? "border-orange-500 bg-orange-100/50"
                    : "border-orange-300 hover:bg-orange-50/50"
                }`}
              >
                {previewUrl ? (
                  <div className="flex flex-col items-center space-y-2 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="업로드된 거래명세서 미리보기"
                      className="max-h-36 rounded-xl border border-orange-200 shadow-sm object-contain"
                    />
                    <span className="text-[11px] text-gray-500 flex items-center space-x-1">
                      <FileImage className="w-3.5 h-3.5" />
                      <span>업로드된 이미지 미리보기</span>
                    </span>
                  </div>
                ) : (
                  <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                )}

                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 shadow-sm inline-block">
                    {ocrLoading
                      ? "AI 이미지 분석 중..."
                      : "거래명세서 / 메뉴판 이미지 선택 (또는 드래그)"}
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleOcrFileChange}
                    disabled={ocrLoading}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-500 mt-2">
                  JPG, PNG, WEBP 지원 · <code className="font-mono">OPENAI_API_KEY</code> 미설정 시
                  Mock 모드로 샘플 거래명세서 품목이 반환됩니다.
                </p>
              </div>

              {ocrNotice && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2 ${
                    ocrNotice.type === "error"
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : "bg-white border-orange-200 text-orange-950"
                  }`}
                >
                  {ocrNotice.type === "error" ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    {ocrNotice.isMock !== undefined && (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                          ocrNotice.isMock
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {ocrNotice.isMock ? "MOCK 모드" : "GPT-4o-mini Vision"}
                      </span>
                    )}
                    <span>{ocrNotice.text}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Selected Items Table */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-900">
                선택된 요청 품목 ({selectedItems.length}개)
              </h3>
              <div className="text-xs text-gray-600">
                현재 매입가 기준 월 예상 총액:{" "}
                <strong className="text-orange-700 font-extrabold text-sm">
                  {formatPrice(totalCurrentBudget)}
                </strong>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">품목명 / 규격</th>
                    <th className="py-3 px-4 text-center">단위</th>
                    <th className="py-3 px-4 w-32">월 예상 소요량 *</th>
                    <th className="py-3 px-4 w-40">현재 매입단가 (선택)</th>
                    <th className="py-3 px-4 text-right">월 예상 매입액</th>
                    <th className="py-3 px-4 w-12 text-center">삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedItems.map((item) => (
                    <tr key={item.standard_item_id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 text-xs">
                          {item.item_name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {item.category} · {item.spec}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-xs font-semibold">
                          {item.base_unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={item.monthly_qty}
                          onChange={(e) =>
                            updateItemQty(item.standard_item_id, Number(e.target.value))
                          }
                          className="w-24 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono font-bold text-right focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          step="100"
                          placeholder="원 (선택 입력)"
                          value={item.current_unit_price ?? ""}
                          onChange={(e) =>
                            updateItemPrice(
                              item.standard_item_id,
                              e.target.value === "" ? null : Number(e.target.value)
                            )
                          }
                          className="w-32 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-mono text-right focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-xs text-gray-800">
                        {item.current_unit_price
                          ? formatPrice(item.current_unit_price * item.monthly_qty)
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.standard_item_id)}
                          className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                          aria-label={`${item.item_name} 삭제`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {selectedItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-10 text-center text-xs text-gray-400"
                      >
                        아직 선택된 품목이 없습니다. 방식 A(표준 품목 검색) 또는 방식 B(AI 자동
                        추출)로 품목을 추가해 주세요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50"
            >
              이전: 계약 조건
            </button>
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm flex items-center space-x-1.5 shadow-md shadow-orange-500/20"
            >
              <span>다음: 검토 및 게시</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 검토 및 게시 */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900">
              Step 3. 견적 요청서 최종 검토 및 게시
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              입력하신 조건과 품목별 월 예상 총액을 확인한 뒤 역경매 공고를 게시하세요.
            </p>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="font-bold text-gray-800 text-sm mb-2">
                📋 계약 및 배송 조건 요약
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">요청서 제목</span>
                <span className="font-semibold text-gray-900 text-right">{title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">매장 배송 권역</span>
                <span className="font-semibold text-gray-900">{fullRegion}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">희망 계약 기간</span>
                <span className="font-semibold text-gray-900">{contractMonths}개월</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">희망 배송 요일</span>
                <span className="font-semibold text-orange-600">
                  {deliveryDays.join(", ")} (주 {deliveryDays.length}회)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">결제 조건</span>
                <span className="font-semibold text-gray-900">{paymentTerms}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">입찰 마감일</span>
                <span className="font-semibold text-gray-900">{deadline}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-3 text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="font-bold text-orange-950 text-sm">
                  💰 현재 매입가 기준 예상 월 총액 요약
                </div>
                <div className="flex justify-between py-1 border-b border-orange-200/60">
                  <span className="text-gray-600">총 요청 품목 수</span>
                  <span className="font-bold text-orange-900">
                    {selectedItems.length}개 품목
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-orange-200/60">
                  <span className="text-gray-600">기존 매입단가 입력 품목</span>
                  <span className="font-semibold text-gray-800">
                    {pricedItemCount} / {selectedItems.length}개
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-gray-700 font-bold">현재 매입가 기준 월 총액</span>
                  <span className="text-2xl font-black text-orange-600">
                    {formatPrice(totalCurrentBudget)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-orange-200 text-[11px] text-gray-600">
                💡 게시 완료 시 Supabase <code className="font-mono font-bold">rfqs</code> 및{" "}
                <code className="font-mono font-bold">rfq_items</code>에 저장되며, 상태가{" "}
                <strong className="text-emerald-700">OPEN</strong>으로 등록됩니다.
              </div>
            </div>
          </div>

          {/* Final Items Review Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900">
              최종 요청 품목 상세 ({selectedItems.length}건)
            </h3>
            <div className="border border-gray-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                  <tr>
                    <th className="py-2.5 px-4">카테고리</th>
                    <th className="py-2.5 px-4">표준 품목명 / 규격</th>
                    <th className="py-2.5 px-4 text-right">월 예상 소요량</th>
                    <th className="py-2.5 px-4 text-right">현재 매입단가</th>
                    <th className="py-2.5 px-4 text-right">월 예상 소계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedItems.map((item) => (
                    <tr key={item.standard_item_id}>
                      <td className="py-2.5 px-4 text-gray-500">{item.category}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-gray-900">{item.item_name}</span>
                        <span className="text-gray-400 ml-1.5">({item.spec})</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold">
                        {formatNumber(item.monthly_qty)} {item.base_unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-gray-600">
                        {item.current_unit_price
                          ? `${formatPrice(item.current_unit_price)}/${item.base_unit}`
                          : "미입력"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-gray-900">
                        {item.current_unit_price
                          ? formatPrice(item.current_unit_price * item.monthly_qty)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50"
            >
              이전: 품목 수정
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-60 text-white font-extrabold text-sm flex items-center space-x-2 shadow-lg shadow-orange-500/25 transition-all"
            >
              {submitting ? (
                <span>Supabase에 저장 중...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>견적 요청서 게시하기</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
