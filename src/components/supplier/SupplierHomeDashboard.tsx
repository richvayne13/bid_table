"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Send,
  Eye,
  CheckCircle2,
  ChevronDown,
  Building2,
  Sparkles,
  Phone,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

interface StoreItem {
  name: string;
  category: string;
  tagline: string;
  appeal: {
    representativeImg: string;
    reviewCount: number;
    rating: number;
    reviewText: string;
  };
  wantedMeat: string[];
  wantedSeafood: string[];
  location: string;
  monthlyMeatKg?: string;
  targetPriceHighlight?: string;
}

const STORES: StoreItem[] = [
  {
    name: "살롱순라",
    category: "유러피안 한옥 다이닝 & 펍",
    tagline: "종로구 익선동 한옥 와인바",
    appeal: {
      representativeImg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
      reviewCount: 48,
      rating: 5.0,
      reviewText: "결제일(익월 10일) 전액 칼입금, 3년 연속 미수금 0원 우수 매장",
    },
    wantedMeat: ["살치 (초이스 냉장)", "차돌백이 (미국산)", "채끝등심 (TEYS GF)", "안심 (AMH S등급)"],
    wantedSeafood: ["생연어 슈페리어", "블랙타이거 새우", "가리비 관자", "홍합"],
    location: "서울 종로구 율곡로 8길 75",
    monthlyMeatKg: "월 약 600kg",
    targetPriceHighlight: "살치살 32,500원 이하 / 알목심 25,900원 이하",
  },
  {
    name: "퍼블릭 도원",
    category: "복합 문화 다이닝",
    tagline: "미식 & 와인 페어링 라운지",
    appeal: {
      representativeImg: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
      reviewCount: 32,
      rating: 4.9,
      reviewText: "대량 발주 중심, 규격 오차 없는 냉동 벌크팩 선호",
    },
    wantedMeat: ["살치 (EXCEL 냉동)", "알목심 (초이스 냉동)", "우삼겹"],
    wantedSeafood: ["냉동 오징어채", "바지락살", "칵테일 새우"],
    location: "서울 종로구 인사동길",
    monthlyMeatKg: "월 약 450kg",
    targetPriceHighlight: "냉동 살치 27,500원 / 냉동 알목심 16,000원",
  },
  {
    name: "더 멜란지",
    category: "캐주얼 브런치 & 스테이크",
    tagline: "스테이크 & 파스타 전문점",
    appeal: {
      representativeImg: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80",
      reviewCount: 26,
      rating: 4.9,
      reviewText: "마블링 균일도 중시, 주 3회 정기 입고",
    },
    wantedMeat: ["살치 (초이스 냉동)", "채끝 (TEYS GF 동결)", "부채살"],
    wantedSeafood: ["냉동 흰다리새우", "연어 필렛", "통문어"],
    location: "서울 종로구 삼청로",
    monthlyMeatKg: "월 약 380kg",
    targetPriceHighlight: "채끝 28,500원 / 냉동 살치 27,500원",
  },
  {
    name: "이층 양옥",
    category: "프렌치-이탈리안 비스트로",
    tagline: "익선동 핫플레이스 스테이크",
    appeal: {
      representativeImg: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      reviewCount: 19,
      rating: 4.8,
      reviewText: "스테이크 메뉴 인기 급상승, 안심·채끝 소싱 시급",
    },
    wantedMeat: ["안심 (호주산 S등급)", "채끝등심 (냉장)", "살치살"],
    wantedSeafood: ["가리비 관자", "바질페스토용 조개", "오징어 링"],
    location: "서울 종로구 돈화문로11나길",
    monthlyMeatKg: "월 약 320kg",
    targetPriceHighlight: "안심 44,000원 이하",
  },
  {
    name: "영춘옥",
    category: "80년 전통 한우·우육 곰탕 전문 노포",
    tagline: "종로 3가 곰탕·수육 원조",
    appeal: {
      representativeImg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
      reviewCount: 84,
      rating: 5.0,
      reviewText: "월 발주액 2천만 원 이상, 기름기 적은 원육 대량 구매",
    },
    wantedMeat: ["차돌박이 (냉동 슬라이스)", "양지 / 사태", "우골 / 사골"],
    wantedSeafood: ["국물용 다시 멸치", "건새우"],
    location: "서울 종로구 돈의동 (종로3가역)",
    monthlyMeatKg: "월 약 850kg",
    targetPriceHighlight: "차돌박이 20,000원 / 양지 대량 공급",
  },
  {
    name: "마장 미트라운지",
    category: "성수-마장 프리미엄 비프 다이닝",
    tagline: "마장동 축산시장 직송 와인 비스트로",
    appeal: {
      representativeImg: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
      reviewCount: 31,
      rating: 4.9,
      reviewText: "마장동 인근 새벽 직배송 희망, 신선 냉장 원육 우선 구매",
    },
    wantedMeat: ["살치 (초이스 냉장)", "안심 (AMH S등급)", "채끝등심 (TEYS GF)"],
    wantedSeafood: ["블랙타이거 새우", "가리비 관자"],
    location: "서울 성동구 마장로",
    monthlyMeatKg: "월 약 500kg",
    targetPriceHighlight: "살치살 32,500원 / 안심 44,000원",
  },
  {
    name: "압구정 비프하우스",
    category: "정통 아메리칸 스테이크하우스",
    tagline: "강남 로데오 드라이에이징 스테이크",
    appeal: {
      representativeImg: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
      reviewCount: 57,
      rating: 5.0,
      reviewText: "CAB 및 프라임급 원육 대량 소비, 월 단위 정기 계약",
    },
    wantedMeat: ["알목심 (척아이롤)", "채끝등심 (냉장)", "살치 (프라임 냉장)"],
    wantedSeafood: ["생연어 슈페리어", "바닷가재"],
    location: "서울 강남구 압구정로",
    monthlyMeatKg: "월 약 750kg",
    targetPriceHighlight: "프라임 알목심 25,900원 / 채끝 28,500원",
  },
  {
    name: "연남 그릴 비스트로",
    category: "캐주얼 브런치 & 파스타",
    tagline: "홍대·연남 핫플레이스 다이닝",
    appeal: {
      representativeImg: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80",
      reviewCount: 22,
      rating: 4.8,
      reviewText: "소포장 세절육 및 진공팩 선호, 주 2회 입고",
    },
    wantedMeat: ["차돌박이 (미국산)", "알목심 (초이스)", "우삼겹"],
    wantedSeafood: ["칵테일 새우", "홍합"],
    location: "서울 마포구 동교로",
    monthlyMeatKg: "월 약 350kg",
    targetPriceHighlight: "차돌박이 20,000원 이하",
  },
];

