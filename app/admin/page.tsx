"use client";

import React from "react";
import { ShieldCheck, Users, Banknote, Tractor } from "lucide-react";
import { useAutoLogin } from "@/hooks/useAutoLogin";

export default function AdminOverviewPage() {
  const { user, loading } = useAutoLogin();

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Tổng quan hệ thống
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Xin chào {(user as any)?.FullName || "Admin"}, chào mừng trở lại bảng điều khiển.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Chứng chỉ chờ duyệt</p>
              <p className="text-2xl font-black text-gray-900">12</p>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Doanh thu sàn (6%)</p>
              <p className="text-2xl font-black text-gray-900">24.5M</p>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Tractor className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Tổng nhà vườn</p>
              <p className="text-2xl font-black text-gray-900">156</p>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Khách hàng</p>
              <p className="text-2xl font-black text-gray-900">1,204</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mt-6 min-h-[300px] flex items-center justify-center text-gray-500 text-sm font-medium">
        Biểu đồ và thống kê chi tiết sẽ được cập nhật ở các phiên bản sau.
      </div>
    </div>
  );
}
