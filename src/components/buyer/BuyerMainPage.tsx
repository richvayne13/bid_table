"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import { BuyerHomeDashboard } from "@/components/buyer/BuyerHomeDashboard";
import {
  Search,
  Sparkles,
  ChevronDown,
  Star,
  Bookmark,
  ShieldCheck,
  Truck,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Building2,
  Clock,
  MapPin,
  ChevronRight,
  Info,
  Store,
  Briefcase,
  Layers,
} from "lucide-react";

// 육류/축산 전용 카테고리 (우육/소고기, 돈육, 가공육 등)
const CATEGORIES = [
  { id: "beef", name: "소고기 (우육)", icon: "🥩", count: "14종", hot: true },
  { id: "steak", name: "스테이크 부위 (살치/채끝/안심)", icon: "🥩", count: "8종", hot: true },
  { id: "bulk", name: "구이·로스 (알목심/척아이롤)", icon: "🥓", count: "5종", hot: true },
  { id: "thin", name: "세절육 (차돌박이/우삼겹)", icon: "🍖", count: "4종" },
  { id: "pork", name: "돼지고기 (한돈/이베리코)", icon: "🐖", count: "6종" },
  { id: "chilled", name: "냉장 원육 (Chilled)", icon: "❄️", count: "10종" },
  { id: "frozen", name: "동결/급랭육 (Frozen)", icon: "🧊", count: "9종" },
];

// 살롱순라 실제 육류 납품 및 견적 후기
const RESTAURANT_REVIEWS = [
  {
    id: 1,
    restaurant: "살롱순라",
    location: "서울 종로구 익선동",
    category: "축산/우육",
    title: "초이스 냉장 살치살 kg당 2,500원 절감 계약 체결",
    content:
      "기존 35,000원에 납품받던 살치살을 마장동 벨엘미트 역제안을 통해 32,500원에 동일 스펙으로 전환했습니다. 월 150kg 기준 매달 37만원 이상 원가가 절감됩니다.",
    tag: "#초이스살치살 #마장동직송 #원가절감",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    restaurant: "살롱순라",
    location: "서울 종로구 익선동",
    category: "축산/우육",
    title: "프라임 알목심 & TEYS 채끝등심 정기 납품으로 스테이크 품질 향상",
    content:
      "마장동 유통사의 직접 제안을 받아 주 3회 신선 냉장으로 공급받고 있습니다. 고기 육질이 균일해서 손님 반응이 매우 좋습니다.",
    tag: "#알목심 #TEYS채끝 #주3회배송",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
  },
];

// 오늘의 공식 육류 납품 파트너
const SPONSORED_SUPPLIERS = [
  {
    id: "sup-belel",
    name: "벨엘미트 (마장동 축산 도소매)",
    badge: "공식 납품사",
    rating: 5.0,
    reviewCount: 52,
    experience: "업력 16년",
    clients: "살롱순라 등 외식 매장 정기 납품 중",
    trustScore: "단가준수율 100%",
    moq: "최소주문 1박스 (약 10만원)",
    delivery: "서울 전역 / 종로구 익선동 매일 새벽 콜드체인 직배송",
    items: ["초이스 냉장 살치살", "프라임 알목심", "호주산 AMH S안심", "TEYS 곡물 채끝"],
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&auto=format&fit=crop&q=80",
    ],
  },
];

interface BuyerMainPageProps {
  onSwitchView?: (view: "service" | "buyer" | "supplier") => void;
}

