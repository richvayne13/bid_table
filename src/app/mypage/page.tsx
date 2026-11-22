"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import { formatNumber, formatPrice } from "@/lib/utils";
import { getUnifiedRfqs, UnifiedRfq } from "@/lib/unified-rfq-store";
import {
  User,
  Store,
  Truck,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  LogOut,
  ChevronRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  Scale,
  PlusCircle,
  Receipt,
  Sparkles,
  Edit3,
} from "lucide-react";

export default function MyPage() {
  const router = useRouter();
  const { currentUser, logout } = useRole();
  const [activeTab, setActiveTab] = useState("rfqs");
  const [rfqs, setRfqs] = useState<UnifiedRfq[]>([]);

  useEffect(() => {
    setRfqs(getUnifiedRfqs());
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-[#6366F1]">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-gray-900">
            로그인이 필요한 페이지입니다
          </h2>
          <p className="text-xs text-gray-500">
            구매자(식당) 또는 판매자(유통사) 계정으로 로그인하시면 내 견적 내역과 입찰 현황을 확인하실 수 있습니다.
          </p>
          <div className="pt-2 space-y-2">
            <Link
              href="/login"
              className="w-full block py-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs transition-colors shadow-sm"
            >
              로그인하기
            </Link>
            <Link
              href="/restaurant/register"
              className="w-full block py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
            >
              회원가입하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* 1. 상단 프로필 요약 카드 (개개인 커스텀 정보) */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm shrink-0 ${
              currentUser.role === "RESTAURANT"
                ? "bg-blue-100 text-blue-600"
                : currentUser.role === "SUPPLIER"
                ? "bg-indigo-100 text-indigo-600"
                : "bg-emerald-100 text-emerald-600"
            }`}
          >
            {currentUser.role === "RESTAURANT" && <Store className="w-8 h-8" />}
            {currentUser.role === "SUPPLIER" && <Truck className="w-8 h-8" />}
            {currentUser.role === "ADMIN" && <ShieldCheck className="w-8 h-8" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">
                {currentUser.name}
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  currentUser.role === "RESTAURANT"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : currentUser.role === "SUPPLIER"
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {currentUser.badge || (currentUser.role === "RESTAURANT" ? "식당 구매자" : "유통사")}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              {currentUser.description || "견적식탁 인증 회원"}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 pt-1">
              <span className="flex items-center text-gray-600">
                <Mail className="w-3.5 h-3.5 mr-1 text-gray-400" />
                {currentUser.email}
              </span>
              {currentUser.phone && (
                <span className="flex items-center text-gray-600">
                  <Phone className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  {currentUser.phone}
                </span>
              )}
              {currentUser.businessNumber && (
                <span className="text-gray-500">
                  사업자번호: <strong className="text-gray-700">{currentUser.businessNumber}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 우측 액션 버튼 */}
        <div className="flex items-center space-x-2 self-stretch md:self-auto justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center space-x-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>

      {/* 2. 역할별 맞춤형 마이페이지 탭 컨텐츠 */}

      {/* [A] 식당(구매자) 전용 뷰 - 내가 넣은 견적 및 입찰 비교 */}
      {currentUser.role === "RESTAURANT" && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 border-b border-gray-200 pb-3">
            <button
              onClick={() => setActiveTab("rfqs")}
              className={`text-sm font-bold pb-2 transition-colors relative ${
                activeTab === "rfqs"
                  ? "text-gray-900 border-b-2 border-gray-900 font-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              내가 등록한 견적 요청서 ({rfqs.length}건)
            </button>
            <button
              onClick={() => setActiveTab("bids")}
              className={`text-sm font-bold pb-2 transition-colors relative ${
                activeTab === "bids"
                  ? "text-gray-900 border-b-2 border-gray-900 font-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              입찰 참여 유통사 비교
            </button>
          </div>

          {activeTab === "rfqs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-gray-900">
                  진행 중인 식자재 견적 요청서 ({rfqs.length}건)
                </h3>
                <Link
                  href="/rfq/new"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>새 견적 요청서 작성</span>
                </Link>
              </div>

              {rfqs.map((r) => {
                const totalEstimated = (r.rfq_items || []).reduce(
                  (acc, it) => acc + (it.current_unit_price || 0) * (it.monthly_qty || 0),
                  0
                );
                const itemsSummary = (r.rfq_items || [])
                  .map((it) => it.standard_items?.item_name || "식자재")
                  .slice(0, 4)
                  .join(", ") + ((r.rfq_items?.length || 0) > 4 ? ` 외 ${(r.rfq_items?.length || 0) - 4}건` : "");

                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:border-blue-300 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            입찰 진행 중 ({r.bids?.length || 0}곳 참여)
                          </span>
                          <span className="text-xs text-gray-400">
                            등록일: {r.created_at.split("T")[0]}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-gray-900 mt-1">
                          {r.title}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">
                          기존 매입가 기준 월 총액
                        </span>
                        <span className="text-xl font-black text-blue-600">
                          {totalEstimated > 0 ? formatPrice(totalEstimated) : "견적 요청 중"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-gray-50 p-3 rounded-xl">
                      <div>
                        <span className="text-gray-400 block">배송 권역</span>
                        <span className="font-bold text-gray-800">{r.region}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">계약 기간</span>
                        <span className="font-bold text-gray-800">{r.contract_months}개월 단가 고정</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">희망 요일</span>
                        <span className="font-bold text-blue-600">
                          {r.delivery_days?.join(", ") || "협의"} (새벽배송)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">결제 조건</span>
                        <span className="font-bold text-gray-800">{r.payment_terms}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-gray-500">
                        요청 품목: <strong className="text-gray-800">{itemsSummary}</strong>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Link
                          href={`/rfq/${r.id}/compare`}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>유통사 비교 매트릭스 보기 ({r.bids?.length || 0}곳)</span>
                        </Link>
                        <Link
                          href="/contracts/e0000000-0000-0000-0000-000000000001/audit"
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5 text-rose-500" />
                          <span>단가 감시</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "bids" && (
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-gray-900">
                내 요청서에 참여한 유통사 실시간 견적
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "(주)한결축산 유통",
                    bidAmount: 2430000,
                    savingRate: "10.0% 절감",
                    delivery: "주 3회 새벽 6시 전 입고",
                    trust: "단가준수율 99.8%",
                    isBest: true,
                  },
                  {
                    name: "밀라노 푸드 시스템",
                    bidAmount: 2480000,
                    savingRate: "8.1% 절감",
                    delivery: "이탈리안 정통 유제품 특화",
                    trust: "단가준수율 99.2%",
                    isBest: false,
                  },
                  {
                    name: "가락농산 신선물류",
                    bidAmount: 2510000,
                    savingRate: "7.0% 절감",
                    delivery: "가락시장 새벽 경매품 직송",
                    trust: "단가준수율 99.5%",
                    isBest: false,
                  },
                ].map((bid, i) => (
                  <div
                    key={i}
                    className={`bg-white rounded-2xl border p-5 space-y-3 flex flex-col justify-between ${
                      bid.isBest ? "border-blue-400 shadow-md ring-2 ring-blue-100" : "border-gray-200"
                    }`}
                  >
                    <div>
                      {bid.isBest && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-blue-600 text-white mb-2">
                          최저가 추천 입찰
                        </span>
                      )}
                      <h4 className="text-base font-black text-gray-900">{bid.name}</h4>
                      <p className="text-2xl font-black text-blue-600 mt-1">
                        {formatPrice(bid.bidAmount)}
                      </p>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">
                        {bid.savingRate}
                      </span>

                      <div className="mt-3 text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-100">
                        <p>• {bid.delivery}</p>
                        <p>• {bid.trust}</p>
                      </div>
                    </div>

                    <Link
                      href="/rfq/d0000000-0000-0000-0000-000000000001/compare"
                      className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-gray-900 hover:bg-black text-white transition-colors"
                    >
                      단가표 상세 비교하기
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* [B] 유통사(판매자) 전용 뷰 - 내가 제출한 입찰 내역 */}
      {currentUser.role === "SUPPLIER" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900">
              내가 참여한 입찰 공고 내역
            </h3>
            <Link
              href="/supplier/rfqs"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>새 식당 공고 보러가기 →</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-bold">
                  제출 완료 (심사 진행 중)
                </span>
                <h4 className="text-lg font-black text-gray-900 mt-1">
                  살롱순라 정기 이탈리안 식자재 견적 요청서
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">발주처: 살롱순라 (서울 종로구 익선동)</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">내가 제안한 금액</span>
                <span className="text-xl font-black text-indigo-600">₩2,430,000</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-gray-50 p-3 rounded-xl">
              <div>
                <span className="text-gray-400 block">제출 일자</span>
                <span className="font-bold text-gray-800">2026. 11. 22</span>
              </div>
              <div>
                <span className="text-gray-400 block">배송 조건</span>
                <span className="font-bold text-indigo-600">주 3회 냉장탑차 새벽배송</span>
              </div>
              <div>
                <span className="text-gray-400 block">정산 방식</span>
                <span className="font-bold text-gray-800">월말정산 (수수료 0원 직거래)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* [C] 관리자 전용 뷰 */}
      {currentUser.role === "ADMIN" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200 space-y-3">
            <h3 className="text-lg font-black text-emerald-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>견적식탁 플랫폼 통합 관제 시스템</span>
            </h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              운영관리자 계정(richman2561)으로 인증되었습니다. 표준 품목 마스터, 등록 유통사 단가표, 식당 RFQ 대리 입찰 관제를 수행하실 수 있습니다.
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <span>관리자 대시보드 바로가기 →</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
