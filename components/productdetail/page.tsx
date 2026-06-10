"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star, ShoppingCart, ArrowLeft, ShieldCheck,
  Truck, RefreshCw, Heart, Plus, Minus,
  Sparkles, Sprout, MessageSquare, ChevronLeft, ChevronRight,
  Droplet, Calendar, Award, CheckCircle, Loader2, MapPin
} from "lucide-react";
import { toast } from "react-toastify";
import { addToCartAPI } from "../cart/service";
import { getCareProcessesAPI } from "@/lib/_api/care_process";
import { productAPI } from "@/lib/_api/product";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

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
    farmId?: string;
  } | null;
  description?: string;
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
  product_variants?: any[];
  farmName?: string;
  farmId?: string;
  FarmID?: string;
}

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const [diaries, setDiaries] = useState<any[]>([]);
  const [isDiariesLoading, setIsDiariesLoading] = useState(false);

  // Parse variants out of product.product_variants
  const rawVariants = (product as any).product_variants || (product as any).ProductVariants || [];
  let parsedVariants: any[] = [];
  if (Array.isArray(rawVariants) && rawVariants.length > 0) {
    parsedVariants = rawVariants.map((v: any) => ({
      name: v.tile || v.title || v.name || "",
      price: Number(v.price),
      stock: Number(v.quantity || v.stock || 0),
      options: Array.isArray(v.options) ? v.options.map((o: any) => ({
        key: o.name || o.key || "",
        value: o.value || ""
      })) : []
    }));
  }

  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add" | "buy" | null>(null);

  const currentPrice = selectedVariantIdx !== null && parsedVariants[selectedVariantIdx]
    ? parsedVariants[selectedVariantIdx].price
    : product.salePrice;

  const [otherProducts, setOtherProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchOtherProducts = async () => {
      try {
        const token = getCookie("access_token");
        const res = await productAPI(token);
        if (res && Array.isArray(res.data)) {
          // exclude current product
          const filtered = res.data.filter((p: any) => p.id !== product.id).slice(0, 4);
          setOtherProducts(filtered);
        }
      } catch (err) {
        console.error("Lỗi khi tải các sản phẩm khác:", err);
      }
    };
    fetchOtherProducts();
  }, [product.id]);

  useEffect(() => {
    const cropLotId = product.cropLot?.id;
    if (!cropLotId) return;

    const fetchDiaries = async () => {
      setIsDiariesLoading(true);
      try {
        const token = getCookie("access_token");
        const res = await getCareProcessesAPI(cropLotId, token);
        if (res && Array.isArray(res.data)) {
          const sorted = [...res.data].sort((a, b) => (a.month || 1) - (b.month || 1));
          setDiaries(sorted);
        }
      } catch (err) {
        console.error("Lỗi khi tải nhật ký canh tác cho sản phẩm:", err);
      } finally {
        setIsDiariesLoading(false);
      }
    };
    fetchDiaries();
  }, [product.cropLot?.id]);



  const handleAddToCart = async () => {
    if (parsedVariants.length > 0 && selectedVariantIdx === null) {
      setPendingAction("add");
      setIsVariantModalOpen(true);
      return;
    }

    const token = getCookie("access_token");

    // 1. Call API
    try {
      await addToCartAPI(product.id, quantity, token);
    } catch (error) {
      console.warn("Backend add to cart failed/missing. Falling back to local storage.", error);
    }

    // 2. Fallback to localStorage
    if (typeof window !== "undefined") {
      const localCart = localStorage.getItem("local_cart");
      let cartItems: any[] = [];
      if (localCart) {
        try {
          cartItems = JSON.parse(localCart);
        } catch (_) { }
      }
      if (!Array.isArray(cartItems)) {
        cartItems = [];
      }

      const activeVarName = selectedVariantIdx !== null && parsedVariants[selectedVariantIdx]
        ? parsedVariants[selectedVariantIdx].name
        : null;

      const existingIndex = cartItems.findIndex((item: any) => {
        if (item.id !== product.id) return false;
        const itemVarName = item.selectedVariant?.name || null;
        return itemVarName === activeVarName;
      });

      if (existingIndex > -1) {
        cartItems[existingIndex].quantity += quantity;
      } else {
        cartItems.push({
          id: product.id,
          name: product.name,
          category: product.category || "Nông sản sạch",
          price: currentPrice,
          originalPrice: product.originalPrice,
          quantity: quantity,
          image: product.image,
          unit: product.unit || "kg",
          selectedVariant: selectedVariantIdx !== null && parsedVariants[selectedVariantIdx]
            ? {
              name: parsedVariants[selectedVariantIdx].name,
              options: parsedVariants[selectedVariantIdx].options
            }
            : null
        });
      }

      localStorage.setItem("local_cart", JSON.stringify(cartItems));
      window.dispatchEvent(new Event("cart-updated"));
    }

    const varNameStr = selectedVariantIdx !== null && parsedVariants[selectedVariantIdx]
      ? ` (${parsedVariants[selectedVariantIdx].name})`
      : "";
    toast.success(`Đã thêm ${quantity} "${product.name}${varNameStr}" vào giỏ hàng thành công!`);
  };

  const handleBuyNow = async () => {
    if (parsedVariants.length > 0 && selectedVariantIdx === null) {
      setPendingAction("buy");
      setIsVariantModalOpen(true);
      return;
    }
    await handleAddToCart();
    router.push("/cart");
  };

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const activeImage = selectedImage || productImages[0] || product.image;

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

  const subtotal = currentPrice * quantity;

  // Dynamic IDs for Prev/Next products transition (assuming max 25 products)
  const prevProductId = product.id > 1 ? product.id - 1 : 25;
  const nextProductId = product.id < 25 ? product.id + 1 : 1;

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#f0f8f2_0%,#f8faf9_320px)] py-6 font-sans text-gray-800 animate-fade-in sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Navigation Breadcrumbs & Dynamic Prev/Next Page Switcher */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            href="/products"
            className="group inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-gray-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-[#0d8d49]"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại cửa hàng</span>
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
        <div className="mb-5 inline-flex max-w-full gap-1.5 rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-gray-200">
          <button
            onClick={() => handleTabChange("info")}
            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-extrabold transition-all sm:text-sm ${activeTab === "info"
              ? "bg-[#0f8f4a] text-white shadow-sm"
              : "text-gray-600 hover:bg-emerald-50 hover:text-[#0f8f4a]"
              }`}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Thông tin mua hàng</span>
          </button>

          <button
            onClick={() => handleTabChange("process")}
            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-extrabold transition-all sm:text-sm ${activeTab === "process"
              ? "bg-[#0f8f4a] text-white shadow-sm"
              : "text-gray-600 hover:bg-emerald-50 hover:text-[#0f8f4a]"
              }`}
          >
            <Sprout className="h-4 w-4 shrink-0" />
            <span>Nguồn gốc canh tác</span>
          </button>
        </div>

        {/* DYNAMIC CONTENT SWITCHER */}
        <div className={`transition-all duration-200 ${isTabTransitioning ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
          }`}>

          {/* TAB 1: ALL PRODUCT INFO & COMMENTS CONSOLIDATED */}
          {activeTab === "info" && (
            <div className="space-y-8 animate-fade-in">
              {/* Main Product Card */}
              <div className="grid grid-cols-1 gap-7 overflow-hidden rounded-3xl bg-white p-4 shadow-lg shadow-emerald-950/5 ring-1 ring-gray-200 sm:p-6 md:grid-cols-12 lg:gap-10 lg:p-8">
                {/* Left: Image & Thumbnails */}
                <div className="flex flex-col gap-4 md:col-span-6">
                  <div className="group relative mx-auto flex aspect-square w-4/5 items-center justify-center overflow-hidden rounded-2xl bg-[#f4f7f4] ring-1 ring-gray-200">
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                      {product.isBestSeller && (
                        <span className="px-3 py-1.5 text-[9px] font-extrabold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded shadow-md tracking-wider uppercase">
                          Được nhiều người chọn
                        </span>
                      )}
                      {product.discountPercent > 0 && (
                        <span className="w-fit px-2.5 py-1 text-[9px] font-extrabold text-white bg-[#13a855] rounded shadow-md">
                          Giảm {product.discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Favorite */}
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`absolute top-4 right-4 z-20 p-2.5 rounded-full border shadow-md active:scale-90 transition-all cursor-pointer ${isLiked
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-white border-gray-200 text-gray-400 hover:text-gray-650"
                        }`}
                    >
                      <Heart className={`w-4.5 h-4.5 ${isLiked ? "fill-red-500" : ""}`} />
                    </button>

                    <img
                      src={activeImage}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>

                  {/* Thumbnail Selector */}
                  {productImages.length > 1 && (
                    <div className="flex flex-wrap items-center gap-3 justify-center">
                      {productImages.map((imgUrl, index) => {
                        const isActive = imgUrl === activeImage;
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(imgUrl)}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 bg-gray-55 transition-all cursor-pointer ${isActive
                              ? "border-[#13a855] shadow-md scale-105"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${product.name} thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3 pt-3 text-sm font-bold text-gray-700 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-xl border border-[#d5f3e0] bg-[#f4fbf7] p-3">
                      <ShieldCheck className="h-6 w-6 shrink-0 text-[#13a855]" />
                      <span>Nguồn gốc rõ ràng</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-[#d5f3e0] bg-[#f4fbf7] p-3">
                      <Truck className="h-6 w-6 shrink-0 text-[#13a855]" />
                      <span>Giao hàng tận nơi</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-[#d5f3e0] bg-[#f4fbf7] p-3">
                      <RefreshCw className="h-6 w-6 shrink-0 text-[#13a855]" />
                      <span>Hỗ trợ đổi trả</span>
                    </div>
                  </div>
                </div>

                {/* Right: Info Panel */}
                <div className="flex flex-col justify-between space-y-6 md:col-span-6">
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                        {product.category}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-800 ring-1 ring-amber-200">
                        <Award className="h-4 w-4" />
                        Nông sản có truy xuất
                      </span>
                    </div>

                    <h1 className="text-3xl font-black leading-tight text-gray-950 sm:text-4xl">
                      {product.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        {product.rating || 5} điểm
                      </span>
                      <span>Đã bán {product.soldQuantity || 0}</span>
                    </div>

                    {/* Price */}
                    <div className="rounded-2xl bg-[#f0faf4] p-4 ring-1 ring-[#cdebd8]">
                      <p className="mb-1 text-sm font-bold text-gray-600">Giá bán tại vườn</p>
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="text-3xl font-black text-[#0d8d49] sm:text-4xl">
                          {formatPrice(currentPrice)}
                          <span className="ml-1 text-base font-bold text-gray-600">/ {product.unit}</span>
                        </span>
                        {product.discountPercent > 0 && selectedVariantIdx === null && (
                          <span className="text-base font-medium text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {(product.farmName || product.cropLot?.name) && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                        <h2 className="mb-3 flex items-center gap-2 text-base font-black text-gray-900">
                          <Sprout className="h-5 w-5 text-[#0d8d49]" />
                          Nguồn gốc sản phẩm
                        </h2>
                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                          {product.farmName && (
                            <div className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                              <div>
                                <span className="block text-gray-500">Nhà vườn</span>
                                <strong className="text-gray-900">{product.farmName}</strong>
                              </div>
                            </div>
                          )}
                          {product.cropLot?.name && (
                            <div className="flex items-start gap-2">
                              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                              <div>
                                <span className="block text-gray-500">Lô canh tác</span>
                                <strong className="text-gray-900">{product.cropLot.name}</strong>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Variant Selector UI */}
                    {parsedVariants.length > 0 && (
                      <div className="space-y-2.5 pt-2">
                        <label className="block text-base font-black text-gray-900">
                          Chọn loại sản phẩm
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {parsedVariants.map((v, idx) => {
                            const isSelected = selectedVariantIdx === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedVariantIdx(idx)}
                                className={`flex min-h-16 min-w-[145px] flex-col gap-1 rounded-xl border px-4 py-3 text-left text-sm shadow-sm transition-all ${isSelected
                                  ? "border-[#13a855] bg-[#e8f8f0] text-[#13a855] scale-102 ring-1 ring-[#13a855]/20 font-extrabold"
                                  : "border-gray-250 bg-white hover:border-gray-350 text-gray-700 hover:bg-gray-50/50 font-semibold"
                                  }`}
                              >
                                <span className="font-extrabold">{v.name}</span>
                                {v.options && v.options.length > 0 && (
                                  <span className="max-w-[170px] truncate text-xs font-semibold text-gray-500">
                                    {v.options.map((o: any) => `${o.key}: ${o.value}`).join(", ")}
                                  </span>
                                )}
                                <span className={`mt-0.5 font-black ${isSelected ? "text-[#13a855]" : "text-emerald-700"}`}>
                                  {formatPrice(v.price)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quantity selector */}
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-base font-black text-gray-900">Số lượng cần mua</span>
                        <span className="text-sm font-bold text-gray-500">Đơn vị: {product.unit}</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
                          <button
                            onClick={handleDecrease}
                            aria-label="Giảm số lượng"
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-emerald-50 hover:text-[#13a855]"
                          >
                            <Minus className="w-4.5 h-4.5" />
                          </button>
                          <span className="w-14 text-center text-xl font-black text-gray-900">
                            {quantity}
                          </span>
                          <button
                            onClick={handleIncrease}
                            aria-label="Tăng số lượng"
                            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-emerald-50 hover:text-[#13a855]"
                          >
                            <Plus className="w-4.5 h-4.5" />
                          </button>
                        </div>
                        <div className="text-right text-sm font-bold text-gray-600">
                          Tạm tính
                          <span className="block text-xl font-black text-[#0d8d49]">{formatPrice(subtotal)}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                    <button
                      onClick={handleAddToCart}
                      className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f8f4a] px-6 text-base font-black text-white shadow-md transition-all hover:bg-[#0b713b] active:scale-[0.98]"
                    >
                      <ShoppingCart className="w-4.5 h-4.5" />
                      <span>Thêm vào giỏ</span>
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex min-h-14 flex-1 items-center justify-center rounded-xl border-2 border-[#0f8f4a] bg-white px-6 text-base font-black text-[#0f8f4a] transition-all hover:bg-emerald-50 active:scale-[0.98]"
                    >
                      <span>Mua ngay</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Related Products Section (Các sản phẩm khác) */}
              {otherProducts.length > 0 && (
                <div className="space-y-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <Sparkles className="h-6 w-6 text-[#13a855]" />
                    <h3 className="text-xl font-black text-gray-900">
                      Nông sản khác từ các nhà vườn
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {otherProducts.map((p) => {
                      const discountPrice = p.discountPercent > 0
                        ? Math.round(p.price * (1 - p.discountPercent / 100))
                        : p.price;
                      const displayPrice = p.salePrice || discountPrice || p.price;
                      return (
                        <Link
                          key={p.id}
                          href={`/products/detail?id=${p.id}`}
                          className="group border border-gray-150 rounded-xl p-3 bg-white hover:shadow-md hover:border-[#13a855]/30 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                              {p.discountPercent > 0 && (
                                <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 text-[8px] font-extrabold text-white bg-red-500 rounded shadow-sm">
                                  -{p.discountPercent}%
                                </span>
                              )}
                              <img
                                src={p.image || "/images/placeholder.jpg"}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                                {p.category || "Nông sản"}
                              </span>
                              <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-[#13a855] transition-colors leading-tight">
                                {p.name}
                              </h4>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-55 mt-2 flex items-center justify-between">
                            <span className="text-xs font-black text-[#13a855]">
                              {formatPrice(displayPrice)}
                            </span>
                            <span className="text-[9px] text-gray-400 font-semibold">
                              /{p.unit || "kg"}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CULTIVATION PROCESS & DETAILED DESCRIPTION */}
          {activeTab === "process" && (
            <div className="space-y-8 animate-fade-in">
              {/* Detailed Description */}
              <div className="space-y-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
                <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
                  <MessageSquare className="mt-0.5 h-6 w-6 shrink-0 text-[#13a855]" />
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Thông tin về nông sản</h3>

                  </div>
                </div>
                {product.description ? (
                  <div
                    className="prose max-w-none text-base leading-7 text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: product.description
                    }}
                  />
                ) : (
                  <p className="text-base italic text-gray-500">Nhà vườn chưa cập nhật mô tả chi tiết cho sản phẩm này.</p>
                )}
              </div>

              {/* Cultivation Diary Section */}
              <div className="space-y-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
                <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <Sprout className="mt-0.5 h-7 w-7 shrink-0 text-[#13a855]" />
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Hành trình từ gieo trồng đến thu hoạch</h3>

                    </div>
                  </div>
                  {product.cropLot?.name && (
                    <span className="w-fit rounded-full bg-amber-50 px-3 py-2 text-sm font-extrabold text-amber-800 ring-1 ring-amber-200">
                      Lô: {product.cropLot.name}
                    </span>
                  )}
                </div>

                {isDiariesLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
                    <span className="text-sm font-bold">Đang tải nhật ký canh tác...</span>
                  </div>
                ) : diaries.length > 0 ? (
                  <div className="relative space-y-4 before:absolute before:bottom-6 before:left-6 before:top-6 before:w-0.5 before:bg-emerald-200">
                    {diaries.map((diary, index) => (
                      <article key={diary.id || index} className="relative flex gap-4 rounded-2xl border border-emerald-100 bg-[#f7fcf8] p-4 transition-shadow hover:shadow-md sm:p-5">
                        <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0f8f4a] text-base font-black text-white shadow-sm ring-4 ring-white">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-black text-gray-900 sm:text-lg">
                            {diary.title || `Giai đoạn ${diary.month}`}
                          </h4>
                          {diary.started_date && (
                            <span className="mt-2 flex items-center gap-2 text-sm font-bold text-amber-700">
                              <Calendar className="h-4 w-4" />
                              {new Date(diary.started_date).toLocaleDateString("vi-VN")}
                              {diary.finished_dat && ` - ${new Date(diary.finished_dat).toLocaleDateString("vi-VN")}`}
                            </span>
                          )}
                          <p className="mt-3 text-base leading-7 text-gray-700">
                            {diary.description}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
                    {/* Step 1 */}
                    <div className="space-y-3 rounded-2xl border border-[#d5f3e0] bg-[#f4fbf7] p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f8f4a] text-sm font-black text-white shadow-sm">
                        01
                      </div>
                      <div className="space-y-1.5">
                        <span className="block text-base font-black text-gray-900">Chuẩn bị đất và giống</span>
                        <p className="text-sm leading-6 text-gray-600">
                          Sử dụng 100% giống thuần chủng chất lượng cao, kháng sâu bệnh tự nhiên. Đất trồng được xử lý sạch mầm bệnh, bón lót phân hữu cơ vi sinh ủ hoai kỹ lưỡng.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-3 rounded-2xl border border-[#d5f3e0] bg-[#f4fbf7] p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f8f4a] text-sm font-black text-white shadow-sm">
                        02
                      </div>
                      <div className="space-y-1.5">
                        <span className="flex items-center gap-2 text-base font-black text-gray-900">
                          <Droplet className="h-5 w-5 text-sky-600" />
                          Chăm sóc và tưới nước
                        </span>
                        <p className="text-sm leading-6 text-gray-600">
                          Nguồn nước tưới được lọc sạch cẩn thận. Sử dụng các chế phẩm sinh học thảo mộc tự nhiên chống côn trùng gây hại. Tuyệt đối không dùng thuốc trừ sâu hóa học.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-3 rounded-2xl border border-[#d5f3e0] bg-[#f4fbf7] p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f8f4a] text-sm font-black text-white shadow-sm">
                        03
                      </div>
                      <div className="space-y-1.5">
                        <span className="block text-base font-black text-gray-900">Thu hoạch và đóng gói</span>
                        <p className="text-sm leading-6 text-gray-600">
                          Sản phẩm được thu hoạch bằng tay vào thời điểm sáng sớm mát mẻ khi đạt độ chín hoàn hảo nhất, sau đó làm sạch bụi bẩn và đóng gói đạt chuẩn an toàn thực phẩm.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Safety certification notice */}
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-900">
                  <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#13a855]" />
                  <span>Thông tin nhật ký giúp người mua hiểu rõ cách sản phẩm được gieo trồng, chăm sóc và thu hoạch.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variant Selection Modal */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border-t sm:border border-gray-250 transform scale-100 transition-all animate-slide-up sm:animate-zoom-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-900">Chọn phân loại sản phẩm</h3>
              <button
                onClick={() => {
                  setIsVariantModalOpen(false);
                  setPendingAction(null);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Product Info */}
              <div className="flex gap-3">
                <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shrink-0">
                  <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-855 line-clamp-2 leading-tight">{product.name}</h4>
                  <p className="text-sm font-black text-[#13a855]">{formatPrice(currentPrice)} / {product.unit}</p>
                </div>
              </div>

              {/* Variants Selector */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">Chọn phân loại:</label>
                <div className="grid grid-cols-1 gap-2">
                  {parsedVariants.map((v, idx) => {
                    const isSelected = selectedVariantIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVariantIdx(idx)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${isSelected
                          ? "border-[#13a855] bg-[#e8f8f0] text-[#13a855] font-extrabold ring-1 ring-[#13a855]/20"
                          : "border-gray-200 bg-white hover:border-gray-300 text-gray-705 hover:bg-gray-55/50 font-semibold"
                          }`}
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <span className="block text-xs font-bold truncate">{v.name}</span>
                          {v.options && v.options.length > 0 && (
                            <span className="block text-[9px] text-gray-400 truncate">
                              {v.options.map((o: any) => `${o.key}: ${o.value}`).join(", ")}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-black shrink-0 ${isSelected ? "text-[#13a855]" : "text-emerald-600"}`}>
                          {formatPrice(v.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg p-0.5 bg-white">
                  <button
                    onClick={handleDecrease}
                    className="p-1.5 text-gray-500 hover:text-[#13a855] rounded-md transition-colors cursor-pointer active:scale-95"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-extrabold text-xs text-gray-800">{quantity}</span>
                  <button
                    onClick={handleIncrease}
                    className="p-1.5 text-gray-500 hover:text-[#13a855] rounded-md transition-colors cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-150 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setIsVariantModalOpen(false);
                  setPendingAction(null);
                }}
                className="flex-1 py-3 border border-gray-300 hover:bg-gray-100 text-gray-650 font-bold rounded-xl active:scale-97 transition-all cursor-pointer text-xs text-center"
              >
                Hủy bỏ
              </button>
              <button
                onClick={async () => {
                  if (selectedVariantIdx === null) {
                    toast.error("Vui lòng chọn một phân loại!");
                    return;
                  }
                  setIsVariantModalOpen(false);
                  const act = pendingAction;
                  setPendingAction(null);
                  if (act === "add") {
                    await handleAddToCart();
                  } else if (act === "buy") {
                    await handleBuyNow();
                  }
                }}
                className="flex-1 py-3 bg-[#13a855] hover:bg-[#0f8b44] text-white font-extrabold rounded-xl active:scale-97 shadow-md transition-all cursor-pointer text-xs text-center"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
