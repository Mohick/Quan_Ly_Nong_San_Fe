"use client";

import React from "react";
import { Search, Bell } from "lucide-react";

const DashboardTopbar: React.FC = () => {
  return (
    <header className="h-16 border-b border-gray-200/80 bg-white px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Left search input */}
      <div className="relative w-72 hidden sm:block">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm kiếm nhanh..."
          className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 focus:border-gray-300 focus:outline-none rounded-lg text-xs transition-colors"
        />
      </div>
      <div className="sm:hidden" />

      {/* Right profile, staff, notifications */}
      <div className="flex items-center gap-4.5">
        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-gray-200" />

        {/* Staff User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-800 leading-tight">Lê Văn Hùng</p>
            <p className="text-[10px] font-semibold text-gray-400">Chủ trang trại (Farmer)</p>
          </div>
          
          <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-extrabold text-sm select-none">
            H
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
