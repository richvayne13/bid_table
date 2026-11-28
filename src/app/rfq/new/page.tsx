"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import { HaengbokMeatCompare } from "@/components/compare/HaengbokMeatCompare";
import { createUnifiedRfq } from "@/lib/unified-rfq-store";
import {
  Sparkles,
  CheckCircle2,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Calendar,
  Truck,
  CreditCard,
  Building2,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface QuestMeatItem {
  id: string;
  name: string;
  spec: string;
  category: string;
  checked: boolean;
  monthlyQty: number; // kg
}

export default function NewRfqPage() {
  const router = useRouter();
  const { currentUser } = useRole();

  // B-4 3스텝 단계 관리 (Step 1: 부위선택 -> Step 2: 품목별 수량/슬라이더 -> Step 3: 요약 & 발행)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // 최종 견적비교(행복쇼핑) 화면 표시 여부
  const [showHaengbokCompare, setShowHaengbokCompare] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 육류 품목 상태 (회의록 내용 100% 반영: 다중 선택 지원 & 조리방식 제외)
  const [items, setItems] = useState<QuestMeatItem[]>([
    {
      id: "meat-1",
      name: "초이스 냉장 살치살 (미국산 EXCEL)",
      spec: "CH등급 스테이크용 / 냉장 1kg 진공팩",
      category: "우육/스테이크",
      checked: true,
      monthlyQty: 150,
    },
    {
      id: "meat-2",
      name: "프라임 냉장 알목심 (미국산 EXCEL 척아이롤)",
      spec: "PR등급 로스구이·스테이크 / 냉장 1kg",
      category: "우육/구이",
      checked: true,
      monthlyQty: 200,
    },
    {
      id: "meat-3",
      name: "AMH 냉장 S안심 (호주산 텐더로인)",
      spec: "S등급 스테이크용 1kg 진공팩",
      category: "우육/안심",
      checked: true,
      monthlyQty: 80,
    },
    {
      id: "meat-4",
      name: "TEYS 호주산 GF곡물채끝 (동결 스트립로인)",
      spec: "GF등급 스트립로인 / 동결 진공포장",
      category: "우육/채끝",
      checked: true,
      monthlyQty: 100,
    },
    {
      id: "meat-5",
      name: "초이스 차돌박이 (미국산 2mm 세절팩)",
      spec: "CH등급 2mm 세절 급랭팩 1kg",
      category: "세절육",
      checked: true,
      monthlyQty: 70,
    },
    {
      id: "meat-6",
      name: "한우 1++ 숙성 등심 (국내산 거세우)",
      spec: "1++ No.8, 9 스테이크용 원육",
      category: "한우",
      checked: false,
      monthlyQty: 50,
    },
    {
      id: "meat-7",
      name: "한돈 1등급 삼겹살 (국내산 냉장)",
      spec: "구이용 10mm 규격 슬라이스",
      category: "돈육",
      checked: false,
      monthlyQty: 100,
    },
  ]);

  // 메인화면(BuyerHomeDashboard)에서 사용자가 입력한 수량(예: 100, 100, 100, 100, 100)을 Step 2 of 3에 즉각 완벽 반영
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("selfbuyer_basket");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems((prev) =>
            prev.map((item) => {
              const matched = parsed.find((b: any) => {
                if (!b || !b.name) return false;
                const bNorm = b.name.replace(/[^가-힣a-zA-Z]/g, "");
                const itemNorm = item.name.replace(/[^가-힣a-zA-Z]/g, "");
                return (
                  (bNorm.includes("살치") && itemNorm.includes("살치")) ||
                  (bNorm.includes("알목심") && itemNorm.includes("알목심")) ||
                  (bNorm.includes("안심") && itemNorm.includes("안심")) ||
                  (bNorm.includes("채끝") && itemNorm.includes("채끝")) ||
                  (bNorm.includes("차돌") && itemNorm.includes("차돌")) ||
                  item.name.includes(b.name) ||
                  b.name.includes(item.name)
                );
              });

              if (matched && typeof matched.qty === "number" && matched.qty > 0) {
                return {
                  ...item,
                  monthlyQty: matched.qty,
                  checked: matched.checked !== undefined ? matched.checked : item.checked,
                };
              }
              return item;
            })
          );
        }
      }
    } catch (e) {
      console.error("Failed to load saved basket:", e);
    }
  }, []);

  // 기타 직접 입력 품목 추가 인풋 상태
  const [customName, setCustomName] = useState("");
  const [customSpec, setCustomSpec] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 납품 조건
  const [deliveryDays, setDeliveryDays] = useState<string[]>(["월", "수", "금"]);
  const [deliveryTime, setDeliveryTime] = useState<string>("새벽 직송 (05:00~07:00)");
  const [paymentTerms, setPaymentTerms] = useState<string>("월말 정산 (세금계산서 발행)");

  // 다중 선택 토글
  const toggleItemCheck = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  // 품목별 개별 슬라이더/수량 변경
  const updateMonthlyQty = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, monthlyQty: Math.max(10, qty) } : it))
    );
  };

  // 기타 품목 직접 추가 함수 (회의록 필수 요구사항)
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: QuestMeatItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      spec: customSpec.trim() || "맞춤 스펙 협의",
      category: "기타 맞춤부위",
      checked: true,
      monthlyQty: 50,
    };

    setItems((prev) => [...prev, newItem]);
    setCustomName("");
    setCustomSpec("");
    setShowCustomInput(false);
  };

  const checkedItems = items.filter((it) => it.checked);
  const totalQty = checkedItems.reduce((acc, it) => acc + it.monthlyQty, 0);

  // 구매자 매장 정보 상태 (실제 로그인된 사용자명 또는 입력된 상호명)
  const [restaurantName, setRestaurantName] = useState<string>(
    currentUser?.name || "A구매자 식당"
  );
  const [restaurantRegion, setRestaurantRegion] = useState<string>(
    currentUser?.description || "서울 종로구 율곡로 8길 75 (익선동)"
  );
  const [createdRfqResult, setCreatedRfqResult] = useState<any>(null);

  // 로그인 유저 변경 시 상호명 동기화
  useEffect(() => {
    if (currentUser?.name) {
      setRestaurantName(currentUser.name);
    }
  }, [currentUser]);

  // 견적 요청서 최종 발행 (실제 로컬 스토리지 & 전역 브로드캐스트)
  const handlePublishRfq = () => {
    setIsSubmitting(true);

    try {
      const newRfq = createUnifiedRfq(
        {
          restaurant_id: currentUser?.id || `buyer-${Date.now()}`,
          title: `${restaurantName} 정기 식자재 역경매 공고 (${checkedItems.length}종)`,
          region: restaurantRegion,
          contract_months: 3,
          delivery_days: deliveryDays,
          payment_terms: paymentTerms,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          company_name: restaurantName,
          address: restaurantRegion,
          business_number: currentUser?.businessNumber || "220-81-12345",
          representative: currentUser?.name || restaurantName,
          phone: currentUser?.phone || "010-1234-5678",
        },
        checkedItems.map((it, idx) => ({
          standard_item_id: it.id,
          item_name: it.name,
          category: it.category,
          spec: it.spec,
          base_unit: "kg",
          monthly_qty: it.monthlyQty,
          current_unit_price: 32000,
        }))
      );

      // 전역 이벤트 브로드캐스트 (실시간 커뮤니티 동기화)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("selfbuyer:rfq_updated", { detail: newRfq })
        );
      }

      setTimeout(() => {
        setIsSubmitting(false);
        setCreatedRfqResult(newRfq);
      }, 700);
    } catch (e) {
      console.error("Failed to create unified rfq:", e);
      setIsSubmitting(false);
      setShowHaengbokCompare(true);
    }
  };

  // 만약 행복쇼핑 화면이 활성화된 경우 -> 캡처된 행복쇼핑 화면을 그대로 렌더링!
  if (showHaengbokCompare) {
    return (
      <HaengbokMeatCompare
        initialItems={checkedItems}
        onBackToQuest={() => setShowHaengbokCompare(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* 상단 헤더 & 바로가기 바 */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> B-4. 3스텝 맞춤 견적 퀘스트
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              살롱순라 정기 육류 납품 견적 요청
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              사용하시는 부위와 월 예상 소요량만 선택하시면 마장동 유통사들이 최저가로 역제안합니다.
            </p>
          </div>

          <button
            onClick={() => setShowHaengbokCompare(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            행복쇼핑 견적비교표 즉시보기
          </button>
        </div>

        {/* 3스텝 인디케이터 바 */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className={`py-2 rounded-lg font-black transition border ${
                currentStep === 1
                  ? "bg-blue-600 text-white border-blue-500 shadow"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              1. 품목 다중 선택 ({checkedItems.length}개 선택됨)
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`py-2 rounded-lg font-black transition border ${
                currentStep === 2
                  ? "bg-blue-600 text-white border-blue-500 shadow"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              2. 품목별 월 사용량(kg) 조절
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className={`py-2 rounded-lg font-black transition border ${
                currentStep === 3
                  ? "bg-blue-600 text-white border-blue-500 shadow"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              3. 마장동 매칭 발행 & 비교
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* ========================================================
            STEP 1: 고기 품목 다중 선택 (회의록: 조리방식 제외, 기타 직접입력)
            ======================================================== */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Step 1 of 3
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  납품받으실 육류 부위를 모두 선택해 주세요 (중복 선택)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  살롱순라 정기 사용 품목이 기본 선택되어 있습니다. 추가하거나 필요 없는 부위는 해제하세요.
                </p>
              </div>

              <button
                onClick={() => setShowCustomInput(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                기타 품목 직접 추가
              </button>
            </div>

            {/* 기타 직접 입력 모달/폼 (회의록 핵심 요구사항) */}
            {showCustomInput && (
              <form
                onSubmit={handleAddCustomItem}
                className="mb-6 p-4 rounded-xl bg-blue-50 border-2 border-blue-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-blue-900 flex items-center gap-1">
                    <Plus className="w-4 h-4 text-blue-600" />
                    새로운 육류 품목 직접 기재하기
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    닫기
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="품목명 (예: 미국산 토마호크, 한우 우설, 도가니)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="p-2.5 rounded-lg border border-slate-300 bg-white font-semibold focus:outline-blue-600"
                  />
                  <input
                    type="text"
                    placeholder="세부 스펙 (예: 초이스등급 / 냉장 1.2kg 컷팅)"
                    value={customSpec}
                    onChange={(e) => setCustomSpec(e.target.value)}
                    className="p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-blue-600"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-black"
                  >
                    품목 목록에 추가
                  </button>
                </div>
              </form>
            )}

            {/* 품목 카드 그리드 (다중 선택 체크박스 카드) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItemCheck(item.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                    item.checked
                      ? "border-blue-600 bg-blue-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white opacity-70"
                  }`}
                >
                  <div className="space-y-1 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <h3 className="font-black text-sm text-slate-900 leading-snug">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.spec}</p>
                    <div className="text-xs font-bold text-blue-700 pt-1">
                      월 기본 설정량: {item.monthlyQty} kg
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      item.checked
                        ? "bg-blue-600 text-white"
                        : "border-2 border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 진행 버튼 */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              <span className="text-xs font-bold text-slate-500">
                총 <strong>{checkedItems.length}개</strong> 품목 선택됨
              </span>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={checkedItems.length === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-black text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                다음: 품목별 월 소요량 설정 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: 품목별 월 사용량 슬라이더 & 납품 조건 (회의록: 품목마다 슬라이더)
            ======================================================== */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 animate-in fade-in space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Step 2 of 3
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                선택하신 각 품목별 월 소요량(kg)을 조절해 주세요
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                유통사들은 월 주문량이 많을수록 단가를 대폭 할인하여 역제안을 넣습니다.
              </p>
            </div>

            {/* 품목별 개별 슬라이더 리스트 (회의록 핵심 요구사항 반영) */}
            <div className="space-y-4">
              {checkedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold">
                        {item.category}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500">{item.spec}</p>
                    </div>

                    {/* 수량 인풋 & 단위 */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={10}
                        max={2000}
                        step={10}
                        value={item.monthlyQty}
                        onChange={(e) => updateMonthlyQty(item.id, Number(e.target.value))}
                        className="w-20 p-2 text-right border border-slate-300 rounded-lg font-black text-blue-700 bg-white text-sm"
                      />
                      <span className="text-xs font-bold text-slate-700">kg / 월</span>
                    </div>
                  </div>

                  {/* 슬라이더 컨트롤 */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-bold">10kg</span>
                    <input
                      type="range"
                      min={10}
                      max={500}
                      step={10}
                      value={item.monthlyQty}
                      onChange={(e) => updateMonthlyQty(item.id, Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-400 font-bold">500kg+</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 납품 희망 조건 설정 */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  배송 희망 주기 (주 N회)
                </label>
                <div className="flex gap-2">
                  {["주 3회 (월/수/금)", "주 6회 (매일 새벽)", "주 2회 (화/금)"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDeliveryTime(opt)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                        deliveryTime === opt
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  선호 정산 방식
                </label>
                <div className="flex gap-2">
                  {["월말 정산 (세금계산서)", "카드 자동결제", "배송 건별 결제"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPaymentTerms(opt)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                        paymentTerms === opt
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 이전 / 다음 버튼 */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 품목 다시 고르기
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                다음: 견적 요청 요약 & 발행 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: 견적 요청 요약 & 마장동 유통사 매칭 발행 -> 행복쇼핑 전환
            ======================================================== */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 animate-in fade-in space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Step 3 of 3
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                살롱순라 맞춤 견적 요청서 확인 및 발행
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                발행 즉시 마장동 공식 유통사들에게 실시간 견적 제출 알림이 전송되며, 행복쇼핑 견적비교표로 이동합니다.
              </p>
            </div>

            {/* 견적서 요약 테이블 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100 p-3 font-black text-slate-800 flex justify-between">
                <span>요청 품목 및 월 사용량 ({checkedItems.length}종)</span>
                <span className="text-blue-600">총 월 {totalQty.toLocaleString()} kg</span>
              </div>
              <div className="divide-y divide-slate-100">
                {checkedItems.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-slate-400 text-[11px] block">{item.spec}</span>
                    </div>
                    <span className="font-black text-blue-700 bg-blue-50 px-2 py-1 rounded">
                      월 {item.monthlyQty} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송 및 매장 정보 (실제 로그인된 사장님 정보 반영 및 직접 수정 가능) */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">
                    발주 매장명 (상호명)
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="예: A구매자 고기식당"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-bold block mb-1">
                    납품 배송 권역 (주소)
                  </label>
                  <input
                    type="text"
                    value={restaurantRegion}
                    onChange={(e) => setRestaurantRegion(e.target.value)}
                    placeholder="예: 서울 종로구 익선동"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 font-semibold block">배송 희망 주기</span>
                  <span className="font-bold text-slate-900">{deliveryTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">정산 방식</span>
                  <span className="font-bold text-slate-900">{paymentTerms}</span>
                </div>
              </div>
            </div>

            {/* 실시간 등록 완료 인터랙티브 알림 카드 */}
            {createdRfqResult && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 text-white border border-emerald-500/60 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-lg">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[11px] font-black border border-emerald-400/40">
                      실시간 커뮤니티 공고함 등록 완료
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      [{createdRfqResult.profiles.company_name}]의 견적 요청이 실시간 등록되었습니다!
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      이제 <strong>판매자(공급사) 화면</strong>과 <strong>운영관리자 관제 화면</strong>에서 즉시 확인되며, 유통사들이 실시간으로 최저가 투찰을 진행합니다.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <Link
                    href="/supplier/rfqs"
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-center font-bold text-xs text-emerald-300 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>판매자 공고함에서 보기</span>
                  </Link>

                  <Link
                    href="/admin"
                    className="p-3 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/30 text-center font-bold text-xs text-blue-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>운영관리자 실시간 관제</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowHaengbokCompare(true)}
                    className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-center font-black text-xs text-slate-950 flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>행복쇼핑 비교표 확인</span>
                  </button>
                </div>
              </div>
            )}

            {/* 매칭 발행 로딩 및 버튼 */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              {isSubmitting ? (
                <div className="text-center py-6 space-y-3 bg-blue-50/60 rounded-xl border border-blue-200">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <h4 className="font-black text-slate-900 text-sm">
                    {restaurantName} 견적 공고를 실시간 판매자 커뮤니티에 브로드캐스트 중...
                  </h4>
                  <p className="text-xs text-slate-500">
                    전국 식자재 공급사 및 운영관리자 화면으로 실시간 견적 공고가 전달됩니다.
                  </p>
                </div>
              ) : !createdRfqResult ? (
                <button
                  onClick={handlePublishRfq}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  실시간 견적 요청서 발행 & 판매자 매칭 시작
                </button>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <button
                    onClick={() => {
                      setCreatedRfqResult(null);
                      setCurrentStep(1);
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    + 다른 품목으로 새 견적 또 요청하기
                  </button>
                  <span className="text-emerald-600 font-bold">● 실시간 공고 진행 중</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> 수량 다시 조절하기
                </button>
                <span>단가보장제 및 콜드체인 안심배송 보장</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
