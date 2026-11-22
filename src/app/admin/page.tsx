"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import {
  FileSpreadsheet,
  Building2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Gavel,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Save,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    standardItems: 0,
    restaurants: 0,
    suppliers: 0,
    virtualSuppliers: 0,
    openRfqs: 0,
    totalRfqs: 0,
    violationCount: 0,
    totalOvercharge: 0,
  });
  const [audits, setAudits] = useState<any[]>([]);
  const [trustDrafts, setTrustDrafts] = useState<Record<string, string>>({});
  const [savingSupplierId, setSavingSupplierId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      const [itemsRes, profilesRes, rfqsRes, auditsRes] = await Promise.all([
        supabase
          .from("standard_items")
          .select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id, role, is_admin_managed, trust_score"),
        supabase.from("rfqs").select("id, status"),
        supabase
          .from("invoice_audits")
          .select(
            "*, contracts(id, supplier_id, rfq_id, profiles(id, company_name, trust_score, is_admin_managed), rfqs(title))"
          )
          .order("created_at", { ascending: false }),
      ]);

      const profiles = profilesRes.data || [];
      const rfqs = rfqsRes.data || [];
      const auditList = auditsRes.data || [];

      const restaurants = profiles.filter((p) => p.role === "RESTAURANT").length;
      const suppliers = profiles.filter((p) => p.role === "SUPPLIER").length;
      const virtualSuppliers = profiles.filter(
        (p) => p.role === "SUPPLIER" && p.is_admin_managed
      ).length;
      const openRfqs = rfqs.filter((r) => r.status === "OPEN").length;
      const violationCount = auditList.reduce(
        (acc, a) => acc + (Number(a.violation_count) || 0),
        0
      );
      const totalOvercharge = auditList.reduce(
        (acc, a) => acc + (Number(a.total_overcharge) || 0),
        0
      );

      setStats({
        standardItems: itemsRes.count ?? 0,
        restaurants,
        suppliers,
        virtualSuppliers,
        openRfqs,
        totalRfqs: rfqs.length,
        violationCount,
        totalOvercharge,
      });

      setAudits(auditList);

      const drafts: Record<string, string> = {};
      auditList.forEach((a: any) => {
        const sup = a.contracts?.profiles;
        if (sup?.id) {
          drafts[sup.id] = String(Number(sup.trust_score ?? 100).toFixed(1));
        }
      });
      setTrustDrafts(drafts);
    } catch (err: any) {
      console.error("Admin monitoring load error:", err);
      setNotice({
        type: "error",
        text: err?.message || "운영 데이터를 불러오지 못했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdjustTrustDraft = (supplierId: string, delta: number) => {
    setTrustDrafts((prev) => {
      const cur = Number(prev[supplierId] ?? 100);
      const next = Math.min(100, Math.max(0, Math.round((cur + delta) * 10) / 10));
      return { ...prev, [supplierId]: next.toFixed(1) };
    });
  };

  const handleSaveTrustScore = async (supplierId: string, companyName: string) => {
    const raw = Number(trustDrafts[supplierId]);
    if (!Number.isFinite(raw) || raw < 0 || raw > 100) {
      setNotice({
        type: "error",
        text: "신뢰도 점수는 0.0 ~ 100.0 사이 숫자여야 합니다.",
      });
      return;
    }

    try {
      setSavingSupplierId(supplierId);
      setNotice(null);
      const rounded = Math.round(raw * 10) / 10;

      const { error } = await supabase
        .from("profiles")
        .update({ trust_score: rounded })
        .eq("id", supplierId);

      if (error) throw error;

      setNotice({
        type: "success",
        text: `${companyName}의 단가 준수율(trust_score)을 ${rounded.toFixed(
          1
        )}%로 조정하여 저장했습니다.`,
      });
      await loadMonitoringData();
    } catch (err: any) {
      setNotice({
        type: "error",
        text: `신뢰도 저장 실패: ${err?.message || "오류가 발생했습니다."}`,
      });
    } finally {
      setSavingSupplierId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            통합 플랫폼 운영 모니터링
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            표준 식자재 마스터, 가입 식당/유통사, 오픈 역경매 및 무단 단가 인상 신고를 한눈에
            관리합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={loadMonitoringData}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>실시간 새로고침</span>
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

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/items"
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-emerald-400 transition-all flex items-center space-x-4"
        >
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">전체 등록 표준 품목</div>
            <div className="text-2xl font-black text-gray-900 mt-0.5">
              {stats.standardItems}종
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">
              단건/엑셀 일괄 관리 →
            </div>
          </div>
        </Link>

        <Link
          href="/admin/suppliers"
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-400 transition-all flex items-center space-x-4"
        >
          <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">가입 식당 / 유통사</div>
            <div className="text-2xl font-black text-gray-900 mt-0.5">
              식당 {stats.restaurants} · 유통 {stats.suppliers}
            </div>
            <div className="text-[11px] text-blue-700 font-semibold">
              운영자 가상업체 {stats.virtualSuppliers}곳 포함 →
            </div>
          </div>
        </Link>

        <Link
          href="/admin/rfqs"
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-orange-400 transition-all flex items-center space-x-4"
        >
          <div className="p-3 rounded-xl bg-orange-100 text-orange-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">진행 중 견적 요청 (OPEN)</div>
            <div className="text-2xl font-black text-gray-900 mt-0.5">
              {stats.openRfqs}건{" "}
              <span className="text-xs font-medium text-gray-400">
                / 전체 {stats.totalRfqs}건
              </span>
            </div>
            <div className="text-[11px] text-orange-700 font-semibold">
              원클릭 대리 입찰 실행 →
            </div>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">단가 인상 적발 건수</div>
            <div className="text-2xl font-black text-rose-600 mt-0.5">
              {stats.violationCount}건
            </div>
            <div className="text-[11px] text-rose-600 font-semibold">
              누적 과다청구 {formatPrice(stats.totalOvercharge)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/items"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-sm font-extrabold text-gray-900">
              표준 품목 마스터 관리
            </div>
            <p className="text-xs text-gray-500">
              단건 등록 모달 및 엑셀/CSV 일괄 Upsert
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/suppliers"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-blue-400 shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-sm font-extrabold text-gray-900">
              가상 유통사 &amp; 단가표 관리
            </div>
            <p className="text-xs text-gray-500">
              지역 도매상·온라인 기준가 생성 및 단가표 편집
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/admin/rfqs"
          className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-orange-400 shadow-sm transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
              <Gavel className="w-4 h-4 text-orange-600" />
              <span>원클릭 대리 입찰 실행</span>
            </div>
            <p className="text-xs text-gray-500">
              오픈 RFQ에 가상 유통사 단가표 자동 매칭 투찰
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Invoice Audits & Supplier Trust Score Management Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>무단 단가 인상 신고 내역 및 유통사 신뢰도(trust_score) 조정</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              거래명세서 OCR 대조로 접수된 단가 인상 신고(`invoice_audits`)를 검토하고 유통사의
              신뢰도 점수를 직접 조정합니다.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold self-start sm:self-auto">
            총 {audits.length}건 접수됨
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-400">
              신고 내역을 불러오는 중...
            </div>
          ) : audits.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-400">
              접수된 무단 단가 인상 신고가 없습니다.
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 font-semibold border-b">
                <tr>
                  <th className="py-3.5 px-4">접수 일시</th>
                  <th className="py-3.5 px-4">대상 유통사 / 공고</th>
                  <th className="py-3.5 px-4">적발 상세 품목</th>
                  <th className="py-3.5 px-4 text-right">적발 / 초과청구</th>
                  <th className="py-3.5 px-4 text-center">현재 신뢰도</th>
                  <th className="py-3.5 px-4 text-right">신뢰도 점수 조정 (trust_score)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {audits.map((audit) => {
                  const sup = audit.contracts?.profiles;
                  const supId = sup?.id || audit.contracts?.supplier_id;
                  const violatedItems = (audit.parsed_items || []).filter(
                    (p: any) => p.is_violation
                  );

                  return (
                    <tr key={audit.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(audit.created_at).toLocaleDateString("ko-KR")}
                        <div className="text-[10px] text-gray-400">
                          {new Date(audit.created_at).toLocaleTimeString("ko-KR")}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-gray-900">
                            {sup?.company_name || "유통사"}
                          </span>
                          {sup?.is_admin_managed && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              가상업체
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[200px]">
                          {audit.contracts?.rfqs?.title || "체결 계약"}
                        </div>
                        {audit.contract_id && (
                          <Link
                            href={`/contracts/${audit.contract_id}/audit`}
                            className="inline-flex items-center space-x-0.5 text-[11px] text-blue-600 hover:underline mt-0.5"
                          >
                            <span>감시 상세 보기</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {(violatedItems.length > 0
                            ? violatedItems
                            : audit.parsed_items || []
                          ).map((p: any, idx: number) => (
                            <div key={idx} className="text-xs">
                              <span className="font-semibold text-gray-800">
                                {p.item_name}
                              </span>{" "}
                              <span className="text-gray-400 font-mono">
                                ({formatPrice(p.contract_unit_price)} →{" "}
                                <strong className="text-rose-600">
                                  {formatPrice(p.invoiced_unit_price)}
                                </strong>
                                )
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                          {audit.violation_count}건 적발
                        </span>
                        <div className="font-extrabold text-rose-600 font-mono mt-1">
                          +{formatPrice(audit.total_overcharge)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                            Number(sup?.trust_score ?? 100) >= 95
                              ? "bg-emerald-100 text-emerald-800"
                              : Number(sup?.trust_score ?? 100) >= 85
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {Number(sup?.trust_score ?? 100).toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {supId && (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleAdjustTrustDraft(supId, -3)}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200"
                            >
                              -3
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustTrustDraft(supId, -1)}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustTrustDraft(supId, +1)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200"
                            >
                              +1
                            </button>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={trustDrafts[supId] ?? "100.0"}
                              onChange={(e) =>
                                setTrustDrafts((prev) => ({
                                  ...prev,
                                  [supId]: e.target.value,
                                }))
                              }
                              className="w-16 px-2 py-1 rounded-lg border border-gray-300 font-mono text-xs font-bold text-right"
                            />
                            <button
                              type="button"
                              disabled={savingSupplierId === supId}
                              onClick={() =>
                                handleSaveTrustScore(
                                  supId,
                                  sup?.company_name || "유통사"
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black disabled:opacity-50 text-white text-[11px] font-bold inline-flex items-center space-x-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>저장</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
