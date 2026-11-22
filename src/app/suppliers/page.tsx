"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  MapPin,
  Truck,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Filter,
  X,
  PhoneCall,
  Sparkles,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  badge: string;
  rating: number;
  reviews: number;
  experience: string; // 업력 (기존 경력 대체)
  activeClients: string; // 정기 납품 거래처 (기존 고용 대체)
  trustScore: string; // 단가 준수율 (기존 리뷰 지표 고도화)
  moq: string; // 최소 주문 금액
  region: string; // 배송 권역
  coldChain: string; // 물류 역량
  intro: string;
  tags: string[];
  photos: string[];
}

const SUPPLIERS_DATA: Supplier[] = [
  {
    id: "sup-1",
    name: "(주)한결축산 유통",
    badge: "HACCP 인증 우수공급사",
    rating: 5.0,
    reviews: 48,
    experience: "업력 15년",
    activeClients: "120개 외식매장 납품 중",
    trustScore: "단가준수율 99.8%",
    moq: "1회 10만원 (무료배송)",
    region: "서울 전역 / 경기 성남·하남·구리",
    coldChain: "냉장·냉동 분리 탑차 12대 보유 (새벽 6시 전 입고)",
    intro: "1등급 한돈 암돼지 삼겹살·목살 및 수입 우삼겹·차돌박이 전문 도매. 불시 단가 인상 없는 3개월 단가 고정 계약 보장합니다.",
    tags: ["한돈삼겹", "차돌박이", "우삼겹", "양념육", "단가고정제"],
    photos: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "sup-2",
    name: "가락농산 신선물류",
    badge: "가락시장 직송 파트너",
    rating: 4.9,
    reviews: 92,
    experience: "업력 18년",
    activeClients: "85개 프랜차이즈 및 식당",
    trustScore: "단가준수율 99.5%",
    moq: "1회 7만원 (무료배송)",
    region: "서울 전역 / 경기 고양·일산·파주",
    coldChain: "온도관제 냉장탑차 16대 (매일 새벽 경매품 직송)",
    intro: "가락시장 매일 새벽 경매 직송! 주방 일손을 덜어주는 깐양파, 깐대파, 다진마늘 전처리 채소 최저가 납품 전문입니다.",
    tags: ["깐양파", "깐대파", "다진마늘", "샐러드채소", "새벽직배송"],
    photos: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "sup-3",
    name: "선창수산 콜드체인",
    badge: "산지직송 수산물 공식 유통",
    rating: 5.0,
    reviews: 36,
    experience: "업력 11년",
    activeClients: "64개 일식·이자카야 매장",
    trustScore: "단가준수율 100%",
    moq: "1회 15만원 (무료배송)",
    region: "서울 전역 / 인천 / 부천",
    coldChain: "특수 활어차 4대 & 영하 40도 초저온 냉동탑차 6대",
    intro: "노르웨이 생연어 슈페리어 항공 직송 및 산지 직송 활광어·참돔 공급. 당일 입고 당일 배송 원칙으로 신선도 극상 유지.",
    tags: ["생연어슈페리어", "활광어", "칵테일새우", "냉동안주류"],
    photos: [
      "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "sup-4",
    name: "밀라노 푸드 시스템",
    badge: "이탈리안 정통 식자재",
    rating: 4.9,
    reviews: 54,
    experience: "업력 12년",
    activeClients: "92개 양식 레스토랑 & 와인바",
    trustScore: "단가준수율 99.2%",
    moq: "1회 12만원 (무료배송)",
    region: "수도권 전역 / 충청권 주 3회 정기배송",
    coldChain: "정온 냉장보관 물류센터 및 냉장탑차 10대",
    intro: "익선동 살롱순라 공식 납품사. 파르미지아노 레지아노, 모짜렐라 피자치즈, 엑스트라 버진 올리브유 최저가 정기 납품.",
    tags: ["치즈/유제품", "올리브유", "파스타면", "토마토홀", "샤퀴테리"],
    photos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "sup-5",
    name: "(주)삼우 글로벌 공산품",
    badge: "업소용 대용량 최저가",
    rating: 4.8,
    reviews: 110,
    experience: "업력 22년",
    activeClients: "210개 일반음식점",
    trustScore: "단가준수율 99.0%",
    moq: "1회 8만원 (무료배송)",
    region: "전국 택배 및 수도권 직배송",
    coldChain: "대형 자동화 물류센터 운영 (상온/냉장)",
    intro: "업소용 콩식용유 18L 말통, 고추장/된장 14kg, 대용량 소스류 최저가 보증. 기존 명세서 대비 무조건 10% 이상 절감 견적을 드립니다.",
    tags: ["업소용식용유", "업소용장류", "소스/시즈닝", "대용량공산품"],
    photos: [
      "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
    ],
  },
];

export default function SuppliersPage() {
  const [searchWord, setSearchWord] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [consultModalSupplier, setConsultModalSupplier] = useState<Supplier | null>(null);
  const [consultSuccess, setConsultSuccess] = useState(false);

  const filteredSuppliers = useMemo(() => {
    return SUPPLIERS_DATA.filter((sup) => {
      const matchKeyword =
        !searchWord ||
        sup.name.includes(searchWord) ||
        sup.tags.some((t) => t.includes(searchWord)) ||
        sup.intro.includes(searchWord);

      const matchCat =
        selectedCategory === "전체" ||
        sup.tags.some((t) => t.includes(selectedCategory)) ||
        sup.name.includes(selectedCategory);

      const matchReg =
        selectedRegion === "전체" || sup.region.includes(selectedRegion);

      return matchKeyword && matchCat && matchReg;
    });
  }, [searchWord, selectedCategory, selectedRegion]);

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultSuccess(true);
    setTimeout(() => {
      setConsultSuccess(false);
      setConsultModalSupplier(null);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 1. 상단 타이틀 & 검색창 (숨고 고수찾기 헤더 대응) */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#6366F1] uppercase tracking-wider">
              검증된 식자재 직거래 유통사
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-0.5">
              외식업 사장님을 위한 맞춤 유통업체 찾기
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              신뢰할 수 있는 단가 준수율, 콜드체인 탑차, 정기 납품 실적을 투명하게 확인하고 견적을 요청하세요.
            </p>
          </div>

          <Link
            href="/rfq/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>원클릭 역경매 요청하기</span>
          </Link>
        </div>

        {/* 필터 툴바 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="취급 품목, 유통사명 검색 (예: 삼겹살, 가락농산)"
              className="w-full pl-10 pr-3 py-2.5 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-400 focus:outline-none text-gray-700 font-semibold"
            >
              <option value="전체">전체 카테고리</option>
              <option value="삼겹">축산 / 육류 (한돈/소고기)</option>
              <option value="채소">농산 / 채소 (깐야채/전처리)</option>
              <option value="연어">수산물 (생연어/활어)</option>
              <option value="치즈">유제품 / 치즈 (양식전문)</option>
              <option value="식용유">공산품 / 소스 (대용량)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-indigo-400 focus:outline-none text-gray-700 font-semibold"
            >
              <option value="전체">전체 권역 (서울/경기/충청)</option>
              <option value="서울">서울 전역</option>
              <option value="경기">경기권 (성남/일산/하남)</option>
              <option value="인천">인천 / 부천</option>
              <option value="충청">충청권 (청주/대전)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. 유통사 목록 카드 (숨고 고수 카드 레이아웃 100% 매칭) */}
      <div className="space-y-6 mt-6">
        <div className="text-xs font-bold text-gray-500">
          총 <span className="text-indigo-600 font-black">{filteredSuppliers.length}</span>개의 검증된 유통 파트너가 있습니다.
        </div>

        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
          >
            {/* 왼쪽: 기본 정보 & 신뢰 지표 */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {sup.badge}
                  </span>
                  <h2 className="text-xl font-black text-gray-900 mt-1">
                    {sup.name}
                  </h2>
                </div>
                <div className="flex items-center text-sm font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span>{sup.rating}</span>
                  <span className="text-gray-400 text-xs font-normal ml-1">
                    ({sup.reviews})
                  </span>
                </div>
              </div>

              {/* B2B 식자재 핵심 지표 (경력/고용/리뷰 재정의) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 border-y border-gray-100 py-2.5">
                <span className="flex items-center font-bold text-gray-800">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 mr-1" />
                  {sup.experience}
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center font-bold text-indigo-600">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 mr-1" />
                  {sup.activeClients}
                </span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center font-bold text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                  {sup.trustScore}
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">
                  최소주문: <strong className="text-gray-800">{sup.moq}</strong>
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {sup.intro}
              </p>

              {/* 배송 및 물류 역량 */}
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
                  <span>배송 권역: {sup.region}</span>
                </div>
                <div className="flex items-center">
                  <Truck className="w-3.5 h-3.5 text-indigo-500 mr-1.5 shrink-0" />
                  <span>콜드체인: {sup.coldChain}</span>
                </div>
              </div>

              {/* 취급 품목 태그 */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sup.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 오른쪽: 사진 갤러리 & 액션 버튼 */}
            <div className="md:w-64 flex flex-col justify-between shrink-0 space-y-4">
              <div className="grid grid-cols-3 gap-1.5">
                {sup.photos.map((photo, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <img src={photo} alt="납품 현장" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Link
                  href={`/rfq/new?supplier=${sup.id}`}
                  className="w-full block py-2.5 text-center text-xs font-bold rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm transition-colors"
                >
                  견적 요청하기
                </Link>
                <button
                  onClick={() => setConsultModalSupplier(sup)}
                  className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  무료 단가표 상담
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 무료 단가표 상담 모달 */}
      {consultModalSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setConsultModalSupplier(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {consultSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">상담 신청이 완료되었습니다!</h3>
                <p className="text-xs text-gray-500">
                  {consultModalSupplier.name} 담당자가 영업일 기준 1일 이내로 최신 단가표를 보내드립니다.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600">무료 단가표 상담 신청</span>
                  <h3 className="text-lg font-black text-gray-900 mt-0.5">
                    {consultModalSupplier.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    식당 정보와 필요 품목을 남겨주시면 도매 단가표를 즉시 발송해 드립니다.
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">식당 상호명 *</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 살롱순라"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">연락처 *</label>
                    <input
                      type="tel"
                      required
                      placeholder="예: 010-1234-5678"
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">문의 품목 및 월 예상 소요량</label>
                    <textarea
                      rows={3}
                      placeholder="예: 삼겹살 월 300kg, 차돌박이 월 100kg 단가 문의합니다."
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs transition-colors"
                >
                  도매 단가표 무료 신청하기
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
