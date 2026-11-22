"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth-storage";
import { useRole } from "@/contexts/RoleContext";
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  FileText,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  "축산/육류",
  "채소/농산",
  "수산물",
  "유제품/치즈",
  "소스/공산품",
  "베이커리",
  "포장/배달용기",
];

const REGION_OPTIONS = [
  "서울 전역",
  "서울 종로/중구",
  "서울 강남/서초/송파",
  "서울 마포/영등포",
  "경기 성남/하남/광주",
  "경기 일산/고양/파주",
  "인천/부천",
  "충북 청주/대전",
];

export default function SupplierRegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useRole();

  // 폼 입력 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [bizNumber, setBizNumber] = useState("");
  const [repName, setRepName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>(["축산/육류"]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["서울 전역"]);
  const [trucks, setTrucks] = useState<number>(3);
  const [moq, setMoq] = useState("10만원");
  const [intro, setIntro] = useState("");
  const [agreed, setAgreed] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleRegion = (reg: string) => {
    setSelectedRegions((prev) =>
      prev.includes(reg) ? prev.filter((r) => r !== reg) : [...prev, reg]
    );
  };

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
    if (!companyName.trim()) {
      setErrorMsg("유통사 상호명을 입력해 주세요.");
      return;
    }
    if (!bizNumber.trim()) {
      setErrorMsg("사업자등록번호를 입력해 주세요.");
      return;
    }
    if (selectedCats.length === 0) {
      setErrorMsg("주력 취급 식자재 품목을 최소 1개 이상 선택해 주세요.");
      return;
    }
    if (!agreed) {
      setErrorMsg("필수 이용약관에 동의해 주세요.");
      return;
    }

    const regResult = registerUser({
      email: email.trim(),
      password,
      name: companyName.trim(),
      role: "SUPPLIER",
      badge: selectedCats[0] + " 전문",
      description: `${selectedRegions.join(", ")} / ${selectedCats.join(", ")} 전문 공급`,
      businessNumber: bizNumber.trim(),
      representative: repName.trim() || companyName.trim(),
      phone: phone.trim(),
      categories: selectedCats,
      regions: selectedRegions,
      trucks: Number(trucks) || 1,
      moq: moq || "10만원",
    });

    if (!regResult.success || !regResult.user) {
      setErrorMsg(regResult.error || "가입 중 오류가 발생했습니다.");
      return;
    }

    // RoleContext 상태 즉시 갱신
    setCurrentUser(regResult.user);
    setIsSuccess(true);

    // 1.5초 후 유통사 전용 입찰 공고함으로 이동
    setTimeout(() => {
      router.push("/supplier/rfqs");
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            판매자 회원가입이 완료되었습니다!
          </h2>
          <p className="text-sm text-gray-600">
            <strong>{companyName}</strong> 계정으로 자동 로그인되었습니다.<br />
            유통사 전용 입찰 공고함으로 즉시 이동합니다...
          </p>
          <div className="pt-2">
            <Link
              href="/supplier/rfqs"
              className="inline-flex items-center space-x-1.5 px-6 py-3 rounded-xl bg-[#6366F1] text-white font-bold text-xs"
            >
              <span>입찰 공고함 바로가기</span>
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
        <div className="bg-[#6366F1] text-white p-6 sm:p-8">
          <div className="flex items-center space-x-2 text-indigo-200 text-xs font-bold mb-1">
            <Truck className="w-4 h-4" />
            <span>식자재 직거래 파트너 입점</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            판매자(식자재 유통사) 회원가입
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1">
            가입비 0원, 중개 수수료 0원! 등록 즉시 외식업 사장님들의 실시간 입찰 요청서에 참여하세요.
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
              <Mail className="w-4 h-4 text-indigo-600" />
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
                  placeholder="예: food@supplier.co.kr"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm"
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
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm"
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
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. 유통사 사업자 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-black text-gray-900">
                2. 유통사 사업자 정보
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  상호명 (유통사 이름) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="예: (주)한결축산 유통"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm"
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
                  placeholder="예: 123-45-67890"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm"
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
                  placeholder="예: 홍길동"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  담당자 연락처 (휴대폰)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="예: 010-1234-5678"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* 3. 취급 품목 및 물류 인프라 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-black text-gray-900">
                3. 취급 품목 및 배송 인프라
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  주력 취급 식자재 품목 (다중 선택 가능) <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                        selectedCats.includes(cat)
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {selectedCats.includes(cat) ? "✓ " : ""}{cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  배송 가능 권역 (다중 선택 가능)
                </label>
                <div className="flex flex-wrap gap-2">
                  {REGION_OPTIONS.map((reg) => (
                    <button
                      key={reg}
                      type="button"
                      onClick={() => toggleRegion(reg)}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                        selectedRegions.includes(reg)
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {selectedRegions.includes(reg) ? "✓ " : ""}{reg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    보유 냉장·냉동 탑차 대수
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={trucks}
                    onChange={(e) => setTrucks(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    1회 최소주문금액(MOQ)
                  </label>
                  <input
                    type="text"
                    value={moq}
                    onChange={(e) => setMoq(e.target.value)}
                    placeholder="예: 10만원 (무료배송)"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer font-bold text-gray-800">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300"
              />
              <span>[필수] 견적식탁 판매자 이용약관 및 정산 정책에 동의합니다.</span>
            </label>
            <p className="text-[11px] text-gray-500 pl-6">
              ※ 견적식탁은 유통사와 식당 간의 거래에 중개 수수료를 부과하지 않으며, 결제 및 세금계산서는 양자 직거래로 발행됩니다.
            </p>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-black text-base shadow-lg transition-all"
          >
            판매자 회원가입 완료 및 입찰 시작하기 →
          </button>

          <div className="text-center text-xs text-gray-400">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              로그인하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
