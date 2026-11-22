"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole, DEMO_USERS } from "@/contexts/RoleContext";
import {
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  X,
  Phone,
  Truck,
  Users,
  TrendingUp,
  FileCheck,
  Award,
} from "lucide-react";

export default function SupplierJoinPage() {
  const router = useRouter();
  const { setCurrentUser } = useRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState(false);

  // 모달 폼 상태
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [agreed, setAgreed] = useState(true);

  // FAQ 아코디언 상태
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !service || !agreed) return;
    setConsultSuccess(true);
    setTimeout(() => {
      setConsultSuccess(false);
      setModalOpen(false);
      setName("");
      setPhone("");
      setService("");
    }, 2500);
  };

  const handleInstantJoin = () => {
    // 유통사 체험 계정으로 즉시 전환
    const supplierUser = DEMO_USERS.find((u) => u.role === "SUPPLIER") || DEMO_USERS[1];
    setCurrentUser(supplierUser);
    router.push("/supplier/rfqs");
  };

  const FAQS = [
    {
      q: "판매자(유통사) 가입 조건이 있나요?",
      a: "식자재 도소매업 사업자등록증을 보유하고 계신 모든 유통사, 도매상, 축산물 가공업체, 산지 유통인이 가입하실 수 있습니다. 냉장·냉동 탑차 및 HACCP 인증 보유 시 우수 공급사 뱃지가 부여됩니다.",
    },
    {
      q: "견적식탁 가입은 무료인가요?",
      a: "네! 유통사 파트너 입점 및 프로필 등록은 100% 무료입니다. 가입비나 월 고정 관리비가 전혀 발생하지 않습니다.",
    },
    {
      q: "견적식탁으로 연결된 고객과 거래를 하면 수수료가 발생하나요?",
      a: "아닙니다. 견적식탁은 식당과 유통사 간의 투명한 직거래를 지향하므로, 최종 납품 계약 금액에 대한 중개 수수료가 0%입니다. 납품 대금은 유통사 계좌로 100% 직접 정산받으실 수 있습니다.",
    },
    {
      q: "식당 견적 요청서에는 어떻게 입찰하나요?",
      a: "가입 후 '입찰 공고함'에 접속하시면 권역별 식당들이 올린 거래명세서 품목과 월 소요량이 실시간으로 표시됩니다. 자사가 취급하는 규격과 단가를 입력하여 손쉽게 견적서를 발송할 수 있습니다.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 1. 상단 히어로 섹션 (숨고 캡처 7 벤치마킹) */}
      <section className="relative bg-[#111827] text-white py-20 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
            외식업 사장님과 직접 연결되는 B2B 직거래 플랫폼
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            첫 고객부터 첫 수익까지<br />
            비즈니스의 시작은 견적식탁과 함께
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            영업 사원 없이도 매일 수백 곳의 식당 신규 납품 기회를 잡으세요.<br className="hidden sm:inline" />
            중개 수수료 0원, 투명한 직거래로 안정적인 정기 매출을 확보하세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-sm shadow-md transition-all"
            >
              고수 가입 상담받기
            </button>
            <button
              onClick={handleInstantJoin}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-extrabold text-sm shadow-md transition-all"
            >
              판매자 가입하기
            </button>
          </div>
        </div>

        {/* 2. 핵심 통계 지표 박스 (숨고 캡처 7 하단 수치 매칭) */}
        <div className="max-w-4xl mx-auto mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10">
            <p className="text-xs text-gray-300 font-medium">외식업 누적 가입자 수</p>
            <p className="text-3xl font-black text-white mt-1">16,000 곳 +</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10">
            <p className="text-xs text-gray-300 font-medium">월 식자재 견적 요청 건수</p>
            <p className="text-3xl font-black text-indigo-300 mt-1">45,000 건 +</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10">
            <p className="text-xs text-gray-300 font-medium">전국 검증 파트너 유통사</p>
            <p className="text-3xl font-black text-white mt-1">2,500 곳 +</p>
          </div>
        </div>
      </section>

      {/* 3. 견적식탁 이용 프로세스 STEP 1, 2, 3 (숨고 캡처 8 벤치마킹) */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            견적식탁에서 부담 없이 첫 식당 고객을 만나 보세요
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            복잡한 영업 미팅 없이, 모바일과 PC에서 실시간 단가 제안만으로 계약 성사
          </p>
        </div>

        <div className="space-y-12">
          {/* STEP 1 */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 sm:p-8 rounded-3xl bg-gray-50 border border-gray-100">
            <div className="space-y-3 max-w-md">
              <span className="px-2.5 py-1 rounded-full bg-gray-900 text-white text-[11px] font-black uppercase">
                STEP 1
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                유통사님의 식자재가 필요한<br />
                식당 고객을 무료로 연결해 드려요
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                종로구 양식당, 마포구 고깃집 등 우리 유통사 배송 권역 내 식당들이 올린 품목 규격과 월 예상 소요량을 실시간 알림으로 확인하세요.
              </p>
            </div>
            <div className="w-full md:w-72 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600">
                <span>🔔 새로운 견적 요청이 도착했어요</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                <p className="font-bold text-gray-800">익선동 살롱순라</p>
                <p className="text-gray-500 text-[11px]">이탈리안 양식 식자재 정기 납품 요청</p>
                <p className="text-gray-500 text-[11px]">• 치즈/버터/샤퀴테리 주 3회 새벽배송</p>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 sm:p-8 rounded-3xl bg-indigo-50/40 border border-indigo-100">
            <div className="space-y-3 max-w-md">
              <span className="px-2.5 py-1 rounded-full bg-[#6366F1] text-white text-[11px] font-black uppercase">
                STEP 2
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                원하는 고객에게<br />
                실시간 단가 견적을 제안하세요
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                자사의 경쟁력 있는 공급 단가를 원클릭으로 입력하세요. 최종 서비스 금액에 대한 중개 수수료가 전혀 없습니다.
              </p>
            </div>
            <div className="w-full md:w-72 bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 space-y-2.5">
              <p className="text-[11px] text-gray-400 font-bold">견적 제안 금액</p>
              <p className="text-xl font-black text-indigo-600">월 2,340,000 원</p>
              <div className="text-[11px] text-gray-500 bg-indigo-50/60 p-2 rounded-lg">
                수수료: 0원 (수수료 면제 프로모션 중)
              </div>
              <button className="w-full py-2 rounded-lg bg-[#6366F1] text-white text-xs font-bold">
                견적 발송하기
              </button>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6 sm:p-8 rounded-3xl bg-gray-50 border border-gray-100">
            <div className="space-y-3 max-w-md">
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase">
                STEP 3
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900">
                정기 납품 거래 대금은<br />
                유통사님이 전부 가져가세요
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                거래가 성사되면 식당과 직접 공급 계약을 체결하고, 납품 대금은 정산 지연 없이 100% 유통사 전용 계좌로 직접 수령합니다.
              </p>
            </div>
            <div className="w-full md:w-72 bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-gray-800">납품 계약 체결 완료</p>
              <p className="text-xs text-emerald-600 font-extrabold">정산 금액: 100% 직거래 입금</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 나만의 프로필로 손쉬운 홍보 (숨고 캡처 9 벤치마킹) */}
      <section className="bg-gray-50 border-t border-gray-200 py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              더 많은 식당을 만날 수 있는<br />
              견적식탁 맞춤형 홍보 프로필
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              어려운 마케팅을 하지 않아도 유통사의 냉장 탑차, 업력, 취급 규격과 품질 증명서를 등록해두면 권역 내 식당 사장님이 먼저 찾아옵니다.
            </p>
            <div className="space-y-2 text-xs font-bold text-gray-700">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>식약처 HACCP 인증 및 사업자등록증 공식 인증 뱃지</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>배송 권역 및 최소주문금액(MOQ) 조건 투명 공개</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>실제 납품 현장 사진과 식당 후기 자동 누적</span>
              </div>
            </div>
          </div>

          {/* 프로필 프리뷰 카드 */}
          <div className="w-full md:w-80 bg-white rounded-2xl border border-gray-200 p-5 shadow-md space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg">
                한결
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900">(주)한결축산 유통</h4>
                <p className="text-[11px] text-gray-400">1등급 한돈 및 수입육 전문</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">유통 업력</span>
                <span className="font-bold text-gray-800">15년차</span>
              </div>
              <div>
                <span className="text-gray-400 block">냉장 탑차</span>
                <span className="font-bold text-gray-800">12대 보유</span>
              </div>
            </div>
            <div className="text-[11px] text-indigo-700 bg-indigo-50 p-2 rounded-lg font-bold text-center">
              단가 준수율 99.8% · 우수 공급사 인증
            </div>
          </div>
        </div>
      </section>

      {/* 5. 자주 묻는 질문 FAQ (숨고 캡처 10 벤치마킹) */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-center text-gray-900 mb-8">
          자주 묻는 질문
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-sm text-gray-800 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    openFaqIndex === idx ? "rotate-180 text-indigo-600" : ""
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="p-4 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. 상담 신청 팝업 모달 (숨고 캡처 11 벤치마킹) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {consultSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-black text-gray-900">상담 신청이 완료되었습니다!</h3>
                <p className="text-xs text-gray-500">
                  견적식탁 입점 매니저가 영업일 1일 이내로 유선 연락 및 입점 가이드를 안내해 드립니다.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    상담을 위해 몇 가지만 알려주세요
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    신청하면 영업일 1일 이내 연락드릴게요.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      이름 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="실명으로 입력해 주세요."
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      휴대폰 번호 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="예) 010-1234-5678"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">
                      제공 서비스 (취급 식자재 품목) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      placeholder="제공할 서비스/식자재를 입력해 주세요."
                      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                    />
                    <label htmlFor="agree" className="text-xs text-gray-600 cursor-pointer">
                      <span className="text-indigo-600 font-bold underline mr-1">필수</span>
                      개인정보 수집 및 이용 동의
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!agreed}
                  className="w-full py-3.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-black text-sm shadow-md transition-all disabled:opacity-50"
                >
                  상담 신청하기
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
