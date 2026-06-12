"use client";

import React from "react";
import { Users, UserPlus, ShieldAlert } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Hệ thống
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
            Quản Lý Nhân Sự (CTV)
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Thêm mới và phân quyền Cộng tác viên (Collaborator) để phụ giúp xét duyệt chứng chỉ.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
          <UserPlus className="h-4 w-4" />
          Tạo tài khoản CTV
        </button>
      </div>

      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <ShieldAlert className="h-16 w-16 text-yellow-400 mb-4" />
        <h3 className="text-lg font-black text-gray-900">Tính năng đang được phát triển</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-md">
          Tính năng quản lý danh sách Cộng Tác Viên và cấp quyền truy cập hiện đang trong quá trình xây dựng. Vui lòng quay lại sau!
        </p>
      </div>
    </div>
  );
}
