"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  CheckCircle2,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Sliders,
  Calendar,
  Truck,
  Building2,
  Send,
  Printer,
  Copy,
  Clock,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface SupplierMeatItem {
  id: string;
  name: string;
  spec: string;
  origin: string;
  brand: string;
  storage: "냉장" | "동결" | "냉동";
  unitPrice: number; // kg당 공급단가 (원)
  moq: string; // 최소 주문단위 (회의록: 판매자에게 kg 대신 MOQ 적용)
  checked: boolean;
}

export default function SupplierRegisterQuotePage() {
  const router = useRouter();

  // 회의록 1, 3, 10 믹스 단계 관리:
  // Step 1: 숨고식 퀘스트 (품목 다중 선택 & 기타 추가)
  // Step 2: 공급 거래 조건 (MOQ, 견적 유효기간 픽스, 콜드체인 배송)
  // Step 3: 마장동 실무 엑셀 그리드 (초록색 납품단가 직접 기입 & 편집)
  // Step 4: 실 견적서 발급 및 거래처 제안 (10번 미니멀 견적서 양식)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. 취급 육류 품목 상태 (회의록: 다중 선택 지원 & 조리방식 제외)
  const [items, setItems] = useState<SupplierMeatItem[]>([
    {
      id: "sup-1",
      name: "살치살",
      spec: "CH등급 스테이크용 / 냉장 1kg 진공팩",
      origin: "미국산",
      brand: "EXCEL",
      storage: "냉장",
      unitPrice: 32500,
      moq: "1박스 (약 15kg)",
      checked: true,
    },
    {
      id: "sup-2",
      name: "알목심 (척아이롤)",
      spec: "PR등급 로스구이·스테이크 / 냉장 1kg",
      origin: "미국산",
      brand: "EXCEL",
      storage: "냉장",
      unitPrice: 25900,
      moq: "1박스 (약 20kg)",
      checked: true,
    },
    {
      id: "sup-3",
      name: "S안심 (텐더로인)",
      spec: "S등급 스테이크용 1kg 진공팩",
      origin: "호주산",
      brand: "AMH",
      storage: "냉장",
      unitPrice: 44000,
      moq: "1박스 (약 10kg)",
      checked: true,
    },
    {
      id: "sup-4",
      name: "GF곡물 채끝등심",
      spec: "GF등급 스트립로인 / 동결 진공포장",
      origin: "호주산",
      brand: "TEYS",
      storage: "동결",
      unitPrice: 28500,
      moq: "1박스 (약 15kg)",
      checked: true,
    },
    {
      id: "sup-5",
      name: "차돌박이",
      spec: "CH등급 2mm 세절 급랭팩 1kg",
      origin: "미국산",
      brand: "EXCEL",
      storage: "냉동",
      unitPrice: 20000,
      moq: "1박스 (약 10kg)",
      checked: true,
    },
    {
      id: "sup-6",
      name: "숙성 등심",
      spec: "1++ No.8, 9 스테이크용 원육",
      origin: "국내산 (한우)",
      brand: "마장동 우시",
      storage: "냉장",
      unitPrice: 65000,
      moq: "원육 1채 (약 12kg)",
      checked: false,
    },
    {
      id: "sup-7",
      name: "삼겹살",
      spec: "구이용 10mm 규격 슬라이스",
      origin: "국내산 (한돈)",
      brand: "도드람",
      storage: "냉장",
      unitPrice: 19500,
      moq: "1박스 (약 15kg)",
      checked: false,
    },
  ]);

  // 기타 직접 입력 품목 추가 인풋 상태 (회의록 필수 요구사항)
  const [customName, setCustomName] = useState("");
  const [customSpec, setCustomSpec] = useState("");
  const [customOrigin, setCustomOrigin] = useState("미국산");
  const [customBrand, setCustomBrand] = useState("EXCEL");
  const [customPrice, setCustomPrice] = useState(30000);
  const [showCustomInput, setShowCustomInput] = useState(false);

  // 2. 판매자 거래 조건 (회의록 RAWDATA: MOQ, 견적 유효기간 픽스)
  const [defaultMoq, setDefaultMoq] = useState("최소 1박스 (약 10만원 이상)");
  const [validDays, setValidDays] = useState<string>("14일간 단가 보장 (2026.12.09까지)");
  const [deliveryTerms, setDeliveryTerms] = useState<string>("주 3회 직배송 (오전 06:00~08:00 콜드체인 입고)");
  const [paymentTerms, setPaymentTerms] = useState<string>("익월 10일 정산 (전자세금계산서 발행)");
  const [targetStoreName, setTargetStoreName] = useState("살롱순라 (종로구 익선동) 외 지역 사업장");

  // 공급자 정보 (마장동 공식 유통사)
  const supplierInfo = {
    company: "벨엘미트 (마장동 축산 도소매)",
    owner: "홍길동",
    bizNumber: "105-86-54321",
    address: "서울특별시 성동구 마장로33길 24 (마장축산물시장 서문)",
    phone: "02-2295-8841",
    quoteNo: `SB-QT-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-001`,
    date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
  };

  // 품목 토글
  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  };

  // 단가 직접 수정 (마장동 실무 엑셀 그리드 핵심)
  const updatePrice = (id: string, price: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, unitPrice: Math.max(0, price) } : it))
    );
  };

  // MOQ 직접 수정
  const updateMoq = (id: string, moq: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, moq } : it))
    );
  };

  // 행 삭제
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // 기타 품목 직접 추가
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newItem: SupplierMeatItem = {
      id: `custom-sup-${Date.now()}`,
      name: customName.trim(),
      spec: customSpec.trim() || "맞춤 규격 협의",
      origin: customOrigin,
      brand: customBrand,
      storage: "냉장",
      unitPrice: customPrice || 30000,
      moq: defaultMoq,
      checked: true,
    };

    setItems((prev) => [...prev, newItem]);
    setCustomName("");
    setCustomSpec("");
    setShowCustomInput(false);
  };

  const checkedItems = items.filter((it) => it.checked);
  const avgPrice = checkedItems.length > 0 ? Math.round(checkedItems.reduce((acc, c) => acc + c.unitPrice, 0) / checkedItems.length) : 0;

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 pb-24">
      {/* 1. 상단 글로벌 브랜딩 바 */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="홈으로 돌아가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">
                  판매자(납품 유통사) 전용
                </span>
                <span className="text-xs text-slate-400 font-bold">1·3·10 믹스 모델</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                자사 육류 단가 및 견적 직접 등록
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/supplier/catalog"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" /> 기존 단가표 보기
            </Link>
            <Link
              href="/"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              판매자 홈(영업 피칭)
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 진행 상태 프로그레스 바 (4단계) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { num: 1, title: "1. 품목 퀘스트", desc: "취급 육류 부위 다중선택" },
              { num: 2, title: "2. 공급조건 퀘스트", desc: "MOQ·유효기간 픽스" },
              { num: 3, title: "3. 마장동 엑셀 그리드", desc: "단가 직접 기입 & 편집" },
              { num: 4, title: "4. 실 견적서 발행", desc: "정식 견적서 발급·공유" },
            ].map((step) => {
              const isCurrent = currentStep === step.num;
              const isDone = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num as any)}
                  className={`p-3 rounded-xl text-left transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/30"
                      : isDone
                      ? "bg-emerald-50 text-emerald-950 border border-emerald-200"
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isCurrent ? "text-emerald-100" : isDone ? "text-emerald-700" : "text-slate-400"}`}>
                      {step.title}
                    </span>
                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className={`text-[11px] mt-1 truncate ${isCurrent ? "text-white" : isDone ? "text-emerald-800" : "text-slate-500"}`}>
                    {step.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            STEP 1: 숨고식 퀘스트 위저드 (취급 육류 부위 다중 선택 & 기타 추가)
            ======================================================== */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 animate-in fade-in space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 숨고식 퀘스트 Step 1 of 4
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                자사에서 공급 가능한 육류 부위를 모두 선택해 주세요
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                ※ 회의 결정 사항: 판매자는 월 사용량(kg)을 입력할 필요가 없으며, 취급 품목을 복수 선택 후 조건만 등록합니다.
              </p>
            </div>

            {/* 기타 직접 추가 인풋 토글 */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                선택된 품목: <strong>{checkedItems.length}개</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-emerald-400" /> 기타 품목 직접 추가
              </button>
            </div>

            {/* 기타 품목 직접 추가 폼 */}
            {showCustomInput && (
              <form
                onSubmit={handleAddCustom}
                className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    새로운 공급 부위 직접 추가 (회의록 필수 기능)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    닫기
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">품목명</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 우삼겹, 양지머리, 토마호크"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">세부 규격/스펙</label>
                    <input
                      type="text"
                      placeholder="예: 냉장 1kg 슬라이스 / 진공포장"
                      value={customSpec}
                      onChange={(e) => setCustomSpec(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">예상 납품단가 (원/kg)</label>
                    <input
                      type="number"
                      step={500}
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs"
                  >
                    품목에 추가
                  </button>
                </div>
              </form>
            )}

            {/* 카드 선택 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                    item.checked
                      ? "border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white opacity-75"
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {item.origin} · {item.brand}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${item.storage === "냉장" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {item.storage}
                      </span>
                    </div>
                    <h3 className="font-black text-base text-slate-900 mt-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 leading-snug">{item.spec}</p>
                    <div className="text-xs font-extrabold text-emerald-700 mt-2">
                      기준단가: {item.unitPrice.toLocaleString()}원/kg
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition ${
                      item.checked
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "border-2 border-slate-300 text-transparent"
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 네비게이션 */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              <span className="text-xs font-bold text-slate-500">
                총 <strong>{checkedItems.length}개</strong> 품목 선택 완료
              </span>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={checkedItems.length === 0}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                다음: 공급 조건 & 유효기간 설정 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: 공급 거래 조건 (회의록 RAWDATA: MOQ & 견적 유효기간 픽스)
            ======================================================== */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 animate-in fade-in space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" /> 숨고식 퀘스트 Step 2 of 4
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                납품 조건 (MOQ) 및 견적서 유효기간을 확정해 주세요
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                ※ 회의록 합의: &quot;견적 넣는 판매자가 이 견적서가 유효한 기간에 대한 설정을 할 수 있게끔 반영하고, MOQ를 설정한다.&quot;
              </p>
            </div>

            <div className="space-y-6 max-w-3xl text-xs sm:text-sm">
              {/* 1. MOQ 최소 주문 단위 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block font-black text-slate-900 text-sm">
                  1) 최소 주문 수량/금액 (MOQ)
                </label>
                <p className="text-xs text-slate-500">
                  외식업체가 1회 주문 시 맞춰야 하는 최소 규격을 선택하거나 직접 입력하세요.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {[
                    "최소 1박스 (약 10만원 이상)",
                    "최소 2박스 (약 30kg 이상)",
                    "1회 주문 30만원 이상 무료배송",
                  ].map((moqOpt) => (
                    <button
                      key={moqOpt}
                      type="button"
                      onClick={() => setDefaultMoq(moqOpt)}
                      className={`p-3 rounded-xl border text-left font-bold text-xs transition ${
                        defaultMoq === moqOpt
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {moqOpt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 견적 유효 기간 픽스 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-black text-slate-900 text-sm">
                    2) 견적 유효 기간 (단가 보증 기간) ★회의 필수 반영
                  </label>
                  <span className="text-[11px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded">
                    단가 보증제
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  축산물 시세 변동을 감안하여 제출하는 견적 단가를 고정 보장하는 기간입니다.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {[
                    "7일간 단가 보장 (2026.12.02까지)",
                    "14일간 단가 보장 (2026.12.09까지)",
                    "30일간 단가 보장 (2026.12.25까지)",
                  ].map((daysOpt) => (
                    <button
                      key={daysOpt}
                      type="button"
                      onClick={() => setValidDays(daysOpt)}
                      className={`p-3 rounded-xl border text-left font-bold text-xs transition ${
                        validDays === daysOpt
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {daysOpt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 배송 및 콜드체인 조건 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block font-black text-slate-900 text-sm">
                  3) 물류 및 콜드체인 배송 주기
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {[
                    "주 3회 직배송 (오전 06:00~08:00 콜드체인)",
                    "주 6회 새벽 직배송 (월~토 매일 아침)",
                    "주 2회 정기 직배송 (화·목 지정시간)",
                  ].map((delOpt) => (
                    <button
                      key={delOpt}
                      type="button"
                      onClick={() => setDeliveryTerms(delOpt)}
                      className={`p-3 rounded-xl border text-left font-bold text-xs transition ${
                        deliveryTerms === delOpt
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {delOpt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 하단 진행 버튼 */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> 이전 단계
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                다음: 마장동 실무 엑셀 그리드로 단가 확인 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: 마장동 실무 엑셀 그리드 (회의록 3번 도안 실사판)
            ======================================================== */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200 animate-in fade-in space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> 도안 3번 실사판: 마장동 실무 엑셀 그리드
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    축산물 실무 납품 단가표 (Excel Matrix)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    회의록 합의: &quot;원산지까지 기본 정보가 기재되어 있고, 우측 초록색 셀에 판매자가 단가만 써서 제출하면 견적서가 완성되는 구조&quot;
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                    선택 품목: <strong>{checkedItems.length}종</strong>
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    평균 공급단가: {avgPrice.toLocaleString()}원/kg
                  </span>
                </div>
              </div>
            </div>

            {/* 마장동 실무 엑셀 테이블 */}
            <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-2xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200 select-none">
                      <th className="py-3 px-3 w-10 text-center border-r border-slate-200">#</th>
                      <th className="py-3 px-3 min-w-[120px] border-r border-slate-200">품목명</th>
                      <th className="py-3 px-3 min-w-[180px] border-r border-slate-200">세부 스펙 / 부위</th>
                      <th className="py-3 px-3 min-w-[80px] border-r border-slate-200">원산지</th>
                      <th className="py-3 px-3 min-w-[90px] border-r border-slate-200">브랜드</th>
                      <th className="py-3 px-3 min-w-[70px] border-r border-slate-200 text-center">보관</th>
                      <th className="py-3 px-3 min-w-[150px] border-r border-slate-200 bg-emerald-100/60 text-emerald-950 font-black">
                        ★ kg당 공급 단가 (원) [수정가능]
                      </th>
                      <th className="py-3 px-3 min-w-[120px] border-r border-slate-200">MOQ 단위</th>
                      <th className="py-3 px-3 min-w-[140px] border-r border-slate-200">견적 유효기간</th>
                      <th className="py-3 px-3 w-14 text-center">관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {checkedItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-emerald-50/20 transition group">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono border-r border-slate-200 bg-slate-50/40">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900 border-r border-slate-200">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                          {item.spec}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">
                          {item.origin}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200 font-semibold">
                          {item.brand}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.storage === "냉장"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {item.storage}
                          </span>
                        </td>
                        {/* 초록색 수정 가능 단가 인풋 셀 */}
                        <td className="py-1.5 px-2 border-r border-slate-200 bg-emerald-50/50">
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-700 font-bold text-xs">₩</span>
                            <input
                              type="number"
                              step={500}
                              value={item.unitPrice}
                              onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                              className="w-full px-2 py-1.5 bg-white border border-emerald-400 rounded-lg font-black text-emerald-950 text-sm focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                            />
                            <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap">/kg</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                          <input
                            type="text"
                            value={item.moq || defaultMoq}
                            onChange={(e) => updateMoq(item.id, e.target.value)}
                            className="w-full px-1.5 py-1 bg-transparent border-0 border-b border-dashed border-slate-300 focus:border-emerald-500 focus:outline-hidden text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 border-r border-slate-200 text-[11px]">
                          {validDays}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                            title="행 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 안내 팁 */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 leading-relaxed">
                <strong>마장동 유통사 실무 팁:</strong> 초록색 단가 셀의 수치를 수정하면 살롱순라 등 구매자 견적 비교표(행복쇼핑 뷰)에 실시간 최저가 경쟁 업체로 자동 반영됩니다.
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> 이전 단계
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2"
              >
                최종 단계: 정식 실 견적서(10번) 발급 및 확인 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: 실 견적서 발급 및 거래처 제안 (회의록 10번 미니멀 견적서 양식)
            ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            {/* 상단 액션 바 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  도안 10번 양식
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  공식 축산물 납품 견적서 발행 완료
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-500" /> 견적서 인쇄 / PDF 저장
                </button>
                <button
                  onClick={() => alert("견적서 링크가 클립보드에 복사되었습니다. 카카오톡/문자로 공유하세요!")}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4" /> 살롱순라에 즉시 제출
                </button>
              </div>
            </div>

            {/* 정식 견적서 페이퍼 뷰 (10번 미니멀 견적서 디자인) */}
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-md border border-slate-200 max-w-4xl mx-auto space-y-8 font-sans">
              {/* 견적서 헤더 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-6 gap-4">
                <div>
                  <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">
                    Selfbuyer B2B Meat Quotation
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                    축산물 납품 견적서
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">견적 번호: {supplierInfo.quoteNo}</p>
                </div>

                <div className="text-right text-xs space-y-1">
                  <p className="text-slate-500">발행 일자: <strong>{supplierInfo.date}</strong></p>
                  <p className="text-emerald-700 font-bold">유효 기간: {validDays}</p>
                </div>
              </div>

              {/* 공급자 & 수신자 인포 박스 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* 공급받는자 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    [공급받는 자 (외식 매장)]
                  </span>
                  <div className="space-y-1 text-slate-700">
                    <p className="text-base font-black text-slate-900">{targetStoreName}</p>
                    <p>사업장 위치: 서울특별시 종로구 익선동</p>
                    <p>소싱 담당: 총괄 셰프 / 점주 귀하</p>
                    <p>배송 요청: {deliveryTerms}</p>
                  </div>
                </div>

                {/* 공급자 */}
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2 relative">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    [공급자 (마장동 축산물 납품사)]
                  </span>
                  <div className="space-y-1 text-slate-700">
                    <p className="text-base font-black text-slate-900 flex items-center justify-between">
                      {supplierInfo.company}
                      {/* 마장동 직인 심볼 */}
                      <span className="inline-block border-2 border-red-600 text-red-600 font-serif font-black text-[10px] px-1.5 py-0.5 rounded rotate-[-6deg]">
                        벨엘印
                      </span>
                    </p>
                    <p>대표자: {supplierInfo.owner} · 사업자등록번호: {supplierInfo.bizNumber}</p>
                    <p>사업장: {supplierInfo.address}</p>
                    <p>대표전화: {supplierInfo.phone}</p>
                  </div>
                </div>
              </div>

              {/* 견적 품목 표 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black">
                    <tr>
                      <th className="py-2.5 px-3 text-center w-10">No</th>
                      <th className="py-2.5 px-3 text-left">품목 및 스펙</th>
                      <th className="py-2.5 px-3 text-left">원산지/브랜드</th>
                      <th className="py-2.5 px-3 text-center">보관</th>
                      <th className="py-2.5 px-3 text-right">kg당 견적 단가</th>
                      <th className="py-2.5 px-3 text-left">최소 발주 규격 (MOQ)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {checkedItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-extrabold text-slate-900">
                          {item.name}
                          <span className="block text-[11px] font-normal text-slate-500">{item.spec}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{item.origin} / {item.brand}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {item.storage}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900 text-sm">
                          {item.unitPrice.toLocaleString()}원
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">{item.moq || defaultMoq}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 거래 약관 및 납품 안내 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <h4 className="font-bold text-slate-800">[특약 및 납품 조건]</h4>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  <li><strong>배송 조건:</strong> {deliveryTerms}</li>
                  <li><strong>결제 방식:</strong> {paymentTerms}</li>
                  <li><strong>단가 보증:</strong> 본 견적서는 제시된 유효기간({validDays}) 동안 고정 공급됩니다.</li>
                  <li><strong>품질 보증:</strong> 축산물 위생관리법 기준 콜드체인 온도 준수 및 문제 발생 시 100% 당일 맞교환 보장.</li>
                </ul>
              </div>

              {/* 견적서 하단 서명란 */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <span className="text-slate-400">
                  플랫폼 검증 인증: <strong>selfbuyer Verified Supplier</strong>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                  >
                    단가 재수정하기
                  </button>
                  <Link
                    href="/"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs transition"
                  >
                    완료 후 메인으로
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
