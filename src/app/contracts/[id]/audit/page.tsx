"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatNumber } from "@/lib/utils";
import { AuditComparisonRow } from "@/lib/compare-engine";
import { PriceLockType } from "@/types/database";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileImage,
  Lock,
  TrendingUp,
  Receipt,
  History,
  Send,
  Scale,
} from "lucide-react";

function ContractAuditContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const contractId = typeof params?.id === "string" ? params.id : "";
  const justConfirmed = searchParams.get("confirmed") === "1";

  const supabase = useMemo(() => createClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [contract, setContract] = useState<any>(null);
  const [siblingContracts, setSiblingContracts] = useState<any[]>([]);
  const [priceLockType, setPriceLockType] = useState<PriceLockType>("FIXED");
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active OCR comparison state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    rows: AuditComparisonRow[];
    violation_count: number;
    total_overcharge: number;
    isMock: boolean;
    message: string;
  } | null>(null);

  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState<string | null>(null);

  const loadContractData = async () => {
    if (!contractId) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data: contractData, error: cErr } = await supabase
        .from("contracts")
        .select("*, profiles(id, company_name, trust_score), rfqs(id, title, region)")
        .eq("id", contractId)
        .single();

      if (cErr) throw cErr;
      setContract(contractData);

      const [siblingsRes, bidRes, auditsRes] = await Promise.all([
        supabase
          .from("contracts")
          .select("id, supplier_id, profiles(company_name)")
          .eq("rfq_id", contractData.rfq_id)
          .order("created_at", { ascending: true }),
        supabase
          .from("bids")
          .select("price_lock_type")
          .eq("rfq_id", contractData.rfq_id)
          .eq("supplier_id", contractData.supplier_id)
          .maybeSingle(),
        supabase
          .from("invoice_audits")
          .select("*")
          .eq("contract_id", contractId)
          .order("created_at", { ascending: false }),
      ]);

      setSiblingContracts(siblingsRes.data || []);
      setAudits(auditsRes.data || []);

      // Determine price_lock_type from contract_items snapshot or supplier's bid
      const firstItemLock = contractData.contract_items?.[0]?.price_lock_type;
      if (firstItemLock === "INDEXED" || bidRes.data?.price_lock_type === "INDEXED") {
        setPriceLockType("INDEXED");
      } else {
        setPriceLockType("FIXED");
      }
    } catch (err: any) {
      console.error("Failed to load contract audit data:", err);
      setErrorMsg(err?.message || "계약 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const contractItems: any[] = useMemo(
    () => (Array.isArray(contract?.contract_items) ? contract.contract_items : []),
    [contract]
  );

  // Run OCR / Sample Invoice Comparison
  const runAudit = async (file: File | null, forceMock: boolean) => {
    if (contractItems.length === 0) {
      setErrorMsg("대조할 계약 확정 품목이 없습니다.");
      return;
    }

    try {
      setAnalyzing(true);
      setErrorMsg(null);
      setDisputeSuccess(null);

      if (file) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
      }

      const formData = new FormData();
      if (file) formData.append("file", file);
      if (forceMock) formData.append("mock", "true");
      formData.append("contractItems", JSON.stringify(contractItems));
      formData.append("priceLockType", priceLockType);

      const res = await fetch("/api/audit-invoice", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "거래명세서 대조 분석에 실패했습니다.");
        return;
      }

      setAuditResult({
        rows: data.rows || [],
        violation_count: data.violation_count ?? 0,
        total_overcharge: data.total_overcharge ?? 0,
        isMock: Boolean(data.isMock),
        message: data.message || "대조 완료",
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("거래명세서 분석 요청 중 오류가 발생했습니다.");
    } finally {
      setAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) runAudit(file, false);
  };

  // [무단 인상 이의제기 및 차액 정산 요청] -> invoice_audits 기록 + supplier trust_score 차감
  const handleSubmitDispute = async () => {
    if (!contract || !auditResult) return;

    try {
      setSubmittingDispute(true);
      setErrorMsg(null);

      const parsedItemsToSave = auditResult.rows.map((r) => ({
        item_name: r.item_name,
        invoiced_unit_price: r.invoiced_unit_price,
        contract_unit_price: r.contract_unit_price,
        qty: r.qty,
        is_violation: r.is_violation,
        diff: r.diff,
      }));

      // 1. Insert into invoice_audits
      const { error: auditErr } = await supabase.from("invoice_audits").insert({
        contract_id: contract.id,
        image_url: previewUrl ? "uploaded-invoice-image" : "sample-audit-test",
        parsed_items: parsedItemsToSave,
        violation_count: auditResult.violation_count,
        total_overcharge: auditResult.total_overcharge,
      });

      if (auditErr) throw auditErr;

      // 2. Deduct supplier trust_score (-1.5점 per violation item)
      const currentTrust = Number(contract.profiles?.trust_score ?? 100);
      const deduction = Math.max(1.5, auditResult.violation_count * 1.5);
      const nextTrust = Math.max(0, Math.round((currentTrust - deduction) * 10) / 10);

      const { error: trustErr } = await supabase
        .from("profiles")
        .update({ trust_score: nextTrust })
        .eq("id", contract.supplier_id);

      if (trustErr) throw trustErr;

      setDisputeSuccess(
        `이의제기 및 차액 정산 요청(${formatPrice(
          auditResult.total_overcharge
        )})이 invoice_audits에 기록되었고, ${
          contract.profiles?.company_name
        }의 단가준수율(trust_score)이 ${currentTrust.toFixed(1)}% → ${nextTrust.toFixed(
          1
        )}% (-${deduction.toFixed(1)}%p)로 즉시 반영되었습니다.`
      );

      await loadContractData();
    } catch (err: any) {
      console.error("Dispute submission failed:", err);
      setErrorMsg(`이의제기 기록 실패: ${err?.message || "오류가 발생했습니다."}`);
    } finally {
      setSubmittingDispute(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <Link
            href="/rfq"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>견적 요청 목록 (/rfq)</span>
          </Link>
          {contract?.rfq_id && (
            <Link
              href={`/rfq/${contract.rfq_id}/compare`}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg border border-orange-200"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>매트릭스 비교 보기</span>
            </Link>
          )}
        </div>

        {/* Sibling Contracts Switcher (if 2-supplier split contract) */}
        {siblingContracts.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-semibold">분할 체결 계약 전환:</span>
            {siblingContracts.map((sib) => (
              <Link
                key={sib.id}
                href={`/contracts/${sib.id}/audit`}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  sib.id === contractId
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {sib.profiles?.company_name || "계약사"}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Just Confirmed Banner */}
      {justConfirmed && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>계약 확정 및 확정 단가 스냅샷 저장이 완료되었습니다!</strong> 아래에서
            거래명세서 OCR 대조 및 단가 인상 방어 감시를 바로 테스트할 수 있습니다.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          계약 스냅샷 및 단가 감시 이력을 불러오는 중...
        </div>
      ) : !contract ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3">
          <p className="text-sm font-bold text-gray-800">
            해당 계약을 찾을 수 없습니다.
          </p>
          <Link
            href="/rfq"
            className="inline-flex px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
          >
            견적 목록으로 돌아가기
          </Link>
        </div>
      ) : (
        <>
          {/* Contract Overview Header */}
          <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-500/15">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>사후 단가 인상 방어 센터 · OCR 거래명세서 대조</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {contract.profiles?.company_name || "계약 유통사"} 단가 감시
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-rose-100">
                  <span>공고: {contract.rfqs?.title || "정기 식자재 계약"}</span>
                  <span>•</span>
                  <span>
                    계약 기간: {contract.start_date} ~ {contract.end_date}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-white/20 font-bold text-white">
                    {priceLockType === "FIXED" ? (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>고정단가형 (1원 초과 시 적발)</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        <span>시세연동 상한형 (+10% 초과 시 적발)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-white/15 backdrop-blur border border-white/25 rounded-2xl px-5 py-3.5 text-right shrink-0">
                <div className="text-[11px] text-rose-100 font-medium">
                  유통사 단가 준수율 (trust_score)
                </div>
                <div className="text-3xl font-black flex items-center justify-end space-x-1.5 mt-0.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-200" />
                  <span>{Number(contract.profiles?.trust_score ?? 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1. 계약 확정 단가표 (Snapshot) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-gray-900">
                  1. 계약 확정 단가 스냅샷 ({contractItems.length}품목)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  계약 확정 시점의 기준단가(kg/L/ea) 스냅샷으로, 모든 납품 거래명세서 대조의
                  절대 기준이 됩니다.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
                기준 정책:{" "}
                {priceLockType === "FIXED"
                  ? "고정단가 (허용오차 0%)"
                  : "시세연동 (허용오차 +10%)"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">확정 품목명</th>
                    <th className="py-3 px-4 text-center">기준 단위</th>
                    <th className="py-3 px-4 text-right">계약 포장규격 / 공급가</th>
                    <th className="py-3 px-4 text-right bg-slate-100/70 font-bold text-slate-800">
                      확정 기준단가 (스냅샷)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contractItems.map((ci, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {ci.item_name}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-gray-600">
                        {ci.base_unit}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500 font-mono">
                        {ci.package_weight && ci.package_price
                          ? `${ci.package_weight}${ci.base_unit} · ${formatPrice(
                              ci.package_price
                            )}`
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 bg-slate-50/70">
                        {formatPrice(ci.normalized_unit_price)} / {ci.base_unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. 거래명세서 업로드 & OCR 대조 실행 */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-rose-600" />
                  <span>2. 납품 거래명세서 OCR 대조 검사</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  실제 거래명세서 이미지를 업로드하거나, API 키 없이 샘플 명세서 버튼으로
                  무단 단가 인상 적발을 즉시 테스트할 수 있습니다.
                </p>
              </div>

              <button
                type="button"
                disabled={analyzing}
                onClick={() => runAudit(null, true)}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 shadow-md shadow-rose-500/20 transition-all shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {analyzing ? "명세서 분석 중..." : "단가 인상 포함 샘플 명세서 테스트"}
                </span>
              </button>
            </div>

            {/* Image Upload Box */}
            <div className="border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-2xl p-6 text-center transition-colors bg-gray-50/50">
              {previewUrl ? (
                <div className="flex flex-col items-center space-y-2 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="거래명세서 미리보기"
                    className="max-h-40 rounded-xl border border-gray-200 shadow-sm object-contain"
                  />
                  <span className="text-[11px] text-gray-500 flex items-center space-x-1">
                    <FileImage className="w-3.5 h-3.5" />
                    <span>업로드된 거래명세서</span>
                  </span>
                </div>
              ) : (
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              )}

              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold inline-block transition-colors">
                  {analyzing ? "OCR 대조 실행 중..." : "거래명세서 이미지 업로드 (JPG/PNG)"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={analyzing}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-gray-400 mt-2">
                OPENAI_API_KEY 설정 시 GPT-4o-mini Vision OCR로 추출하며, 미설정 시 샘플
                명세서로 자동 대조됩니다.
              </p>
            </div>

            {/* Audit Comparison Results Table */}
            {auditResult && (
              <div className="space-y-4 pt-2">
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    auditResult.violation_count > 0
                      ? "bg-rose-50 border-rose-300"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <div className="flex items-start space-x-2.5">
                    {auditResult.violation_count > 0 ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">
                        {auditResult.message}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {auditResult.violation_count > 0
                          ? `총 ${auditResult.violation_count}개 품목에서 무단 단가 인상이 적발되었습니다. 총 초과 청구액: ${formatPrice(
                              auditResult.total_overcharge
                            )}`
                          : "모든 품목이 계약 확정 단가 기준을 정상 준수하고 있습니다."}
                      </div>
                    </div>
                  </div>

                  {auditResult.violation_count > 0 && (
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-rose-700 block font-semibold">
                        총 초과 청구 차액
                      </span>
                      <span className="text-xl font-black text-rose-600">
                        +{formatPrice(auditResult.total_overcharge)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 font-semibold border-b">
                      <tr>
                        <th className="py-3 px-4">품목명</th>
                        <th className="py-3 px-4 text-right">납품 수량</th>
                        <th className="py-3 px-4 text-right">계약 확정 단가</th>
                        <th className="py-3 px-4 text-right">명세서 청구 단가</th>
                        <th className="py-3 px-4 text-right">인상률 (%)</th>
                        <th className="py-3 px-4 text-right">초과 청구 차액</th>
                        <th className="py-3 px-4 text-center">판정 결과</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditResult.rows.map((r, idx) => (
                        <tr
                          key={idx}
                          className={
                            r.is_violation
                              ? "bg-rose-50/90 text-rose-950 font-semibold"
                              : "bg-white"
                          }
                        >
                          <td className="py-3 px-4 font-bold">
                            <div className="flex items-center space-x-1.5">
                              {r.is_violation && (
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                              <span>{r.item_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {formatNumber(r.qty)} {r.base_unit}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-600">
                            {formatPrice(r.contract_unit_price)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-extrabold ${
                              r.is_violation ? "text-rose-600" : "text-emerald-700"
                            }`}
                          >
                            {formatPrice(r.invoiced_unit_price)}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold ${
                              r.is_violation
                                ? "text-rose-600"
                                : r.increase_rate_pct > 0
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {r.increase_rate_pct > 0
                              ? `+${r.increase_rate_pct.toFixed(1)}%`
                              : `${r.increase_rate_pct.toFixed(1)}%`}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-extrabold">
                            {r.is_violation ? (
                              <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                                +{formatPrice(r.overcharge_amount)}
                              </span>
                            ) : (
                              <span className="text-gray-400">₩0</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {r.is_violation ? (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-bold">
                                무단 인상 적발
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                {r.reason}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Dispute Action Button */}
                {auditResult.violation_count > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-gray-500">
                      이의제기 제출 시 <code className="font-mono font-bold">invoice_audits</code>에
                      적발 이력이 저장되고, 해당 유통사의{" "}
                      <code className="font-mono font-bold">trust_score</code>가 즉시 차감됩니다.
                    </p>
                    <button
                      type="button"
                      disabled={submittingDispute}
                      onClick={handleSubmitDispute}
                      className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-rose-500/25 transition-all shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {submittingDispute
                          ? "이의제기 및 신뢰도 반영 중..."
                          : "무단 인상 이의제기 및 차액 정산 요청"}
                      </span>
                    </button>
                  </div>
                )}

                {disputeSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{disputeSuccess}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. 누적 거래명세서 감시 이력 (invoice_audits) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
                <History className="w-5 h-5 text-slate-600" />
                <span>3. 이 계약의 누적 단가 감시 이력 ({audits.length}건)</span>
              </h2>
            </div>

            {audits.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                아직 저장된 이의제기 및 감시 이력이 없습니다. 위에서 샘플 명세서 대조 후
                이의제기를 제출해 보세요.
              </p>
            ) : (
              <div className="space-y-3">
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2.5 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                          무단 인상 {audit.violation_count}건 적발
                        </span>
                        <span className="font-extrabold text-rose-700">
                          총 초과 청구 {formatPrice(audit.total_overcharge)}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {new Date(audit.created_at).toLocaleString("ko-KR")}
                      </span>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-rose-100 space-y-1.5">
                      {(audit.parsed_items || []).map((p: any, i: number) => (
                        <div
                          key={i}
                          className="flex flex-wrap items-center justify-between gap-2 py-0.5 border-b last:border-b-0 border-gray-100"
                        >
                          <span className="font-semibold text-gray-900">
                            {p.item_name} (수량 {p.qty})
                          </span>
                          <div className="flex items-center space-x-3 font-mono">
                            <span className="text-gray-500">
                              계약 {formatPrice(p.contract_unit_price)}
                            </span>
                            <span
                              className={
                                p.is_violation
                                  ? "font-bold text-rose-600"
                                  : "text-emerald-700"
                              }
                            >
                              청구 {formatPrice(p.invoiced_unit_price)}
                            </span>
                            {p.is_violation && (
                              <span className="text-rose-600 font-extrabold">
                                +{formatPrice(p.diff * p.qty)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ContractAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-sm text-gray-400">
          단가 감시 페이지를 불러오는 중...
        </div>
      }
    >
      <ContractAuditContent />
    </Suspense>
  );
}
