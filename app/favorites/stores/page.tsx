"use client";

import React from "react";
import Link from "next/link";
import { Heart, Store, MapPin, Star, ArrowRight, ShieldCheck } from "lucide-react";

export default function FavoriteStoresPage() {
  const favoriteStores = [
    {
      id: "F001",
      name: "HTX Nông Nghiệp Sóc Trăng",
      avatar: "https://images.unsplash.com/photo-1595856353141-fe2b67f401f5?auto=format&fit=crop&q=80&w=200",
      cover: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800",
      location: "Sóc Trăng, Việt Nam",
      specialty: "Gạo đặc sản, lúa nước",
      rating: 4.9,
      followers: 12500,
      badge: "VietGAP"
    },
    {
      id: "F002",
      name: "Vườn Sinh Thái Cô Năm",
      avatar: "https://images.unsplash.com/photo-1595981267035-7b04d84b51ad?auto=format&fit=crop&q=80&w=200",
      cover: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800",
      location: "Tiền Giang, Việt Nam",
      specialty: "Trái cây miệt vườn, rau sạch",
      rating: 4.8,
      followers: 8400,
      badge: "GlobalGAP"
    }
  ];

  return (
    <main className="min-h-screen bg-[#f7fbf8] pt-8 pb-20 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-sm">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Cửa hàng yêu thích</h1>
            <p className="text-sm font-semibold text-gray-500 mt-1">Các nhà vườn, hợp tác xã bạn đang theo dõi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteStores.map((store) => (
            <div key={store.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl">
              <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <img src={store.cover} alt={store.name} className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-3 left-3 z-20">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#13a855] px-2 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-sm">
                    <ShieldCheck className="h-3 w-3" />
                    {store.badge}
                  </span>
                </div>
                <button className="absolute top-3 right-3 z-20 cursor-pointer rounded-full bg-white/20 p-2 text-red-500 backdrop-blur-md transition-all hover:bg-white/90 shadow-sm">
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </div>
              <div className="relative flex flex-1 flex-col px-5 pt-10 pb-5">
                <div className="absolute -top-8 left-5 z-20 h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-sm bg-white">
                  <img src={store.avatar} alt={store.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <Link href={`/farm/detail/?id=${store.id}`} className="truncate text-base font-extrabold text-gray-800 hover:text-[#13a855] transition-colors">
                    {store.name}
                  </Link>
                  <div className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-500 border border-amber-100">
                    <Star className="h-3 w-3 fill-current" />
                    {store.rating}
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span className="truncate">{store.location}</span>
                </div>
                <p className="mt-3 text-xs font-semibold text-gray-600 line-clamp-2">
                  {store.specialty}
                </p>
                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{store.followers} người theo dõi</span>
                  <Link href={`/farm/detail/?id=${store.id}`} className="text-xs font-bold text-[#13a855] hover:text-[#0f8b44] flex items-center gap-1 transition-colors">
                    Ghé thăm <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
