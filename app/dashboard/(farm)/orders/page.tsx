"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Eye, Clock, Truck, CheckCircle, 
  XCircle, AlertTriangle, ShieldCheck, MapPin, 
  Phone, User, Mail, CreditCard, ChevronDown, 
  Check, X, Loader2, Calendar, ShoppingBag, Printer
} from "lucide-react";
import { getOrderManagementAPI, updateOrderStatusAPI } from "@/lib/_api/order";
import { printInvoice } from "@/utils/printInvoice";
import { toast } from "react-toastify";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  paymentMethod: string;
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  items: OrderItem[];
}

export default function DashboardOrders() {
  const [counts, setCounts] = useState({ pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, all: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const loadOrdersList = async (search: string, status: string) => {
    try {
      const token = getCookie("access_token");
      if (!token) return;
      const res = await getOrderManagementAPI(token, status, search);
      
      if (res.data && res.data.valid && res.data.data) {
        if (res.data.data.counts) {
          setCounts(res.data.data.counts);
        }
        const rawOrders = Array.isArray(res.data.data.orders) ? res.data.data.orders : [];
        const mapped: Order[] = rawOrders.map((order: any) => {
          return {
            id: order.order_code || order.ID || "",
            userId: "",
            customerName: order.customer_name || "Khách vãng lai",
            customerPhone: order.customer_phone || "Chưa có SĐT",
            customerEmail: order.customer_email || "N/A",
            address: order.address || "Liên hệ khách để lấy địa chỉ",
            paymentMethod: order.payment_method || "COD",
            totalAmount: order.total_price || order.total_amount || 0,
            status: order.status || "PENDING",
            createdAt: order.created_at || "",
            items: order.items || [{
              id: "1",
              productName: order.product_name || "Sản phẩm",
              quantity: 1,
              price: order.total_price || order.total_amount || 0,
              unit: "đơn"
            }]
          };
        });
        setOrders(mapped);
      } else {
        showNotification(res.data?.message || "Lấy danh sách đơn hàng thất bại", "error");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      showNotification(error.response?.data?.message || "Lỗi kết nối máy chủ backend", "error");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      loadOrdersList(searchQuery, statusFilter).finally(() => setIsLoading(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatusId(orderId);
    try {
      const token = getCookie("access_token");
      const res = await updateOrderStatusAPI(orderId, newStatus, token);
      if (res.data && res.data.valid) {
        showNotification(`Cập nhật trạng thái đơn hàng sang "${newStatus}" thành công!`, "success");
        
        // Update status in local state
        setOrders((prev) => 
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );

        // If currently open in detail modal, update selectedOrder
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        showNotification(res.data?.message || "Không thể cập nhật trạng thái đơn hàng", "error");
      }
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái:", error);
      showNotification(error.response?.data?.message || "Lỗi cập nhật trạng thái đơn hàng", "error");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Status mapping to human readable text
  const getStatusDetails = (status: string) => {
    switch (status) {
      case "PENDING":
        return { text: "Chờ xác nhận", style: "bg-amber-50 text-amber-700 border-amber-200" };
      case "PROCESSING":
        return { text: "Đang xử lý", style: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "SHIPPED":
        return { text: "Đang giao hàng", style: "bg-blue-50 text-blue-700 border-blue-200" };
      case "DELIVERED":
        return { text: "Đã giao hàng", style: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "CANCELLED":
        return { text: "Đã hủy đơn", style: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { text: status, style: "bg-gray-50 text-gray-700 border-gray-200" };
    }
  };

  // Filter & Search logic is now handled by the backend API
  const filteredOrders = orders;

  return (
    <div className="space-y-6">

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-0.5">
            Xử lý và theo dõi các đơn đặt hàng nông sản của khách hàng.
          </p>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none">Chờ xác nhận</span>
            <span className="block text-lg font-black text-gray-800 mt-1 leading-none">
              {counts.pending}
            </span>
          </div>
        </div>
        <div className="bg-white p-4.5 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin-slow text-indigo-500" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none">Đang xử lý</span>
            <span className="block text-lg font-black text-gray-800 mt-1 leading-none">
              {counts.processing}
            </span>
          </div>
        </div>
        <div className="bg-white p-4.5 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none">Đang giao</span>
            <span className="block text-lg font-black text-gray-800 mt-1 leading-none">
              {counts.shipped}
            </span>
          </div>
        </div>
        <div className="bg-white p-4.5 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none">Hoàn thành</span>
            <span className="block text-lg font-black text-[#13a855] mt-1 leading-none">
              {counts.delivered}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & search panel */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "PENDING", label: "Chờ xác nhận" },
            { id: "PROCESSING", label: "Đang xử lý" },
            { id: "SHIPPED", label: "Đang giao" },
            { id: "DELIVERED", label: "Đã giao" },
            { id: "CANCELLED", label: "Đã hủy" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-250"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã đơn, tên khách, SĐT..."
            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 pl-9 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 text-gray-700 placeholder-gray-400"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Orders Table list */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
            <span className="text-xs font-bold">Đang tải danh sách hóa đơn...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-150/80">
                  <th className="px-5 py-4 text-[10px] font-black text-gray-450 uppercase tracking-wider">Mã đơn hàng</th>
                  <th className="px-5 py-4 text-[10px] font-black text-gray-450 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-5 py-4 text-[10px] font-black text-gray-450 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-5 py-4 text-[10px] font-black text-gray-450 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-5 py-4 text-[10px] font-black text-gray-450 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-5 py-4 text-[10px] font-black text-gray-450 uppercase tracking-wider">Thanh toán</th>
                  <th className="px-5 py-4 text-[10px] font-black text-gray-450 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-4 text-[10px] font-black text-gray-450 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusDetails(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* ID */}
                      <td className="px-5 py-4.5 whitespace-nowrap">
                        <span className="font-extrabold text-xs text-gray-700 font-mono select-all">
                          #{order.id.slice(0, 8)}...
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="px-5 py-4.5">
                        <div className="space-y-0.5">
                          <span className="block font-extrabold text-xs text-gray-800 leading-none">{order.customerName}</span>
                          <span className="block text-[10px] font-bold text-gray-450 leading-none">{order.customerPhone}</span>
                        </div>
                      </td>

                      {/* Order Date */}
                      <td className="px-5 py-4.5 whitespace-nowrap">
                        <span className="text-xs font-semibold text-gray-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      {/* Product Preview */}
                      <td className="px-5 py-4.5">
                        <span className="text-xs font-semibold text-gray-650 line-clamp-1 max-w-xs">
                          {order.items.map(item => `${item.productName} (x${item.quantity})`).join(", ")}
                        </span>
                      </td>

                      {/* Total price */}
                      <td className="px-5 py-4.5 whitespace-nowrap">
                        <span className="text-xs font-black text-emerald-600">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="px-5 py-4.5 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold border border-gray-250 bg-gray-50 text-gray-650">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Status Badges */}
                      <td className="px-5 py-4.5 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold border rounded-full ${statusInfo.style}`}>
                          {statusInfo.text}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4.5 whitespace-nowrap text-right text-xs">
                        <div className="inline-flex gap-2 justify-end items-center">
                          {/* Quick Action buttons based on current state */}
                          {order.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id, "PROCESSING")}
                                disabled={updatingStatusId === order.id}
                                className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                                title="Xác nhận xử lý đơn hàng"
                              >
                                Xác nhận
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                                disabled={updatingStatusId === order.id}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg font-bold transition-colors cursor-pointer border border-rose-100 disabled:opacity-50"
                                title="Hủy đơn hàng này"
                              >
                                Hủy
                              </button>
                            </>
                          )}

                          {order.status === "PROCESSING" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                              disabled={updatingStatusId === order.id}
                              className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              Giao hàng
                            </button>
                          )}

                          {order.status === "SHIPPED" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                              disabled={updatingStatusId === order.id}
                              className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-750 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              Hoàn thành
                            </button>
                          )}

                          {/* View details */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 rounded-lg transition-colors cursor-pointer active:scale-95"
                            title="Chi tiết đơn hàng"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-650">Không tìm thấy hóa đơn nào</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm của bạn để tìm thấy dữ liệu.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-gray-800 flex items-center gap-1.5 font-mono leading-none">
                  ĐƠN HÀNG #{selectedOrder.id}
                </h3>
                <span className="block text-[10px] text-gray-400 font-bold mt-1.5">
                  Đặt lúc: {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-gray-250/60 text-gray-400 hover:text-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Buyer profile & address card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Delivery Info */}
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-150 space-y-2.5">
                  <span className="block text-[10px] font-black uppercase text-emerald-600 tracking-wider">Thông Tin Người Nhận</span>
                  <div className="space-y-1.5 font-semibold text-gray-650">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-gray-800 font-extrabold">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="break-all">{selectedOrder.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery address & method */}
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-150 space-y-2.5">
                  <span className="block text-[10px] font-black uppercase text-emerald-600 tracking-wider">Hình Thức Giao Nhận</span>
                  <div className="space-y-1.5 font-semibold text-gray-650">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="leading-snug text-gray-800">{selectedOrder.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Thanh toán: <span className="font-extrabold text-gray-800">{selectedOrder.paymentMethod}</span></span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Items Table List */}
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-200">
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-450 uppercase">Sản phẩm nông sản</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-450 uppercase text-center">Số lượng</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-450 uppercase text-right">Đơn giá</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-450 uppercase text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="font-semibold text-gray-700">
                        <td className="px-4 py-3.5 text-gray-800 font-extrabold">{item.productName}</td>
                        <td className="px-4 py-3.5 text-center">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-3.5 text-right text-gray-500">{formatPrice(item.price)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50/40">
                      <td colSpan={3} className="px-4 py-3 text-right font-black text-gray-850">Thành tiền tổng hóa đơn</td>
                      <td className="px-4 py-3 text-right font-black text-emerald-600 text-sm sm:text-base">{formatPrice(selectedOrder.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status and Action Panel */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wide">Trạng thái hiện tại</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold border rounded-full ${getStatusDetails(selectedOrder.status).style}`}>
                      {getStatusDetails(selectedOrder.status).text}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {selectedOrder.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, "PROCESSING")}
                        disabled={updatingStatusId !== null}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Xác nhận xử lý</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELLED")}
                        disabled={updatingStatusId !== null}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Hủy đơn</span>
                      </button>
                    </>
                  )}

                  {selectedOrder.status === "PROCESSING" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "SHIPPED")}
                      disabled={updatingStatusId !== null}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-lg font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Giao hàng</span>
                    </button>
                  )}

                  {selectedOrder.status === "SHIPPED" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "DELIVERED")}
                      disabled={updatingStatusId !== null}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Hoàn thành đơn hàng</span>
                    </button>
                  )}

                  {/* Print Invoice button */}
                  <button
                    onClick={() => printInvoice(selectedOrder)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In Hóa Đơn</span>
                  </button>

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 rounded-lg font-bold transition-all cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