export function BuyerMainPage({ onSwitchView }: BuyerMainPageProps) {
  const router = useRouter();
  const { currentUser } = useRole();
  const [selectedRegion, setSelectedRegion] = useState("서울 종로구");
  const [searchWord, setSearchWord] = useState("");
  const [activeTab, setActiveTab] = useState<"compare" | "regular">("compare");
  const [reviewFilter, setReviewFilter] = useState("전체");
  const [savedReviewIds, setSavedReviewIds] = useState<number[]>([]);
  const [supplierTab, setSupplierTab] = useState("전체");

  const regions = [
    "서울 종로구",
    "서울 강남구",
    "서울 마포구",
    "서울 중구",
    "서울 영등포구",
    "서울 송파구",
    "경기 성남시",
    "충북 청주시",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchWord.trim()) {
      router.push(
        `/suppliers?q=${encodeURIComponent(searchWord.trim())}&region=${encodeURIComponent(
          selectedRegion
        )}`
      );
    } else {
      router.push("/rfq/categories");
    }
  };

  const toggleSaveReview = (id: number) => {
    setSavedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredReviews =
    reviewFilter === "전체"
      ? RESTAURANT_REVIEWS
      : RESTAURANT_REVIEWS.filter((r) => r.category.includes(reviewFilter));

  return (
    <div className="min-h-screen bg-white">
      {/* 🌟 구매자 모드 상단 알림 및 뷰 전환 바 */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-3 px-4 border-b border-blue-800/40 shadow-md sticky top-16 sm:top-20 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-blue-500 rounded-lg text-white font-bold text-sm">🥩</span>
            <div>
              <span className="font-extrabold text-blue-400 mr-2">[셀프바이어 BUYER 구매자 모드]</span>
              <span className="text-slate-200">
                거래처 발굴부터, 견적 비교까지 · 살롱순라 구매자 × 마장동 벨엘미트 실시간 연동
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* 판매자 화면 즉시 전환 버튼 */}
            {onSwitchView ? (
              <button
                onClick={() => onSwitchView("supplier")}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg shadow transition flex items-center gap-1 shrink-0"
              >
                <Briefcase className="w-3.5 h-3.5" /> 👔 유통사(판매자) 화면 보기
              </button>
            ) : (
              <Link
                href="/supplier"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg shadow transition flex items-center gap-1 shrink-0"
              >
                <Briefcase className="w-3.5 h-3.5" /> 👔 유통사(판매자) 화면 보기
              </Link>
            )}

            {onSwitchView ? (
              <button
                onClick={() => onSwitchView("service")}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold rounded-lg border border-slate-700 transition shrink-0"
              >
                서비스소개 보기
              </button>
            ) : (
              <Link
                href="/#service"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold rounded-lg border border-slate-700 transition shrink-0"
              >
                서비스소개 보기
              </Link>
            )}

            <Link
              href="/prototypes"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg shadow transition flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" /> 🎨 도안 20선
            </Link>
          </div>
        </div>
      </div>

      {/* 🚀 살롱순라 맞춤 구매자 대시보드 (원클릭 발주 + OCR 명세서 감시 + 마장동 실시간 시세) */}
      <BuyerHomeDashboard />

      {/* 구분선 */}
      <div className="max-w-7xl mx-auto px-4 my-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              전체 식자재 카테고리 검색 & 파트너 탐색
            </span>
          </div>
        </div>
      </div>

      {/* 1. 상단 히어로 & 검색 섹션 */}
      <section className="pt-8 pb-6 max-w-4xl mx-auto px-4 text-center">
        {/* 지역 선택 드롭다운 + 타이틀 */}
        <div className="inline-flex items-center space-x-2 text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 flex-wrap justify-center">
          <div className="relative inline-block text-left">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="appearance-none bg-transparent pr-8 text-blue-600 font-black cursor-pointer focus:outline-none border-b-2 border-blue-600 pb-0.5"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg} className="text-gray-800 text-base">
                  {reg}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-blue-600 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <span>에서 어떤 식자재가 필요하세요?</span>
        </div>

        {/* 검색 인풋 바 */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto shadow-sm">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="예: 삼겹살, 양파, 식용유, 치즈, 거래명세서 사진 첨부"
            className="w-full pl-12 pr-32 py-3.5 bg-gray-100 hover:bg-gray-50 focus:bg-white rounded-full text-base text-gray-900 border border-transparent focus:border-blue-400 focus:outline-none transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI 견적 요청</span>
          </button>
        </form>

        {/* 견적비교 / 정기납품 서브 탭 */}
        <div className="flex justify-center space-x-8 mt-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("compare")}
            className={`pb-3 text-base font-bold transition-all relative ${
              activeTab === "compare"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            견적비교
          </button>
          <button
            onClick={() => setActiveTab("regular")}
            className={`pb-3 text-base font-bold transition-all relative flex items-center space-x-1 ${
              activeTab === "regular"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span>정기납품 직거래</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </button>
        </div>

        {/* 식자재 카테고리 10종 아이콘 그리드 */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-2 mt-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/rfq/categories?cat=${cat.id}`}
              className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 transition-transform hover:-translate-y-0.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center text-2xl transition-colors shadow-xs">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-blue-600">
                {cat.name}
              </span>
              {cat.hot && (
                <span className="text-[9px] text-blue-600 font-bold mt-0.5">인기</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* 2. 사전 알림 및 단가방어 이벤트 배너 */}
      <section className="max-w-5xl mx-auto px-4 my-6">
        <Link
          href="/rfq/new"
          className="block rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#4338CA] text-white p-6 sm:p-7 shadow-lg relative overflow-hidden group"
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold mb-2">
                선착순 100개 식당 한정
              </span>
              <h3 className="text-lg sm:text-2xl font-black tracking-tight">
                선착순 식자재 단가 방어 30% 지원 사전 알림 신청하기
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                기존 거래명세서만 올려도 평균 24% 원가 절감 + 불시 단가 인상 시 차액 100% 보상
              </p>
            </div>
            <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur text-3xl font-black text-indigo-300">
              30%
            </div>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-48 h-48 rounded-full bg-indigo-400/10 blur-2xl"></div>
        </Link>
      </section>

      {/* 3. 식당 개인사업자들의 생생한 납품 & 단가방어 후기 그리드 */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-bold text-gray-500">
              최근 {selectedRegion} 주변에서 많이 본
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
              식당 사장님들의 식자재 절감 및 납품 고민 해결법
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center space-x-1"
          >
            <span>더보기</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 후기 카테고리 필터 칩 */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {["전체", "유제품", "육류", "공산품", "면류", "채소"].map((chip) => (
            <button
              key={chip}
              onClick={() => setReviewFilter(chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                reviewFilter === chip
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {chip === "전체" ? "전체 품목 보기" : `${chip} 납품`}
            </button>
          ))}
        </div>

        {/* 후기 사진 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="group flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all p-3 gap-3"
            >
              <div className="relative aspect-video sm:aspect-square sm:w-32 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={rev.image}
                  alt={rev.restaurant}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={() => toggleSaveReview(rev.id)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur"
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      savedReviewIds.includes(rev.id) ? "fill-amber-400 text-amber-400" : ""
                    }`}
                  />
                </button>
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium backdrop-blur">
                  {rev.category}
                </div>
              </div>

              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                    {rev.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {rev.content}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-gray-600">{rev.restaurant}</span>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1 font-bold">{rev.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 오늘의 추천 유통업체 (벨엘미트 등) */}
      <section className="bg-gray-50/70 border-y border-gray-200/80 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center space-x-1.5 mb-1">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              오늘의 추천 유통업체
            </h2>
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-semibold">
              공식 제휴
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            엄격한 위생 검증 및 콜드체인 설비를 보유한 우수 직거래 납품 파트너
          </p>

          {/* 유통사 추천 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {SPONSORED_SUPPLIERS.map((sup) => (
              <div
                key={sup.id}
                className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {sup.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900 mt-1">
                        {sup.name}
                      </h3>
                    </div>
                    <div className="flex items-center text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                      <span>{sup.rating}</span>
                      <span className="text-gray-400 font-normal ml-1">({sup.reviewCount})</span>
                    </div>
                  </div>

                  {/* B2B 식자재 핵심 지표 */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-gray-50 text-[11px]">
                    <div>
                      <span className="text-gray-400 block">업력 / 규모</span>
                      <span className="font-bold text-gray-800">{sup.experience}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">정기 거래처</span>
                      <span className="font-bold text-gray-800">{sup.clients}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">신뢰도</span>
                      <span className="font-bold text-emerald-600">{sup.trustScore}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">주문 조건</span>
                      <span className="font-bold text-gray-800">{sup.moq}</span>
                    </div>
                  </div>

                  {/* 배송 안내 */}
                  <p className="text-[11px] text-gray-600 mt-2.5 flex items-center">
                    <Truck className="w-3.5 h-3.5 text-blue-500 mr-1 shrink-0" />
                    <span className="truncate">{sup.delivery}</span>
                  </p>

                  {/* 사진 3장 썸네일 */}
                  <div className="grid grid-cols-3 gap-1.5 mt-3">
                    {sup.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={img} alt="납품 현장" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* 주력 취급 품목 뱃지 */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {sup.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center space-x-2">
                  <Link
                    href={`/rfq/new?supplier=${sup.id}`}
                    className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    단가 견적 요청
                  </Link>
                  <Link
                    href={`/suppliers`}
                    className="px-3 py-2 text-center text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 중소벤처기업부 x 견적식탁 안전 거래 캠페인 배너 */}
      <section className="max-w-5xl mx-auto px-4 my-8">
        <div className="rounded-2xl bg-[#EDE9FE] border border-indigo-200/60 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                  중소벤처기업부 x 견적식탁
                </span>
                <span className="text-[11px] text-gray-500">외식업 상생 프로젝트</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 mt-0.5">
                안전한 식자재 직거래 환경 우리 함께 만들어요 1편
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                불공정 단가 일방 인상 방지 서약 및 공급 지연 안심 손해배상 보증제 안내
              </p>
            </div>
          </div>
          <Link
            href="/supplier-join"
            className="px-4 py-2 rounded-xl bg-white text-xs font-bold text-[#6366F1] border border-indigo-200 hover:bg-indigo-50 shadow-xs whitespace-nowrap"
          >
            안심 보증제 알아보기 →
          </Link>
        </div>
      </section>

      {/* 6. 지금 필요한 식자재, 한 번에 견적 받기 카드들 */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
          지금 필요한 식자재, 한 번에 견적 받기
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "신선육 안정 공급",
              desc: "국내산 한돈/한우 & 수입 우삼겹",
              count: "육류 14종 패키지",
              image:
                "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80",
              href: "/rfq/new?category=meat",
            },
            {
              title: "매일 새벽 직배송",
              desc: "가락시장 경매 야채 & 깐마늘",
              count: "채소·농산 22종",
              image:
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80",
              href: "/rfq/new?category=vege",
            },
            {
              title: "정통 양식/파스타",
              desc: "유제품, 파르미지아노, 엑스트라버진",
              count: "유제품 10종",
              image:
                "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&auto=format&fit=crop&q=80",
              href: "/rfq/new?category=dairy",
            },
            {
              title: "원가 절감 공산품",
              desc: "업소용 대용량 식용유 & 소스류",
              count: "공산품 35종",
              image:
                "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=300&auto=format&fit=crop&q=80",
              href: "/rfq/new?category=sauce",
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="group bg-white rounded-2xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-medium text-gray-400 block">{item.title}</span>
                <h4 className="text-sm font-extrabold text-gray-900 mt-0.5 group-hover:text-blue-600 transition-colors">
                  {item.desc}
                </h4>
                <span className="inline-flex items-center text-xs font-semibold text-gray-500 mt-2">
                  <span>{item.count}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 ml-3">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
