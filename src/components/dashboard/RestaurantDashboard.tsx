"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatNumber } from "@/lib/utils";
import {
  UtensilsCrossed,
  TrendingDown,
  AlertTriangle,
  FileCheck2,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Building,
} from "lucide-react";

export function RestaurantDashboard() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rfq, setRfq] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load RFQ
        const { data: rfqData } = await supabase
          .from("rfqs")
          .select("*, rfq_items(*, standard_items(*))")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (rfqData) {
          setRfq(rfqData);
          setItems(rfqData.rfq_items || []);

          // Load Bids
          const { data: bidsData } = await supabase
            .from("bids")
            .select("*, bid_items(*), profiles(*)")
            .eq("rfq_id", rfqData.id);

          setBids(bidsData || []);
        }

        // Load Audits
        const { data: auditData } = await supabase
          .from("invoice_audits")
          .select("*, contracts(*, profiles(*))")
          .limit(5);

        setAudits(auditData || []);
      } catch (err) {
        console.error("Failed to load restaurant data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>식당 업주 모드 · 청주 파스타공방</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              식자재 역경매 및 단가방어 대시보드
            </h1>
            <p className="text-orange-100 text-sm max-w-xl">
              등록하신 월간 식자재 품목에 대해 유통사들이 기준 단위(kg/L)로 경쟁 입찰 중입니다. 
              최적 1사 및 2사 조합을 실시간 매트릭스 뷰에서 확인하세요.
            </p>
          </div>
          <div className="flex sm:flex-col items-end justify-between gap-2">
            <span className="text-xs text-orange-100 font-medium">단가 절감 기대액</span>
            <span className="text-3xl font-extrabold tracking-tight">
              약 18.4% <span className="text-lg font-normal">절감</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">진행 중 역경매</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">1건 (D-5)</div>
            <div className="text-[11px] text-orange-600 font-medium">3개 유통사 입찰 참여</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">예상 월 절감액</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">₩ 640,000</div>
            <div className="text-[11px] text-emerald-600 font-medium">기존 매입가 대비</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">체결된 정기 계약</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">1건 (B미트)</div>
            <div className="text-[11px] text-blue-600 font-medium">확정 단가 스냅샷 보장</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">단가 인상 감시 적발</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">1건 적발</div>
            <div className="text-[11px] text-rose-600 font-medium">₩25,000 과다청구 차단</div>
          </div>
        </div>
      </div>

      {/* Matrix View Section (가로×세로 매트릭스 뷰) */}
      <div id="matrix" className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                <Scale className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                실시간 가로×세로 입찰 비교 매트릭스 뷰
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                단위 자동 정합화 (kg/L)
              </span>
            </div>
            <p className="text-xs text-gray-500">
              유통사별 포장 규격 및 공급가를 표준 단위로 자동 환산하여 한눈에 최저가를 비교합니다.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200/60 px-3.5 py-2 rounded-xl text-xs font-semibold text-orange-800">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>추천 조합: 2사 분할 (B미트 + C프레시)</span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/75 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">요청 품목 및 규격</th>
                <th className="py-3.5 px-4 text-center">월 예상 소요량</th>
                <th className="py-3.5 px-4 text-right">기존 매입단가</th>
                <th className="py-3.5 px-4 text-right bg-blue-50/40 border-l border-r border-blue-100">
                  A종합유통 (대성)
                  <span className="block text-[10px] font-normal text-gray-400">MOQ 15만원</span>
                </th>
                <th className="py-3.5 px-4 text-right bg-amber-50/40 border-r border-amber-100">
                  B미트 육류전문 (하나)
                  <span className="block text-[10px] font-normal text-gray-400">MOQ 20만원</span>
                </th>
                <th className="py-3.5 px-4 text-right bg-emerald-50/40">
                  C프레시 신선/유제품
                  <span className="block text-[10px] font-normal text-gray-400">MOQ 10만원</span>
                </th>
                <th className="py-3.5 px-4 text-center bg-gray-100/60 font-bold text-gray-700">
                  품목별 최저가
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const std = item.standard_items;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-900">{std?.item_name}</div>
                      <div className="text-xs text-gray-400">{std?.spec}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">
                      {formatNumber(item.monthly_qty)} {std?.base_unit}
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-500 line-through">
                      {formatPrice(item.current_unit_price)}
                    </td>

                    {/* A종합유통 */}
                    <td className="py-3.5 px-4 text-right border-l border-r border-blue-50">
                      {std?.item_name === "생모짜렐라" && "₩ 16,500/kg"}
                      {std?.item_name === "엑스트라버진 올리브오일" && "₩ 18,400/L ⭐"}
                      {std?.item_name === "파스타면 스파게티" && "₩ 3,700/kg ⭐"}
                      {std?.item_name === "소채끝등심" && <span className="text-gray-300">-</span>}
                      {std?.item_name === "와일드 루꼴라" && <span className="text-gray-300">-</span>}
                    </td>

                    {/* B미트 */}
                    <td className="py-3.5 px-4 text-right border-r border-amber-50">
                      {std?.item_name === "소채끝등심" && (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          ₩ 33,000/kg ⭐
                        </span>
                      )}
                      {std?.item_name !== "소채끝등심" && <span className="text-gray-300">-</span>}
                    </td>

                    {/* C프레시 */}
                    <td className="py-3.5 px-4 text-right">
                      {std?.item_name === "생모짜렐라" && (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          ₩ 16,200/kg ⭐
                        </span>
                      )}
                      {std?.item_name === "와일드 루꼴라" && (
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          ₩ 19,000/kg ⭐
                        </span>
                      )}
                      {std?.item_name !== "생모짜렐라" && std?.item_name !== "와일드 루꼴라" && (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>

                    {/* 최저가 요약 */}
                    <td className="py-3.5 px-4 text-center bg-gray-50/30">
                      <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-md">
                        {std?.item_name === "소채끝등심" && "B미트 (11% 절감)"}
                        {std?.item_name === "생모짜렐라" && "C프레시 (10% 절감)"}
                        {std?.item_name === "와일드 루꼴라" && "C프레시 (17% 절감)"}
                        {std?.item_name === "엑스트라버진 올리브오일" && "A종합 (12% 절감)"}
                        {std?.item_name === "파스타면 스파게티" && "A종합 (14% 절감)"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 1사 vs 2사 알고리즘 최적 조합 분석 카드 */}
        <div className="p-6 bg-slate-50/70 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                선택지 1 : 단일 최저가 공급사 (1사 전담)
              </span>
              <span className="text-sm font-bold text-gray-900">A종합유통</span>
            </div>
            <p className="text-xs text-gray-500">
              전체 품목의 80% 이상 공급 가능하며, 발주 관리 편의성이 가장 높습니다.
            </p>
            <div className="pt-2 flex justify-between items-baseline border-t border-gray-100">
              <span className="text-xs text-gray-500">예상 월 발주총액</span>
              <span className="text-lg font-bold text-gray-900">₩ 3,120,000</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 p-5 rounded-2xl border border-orange-200 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-200 text-orange-900">
                👑 추천 : 최적 2사 분할 조합 (알고리즘 계산)
              </span>
              <span className="text-sm font-bold text-orange-950">B미트(육류) + C프레시(신선)</span>
            </div>
            <p className="text-xs text-orange-800/80">
              각 품목별 최저가 업체를 분할 배정하며, 두 업체 모두 주 2회 기준 최소주문금액(MOQ)을 100% 충족합니다.
            </p>
            <div className="pt-2 flex justify-between items-baseline border-t border-orange-200/60">
              <span className="text-xs text-orange-900 font-medium">예상 월 발주총액 (최대 절감)</span>
              <span className="text-xl font-extrabold text-orange-600">₩ 2,835,000 (₩28.5만 추가 절감)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Audit Monitoring Section (단가 인상 방어 감시) */}
      <div id="audits" className="bg-white rounded-3xl border border-rose-200 shadow-sm p-6 space-y-4">
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
                납품 후 업로드된 거래명세서의 공급단가를 계약 확정 단가 스냅샷과 실시간 자동 대조합니다.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 text-rose-700 animate-pulse">
            🚨 무단 인상 1건 감지
          </span>
        </div>

        {audits.map((audit) => (
          <div key={audit.id} className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-950">
                계약사: {audit.contracts?.profiles?.company_name || "B미트 육류전문"}
              </span>
              <span className="text-gray-500">{new Date(audit.created_at).toLocaleDateString("ko-KR")}</span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-rose-100 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-gray-700 border-b pb-1">
                <span>적발 품목</span>
                <span>계약 단가</span>
                <span>청구 단가</span>
                <span className="text-rose-600">초과 차액</span>
              </div>
              {audit.parsed_items?.map((p: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-0.5">
                  <span className="font-medium text-gray-900">{p.item_name} (수량 {p.qty}kg)</span>
                  <span className="text-gray-500">{formatPrice(p.contract_unit_price)}</span>
                  <span className="font-bold text-rose-600">{formatPrice(p.invoiced_unit_price)}</span>
                  <span className="font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                    +{formatPrice(p.diff * p.qty)} 무단 인상
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">
                조치: 유통업체 자동 소명 요청 발송 및 신뢰도 점수 감점(-1.3점) 반영 완료
              </span>
              <button className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs">
                정산 보류 및 이의 제기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
