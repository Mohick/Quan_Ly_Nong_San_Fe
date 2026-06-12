"use client";

import React, { useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Download, 
  Filter, 
  ShoppingBag, 
  Tag, 
  User  
} from "lucide-react";
import { toast } from "react-toastify";

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState("monthly");

  // Mock revenue data for agricultural platform
  const revenueStats = {
    totalRevenue: 284350000,
    averageOrderValue: 1250000,
    growthRate: 18.4,
    salesCount: 228,
  };

  const weeklyData = [
    { day: "Thứ 2", revenue: 24000000, percentage: 60 },
    { day: "Thứ 3", revenue: 32000000, percentage: 80 },
    { day: "Thứ 4", revenue: 18000000, percentage: 45 },
    { day: "Thứ 5", revenue: 40000000, percentage: 100 },
    { day: "Thứ 6", revenue: 29000000, percentage: 72 },
    { day: "Thứ 7", revenue: 35000000, percentage: 88 },
    { day: "Chủ Nhật", revenue: 42000000, percentage: 95 },
  ];

  const recentTransactions = [
    { id: "TXN-1092", buyer: "Hợp tác xã An Bình", product: "500kg Gạo ST25", total: 12500000, date: "01/06/2026", status: "Thành công" },
    { id: "TXN-1091", buyer: "Nguyễn Văn Hùng", product: "100kg Sầu riêng Ri6", total: 8500000, date: "01/06/2026", status: "Thành công" },
    { id: "TXN-1090", buyer: "Siêu thị FreshFood", product: "200kg Bơ sáp 034", total: 6000000, date: "31/05/2026", status: "Thành công" },
    { id: "TXN-1089", buyer: "Trần Thị Mai", product: "50kg Cà phê hạt", total: 4500000, date: "30/05/2026", status: "Đang treo" },
  ];

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header section with buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Báo Cáo Doanh Thu</h1>
          <p className="text-xs text-gray-500 mt-1">Theo dõi doanh thu bán hàng và tăng trưởng kinh doanh nông sản</p>
        </div>
        
        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => toast.info("Đang xuất dữ liệu CSV...")}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-400" />
            <span>Xuất file</span>
          </button>
          
          <button 
            onClick={() => toast.info("Mở bộ lọc nâng cao...")}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      {/* Time Range Filter Bar */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {["daily", "weekly", "monthly", "yearly"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all capitalize cursor-pointer ${
              timeRange === range
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {range === "daily" ? "Hôm nay" : range === "weekly" ? "Tuần này" : range === "monthly" ? "Tháng này" : "Năm nay"}
          </button>
        ))}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-extrabold text-gray-450 uppercase tracking-wide">Tổng doanh thu</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{formatVND(revenueStats.totalRevenue)}</h2>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 px-1 rounded-sm">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +{revenueStats.growthRate}%
            </span>
            <span className="text-[9px] text-gray-400 font-semibold">so với tháng trước</span>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-extrabold text-gray-450 uppercase tracking-wide">Giá trị đơn TB</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{formatVND(revenueStats.averageOrderValue)}</h2>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 px-1 rounded-sm">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +4.2%
            </span>
            <span className="text-[9px] text-gray-400 font-semibold">so với tháng trước</span>
          </div>
        </div>

        {/* Sales count */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-extrabold text-gray-450 uppercase tracking-wide">Số lượng đơn hàng</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Tag className="w-4.5 h-4.5" />
            </div>
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{revenueStats.salesCount} đơn</h2>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 px-1 rounded-sm">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +15.3%
            </span>
            <span className="text-[9px] text-gray-400 font-semibold">so với tháng trước</span>
          </div>
        </div>

        {/* Tăng trưởng */}
        <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] font-extrabold text-gray-450 uppercase tracking-wide">Hiệu suất mục tiêu</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight">92.5%</h2>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-red-50 text-red-700 px-1 rounded-sm">
              <ArrowDownRight className="w-2.5 h-2.5" />
              -1.2%
            </span>
            <span className="text-[9px] text-gray-400 font-semibold">so với chỉ tiêu</span>
          </div>
        </div>
      </div>

      {/* Visual Chart Area using pure grid and CSS bars */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-sm mb-6">Biểu đồ doanh thu hàng tuần</h3>
        
        {/* Weekly Chart */}
        <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-gray-100 mb-4 px-2">
          {weeklyData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded-md mb-2 shadow-md absolute -translate-y-24 pointer-events-none">
                {formatVND(item.revenue)}
              </div>
              
              {/* Dynamic Styled CSS Bar */}
              <div 
                style={{ height: `${item.percentage}%` }}
                className="w-full sm:w-10 bg-emerald-600 hover:bg-emerald-700 rounded-t-md transition-all shadow-sm shadow-emerald-50 min-h-[5px]"
              />
              
              {/* Label */}
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 mt-2">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sales logs */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 text-sm mb-4">Các giao dịch doanh thu gần nhất</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Mã GD</th>
                <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Người mua</th>
                <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Sản phẩm chi tiết</th>
                <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Ngày bán</th>
                <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-right">Tổng thanh toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-3.5 text-xs font-bold text-gray-800">{txn.id}</td>
                  <td className="py-3.5 text-xs font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center border border-gray-150">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                    <span>{txn.buyer}</span>
                  </td>
                  <td className="py-3.5 text-xs text-gray-500">{txn.product}</td>
                  <td className="py-3.5 text-xs text-gray-455">{txn.date}</td>
                  <td className="py-3.5 text-xs font-bold text-gray-800 text-right">{formatVND(txn.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
