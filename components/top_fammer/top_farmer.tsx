"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Heart,
  Users,
  Calendar,
} from "lucide-react";
import { topFarmerAPI } from "@/lib/_api/top_farmer";
import { toggleFollowAPI } from "@/lib/_api/follows";

const TopFarmer = () => {
  const [topFarmers, setTopFarmers] = useState<any[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [likedFarmers, setLikedFarmers] = useState<Record<number, boolean>>({});

  const handleLike = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleFollowAPI(id.toString());
      setLikedFarmers((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    } catch (error) {
      console.error("Error toggle follow:", error);
    }
  };
  useEffect(() => {
    const fetchTopFarmer = async () => {
      try {
        const res = await topFarmerAPI();
        console.log(res);
        setTopFarmers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching top farmer:", error);
      }
    };

    fetchTopFarmer();
  }, []);

  return (
    <section className="w-full bg-[#f7fbf8] py-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#13a855]/10 bg-[#e8f8f0] px-3 py-1 text-xs font-bold tracking-wider text-[#13a855] uppercase">
              <Award className="h-4 w-4 animate-bounce" />
              <span>Nhà Vườn Tiêu Biểu</span>
            </div>
          </div>
          <button className="group flex cursor-pointer items-center gap-2 self-start text-sm font-bold text-[#13a855] transition-colors hover:text-[#0f8b44] md:self-auto">
            <span>Tất cả nhà vườn</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
          </button>
        </div>
        {/* Farmers Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {topFarmers.map((farmer) => {
            const isHovered = hoveredCard === farmer.id;
            const isLiked = !!likedFarmers[farmer.id];
            return (
              <div
                key={farmer.id}
                onMouseEnter={() => setHoveredCard(farmer.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
              >
                {/* Cover Image & Like Button */}
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <img
                    src={farmer.coverImage}
                    alt={farmer.name}
                    className="h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#13a855] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-white uppercase shadow-sm">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {farmer.badge}
                    </span>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => handleLike(farmer.id, e)}
                    className="absolute top-4 right-4 z-20 cursor-pointer rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/40 active:scale-90"
                  >
                    <Heart
                      className={`h-4.5 w-4.5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
                    />
                  </button>
                </div>

                {/* Profile Info Card Area */}
                <div className="relative flex flex-1 flex-col px-6 pt-12 pb-6">
                  {/* Avatar (Overlaps the Cover Image) */}
                  <div className="absolute -top-10 left-6 z-20 h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md">
                    <img
                      src={farmer.avatar}
                      alt={farmer.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Name and Rating */}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <Link
                      href={`/farm/detail/?id=${farmer.id}`}
                      className="truncate text-lg leading-tight font-extrabold text-gray-800 transition-colors hover:text-[#13a855]"
                      title={farmer.name}
                    >
                      {farmer.name.length > 25
                        ? `${farmer.name.slice(0, 25)}...`
                        : farmer.name}
                    </Link>
                    <div className="flex shrink-0 items-center gap-1 rounded-md border border-amber-200/50 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-500">
                      <span>★</span>
                      <span>{farmer.rating}</span>
                    </div>
                  </div>

                  {/* Location info */}
                  <div
                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500"
                    title={farmer.location}
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
                    <span className="truncate">
                      {farmer.location.length > 35
                        ? `${farmer.location.slice(0, 35)}...`
                        : farmer.location}
                    </span>
                  </div>

                  {/* Specialties tags */}
                  <div className="mt-4 space-y-2 border-t border-gray-50 pt-4">
                    <span className="truncate text-[11px] font-bold tracking-wider text-[#13a855] uppercase">
                      Mô hình chuyên canh:
                    </span>
                    <p
                      className="truncate text-xs leading-relaxed font-medium text-gray-600"
                      title={farmer.specialty}
                    >
                      {farmer.specialty}
                    </p>
                  </div>

                  {/* Statistics */}
                  <div className="mt-auto grid grid-cols-2 gap-4 rounded-xl border border-gray-100/50 bg-gray-50 p-3 text-center">
                    <div className="space-y-0.5">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">
                        Kinh nghiệm
                      </span>
                      <div className="flex items-center justify-center gap-1 text-xs font-extrabold text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-[#13a855]" />
                        <span>{farmer.experience}</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 border-l border-gray-200">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">
                        Diện tích vườn
                      </span>
                      <div className="flex items-center justify-center gap-1 text-xs font-extrabold text-gray-700">
                        <Users className="h-3.5 w-3.5 text-[#13a855]" />
                        <span>{farmer.landArea}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-6 pt-2">
                    <Link
                      href={`/farm/detail/?id=${farmer.id}`}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#e8f8f0] py-2.5 text-xs font-bold text-[#13a855] transition-all duration-200 hover:bg-[#13a855] hover:text-white active:scale-98"
                    >
                      <span>Ghé thăm & Xem Nhật Ký</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default TopFarmer;
