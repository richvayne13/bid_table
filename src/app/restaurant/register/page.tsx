"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth-storage";
import { useRole } from "@/contexts/RoleContext";
import {
  UtensilsCrossed,
  ShieldCheck,
  CheckCircle2,
  Store,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  MapPin,
  TrendingDown,
} from "lucide-react";

const CUISINE_OPTIONS = [
  "양식/파스타/와인바",
  "한식/고깃집/국밥",
  "일식/이자카야/초밥",
  "카페/디저트/베이커리",
  "치킨/호프/포차",
  "중식/아시안",
  "기타 일반음식점",
];

const REGION_OPTIONS = [
  "서울 종로/중구",
  "서울 강남/서초/송파",
  "서울 마포/영등포/용산",
  "서울 성동/광진/동대문",
  "경기 성남/분당/판교",
  "경기 고양/일산",
  "충북 청주시",
  "기타 전국 지역",
];

export default function RestaurantRegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useRole();

  // 폼 입력 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [bizNumber, setBizNumber] = useState("");
  const [repName, setRepName] = useState("");
  const [phone, setPhone] = useState("");
  const [cuisine, setCuisine] = useState("양식/파스타/와인바");
  const [region, setRegion] = useState("서울 종로/중구");
  const [monthlySpend, setMonthlySpend] = useState("500만원 ~ 1,000만원");
  const [agreed, setAgreed] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 유효성 검사
    if (!email.trim() || !password) {
      setErrorMsg("아이디(이메일)와 비밀번호를 모두 입력해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setErrorMsg("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    if (!restaurantName.trim()) {
      setErrorMsg("식당(매장) 상호명을 입력해 주세요.");
      return;
    }
    if (!bizNumber.trim()) {
      setErrorMsg("사업자등록번호를 입력해 주세요.");
      return;
    }
    if (!agreed) {
      setErrorMsg("필수 이용약관에 동의해 주세요.");
      return;
    }

    const regResult = registerUser({
      email: email.trim(),
      password,
      name: restaurantName.trim(),
      role: "RESTAURANT",
      badge: "식당 사장님",
      description: `${region} / ${cuisine} / 월 식자재 ${monthlySpend}`,
      businessNumber: bizNumber.trim(),
      representative: repName.trim() || restaurantName.trim(),
      phone: phone.trim(),
      categories: [cuisine],
      regions: [region],
    });

    if (!regResult.success || !regResult.user) {
      setErrorMsg(regResult.error || "가입 중 오류가 발생했습니다.");
      return;
    }

    // RoleContext 상태 즉시 갱신
    setCurrentUser(regResult.user);
    setIsSuccess(true);

    // 1.5초 후 견적 요청서 작성 페이지로 바로 이동
    setTimeout(() => {
      router.push("/rfq/new");
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            구매자 회원가입이 완료되었습니다!
          </h2>
          <p className="text-sm text-gray-600">
            <strong>{restaurantName}</strong> 사장님 계정으로 자동 로그인되었습니다.<br />
            실시간 식자재 비교 견적 요청서 작성으로 이동합니다...
          </p>
          <div className="pt-2">
            <Link
              href="/rfq/new"
              className="inline-flex items-center space-x-1.5 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>견적 요청서 작성 바로가기</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 sm:p-8">
          <div className="flex items-center space-x-2 text-orange-100 text-xs font-bold mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>외식업 사장님 전용 혜택</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            구매자(식당 사장님) 회원가입
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 mt-1">
            가입비 무료! 거래명세서 사진 한 장으로 평균 3곳 이상의 유통사 최저가 단가를 비교하세요.
          </p>
        </div>

        {/* 가입 폼 */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* 1. 로그인 계정 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Mail className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-black text-gray-900">
                1. 로그인 계정 정보
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  아이디 (이메일 주소) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="예: boss@pasta.co.kr"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    비밀번호 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6자리 이상 입력"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    비밀번호 확인 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="비밀번호 재입력"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. 매장 사업자 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Store className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-black text-gray-900">
                2. 식당(매장) 사업자 정보
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  매장 상호명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="예: 살롱순라 익선점"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  사업자등록번호 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bizNumber}
                  onChange={(e) => setBizNumber(e.target.value)}
                  placeholder="예: 222-32-16745"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  대표자 성명
                </label>
                <input
                  type="text"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  placeholder="예: 김사장"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  사장님 연락처 (휴대폰)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="예: 010-9876-5432"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 3. 매장 운영 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-black text-gray-900">
                3. 매장 운영 및 식자재 매입 규모
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  대표 업종
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm font-semibold text-gray-800"
                >
                  {CUISINE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  매장 소재 지역
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm font-semibold text-gray-800"
                >
                  {REGION_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  월 평균 예상 식자재 매입액
                </label>
                <select
                  value={monthlySpend}
                  onChange={(e) => setMonthlySpend(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm font-semibold text-gray-800"
                >
                  <option value="300만원 미만">300만원 미만 (소규모/카페)</option>
                  <option value="300만원 ~ 500만원">300만원 ~ 500만원</option>
                  <option value="500만원 ~ 1,000만원">500만원 ~ 1,000만원 (표준 일반식당)</option>
                  <option value="1,000만원 ~ 2,000만원">1,000만원 ~ 2,000만원 (대형/고깃집)</option>
                  <option value="2,000만원 이상">2,000만원 이상 (다점포/프랜차이즈)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-2 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer font-bold text-gray-800">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded border-gray-300"
              />
              <span>[필수] 견적식탁 외식업 구매자 이용약관 및 개인정보 처리에 동의합니다.</span>
            </label>
            <p className="text-[11px] text-gray-500 pl-6">
              ※ 견적 비교 요청 시 사업자등록번호 및 매장 정보는 입찰 참여 유통사에게만 안전하게 공유됩니다.
            </p>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-base shadow-lg transition-all"
          >
            식당 사장님 회원가입 완료 및 견적 받기 →
          </button>

          <div className="text-center text-xs text-gray-400">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-orange-600 font-bold hover:underline">
              로그인하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
