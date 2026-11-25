"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HaengbokMeatCompare } from "@/components/compare/HaengbokMeatCompare";
import {
  Sparkles,
  Layers,
  Store,
  Inbox,
  ArrowRight,
  Eye,
  Send,
  CheckCircle2,
  Table,
  Sliders,
  MessageSquare,
  CreditCard,
  Maximize2,
  ExternalLink,
} from "lucide-react";

export default function PrototypesPage() {
  const [activeTab, setActiveTab] = useState("sehyun");
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [pitchSent, setPitchSent] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* 헤더 배너 */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 셀프바이어 (selfbuyer) UX 디자인 랩
            </div>
            <h1 className="text-2xl font-black">
              구매자 도안 10선 & 판매자 도안 10선 인터랙티브 쇼케이스
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              살롱순라 식당 구매자 10대 레이아웃 도안 + 마장동 벨엘미트 판매자 10대 도안 통합 탑재
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="./prototypes.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
            >
              <ExternalLink className="w-3.5 h-3.5" /> 독립 전체화면 HTML로 보기
            </a>
            <Link
              href="/"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
            >
              메인 홈으로
            </Link>
          </div>
        </div>

        {/* 탭 네비게이터 */}
        <div className="bg-slate-950/70 border-t border-slate-800 px-4 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex space-x-2 py-2 text-xs">
            <button
              onClick={() => setActiveTab("sehyun")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "sehyun"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🌟 [핵심] 박세현 님 거래처 역제안 모델
            </button>
            <button
              onClick={() => setActiveTab("tab-1")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-1"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              1. 숨고식 퀘스트 위저드
            </button>
            <button
              onClick={() => setActiveTab("tab-2")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-2"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              2. 마켓보로식 B2B 카탈로그
            </button>
            <button
              onClick={() => setActiveTab("tab-3")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-3"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              3. 마장동 실무 엑셀 그리드
            </button>
            <button
              onClick={() => setActiveTab("tab-4")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-4"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              4. B-4. 3스텝 맞춤 퀘스트
            </button>
            <button
              onClick={() => setActiveTab("tab-5")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-5"
                  ? "bg-red-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              5. B-5. 행복쇼핑 견적비교 (실사판)
            </button>
            <button
              onClick={() => setActiveTab("tab-6")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-6"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              6. 토스식 30초 원페이저
            </button>
            <button
              onClick={() => setActiveTab("tab-7")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-7"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              7. 카카오톡 AI 메신저 봇
            </button>
            <button
              onClick={() => setActiveTab("tab-8")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-8"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              8. 틴더식 카드 스와이프
            </button>
            <button
              onClick={() => setActiveTab("tab-9")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-9"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              9. 스카이스캐너형 분할비교
            </button>
            <button
              onClick={() => setActiveTab("tab-10")}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition ${
                activeTab === "tab-10"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              10. 벨엘미트 실견적서 등록기
            </button>
          </div>
        </div>
      </div>

      {/* 탭 내용 영역 */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* ========================================================= */}
        {/* 🌟 박세현 님 파트너 모델: 거래처 역제안 리버스 피칭 */}
        {/* ========================================================= */}
        {activeTab === "sehyun" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-800/40">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" /> 파트너 박세현 님 대화 방향 구현
              </span>
              <h2 className="text-2xl font-black">"어떤 자재를 납품하세요? (육류)"</h2>
              <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
                바쁜 식당 사장님은 플랫폼을 탐색할 시간도 없습니다. 
                영업사원을 고용하는 마장동 등 축산 유통사들이 적극적으로 살롱순라를 찾아와 
                <strong>"우리가 더 저렴하고 신선하게 고기를 대겠다"</strong>고 역견적을 제안하는 비즈니스 모델입니다.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/40 text-emerald-300 flex items-center justify-center font-bold">1</span>
                  살롱순라 육류 스펙 상시 공개
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/40 text-emerald-300 flex items-center justify-center font-bold">2</span>
                  수익화: 매장 정보 열람 과금 (크레딧)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/40 text-emerald-300 flex items-center justify-center font-bold">3</span>
                  수익화: 다이렉트 견적 제안 건당 과금
                </span>
              </div>
            </div>

            {/* 품목 선택 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> 납품 품목 선택
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/50 flex flex-col items-center text-center relative">
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">입점 중</span>
                  <span className="text-3xl mb-1">🥩</span>
                  <span className="font-bold text-slate-900 text-sm">육류 / 축산</span>
                  <span className="text-[11px] text-emerald-700 mt-1">소고기, 수입육, 원육</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-40 flex flex-col items-center text-center">
                  <span className="text-3xl mb-1">🥬</span>
                  <span className="font-bold text-slate-700 text-sm">야채 / 청과</span>
                  <span className="text-[11px] text-slate-400 mt-1">추후 오픈 예정</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-40 flex flex-col items-center text-center">
                  <span className="text-3xl mb-1">🐟</span>
                  <span className="font-bold text-slate-700 text-sm">해산물 / 수산</span>
                  <span className="text-[11px] text-slate-400 mt-1">추후 오픈 예정</span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-40 flex flex-col items-center text-center">
                  <span className="text-3xl mb-1">📦</span>
                  <span className="font-bold text-slate-700 text-sm">포장용기 / 소모품</span>
                  <span className="text-[11px] text-slate-400 mt-1">추후 오픈 예정</span>
                </div>
              </div>
            </div>

            {/* 살롱순라 매장 카드 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-3xl flex-shrink-0">
                    🍷
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-black text-slate-900">살롱순라 (Salon Soonra)</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">상시 견적 수신 중</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">서울 종로구 율곡로 8길 75 (익선동 한옥마을)</p>
                    <p className="text-xs text-slate-600 mt-1">
                      🥩 <strong>월간 육류 소싱 규모:</strong> 약 600kg / 월 (살치살, 알목심, 채끝, 안심, 차돌)
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => setShowStoreModal(true)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" /> 매장 정보 열람 (1크레딧)
                  </button>
                  <button
                    onClick={() => setShowPitchModal(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" /> 다이렉트 역견적 제안
                  </button>
                </div>
              </div>

              {/* 살롱순라 공개 육류 스펙 */}
              <div className="mt-4">
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 살롱순라 현재 소싱 육류 스펙 (공개)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[11px] text-slate-500">EXCEL 초이스</span>
                    <div className="font-bold text-slate-900 text-sm">냉장 살치살</div>
                    <div className="text-xs text-slate-400 line-through mt-1">35,000원</div>
                    <div className="text-xs font-bold text-emerald-600">목표가 32,500원 이하</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[11px] text-slate-500">EXCEL 프라임</span>
                    <div className="font-bold text-slate-900 text-sm">냉장 알목심</div>
                    <div className="text-xs text-slate-400 line-through mt-1">28,000원</div>
                    <div className="text-xs font-bold text-emerald-600">목표가 25,900원 이하</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[11px] text-slate-500">호주산 TEYS GF</span>
                    <div className="font-bold text-slate-900 text-sm">동결 곡물 채끝</div>
                    <div className="text-xs text-slate-400 line-through mt-1">33,000원</div>
                    <div className="text-xs font-bold text-emerald-600">목표가 28,500원 이하</div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[11px] text-slate-500">호주산 AMH S등급</span>
                    <div className="font-bold text-slate-900 text-sm">냉장 S안심</div>
                    <div className="text-xs text-slate-400 line-through mt-1">48,000원</div>
                    <div className="text-xs font-bold text-emerald-600">목표가 44,000원 이하</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 살롱순라 역제안 수신함 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-emerald-600" /> [자영업자 뷰] 살롱순라 역제안 수신함
                </h3>
                <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-lg border border-amber-200">
                  {pitchSent ? "신규 제안 2건 도착" : "신규 제안 1건 도착"}
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                      벨엘
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">벨엘미트 (마장동 축산 도소매)</div>
                      <div className="text-xs text-slate-500">서울 성동구 마장로27길 6 · 대표 김지선</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">월 약 2,470,000원 절감 제안</span>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-emerald-50/20">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500">살치살 (초이스 냉장)</span>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="line-through text-slate-400">35,000원</span>
                      <span className="font-extrabold text-emerald-600 text-sm">32,500원/kg</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500">알목심 (프라임 냉장)</span>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="line-through text-slate-400">28,000원</span>
                      <span className="font-extrabold text-emerald-600 text-sm">25,900원/kg</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-500">S안심 (호주산 AMH 냉장)</span>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="line-through text-slate-400">48,000원</span>
                      <span className="font-extrabold text-emerald-600 text-sm">44,000원/kg</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white px-4 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500">월말정산 · 주 3회 직배송 · MOQ 1박스</span>
                  <button
                    onClick={() => alert("거래 계약이 체결되었습니다!")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow"
                  >
                    이 조건으로 계약 체결
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B-5. 행복쇼핑 견적비교 화면 직접 렌더링 */}
        {activeTab === "tab-5" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
              <span className="font-bold text-red-400">
                ★ [실사판 캡처 100% 재현] 행복쇼핑 미니샵별 육류 견적비교 인터랙티브 뷰
              </span>
              <span className="text-slate-400">수량 변경 시 최저 견적금액 실시간 재계산</span>
            </div>
            <HaengbokMeatCompare />
          </div>
        )}

        {/* 10개 세부 도안은 prototypes.html 임베드로 즉각 인터랙션 가능 */}
        {activeTab !== "sehyun" && activeTab !== "tab-5" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">인터랙티브 라이브 도안 프리뷰</span>
              <a
                href="./prototypes.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium flex items-center gap-1"
              >
                새 탭에서 전체화면 보기 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <iframe
              src="./prototypes.html"
              className="w-full h-[750px] border-0"
              title="Prototypes Live Lab"
            />
          </div>
        )}
      </div>

      {/* 매장 열람 모달 */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">살롱순라 매장 상세 정보</h3>
              <button onClick={() => setShowStoreModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="text-xs space-y-2 text-slate-700">
              <p><strong>상호:</strong> 살롱순라 (222-32-16745)</p>
              <p><strong>연락처:</strong> 010-8888-9999 (구매팀 직통)</p>
              <p><strong>소재지:</strong> 서울 종로구 율곡로 8길 75</p>
              <p><strong>희망 결제조건:</strong> 익월 10일 전액 현금 계좌이체</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowStoreModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold">닫기</button>
              <button
                onClick={() => {
                  setShowStoreModal(false);
                  setShowPitchModal(true);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                바로 견적 제안하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 견적 제안 모달 */}
      {showPitchModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">살롱순라에 육류 역견적 제안</h3>
              <button onClick={() => setShowPitchModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-500">
              살롱순라가 구매 희망하는 육류에 대해 공급 가능한 kg당 납품가를 입력하세요.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                <span>초이스 냉장 살치살 (목표가 32,500원)</span>
                <input defaultValue="32500" className="w-24 px-2 py-1 border rounded text-right font-bold text-emerald-700" />
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                <span>프라임 냉장 알목심 (목표가 25,900원)</span>
                <input defaultValue="25900" className="w-24 px-2 py-1 border rounded text-right font-bold text-emerald-700" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowPitchModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold">취소</button>
              <button
                onClick={() => {
                  setShowPitchModal(false);
                  setPitchSent(true);
                  alert("🎉 살롱순라에 견적서가 성공적으로 전송되었습니다!");
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
              >
                살롱순라에 견적서 투척 (전송)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
