"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Store,
  Truck,
  TrendingDown,
  ShieldCheck,
  Search,
  ChevronDown,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col bg-white overflow-hidden">
      
      {/* =========================================================================
          SECTION 1. 첫 화면: 좌우 분리 Hero (BUYER vs SUPPLIER)
          - 유첨 1번 이미지 기반: 좌측(BUYER/화이트) vs 우측(SUPPLIER/차콜 그레이)
         ========================================================================= */}
      <section id="split-hero" className="w-full border-b border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-5rem)]">
          
          {/* ----------------- 좌측: BUYER (매장 사장님) ----------------- */}
          <div
            id="buyer"
            className="flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 bg-white text-gray-900 border-b lg:border-b-0 lg:border-r border-gray-200"
          >
            <div className="space-y-8">
              {/* 상단 레이블 & 타이틀 */}
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-xs tracking-wider uppercase border border-blue-200">
                  <Store className="w-4 h-4" />
                  <span>BUYER (외식업 사장님)</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-400 leading-relaxed">
                  SELFBUYER의 페인 포인트와 이 불편함이 SELFBUYER에서 해소되는 느낌이 들도록
                </p>
                <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-gray-900 leading-snug tracking-tight">
                  구매할 품목 정보만 기재하면<br />
                  <span className="text-blue-600">여러 SUPPLIER</span>로부터 견적을 받고<br />
                  가장 합리적인 거래처 선정까지,
                </h1>
              </div>

              {/* BUYER 페인포인트 & 솔루션 리스트 1~4 */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                {/* 1번 */}
                <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs mt-0.5">
                    1
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
                    기존 납품처의 단가인상에 대처할 수 없는 당혹스러움
                  </p>
                </div>

                {/* 2번 */}
                <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs mt-0.5">
                    2
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
                    그래서 대체업체를 찾아보았지만, 잘 노출되어 있는 대형 거래처들은 단가의 메리트가 적음
                  </p>
                </div>

                {/* 3번 */}
                <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs mt-0.5">
                    3
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">
                    수소문해서 인근의 영세한 업자를 찾더라도, 직접 매장에서 일하는 사장님이 거래처와의 미팅을 하고, 견적서를 받아 직접 견적 비교하기엔 시간적으로 여유가 부족함
                  </p>
                </div>

                {/* 4번 (해결/결과 강조) */}
                <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-blue-50/90 border border-blue-200/80 shadow-sm">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs mt-0.5 shadow-xs">
                    4
                  </div>
                  <p className="text-sm sm:text-base text-blue-900 font-bold leading-relaxed">
                    사용하는 품목과 월간 사용량만 기재되면, 여러 업체로부터 견적을 받아 가장 합리적인 구매를 진행할 수 있게되는 사장님
                  </p>
                </div>
              </div>
            </div>

            {/* 좌측 하단 CTA 버튼 */}
            <div className="pt-8 sm:pt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/rfq/new"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <span>품목 등록하고 무료 견적 받기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pilot"
                className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-sm sm:text-base transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>구매업무 경감 시범 사이트 체험</span>
              </Link>
            </div>
          </div>

          {/* ----------------- 우측: SUPPLIER (공급·유통사) ----------------- */}
          <div
            id="supplier"
            className="flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 bg-[#3a3c42] text-white"
          >
            <div className="space-y-8">
              {/* 상단 레이블 & 타이틀 */}
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 text-zinc-200 font-extrabold text-xs tracking-wider uppercase border border-white/20 backdrop-blur-sm">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>SUPPLIER (납품·유통업체)</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-zinc-400 leading-relaxed">
                  SUPPLIER의 페인 포인트와 이 불편함이 SELFBUYER에서 해소되는 느낌이 들도록
                </p>
                <h2 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-white leading-snug tracking-tight">
                  권역별, 업태별 사장님을 한 눈에 확인하고,<br />
                  별도의 미팅없이 견적시 필요한 정보를 열람,<br />
                  <span className="text-emerald-400">자신있는 단가제시</span>로 새로운 거래처 발굴까지
                </h2>
              </div>

              {/* SUPPLIER 페인포인트 & 솔루션 리스트 1~4 */}
              <div className="space-y-4 pt-4 border-t border-zinc-700">
                {/* 1번 */}
                <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-xs mt-0.5">
                    1
                  </div>
                  <p className="text-sm sm:text-base text-zinc-200 font-medium leading-relaxed">
                    합리적인 단가엔 자신있지만, 거래처 발굴이 어려움
                  </p>
                </div>

                {/* 2번 */}
                <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-xs mt-0.5">
                    2
                  </div>
                  <p className="text-sm sm:text-base text-zinc-200 font-medium leading-relaxed">
                    어쩔수없이 마케팅과 영업에 비용을 씀으로써, 자신있었던 <span className="text-white font-bold">"합리적인 단가"</span>에서 경쟁력을 잃고 있음.
                  </p>
                </div>

                {/* 3번 */}
                <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-xs mt-0.5">
                    3
                  </div>
                  <p className="text-sm sm:text-base text-zinc-200 font-medium leading-relaxed">
                    여러 매장을 발로 뛰며 방문해도, 연락이 오는 사장님은 50명중 하나
                  </p>
                </div>

                {/* 4번 (해결/결과 강조) */}
                <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/50 shadow-sm">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-black text-xs mt-0.5 shadow-xs">
                    4
                  </div>
                  <p className="text-sm sm:text-base text-emerald-300 font-bold leading-relaxed">
                    SELFBUYER에서 별도의 마케팅과 영업 비용없이 직접 거래처를 찾게 되는 SUPPLIER
                  </p>
                </div>
              </div>
            </div>

            {/* 우측 하단 CTA 버튼 */}
            <div className="pt-8 sm:pt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/supplier/register-quote"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm sm:text-base shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <span>단가 직접 등록하고 거래처 찾기</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </Link>
              <Link
                href="/supplier/rfqs"
                className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base transition-all border border-white/10"
              >
                <span>외식 매장 견적 공고함 열람</span>
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 2. 세 번째 첨부 파일 기반 큼직한 배너
          - "매장내 관리부터 매장외 관리까지 사장님의 구매 업무를 덜어드릴게요"
         ========================================================================= */}
      <section id="banner" className="w-full bg-[#fcfcfc] py-24 sm:py-32 lg:py-40 px-6 sm:px-12 lg:px-20 border-b border-gray-200 relative overflow-hidden">
        {/* 은은한 배경 장식 요소 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-100/40 via-indigo-50/30 to-emerald-100/40 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8 sm:space-y-10 relative z-10">
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-gray-200/80 shadow-xs text-xs sm:text-sm font-bold text-gray-700">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>셀프바이어의 약속</span>
          </div>

          {/* 큼직한 메인 타이포그래피 (3번째 유첨 파일 원문 정확 반영) */}
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-950 tracking-tight leading-tight">
              매장내 관리부터
            </h2>
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-950 tracking-tight leading-tight">
              매장외 관리까지
            </h2>
            <p className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-600 tracking-tight leading-tight pt-2 sm:pt-4">
              사장님의 구매 업무를 덜어드릴게요
            </p>
          </div>

          {/* 서브 설명 문구 */}
          <p className="text-sm sm:text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed pt-2">
            발품 팔던 거래처 미팅, 매달 오르는 불투명한 식자재 단가 비교까지.<br className="hidden sm:inline" />
            품목만 등록하면 셀프바이어가 가장 투명하고 합리적인 직거래를 연결합니다.
          </p>

          {/* 시작 버튼 액션 */}
          <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/rfq/new"
              className="px-8 py-4 rounded-2xl bg-gray-950 hover:bg-black text-white font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>1분 만에 구매 업무 덜어내기</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pilot"
              className="px-8 py-4 rounded-2xl bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-bold text-base sm:text-lg shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>시범 사이트에서 즉시 체험하기</span>
            </Link>
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 3. 서비스소개 (상단 메뉴의 "서비스소개"와 바로 연결)
         ========================================================================= */}
      <section id="service" className="w-full py-20 sm:py-28 px-6 sm:px-12 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center space-y-4">
            <span className="text-xs sm:text-sm font-extrabold text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              SERVICE OVERVIEW
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              셀프바이어는 어떻게 사장님의 부담을 줄일까요?
            </h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
              미팅과 영업 비용을 없애고, 바이어와 서플라이어를 투명하게 직결하는 3단계 프로세스
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-blue-300 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                01
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                품목 및 사용량 간단 기재
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                바쁜 사장님이 영업사원과 미팅할 필요 없이, 매장에서 정기적으로 쓰는 품목과 월 사용량만 입력하면 공고가 즉시 시작됩니다.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                02
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                전문 공급사의 실시간 단가 제안
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                권역별 납품 경쟁력을 갖춘 공급사가 영업·마케팅 비용 없이 가장 자신 있는 직거래 단가로 투명하게 역제안합니다.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200/80 hover:border-indigo-300 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                03
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                원클릭 견적 비교 & 원가 절감
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                도착한 여러 공급사의 견적표를 규격·원산지·단가별로 한눈에 비교하고, 매달 수십~수백만 원의 식자재 원가를 절감합니다.
              </p>
            </div>
          </div>

          {/* 하단 요약 배너 */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-lg font-bold">지금 바로 셀프바이어에서 시작해보세요</p>
              <p className="text-xs sm:text-sm text-gray-300">
                구매자는 무료 견적 비교, 공급사는 무료 거래처 발굴이 가능합니다.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/rfq/new"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all"
              >
                BUYER 시작하기
              </Link>
              <Link
                href="/supplier/register-quote"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all"
              >
                SUPPLIER 시작하기
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
