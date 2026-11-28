"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import { BuyerMainPage } from "@/components/buyer/BuyerMainPage";
import { SupplierMainPage } from "@/components/supplier/SupplierMainPage";
import { LandingServicePage } from "@/components/landing/LandingServicePage";

type ViewMode = "service" | "buyer" | "supplier";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser } = useRole();

  // 기본 상태 설정
  const [viewMode, setViewMode] = useState<ViewMode>("service");

  useEffect(() => {
    const viewParam = searchParams.get("view");
    if (viewParam === "buyer") {
      setViewMode("buyer");
    } else if (viewParam === "supplier") {
      setViewMode("supplier");
    } else if (viewParam === "service") {
      setViewMode("service");
    } else {
      // 파라미터가 없을 때: 로그인한 역할이 SUPPLIER이면 공급자 화면, 아니면 서비스 소개 랜딩
      if (currentUser?.role === "SUPPLIER") {
        setViewMode("supplier");
      } else {
        setViewMode("service");
      }
    }
  }, [searchParams, currentUser]);

  const handleSwitchView = (newView: ViewMode) => {
    setViewMode(newView);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", newView);
      window.history.pushState({}, "", url.toString());
    }
  };

  if (viewMode === "buyer") {
    return <BuyerMainPage onSwitchView={handleSwitchView} />;
  }

  if (viewMode === "supplier") {
    return <SupplierMainPage onSwitchView={handleSwitchView} />;
  }

  return <LandingServicePage onSwitchView={handleSwitchView} />;
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-500 font-medium">
          화면을 불러오는 중입니다...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
