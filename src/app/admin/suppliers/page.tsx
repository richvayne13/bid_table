"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { StandardItem } from "@/types/database";
import { formatPrice } from "@/lib/utils";
import {
  Building2,
  Plus,
  Upload,
  Download,
  Save,
  MapPin,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  Sparkles,
} from "lucide-react";

const PRESET_REGIONS = [
  "충북 청주시 흥덕구",
  "충북 청주시 서원구",
  "충북 청주시 상당구",
  "충북 청주시 청원구",
  "서울특별시 종로구",
  "서울특별시 강남구",
  "서울특별시 마포구",
  "서울특별시 성동구",
  "세종특별자치시",
  "대전광역시 유성구",
];

interface CatalogDraft {
  package_weight: string;
  package_price: string;
}

export default function AdminSuppliersPage() {
  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [standardItems, setStandardItems] = useState<StandardItem[]>([]);
  const [catalogMap, setCatalogMap] = useState<Record<string, any>>({});
  const [drafts, setDrafts] = useState<Record<string, CatalogDraft>>({});
  const [regionDraft, setRegionDraft] = useState<string[]>([]);
  const [customRegionInput, setCustomRegionInput] = useState("");

  const [catFilter, setCatFilter] = useState<string>("ALL");
  const [itemSearch, setItemSearch] = useState<string>("");
  const [onlyRegistered, setOnlyRegistered] = useState(false);

  // Create Virtual Supplier Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newBusinessNumber, setNewBusinessNumber] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newRegions, setNewRegions] = useState<string[]>([
    "충북 청주시 흥덕구",
    "서울특별시 종로구",
  ]);
  const [creating, setCreating] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadBaseData = async (keepSelectedId?: string) => {
    try {
      setLoading(true);
      const [supRes, itemRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*, supplier_catalogs(count)")
          .eq("role", "SUPPLIER")
          .order("is_admin_managed", { ascending: false })
          .order("company_name", { ascending: true }),
        supabase
          .from("standard_items")
          .select("*")
          .order("category")
          .order("item_name"),
      ]);

      if (supRes.error) throw supRes.error;
      if (itemRes.error) throw itemRes.error;

      const supList = supRes.data || [];
      setSuppliers(supList);
      setStandardItems((itemRes.data || []) as StandardItem[]);

      const targetId =
        keepSelectedId && supList.some((s: any) => s.id === keepSelectedId)
          ? keepSelectedId
          : selectedSupplierId && supList.some((s: any) => s.id === selectedSupplierId)
          ? selectedSupplierId
          : supList[0]?.id || "";
      setSelectedSupplierId(targetId);
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err?.message || "유통업체 데이터를 불러오지 못했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => s.id === selectedSupplierId) || null,
    [suppliers, selectedSupplierId]
  );

  // Load selected supplier's catalog
  const loadSupplierCatalog = async (supplierId: string) => {
    if (!supplierId) return;
    const { data, error } = await supabase
      .from("supplier_catalogs")
      .select("*")
      .eq("supplier_id", supplierId);

    if (error) {
      setNotice({ type: "error", text: error.message });
      return;
    }

    const map: Record<string, any> = {};
    const nextDrafts: Record<string, CatalogDraft> = {};
    (data || []).forEach((row: any) => {
      map[row.standard_item_id] = row;
      nextDrafts[row.standard_item_id] = {
        package_weight: String(row.package_weight),
        package_price: String(row.package_price),
      };
    });
    setCatalogMap(map);
    setDrafts(nextDrafts);
  };

  useEffect(() => {
    if (!selectedSupplierId) return;
    loadSupplierCatalog(selectedSupplierId);
    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    setRegionDraft(Array.isArray(sup?.delivery_regions) ? sup.delivery_regions : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSupplierId]);

  // Create Virtual Supplier via RPC (is_admin_managed: true)
  const handleCreateVirtualSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) {
      setNotice({ type: "error", text: "가상 유통업체명을 입력해 주세요." });
      return;
    }

    try {
      setCreating(true);
      setNotice(null);

      const { data, error } = await supabase.rpc("create_virtual_supplier", {
        p_company_name: newCompanyName.trim(),
        p_business_number: newBusinessNumber.trim(),
        p_address: newAddress.trim() || "운영자 등록 가상 유통업체",
        p_delivery_regions: newRegions,
        p_trust_score: 100.0,
      });

      if (error) throw error;

      setCreateModalOpen(false);
      setNewCompanyName("");
      setNewBusinessNumber("");
      setNewAddress("");
      setNotice({
        type: "success",
        text: `가상 유통업체 "${data?.company_name || newCompanyName.trim()}"(is_admin_managed=true)가 생성되었습니다!`,
      });
      await loadBaseData(data?.id);
    } catch (err: any) {
      setNotice({
        type: "error",
        text: `가상 유통업체 생성 실패: ${err?.message || "오류가 발생했습니다."}`,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSaveRegions = async () => {
    if (!selectedSupplierId) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ delivery_regions: regionDraft })
        .eq("id", selectedSupplierId);
      if (error) throw error;
      setNotice({
        type: "success",
        text: `${selectedSupplier?.company_name}의 배송 권역(${regionDraft.length}곳)이 저장되었습니다.`,
      });
      await loadBaseData(selectedSupplierId);
    } catch (err: any) {
      setNotice({ type: "error", text: `배송 권역 저장 실패: ${err?.message}` });
    }
  };

  const handleSaveSingleCatalogRow = async (item: StandardItem) => {
    if (!selectedSupplierId) return;
    const d = drafts[item.id];
    const weight = Number(d?.package_weight);
    const price = Number(d?.package_price);

    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(price) || price <= 0) {
      setNotice({
        type: "error",
        text: `"${item.item_name}"의 포장단위(0 초과)와 공급가(원)를 입력해 주세요.`,
      });
      return;
    }

    try {
      setSavingCatalog(true);
      const { error } = await supabase.from("supplier_catalogs").upsert(
        {
          supplier_id: selectedSupplierId,
          standard_item_id: item.id,
          package_weight: weight,
          package_price: Math.round(price),
        },
        { onConflict: "supplier_id,standard_item_id" }
      );
      if (error) throw error;
      setNotice({
        type: "success",
        text: `${selectedSupplier?.company_name} 단가표에 "${item.item_name}" (${weight}${item.base_unit} / ${formatPrice(
          price
        )}) 저장 완료!`,
      });
      await loadSupplierCatalog(selectedSupplierId);
      await loadBaseData(selectedSupplierId);
    } catch (err: any) {
      setNotice({ type: "error", text: `단가 저장 실패: ${err?.message}` });
    } finally {
      setSavingCatalog(false);
    }
  };

  const handleDeleteCatalogRow = async (item: StandardItem) => {
    const existing = catalogMap[item.id];
    if (!existing) return;
    try {
      const { error } = await supabase
        .from("supplier_catalogs")
        .delete()
        .eq("id", existing.id);
      if (error) throw error;
      await loadSupplierCatalog(selectedSupplierId);
      await loadBaseData(selectedSupplierId);
      setNotice({
        type: "success",
        text: `"${item.item_name}" 단가를 이 업체 단가표에서 제거했습니다.`,
      });
    } catch (err: any) {
      setNotice({ type: "error", text: `삭제 실패: ${err?.message}` });
    }
  };

  // Excel/CSV Bulk Catalog Upload using existing /api/parse-catalog
  const handleBulkCatalogUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSupplierId) return;

    try {
      setUploading(true);
      setNotice(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-catalog", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "파일 파싱 실패");
      }

      const parsed: Array<{ name: string; weight: number; price: number }> =
        data.items || [];
      const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

      const upsertRows: Array<{
        supplier_id: string;
        standard_item_id: string;
        package_weight: number;
        package_price: number;
      }> = [];

      parsed.forEach((p) => {
        const pNorm = norm(p.name);
        const match = standardItems.find((si) => {
          const t = norm(si.item_name);
          return t === pNorm || t.includes(pNorm) || pNorm.includes(t);
        });
        if (match) {
          upsertRows.push({
            supplier_id: selectedSupplierId,
            standard_item_id: match.id,
            package_weight: p.weight,
            package_price: Math.round(p.price),
          });
        }
      });

      if (upsertRows.length === 0) {
        setNotice({
          type: "error",
          text: "업로드 파일에서 표준 품목명과 일치하는 행을 찾지 못했습니다. (컬럼: 품목명, 포장단위, 포장공급가)",
        });
        return;
      }

      const { error } = await supabase
        .from("supplier_catalogs")
        .upsert(upsertRows, { onConflict: "supplier_id,standard_item_id" });
      if (error) throw error;

      setNotice({
        type: "success",
        text: `${selectedSupplier?.company_name} 단가표에 엑셀/CSV ${upsertRows.length}개 품목이 일괄 등록(Upsert)되었습니다!`,
      });
      await loadSupplierCatalog(selectedSupplierId);
      await loadBaseData(selectedSupplierId);
    } catch (err: any) {
      setNotice({
        type: "error",
        text: `단가표 업로드 실패: ${err?.message || "오류가 발생했습니다."}`,
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadSampleCatalog = () => {
    const header = "품목명,포장단위,포장공급가";
    const lines = [
      '"소채끝등심",5,170000',
      '"생모짜렐라",1,16300',
      '"와일드 루꼴라",0.5,9300',
      '"엑스트라버진 올리브오일",5,90500',
      '"파스타면 스파게티",5,18200',
    ];
    const csv = "\uFEFF" + [header, ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedSupplier?.company_name || "유통사"}_단가표_샘플.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return standardItems.filter((item) => {
      if (onlyRegistered && !catalogMap[item.id]) return false;
      const matchCat = catFilter === "ALL" || item.category === catFilter;
      const matchSearch =
        q === "" ||
        item.item_name.toLowerCase().includes(q) ||
        item.spec.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [standardItems, catFilter, itemSearch, onlyRegistered, catalogMap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            가상 유통업체 등록 &amp; 단가표 관리
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            미가입 지역 도매상이나 온라인 도매몰 기준가(is_admin_managed=true)를 생성하고,
            업체별 배송 권역 및 공급 단가표(`supplier_catalogs`)를 관리합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center space-x-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>가상 유통업체 신규 등록</span>
        </button>
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

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Suppliers List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-3xl border border-gray-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <span className="text-xs font-extrabold text-gray-700">
                등록 유통업체 ({suppliers.length}곳)
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">
                가상업체 {suppliers.filter((s) => s.is_admin_managed).length}곳
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-gray-400">
                불러오는 중...
              </div>
            ) : (
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                {suppliers.map((sup) => {
                  const active = sup.id === selectedSupplierId;
                  const catCount = sup.supplier_catalogs?.[0]?.count ?? 0;
                  return (
                    <button
                      key={sup.id}
                      type="button"
                      onClick={() => setSelectedSupplierId(sup.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-1.5 ${
                        active
                          ? "border-emerald-500 bg-emerald-50/70 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-gray-900 truncate">
                          {sup.company_name}
                        </span>
                        {sup.is_admin_managed ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0 inline-flex items-center space-x-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>가상업체</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold shrink-0">
                            가입업체
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        권역:{" "}
                        {Array.isArray(sup.delivery_regions) &&
                        sup.delivery_regions.length > 0
                          ? sup.delivery_regions.join(", ")
                          : "미지정"}
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                        <span className="text-gray-500">
                          등록 단가 <strong className="text-gray-900">{catCount}품목</strong>
                        </span>
                        <span className="font-bold text-emerald-700">
                          신뢰도 {Number(sup.trust_score ?? 100).toFixed(1)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Supplier Regions & Catalog Editor */}
        <div className="lg:col-span-8 space-y-5">
          {selectedSupplier && (
            <>
              {/* Delivery Regions Editor */}
              <div className="bg-white rounded-3xl border border-gray-200 p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-extrabold text-gray-900">
                      {selectedSupplier.company_name} — 배송 권역 설정 (delivery_regions)
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveRegions}
                    className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold inline-flex items-center space-x-1 self-start sm:self-auto"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>권역 저장</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PRESET_REGIONS.map((reg) => {
                    const checked = regionDraft.includes(reg);
                    return (
                      <button
                        key={reg}
                        type="button"
                        onClick={() =>
                          setRegionDraft((prev) =>
                            prev.includes(reg)
                              ? prev.filter((r) => r !== reg)
                              : [...prev, reg]
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                          checked
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {checked ? "✓ " : "+ "}
                        {reg}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={customRegionInput}
                    onChange={(e) => setCustomRegionInput(e.target.value)}
                    placeholder="직접 권역 추가 (예: 서울특별시 서초구)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = customRegionInput.trim();
                      if (v && !regionDraft.includes(v)) {
                        setRegionDraft((prev) => [...prev, v]);
                      }
                      setCustomRegionInput("");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold"
                  >
                    권역 추가
                  </button>
                </div>
              </div>

              {/* Catalog Editor Table */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-extrabold text-gray-900">
                        공급 단가표 편집 ({Object.keys(catalogMap).length}개 등록됨)
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        포장단위(package_weight)와 공급가(package_price)를 직접 입력하거나
                        엑셀/CSV로 한 번에 업로드하세요.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleDownloadSampleCatalog}
                        className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 inline-flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>샘플 CSV</span>
                      </button>
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center space-x-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {uploading ? "업로드 중..." : "엑셀/CSV 단가표 업로드"}
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleBulkCatalogUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {["ALL", "육류", "해산물", "유제품", "채소/과일", "소스/공산품"].map(
                        (c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCatFilter(c)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              catFilter === c
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {c === "ALL" ? "전체" : c}
                          </button>
                        )
                      )}
                      <label className="inline-flex items-center space-x-1 text-xs text-gray-600 ml-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onlyRegistered}
                          onChange={(e) => setOnlyRegistered(e.target.checked)}
                          className="accent-emerald-600"
                        />
                        <span>등록 품목만</span>
                      </label>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="품목 검색..."
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs w-44"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-gray-50 text-gray-500 font-semibold border-b z-10">
                      <tr>
                        <th className="py-3 px-4">표준 품목</th>
                        <th className="py-3 px-3 w-32">포장단위</th>
                        <th className="py-3 px-3 w-36">포장공급가 (원)</th>
                        <th className="py-3 px-3 text-right bg-emerald-50/50 text-emerald-900">
                          환산 기준단가
                        </th>
                        <th className="py-3 px-3 text-right">저장</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredItems.map((item) => {
                        const d = drafts[item.id] || {
                          package_weight: "",
                          package_price: "",
                        };
                        const w = Number(d.package_weight);
                        const p = Number(d.package_price);
                        const unitPrice =
                          Number.isFinite(w) && w > 0 && Number.isFinite(p) && p > 0
                            ? Math.round((p / w) * 100) / 100
                            : null;
                        const isRegistered = Boolean(catalogMap[item.id]);

                        return (
                          <tr
                            key={item.id}
                            className={isRegistered ? "bg-emerald-50/20" : "bg-white"}
                          >
                            <td className="py-2.5 px-4">
                              <div className="font-bold text-gray-900">
                                {item.item_name}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {item.category} · {item.spec}
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  placeholder="중량"
                                  value={d.package_weight}
                                  onChange={(e) =>
                                    setDrafts((prev) => ({
                                      ...prev,
                                      [item.id]: {
                                        package_weight: e.target.value,
                                        package_price:
                                          prev[item.id]?.package_price ?? "",
                                      },
                                    }))
                                  }
                                  className="w-16 px-2 py-1 rounded-lg border border-gray-200 font-mono font-bold text-right"
                                />
                                <span className="font-mono text-gray-500">
                                  {item.base_unit}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="number"
                                min="0"
                                step="100"
                                placeholder="공급가"
                                value={d.package_price}
                                onChange={(e) =>
                                  setDrafts((prev) => ({
                                    ...prev,
                                    [item.id]: {
                                      package_weight:
                                        prev[item.id]?.package_weight ?? "",
                                      package_price: e.target.value,
                                    },
                                  }))
                                }
                                className="w-28 px-2 py-1 rounded-lg border border-gray-200 font-mono font-bold text-right"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-700 bg-emerald-50/30 whitespace-nowrap">
                              {unitPrice !== null
                                ? `${formatPrice(unitPrice)}/${item.base_unit}`
                                : "-"}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <button
                                type="button"
                                disabled={savingCatalog}
                                onClick={() => handleSaveSingleCatalogRow(item)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] mr-1"
                              >
                                저장
                              </button>
                              {isRegistered && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCatalogRow(item)}
                                  className="p-1 text-gray-400 hover:text-rose-600 align-middle"
                                  title="단가 삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5 inline" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Virtual Supplier Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-extrabold text-gray-900">
                  가상 유통업체 신규 등록 (is_admin_managed: true)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVirtualSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  가상 유통업체명 *
                </label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="예: 청주 로컬도매 B, 가락시장 기준가"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    사업자번호 (선택)
                  </label>
                  <input
                    type="text"
                    value={newBusinessNumber}
                    onChange={(e) => setNewBusinessNumber(e.target.value)}
                    placeholder="예: 301-99-12345"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    소재지/메모 (선택)
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="예: 충북 청주 농수산물시장"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  배송 가능 권역 (delivery_regions)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_REGIONS.map((reg) => {
                    const selected = newRegions.includes(reg);
                    return (
                      <button
                        key={reg}
                        type="button"
                        onClick={() =>
                          setNewRegions((prev) =>
                            prev.includes(reg)
                              ? prev.filter((r) => r !== reg)
                              : [...prev, reg]
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          selected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {reg}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold"
                >
                  {creating ? "생성 중..." : "가상 유통업체 등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
