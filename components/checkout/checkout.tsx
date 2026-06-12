"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, CreditCard, ShieldCheck, MapPin, 
  Phone, User, Mail, Truck, Loader2, CheckCircle,
  QrCode, Wallet, Printer 
} from "lucide-react";
import { productAPI } from "@/lib/_api/product";
import { getCartAPI } from "@/components/cart/service";
import { placeOrderAPI } from "@/lib/_api/order";
import { getProfileAPI } from "@/lib/_api/profile";
import { printInvoice } from "@/utils/printInvoice";
import { toast } from "react-toastify";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface CheckoutItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

export default function CheckoutView() {
  // Prefilled customer info matching profile GET request
  const [fullName, setFullName] = useState("Nguyen Van A");
  const [phone, setPhone] = useState("0901234567");
  const [email, setEmail] = useState("user@example.com");
  const [address, setAddress] = useState("Ho Chi Minh City");
  const [notes, setNotes] = useState("");
  
  // Payment methods: cod (default), bank (QR code), momo
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank" | "momo">("cod");

  // Dynamic order items fetched from database
  const [orderItems, setOrderItems] = useState<CheckoutItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Validation errors for required fields
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Fetch actual products from the cart database or fall back to local cart
  useEffect(() => {
    const fetchCheckoutProducts = async () => {
      try {
        const token = getCookie("access_token");
        const res = await getCartAPI(token);
        const cartData = res.data?.data || {};
        const items = Array.isArray(cartData.items) ? cartData.items : (Array.isArray(cartData.cart_items) ? cartData.cart_items : []);
        
        const mapped = items.map((item: any) => {
          const prod = item.product || item.Product || {};
          const discount = prod.Discount || prod.discount || {};
          const hasDiscount = discount.Active || discount.active || false;
          const originalPrice = prod.Price || prod.price || 0;
          const price = hasDiscount ? (discount.DiscountPrice || discount.discount_price || originalPrice) : originalPrice;
          
          let image = "https://images.unsplash.com/photo-1610348725531-843dff10902c?q=80&w=600&auto=format&fit=crop";
          const imageProducts = prod.ImageProducts || prod.image_products || [];
          if (imageProducts.length > 0) {
            image = imageProducts[0].ImageURL || imageProducts[0].image_url || imageProducts[0].ImageUrl || image;
          }
          
          return {
            id: item.product_id || item.ProductID || prod.id || prod.ID,
            name: prod.Name || prod.name || "",
            price: price,
            quantity: item.quantity || item.Quantity || 1,
            image: image,
            unit: prod.Unit || prod.unit || "kg"
          };
        });

        if (mapped.length > 0) {
          setOrderItems(mapped);
        } else {
          // Fallback to local cart
          if (typeof window !== "undefined") {
            const localCart = localStorage.getItem("local_cart");
            if (localCart) {
              const parsed = JSON.parse(localCart);
              setOrderItems(parsed.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                unit: item.unit
              })));
            }
          }
        }
      } catch (error) {
        console.warn("Cart API failed in checkout, trying local cart fallback:", error);
        if (typeof window !== "undefined") {
          const localCart = localStorage.getItem("local_cart");
          if (localCart) {
            try {
              const parsed = JSON.parse(localCart);
              setOrderItems(parsed.map((item: any) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                unit: item.unit
              })));
            } catch (_) {}
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchCheckoutProducts();
  }, []);

  // Fetch user profile info to prefill form
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getCookie("access_token");
        if (!token) return;
        const res = await getProfileAPI(token);
        if (res.data && res.data.valid) {
          const user = res.data.data || {};
          if (user.full_name) setFullName(user.full_name);
          if (user.phone) setPhone(user.phone);
          if (user.email) setEmail(user.email);
          if (user.address) setAddress(user.address);
        }
      } catch (error) {
        console.warn("Failed to load user profile for checkout prefill:", error);
      }
    };
    fetchProfile();
  }, []);

  // Order Calculations
  const tempTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = tempTotal >= 300000 || tempTotal === 0 ? 0 : 30000;
  const grandTotal = tempTotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields and collect errors
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Vui lòng nhập họ và tên người nhận";
    if (!phone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
    if (!email.trim()) errors.email = "Vui lòng nhập địa chỉ email";
    if (!address.trim()) errors.address = "Vui lòng nhập địa chỉ nhận hàng";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      const token = getCookie("access_token");
      const res = await placeOrderAPI({
        address: address,
        payment_method: paymentMethod.toUpperCase()
      }, token);

      if (res.data && res.data.valid) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("local_cart");
        }
        setCreatedOrder(res.data.data);
        setIsSuccess(true);
      } else {
        toast.error(res.data?.message || "Đặt hàng không thành công. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Error submitting order:", error);
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng. Vui lòng kiểm tra lại kết nối!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faf9] font-sans p-6 text-center select-none animate-fade-in text-gray-800">
        <Loader2 className="w-10 h-10 animate-spin text-[#13a855] mb-4" />
        <p className="text-gray-500 font-bold text-sm">Đang tải hóa đơn thanh toán...</p>
      </div>
    );
  }

  const handlePrintCheckoutInvoice = () => {
    const orderData = {
      id: createdOrder?.ID || createdOrder?.id || "ORD-" + Math.floor(Math.random() * 900000 + 100000),
      customerName: fullName,
      customerPhone: phone,
      customerEmail: email,
      address: address,
      paymentMethod: paymentMethod,
      totalAmount: grandTotal,
      createdAt: createdOrder?.CreatedAt || new Date().toISOString(),
      items: orderItems.map(item => ({
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      }))
    };
    printInvoice(orderData);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faf9] font-sans p-6 select-none animate-fade-in text-gray-800">
        <div className="w-16 h-16 bg-[#e8f8f0] text-[#13a855] border border-[#13a855]/30 rounded-full flex items-center justify-center mb-4 shadow-md">
          <CheckCircle className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 text-center">Đặt Hàng Thành Công!</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 leading-relaxed text-center">
          Cảm ơn bạn đã mua sắm tại Mohick Organic Farm. Đơn hàng của bạn đã được tiếp nhận và xử lý.
        </p>

        {/* Invoice Summary Card */}
        <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <span className="font-extrabold text-sm text-gray-800 uppercase">HÓA ĐƠN CHI TIẾT</span>
            <span className="font-mono text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded border">
              #{createdOrder?.ID?.slice(0, 8).toUpperCase() || createdOrder?.id?.slice(0, 8).toUpperCase() || "PENDING"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="block text-[10px] font-black uppercase text-gray-400">Thông tin người mua</span>
              <p className="font-bold text-gray-700">{fullName}</p>
              <p className="text-gray-500 font-medium">{phone}</p>
              <p className="text-gray-500 font-medium break-all">{email}</p>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-black uppercase text-gray-400">Địa chỉ giao nhận</span>
              <p className="text-gray-650 font-semibold leading-relaxed">{address}</p>
              <p className="text-gray-500 font-medium">Thanh toán: <span className="font-bold text-gray-700 uppercase">{paymentMethod}</span></p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <span className="block text-[10px] font-black uppercase text-gray-400 mb-2">Sản phẩm nông sản đặt hàng</span>
            <div className="divide-y divide-gray-50 border border-gray-150 rounded-xl overflow-hidden bg-[#fafdfb]">
              {orderItems.map((item) => (
                <div key={item.id} className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-gray-700">{item.name}</span>
                    <span className="block text-[10px] text-gray-400 font-bold mt-0.5">Số lượng: x{item.quantity} {item.unit}</span>
                  </div>
                  <span className="font-black text-gray-700">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
            <span className="font-black text-gray-800">TỔNG THANH TOÁN:</span>
            <span className="font-black text-base text-[#13a855]">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
          <button
            onClick={handlePrintCheckoutInvoice}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all shadow-md active:scale-97 text-sm cursor-pointer"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>In Hóa Đơn (PDF)</span>
          </button>
          
          <Link
            href="/history"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-750 font-extrabold rounded-xl transition-all shadow-sm active:scale-97 text-sm cursor-pointer text-center"
          >
            <span>Xem lịch sử đơn hàng</span>
          </Link>
          
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-750 font-extrabold rounded-xl transition-all shadow-sm active:scale-97 text-sm cursor-pointer text-center"
          >
            <span>Tiếp tục mua hàng</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8faf9] min-h-screen py-10 font-sans select-none text-gray-800 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-[#13a855] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại Giỏ hàng</span>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-gray-905 tracking-tight">Thanh Toán Đơn Hàng</h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Nhập thông tin giao nhận hàng và lựa chọn phương thức thanh toán an toàn.
          </p>
        </div>

        {/* Layout Grid */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Info & Payment (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Delivery address panel */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#13a855] border-b border-gray-55/60 pb-3">
                <MapPin className="w-5 h-5" />
                <h3 className="text-sm sm:text-base font-extrabold text-gray-850">Thông Tin Giao Nhận Hàng</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Họ và tên người nhận</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setFieldErrors((prev) => { const n = { ...prev }; delete n.fullName; return n; }); }}
                      placeholder="Tên người nhận hàng..."
                      className={`w-full bg-white border rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none transition-all font-medium placeholder-gray-400 ${
                        fieldErrors.fullName ? "border-red-400 bg-red-50/30 focus:border-red-500" : "border-gray-300 focus:border-[#13a855]"
                      }`}
                    />
                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.fullName ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  {fieldErrors.fullName && <p className="text-[11px] text-red-500 font-bold mt-0.5">{fieldErrors.fullName}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Số điện thoại</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setFieldErrors((prev) => { const n = { ...prev }; delete n.phone; return n; }); }}
                      placeholder="Số điện thoại nhận hàng..."
                      className={`w-full bg-white border rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none transition-all font-medium placeholder-gray-400 ${
                        fieldErrors.phone ? "border-red-400 bg-red-50/30 focus:border-red-500" : "border-gray-300 focus:border-[#13a855]"
                      }`}
                    />
                    <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.phone ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  {fieldErrors.phone && <p className="text-[11px] text-red-500 font-bold mt-0.5">{fieldErrors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => { const n = { ...prev }; delete n.email; return n; }); }}
                      placeholder="Email xác nhận hóa đơn..."
                      className={`w-full bg-white border rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none transition-all font-medium placeholder-gray-400 ${
                        fieldErrors.email ? "border-red-400 bg-red-50/30 focus:border-red-500" : "border-gray-300 focus:border-[#13a855]"
                      }`}
                    />
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.email ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  {fieldErrors.email && <p className="text-[11px] text-red-500 font-bold mt-0.5">{fieldErrors.email}</p>}
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Địa chỉ nhận hàng</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); setFieldErrors((prev) => { const n = { ...prev }; delete n.address; return n; }); }}
                      placeholder="Số nhà, tên đường, phường, quận..."
                      className={`w-full bg-white border rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none transition-all font-medium placeholder-gray-400 ${
                        fieldErrors.address ? "border-red-400 bg-red-50/30 focus:border-red-500" : "border-gray-300 focus:border-[#13a855]"
                      }`}
                    />
                    <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.address ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  {fieldErrors.address && <p className="text-[11px] text-red-500 font-bold mt-0.5">{fieldErrors.address}</p>}
                </div>
              </div>

              {/* Delivery notes */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ghi chú giao nhận</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú thêm cho tài xế giao hàng (Ví dụ: Giao giờ hành chính, gọi trước khi đến 10 phút)..."
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] transition-all font-medium placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            {/* Payment methods selector */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#13a855] border-b border-gray-55/60 pb-3">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-sm sm:text-base font-extrabold text-gray-850">Phương Thức Thanh Toán</h3>
              </div>

              {/* Selection Grids */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Method 1: COD */}
                <div 
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === "cod" 
                      ? "border-[#13a855] bg-[#e8f8f0]/40 text-[#13a855] shadow-sm" 
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <Truck className="w-6 h-6 shrink-0" />
                  <div>
                    <span className="block font-black text-xs sm:text-sm">COD</span>
                    <span className="block text-[9px] text-gray-450 mt-0.5 leading-none">Thanh toán khi nhận hàng</span>
                  </div>
                </div>

                {/* Method 2: Bank transfer (QR) */}
                <div 
                  onClick={() => setPaymentMethod("bank")}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === "bank" 
                      ? "border-[#13a855] bg-[#e8f8f0]/40 text-[#13a855] shadow-sm" 
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <QrCode className="w-6 h-6 shrink-0" />
                  <div>
                    <span className="block font-black text-xs sm:text-sm">Chuyển khoản</span>
                    <span className="block text-[9px] text-gray-450 mt-0.5 leading-none">Quét mã QR Ngân hàng</span>
                  </div>
                </div>

                {/* Method 3: MoMo Wallet */}
                <div 
                  onClick={() => setPaymentMethod("momo")}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                    paymentMethod === "momo" 
                      ? "border-[#13a855] bg-[#e8f8f0]/40 text-[#13a855] shadow-sm" 
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <Wallet className="w-6 h-6 shrink-0" />
                  <div>
                    <span className="block font-black text-xs sm:text-sm">Ví MoMo</span>
                    <span className="block text-[9px] text-gray-450 mt-0.5 leading-none">Ví điện tử MoMo</span>
                  </div>
                </div>
              </div>

              {/* Dynamic QR Code bank details */}
              {paymentMethod === "bank" && (
                <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
                  {/* Mock VietQR Code */}
                  <div className="w-36 h-36 bg-white border border-gray-300 rounded-xl p-2.5 flex items-center justify-center shadow-sm relative shrink-0">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VietQR_Simulated_Payment" 
                      alt="VietQR simulated code" 
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm font-semibold text-gray-500">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Thông tin tài khoản nhận:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 leading-normal text-gray-700">
                      <div>Ngân hàng: <span className="font-extrabold">MB Bank (Quân Đội)</span></div>
                      <div>Số tài khoản: <span className="font-extrabold">1234 5678 9999</span></div>
                      <div>Chủ tài khoản: <span className="font-extrabold">PIONE GROUP LTD</span></div>
                      <div>Số tiền: <span className="font-extrabold text-[#13a855]">{formatPrice(grandTotal)}</span></div>
                    </div>
                    <p className="text-[10px] text-amber-600 font-bold leading-normal pt-1.5">
                      * Vui lòng quét mã QR ở bên để điền tự động số tiền và nội dung chuyển khoản nhanh chóng.
                    </p>
                  </div>
                </div>
              )}

              {/* MoMo payment prompt */}
              {paymentMethod === "momo" && (
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl text-xs sm:text-sm font-semibold text-purple-800 leading-relaxed animate-fade-in">
                  Hệ thống sẽ chuyển hướng bạn qua ứng dụng ví điện tử MoMo để hoàn tất thanh toán số tiền <span className="font-extrabold text-purple-950">{formatPrice(grandTotal)}</span> sau khi nhấn nút đặt hàng ở bên.
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Order summary review (4 columns) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Items review card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-gray-900 font-extrabold text-sm sm:text-base border-b border-gray-100 pb-3">Chi Tiết Đơn Hàng</h3>
              
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                {orderItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100 bg-gray-50 flex-shrink-0"
                    />
                    <div className="flex-1 text-xs">
                      <span className="block font-bold text-gray-855 line-clamp-1 leading-tight mb-0.5">{item.name}</span>
                      <span className="block text-gray-400 font-medium">SL: {item.quantity} x {item.unit}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-gray-800 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total checkout calculation card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5.5 sm:p-6 space-y-4">
              <h3 className="text-gray-900 font-extrabold text-base border-b border-gray-100 pb-3">Thành Tiền</h3>

              <div className="space-y-2.5 text-xs sm:text-sm font-bold text-gray-500">
                <div className="flex justify-between">
                  <span>Tiền hàng thực tế</span>
                  <span className="text-gray-800">{formatPrice(tempTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng 2H</span>
                  <span className="text-gray-800">
                    {shippingFee === 0 ? "MIỄN PHÍ" : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3.5 flex justify-between items-baseline">
                <span className="text-sm sm:text-base font-extrabold text-gray-850">Thành tiền</span>
                <span className="text-lg sm:text-xl font-black text-[#13a855]">{formatPrice(grandTotal)}</span>
              </div>

              {/* Security guarantees */}
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold pt-1">
                <ShieldCheck className="w-4 h-4 text-[#13a855] shrink-0" />
                <span>Nông nghiệp sạch. Giao dịch mã hóa an toàn 100%.</span>
              </div>

              {/* Checkout Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#13a855] hover:bg-[#0f8b44] text-white font-extrabold rounded-xl shadow-md active:scale-98 transition-all disabled:opacity-50 text-xs sm:text-sm mt-4 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang khởi tạo đơn hàng...</span>
                  </>
                ) : (
                  <span>Xác nhận đặt hàng</span>
                )}
              </button>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
