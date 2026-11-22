"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { StandardItem, ItemCategory, BaseUnit } from "@/types/database";
import {
  Plus,
  Upload,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  FileSpreadsheet,
} from "lucide-react";

const CATEGORIES: ItemCategory[] = [
  "육류",
  "해산물",
  "유제품",
  "채소/과일",
  "소스/공산품",
];
const UNITS: BaseUnit[] = ["kg", "L", "ea"];

export default function AdminItemsPage() {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useState<StandardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StandardItem | null>(null);
  const [formCategory, setFormCategory] = useState<ItemCategory>("육류");
  const [formName, setFormName] = useState("");
  const [formSpec, setFormSpec] = useState("");
  const [formUnit, setFormUnit] = useState<BaseUnit>("kg");
  const [saving, setSaving] = useState(false);

  // Bulk upload state
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("standard_items")
        .select("*")
        .order("category", { ascending: true })
        .order("item_name", { ascending: true });
      if (error) throw error;
      setItems((data || []) as StandardItem[]);
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err?.message || "표준 품목 목록을 불러오지 못했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchCat = selectedCat === "ALL" || item.category === selectedCat;
      const matchSearch =
        q === "" ||
        item.item_name.toLowerCase().includes(q) ||
        item.spec.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [items, selectedCat, searchTerm]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormCategory("육류");
    setFormName("");
    setFormSpec("");
    setFormUnit("kg");
    setModalOpen(true);
  };

  const openEditModal = (item: StandardItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormName(item.item_name);
    setFormSpec(item.spec);
    setFormUnit(item.base_unit);
    setModalOpen(true);
  };

  const handleSaveSingleItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSpec.trim()) {
      setNotice({ type: "error", text: "품목명과 표준 세부 규격을 모두 입력해 주세요." });
      return;
    }

    try {
      setSaving(true);
      setNotice(null);

      if (editingItem) {
        const { error } = await supabase
          .from("standard_items")
          .update({
            category: formCategory,
            item_name: formName.trim(),
            spec: formSpec.trim(),
            base_unit: formUnit,
          })
          .eq("id", editingItem.id);
        if (error) throw error;
        setNotice({
          type: "success",
          text: `"${formName.trim()}" 품목이 수정되었습니다.`,
        });
      } else {
        // Check duplicate by item_name -> update if exists, else insert
        const existing = items.find(
          (i) => i.item_name.trim().toLowerCase() === formName.trim().toLowerCase()
        );
        if (existing) {
          const { error } = await supabase
            .from("standard_items")
            .update({
              category: formCategory,
              spec: formSpec.trim(),
              base_unit: formUnit,
            })
            .eq("id", existing.id);
          if (error) throw error;
          setNotice({
            type: "success",
            text: `기존 동일 품목("${formName.trim()}")의 규격·단위를 업데이트했습니다.`,
          });
        } else {
          const { error } = await supabase.from("standard_items").insert({
            category: formCategory,
            item_name: formName.trim(),
            spec: formSpec.trim(),
            base_unit: formUnit,
          });
          if (error) throw error;
          setNotice({
            type: "success",
            text: `신규 표준 품목("${formName.trim()}")이 등록되었습니다.`,
          });
        }
      }

      setModalOpen(false);
      await loadItems();
    } catch (err: any) {
      setNotice({
        type: "error",
        text: `저장 실패: ${err?.message || "오류가 발생했습니다."}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item: StandardItem) => {
    if (!confirm(`"${item.item_name}" 표준 품목을 삭제하시겠습니까?`)) return;
    try {
      const { error } = await supabase
        .from("standard_items")
        .delete()
        .eq("id", item.id);
      if (error) throw error;
      setNotice({
        type: "success",
        text: `"${item.item_name}" 품목을 삭제했습니다.`,
      });
      await loadItems();
    } catch (err: any) {
      setNotice({
        type: "error",
        text: `삭제 실패: ${err?.message || "오류가 발생했습니다."}`,
      });
    }
  };

  // Sample CSV template download (UTF-8 BOM for Excel)
  const handleDownloadSample = () => {
    const header = "카테고리,품목명,규격,기준단위";
    const sampleRows = [
      '"육류","소채끝등심","미국산 초이스/냉장 (업데이트 예시)","kg"',
      '"육류","한우 1++ 채끝","국내산 1++ 등급/냉장","kg"',
      '"해산물","생연어 필렛","노르웨이산 슈페리어 항공직송","kg"',
      '"유제품","마스카포네 치즈","이탈리아산 갈바니 500g","kg"',
      '"소스/공산품","트러플 페이스트","이탈리아산 블랙트러플 500g","ea"',
    ];
    const csv = "\uFEFF" + [header, ...sampleRows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "견적식탁_표준품목_일괄업로드_양식.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Excel / CSV Bulk Upsert
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setNotice(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/parse-items-excel", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "파일 파싱 실패");
      }

      const parsed: Array<{
        category: string;
        item_name: string;
        spec: string;
        base_unit: string;
      }> = data.items || [];

      if (parsed.length === 0) {
        setNotice({
          type: "error",
          text: "업로드 파일에서 유효한 품목 행을 찾지 못했습니다. (컬럼: 카테고리, 품목명, 규격, 기준단위)",
        });
        return;
      }

      // Deduplicate by item_name against existing standard_items -> update existing, insert new
      const existingByName = new Map<string, StandardItem>();
      items.forEach((it) =>
        existingByName.set(it.item_name.replace(/\s+/g, "").toLowerCase(), it)
      );

      const toInsert: typeof parsed = [];
      const toUpdate: Array<{ id: string; payload: (typeof parsed)[number] }> = [];

      parsed.forEach((row) => {
        const key = row.item_name.replace(/\s+/g, "").toLowerCase();
        const found = existingByName.get(key);
        if (found) {
          toUpdate.push({ id: found.id, payload: row });
        } else {
          toInsert.push(row);
        }
      });

      if (toInsert.length > 0) {
        const { error: insErr } = await supabase
          .from("standard_items")
          .insert(toInsert);
        if (insErr) throw insErr;
      }

      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map(({ id, payload }) =>
            supabase
              .from("standard_items")
              .update({
                category: payload.category,
                spec: payload.spec,
                base_unit: payload.base_unit,
              })
              .eq("id", id)
          )
        );
      }

      setNotice({
        type: "success",
        text: `엑셀/CSV 일괄 반영 완료("${file.name}"): 신규 ${toInsert.length}건 추가, 중복 ${toUpdate.length}건 업데이트!`,
      });
      await loadItems();
    } catch (err: any) {
      setNotice({
        type: "error",
        text: `일괄 업로드 실패: ${err?.message || "오류가 발생했습니다."}`,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900">
              표준 품목 마스터 관리
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
              총 {items.length}종
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            식당 RFQ 요청 및 유통사 입찰 단위 정합화의 기준이 되는 표준 식자재 목록을
            관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadSample}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold inline-flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>샘플 양식 다운로드</span>
          </button>

          <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold inline-flex items-center space-x-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? "업로드 처리 중..." : "엑셀/CSV 일괄 업로드"}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleBulkUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>품목 단건 추가</span>
          </button>
        </div>
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center space-x-2 ${
            notice.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          {notice.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="font-semibold">{notice.text}</span>
        </div>
      )}

      {/* Filter & Search Bar + Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {["ALL", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedCat === cat
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {cat === "ALL" ? `전체 (${items.length})` : cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="품목명 또는 세부 규격 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-400">
              표준 품목 마스터를 불러오는 중...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-400">
              조건에 맞는 표준 품목이 없습니다.
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No.</th>
                  <th className="py-3 px-4">카테고리</th>
                  <th className="py-3 px-4">표준 품목명</th>
                  <th className="py-3 px-4">표준 세부 규격 (원산지/등급/포장)</th>
                  <th className="py-3 px-4 text-center">기준 단위</th>
                  <th className="py-3 px-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-center text-xs text-gray-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {item.item_name}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{item.spec}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.base_unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-gray-400 hover:text-emerald-700 transition-colors mr-1"
                        title="수정"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-extrabold text-gray-900">
                  {editingItem ? "표준 품목 수정" : "표준 품목 단건 추가"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  카테고리 *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ItemCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  표준 품목명 *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="예: 한우 1++ 채끝등심"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  표준 세부 규격 *
                </label>
                <input
                  type="text"
                  required
                  value={formSpec}
                  onChange={(e) => setFormSpec(e.target.value)}
                  placeholder="예: 국내산 1++ 등급/냉장 1kg 진공포장"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  기준 단위 *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {UNITS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setFormUnit(u)}
                      className={`py-2 rounded-xl border font-mono font-bold text-sm ${
                        formUnit === u
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold"
                >
                  {saving ? "저장 중..." : editingItem ? "수정 완료" : "품목 등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
