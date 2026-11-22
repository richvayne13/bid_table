"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { formatPrice, formatNumber } from "@/lib/utils";
import {
  Truck,
  Package,
  Send,
  BadgeCheck,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";

export function SupplierDashboard() {
  const { currentUser } = useRole();
  const supabase = createClient();
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSupplierData() {
      try {
        setLoading(true);
        // Load Catalog
        const { data: catData } = await supabase
          .from("supplier_catalogs")
          .select("*, standard_items(*)")
          .eq("supplier_id", currentUser.id);

        setCatalogs(catData || []);

        // Load RFQs
        const { data: rfqData } = await supabase
          .from("rfqs")
          .select("*, rfq_items(*, standard_items(*)), profiles(*)")
          .eq("status", "OPEN");

        setRfqs(rfqData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadSupplierData();
  }, [currentUser.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>유통사 공급자 모드 · {currentUser.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              유통 공급 및 입찰 관리 센터
            </h1>
            <p className="text-blue-100 text-sm max-w-xl">
              배송 권역(충북 청주 일대)에 등록된 신규 식당 견적 요청 공고를 확인하고, 포장 규격 및 공급가를 입력하여 실시간 투찰하세요.
            </p>
          </div>
          <div className="flex sm:flex-col items-end justify-between gap-2">
            <span className="text-xs text-blue-100 font-medium">유통사 단가 준수 신뢰도</span>
            <span className="text-3xl font-extrabold tracking-tight flex items-center space-x-1">
              <span>99.2점</span>
              <BadgeCheck className="w-6 h-6 text-emerald-300" />
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">등록 공급 품목</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{catalogs.length}개 품목</div>
            <div className="text-[11px] text-blue-600 font-medium">기본 공급 단가표 기준</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">참여 가능 공고</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{rfqs.length}건 대기 중</div>
            <div className="text-[11px] text-emerald-600 font-medium">배송 권역 100% 일치</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">입찰 수주율</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">68.5%</div>
            <div className="text-[11px] text-amber-600 font-medium">최적 2사 조합 우선 매칭</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">배송 권역</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">충북 청주시 전역</div>
            <div className="text-[11px] text-purple-600 font-medium">흥덕구 · 서원구 · 상당구</div>
          </div>
        </div>
      </div>

      {/* Open RFQs List */}
      <div id="rfqs" className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              실시간 오픈 역경매 공고함 (배송권역 매칭)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              식당에서 요청한 품목에 대해 1회 최소주문금액(MOQ)과 포장 단위 공급가를 제출하세요.
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">
            신규 공고 {rfqs.length}건
          </span>
        </div>

        {rfqs.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 space-y-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-800">
                    {r.region}
                  </span>
                  <h3 className="text-base font-bold text-gray-900">{r.title}</h3>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center space-x-3">
                  <span>발주처: {r.profiles?.company_name || "청주 파스타공방"}</span>
                  <span>•</span>
                  <span>계약기간: {r.contract_months}개월</span>
                  <span>•</span>
                  <span>결제조건: {r.payment_terms}</span>
                  <span>•</span>
                  <span>마감일: {new Date(r.deadline).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>

              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto flex items-center space-x-1">
                <span>입찰서 작성 / 수정</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Requested Items Preview */}
            <div className="bg-white p-3 rounded-xl border border-gray-100 text-xs">
              <div className="font-semibold text-gray-500 mb-2">요청 품목 요약:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {r.rfq_items?.map((it: any) => (
                  <div key={it.id} className="p-2 rounded-lg bg-gray-50 border border-gray-100 flex justify-between">
                    <span className="font-medium text-gray-900">{it.standard_items?.item_name}</span>
                    <span className="text-gray-500 font-mono">
                      {formatNumber(it.monthly_qty)} {it.standard_items?.base_unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Catalog Table */}
      <div id="catalog" className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              내 유통 공급 기본 단가표 ({catalogs.length}품목 등록됨)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              표준 품목에 매칭된 유통사의 고유 포장 규격 및 박스 단위 공급가 목록입니다.
            </p>
          </div>
          <button className="px-3.5 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors">
            + 새 품목 단가 등록
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b">
              <tr>
                <th className="py-3 px-4">표준 품목명</th>
                <th className="py-3 px-4">카테고리</th>
                <th className="py-3 px-4">표준 규격</th>
                <th className="py-3 px-4 text-center">포장 단위 중량</th>
                <th className="py-3 px-4 text-right">포장 단위 공급가</th>
                <th className="py-3 px-4 text-right bg-blue-50/50 font-bold text-blue-900">
                  환산 기준단가 (자동)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {catalogs.map((c) => {
                const std = c.standard_items;
                const normalized = c.package_weight > 0 ? c.package_price / c.package_weight : 0;
                return (
                  <tr key={c.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4 font-semibold text-gray-900">{std?.item_name}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {std?.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{std?.spec}</td>
                    <td className="py-3 px-4 text-center font-mono">
                      {c.package_weight} {std?.base_unit}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{formatPrice(c.package_price)}</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-700 bg-blue-50/30">
                      {formatPrice(normalized)} / {std?.base_unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
