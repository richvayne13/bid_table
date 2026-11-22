"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BuyerRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/restaurant/register");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-xs text-gray-400">
      구매자 회원가입 페이지로 이동 중...
    </div>
  );
}
