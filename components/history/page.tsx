"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag, Search, Eye, RefreshCw, Calendar,
  MapPin, CheckCircle, Clock, Truck, XCircle, ArrowLeft,
  ChevronRight, ChevronLeft, ArrowRight, Tag, CreditCard, ChevronDown, Printer
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { HistoryAPI } from "@/lib/_api/history";
import { printInvoice } from "@/utils/printInvoice";

interface OrderItem {
  id: string;
  name: string;
  image: string;
  category: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  status: "pending" | "shipping" | "delivered" | "cancelled";
  statusText: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  shippingAddress: string;
}

export default function PurchaseHistoryComponent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "shipping" | "delivered" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 2; // Show 2 orders per page to showcase pagination clearly

  // Fetch orders from the dynamic public JSON API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let token = "";
        if (typeof window !== "undefined") {
          const match = document.cookie.match(/(^|;)\s*access_token\s*=\s*([^;]+)/);
          if (match) token = match[2];
        }
        const response = await HistoryAPI(token);
        if (response.data && Array.isArray(response.data)) {
          setOrders(response.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Filtering logic
  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50 border-amber-100 text-amber-700",
          icon: <Clock className="w-4 h-4 text-amber-500" />
        };
      case "shipping":
        return {
          bg: "bg-sky-50 border-sky-100 text-sky-700",
          icon: <Truck className="w-4 h-4 text-sky-500 animate-pulse" />
        };
      case "delivered":
        return {
          bg: "bg-[#e8f8f0] border-[#cbeed7] text-[#13a855]",
          icon: <CheckCircle className="w-4 h-4 text-[#13a855]" />
        };
      case "cancelled":
        return {
          bg: "bg-red-50 border-red-100 text-red-700",
          icon: <XCircle className="w-4 h-4 text-red-500" />
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-100 text-gray-700",
          icon: <Clock className="w-4 h-4 text-gray-500" />
        };
    }
  };

  const handleReorder = (order: Order) => {
    alert(`Đã thêm toàn bộ sản phẩm của đơn hàng ${order.id} vào giỏ hàng thành công!`);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans selection:bg-[#13a855]/20 pb-20">

      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-b from-[#eafaf0] to-[#f8faf9] pt-12 pb-10 border-b border-[#e2efe7]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center lg:text-left flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e8f8f0] text-[#13a855] text-[11px] font-black rounded-full mb-3 border border-[#d4f2e1]">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Lịch sử mua hàng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              Quản Lý Đơn Hàng Của Bạn
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1">
              Theo dõi lộ trình giao nhận hàng, xem chi tiết hóa đơn hoặc đặt mua nhanh lại nông sản tươi sạch.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-xs sm:text-sm font-black text-gray-700 rounded-2xl shadow-sm transition-all group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
              <span>Tiếp tục mua hàng</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main order listings section */}
          <div className="lg:col-span-12 space-y-6">

            {/* Tabs & Search controls container */}
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              {/* Tab Navigation */}
              <nav className="flex flex-wrap gap-1.5">
                {(["all", "pending", "shipping", "delivered", "cancelled"] as const).map((tab) => {
                  const label = {
                    all: "Tất cả",
                    pending: "Chờ xác nhận",
                    shipping: "Đang giao",
                    delivered: "Đã giao",
                    cancelled: "Đã hủy"
                  }[tab];

                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${activeTab === tab
                        ? "bg-[#13a855] text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </nav>

              {/* Search Bar Input */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã Đơn hoặc tên nông sản..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#fcfdfe] border border-gray-300 rounded-xl py-2 px-10 text-xs font-semibold focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                />
              </div>

            </div>

            {/* Orders listing loop */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-10 h-10 border-4 border-t-transparent border-[#13a855] rounded-full animate-spin"></div>
                <span className="text-xs font-black text-gray-500">Đang tải lịch sử đơn hàng...</span>
              </div>
            ) : paginatedOrders.length === 0 ? (
              <div className="bg-white border border-gray-200/80 rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto mt-6">
                <div className="w-16 h-16 bg-[#f0fbf5] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e2efe7]">
                  <ShoppingBag className="w-8 h-8 text-[#13a855]" />
                </div>
                <h3 className="text-base font-black text-gray-900">Không tìm thấy đơn hàng nào</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1 leading-relaxed">
                  Bạn hiện không có đơn hàng nào khớp với bộ lọc đang chọn. Hãy thử tìm kiếm hoặc mua sắm nông sản sạch ngay!
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <span>Khám phá sản phẩm</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4.5">
                {paginatedOrders.map((order) => {
                  const style = getStatusStyle(order.status);
                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Order top bar info */}
                      <div className="bg-[#fcfdfe] px-5 py-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900 tracking-wider uppercase">{order.id}</span>
                          <span className="text-gray-300">|</span>
                          <div className="flex items-center gap-1.5 text-gray-400 font-bold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{order.date}</span>
                          </div>
                        </div>

                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-black ${style.bg}`}>
                          {style.icon}
                          <span>{order.statusText}</span>
                        </div>
                      </div>

                      {/* Order items body */}
                      <div className="divide-y divide-gray-50 px-5">
                        {order.items.map((item) => (
                          <div key={item.id} className="py-4 flex gap-4 items-center">
                            <div className="w-14 h-14 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">{item.category}</span>
                              <span className="block text-xs sm:text-sm font-black text-gray-900 mt-0.5 truncate">{item.name}</span>
                              <span className="block text-xs text-gray-400 font-bold mt-0.5">Số lượng: x{item.quantity}</span>
                            </div>
                            <div className="text-right">
                              <span className="block font-black text-gray-900 text-xs sm:text-sm">
                                {item.price.toLocaleString("vi-VN")} đ
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order bottom summary and actions */}
                      <div className="bg-[#fcfdfe] border-t border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-gray-400 font-bold">Tổng thanh toán:</span>
                          <span className="text-base sm:text-lg font-black text-[#13a855]">
                            {order.total.toLocaleString("vi-VN")} đ
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => printInvoice(order)}
                            className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-emerald-50 border border-[#13a855] text-[#13a855] text-xs font-black rounded-xl transition-all cursor-pointer active:scale-95"
                            title="In Hóa Đơn"
                          >
                            <Printer className="w-4 h-4" />
                            <span>In Hóa Đơn</span>
                          </button>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-gray-50 border border-gray-250 text-gray-700 text-xs font-black rounded-xl transition-all cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem chi tiết</span>
                          </button>

                          {order.status === "delivered" && (
                            <button
                              onClick={() => handleReorder(order)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Mua lại</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#13a855] hover:bg-emerald-50 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${currentPage === page
                      ? "bg-[#13a855] text-white shadow-md border border-[#13a855]"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-[#13a855]"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#13a855] hover:bg-emerald-50 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Modal Detail Info Panel popup */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-gray-100 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="p-5 border-b border-gray-150 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900 uppercase">Chi Tiết Đơn Hàng</h3>
                <span className="text-[10px] text-gray-400 font-black tracking-wider">{selectedOrder.id}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full border border-gray-250 hover:bg-gray-50 flex items-center justify-center font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">

              {/* Order status overview */}
              <div className="p-4 bg-[#f8faf9] rounded-2xl border border-gray-150 space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">Trạng thái:</span>
                  <span className="font-black text-[#13a855]">{selectedOrder.statusText}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">Thời gian đặt:</span>
                  <span className="font-bold text-gray-700">{selectedOrder.date}</span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3 text-xs sm:text-sm">
                <h4 className="font-black text-gray-900 border-l-3 border-[#13a855] pl-2">Thông Tin Giao Hàng</h4>
                <div className="space-y-2 bg-[#fcfdfe] p-4 border border-gray-150 rounded-2xl">
                  <div className="flex gap-2 items-start">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="block font-black text-gray-700 text-xs">Địa chỉ nhận hàng</span>
                      <span className="block text-gray-500 font-semibold text-xs leading-relaxed mt-0.5">{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-50 my-2"></div>
                  <div className="flex gap-2 items-start">
                    <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="block font-black text-gray-700 text-xs">Phương thức thanh toán</span>
                      <span className="block text-gray-500 font-semibold text-xs mt-0.5">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 text-xs">
                <h4 className="font-black text-gray-900 border-l-3 border-[#13a855] pl-2">Danh Sách Sản Phẩm</h4>
                <div className="divide-y divide-gray-50 border border-gray-150 rounded-2xl overflow-hidden bg-white">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3.5 flex gap-3.5 items-center bg-[#fcfdfe]">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block font-black text-gray-800 text-xs truncate">{item.name}</span>
                        <span className="block text-[10px] text-gray-400 font-bold mt-0.5">Đơn giá: {item.price.toLocaleString("vi-VN")} đ x {item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-gray-800 text-xs">{(item.price * item.quantity).toLocaleString("vi-VN")} đ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2.5 p-4 border border-gray-150 rounded-2xl bg-[#fcfdfe] text-xs">
                <div className="flex justify-between font-bold text-gray-500">
                  <span>Tiền hàng:</span>
                  <span>{selectedOrder.items.reduce((acc, it) => acc + it.price * it.quantity, 0).toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between font-bold text-gray-500">
                  <span>Phí vận chuyển:</span>
                  <span>25.000 đ</span>
                </div>
                <div className="flex justify-between font-bold text-gray-500">
                  <span>Giảm giá phí vận chuyển:</span>
                  <span className="text-red-500">-25.000 đ</span>
                </div>
                <div className="border-t border-gray-100 my-2"></div>
                <div className="flex justify-between items-baseline">
                  <span className="font-black text-gray-800 text-sm">Thực nhận:</span>
                  <span className="font-black text-lg text-[#13a855]">{selectedOrder.total.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-150 flex justify-end gap-2">
              <button
                onClick={() => printInvoice(selectedOrder)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>In Hóa Đơn</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Đóng chi tiết
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
