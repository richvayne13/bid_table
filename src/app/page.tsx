"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

// 식자재 카테고리 10종
const CATEGORIES = [
  { id: "meat", name: "육류/축산", icon: "🥩", count: "85종", hot: true },
  { id: "vege", name: "채소/농산", icon: "🥬", count: "120종", hot: true },
  { id: "seafood", name: "수산/해물", icon: "🐟", count: "64종" },
  { id: "fruit", name: "신선 과일", icon: "🍎", count: "42종" },
  { id: "dairy", name: "유제품/치즈", icon: "🧀", count: "58종" },
  { id: "sauce", name: "소스/공산품", icon: "🥫", count: "210종", hot: true },
  { id: "bakery", name: "베이커리", icon: "🍞", count: "35종" },
  { id: "beverage", name: "음료/주류", icon: "🍺", count: "48종" },
  { id: "pack", name: "포장/배달용기", icon: "📦", count: "90종" },
  { id: "spice", name: "조미료/기타", icon: "🧂", count: "76종" },
];

// 식당 사장님들의 생생한 납품 & 단가방어 후기
const RESTAURANT_REVIEWS = [
  {
    id: 1,
    restaurant: "살롱순라",
    location: "서울 종로구 익선동",
    category: "양식/와인바",
    title: "샤퀴테리·치즈류 단가비교로 월 85만원 원가 절감했어요",
    content: "기존 단일 유통사에서 매달 슬금슬금 올리던 버터와 치즈 단가를 견적식탁에서 3곳 비교 후 교체했습니다. 신선도도 훨씬 뛰어나고 배송 시간도 정확합니다.",
    tag: "#양식식자재 #유제품 #단가23%절감",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    restaurant: "통일고기상회",
    location: "서울 중구 을지로",
    category: "한식/고깃집",
    title: "1등급 암퇘지 삼겹살 직배송, 단가 변동 안심 보장!",
    content: "도매육 유통사 찾기가 제일 힘들었는데, 콜드체인 탑차로 매일 새벽 5시에 깔끔하게 입고됩니다. 고기 육질이 좋아 단골 손님들이 먼저 알아보네요.",
    tag: "#한돈삼겹 #도매육직거래 #새벽배송",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    restaurant: "청주 파스타공방",
    location: "충북 청주시 흥덕구",
    category: "양식/파스타",
    title: "거래명세표 사진 한 장 올렸더니 최저가 유통사가 바로 연결",
    content: "차돌박이와 파스타면, 올리브오일 3곳 비교 견적받고 즉시 계약했습니다. 주 3회 정기 새벽배송에 결제 조건도 월말 결제로 맞춰줘서 자금 회전에 큰 도움 됩니다.",
    tag: "#차돌박이 #파스타식자재 #월말결제",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    restaurant: "스시 류(柳)",
    location: "서울 마포구 연남동",
    category: "일식/이자카야",
    title: "노량진 경매 활어 & 연어 필렛 당일 산지 직송 만족도 100%",
    content: "일식은 원물 신선도가 생명인데 견적식탁 인증 유통사는 원산지 증명서와 위생 점검표를 철저히 보내주네요. 불필요한 중간 마진 없이 공급받습니다.",
    tag: "#활어도매 #연어필렛 #당일배송",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    restaurant: "카페 온화 & 베이커리",
    location: "서울 성동구 성수동",
    category: "카페/디저트",
    title: "프랑스 엘르앤비르 버터·유기농 밀가루 최저가 안정 공급",
    content: "수입 유제품 수급 불안정 때문에 베이킹 재료 단가가 치솟았는데, 전국 도매상 재고 기반으로 안정 단가를 제시해준 유통사 덕에 가격 인상 없이 버텼습니다.",
    tag: "#베이킹도매 #버터수급 #안정공급",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: 6,
    restaurant: "한남 불꽃통닭",
    location: "서울 용산구 한남동",
    category: "치킨/호프",
    title: "국내산 냉장 신선육 호수별 공급 & 전용유 최저가 세팅",
    content: "닭고기 시세 급등기에도 견적식탁 사전 단가 약정으로 3개월간 동일 단가로 공급받았습니다. 매달 식자재 감사 리포트까지 제공해주니 안심입니다.",
    tag: "#신선계육 #튀김전용유 #단가고정",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80",
  },
];

// 오늘의 추천 유통업체 (광고 섹션)
const SPONSORED_SUPPLIERS = [
  {
    id: "sup-1",
    name: "(주)한결축산 유통",
    badge: "광고",
    rating: 5.0,
    reviewCount: 48,
    experience: "업력 15년",
    clients: "식당 120곳 납품 중",
    trustScore: "단가준수율 99.8%",
    moq: "최소주문 10만원",
    delivery: "수도권 전역 매일 새벽배송 (콜드체인 12대 보유)",
    items: ["국내산 한돈 삼겹·목살", "미국/호주산 우삼겹·차돌", "양념육 가공"],
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "sup-2",
    name: "가락농산 신선물류",
    badge: "광고",
    rating: 4.9,
    reviewCount: 92,
    experience: "업력 18년",
    clients: "외식 프랜차이즈 85곳",
    trustScore: "단가준수율 99.5%",
    moq: "최소주문 7만원",
    delivery: "서울/경기 매일 새벽 직배송 (가락시장 경매 직송)",
    items: ["양파/대파/마늘 깐야채", "샐러드용 고급 양상추", "제철 신선 채소"],
    images: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "sup-3",
    name: "선창수산 콜드체인",
    badge: "광고",
    rating: 5.0,
    reviewCount: 36,
    experience: "업력 11년",
    clients: "일식·횟집 64곳",
    trustScore: "단가준수율 100%",
    moq: "최소주문 15만원",
    delivery: "노량진/인천 산지직송, 냉동/활어탑차 8대",
    items: ["생연어 슈페리어", "활광어/우럭/참돔", "칵테일 새우·오징어"],
    images: [
      "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80",
    ],
  },
];

