"use client";

import React, { useState, useEffect } from "react";
import { getRevenueReportAPI } from "@/lib/_api/dashboard";
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

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      setIsLoading(true);
      const token = getCookie("access_token");
      if (!token) return;
      const res = await getRevenueReportAPI(token, timeRange);
      if (res && res.data) {
        setRevenueData(res.data);
      }
      setIsLoading(false);
    };
    fetchRevenue();
  }, [timeRange]);

  const revenueStats = revenueData?.summary || {
    total_revenue: 0,
    average_order_value: 0,
    order_count: 0,
    target_efficiency: 0,
  };

  const chartData = revenueData?.chart_data || [];
  const maxChartValue = Math.max(...chartData.map((d: any) => d.value), 1);
  const chartItems = chartData.map((d: any) => ({
    label: d.label,
    value: d.value,
    percentage: Math.round((d.value / maxChartValue) * 100)
  }));

  const recentTransactions = revenueData?.recent_transactions || [];



  const formatVND = (value: number) => {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1).replace(/\.0$/, "") + " Tỷ đ";
    }
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1).replace(/\.0$/, "") + " Tr đ";
    }
    return new Intl.NumberFormat("vi-VN").format(value) + " đ";
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
        {["today", "week", "month", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all capitalize cursor-pointer ${
              timeRange === range
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {range === "today" ? "Hôm nay" : range === "week" ? "Tuần này" : range === "month" ? "Tháng này" : "Năm nay"}
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
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{formatVND(revenueStats.total_revenue)}</h2>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 px-1 rounded-sm">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +18.4%
            </span>
            <span className="text-[9px] text-gray-400 font-semibold">so với kỳ trước</span>
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
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{formatVND(revenueStats.average_order_value)}</h2>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 px-1 rounded-sm">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +4.2%
            </span>
            <span className="text-[9px] text-gray-400 font-semibold">so với kỳ trước</span>
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
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{revenueStats.order_count} đơn</h2>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 px-1 rounded-sm">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +15.3%
            </span>
            <span className="text-[9px] text-gray-400 font-semibold">so với kỳ trước</span>
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
          <h2 className="text-xl font-black text-gray-800 tracking-tight">{revenueStats.target_efficiency}%</h2>
          <div className="flex items-center gap-1 mt-2.5">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-emerald-50 text-emerald-700 px-1 rounded-sm">
              <ArrowUpRight className="w-2.5 h-2.5" />
              +1.2%
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
          {chartItems.map((item: any, index: number) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded-md mb-2 shadow-md absolute -translate-y-24 pointer-events-none whitespace-nowrap z-10">
                {formatVND(item.value)}
              </div>
              
              {/* Dynamic Styled CSS Bar */}
              <div 
                style={{ height: `${item.percentage}%` }}
                className="w-full sm:w-10 bg-emerald-600 hover:bg-emerald-700 rounded-t-md transition-all shadow-sm shadow-emerald-50 min-h-[5px]"
              />
              
              {/* Label */}
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 mt-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{item.label}</span>
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
              {recentTransactions.map((txn: any) => (
                <tr key={txn.transaction_code} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-3.5 text-xs font-bold text-gray-800">{txn.transaction_code}</td>
                  <td className="py-3.5 text-xs font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center border border-gray-150">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                    <span>{txn.buyer_name}</span>
                  </td>
                  <td className="py-3.5 text-xs text-gray-500">{txn.product_details}</td>
                  <td className="py-3.5 text-xs text-gray-455">{txn.date}</td>
                  <td className="py-3.5 text-xs font-bold text-gray-800 text-right">{formatVND(txn.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
