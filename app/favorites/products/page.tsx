"use client";

import React from "react";
import Link from "next/link";
import { Heart, Star, ShoppingCart } from "lucide-react";

export default function FavoriteProductsPage() {
  const favoriteProducts = [
    {
      id: "c7082b8e-3239-4893-918c-dad30bb82f54",
      name: "Gạo ST25 Sóc Trăng Thượng Hạng",
      price: 150000,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
      farmName: "HTX Nông Nghiệp Sóc Trăng",
      rating: 4.9,
      sold: 1250,
      inStock: true
    },
    {
      id: "P002",
      name: "Sầu Riêng Ri6 Hạt Lép Bến Tre",
      price: 240000,
      image: "https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?auto=format&fit=crop&q=80&w=600",
      farmName: "Vườn Sầu Riêng Chú Ba",
      rating: 4.8,
      sold: 840,
      inStock: true
    },
    {
      id: "P003",
      name: "Dâu Tây Đà Lạt Mộc Châu",
      price: 180000,
      image: "https://images.unsplash.com/photo-1518635017498-87f514b751ba?auto=format&fit=crop&q=80&w=600",
      farmName: "Đà Lạt Farm",
      rating: 4.7,
      sold: 520,
      inStock: false
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " đ";
  };

  return (
    <main className="min-h-screen bg-[#f7fbf8] pt-8 pb-20 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Sản phẩm yêu thích</h1>
            <p className="text-sm font-semibold text-gray-500 mt-1">Các sản phẩm nông sản bạn đã lưu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
            <div key={product.id} className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative">
              <button className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm cursor-pointer">
                <Heart className="h-4.5 w-4.5 fill-current" />
              </button>
              <Link href={`/products/detail/?id=${product.id}`} className="block relative h-48 overflow-hidden bg-gray-50">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-lg shadow-sm">Hết hàng</span>
                  </div>
                )}
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-bold text-[#13a855] uppercase tracking-wider mb-1 block line-clamp-1">
                  {product.farmName}
                </span>
                <Link href={`/products/detail/?id=${product.id}`} className="text-sm font-extrabold text-gray-800 hover:text-[#13a855] transition-colors line-clamp-2 mb-2 leading-snug">
                  {product.name}
                </Link>
                <div className="flex items-center gap-2 mb-4 mt-auto">
                  <div className="flex items-center text-amber-400 bg-amber-50 px-1.5 py-0.5 rounded text-xs font-bold border border-amber-100/50">
                    <Star className="h-3 w-3 fill-current mr-1" />
                    {product.rating}
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">Đã bán {product.sold}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <span className="text-base font-black text-[#13a855]">{formatPrice(product.price)}</span>
                  <button 
                    disabled={!product.inStock}
                    className="p-2 rounded-xl bg-[#e8f8f0] text-[#13a855] hover:bg-[#13a855] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-[#e8f8f0] disabled:hover:text-[#13a855] cursor-pointer"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