export default function HomePage() {
  const router = useRouter();
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
      router.push(`/suppliers?q=${encodeURIComponent(searchWord.trim())}&region=${encodeURIComponent(selectedRegion)}`);
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
      {/* 1. 상단 히어로 & 검색 섹션 (숨고 메인 상단 벤치마킹) */}
      <section className="pt-10 pb-6 max-w-4xl mx-auto px-4 text-center">
        {/* 지역 선택 드롭다운 + 타이틀 */}
        <div className="inline-flex items-center space-x-2 text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
          <div className="relative inline-block text-left">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="appearance-none bg-transparent pr-8 text-[#6366F1] font-black cursor-pointer focus:outline-none border-b-2 border-[#6366F1] pb-0.5"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg} className="text-gray-800 text-base">
                  {reg}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-[#6366F1] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
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
            className="w-full pl-12 pr-32 py-3.5 bg-gray-100 hover:bg-gray-50 focus:bg-white rounded-full text-base text-gray-900 border border-transparent focus:border-indigo-400 focus:outline-none transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-bold shadow-md transition-all"
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
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-2 mt-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/rfq/categories?cat=${cat.id}`}
              className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 transition-transform hover:-translate-y-0.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-indigo-50 flex items-center justify-center text-2xl transition-colors shadow-xs">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#6366F1]">
                {cat.name}
              </span>
              {cat.hot && (
                <span className="text-[9px] text-[#6366F1] font-bold mt-0.5">인기</span>
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

      {/* 3. 식당 개인사업자들의 생생한 납품 & 단가방어 후기 그리드 (숨고 이사후기 벤치마킹) */}
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
          {["전체", "양식", "한식", "일식", "카페", "치킨"].map((chip) => (
            <button
              key={chip}
              onClick={() => setReviewFilter(chip)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                reviewFilter === chip
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {chip === "전체" ? "전체 보기" : `${chip} 매장`}
            </button>
          ))}
        </div>

        {/* 후기 사진 카드 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="group flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
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

              <div className="p-2.5 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                    {rev.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                    {rev.content}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                  <span className="font-semibold text-gray-600">{rev.restaurant}</span>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span className="ml-0.5 font-bold">{rev.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 오늘의 추천 유통업체 (광고①) - 두 번째 사진 대응 */}
      <section className="bg-gray-50/70 border-y border-gray-200/80 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center space-x-1.5 mb-1">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              오늘의 추천 유통업체
            </h2>
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-semibold">
              광고 ⓘ
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            엄격한 위생 검증 및 콜드체인 설비를 보유한 우수 직거래 납품 파트너
          </p>

          {/* 카테고리 필터 탭 */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-3 scrollbar-none">
            {["전체", "축산/육류", "농산/채소", "수산물", "유제품", "소스/공산품"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSupplierTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  supplierTab === tab
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 유통사 추천 카드 3개 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {SPONSORED_SUPPLIERS.map((sup) => (
              <div
                key={sup.id}
                className="bg-white rounded-2xl border border-gray-200/90 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-medium text-gray-400">우수 공급사</span>
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
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
                    <Truck className="w-3.5 h-3.5 text-indigo-500 mr-1 shrink-0" />
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
                    className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-colors"
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

      {/* 5. 중소벤처기업부 x 견적식탁 안전 거래 캠페인 배너 (두 번째 사진 대응) */}
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

      {/* 6. 지금 필요한 식자재, 한 번에 견적 받기 카드들 (두 번째 사진 대응) */}
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
              image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80",
              href: "/rfq/new?category=meat",
            },
            {
              title: "매일 새벽 직배송",
              desc: "가락시장 경매 야채 & 깐마늘",
              count: "채소·농산 22종",
              image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80",
              href: "/rfq/new?category=vege",
            },
            {
              title: "정통 양식/파스타",
              desc: "유제품, 파르미지아노, 엑스트라버진",
              count: "유제품 10종",
              image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&auto=format&fit=crop&q=80",
              href: "/rfq/new?category=dairy",
            },
            {
              title: "원가 절감 공산품",
              desc: "업소용 대용량 식용유 & 소스류",
              count: "공산품 35종",
              image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=300&auto=format&fit=crop&q=80",
              href: "/rfq/new?category=sauce",
            },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="group bg-white rounded-2xl border border-gray-200 p-4 hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-medium text-gray-400 block">{item.title}</span>
                <h4 className="text-sm font-extrabold text-gray-900 mt-0.5 group-hover:text-[#6366F1] transition-colors">
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
