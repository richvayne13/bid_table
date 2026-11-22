"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Bookmark,
  Share2,
  PenSquare,
  MessageSquare,
  Eye,
  Heart,
  ChevronRight,
  TrendingUp,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
} from "lucide-react";

// 사례/리뷰 포트폴리오 데이터 (살롱순라)
const PORTFOLIO_CASES = [
  {
    id: 1,
    title: "익선동 살롱순라: 샤퀴테리·치즈류 단가비교로 월 85만원 절감",
    category: "유제품/치즈",
    region: "서울 종로구 익선동",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
    saved: true,
    author: "살롱순라 대표",
    savingAmount: "월 850,000원 (23% 절감)",
    items: "파르미지아노 레지아노, 모짜렐라, 프로슈토, 올리브유",
  },
  {
    id: 2,
    title: "익선동 살롱순라: 채끝등심 & 차돌박이 도매 직배송으로 원육 마진율 18% 개선",
    category: "축산/육류",
    region: "서울 종로구 익선동",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    saved: false,
    author: "살롱순라 셰프",
    savingAmount: "월 1,200,000원 (원육 품질 향상)",
    items: "호주산 와규 채끝등심, 미국산 차돌박이 슬라이스",
  },
  {
    id: 3,
    title: "익선동 살롱순라: 이탈리아 정통 듀럼밀 파스타면 & 엑스트라버진 올리브유 안정 공급",
    category: "오일/공산품",
    region: "서울 종로구 익선동",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80",
    saved: false,
    author: "살롱순라 대표",
    savingAmount: "월 620,000원 절감",
    items: "엑스트라 버진 올리브유 5L, 토마토홀 캔 2.5kg, 스파게티면",
  },
  {
    id: 4,
    title: "익선동 살롱순라: 루꼴라 & 바질 가락시장 새벽 경매품 매일 아침 직송",
    category: "채소/신선농산",
    region: "서울 종로구 익선동",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    saved: false,
    author: "살롱순라 총괄매니저",
    savingAmount: "로스율 0% 달성 및 단가 15% 절감",
    items: "루꼴라, 생바질, 방울토마토 대추형, 양상추",
  },
];

