"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const CATEGORY_GROUPS = [
  {
    id: "meat",
    name: "축산물 / 육류",
    icon: "🥩",
    banners: [
      {
        title: "신선육 한 번에 견적 받기",
        desc: "한돈/수입육 14종 패키지",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80",
      },
      {
        title: "가공육·패티 정기 납품",
        desc: "수제버거·양식 전문 납품",
        image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&auto=format&fit=crop&q=80",
      },
    ],
    sections: [
      {
        title: "돼지고기 (국내산/수입산)",
        items: [
          "삼겹살 (국산 1등급 암돼지)",
          "목살 (냉장 2kg 규격)",
          "돼지갈비 / 등갈비",
          "대패삼겹살 (수입 냉동)",
          "항정살 / 가브리살",
          "돼지 전지 / 후지 (찌개·제육용)",
        ],
      },
      {
        title: "소고기 (한우 / 수입육)",
        items: [
          "차돌박이 (미국산/냉동 1kg 슬라이스)",
          "우삼겹 (업소용 1kg)",
          "부채살 / 살치살 스테이크육",
          "소갈비 / LA갈비",
          "한우 등심 / 안심 1++",
          "양지 / 국거리용 소고기",
        ],
      },
      {
        title: "닭 / 오리 / 특수육",
        items: [
          "신선 닭정육 (닭다리 순살 2kg)",
          "호수별 계육 (9호, 10호, 11호)",
          "닭가슴살 / 안심",
          "오리로스 / 훈제오리",
        ],
      },
    ],
  },
  {
    id: "vege",
    name: "채소 / 신선농산",
    icon: "🥬",
    banners: [
      {
        title: "가락시장 새벽 경매 채소",
        desc: "매일 아침 6시 식당 앞 직배송",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80",
      },
      {
        title: "깐야채·전처리 채소",
        desc: "주방 인건비 40% 절감",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=80",
      },
    ],
    sections: [
      {
        title: "기본 양념 채소",
        items: [
          "깐양파 (업소용 10kg/20kg)",
          "깐대파 (손질 1kg/10kg)",
          "깐마늘 (국내산 꼭지제거 1kg)",
          "생강 / 다진마늘 대용량",
          "청양고추 / 오이고추",
        ],
      },
      {
        title: "샐러드 / 양식 / 쌈채소",
        items: [
          "양상추 (신선 8kg 박스)",
          "로메인 / 루꼴라",
          "방울토마토 (대추형 3kg)",
          "파프리카 (혼합 5kg)",
          "적근대 / 케일",
        ],
      },
    ],
  },
  {
    id: "dairy",
    name: "유제품 / 치즈",
    icon: "🧀",
    banners: [
      {
        title: "파스타 & 피자 유제품 패키지",
        desc: "모짜렐라 & 동물성 휘핑크림",
        image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&auto=format&fit=crop&q=80",
      },
    ],
    sections: [
      {
        title: "치즈 / 버터 / 생크림",
        items: [
          "모짜렐라 피자치즈 (슈레드 2.5kg)",
          "파르미지아노 레지아노 (블록/분말)",
          "체다 슬라이스 치즈",
          "동물성 휘핑크림 (서울우유/매일 1L)",
          "앵커버터 / 엘르앤비르 고메버터",
          "마스카포네 / 리코타 치즈",
        ],
      },
    ],
  },
  {
    id: "seafood",
    name: "수산물 / 해물",
    icon: "🐟",
    banners: [
      {
        title: "노량진 경매 수산물 직송",
        desc: "신선 활어 & 연어 필렛",
        image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400&auto=format&fit=crop&q=80",
      },
    ],
    sections: [
      {
        title: "생선 / 연어 / 횟감",
        items: [
          "생연어 슈페리어 필렛 (노르웨이)",
          "활광어 / 활우럭 (kg 단위)",
          "냉동 고등어 필렛 (노르웨이 5kg)",
          "갈치 / 삼치 토막",
        ],
      },
      {
        title: "갑각류 / 패류 / 냉동안주",
        items: [
          "칵테일새우 (탈각 41/50, 31/40)",
          "자숙 문어 / 오징어 채",
          "바지락 / 홍합 (당일 생물)",
          "절단 꽃게 (찌개용)",
        ],
      },
    ],
  },
  {
    id: "sauce",
    name: "가공 / 소스 / 공산품",
    icon: "🥫",
    banners: [
      {
        title: "업소용 공산품 최저가",
        desc: "식용유·참기름·고추장 대용량",
        image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&auto=format&fit=crop&q=80",
      },
    ],
    sections: [
      {
        title: "유지류 / 장류 / 소스",
        items: [
          "업소용 콩식용유 (말통 18L)",
          "엑스트라 버진 올리브유 (5L)",
          "진간장 / 양조간장 (14L)",
          "업소용 고추장 / 된장 (14kg)",
          "토마토 홀 / 퓨레 캔 (2.5kg)",
          "마요네즈 / 케첩 업소용 대용량",
        ],
      },
    ],
  },
];

export default function CategorySelectPage() {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState("meat");
  const [keyword, setKeyword] = useState("");

  const activeGroup =
    CATEGORY_GROUPS.find((g) => g.id === selectedGroupId) || CATEGORY_GROUPS[0];

  const handleSelectItem = (itemName: string) => {
    router.push(`/rfq/new?item=${encodeURIComponent(itemName)}&group=${activeGroup.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 상단 검색 & 헤더 */}
      <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            견적 요청할 식자재를 선택해주세요
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            원하는 품목을 선택하시면 평균 3곳 이상의 검증된 유통사 견적을 실시간으로 비교해 드립니다.
          </p>
        </div>

        {/* 상단 빠른 이동 */}
        <Link
          href="/rfq/new"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>업종별 원클릭 세팅 마법사 →</span>
        </Link>
      </div>

      {/* 세 번째 사진 레이아웃: 좌측 카테고리 사이드바 + 우측 서브품목 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-6">
        {/* 좌측 사이드바 */}
        <div className="space-y-1">
          {CATEGORY_GROUPS.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroupId(group.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-left transition-all ${
                selectedGroupId === group.id
                  ? "bg-indigo-50 text-[#6366F1] font-black"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-lg">{group.icon}</span>
                <span>{group.name}</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  selectedGroupId === group.id ? "text-[#6366F1]" : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        {/* 우측 메인 컨텐츠 영역 */}
        <div className="md:col-span-3 space-y-6">
          {/* 상단 배너 카드들 (숨고 상단 카드 형태) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeGroup.banners.map((ban, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`/rfq/new?group=${activeGroup.id}`)}
                className="group cursor-pointer bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-200 hover:border-indigo-400 hover:bg-white transition-all shadow-xs"
              >
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-[#6366F1]">
                    {ban.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{ban.desc}</p>
                  <span className="inline-flex items-center text-xs font-bold text-indigo-600 mt-2">
                    한 번에 견적 받기 →
                  </span>
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0 ml-3">
                  <img src={ban.image} alt={ban.title} className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>

          {/* 하위 세부 품목 리스트 (숨고 서브 카테고리 형태) */}
          <div className="space-y-6 pt-2">
            {activeGroup.sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-2">
                  {sec.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sec.items.map((item, iIdx) => (
                    <button
                      key={iIdx}
                      onClick={() => handleSelectItem(item)}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all group"
                    >
                      <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-900 group-hover:font-semibold">
                        {item}
                      </span>
                      <span className="text-xs font-bold text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity">
                        견적 선택 +
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
