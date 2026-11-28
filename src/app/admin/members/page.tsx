"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";
import { getMembersRegistry } from "@/lib/auth-storage";
import { MemberRecord, UserRole } from "@/types/database";
import {
  FileSpreadsheet,
  Download,
  Search,
  Users,
  Store,
  Truck,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Filter,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function AdminMembersPage() {
  const supabase = useMemo(() => createClient(), []);

  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "RESTAURANT" | "SUPPLIER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // 회원 데이터 로딩 (Supabase 우선 조회, 없을 시 auth-storage의 로컬/시드 레지스트리 반환)
  const loadMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("members_registry")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        // Fallback to unified local storage
        const localList = getMembersRegistry();
        setMembers(localList);
      } else {
        setMembers(data as MemberRecord[]);
      }
    } catch (e) {
      const localList = getMembersRegistry();
      setMembers(localList);
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // 필터링된 회원 목록
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // 1. 역할 필터
      if (activeTab !== "ALL" && m.role !== activeTab) return false;

      // 2. 상태 필터
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;

      // 3. 권역 필터
      if (selectedRegion !== "ALL" && !m.region.includes(selectedRegion)) return false;

      // 4. 검색어 (상호명, 대표자, 사업자번호, 이메일, 전화번호, 품목)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const cats = [
          m.cuisine_category || "",
          ...(m.supply_categories || []),
        ].join(" ").toLowerCase();

        const match =
          m.company_name.toLowerCase().includes(query) ||
          m.representative.toLowerCase().includes(query) ||
          m.business_number.replace(/-/g, "").includes(query.replace(/-/g, "")) ||
          m.email.toLowerCase().includes(query) ||
          m.phone.replace(/-/g, "").includes(query.replace(/-/g, "")) ||
          m.region.toLowerCase().includes(query) ||
          cats.includes(query);

        if (!match) return false;
      }

      return true;
    });
  }, [members, activeTab, statusFilter, selectedRegion, searchQuery]);

  // 통계 집계
  const stats = useMemo(() => {
    const buyers = members.filter((m) => m.role === "RESTAURANT");
    const suppliers = members.filter((m) => m.role === "SUPPLIER");
    return {
      total: members.length,
      buyers: buyers.length,
      suppliers: suppliers.length,
      haccpSuppliers: suppliers.filter((s) => s.is_haccp).length,
    };
  }, [members]);

  // 실제 XLSX 파일 내보내기 (SheetJS)
  const handleExportExcel = () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const wb = XLSX.utils.book_new();

      // 1. 전체 시트 데이터 매핑
      const allRows = filteredMembers.map((m, idx) => ({
        "No": idx + 1,
        "회원구분": m.role === "RESTAURANT" ? "구매자(식당)" : "공급사(유통)",
        "상호명": m.company_name,
        "대표자": m.representative,
        "사업자등록번호": m.business_number,
        "연락처": m.phone,
        "로그인계정(이메일)": m.email,
        "영업권역/소재지": m.region,
        "상세주소": m.address,
        "업태/취급품목":
          m.role === "RESTAURANT"
            ? m.cuisine_category || "-"
            : (m.supply_categories || []).join(", "),
        "월매입액/MOQ":
          m.role === "RESTAURANT"
            ? m.monthly_spend || "-"
            : `${(m.moq_amount || 0).toLocaleString()}원`,
        "냉장탑차": m.role === "SUPPLIER" ? `${m.refrigerated_trucks || 0}대` : "-",
        "HACCP인증": m.role === "SUPPLIER" ? (m.is_haccp ? "인증" : "미인증") : "-",
        "신뢰평점": m.role === "SUPPLIER" ? `${m.trust_score || 100}점` : "-",
        "상태": m.status === "ACTIVE" ? "정상" : m.status,
        "가입일시": m.created_at,
      }));

      const wsAll = XLSX.utils.json_to_sheet(allRows);
      XLSX.utils.book_append_sheet(wb, wsAll, "전체회원명부");

      // 2. 구매자 전용 시트
      const buyerRows = filteredMembers
        .filter((m) => m.role === "RESTAURANT")
        .map((m, idx) => ({
          "No": idx + 1,
          "식당상호명": m.company_name,
          "대표자명": m.representative,
          "사업자등록번호": m.business_number,
          "연락처": m.phone,
          "이메일": m.email,
          "매장소재지": m.address,
          "영업권역": m.region,
          "업태분류": m.cuisine_category || "일반음식점",
          "월식자재매입액": m.monthly_spend || "-",
          "결제방식": m.payment_terms || "월말정산",
          "회원상태": m.status,
          "가입일": m.created_at,
        }));
      if (buyerRows.length > 0) {
        const wsBuyer = XLSX.utils.json_to_sheet(buyerRows);
        XLSX.utils.book_append_sheet(wb, wsBuyer, "구매자(외식업)");
      }

      // 3. 공급사 전용 시트
      const supplierRows = filteredMembers
        .filter((m) => m.role === "SUPPLIER")
        .map((m, idx) => ({
          "No": idx + 1,
          "유통사명": m.company_name,
          "대표자명": m.representative,
          "사업자번호": m.business_number,
          "담당연락처": m.phone,
          "이메일": m.email,
          "물류센터주소": m.address,
          "전문취급품목": (m.supply_categories || []).join(", "),
          "배송권역": (m.delivery_regions || []).join(", "),
          "냉장탑차수": m.refrigerated_trucks || 0,
          "최소주문금액(MOQ)": m.moq_amount || 0,
          "신뢰도점수": m.trust_score || 100,
          "HACCP보유": m.is_haccp ? "Y" : "N",
          "승인상태": m.status,
          "가입일": m.created_at,
        }));
      if (supplierRows.length > 0) {
        const wsSupplier = XLSX.utils.json_to_sheet(supplierRows);
        XLSX.utils.book_append_sheet(wb, wsSupplier, "공급사(유통업체)");
      }

      // 파일 다운로드 실행
      XLSX.writeFile(wb, `셀프바이어_입점회원명부_${today}.xlsx`);

      setExportNotice(
        `[성공] ${filteredMembers.length}명의 회원 데이터가 '셀프바이어_입점회원명부_${today}.xlsx'로 안전하게 다운로드되었습니다.`
      );
      setTimeout(() => setExportNotice(null), 4000);
    } catch (e: any) {
      alert("엑셀 내보내기 중 오류가 발생했습니다: " + e.message);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. 상단 브레드크럼 & 헤더 (블루 테마) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/80 pb-5 text-white">
        <div>
          <div className="flex items-center space-x-2 text-xs text-blue-300 mb-1">
            <Link href="/admin" className="hover:text-white flex items-center gap-1 font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>운영관리자 홈</span>
            </Link>
            <span>/</span>
            <span className="text-white font-bold">회원 관리 명부</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-blue-400" />
              <span>입점 회원 관리 엑셀 스프레드시트</span>
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-extrabold border border-blue-400/30">
              Live Database
            </span>
          </div>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            구매자(식당 사장님) 및 유통사의 모든 가입 정보를 고밀도 엑셀 스프레드시트 형태로 실시간 조회하고 실제 .xlsx 파일로 내보냅니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadMembers}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-blue-700 bg-blue-900/40 hover:bg-blue-800 text-blue-200 text-xs font-bold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
            <span>새로고침</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>엑셀 다운로드 (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 스킬 가이드 라벨 배너 */}
      <div className="px-4 py-2.5 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-200 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-bold text-white">적용 스킬:</span>
          <code className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-700/60">
            admin-member-spreadsheet-view
          </code>
          <span className="hidden sm:inline text-blue-300">
            — 고밀도 스프레드시트 뷰, 실시간 다중 검색, SheetJS 다중 시트 XLSX 추출
          </span>
        </div>
        <Link
          href="/admin/suppliers"
          className="text-blue-300 hover:text-white flex items-center gap-1 text-[11px] font-semibold"
        >
          <span>유통사 단가표 관리 이동</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* 다운로드 성공 알림 토스트 */}
      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* 2. 통계 요약 카드 4종 (블루 카드) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0b2240] border border-blue-800 shadow-sm flex items-center gap-3.5 text-white">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-blue-300 font-semibold">총 등록 회원수</p>
            <p className="text-xl sm:text-2xl font-black text-white tabular-nums">
              {stats.total}개사
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b2240] border border-blue-800 shadow-sm flex items-center gap-3.5 text-white">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-blue-300 font-semibold">구매자 (외식업체)</p>
            <p className="text-xl sm:text-2xl font-black text-blue-400 tabular-nums">
              {stats.buyers}개 매장
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b2240] border border-blue-800 shadow-sm flex items-center gap-3.5 text-white">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-blue-300 font-semibold">공급업체 (유통사)</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-300 tabular-nums">
              {stats.suppliers}개사
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b2240] border border-blue-800 shadow-sm flex items-center gap-3.5 text-white">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-blue-300 font-semibold">HACCP 인증 공급사</p>
            <p className="text-xl sm:text-2xl font-black text-purple-300 tabular-nums">
              {stats.haccpSuppliers}개사
            </p>
          </div>
        </div>
      </div>

      {/* 3. 상단 탭 & 다차원 검색/필터 바 (블루 테마) */}
      <div className="bg-[#0b2240] rounded-2xl border border-blue-800 p-4 shadow-md space-y-4 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* 역할별 탭 */}
          <div className="inline-flex rounded-xl bg-blue-950/80 p-1 border border-blue-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === "ALL"
                  ? "bg-blue-600 text-white shadow-xs font-black"
                  : "text-blue-300 hover:text-white"
              }`}
            >
              전체 명부 ({members.length})
            </button>
            <button
              onClick={() => setActiveTab("RESTAURANT")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "RESTAURANT"
                  ? "bg-blue-500 text-white shadow-xs font-black"
                  : "text-blue-300 hover:text-blue-200"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>구매자 식당 ({stats.buyers})</span>
            </button>
            <button
              onClick={() => setActiveTab("SUPPLIER")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "SUPPLIER"
                  ? "bg-indigo-600 text-white shadow-xs font-black"
                  : "text-blue-300 hover:text-indigo-200"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>공급·유통사 ({stats.suppliers})</span>
            </button>
          </div>

          {/* 권역 & 상태 빠른 필터 */}
          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="text-xs bg-blue-950 border border-blue-700 rounded-lg px-2.5 py-2 font-semibold text-blue-200 focus:outline-none focus:border-blue-400"
            >
              <option value="ALL">전체 권역</option>
              <option value="종로">서울 종로/중구</option>
              <option value="강남">서울 강남/서초</option>
              <option value="성동">서울 성동/마장</option>
              <option value="송파">서울 송파/가락</option>
              <option value="인천">인천/경기</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-blue-950 border border-blue-700 rounded-lg px-2.5 py-2 font-semibold text-blue-200 focus:outline-none focus:border-blue-400"
            >
              <option value="ALL">전체 상태</option>
              <option value="ACTIVE">정상 (ACTIVE)</option>
              <option value="PENDING">심사중 (PENDING)</option>
            </select>
          </div>
        </div>

        {/* 검색 인풋 */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상호명, 대표자명, 사업자등록번호(10자리), 이메일, 연락처, 취급품목 검색..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-700 bg-blue-950/70 hover:bg-blue-950 focus:bg-blue-950 text-xs sm:text-sm font-medium text-white placeholder:text-blue-400/60 focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      {/* 4. 고밀도 엑셀 스프레드시트 테이블 뷰 */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-normal">
            {/* 스프레드시트 헤더 (엑셀 스타일 회색/정갈한 톤) */}
            <thead>
              <tr className="bg-[#f2f4f8] border-b border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-[11px] select-none">
                <th className="py-2.5 px-3 border-r border-gray-300 w-12 text-center">No.</th>
                <th className="py-2.5 px-3 border-r border-gray-300 w-24 text-center">구분</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[140px]">상호명</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[90px]">대표자</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[120px] text-center font-mono">사업자등록번호</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[110px] text-center font-mono">연락처</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[150px]">로그인 계정(이메일)</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[130px]">영업권역</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[200px]">상세 소재지</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[160px]">업태 / 취급품목</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[110px] text-right">매입규모/MOQ</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[80px] text-center">탑차/인증</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[80px] text-center">신뢰도</th>
                <th className="py-2.5 px-3 border-r border-gray-300 min-w-[80px] text-center">상태</th>
                <th className="py-2.5 px-3 min-w-[90px] text-center font-mono">가입일시</th>
              </tr>
            </thead>

            {/* 스프레드시트 바디 */}
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-12 text-center text-gray-500 font-medium">
                    일치하는 회원 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => {
                  const isBuyer = member.role === "RESTAURANT";
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-blue-50/40 transition-colors font-medium text-gray-800"
                    >
                      {/* No. */}
                      <td className="py-2 px-3 border-r border-gray-200 text-center text-gray-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* 구분 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-center">
                        {isBuyer ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                            <Store className="w-2.5 h-2.5" />
                            BUYER
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                            <Truck className="w-2.5 h-2.5" />
                            SUPPLIER
                          </span>
                        )}
                      </td>

                      {/* 상호명 */}
                      <td className="py-2 px-3 border-r border-gray-200 font-bold text-gray-950">
                        {member.company_name}
                      </td>

                      {/* 대표자 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-700">
                        {member.representative}
                      </td>

                      {/* 사업자등록번호 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-center font-mono text-[11px] text-gray-700">
                        {member.business_number}
                      </td>

                      {/* 연락처 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-center font-mono text-[11px] text-gray-600">
                        {member.phone}
                      </td>

                      {/* 로그인 이메일 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-600">
                        {member.email}
                      </td>

                      {/* 영업권역 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-700">
                        {member.region}
                      </td>

                      {/* 상세소재지 주소 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-500 truncate max-w-[220px]" title={member.address}>
                        {member.address}
                      </td>

                      {/* 업태/취급품목 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-gray-700">
                        {isBuyer ? (
                          <span className="text-gray-800 font-medium">
                            {member.cuisine_category || "일반음식점"}
                          </span>
                        ) : (
                          <span className="text-indigo-900 font-semibold">
                            {(member.supply_categories || []).join(", ") || "-"}
                          </span>
                        )}
                      </td>

                      {/* 매입규모 / MOQ */}
                      <td className="py-2 px-3 border-r border-gray-200 text-right font-mono text-gray-800 font-bold">
                        {isBuyer
                          ? member.monthly_spend || "-"
                          : `MOQ ${(member.moq_amount || 0).toLocaleString()}원`}
                      </td>

                      {/* 탑차 / HACCP */}
                      <td className="py-2 px-3 border-r border-gray-200 text-center">
                        {!isBuyer ? (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-gray-700 font-bold">
                              {member.refrigerated_trucks || 0}대
                            </span>
                            {member.is_haccp && (
                              <span className="px-1 py-0.2 rounded bg-purple-50 text-purple-700 text-[9px] font-extrabold border border-purple-200">
                                HACCP
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* 신뢰도 점수 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-center font-mono font-bold">
                        {!isBuyer ? (
                          <span className="text-emerald-700">
                            {member.trust_score || 100}점
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* 상태 */}
                      <td className="py-2 px-3 border-r border-gray-200 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          정상
                        </span>
                      </td>

                      {/* 가입일시 */}
                      <td className="py-2 px-3 text-center text-gray-500 font-mono text-[11px]">
                        {member.created_at ? member.created_at.split("T")[0] : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 테이블 하단 푸터 요약 */}
        <div className="px-4 py-3 bg-[#f8fafc] border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div>
            총 <strong className="text-gray-900 font-bold">{members.length}</strong>개 회원 중{" "}
            <strong className="text-blue-600 font-bold">{filteredMembers.length}</strong>개 데이터 표시 중
          </div>
          <div className="text-[11px] text-gray-400">
            * 엑셀 다운로드 시 현재 필터링된 모든 항목이 .xlsx 파일의 다중 시트로 분리 저장됩니다.
          </div>
        </div>
      </div>

    </div>
  );
}
