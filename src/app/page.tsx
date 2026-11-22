"use client";

import { useRole } from "@/contexts/RoleContext";
import { RestaurantDashboard } from "@/components/dashboard/RestaurantDashboard";
import { SupplierDashboard } from "@/components/dashboard/SupplierDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function HomePage() {
  const { currentUser, switchRole } = useRole();

  return (
    <div className="space-y-4">
      {/* Quick Switcher Notice Banner */}
      <div className="bg-slate-900 text-white py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded bg-orange-500 font-bold uppercase tracking-wider text-[10px]">
              DEMO MODE
            </span>
            <span>
              현재 활성 모드: <strong className="text-orange-300">{currentUser.name}</strong> ({currentUser.badge})
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">원클릭 역할 전환:</span>
            <button
              onClick={() => switchRole("RESTAURANT")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentUser.role === "RESTAURANT"
                  ? "bg-orange-600 text-white font-bold"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              🍽️ 식당 모드
            </button>
            <button
              onClick={() => switchRole("SUPPLIER")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentUser.role === "SUPPLIER"
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              🚚 유통사 모드
            </button>
            <button
              onClick={() => switchRole("ADMIN")}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                currentUser.role === "ADMIN"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              🛡️ 관리자 모드
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Role Dashboard */}
      {currentUser.role === "RESTAURANT" && <RestaurantDashboard />}
      {currentUser.role === "SUPPLIER" && <SupplierDashboard />}
      {currentUser.role === "ADMIN" && <AdminDashboard />}
    </div>
  );
}
