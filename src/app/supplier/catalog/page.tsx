"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ArrowLeft,
  Store,
  DollarSign,
  Download,
  Sparkles,
} from "lucide-react";

interface CatalogItem {
  id: string;
  brand: string;
  grade: string;
  storage: "냉장" | "냉동" | "동결";
  item_name: string;
  origin: string;
  price: number;
  note: string;
  target_store: string;
}

const INITIAL_CATALOG: CatalogItem[] = [
  {
    id: "c-1",
    brand: "EXCEL",
    grade: "초이스(CH)",
    storage: "냉동",
    item_name: "살치살",
    origin: "미국산",
    price: 27500,
    note: "-",
    target_store: "살롱순라",
  },
  {
    id: "c-2",
    brand: "EXCEL",
    grade: "초이스(CH)",
    storage: "냉장",
    item_name: "살치살",
    origin: "미국산",
    price: 32500,
    note: "스테이크용 원육",
    target_store: "살롱순라",
  },
  {
    id: "c-3",
    brand: "EXCEL",
    grade: "초이스(CH)",
    storage: "냉동",
    item_name: "알목심 (척아이롤)",
    origin: "미국산",
    price: 16000,
    note: "-",
    target_store: "살롱순라",
  },
  {
    id: "c-4",
    brand: "EXCEL",
    grade: "프라임(PR)",
    storage: "동결",
    item_name: "알목심 (척아이롤)",
    origin: "미국산",
    price: 19000,
    note: "-",
    target_store: "살롱순라",
  },
  {
    id: "c-5",
    brand: "EXCEL",
    grade: "프라임(PR)",
    storage: "냉장",
    item_name: "알목심 (척아이롤)",
    origin: "미국산",
    price: 25900,
    note: "구이/스테이크",
    target_store: "살롱순라",
  },
  {
    id: "c-6",
    brand: "TEYS",
    grade: "곡물비육(GF)",
    storage: "동결",
    item_name: "채끝등심",
    origin: "호주산",
    price: 28500,
    note: "-",
    target_store: "살롱순라",
  },
  {
    id: "c-7",
    brand: "AMH",
    grade: "A등급",
    storage: "냉동",
    item_name: "안심 (텐더로인)",
    origin: "호주산",
    price: 39500,
    note: "-",
    target_store: "살롱순라",
  },
  {
    id: "c-8",
    brand: "AMH",
    grade: "S등급",
    storage: "냉장",
    item_name: "안심 (텐더로인)",
    origin: "호주산",
    price: 44000,
    note: "프리미엄 원육",
    target_store: "살롱순라",
  },
  {
    id: "c-9",
    brand: "EXCEL",
    grade: "초이스(CH)",
    storage: "동결",
    item_name: "차돌백이작업",
    origin: "미국산",
    price: 20000,
    note: "12월부터 22,000~24,000원",
    target_store: "살롱순라",
  },
];

