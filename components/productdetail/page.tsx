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
  rating: number;
  reviewsCount?: number;
  soldQuantity: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  image: string;
  images?: string[];
  isBestSeller?: boolean;
  unit: string;
}

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
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
                {/* Left: Image Carousel & Thumbnails */}
                <div className="md:col-span-6 flex flex-col gap-4">
                  <div className="w-full bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100 aspect-square group">
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      {product.isBestSeller && (
                        <span className="px-3 py-1.5 text-[9px] font-extrabold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded shadow-md tracking-wider uppercase">
                          Bán chạy nhất
                        </span>
                      )}
                      <span className="w-fit px-2.5 py-1 text-[9px] font-extrabold text-white bg-[#ff424e] rounded shadow-md">
                        -{product.discountPercent}% OFF
                      </span>
                    </div>

                    {/* Favorite button removed to match Shopee UI layout */}

                    {/* Carousel Controls (only if multiple images exist) */}
                    {product.images && product.images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images!.length - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center"
                        >
                          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveImageIndex((prev) => (prev < product.images!.length - 1 ? prev + 1 : 0))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer flex items-center justify-center"
                        >
                          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Dots Indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                          {product.images.map((_, idx) => (
                            <span
                              key={idx}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === activeImageIndex ? "w-4 bg-[#ff424e]" : "w-1.5 bg-gray-300/80"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Active Image */}
                    <img
                      src={product.images && product.images.length > 0 ? product.images[activeImageIndex] : product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>

                  {/* Thumbnail Row */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none justify-center">
                      {product.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                            idx === activeImageIndex ? "border-[#ff424e] scale-102" : "border-gray-250 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                  {/* Social Share & Likes */}
                  <div className="flex items-center justify-center gap-8 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Chia sẻ:</span>
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-pointer">
                          <span className="text-xs font-bold">f</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-blue-400 text-white flex items-center justify-center cursor-pointer">
                          <span className="text-xs font-bold">m</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center cursor-pointer">
                          <span className="text-xs font-bold">p</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`flex items-center gap-2 cursor-pointer transition-colors ${
                        isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`} />
                      <span className="text-sm">Đã thích ({isLiked ? "723" : "722"})</span>
                    </button>
                  </div>
                </div>

                {/* Right: Info Panel */}
                <div className="md:col-span-6 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="inline-block px-2.5 py-1 bg-[#ff424e] text-white rounded-sm text-[10px] font-bold uppercase tracking-wider">
                      Yêu thích+
                    </span>
                    <span className="inline-block px-3 py-1 bg-red-50 text-[#ff424e] border border-red-200 rounded-sm text-xs font-medium uppercase tracking-wider">
                      {product.category}
                    </span>

                    <h1 className="text-xl font-medium text-gray-800 leading-tight">
                      {product.name}
                    </h1>

                    {/* Rating and sales */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center text-red-500 gap-0.5 border-b border-red-500 cursor-pointer">
                        <span className="font-medium">{product.rating}</span>
                        <div className="flex ml-1">
                          <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                          <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                          <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                          <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                          <Star className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                        </div>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1 cursor-pointer border-b border-transparent hover:border-gray-800">
                        <span className="font-medium text-gray-800">{mockReviews.length}</span>
                        <span className="text-gray-500">Đánh giá</span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-800">{product.soldQuantity}</span>
                        <span className="text-gray-500">Đã bán</span>
                      </div>
                    </div>

                    {/* Price - Shopee Style */}
                    <div className="bg-gray-50 flex flex-col rounded-sm overflow-hidden border border-gray-100">
                        <div className="bg-[#ff424e] text-white px-4 py-1.5 text-sm font-medium w-full flex items-center gap-2">
                           <Sparkles className="w-4 h-4 fill-white" />
                           Giá dành riêng cho bạn
                        </div>
                        <div className="p-4 flex flex-wrap items-center gap-3.5">
                            <span className="text-3xl sm:text-4xl font-medium text-[#ff424e]">
                                {formatPrice(product.salePrice)}
                            </span>
                            <span className="text-sm sm:text-base text-gray-400 line-through ml-2">
                                {formatPrice(product.originalPrice)}
                            </span>
                            <span className="bg-red-100 text-[#ff424e] px-1.5 py-0.5 rounded text-xs font-bold uppercase ml-2">
                                Giảm {product.discountPercent}%
                            </span>
                        </div>
                    </div>

                    {/* Shipping and Quantity */}
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3 sm:col-span-2 text-sm text-gray-500">
                                Vận Chuyển
                            </div>
                            <div className="col-span-9 sm:col-span-10 text-sm text-gray-800 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-gray-600" />
                                <span>Miễn phí vận chuyển</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3 sm:col-span-2 text-sm text-gray-500">
                                Số Lượng
                            </div>
                            <div className="col-span-9 sm:col-span-10 flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-sm bg-white overflow-hidden">
                                  <button
                                    onClick={handleDecrease}
                                    className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-300 outline-none"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-12 text-center font-medium text-sm sm:text-base text-gray-800">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={handleIncrease}
                                    className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors border-l border-gray-300 outline-none"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-sm text-gray-500">
                                    Còn {Math.floor(Math.random() * 500) + 50} sản phẩm
                                </span>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="pt-6 flex flex-col sm:flex-row gap-4 w-full">
                    <button className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-50 text-[#ff424e] border border-[#ff424e] font-medium rounded-sm active:scale-97 transition-all cursor-pointer text-base md:w-56">
                      <ShoppingCart className="w-5 h-5" />
                      <span>Thêm Vào Giỏ Hàng</span>
                    </button>
                    <button className="flex items-center justify-center px-6 py-3.5 bg-[#ff424e] hover:bg-red-600 text-white font-medium rounded-sm active:scale-97 transition-all cursor-pointer text-base md:w-40">
                      <span>Mua Ngay</span>
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
