"use client";

import React from "react";
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

const DashboardOverview: React.FC = () => {
  // Stat items
  const stats = [
    {
      title: "Tổng doanh thu",
      value: "148,250,000 đ",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Đơn hàng mới",
      value: "42 đơn",
      change: "+8.2%",
      isPositive: true,
      icon: Package,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Khách hàng mới",
      value: "1,240 hội viên",
      change: "+24.3%",
      isPositive: true,
      icon: Users,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Sản phẩm tồn",
      value: "350 kg",
      change: "-3.1%",
      isPositive: false,
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  // Recent transactions table mock
  const recentOrders = [
    { id: "DH-0982", customer: "Trần Anh Tuấn", product: "Gạo ST25 Sóc Trăng", amount: "1,250,000 đ", status: "Hoàn thành" },
    { id: "DH-0981", customer: "Phạm Minh Hoàng", product: "Sầu riêng Ri6 Bến Tre", amount: "2,400,000 đ", status: "Đang xử lý" },
    { id: "DH-0980", customer: "Nguyễn Thị Mai", product: "Bơ sáp 034 Đắk Lắk", amount: "620,000 đ", status: "Đã hủy" },
    { id: "DH-0979", customer: "Lâm Hoàng Nam", product: "Cà phê Robusta Gia Lai", amount: "3,100,000 đ", status: "Hoàn thành" },
  ];

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
                {recentOrders.map((order) => (
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
