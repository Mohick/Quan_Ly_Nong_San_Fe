"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, MapPin, ArrowRight, ShieldCheck, Heart, Users, Calendar } from "lucide-react";
import { topFarmerAPI } from "@/lib/_api/top_farmer";

const TopFarmer = () => {
    const [topFarmers, setTopFarmers] = useState<any[]>([]);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [likedFarmers, setLikedFarmers] = useState<Record<number, boolean>>({});

    const handleLike = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLikedFarmers((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
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
        <section className="w-full py-16 bg-[#f7fbf8] font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#13a855] rounded-full bg-[#e8f8f0] border border-[#13a855]/10">
                            <Award className="w-4 h-4 animate-bounce" />
                            <span>Nhà Vườn Tiêu Biểu</span>
                        </div>

                    </div>
                    <button className="flex items-center gap-2 text-sm font-bold text-[#13a855] hover:text-[#0f8b44] transition-colors self-start md:self-auto group cursor-pointer">
                        <span>Tất cả nhà vườn</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </button>
                </div>
                {/* Farmers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {topFarmers.map((farmer) => {
                        const isHovered = hoveredCard === farmer.id;
                        const isLiked = !!likedFarmers[farmer.id];
                        return (
                            <div
                                key={farmer.id}
                                onMouseEnter={() => setHoveredCard(farmer.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                            >
                                {/* Cover Image & Like Button */}
                                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent z-10" />
                                    <img
                                        src={farmer.coverImage}
                                        alt={farmer.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Top Badges */}
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold text-white bg-[#13a855] rounded-md shadow-sm tracking-wide uppercase">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            {farmer.badge}
                                        </span>
                                    </div>

                                    {/* Like Button */}
                                    <button
                                        onClick={(e) => handleLike(farmer.id, e)}
                                        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all duration-200 active:scale-90 cursor-pointer"
                                    >
                                        <Heart className={`w-4.5 h-4.5 transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                                    </button>
                                </div>

                                {/* Profile Info Card Area */}
                                <div className="relative px-6 pb-6 flex-1 flex flex-col pt-12">

                                    {/* Avatar (Overlaps the Cover Image) */}
                                    <div className="absolute -top-10 left-6 z-20 w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-md">
                                        <img
                                            src={farmer.avatar}
                                            alt={farmer.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Name and Rating */}
                                    <div className="flex items-center justify-between gap-2 mt-1">
                                        <Link href={`/farm/detail/?id=${farmer.id}`} className="font-extrabold text-gray-800 text-lg hover:text-[#13a855] transition-colors leading-tight" title={farmer.name}>
                                            {farmer.name.length > 25 ? `${farmer.name.slice(0, 25)}...` : farmer.name}
                                        </Link>
                                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-md shrink-0">
                                            <span>★</span>
                                            <span>{farmer.rating}</span>
                                        </div>
                                    </div>

                                    {/* Location info */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2 font-medium" title={farmer.location}>
                                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                        <span className="truncate">{farmer.location.length > 35 ? `${farmer.location.slice(0, 35)}...` : farmer.location}</span>
                                    </div>

                                    {/* Specialties tags */}
                                    <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                                        <span className="text-[11px] font-bold text-[#13a855] uppercase tracking-wider">
                                            Mô hình chuyên canh:
                                        </span>
                                        <p className="text-xs text-gray-600 font-medium leading-relaxed" title={farmer.specialty}>
                                            {farmer.specialty.length > 80 ? `${farmer.specialty.slice(0, 80)}...` : farmer.specialty}
                                        </p>
                                    </div>

                                    {/* Statistics */}
                                    <div className="grid grid-cols-2 gap-4 mt-6 p-3 bg-gray-50 rounded-xl border border-gray-100/50 text-center">
                                        <div className="space-y-0.5">
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Kinh nghiệm</span>
                                            <div className="flex items-center justify-center gap-1 text-xs font-extrabold text-gray-700">
                                                <Calendar className="w-3.5 h-3.5 text-[#13a855]" />
                                                <span>{farmer.experience}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-0.5 border-l border-gray-200">
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Diện tích vườn</span>
                                            <div className="flex items-center justify-center gap-1 text-xs font-extrabold text-gray-700">
                                                <Users className="w-3.5 h-3.5 text-[#13a855]" />
                                                <span>{farmer.landArea}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Link */}
                                    <div className="mt-6 pt-2">
                                        <Link href={`/farm/detail/?id=${farmer.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#e8f8f0] hover:bg-[#13a855] text-[#13a855] hover:text-white font-bold rounded-xl active:scale-98 transition-all duration-200 cursor-pointer text-xs">
                                            <span>Ghé thăm & Xem Nhật Ký</span>
                                            <ArrowRight className="w-4 h-4" />
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
