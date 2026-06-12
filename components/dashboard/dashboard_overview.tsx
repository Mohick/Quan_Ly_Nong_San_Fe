"use client";

import React, { useState, useEffect } from "react";
import { DashboardAPI } from "@/lib/_api/dashboard";
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

const DashboardOverview: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = getCookie("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await DashboardAPI(token);
      if (res && res.data) {
        setDashboardData(res.data);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 1000000000) {
      return (val / 1000000000).toFixed(1).replace(/\.0$/, "") + " Tỷ đ";
    }
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1).replace(/\.0$/, "") + " Tr đ";
    }
    return new Intl.NumberFormat("vi-VN").format(val) + " đ";
  };

  // Stat items
  const stats = [
    {
      title: "Tổng doanh thu",
      value: dashboardData ? formatCurrency(dashboardData.total_revenue || 0) : "0 đ",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Đơn hàng mới",
      value: dashboardData ? `${dashboardData.new_orders_count || 0} đơn` : "0 đơn",
      change: "+8.2%",
      isPositive: true,
      icon: Package,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Khách hàng mới",
      value: dashboardData ? `${new Intl.NumberFormat("vi-VN").format(dashboardData.new_customers || 0)} hội viên` : "0 hội viên",
      change: "+24.3%",
      isPositive: true,
      icon: Users,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Sản phẩm tồn",
      value: dashboardData ? `${new Intl.NumberFormat("vi-VN").format(dashboardData.total_stock || 0)} kg` : "0 kg",
      change: "-3.1%",
      isPositive: false,
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  // Recent transactions table mapping
  const recentOrders = dashboardData?.recent_transactions?.map((t: any) => {
    let mappedStatus = "Khác";
    if (t.status === "DELIVERED") mappedStatus = "Hoàn thành";
    if (t.status === "PENDING") mappedStatus = "Đang xử lý";
    if (t.status === "CANCELLED") mappedStatus = "Đã hủy";

    return {
      id: t.order_code,
      customer: t.customer_name,
      product: t.product_name,
      amount: formatCurrency(t.revenue),
      status: mappedStatus
    };
  }) || [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#13a855] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-500">Đang tải dữ liệu dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 font-sans">
      {/* Welcome banner header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Tổng Quan Hệ Thống</h1>
          <p className="text-xs text-gray-500 mt-1">Cập nhật lúc: 11:20 SA - 01/06/2026</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Tháng 6, 2026</span>
        </button>
      </div>

      {/* Grid Stats Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {stat.title}
                </span>
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold text-gray-800 tracking-tight">
                  {stat.value}
                </span>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  stat.isPositive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "bg-red-50 text-red-700"
                }`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Orders Table (2/3 width) */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm">Giao dịch gần đây</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
              Xem tất cả
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Mã đơn</th>
                  <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Khách hàng</th>
                  <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Sản phẩm</th>
                  <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Doanh thu</th>
                  <th className="pb-3 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-3 text-xs font-bold text-gray-800">{order.id}</td>
                    <td className="py-3 text-xs font-semibold text-gray-700">{order.customer}</td>
                    <td className="py-3 text-xs text-gray-500">{order.product}</td>
                    <td className="py-3 text-xs font-bold text-gray-800">{order.amount}</td>
                    <td className="py-3 text-xs text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === "Hoàn thành" 
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "Đang xử lý"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-red-50 text-red-750"
                      }`}>
                        {order.status === "Hoàn thành" && <CheckCircle2 className="w-3 h-3" />}
                        {order.status === "Đang xử lý" && <Clock className="w-3 h-3" />}
                        {order.status === "Đã hủy" && <AlertCircle className="w-3 h-3" />}
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Task lists or tips (1/3 width) */}
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 mb-1 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm">Gợi ý từ AI Nông Nghiệp</h3>
          </div>
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800">Thời tiết nắng nóng kéo dài</p>
                <p className="text-[10px] text-amber-700 mt-1 leading-relaxed">
                  Dự kiến nhiệt độ tuần này tăng cao, khuyến nghị tăng tần suất tưới tiêu sầu riêng Ri6 thêm 15% vào sáng sớm.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-800">Nhu cầu ST25 tăng vọt</p>
                <p className="text-[10px] text-emerald-700 mt-1 leading-relaxed">
                  Lượng tìm kiếm gạo ST25 tăng 30% trên sàn thương mại điện tử. Hãy chuẩn bị các chương trình khuyến mãi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