const SEOUL_DISTRICTS = [
  "종로구",
  "성동구",
  "강남구",
  "마포구",
  "중구",
  "동대문구",
  "용산구",
  "도봉구",
  "노원구",
  "강북구",
];

const MEAT_CUT_FILTERS = [
  "전체 품목",
  "살치살",
  "알목심",
  "안심",
  "채끝등심",
  "차돌박이",
  "우삼겹",
  "양지 / 사태",
];

const BUSINESS_TYPE_FILTERS = [
  "전체 업태",
  "다이닝 & 와인바",
  "스테이크하우스",
  "브런치",
  "비스트로",
  "전통 한식 노포",
];

export function SupplierHomeDashboard() {
  const [searchTab, setSearchTab] = useState<"region" | "item" | "business">("region");
  const [selectedDistrict, setSelectedDistrict] = useState("종로구");
  const [selectedMeatCut, setSelectedMeatCut] = useState("전체 품목");
  const [selectedBusiness, setSelectedBusiness] = useState("전체 업태");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [pitchModalStore, setPitchModalStore] = useState<StoreItem | null>(null);
  const [pitchSubmitted, setPitchSubmitted] = useState(false);

  // 동적 필터링 로직 (권역별 / 품목별 / 업태별 탭 및 검색어 완벽 연동)
  const filteredStores = React.useMemo(() => {
    return STORES.filter((store) => {
      // 1. 검색어 텍스트 필터
      if (searchKeyword.trim()) {
        const kw = searchKeyword.trim().toLowerCase();
        const matchesName = store.name.toLowerCase().includes(kw);
        const matchesLocation = store.location.toLowerCase().includes(kw);
        const matchesCategory = store.category.toLowerCase().includes(kw);
        const matchesMeat = store.wantedMeat.some((m) => m.toLowerCase().includes(kw));
        if (!matchesName && !matchesLocation && !matchesCategory && !matchesMeat) {
          return false;
        }
      }

      // 2. 탭별 세부 필터링
      if (searchTab === "region") {
        return store.location.includes(selectedDistrict);
      } else if (searchTab === "item") {
        if (selectedMeatCut === "전체 품목") return true;
        return store.wantedMeat.some((m) =>
          m.toLowerCase().includes(selectedMeatCut.replace("살", "").replace("등심", "").trim().toLowerCase())
        );
      } else if (searchTab === "business") {
        if (selectedBusiness === "전체 업태") return true;
        if (selectedBusiness === "다이닝 & 와인바") {
          return store.category.includes("다이닝") || store.category.includes("와인바") || store.tagline.includes("와인바");
        }
        if (selectedBusiness === "스테이크하우스") {
          return store.category.includes("스테이크") || store.tagline.includes("스테이크");
        }
        if (selectedBusiness === "브런치") {
          return store.category.includes("브런치");
        }
        if (selectedBusiness === "비스트로") {
          return store.category.includes("비스트로");
        }
        if (selectedBusiness === "전통 한식 노포") {
          return store.category.includes("노포") || store.category.includes("곰탕");
        }
        return store.category.includes(selectedBusiness);
      }

      return true;
    });
  }, [searchTab, selectedDistrict, selectedMeatCut, selectedBusiness, searchKeyword]);

  const resetFilters = () => {
    setSelectedDistrict("종로구");
    setSelectedMeatCut("전체 품목");
    setSelectedBusiness("전체 업태");
    setSearchKeyword("");
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 pb-20">
      {/* 1. 상단 브랜딩 & 슬로건 바 (중앙 정렬) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 font-sans">
            selfbuyer
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-600 mt-1.5">
            거래처 발굴부터, 견적 비교까지
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        {/* 판매자 모드 안내 알림 배너 */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
              🥩
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-950 text-sm">
                  [판매자 전용 홈] 지금 납품처를 찾고 있는 외식 사업장 목록
                </span>
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                  영업사원 리버스 피칭 모드
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                매장을 클릭하여 구매 희망 고기 스펙을 확인하고, 다이렉트 견적을 찔러넣으세요.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/supplier/rfqs"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs whitespace-nowrap transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>실시간 견적 공고함 열람 (금액 직접 입력)</span>
            </Link>
          </div>
        </div>

        {/* 2. 검색 & 권역 필터 영역 (유첨 도안 상단) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-10">
          {/* 상단 탭: 권역별 사장님 찾기 (볼드) vs 품목별 사장님 찾기 (연하게) vs 업태별 사장님 찾기 (연하게) */}
          <div className="flex items-center space-x-6 border-b border-slate-100 pb-3 mb-5 text-sm">
            <button
              onClick={() => setSearchTab("region")}
              className={`pb-2 relative transition ${
                searchTab === "region"
                  ? "text-slate-900 border-b-2 border-slate-900 font-black text-base"
                  : "text-slate-400 font-medium hover:text-slate-700"
              }`}
            >
              권역별 사장님 찾기
            </button>
            <button
              onClick={() => setSearchTab("item")}
              className={`pb-2 relative transition ${
                searchTab === "item"
                  ? "text-slate-900 border-b-2 border-slate-900 font-black text-base"
                  : "text-slate-400 font-medium hover:text-slate-700"
              }`}
            >
              품목별 사장님 찾기
            </button>
            <button
              onClick={() => setSearchTab("business")}
              className={`pb-2 relative transition ${
                searchTab === "business"
                  ? "text-slate-900 border-b-2 border-slate-900 font-black text-base"
                  : "text-slate-400 font-medium hover:text-slate-700"
              }`}
            >
              업태별 사장님 찾기
            </button>
          </div>

          {/* 메인 검색바: 탭에 따라 placeholder 변경 */}
          <div className="relative mb-5">
            <div className="flex items-center border-2 border-slate-300 focus-within:border-emerald-600 rounded-xl px-4 py-3 bg-white transition shadow-2xs">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={
                  searchTab === "region"
                    ? "서울 권역별 사장님 찾기 (예: 종로구, 성동구, 익선동, 마포구)"
                    : searchTab === "item"
                    ? "취급 품목별 사장님 찾기 (예: 살치살, 알목심, 안심, 채끝, 차돌박이)"
                    : "업태/업종별 사장님 찾기 (예: 다이닝, 와인바, 스테이크, 비스트로, 노포)"
                }
                className="w-full text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword("")}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 font-bold"
                >
                  지우기
                </button>
              )}
            </div>
          </div>

          {/* 탭별 세부 필터 버튼 리스트 */}
          {/* 1) 권역별 탭 선택 시 */}
          {searchTab === "region" && (
            <div className="flex flex-wrap items-center gap-2 text-xs animate-in fade-in duration-150">
              <span className="font-bold text-slate-700 mr-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> 지역 권역:
              </span>
              {SEOUL_DISTRICTS.map((district) => (
                <button
                  key={district}
                  onClick={() => setSelectedDistrict(district)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    selectedDistrict === district
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {district === "종로구" ? "종로구에 위치한 사장님들" : district}
                </button>
              ))}
            </div>
          )}

          {/* 2) 품목별 탭 선택 시 (부위별 사장님 찾기) */}
          {searchTab === "item" && (
            <div className="flex flex-wrap items-center gap-2 text-xs animate-in fade-in duration-150">
              <span className="font-bold text-slate-700 mr-2 flex items-center gap-1">
                🥩 희망 육류 부위:
              </span>
              {MEAT_CUT_FILTERS.map((cut) => (
                <button
                  key={cut}
                  onClick={() => setSelectedMeatCut(cut)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    selectedMeatCut === cut
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  {cut === "전체 품목" ? cut : `${cut} 찾는 매장`}
                </button>
              ))}
            </div>
          )}

          {/* 3) 업태별 탭 선택 시 (매장 컨셉별 사장님 찾기) */}
          {searchTab === "business" && (
            <div className="flex flex-wrap items-center gap-2 text-xs animate-in fade-in duration-150">
              <span className="font-bold text-slate-700 mr-2 flex items-center gap-1">
                🍽️ 식당 업태/컨셉:
              </span>
              {BUSINESS_TYPE_FILTERS.map((bType) => (
                <button
                  key={bType}
                  onClick={() => setSelectedBusiness(bType)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    selectedBusiness === bType
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                  }`}
                >
                  {bType}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. 섹션 1: "육류 업체를 찾고 있어요" (유첨 중앙 핵심 그리드) */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>🥩</span> 육류 업체를 찾고 있어요
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchTab === "region" && `현재 고기 납품 업체를 적극적으로 찾고 있는 ${selectedDistrict} 매장들입니다.`}
                {searchTab === "item" && `현재 [${selectedMeatCut}] 공급 업체를 우선적으로 찾고 있는 매장들입니다.`}
                {searchTab === "business" && `[${selectedBusiness}] 업태에 맞춰 전문 육류 소싱을 원하는 매장들입니다.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                실시간 {filteredStores.length}개 매장 매칭됨
              </span>
              {(searchKeyword || selectedMeatCut !== "전체 품목" || selectedBusiness !== "전체 업태" || selectedDistrict !== "종로구") && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>

          {/* 카드 가로 그리드 (동적 필터링 반영) */}
          {filteredStores.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="text-3xl">🔎</div>
              <h4 className="font-bold text-slate-800 text-sm">해당 조건으로 등록된 식당을 찾지 못했습니다</h4>
              <p className="text-xs text-slate-400">
                입점 준비 중인 권역이거나 조건에 맞는 매장이 없습니다. 조건을 변경해 보세요.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                전체 매장 보기 (필터 초기화)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredStores.map((store, idx) => (
              <div
                key={store.name}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  idx === 0
                    ? "border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                {/* 카드 상단: 매장 기본 타이틀 */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-base">{store.name}</h3>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md">
                        우선 추천
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{store.tagline}</p>
                </div>

                {/* 카드 본체: 매장 어필 정보 & 원하는 품목 */}
                <div className="p-4 space-y-3.5 flex-1 text-xs">
                  {/* [매장 어필 정보] */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      매장 어필 정보
                    </span>
                    <div className="h-20 w-full rounded-lg overflow-hidden relative mb-1.5 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={store.appeal.representativeImg}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-900/80 text-white text-[9px] font-bold rounded">
                        대표 사진
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold">
                        <Star className="w-3 h-3 fill-amber-400" /> {store.appeal.rating}
                        <span className="text-slate-400 font-normal">({store.appeal.reviewCount})</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        &quot;{store.appeal.reviewText}&quot;
                      </p>
                    </div>
                  </div>

                  {/* [원하는 품목] */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      원하는 품목
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100 font-medium">
                      {store.wantedMeat.map((meat) => (
                        <li key={meat} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                          <span className="truncate">{meat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 물량 / 단가 힌트 */}
                  {store.targetPriceHighlight && (
                    <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded">
                      목표: {store.targetPriceHighlight}
                    </div>
                  )}
                </div>

                {/* 카드 하단 액션 버튼 */}
                <div className="p-3 border-t border-slate-100 bg-white flex flex-col gap-1.5">
                  <button
                    onClick={() => setSelectedStore(store)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" /> 상세 정보 열람
                  </button>
                  <button
                    onClick={() => setPitchModalStore(store)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition"
                  >
                    <Send className="w-3.5 h-3.5" /> 견적 찌르기 (역제안)
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </section>

        {/* 4. 섹션 2: "해산물 업체를 찾고 있어요" (유첨 하단 그리드) */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>🐟</span> 해산물 업체를 찾고 있어요
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                신선 해산물 및 수산물 납품 업체를 찾고 있는 {selectedDistrict} 매장들입니다.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              실시간 5개 매장 입점
            </span>
          </div>

          {/* 5개 카드 가로 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STORES.map((store) => (
              <div
                key={`seafood-${store.name}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-2xs"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-black text-slate-900 text-base">{store.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{store.tagline}</p>
                </div>

                <div className="p-4 space-y-3.5 flex-1 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      매장 어필 정보
                    </span>
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      &quot;{store.appeal.reviewText}&quot;
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      원하는 수산 품목
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-700 bg-blue-50/40 p-2.5 rounded-lg border border-blue-100 font-medium">
                      {store.wantedSeafood.map((item) => (
                        <li key={item} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 bg-white">
                  <button
                    onClick={() => alert(`${store.name}의 해산물 납품 견적 제안 기능은 준비 중입니다.`)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                  >
                    수산 견적 제안하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 매장 상세 열람 모달 */}
      {selectedStore && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  매장 상세 프로필
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{selectedStore.name}</h3>
                <p className="text-xs text-slate-500">{selectedStore.location}</p>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">소싱 규모:</span>
                  <span className="font-bold text-slate-900">{selectedStore.monthlyMeatKg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">거래처 평판:</span>
                  <span className="font-bold text-emerald-600">★ 5.0 (결제일 준수 우수)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">배송 요구:</span>
                  <span className="font-bold">주 3회 오전 10시 이전 입고</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="font-bold text-emerald-950 block mb-1">구매 희망 육류 스펙:</span>
                <div className="space-y-1 text-slate-700">
                  {selectedStore.wantedMeat.map((m) => (
                    <div key={m} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedStore(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  const s = selectedStore;
                  setSelectedStore(null);
                  setPitchModalStore(s);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                다이렉트 견적 제안하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 다이렉트 역견적 제안 모달 */}
      {pitchModalStore && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  다이렉트 역견적 투척
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  [{pitchModalStore.name}]에 납품 견적서 제안
                </h3>
              </div>
              <button
                onClick={() => setPitchModalStore(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {pitchModalStore.name}이(가) 필요로 하는 품목의 공급 가능 kg당 납품가를 입력하세요.
            </p>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto pr-1">
              {pitchModalStore.wantedMeat.map((item, i) => (
                <div key={item} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900">{item}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      defaultValue={i === 0 ? 32500 : i === 1 ? 20000 : 28500}
                      className="w-28 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-right font-black text-emerald-700"
                    />
                    <span className="text-slate-500 font-bold">원/kg</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-[11px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>전송 시 {pitchModalStore.name} 대표님의 수신함과 알림톡으로 즉시 견적이 전달됩니다.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPitchModalStore(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setPitchModalStore(null);
                  alert(`🎉 ${pitchModalStore.name}에 견적서가 성공적으로 전송되었습니다!\n매장에서 검토 후 샘플 요청 알림이 발송됩니다.`);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                견적서 전송하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
