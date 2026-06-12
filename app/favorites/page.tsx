"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Store, Package, MapPin, Star, ArrowRight, ShieldCheck, ShoppingCart } from "lucide-react";
import { listFavoritesAPI, toggleFavoriteAPI } from "@/lib/_api/favorites";
import { listFollowsAPI, toggleFollowAPI } from "@/lib/_api/follows";

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<"products" | "stores">("products");
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [favoriteStores, setFavoriteStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await listFavoritesAPI();
      if (res && res.data) {
        setFavoriteProducts(res.data);
      }
    } catch (error) {
      console.error("Error fetching favorite products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await listFollowsAPI();
      if (res && res.data) {
        setFavoriteStores(res.data);
      }
    } catch (error) {
      console.error("Error fetching followed stores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    } else {
      fetchStores();
    }
  }, [activeTab]);

  const handleUnlikeProduct = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFavoriteAPI(id);
      // Remove locally to update UI immediately
      setFavoriteProducts((prev) => prev.filter((p) => p.ID !== id));
    } catch (error) {
      console.error("Error unlike product:", error);
    }
  };

  const handleUnfollowStore = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFollowAPI(id);
      // Remove locally to update UI immediately
      setFavoriteStores((prev) => prev.filter((s) => s.ID !== id));
    } catch (error) {
      console.error("Error unfollow store:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price || 0) + " đ";
  };

  return (
    <main className="min-h-screen bg-[#f7fbf8] pt-8 pb-20 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Mục yêu thích</h1>
            <p className="text-sm font-semibold text-gray-500 mt-1">Lưu trữ sản phẩm và nhà vườn bạn quan tâm</p>
          </div>
        </div>

        {/* Custom Navigation Tabs */}
        <div className="mb-8 flex space-x-1 rounded-2xl bg-white p-1.5 shadow-sm sm:w-fit border border-gray-100">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 px-6 text-sm font-bold transition-all sm:flex-none cursor-pointer ${
              activeTab === "products"
                ? "bg-[#13a855] text-white shadow-md shadow-emerald-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            <Package className="h-4.5 w-4.5" />
            Sản phẩm yêu thích
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 px-6 text-sm font-bold transition-all sm:flex-none cursor-pointer ${
              activeTab === "stores"
                ? "bg-[#13a855] text-white shadow-md shadow-emerald-200"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            <Store className="h-4.5 w-4.5" />
            Cửa hàng yêu thích
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#13a855] border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Tab Content: Products */}
            {activeTab === "products" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favoriteProducts.length === 0 && (
                  <div className="col-span-full py-12 text-center text-sm font-bold text-gray-500">Chưa có sản phẩm nào được lưu.</div>
                )}
                {favoriteProducts.map((product) => {
                  const imageSrc = product.ImageProducts?.[0]?.ImageURL || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600";
                  const farmName = product.Farm?.FarmName || product.Category?.Name || "Gian hàng nông sản";
                  const rating = product.Rating || 5.0;
                  const sold = product.Sold || 0;
                  const inStock = product.Quantity !== undefined ? product.Quantity > 0 : true;

                  return (
                    <div key={product.ID} className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative">
                      
                      <button 
                        onClick={(e) => handleUnlikeProduct(product.ID, e)}
                        className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm cursor-pointer"
                        title="Bỏ yêu thích"
                      >
                        <Heart className="h-4.5 w-4.5 fill-current" />
                      </button>

                      <Link href={`/products/detail/?id=${product.ID}`} className="block relative h-48 overflow-hidden bg-gray-50">
                        <img src={imageSrc} alt={product.Name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {!inStock && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-lg shadow-sm">Hết hàng</span>
                          </div>
                        )}
                      </Link>

                      <div className="p-4 flex flex-col flex-1">
                        <span className="text-[10px] font-bold text-[#13a855] uppercase tracking-wider mb-1 block line-clamp-1">
                          {farmName}
                        </span>
                        <Link href={`/products/detail/?id=${product.ID}`} className="text-sm font-extrabold text-gray-800 hover:text-[#13a855] transition-colors line-clamp-2 mb-2 leading-snug">
                          {product.Name}
                        </Link>
                        
                        <div className="flex items-center gap-2 mb-4 mt-auto">
                          <div className="flex items-center text-amber-400 bg-amber-50 px-1.5 py-0.5 rounded text-xs font-bold border border-amber-100/50">
                            <Star className="h-3 w-3 fill-current mr-1" />
                            {rating}
                          </div>
                          <span className="text-xs text-gray-400 font-semibold">Đã bán {sold}</span>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                          <span className="text-base font-black text-[#13a855]">{formatPrice(product.Price)}</span>
                          <button 
                            disabled={!inStock}
                            className="p-2 rounded-xl bg-[#e8f8f0] text-[#13a855] hover:bg-[#13a855] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-[#e8f8f0] disabled:hover:text-[#13a855] cursor-pointer"
                          >
                            <ShoppingCart className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab Content: Stores */}
            {activeTab === "stores" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteStores.length === 0 && (
                  <div className="col-span-full py-12 text-center text-sm font-bold text-gray-500">Chưa có nhà vườn nào được theo dõi.</div>
                )}
                {favoriteStores.map((store) => {
                  const cover = store.ImageURL || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800";
                  const avatar = store.ImageURL || "https://images.unsplash.com/photo-1595856353141-fe2b67f401f5?auto=format&fit=crop&q=80&w=200";
                  const rating = store.Rating || 5.0;
                  const followers = store.Followers || 0;
                  const badge = store.Badge || "Nhà vườn";
                  const specialty = store.Specialty || "Nông sản sạch";

                  return (
                    <div key={store.ID} className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
                      
                      <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <img src={cover} alt={store.FarmName} className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-105" />
                        
                        <div className="absolute top-3 left-3 z-20">
                          <span className="inline-flex items-center gap-1 rounded-md bg-[#13a855] px-2 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-sm">
                            <ShieldCheck className="h-3 w-3" />
                            {badge}
                          </span>
                        </div>

                        <button 
                          onClick={(e) => handleUnfollowStore(store.ID, e)}
                          className="absolute top-3 right-3 z-20 cursor-pointer rounded-full bg-white/20 p-2 text-red-500 backdrop-blur-md transition-all hover:bg-white/90 shadow-sm"
                          title="Bỏ theo dõi"
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>
                      </div>

                      <div className="relative flex flex-1 flex-col px-5 pt-10 pb-5">
                        <div className="absolute -top-8 left-5 z-20 h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-sm bg-white">
                          <img src={avatar} alt={store.FarmName} className="h-full w-full object-cover" />
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <Link href={`/farm/detail/?id=${store.ID}`} className="truncate text-base font-extrabold text-gray-800 hover:text-[#13a855] transition-colors">
                            {store.FarmName}
                          </Link>
                          <div className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-500 border border-amber-100">
                            <Star className="h-3 w-3 fill-current" />
                            {rating}
                          </div>
                        </div>

                        <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span className="truncate">{store.Address}</span>
                        </div>

                        <p className="mt-3 text-xs font-semibold text-gray-600 line-clamp-2">
                          {specialty}
                        </p>

                        <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400">{followers} người theo dõi</span>
                          <Link href={`/farm/detail/?id=${store.ID}`} className="text-xs font-bold text-[#13a855] hover:text-[#0f8b44] flex items-center gap-1 transition-colors">
                            Ghé thăm <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
