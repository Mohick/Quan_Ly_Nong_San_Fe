"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Star, ShoppingCart, ArrowLeft, ShieldCheck, 
  Truck, RefreshCw, Heart, Plus, Minus, 
  Sparkles, Sprout, MessageSquare, ChevronLeft, ChevronRight,
  Droplet, Calendar, Award
} from "lucide-react";

export interface Product {
  id: number;
  name: string;
  category: string;
  cropLotId?: string | null;
  cropLot?: {
    id: string;
    name: string;
    area: number;
    areaUnit: string;
    startDate: string;
    expectedHarvestDate: string;
    status: string;
  } | null;
  rating: number;
  reviewsCount?: number;
  soldQuantity: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  image: string;
  isBestSeller?: boolean;
  unit: string;
}

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  
  // 2 main tabs: info (All product info + reviews), process (Planting/Farming process)
  const [activeTab, setActiveTab] = useState<"info" | "process">("info");
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleTabChange = (tab: "info" | "process") => {
    if (tab === activeTab) return;
    setIsTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTabTransitioning(false);
    }, 150);
  };

  const subtotal = product.salePrice * quantity;

  // Mock comments
  const mockReviews = [
    {
      id: 1,
      author: "Nguyễn Văn Minh",
      rating: 5,
      date: "25/05/2026",
      content: `Nông sản cực kỳ tươi ngon! Đóng gói cẩn thận và giao hàng rất nhanh chóng đúng cam kết 2 giờ. Sẽ tiếp tục ủng hộ cửa hàng lâu dài!`,
    },
    {
      id: 2,
      author: "Trần Thị Hồng",
      rating: 5,
      date: "18/05/2026",
      content: `Sản phẩm sạch đúng chuẩn hữu cơ VietGAP, ăn ngọt thanh tự nhiên và rất an tâm cho sức khỏe gia đình mình. Rất đáng đồng tiền bát gạo!`,
    }
  ];

  // Dynamic IDs for Prev/Next products transition (assuming max 25 products)
  const prevProductId = product.id > 1 ? product.id - 1 : 25;
  const nextProductId = product.id < 25 ? product.id + 1 : 1;

  return (
    <div className="w-full bg-[#f8faf9] min-h-screen py-10 font-sans select-none animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumbs & Dynamic Prev/Next Page Switcher */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-150/60">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-[#13a855] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại Cửa hàng Nông sản</span>
          </Link>
          
          {/* Dynamic Prev/Next Navigation Switcher */}
          <div className="flex items-center gap-2.5 font-sans">
            <Link
              href={`/products/detail?id=${prevProductId}`}
              className="flex items-center gap-1.5 px-3 py-1.8 bg-white hover:bg-[#e8f8f0] text-gray-500 hover:text-[#13a855] border border-gray-250 hover:border-[#13a855]/40 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Sản phẩm trước đó"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trước đó</span>
            </Link>
            <span className="text-xs text-gray-300 font-bold hidden sm:inline">|</span>
            <Link
              href={`/products/detail?id=${nextProductId}`}
              className="flex items-center gap-1.5 px-3 py-1.8 bg-white hover:bg-[#e8f8f0] text-gray-500 hover:text-[#13a855] border border-gray-250 hover:border-[#13a855]/40 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Sản phẩm tiếp theo"
            >
              <span className="hidden sm:inline">Tiếp theo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2 MAIN TABS HEADER PLACED AT THE TOP OF THE PAGE */}
        <div className="flex border-b border-gray-200 gap-4 sm:gap-8 text-xs sm:text-sm font-bold pb-3.5 mb-6 relative">
          <button
            onClick={() => handleTabChange("info")}
            className={`flex items-center gap-2 transition-all pb-3 -mb-[16px] z-10 cursor-pointer relative ${
              activeTab === "info" 
                ? "text-[#13a855] border-b-3 border-[#13a855]" 
                : "text-gray-400 hover:text-gray-650"
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span>Thông tin & Bình luận</span>
          </button>
          
          <button
            onClick={() => handleTabChange("process")}
            className={`flex items-center gap-2 transition-all pb-3 -mb-[16px] z-10 cursor-pointer relative ${
              activeTab === "process" 
                ? "text-[#13a855] border-b-3 border-[#13a855]" 
                : "text-gray-400 hover:text-gray-650"
            }`}
          >
            <Sprout className="w-4.5 h-4.5" />
            <span>Quy trình trồng trọt</span>
          </button>
        </div>

        {/* DYNAMIC CONTENT SWITCHER */}
        <div className={`transition-all duration-200 ${
          isTabTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
        }`}>
          
          {/* TAB 1: ALL PRODUCT INFO & COMMENTS CONSOLIDATED */}
          {activeTab === "info" && (
            <div className="space-y-8 animate-fade-in">
              {/* Main Product Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
                {/* Left: Image */}
                <div className="md:col-span-6 flex flex-col items-center justify-center bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 aspect-square group">
                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {product.isBestSeller && (
                      <span className="px-3 py-1.5 text-[9px] font-extrabold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded shadow-md tracking-wider uppercase">
                        Bán chạy nhất
                      </span>
                    )}
                    <span className="w-fit px-2.5 py-1 text-[9px] font-extrabold text-white bg-[#13a855] rounded shadow-md">
                      -{product.discountPercent}% OFF
                    </span>
                  </div>

                  {/* Favorite */}
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`absolute top-4 right-4 z-20 p-2.5 rounded-full border shadow-md active:scale-90 transition-all cursor-pointer ${
                      isLiked 
                        ? "bg-red-50 border-red-200 text-red-500" 
                        : "bg-white border-gray-200 text-gray-400 hover:text-gray-650"
                    }`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${isLiked ? "fill-red-500" : ""}`} />
                  </button>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
                  />
                </div>

                {/* Right: Info Panel */}
                <div className="md:col-span-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-[#e8f8f0] text-[#13a855] border border-[#cbeed7] rounded-md text-xs font-bold uppercase tracking-wider">
                        {product.category}
                      </span>
                      {product.cropLot?.name && (
                        <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold uppercase tracking-wider">
                          Mã Lô: {product.cropLot.name}
                        </span>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-905 leading-tight">
                      {product.name}
                    </h1>

                    {/* Rating and sales */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="flex items-center text-amber-500 gap-0.5 font-bold">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{product.rating}</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 font-bold">{mockReviews.length} Đánh giá</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 font-bold">Đã bán {product.soldQuantity}</span>
                    </div>

                    {/* Price */}
                    <div className="py-3 border-y border-gray-100 flex flex-wrap items-baseline gap-3.5">
                      <span className="text-2xl sm:text-3xl font-black text-[#13a855]">
                        {formatPrice(product.salePrice)}
                        <span className="text-xs sm:text-sm text-gray-400 font-normal"> / {product.unit}</span>
                      </span>
                      <span className="text-sm sm:text-base text-gray-400 line-through font-medium">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>

                    {/* Quantity selector */}
                    <div className="flex items-center flex-wrap gap-4 py-2">
                      <div className="flex items-center border border-gray-300 rounded-lg p-1 bg-white shadow-sm">
                        <button
                          onClick={handleDecrease}
                          className="p-2 text-gray-500 hover:text-[#13a855] hover:bg-[#e8f8f0] rounded-md transition-colors cursor-pointer active:scale-95"
                        >
                          <Minus className="w-4.5 h-4.5" />
                        </button>
                        <span className="w-12 text-center font-extrabold text-sm sm:text-base text-gray-800">
                          {quantity}
                        </span>
                        <button
                          onClick={handleIncrease}
                          className="p-2 text-gray-500 hover:text-[#13a855] hover:bg-[#e8f8f0] rounded-md transition-colors cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4.5 h-4.5" />
                        </button>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 font-bold">
                        Tạm tính: <span className="text-base font-extrabold text-gray-800">{formatPrice(subtotal)}</span>
                      </div>
                    </div>

                    {/* Quick features */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px] text-gray-650 font-bold">
                      <div className="flex items-center gap-2 p-2 bg-[#f4fbf7] border border-[#d5f3e0] rounded-lg">
                        <ShieldCheck className="w-4 h-4 text-[#13a855] shrink-0" />
                        <span>100% Hữu cơ sạch</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-[#f4fbf7] border border-[#d5f3e0] rounded-lg">
                        <Truck className="w-4 h-4 text-[#13a855] shrink-0" />
                        <span>Giao hàng nhanh 2H</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-[#f4fbf7] border border-[#d5f3e0] rounded-lg">
                        <RefreshCw className="w-4 h-4 text-[#13a855] shrink-0" />
                        <span>Đổi trả thuận tiện</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#13a855] hover:bg-[#0f8b44] text-white font-extrabold rounded-xl active:scale-97 shadow-md transition-all cursor-pointer text-sm">
                      <ShoppingCart className="w-4.5 h-4.5" />
                      <span>Thêm vào giỏ hàng</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center px-6 py-3.5 bg-white hover:bg-gray-50 text-[#13a855] hover:text-[#0f8b44] border-2 border-[#13a855] font-extrabold rounded-xl active:scale-97 transition-all cursor-pointer text-sm">
                      <span>Mua ngay</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Detailed Text Description */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4 text-xs sm:text-sm leading-relaxed text-gray-600">
                <h4 className="font-extrabold text-gray-800 text-sm sm:text-base border-b border-gray-100 pb-2.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#13a855]" />
                  <span>Mô tả chi tiết sản phẩm & Giá trị dinh dưỡng</span>
                </h4>
                <p>
                  Sản phẩm <strong>{product.name}</strong> thuộc nhóm danh mục <strong>{product.category}</strong>. 
                  Chúng tôi hợp tác trực tiếp với các hợp tác xã sản xuất nông sản uy tín hàng đầu trên cả nước, áp dụng quy trình kiểm định chất lượng nghiêm ngặt từ khâu thu hoạch đến vận chuyển tiêu thụ.
                </p>
                <p>
                  Sản phẩm được bảo quản ở môi trường nhiệt độ lạnh tiêu chuẩn lý tưởng, giữ trọn vẹn giá trị dinh dưỡng, vitamin tự nhiên cùng hương vị thơm ngon đặc trưng ban đầu khi tới tay người tiêu dùng.
                </p>
              </div>

              {/* Product Reviews & Comments List Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#13a855]" />
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-800">
                      Bình luận & Phản hồi thực tế ({mockReviews.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 bg-[#e8f8f0] px-2.5 py-1 rounded-md border border-[#cbeed7] text-[#13a855] font-extrabold text-xs">
                    <Star className="w-3.5 h-3.5 fill-[#13a855] text-[#13a855]" />
                    <span>{product.rating} / 5.0</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="p-4.5 bg-[#fafbfb] border border-gray-100 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-gray-850 text-xs sm:text-sm">{review.author}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{review.date}</span>
                      </div>
                      <div className="flex items-center text-amber-500 gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGRI PLANTING & FARMING STEP-BY-STEP PROCESS */}
          {activeTab === "process" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 md:p-10 space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <Sprout className="w-6 h-6 text-[#13a855]" />
                <h3 className="text-base sm:text-lg font-black text-gray-900">Quy Trình Trồng Trọt & Thu Hoạch Sạch</h3>
              </div>
              
              <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-gray-655">
                {product.cropLot && (
                  <div className="bg-[#f0f9f4] border border-[#d1f2e0] rounded-xl p-5 space-y-3">
                    <h4 className="font-extrabold text-[#0a5c36] text-xs sm:text-sm uppercase flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#13a855]" />
                      <span>Thông tin Lô đất nuôi trồng</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-gray-700">
                      <div>
                        <span className="text-gray-400 block font-normal text-[10px]">Tên lô sản xuất</span>
                        <span className="text-[#13a855] font-extrabold text-sm">{product.cropLot.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-normal text-[10px]">Diện tích gieo trồng</span>
                        <span className="text-gray-850 font-bold">{product.cropLot.area} {product.cropLot.areaUnit}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-normal text-[10px]">Ngày xuống giống</span>
                        <span className="text-gray-850 font-bold">
                          {product.cropLot.startDate ? new Date(product.cropLot.startDate).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-normal text-[10px]">Thu hoạch dự kiến</span>
                        <span className="text-gray-850 font-bold">
                          {product.cropLot.expectedHarvestDate ? new Date(product.cropLot.expectedHarvestDate).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="font-bold text-gray-800">
                  Từng sản phẩm <span className="text-[#13a855] font-extrabold">"{product.name}"</span> được nuôi trồng bền vững theo quy trình hữu cơ 3 giai đoạn nghiêm ngặt, đảm bảo độ sạch và độ ngon lành tự nhiên tuyệt đối:
                </p>
                
                {/* Step-by-Step Pipeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  {/* Step 1 */}
                  <div className="p-5.5 bg-[#f4fbf7] border border-[#d5f3e0] rounded-xl space-y-3 relative group hover:shadow-md transition-all duration-250">
                    <div className="w-10 h-10 bg-white border border-[#cbeed7] rounded-full flex items-center justify-center text-[#13a855] font-black text-sm shadow-sm">
                      01
                    </div>
                    <div className="space-y-1.5">
                      <span className="block font-black text-gray-850 text-sm uppercase">Chuẩn bị Đất & Giống</span>
                      <p className="text-xs text-gray-500 leading-normal">
                        Sử dụng 100% giống thuần chủng chất lượng cao, kháng sâu bệnh tự nhiên. Đất trồng được xử lý sạch mầm bệnh, bón lót phân hữu cơ vi sinh ủ hoai kỹ lưỡng.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-5.5 bg-[#f4fbf7] border border-[#d5f3e0] rounded-xl space-y-3 relative group hover:shadow-md transition-all duration-250">
                    <div className="w-10 h-10 bg-white border border-[#cbeed7] rounded-full flex items-center justify-center text-[#13a855] font-black text-sm shadow-sm">
                      02
                    </div>
                    <div className="space-y-1.5">
                      <span className="block font-black text-gray-850 text-sm uppercase">Chăm sóc & Tưới nước</span>
                      <p className="text-xs text-gray-500 leading-normal">
                        Nguồn nước tưới được lọc sạch cẩn thận. Sử dụng các chế phẩm sinh học thảo mộc tự nhiên chống côn trùng gây hại. Tuyệt đối không dùng thuốc trừ sâu hóa học.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-5.5 bg-[#f4fbf7] border border-[#d5f3e0] rounded-xl space-y-3 relative group hover:shadow-md transition-all duration-250">
                    <div className="w-10 h-10 bg-white border border-[#cbeed7] rounded-full flex items-center justify-center text-[#13a855] font-black text-sm shadow-sm">
                      03
                    </div>
                    <div className="space-y-1.5">
                      <span className="block font-black text-gray-850 text-sm uppercase">Thu hoạch & Đóng gói</span>
                      <p className="text-xs text-gray-500 leading-normal">
                        Sản phẩm được thu hoạch bằng tay vào thời điểm sáng sớm mát mẻ khi đạt độ chín hoàn hảo nhất, sau đó làm sạch bụi bẩn và đóng gói đạt chuẩn an toàn thực phẩm.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Safety certification notice */}
                <div className="pt-4 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400 font-bold">
                  <ShieldCheck className="w-5 h-5 text-[#13a855]" />
                  <span>Quy trình nông nghiệp bền vững góp phần bảo vệ tài nguyên đất và nguồn nước tự nhiên tại địa phương.</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
