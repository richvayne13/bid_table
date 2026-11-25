"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Camera,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";

export function BuyerHomeDashboard() {
  const [basket, setBasket] = useState([
    { id: "1", name: "초이스 냉장 살치살 (미국산 EXCEL)", qty: 150, currentPrice: 35000, targetPrice: 32500, checked: true },
    { id: "2", name: "프라임 냉장 알목심 (미국산 EXCEL 척아이롤)", qty: 200, currentPrice: 28000, targetPrice: 25900, checked: true },
    { id: "3", name: "호주산 AMH S안심 (냉장 1kg 진공팩)", qty: 80, currentPrice: 48000, targetPrice: 44000, checked: true },
    { id: "4", name: "호주산 TEYS GF채끝 (동결 스트립로인)", qty: 100, currentPrice: 33000, targetPrice: 28500, checked: true },
    { id: "5", name: "초이스 차돌박이 (미국산 세절팩)", qty: 70, currentPrice: 24000, targetPrice: 20000, checked: true },
  ]);

  // 로컬 스토리지에서 이전 입력 수량 동기화
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("selfbuyer_basket");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBasket(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveBasket = (updated: typeof basket) => {
    setBasket(updated);
    try {
      localStorage.setItem("selfbuyer_basket", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const [rfqSent, setRfqSent] = useState(false);
  const [showOcrResult, setShowOcrResult] = useState(false);

  const toggleCheck = (id: string) => {
    const updated = basket.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveBasket(updated);
  };

  const updateQty = (id: string, delta: number) => {
    const updated = basket.map((item) =>
      item.id === id ? { ...item, qty: Math.max(10, item.qty + delta) } : item
    );
    saveBasket(updated);
  };

  const setQtyDirect = (id: string, newQty: number) => {
    const val = isNaN(newQty) ? 0 : Math.max(0, newQty);
    const updated = basket.map((item) =>
      item.id === id ? { ...item, qty: val } : item
    );
    saveBasket(updated);
  };

  const checkedItems = basket.filter((b) => b.checked);
  const currentTotal = checkedItems.reduce((acc, cur) => acc + cur.qty * cur.currentPrice, 0);
  const targetTotal = checkedItems.reduce((acc, cur) => acc + cur.qty * cur.targetPrice, 0);
  const savedTotal = currentTotal - targetTotal;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* 1. 상단 히어로: 살롱순라 구매자 대시보드 요약 */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            살롱순라 (익선동 한옥 다이닝) 공식 구매 대시보드
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            &quot;매달 쓰는 그 고기 그대로, <span className="text-blue-400">마장동 최저가</span>로 원클릭 갱신&quot;
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            바쁜 주방에서 매번 단가 협상할 필요 없습니다. 살롱순라 소싱 스펙을 기준으로 
            마장동 유통사들이 경쟁하여 가장 저렴하고 신선한 고기를 배송합니다.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[220px]">
          <span className="text-xs text-blue-200 font-semibold">이번 달 예상 원가 절감액</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            월 {savedTotal.toLocaleString()}원
          </div>
          <span className="text-[11px] text-slate-300 mt-0.5 block">
            기존 대비 약 {Math.round((savedTotal / currentTotal) * 100)}% 마진 개선
          </span>
        </div>
      </div>

      {/* 2. 메인 섹션 A: 살롱순라 원클릭 정기 식자재 바구니 */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-50 rounded-xl text-blue-600 font-bold">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-black text-slate-900">
                살롱순라 월간 정기 육류 소싱 바구니
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              납품 주기: <strong>주 3회 (화·목·토 오전 10시 이전)</strong> · 결제 조건: <strong>익월 10일 정산</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">선택 품목: <strong>{checkedItems.length}개</strong></span>
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg">
              총 {checkedItems.reduce((acc, c) => acc + c.qty, 0)} kg
            </span>
          </div>
        </div>

        {/* 품목 리스트 */}
        <div className="divide-y divide-slate-100">
          {basket.map((item) => (
            <div
              key={item.id}
              className={`py-3.5 px-3 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.checked ? "bg-slate-50/60" : "opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheck(item.id)}
                  className="w-5 h-5 text-blue-600 rounded-lg cursor-pointer"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{item.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>기존 단가: <span className="line-through">{item.currentPrice.toLocaleString()}원</span></span>
                    <span className="font-bold text-emerald-600">목표가: {item.targetPrice.toLocaleString()}원/kg</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      ▼ {(item.currentPrice - item.targetPrice).toLocaleString()}원 절감
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 text-xs">
                {/* 수량 직접 입력 및 조절 스피너 */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                  <button
                    onClick={() => updateQty(item.id, -10)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                  >
                    -
                  </button>
                  <div className="flex items-center px-1">
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={item.qty === 0 ? "" : item.qty}
                      onChange={(e) => setQtyDirect(item.id, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-14 text-center font-black text-slate-900 bg-transparent border-0 focus:outline-hidden p-0 text-sm focus:ring-0"
                    />
                    <span className="text-[11px] font-bold text-slate-400">kg</span>
                  </div>
                  <button
                    onClick={() => updateQty(item.id, 10)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700 transition"
                  >
                    +
                  </button>
                </div>

                {/* 금액 표시 */}
                <div className="text-right min-w-[120px]">
                  <span className="text-[11px] text-slate-400 line-through">
                    {(item.qty * item.currentPrice).toLocaleString()}원
                  </span>
                  <div className="font-black text-slate-900 text-sm">
                    {(item.qty * item.targetPrice).toLocaleString()}원
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 바구니 액션 바 */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            기존 총액: <span className="line-through font-semibold">{currentTotal.toLocaleString()}원</span> ➔ 
            최적 견적가: <strong className="text-blue-600 text-base ml-1">{targetTotal.toLocaleString()}원</strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/rfq/d0000000-0000-0000-0000-000000000001/compare"
              className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-2xl text-xs font-black transition flex items-center gap-1 border border-red-200"
            >
              행복쇼핑 미니샵별 견적비교표 <ChevronRight className="w-4 h-4 text-red-600" />
            </Link>
            <Link
              href="/rfq/new"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-300" /> 3스텝 맞춤 퀘스트 견적요청
            </Link>
          </div>
        </div>
      </section>

      {/* 3. 메인 섹션 B: 거래명세표 AI 사진 스캔 단가방어기 */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600 font-bold">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                거래명세서 사진 1장으로 단가 인상 즉시 감시
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                오늘 고기 입고 때 받은 명세서 사진을 찍어 올리면, AI가 무단 인상 여부를 확인합니다.
              </p>
            </div>
          </div>
          <Link
            href="/contracts/e0000000-0000-0000-0000-000000000001/audit"
            className="text-xs text-emerald-700 font-bold hover:underline hidden sm:block"
          >
            정규 명세서 감사 페이지 이동 ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* 사진 업로드 버튼 */}
          <div
            onClick={() => setShowOcrResult(true)}
            className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 bg-emerald-50/30 text-center cursor-pointer hover:bg-emerald-50/70 transition flex flex-col items-center justify-center min-h-[160px]"
          >
            <Camera className="w-8 h-8 text-emerald-600 mb-2" />
            <span className="font-bold text-slate-900 text-sm">
              오늘 받은 거래명세서 사진 첨부하기
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              (여기를 누르면 살롱순라 11월 명세서가 샘플로 즉시 스캔됩니다)
            </span>
          </div>

          {/* AI 분석 결과창 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
            {showOcrResult ? (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI 스캔 완료: 살롱순라 11월 명세서
                  </span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                    단가 인상 적발
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>초이스 냉장 살치살:</span>
                    <span>35,000원 ➔ <strong className="text-emerald-600">벨엘미트 32,500원 가능</strong></span>
                  </div>
                  <div className="flex justify-between">
                    <span>프라임 냉장 알목심:</span>
                    <span>28,000원 ➔ <strong className="text-emerald-600">벨엘미트 25,900원 가능</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => alert('마장동 벨엘미트에 동일 스펙 최저가 공급처 교체 요청이 접수되었습니다.')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  월 795,000원 아끼는 공급처로 교체 요청
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 py-4">
                <ShieldCheck className="w-8 h-8 text-slate-300 mb-1" />
                <span>명세서 사진을 올리시면 AI 단가 대조 리포트가 여기에 표시됩니다.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. 메인 섹션 C: 마장동 실시간 시세 티커 */}
      <section className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-slate-200">마장동 축산물 실시간 도매 시세 (라이브)</span>
          </div>
          <span className="text-[11px] text-slate-400">살롱순라 배송 권역 기준</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[11px]">초이스 살치살 (냉장)</span>
            <div className="text-base font-black text-white mt-0.5">32,500원/kg</div>
            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +1.2% 상승세
            </span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[11px]">프라임 알목심 (냉장)</span>
            <div className="text-base font-black text-white mt-0.5">25,900원/kg</div>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> -3.5% 특가 기회
            </span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[11px]">호주산 AMH S안심</span>
            <div className="text-base font-black text-white mt-0.5">44,000원/kg</div>
            <span className="text-[10px] text-slate-400 font-bold">보합세 유지</span>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
            <span className="text-slate-400 text-[11px]">초이스 차돌박이</span>
            <div className="text-base font-black text-white mt-0.5">20,000원/kg</div>
            <span className="text-[10px] text-amber-400 font-bold">12월 인상 예고</span>
          </div>
        </div>
      </section>
    </div>
  );
}