export default function SupplierCatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>(INITIAL_CATALOG);
  const [isSaved, setIsSaved] = useState(false);

  const handleFieldChange = (id: string, field: keyof CatalogItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setIsSaved(false);
  };

  const addRow = () => {
    const newItem: CatalogItem = {
      id: `c-new-${Date.now()}`,
      brand: "EXCEL",
      grade: "초이스",
      storage: "냉장",
      item_name: "신규 육류 부위",
      origin: "미국산",
      price: 30000,
      note: "-",
      target_store: "살롱순라",
    };
    setItems([...items, newItem]);
    setIsSaved(false);
  };

  const removeRow = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    setIsSaved(false);
  };

  const saveCatalog = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#181a1d] text-zinc-100 pb-16">
      {/* 상단 바 */}
      <div className="bg-[#121416] text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> 뒤로
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🥩</span>
                <h1 className="text-lg font-black">
                  [벨엘미트] 공식 육류 납품 단가표 관리
                </h1>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/30">
                  마장동 축산 도소매
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                등록번호: 258-40-00129 · 대표: 김지선 · 소재지: 마장동 1층 · 사용매장: 살롱순라
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/supplier/register-quote"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>숨고 퀘스트 견적 등록 (1·3·10)</span>
            </Link>
            <button
              onClick={addRow}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5" /> 품목 추가
            </button>
            <button
              onClick={saveCatalog}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <Save className="w-3.5 h-3.5" /> 단가표 저장
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* 안내 카드 */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                실제 마장동 견적서 양식(26.10.30) 기반 단가표
              </h2>
              <p className="text-xs text-zinc-400">
                이곳에 등록된 단가는 살롱순라가 견적 요청하거나 탐색할 때 기준 납품단가로 즉시 연동됩니다.
              </p>
            </div>
          </div>
          {isSaved && (
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 저장 완료되었습니다!
            </div>
          )}
        </div>

        {/* 단가표 스프레드시트 테이블 */}
        <div className="bg-white rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-zinc-200 font-bold border-b border-zinc-800">
                <tr>
                  <th className="p-3 border-r w-28">브랜드</th>
                  <th className="p-3 border-r w-28">등급</th>
                  <th className="p-3 border-r w-24">보관</th>
                  <th className="p-3 border-r">품목 (부위)</th>
                  <th className="p-3 border-r w-24">원산지</th>
                  <th className="p-3 border-r text-right w-36">11월 납품단가 (원/kg)</th>
                  <th className="p-3 border-r">비고</th>
                  <th className="p-3 border-r w-28">사용 매장</th>
                  <th className="p-3 text-center w-12">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-[#181a1d]/80 transition">
                    <td className="p-2 border-r">
                      <input
                        value={row.brand}
                        onChange={(e) => handleFieldChange(row.id, "brand", e.target.value)}
                        className="w-full px-2 py-1 rounded border border-zinc-800 font-semibold"
                      />
                    </td>
                    <td className="p-2 border-r">
                      <input
                        value={row.grade}
                        onChange={(e) => handleFieldChange(row.id, "grade", e.target.value)}
                        className="w-full px-2 py-1 rounded border border-zinc-800 font-semibold"
                      />
                    </td>
                    <td className="p-2 border-r">
                      <select
                        value={row.storage}
                        onChange={(e) => handleFieldChange(row.id, "storage", e.target.value)}
                        className="w-full px-2 py-1 rounded border border-zinc-800 font-bold text-zinc-200"
                      >
                        <option value="냉장">냉장</option>
                        <option value="냉동">냉동</option>
                        <option value="동결">동결</option>
                      </select>
                    </td>
                    <td className="p-2 border-r">
                      <input
                        value={row.item_name}
                        onChange={(e) => handleFieldChange(row.id, "item_name", e.target.value)}
                        className="w-full px-2 py-1 rounded border border-zinc-800 font-bold text-white"
                      />
                    </td>
                    <td className="p-2 border-r">
                      <input
                        value={row.origin}
                        onChange={(e) => handleFieldChange(row.id, "origin", e.target.value)}
                        className="w-full px-2 py-1 rounded border border-zinc-800 text-zinc-300"
                      />
                    </td>
                    <td className="p-2 border-r text-right">
                      <input
                        type="number"
                        value={row.price}
                        onChange={(e) => handleFieldChange(row.id, "price", Number(e.target.value))}
                        className="w-full text-right px-2 py-1 rounded border border-zinc-800 font-black text-emerald-700"
                      />
                    </td>
                    <td className="p-2 border-r">
                      <input
                        value={row.note}
                        onChange={(e) => handleFieldChange(row.id, "note", e.target.value)}
                        className="w-full px-2 py-1 rounded border border-zinc-800 text-zinc-400"
                      />
                    </td>
                    <td className="p-2 border-r">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-800 font-bold rounded text-[11px] block text-center">
                        {row.target_store}
                      </span>
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded"
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
      </div>
    </div>
  );
}
