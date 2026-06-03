"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, CreditCard, ShieldCheck, MapPin, 
  Phone, User, Mail, Truck, Loader2, CheckCircle,
  QrCode, Wallet 
} from "lucide-react";
import { productAPI } from "@/lib/_api/product";

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Fetch real products from dynamic database to initialize checkout items
  useEffect(() => {
    const fetchCheckoutProducts = async () => {
      try {
        const res = await productAPI();
        const data = Array.isArray(res.data) ? res.data : [];
        // Map first 3 products from database as simulated checkout items
        const initialOrder = data.slice(0, 3).map((item: any, idx: number) => ({
          id: item.id,
          name: item.name,
          price: item.salePrice,
          quantity: idx === 0 ? 2 : idx === 1 ? 1 : 3, // Mock quantities: 2, 1, 3
          image: item.image,
          unit: item.unit
        }));
        setOrderItems(initialOrder);
      } catch (error) {
        console.error("Error loading products for checkout:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCheckoutProducts();
  }, []);

  // Order Calculations
  const tempTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = tempTotal >= 300000 || tempTotal === 0 ? 0 : 30000;
  const promoDiscount = tempTotal * 0.1; // Default 10% code applied
  const grandTotal = tempTotal + shippingFee - promoDiscount;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert("Vui lòng điền đầy đủ các thông tin giao nhận hàng!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2200);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faf9] font-sans p-6 text-center select-none animate-fade-in text-gray-800">
        <Loader2 className="w-10 h-10 animate-spin text-[#13a855] mb-4" />
        <p className="text-gray-500 font-bold text-sm">Đang tải hóa đơn thanh toán...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faf9] font-sans p-6 text-center select-none animate-fade-in text-gray-800">
        <div className="w-20 h-20 bg-[#e8f8f0] text-[#13a855] border-2 border-[#13a855]/30 rounded-full flex items-center justify-center mb-6 shadow-md">
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Đơn Hàng Đã Được Xác Nhận!</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
          Đơn hàng của bạn đang được đóng gói và vận chuyển siêu tốc. Chúng tôi sẽ liên hệ với số điện thoại <span className="text-[#13a855] font-extrabold">{phone}</span> trước khi giao hàng 2H.
        </p>
        <Link
          href="/products"
          className="flex items-center gap-2 px-6 py-3.5 bg-[#13a855] text-white font-extrabold rounded-xl hover:bg-[#0f8b44] transition-all shadow-md active:scale-97 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang sản phẩm</span>
        </Link>
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
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tên người nhận hàng..."
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] transition-all font-medium placeholder-gray-400"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Số điện thoại</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Số điện thoại nhận hàng..."
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] transition-all font-medium placeholder-gray-400"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email xác nhận hóa đơn..."
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] transition-all font-medium placeholder-gray-400"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Địa chỉ nhận hàng</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, phường, quận..."
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] transition-all font-medium placeholder-gray-400"
                    />
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
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
                <div className="flex justify-between text-red-500">
                  <span>Chiết khấu mã quà (-10%)</span>
                  <span>-{formatPrice(promoDiscount)}</span>
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
