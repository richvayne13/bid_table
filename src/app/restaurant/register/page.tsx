"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, isEmailRegistered } from "@/lib/auth-storage";
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
  Send,
  Timer,
  Check,
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
  "서울 종로/중구 (익선동 포함)",
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
  const [region, setRegion] = useState("서울 종로/중구 (익선동 포함)");
  const [monthlySpend, setMonthlySpend] = useState("500만원 ~ 1,000만원");
  const [agreed, setAgreed] = useState(true);

  // 이메일 인증 상태
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [emailAlert, setEmailAlert] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // 3분 카운트다운 타이머
  useEffect(() => {
    let timer: any;
    if (isVerifying && timeLeft > 0 && !isEmailVerified) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsVerifying(false);
    }
    return () => clearInterval(timer);
  }, [isVerifying, timeLeft, isEmailVerified]);

  const handleSendVerificationCode = () => {
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("유효한 이메일 주소를 입력해 주세요.");
      return;
    }
    if (isEmailRegistered(email)) {
      setErrorMsg("이미 등록된 이메일 계정입니다. 로그인 페이지를 이용해 주세요.");
      return;
    }
    setErrorMsg(null);
    // 6자리 랜덤 인증코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setIsVerifying(true);
    setTimeLeft(180);
    setIsEmailVerified(false);

    // 모의 이메일 발송 팝업 안내
    setEmailAlert(
      `[견적식탁 인증메일 발송 안내]\n\n${email} 주소로 6자리 인증번호가 발송되었습니다.\n\n👉 인증번호: [ ${code} ]\n(유효시간 3분)`
    );
  };

  const handleConfirmCode = () => {
    if (inputCode.trim() === verificationCode) {
      setIsEmailVerified(true);
      setIsVerifying(false);
      setErrorMsg(null);
    } else {
      setErrorMsg("인증번호가 일치하지 않습니다. 다시 확인해 주세요.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 유효성 검사
    if (!email.trim() || !password) {
      setErrorMsg("아이디(이메일)와 비밀번호를 모두 입력해 주세요.");
      return;
    }
    if (!isEmailVerified) {
      setErrorMsg("이메일 인증을 완료해 주세요.");
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
      address: `${region} ${restaurantName.trim()}`,
      cuisine: cuisine,
      monthlySpend: monthlySpend,
      paymentTerms: "월말정산",
      categories: [cuisine],
      regions: [region],
      status: "ACTIVE",
    });

    if (!regResult.success || !regResult.user) {
      setErrorMsg(regResult.error || "가입 중 오류가 발생했습니다.");
      return;
    }

    // RoleContext 상태 즉시 갱신
    setCurrentUser(regResult.user);
    setIsSuccess(true);

    // 1.5초 후 마이페이지로 이동
    setTimeout(() => {
      router.push("/mypage");
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
            실시간 식당 마이페이지로 이동합니다...
          </p>
          <div className="pt-2">
            <Link
              href="/mypage"
              className="inline-flex items-center space-x-1.5 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>내 마이페이지 바로가기</span>
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

          {/* 1. 로그인 계정 정보 & 이메일 인증 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Mail className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-black text-gray-900">
                1. 로그인 계정 정보 &amp; 이메일 인증
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  이메일 주소 (아이디) <span className="text-rose-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    required
                    disabled={isEmailVerified}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="예: boss@soonra.com"
                    className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-500 text-sm disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    disabled={isEmailVerified}
                    onClick={handleSendVerificationCode}
                    className="px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs whitespace-nowrap disabled:bg-emerald-600 disabled:cursor-not-allowed transition-colors"
                  >
                    {isEmailVerified ? "✓ 인증완료" : isVerifying ? "인증번호 재발송" : "인증번호 발송"}
                  </button>
                </div>
              </div>

              {/* 이메일 인증코드 입력창 */}
              {isVerifying && !isEmailVerified && (
                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-orange-800">
                      인증번호 6자리를 입력해 주세요.
                    </span>
                    <span className="font-mono font-bold text-rose-600 flex items-center">
                      <Timer className="w-3.5 h-3.5 mr-1" />
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="6자리 숫자"
                      className="flex-1 p-2.5 rounded-lg border border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono text-center tracking-widest text-base font-bold bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleConfirmCode}
                      className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
                    >
                      인증 확인
                    </button>
                  </div>
                </div>
              )}

              {isEmailVerified && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>이메일 주소({email}) 인증이 성공적으로 완료되었습니다.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
                  placeholder="예: 김순라"
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
            식당 사장님 회원가입 완료 및 시작하기 →
          </button>

          <div className="text-center text-xs text-gray-400">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-orange-600 font-bold hover:underline">
              로그인하기
            </Link>
          </div>
        </form>
      </div>

      {/* 이메일 발송 시뮬레이션 알림 모달 */}
      {emailAlert && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-gray-900">
                인증 메일이 발송되었습니다
              </h3>
              <p className="text-xs text-gray-500">
                입력하신 이메일로 6자리 인증코드가 전송되었습니다.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center space-y-1">
              <span className="text-[11px] text-gray-400">인증번호</span>
              <p className="text-2xl font-mono font-black text-orange-600 tracking-widest">
                {verificationCode}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setInputCode(verificationCode);
                setEmailAlert(null);
              }}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-colors"
            >
              인증번호 자동 입력 및 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