// 커뮤니티 게시글 데이터
const COMMUNITY_POSTS = [
  {
    id: 1,
    tag: "식자재 시세톡",
    title: "이번 주 가락시장 양파, 대파 도매가 급등 원인과 대응법 공유합니다.",
    content: "산지 한파로 인해서 깐대파 1kg 단가가 1,500원 올랐습니다. 견적식탁 사전 고정 단가 유통사 2곳 재고 현황 공유드리니 발주 참고하세요...",
    author: "살롱순라 총괄매니저",
    time: "25분 전",
    views: 1420,
    comments: 28,
    likes: 84,
  },
  {
    id: 2,
    tag: "외식업 노하우",
    title: "월 식자재비 36%에서 28%로 줄인 엑셀 발주 관리표 서식 공유",
    content: "원가율 방어는 결국 주간 단위 실매입가 트래킹에 있습니다. 품목별로 MOQ 채워서 무료배송 맞추고 단가 튀는 품목 즉시 알림 걸어두는 시트입니다.",
    author: "살롱순라 대표",
    time: "2시간 전",
    views: 3890,
    comments: 94,
    likes: 215,
  },
  {
    id: 3,
    tag: "유통사 후기",
    title: "한결축산 삼겹살·차돌박이 3개월 납품 솔직 후기 (익선동 매장)",
    content: "지방 비율 균일하고 로스율이 거의 없습니다. 무엇보다 냉장탑차 온도 기록지를 요청하지 않아도 매주 카톡으로 전달해 주는 점이 믿을만합니다.",
    author: "살롱순라 셰프",
    time: "5시간 전",
    views: 1820,
    comments: 19,
    likes: 67,
  },
  {
    id: 4,
    tag: "불량 유통사 주의",
    title: "말통 식용유 18L 용량 속임 및 예고 없는 기습 인상 유통사 주의보",
    content: "계약 초기엔 싸게 넣다가 2달 차부터 슬쩍 단가 15% 올려 청구하는 관행 유통사들 있습니다. 반드시 견적식탁 계약서 단가 보증 확인하세요.",
    author: "살롱순라 대표",
    time: "어제",
    views: 5210,
    comments: 112,
    likes: 340,
  },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"cases" | "community">("cases");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [savedCases, setSavedCases] = useState<number[]>([2]);
  const [communityTab, setCommunityTab] = useState("전체");
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [postList, setPostList] = useState(COMMUNITY_POSTS);

  const toggleSave = (id: number) => {
    setSavedCases((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleWriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;
    const newPost = {
      id: Date.now(),
      tag: "식자재 시세톡",
      title: newPostTitle,
      content: newPostContent,
      author: "식당 사장님",
      time: "방금 전",
      views: 1,
      comments: 0,
      likes: 0,
    };
    setPostList([newPost, ...postList]);
    setNewPostTitle("");
    setNewPostContent("");
    setWriteModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 1. 상단 탭 (사례/리뷰 vs 커뮤니티) - 숨고 둘러보기 벤치마킹 */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-6 text-2xl font-black">
          <button
            onClick={() => setActiveTab("cases")}
            className={`transition-colors ${
              activeTab === "cases"
                ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            사례/리뷰
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`transition-colors ${
              activeTab === "community"
                ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            커뮤니티
          </button>
        </div>

        {activeTab === "community" ? (
          <button
            onClick={() => setWriteModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-sm transition-all"
          >
            <PenSquare className="w-4 h-4" />
            <span>글쓰기</span>
          </button>
        ) : (
          <Link
            href="/rfq/new"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all"
          >
            <Bookmark className="w-4 h-4 text-indigo-600" />
            <span>저장된 사례 ({savedCases.length})</span>
          </Link>
        )}
      </div>

      {/* 2. 사례/리뷰 탭 컨텐츠 */}
      {activeTab === "cases" && (
        <div className="space-y-6 mt-6">
          {/* 검색 & 필터 바 */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="해결이 필요한 문제 검색 (예: 삼겹살 단가, 치즈 절감, 살롱순라)"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 hover:bg-gray-50 focus:bg-white rounded-full text-xs text-gray-800 border border-transparent focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button className="px-3.5 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                내 주변
              </button>
              <button className="px-3.5 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                업종별 ∨
              </button>
              <button className="px-3.5 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                지역 ∨
              </button>
            </div>
          </div>

          {/* 포트폴리오 카드 그리드 (숨고 4열 포트폴리오 레이아웃) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {PORTFOLIO_CASES.filter(
              (c) =>
                !searchKeyword ||
                c.title.includes(searchKeyword) ||
                c.category.includes(searchKeyword) ||
                c.items.includes(searchKeyword)
            ).map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-bold backdrop-blur">
                      납품 포트폴리오
                    </div>
                    <button
                      onClick={() => toggleSave(item.id)}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          savedCases.includes(item.id)
                            ? "fill-amber-400 text-amber-400"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-indigo-600 font-bold">
                      <span>{item.category}</span>
                      <span className="text-gray-400">{item.region}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="p-2.5 rounded-xl bg-gray-50 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">절감 성과:</span>
                        <span className="font-bold text-emerald-600">{item.savingAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">납품 품목:</span>
                        <span className="text-gray-700 truncate max-w-[180px]">{item.items}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href={`/rfq/new?case=${item.id}`}
                    className="w-full block py-2 text-center text-xs font-bold rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    이 조건으로 견적 비교하기 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 커뮤니티 탭 컨텐츠 */}
      {activeTab === "community" && (
        <div className="space-y-8 mt-6">
          {/* 서브 카테고리 탭 */}
          <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
            {["전체", "식자재 시세톡", "외식업 노하우", "유통사 후기", "불량 유통사 주의"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setCommunityTab(tab)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    communityTab === tab
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* 지금 가장 뜨거운 견적식탁 픽 🔥 (숨고 캡처 5 상단 박스) */}
          <div>
            <h2 className="text-base font-black text-gray-900 flex items-center space-x-1.5 mb-3">
              <span>지금 가장 뜨거운 견적식탁 픽</span>
              <span>🔥</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start justify-between cursor-pointer hover:bg-indigo-50 transition-colors">
                <div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-800">
                    인기 공지
                  </span>
                  <h3 className="text-sm font-extrabold text-gray-900 mt-1">
                    식자재 시세 급등기, 불시 단가 인상 대처 가이드
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    단가 보증 확약서 양식과 공급자 일방 인상 시 견적식탁 손해배상 청구 절차 안내
                  </p>
                  <span className="text-[11px] text-gray-400 mt-2 block">조회 4,210회</span>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-400 shrink-0 mt-2" />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start justify-between cursor-pointer hover:bg-amber-50 transition-colors">
                <div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">
                    실전 팁
                  </span>
                  <h3 className="text-sm font-extrabold text-gray-900 mt-1">
                    월 식자재비 38%에서 29%로 줄인 엑셀 관리표 무료 배포
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    단일 공급사 독점 거래에서 3개 공급사 분할 발주로 갈아탄 실제 노하우
                  </p>
                  <span className="text-[11px] text-gray-400 mt-2 block">조회 12,850회</span>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400 shrink-0 mt-2" />
              </div>
            </div>
          </div>

          {/* 실시간 게시글 피드 리스트 */}
          <div className="space-y-4">
            <h2 className="text-base font-black text-gray-900">외식업 사장님 이야기</h2>
            <div className="divide-y divide-gray-100 border-t border-gray-200">
              {postList
                .filter((p) => communityTab === "전체" || p.tag === communityTab)
                .map((post) => (
                  <div key={post.id} className="py-4 hover:bg-gray-50/60 transition-colors rounded-xl px-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {post.tag}
                      </span>
                      <span>·</span>
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{post.time}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 hover:text-indigo-600 cursor-pointer">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {post.content}
                    </p>

                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{post.views}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.comments}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{post.likes}</span>
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 글쓰기 모달 */}
      {writeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setWriteModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleWriteSubmit} className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-indigo-600">식당 사장님 커뮤니티</span>
                <h3 className="text-lg font-black text-gray-900 mt-0.5">게시글 작성하기</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    required
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="제목을 입력해 주세요."
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">내용</label>
                  <textarea
                    rows={5}
                    required
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="식자재 시세, 유통사 경험, 노하우 등 자유롭게 작성해 주세요."
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setWriteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-sm transition-colors"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
