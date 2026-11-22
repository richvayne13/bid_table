"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  AlertOctagon,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";

export function AdminDashboard() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        // Load all 50 standard items
        const { data: itemData } = await supabase
          .from("standard_items")
          .select("*")
          .order("category", { ascending: true })
          .order("item_name", { ascending: true });

        setItems(itemData || []);

        // Load Suppliers
        const { data: supData } = await supabase
          .from("profiles")
          .select("*, supplier_catalogs(count)")
          .eq("role", "SUPPLIER");

        setSuppliers(supData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const categories = ["ALL", "육류", "해산물", "유제품", "채소/과일", "소스/공산품"];

  const filteredItems = items.filter((item) => {
    const matchCat = selectedCat === "ALL" || item.category === selectedCat;
    const matchSearch =
      searchTerm === "" ||
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.spec.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>플랫폼 운영 관리자 모드 · ADMIN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              견적식탁 총괄 플랫폼 운영 센터
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              양식 다이닝 표준 식자재 50종 마스터를 관리하고, 가상 유통사 및 단가표를 운영하며, 
              거래명세서 OCR 대조를 통한 무단 단가 인상을 중앙에서 감시합니다.
            </p>
          </div>
          <div className="flex sm:flex-col items-end justify-between gap-2">
            <span className="text-xs text-emerald-100 font-medium">관리 중 표준 식자재</span>
            <span className="text-3xl font-extrabold tracking-tight">
              50종 <span className="text-lg font-normal">등록 완료</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">표준 식자재 마스터</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">50개 품목</div>
            <div className="text-[11px] text-emerald-600 font-medium">5대 카테고리 규격 완비</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">등록 유통사</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">{suppliers.length}개 유통사</div>
            <div className="text-[11px] text-blue-600 font-medium">충북 청주 권역 활성</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">평균 단가 준수율</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">99.3 %</div>
            <div className="text-[11px] text-purple-600 font-medium">신뢰도 점수 기반 관리</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">무단 인상 적발 건수</div>
            <div className="text-xl font-bold text-gray-900 mt-0.5">1건 적발 중</div>
            <div className="text-[11px] text-rose-600 font-medium">OCR 자동 스냅샷 대조</div>
          </div>
        </div>
      </div>

      {/* Suppliers Management Grid */}
      <div id="suppliers" className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">가상 유통업체 계정 및 단가표 관리</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              관리자가 직접 가상 업체를 생성하거나, 오픈된 RFQ에 대리 입찰을 실행할 수 있습니다.
            </p>
          </div>
          <button className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs">
            + 가상 유통사 신규 등록
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{sup.company_name}</span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                  신뢰도 {sup.trust_score}점
                </span>
              </div>
              <p className="text-xs text-gray-500">{sup.address}</p>
              <div className="text-[11px] text-gray-400">
                배송권역: {sup.delivery_regions?.join(", ") || "청주 전역"}
              </div>
              <div className="pt-2 border-t flex justify-between items-center text-xs">
                <span className="text-gray-500">공급 가능 품목: {sup.supplier_catalogs?.[0]?.count || 10}+</span>
                <button className="text-emerald-700 font-semibold hover:underline">
                  단가표 편집 →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Items Master Table (50종) */}
      <div id="standards" className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-gray-900">
                표준 식자재 50종 마스터 카탈로그
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
                총 {items.length}개 품목 등록됨
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              식당의 견적 요청 및 유통사의 입찰 단위(kg/L/ea)의 기준이 되는 표준 품목 목록입니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="품목명 또는 규격 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-emerald-500 w-48"
              />
            </div>
            <button className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>품목 추가 / 엑셀 업로드</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedCat === cat
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              {cat === "ALL" ? "전체 (50)" : cat}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No.</th>
                <th className="py-3 px-4">카테고리</th>
                <th className="py-3 px-4 font-bold text-gray-800">표준 품목명</th>
                <th className="py-3 px-4">표준 세부 규격 (원산지/등급/포장)</th>
                <th className="py-3 px-4 text-center">기준 단위</th>
                <th className="py-3 px-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-center text-xs text-gray-400 font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-gray-900">{item.item_name}</td>
                  <td className="py-2.5 px-4 text-xs text-gray-600">{item.spec}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.base_unit}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button className="text-xs text-gray-400 hover:text-emerald-600 font-medium">
                      수정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
