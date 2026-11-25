"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  PhoneCall,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  QrCode,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react";

interface MeatItem {
  id: string;
  category: string;
  badge: string;
  name: string;
  spec: string;
  qty: number;
  unit: string;
  lowestPrice: number;
  prices: {
    [supplierId: string]: number;
  };
}

export function HaengbokMeatCompare({
  initialItems,
  onBackToQuest,
}: {
  initialItems?: any[];
  onBackToQuest?: () => void;
}) {
  const [tabType, setTabType] = useState<"general" | "card">("general");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [contractSuccessModal, setContractSuccessModal] = useState<string | null>(null);
  const [consultModal, setConsultModal] = useState<string | null>(null);

  // 행복쇼핑 참여 유통사 목록 (마장동 공식 유통사들)
  const suppliers = [
    {
      id: "sup-1",
      name: "벨엘미트 (마장동)",
      badge: "파워셀러 ⓘ",
      rating: "99점",
      type: "카드/일반",
      deliveryDate: "11/26 (목) 직송",
      deliveryTime: "익선동 새벽 05:00",
      shippingFee: "무료 배송",
      reward: "결제금액 0.2%",
      isBest: true,
      moq: "10만원",
    },
    {
      id: "sup-2",
      name: "피씨미트 (마장축산)",
      badge: "톡톡 커뮤니티 인증 ⓘ",
      rating: "96점",
      type: "일반",
      deliveryDate: "11/26 (목) 직송",
      deliveryTime: "종로구 아침 06:30",
      shippingFee: "배송비 3,500원",
      reward: "결제금액 0.2%",
      moq: "15만원",
    },
    {
      id: "sup-3",
      name: "케이메모리 (성동케이미트)",
      badge: "파워셀러 ⓘ",
      rating: "97점",
      type: "일반",
      deliveryDate: "11/26 (목) 직송",
      deliveryTime: "종로구 오전 07:00",
      shippingFee: "무료 배송",
      reward: "결제금액 0.2%",
      moq: "10만원",
    },
    {
      id: "sup-4",
      name: "마트컴 (한결축산F&B)",
      badge: "인증 셀러",
      rating: "96점",
      type: "일반",
      deliveryDate: "11/26 (목) 직송",
      deliveryTime: "오전 08:00 배송",
      shippingFee: "무료 배송",
      reward: "결제금액 0.2%",
      moq: "20만원",
    },
    {
      id: "sup-5",
      name: "앤케이미트 (도축직송)",
      badge: "공식 납품사",
      rating: "98점",
      type: "일반",
      deliveryDate: "11/27 (금) 발송",
      deliveryTime: "새벽 직배송",
      shippingFee: "무료 배송",
      reward: "결제금액 0.2%",
      moq: "10만원",
    },
    {
      id: "sup-6",
      name: "마장도매 (동양축산)",
      badge: "특가몰",
      rating: "95점",
      type: "카드",
      deliveryDate: "11/26 (목) 발송",
      deliveryTime: "오전 직송",
      shippingFee: "배송비 5,000원",
      reward: "결제금액 0.1%",
      moq: "15만원",
    },
  ];

  // 살롱순라 실견적 품목 기반 기본 견적 테이블
  const [items, setItems] = useState<MeatItem[]>([
    {
      id: "meat-1",
      category: "우육 (냉장)",
      badge: "재고인증",
      name: "초이스 냉장 살치살 (미국산 EXCEL 1kg)",
      spec: "CH등급 스테이크용 / 냉장 진공팩",
      qty: 150,
      unit: "kg",
      lowestPrice: 32500,
      prices: {
        "sup-1": 32500, // 벨엘미트 최저가
        "sup-2": 33500,
        "sup-3": 33000,
        "sup-4": 33000,
        "sup-5": 33500,
        "sup-6": 34500,
      },
    },
    {
      id: "meat-2",
      category: "우육 (냉장)",
      badge: "재고인증",
      name: "프라임 냉장 알목심 (미국산 EXCEL 척아이롤)",
      spec: "PR등급 로스구이·스테이크 / 냉장 1kg",
      qty: 200,
      unit: "kg",
      lowestPrice: 25900,
      prices: {
        "sup-1": 25900, // 벨엘미트 최저가
        "sup-2": 27000,
        "sup-3": 26500,
        "sup-4": 26500,
        "sup-5": 26800,
        "sup-6": 27500,
      },
    },
    {
      id: "meat-3",
      category: "우육 (냉장)",
      badge: "재고인증",
      name: "AMH 냉장 S안심 (호주산 텐더로인 1kg)",
      spec: "S등급 스테이크용 1kg 진공팩",
      qty: 80,
      unit: "kg",
      lowestPrice: 44000,
      prices: {
        "sup-1": 44000,
        "sup-2": 45000,
        "sup-3": 44500,
        "sup-4": 44000,
        "sup-5": 44000,
        "sup-6": 46000,
      },
    },
    {
      id: "meat-4",
      category: "우육 (동결)",
      badge: "재고인증",
      name: "TEYS 호주산 GF곡물채끝 (동결 스트립로인)",
      spec: "GF등급 스트립로인 / 동결 진공포장",
      qty: 100,
      unit: "kg",
      lowestPrice: 28500,
      prices: {
        "sup-1": 28500, // 벨엘미트 최저가
        "sup-2": 31000,
        "sup-3": 29500,
        "sup-4": 29900,
        "sup-5": 28900,
        "sup-6": 32000,
      },
    },
    {
      id: "meat-5",
      category: "세절육",
      badge: "재고인증",
      name: "초이스 차돌박이 (미국산 2mm 세절팩)",
      spec: "CH등급 2mm 세절 급랭팩 1kg",
      qty: 70,
      unit: "kg",
      lowestPrice: 20000,
      prices: {
        "sup-1": 20000, // 벨엘미트 최저가
        "sup-2": 22000,
        "sup-3": 21000,
        "sup-4": 20500,
        "sup-5": 21500,
        "sup-6": 23000,
      },
    },
  ]);

  // 수량 변경 함수
  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: Math.max(10, it.qty + delta) } : it))
    );
  };

  // 품목 삭제 함수
  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // 각 업체별 총 견적금액 계산
  const getSupplierTotal = (supId: string) => {
    return items.reduce((acc, it) => {
      const price = it.prices[supId] || it.lowestPrice;
      return acc + it.qty * price;
    }, 0);
  };

  // 전체 최저가 총 견적금액 (각 품목별 최저가 합산)
  const totalLowestPrice = items.reduce((acc, it) => acc + it.qty * it.lowestPrice, 0);

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[#333333] font-sans pb-16">
      {/* 1. 상단 행복쇼핑 스타일 검색 및 유틸 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 좌측 로고 & 슬로건 */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-1.5">
              <span className="text-2xl font-black text-[#E11D48] tracking-tighter">행복</span>
              <span className="text-2xl font-black text-[#2563EB] tracking-tighter">식탁</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold ml-1">
                셀프바이어 B2B
              </span>
            </Link>
          </div>

          {/* 중앙 검색창 (행복쇼핑 싱크로율 100%) */}
          <div className="flex-1 max-w-xl w-full">
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value="원가는 낮추고, 신선도는 높이다. 살롱순라 익선동 매장 맞춤 육류 견적비교"
                className="w-full pl-4 pr-24 py-2 border-2 border-[#2563EB] rounded-sm text-xs sm:text-sm font-semibold bg-white focus:outline-none"
              />
              <button className="absolute right-0 top-0 bottom-0 px-4 bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                <Search className="w-4 h-4 mr-1" /> 검색
              </button>
            </div>
          </div>

          {/* 우측 바로가기 */}
          <div className="flex items-center space-x-4 text-xs font-semibold text-gray-600">
            {onBackToQuest && (
              <button
                onClick={onBackToQuest}
                className="px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold border border-blue-200 transition"
              >
                ← 견적 요청서(3스텝)로 돌아가기
              </button>
            )}
            <div className="flex items-center space-x-1">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              <span>장바구니 <strong>{items.length}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 대제목 & 배너 바 */}
      <div className="max-w-[1400px] mx-auto px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              미니샵별 견적비교
            </h1>
            <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
              마장동 공식 유통사 실시간 역경매
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="text-xs text-gray-600 border border-gray-300 px-3 py-1 rounded bg-white hover:bg-gray-50 flex items-center gap-1 font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            엑셀/인쇄 저장
          </button>
        </div>

        {/* 상단 프로모션 배너 (행복쇼핑 배너 벤치마킹) */}
        <div className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 rounded-sm p-4 text-slate-900 flex items-center justify-between shadow-xs mb-4">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 bg-slate-950 text-yellow-300 font-black text-sm rounded">
              단가보장제
            </span>
            <div>
              <p className="font-black text-base sm:text-lg tracking-tight">
                최대 3개월 고정 단가 보증 프로모션 · 불시 인상 시 차액 100% 현금 보상
              </p>
              <p className="text-xs font-semibold text-slate-800">
                살롱순라 전용 마장동 콜드체인 직배송 파트너 6개사 동시 견적 제출 완료
              </p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-xs font-bold text-slate-800 block">다양한 규격의 업소용 육류를</span>
            <span className="text-sm font-black text-slate-950">부담 없이 직거래하세요</span>
          </div>
        </div>

        {/* 견적 탭 (일반전문몰 견적 vs 카드전문몰 견적) */}
        <div className="flex border-b-2 border-[#2563EB]">
          <button
            onClick={() => setTabType("general")}
            className={`px-8 py-3 font-black text-sm border-t-2 border-x-2 rounded-t-sm transition-all flex items-center space-x-2 ${
              tabType === "general"
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>₩ 일반전문몰 (세금계산서/현금) 견적</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded bg-white/20 text-white font-normal">
              최저가 추천
            </span>
          </button>
          <button
            onClick={() => setTabType("card")}
            className={`px-8 py-3 font-black text-sm border-t-2 border-x-2 rounded-t-sm transition-all flex items-center space-x-2 ml-1 ${
              tabType === "card"
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>💳 카드전문몰 견적</span>
          </button>
        </div>
      </div>

      {/* 3. 메인 견적 비교 테이블 (행복쇼핑 캡처 이미지 그대로 100% 일치) */}
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Page 1: 종합 비교 매트릭스 */}
        {currentPage === 1 && (
          <div className="bg-white border border-gray-300 shadow-sm overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                {/* 1행 헤더: 왼쪽 상품 영역 헤더 + 오른쪽 유통사(미니샵) 정보 헤더 */}
                <tr className="bg-[#F1F3F5] border-b border-gray-300 text-gray-700">
                  <th className="py-2.5 px-2 border-r border-gray-300 font-bold w-14 text-center">분류</th>
                  <th className="py-2.5 px-3 border-r border-gray-300 font-bold text-center min-w-[240px]">상품명</th>
                  <th className="py-2.5 px-2 border-r border-gray-300 font-bold w-16 text-center">수량(kg)</th>
                  <th className="py-2.5 px-3 border-r-2 border-blue-500 font-bold w-24 text-center bg-blue-50/50">
                    최저 견적금액
                  </th>

                  {/* 6개 유통사(미니샵) 헤더 컬럼 */}
                  {suppliers.map((sup, idx) => (
                    <th
                      key={sup.id}
                      className={`p-2 border-r border-gray-300 min-w-[130px] text-center align-top ${
                        sup.isBest ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                      }`}
                    >
                      <div className="text-[10px] font-medium opacity-90">{sup.badge}</div>
                      <div className="font-extrabold text-xs sm:text-sm mt-0.5 truncate">{sup.name}</div>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-white/90">
                        <span className="px-1 py-0.2 rounded bg-black/20">{sup.type}</span>
                        <span className="px-1 py-0.2 rounded bg-black/20">후기 {sup.rating}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 hover:bg-yellow-50/40 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                    }`}
                  >
                    {/* 분류 */}
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center font-bold text-blue-600">
                      {item.category}
                    </td>

                    {/* 상품명 & 스펙 */}
                    <td className="py-2.5 px-3 border-r border-gray-200 text-left">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.2 text-[10px] rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                          {item.badge}
                        </span>
                        <span className="font-bold text-gray-800 text-xs sm:text-[13px]">{item.name}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{item.spec}</div>
                    </td>

                    {/* 수량 조절 버튼 (행복쇼핑 [ 150 ] ▲▼ 그대로 재현) */}
                    <td className="py-2.5 px-2 border-r border-gray-200 text-center">
                      <div className="inline-flex items-center border border-gray-300 rounded bg-white">
                        <input
                          type="text"
                          readOnly
                          value={item.qty}
                          className="w-10 text-center text-xs font-bold text-gray-800 focus:outline-none"
                        />
                        <div className="flex flex-col border-l border-gray-200">
                          <button
                            onClick={() => updateQty(item.id, 10)}
                            className="px-1 py-0.5 hover:bg-gray-100 text-[9px] text-gray-600 font-bold border-b border-gray-200"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => updateQty(item.id, -10)}
                            className="px-1 py-0.5 hover:bg-gray-100 text-[9px] text-gray-600 font-bold"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* 최저 견적단가 & 삭제버튼 */}
                    <td className="py-2.5 px-2 border-r-2 border-blue-500 text-right bg-blue-50/20 font-bold">
                      <div className="flex items-center justify-end space-x-1.5">
                        <span className="text-rose-600 font-black">
                          {item.lowestPrice.toLocaleString()}원
                        </span>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-gray-400 hover:text-rose-600 p-0.5 rounded transition"
                          title="품목 제외"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        소계 {(item.lowestPrice * item.qty).toLocaleString()}원
                      </div>
                    </td>

                    {/* 각 유통사별 납품 단가 셀 */}
                    {suppliers.map((sup) => {
                      const price = item.prices[sup.id] || item.lowestPrice;
                      const isLowest = price === item.lowestPrice;

                      return (
                        <td
                          key={sup.id}
                          className={`py-2.5 px-2 border-r border-gray-200 text-center align-middle font-bold ${
                            isLowest ? "bg-red-50/40" : ""
                          }`}
                        >
                          <span
                            className={
                              isLowest
                                ? "text-red-600 font-black text-sm"
                                : "text-gray-700 text-xs"
                            }
                          >
                            {price.toLocaleString()}원
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 테이블 하단 유통사별 배송/정책 정보 행 (행복쇼핑 캡처 싱크로율 100%) */}
                <tr className="bg-[#F8F9FA] border-t-2 border-gray-300 text-[11px] text-gray-600">
                  <td colSpan={4} className="p-3 border-r-2 border-blue-500 text-right">
                    <div className="space-y-1 font-semibold text-gray-500">
                      <div>미니샵 포인트 정책</div>
                      <div>발송/배송 예정일</div>
                      <div>미니샵 배송정책 (배송비)</div>
                    </div>
                  </td>
                  {suppliers.map((sup) => (
                    <td key={sup.id} className="p-2 border-r border-gray-200 text-center align-top leading-tight">
                      <div className="space-y-1 font-semibold">
                        <div className="text-blue-600">{sup.reward}</div>
                        <div className="text-red-600 font-bold">{sup.deliveryDate}</div>
                        <div className="text-gray-500 text-[10px]">{sup.deliveryTime}</div>
                        <div className="text-gray-700">{sup.shippingFee}</div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 총 견적금액 행 (빨간색 거대 볼드 표시) */}
                <tr className="bg-white border-t-2 border-gray-300">
                  <td colSpan={4} className="py-4 px-4 border-r-2 border-blue-500 text-right align-middle">
                    <span className="text-base sm:text-lg font-black text-gray-800 mr-2">
                      총 견적금액 (최저가 기준)
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-red-600">
                      {totalLowestPrice.toLocaleString()}원
                    </span>
                  </td>

                  {/* 각 업체별 최종 총 견적금액 */}
                  {suppliers.map((sup) => {
                    const total = getSupplierTotal(sup.id);
                    const isLowest = total === totalLowestPrice;

                    return (
                      <td key={sup.id} className="p-2 border-r border-gray-200 text-center align-middle bg-blue-50/20">
                        <div className={`font-black text-sm sm:text-base ${isLowest ? "text-red-600" : "text-blue-900"}`}>
                          {total.toLocaleString()}
                        </div>
                        {isLowest && (
                          <span className="text-[10px] font-bold text-red-600 block">
                            ★ 최저가 1위
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 구매하기 / 견적상담하기 버튼 행 (행복쇼핑 버튼 색상 및 형태 100% 재현) */}
                <tr className="bg-white border-t border-gray-200">
                  <td colSpan={4} className="p-2 border-r-2 border-blue-500 bg-gray-50 text-center text-xs text-gray-500 font-semibold">
                    유통사 발주 및 1:1 견적 상담
                  </td>
                  {suppliers.map((sup) => (
                    <td key={sup.id} className="p-2 border-r border-gray-200 text-center align-middle space-y-1.5">
                      <button
                        onClick={() => setContractSuccessModal(sup.name)}
                        className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs rounded-xs shadow-xs transition"
                      >
                        구매(발주)하기
                      </button>
                      <button
                        onClick={() => setConsultModal(sup.name)}
                        className="w-full py-1.5 bg-[#0284C7] hover:bg-sky-700 text-white font-bold text-[11px] rounded-xs transition"
                      >
                        견적상담하기
                      </button>
                      <div className="flex flex-col gap-0.5 pt-1 text-[9px] text-gray-500 font-semibold">
                        <span className="inline-block py-0.5 px-1 bg-gray-100 rounded border border-gray-200">
                          ⚙ 축산물이력인증
                        </span>
                        <span className="inline-block py-0.5 px-1 bg-gray-100 rounded border border-gray-200">
                          🧾 세금계산서/현금영수증
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Page 2~4: 개별 업체 정식 견적서 엑셀 양식 원본 뷰 */}
        {currentPage > 1 && (
          <div className="bg-white border border-gray-300 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">
                  정식 견적서 원본 열람 ({currentPage}/4)
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-1">
                  {suppliers[currentPage - 2]?.name} 공식 납품 견적서
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  수신: (주)제이앤파트너스코리아 (살롱순라, 더베르지, 퍼블릭도원) · 담당: 총괄 쉐프
                </p>
              </div>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded"
              >
                ← 전체 비교표로 돌아가기
              </button>
            </div>

            {/* 실제 마장동 견적서 엑셀 디자인 */}
            <div className="border-2 border-slate-700 max-w-4xl mx-auto p-4 bg-white">
              <div className="text-center py-4 border-b-2 border-slate-700">
                <h3 className="text-2xl font-black tracking-widest text-slate-900">견 적 서</h3>
                <p className="text-xs text-slate-600 mt-1">아래와 같이 성실히 견적합니다.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-b text-xs">
                <div>
                  <p><strong>수신:</strong> (주)제이앤파트너스코리아 (살롱순라)</p>
                  <p><strong>품명:</strong> 업소용 우육/스테이크용 원육</p>
                  <p><strong>견적일자:</strong> 2026.11.25 (유효기간: 30일)</p>
                </div>
                <div className="text-right">
                  <p><strong>공급자:</strong> {suppliers[currentPage - 2]?.name}</p>
                  <p><strong>사업자등록번호:</strong> 258-40-00129</p>
                  <p><strong>소재지:</strong> 서울시 성동구 마장로27길 6</p>
                  <p><strong>담당 연락처:</strong> 010-7475-7410</p>
                </div>
              </div>

              <table className="w-full text-xs mt-3 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-y border-slate-700 text-slate-800">
                    <th className="p-2 border-r text-center">품목명 및 규격</th>
                    <th className="p-2 border-r text-center">원산지/브랜드</th>
                    <th className="p-2 border-r text-center">수량(kg)</th>
                    <th className="p-2 border-r text-center">공급단가(원/kg)</th>
                    <th className="p-2 text-center">합계금액(원)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const price = it.prices[suppliers[currentPage - 2]?.id] || it.lowestPrice;
                    return (
                      <tr key={it.id} className="border-b text-center">
                        <td className="p-2 border-r text-left font-bold">{it.name}</td>
                        <td className="p-2 border-r text-slate-600">{it.spec}</td>
                        <td className="p-2 border-r font-bold">{it.qty} kg</td>
                        <td className="p-2 border-r text-right font-black text-blue-700">
                          {price.toLocaleString()}원
                        </td>
                        <td className="p-2 text-right font-bold">
                          {(price * it.qty).toLocaleString()}원
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-black text-sm">
                    <td colSpan={4} className="p-3 text-right border-r">총 견적금액 (VAT 별도)</td>
                    <td className="p-3 text-right text-red-600 text-base">
                      {getSupplierTotal(suppliers[currentPage - 2]?.id).toLocaleString()}원
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 하단 페이징 바: [ < ] 1/4 [ > ] (행복쇼핑 스타일 그대로) */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <button
            onClick={() => setCurrentPage(1)}
            className="text-xs font-bold text-gray-700 border border-gray-300 px-3 py-1.5 rounded bg-white hover:bg-gray-50"
          >
            PC견적으로 이동
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 text-blue-600 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-gray-800 px-3 py-1 rounded bg-white border border-gray-200">
              {currentPage} / 4
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(4, prev + 1))}
              disabled={currentPage === 4}
              className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 text-blue-600 font-bold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-gray-500 font-semibold">
            {currentPage === 1 ? "1페이지: 전체 종합비교표" : `${currentPage}페이지: 상세 견적서 원본`}
          </div>
        </div>

        {/* 4. 하단 부가 서비스 영역 (행복쇼핑 기본 조립 / 프리미엄 조립 / 정품 설치 박스 100% 벤치마킹) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* 1) 기본 조립 서비스 -> 기본 가공/세절 서비스 */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs">
            <h4 className="font-black text-sm text-gray-900 border-b pb-2 mb-3">
              기본 가공 / 세절 서비스
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">기본 스테이크 컷팅 (1kg분)</span>
                <span className="font-bold text-blue-600">+ 1,000원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">구이용 슬라이스 세절 (1kg분)</span>
                <span className="font-bold text-blue-600">+ 1,500원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">1kg 개별 진공 스킨 포장</span>
                <span className="font-bold text-blue-600">+ 2,000원</span>
              </div>
            </div>
          </div>

          {/* 2) 프리미엄 조립 서비스 -> 프리미엄 숙성 서비스 */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs">
            <h4 className="font-black text-sm text-gray-900 border-b pb-2 mb-3">
              프리미엄 숙성 서비스 (웻에이징/드라이)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">14일 웻에이징 정밀 숙성</span>
                <span className="font-bold text-blue-600">+ 40,000원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">맞춤 드라이에이징 (1박스분)</span>
                <span className="font-bold text-blue-600">+ 60,000원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">콜드체인 냉장 임시 보관 (1주일)</span>
                <span className="font-bold text-blue-600">+ 20,000원</span>
              </div>
            </div>
          </div>

          {/* 3) 정품 설치 서비스 -> 정품/단가보증 서비스 */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs">
            <h4 className="font-black text-sm text-gray-900 border-b pb-2 mb-3">
              정품 / 단가보증 안심 서비스
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">축산물 이력번호 추적 확인서</span>
                <span className="font-bold text-emerald-600">무료 제공</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">3개월 단가 동결 보증제</span>
                <span className="font-bold text-emerald-600">기본 적용</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">불시 단가 인상 시 차액 100% 보상</span>
                <span className="font-bold text-blue-600">+ 10,000원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. 하단 배너 & 꼭 확인하세요 (행복쇼핑 캡처 하단 영역) */}
        <div className="mt-8 bg-white border border-gray-200 rounded p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs text-blue-600 font-bold">업소용 식자재를 싸게 사는 방법</span>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              셀프바이어 B2B 육류 도매 견적 서비스
            </h3>
            <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
              살롱순라처럼 사용하는 품목과 예상 소요량만 올려두시면, 마장동 공인 납품사들이 직접
              최저가로 역제안하여 매달 최대 24%의 원가를 절감해 드립니다.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-4 max-w-sm w-full text-xs space-y-1.5">
            <div className="font-black text-gray-800 text-sm mb-1">꼭 확인하세요!</div>
            <p className="text-gray-600 leading-tight">
              ① 모든 육류는 도축 및 수입 통관 정품이며 이력번호 조회가 가능합니다.
            </p>
            <p className="text-gray-600 leading-tight">
              ② 세금계산서 의무 발행 및 종로구/익선동 새벽 콜드체인 직배송을 보장합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 모달 1: 발주/계약 체결 성공 알림 모달 */}
      {contractSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900">
              {contractSuccessModal} 발주 계약 체결 완료!
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              살롱순라 정기 납품 발주서가 해당 유통사로 전송되었습니다. 
              콜드체인 새벽 직송 일정에 맞춰 신선하게 배송됩니다.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 mt-4 text-xs text-left space-y-1">
              <div>• <strong>공급업체:</strong> {contractSuccessModal}</div>
              <div>• <strong>납품품목:</strong> 살치살, 알목심, S안심, TEYS채끝, 차돌박이</div>
              <div>• <strong>월 정산금액:</strong> {totalLowestPrice.toLocaleString()}원 (VAT 별도)</div>
              <div>• <strong>배송일정:</strong> 매주 월/수/금 새벽 05:00 익선동 직송</div>
            </div>
            <button
              onClick={() => setContractSuccessModal(null)}
              className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}

      {/* 모달 2: 견적 상담 팝업 */}
      {consultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-gray-900">
              {consultModal} 1:1 직통 견적 상담
            </h3>
            <p className="text-xs text-gray-600 mt-2">
              유통사 영업팀장과 직접 통화하거나 맞춤 단가/결제조건을 협의할 수 있습니다.
            </p>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 mt-4 text-xs text-blue-900 font-bold">
              📞 직통 전화: 010-7475-7410 (김지선 대표)
            </div>
            <button
              onClick={() => setConsultModal(null)}
              className="w-full mt-5 py-2.5 bg-gray-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
