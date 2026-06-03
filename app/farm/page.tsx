"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Landmark, MapPin, Award, Heart, Sparkles,
  Layers, BadgeCheck, ShieldAlert, ArrowRight, UserCheck, Star
} from "lucide-react";
import Link from "next/link";
import { getAllFarmAPI } from "@/lib/_api/get_all_farm";

interface Farm {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  location: string;
  specialty: string;
  experience: string;
  landArea: string;
  rating: number;
  badge: string;
  likes: number;
  description: string;
}

export default function FarmListPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("all");

  // Fetch farms catalog - matching product and news fetch patterns
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await getAllFarmAPI();
        const responseData = res.data;
        const dataList = Array.isArray(responseData.data) ? responseData.data : [];
        const mapped = dataList.map((f: any) => ({
          id: f.id || f.ID,
          name: f.farm_name || f.FarmName || "Nông trại thành viên",
          avatar: f.image_url || f.ImageURL || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=150",
          coverImage: f.image_url || f.ImageURL || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000",
          location: f.address || f.Address || "Việt Nam",
          specialty: "Nông sản sạch, Rau củ quả",
          experience: "5 năm",
          landArea: "1.2 Hécta",
          rating: 4.9,
          badge: "VietGAP",
          likes: 88,
          description: f.description || f.Description || "Trang trại của gia đình liên kết sản xuất nông nghiệp sạch chuẩn an toàn vệ sinh thực phẩm.",
        }));
        setFarms(mapped);
        console.log("Danh sách trang trại:", mapped);
      } catch (error) {
        console.error("Error fetching farms:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFarms();
  }, []);

  // Filter standards dynamically
  const uniqueStandards = useMemo(() => {
    const set = new Set(farms.map(f => f.badge));
    return ["all", ...Array.from(set)];
  }, [farms]);

  // Dynamic filter logic
  const filteredFarms = useMemo(() => {
    return farms.filter(farm => {
      const matchesSearch = (farm.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (farm.specialty || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (farm.location || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStandard = selectedStandard === "all" || farm.badge === selectedStandard;
      return matchesSearch && matchesStandard;
    });
  }, [searchQuery, selectedStandard, farms]);

  const handleLike = (id: string) => {
    setFarms(prev => prev.map(f => f.id === id ? { ...f, likes: f.likes + 1 } : f));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-transparent border-[#13a855] rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-500">Đang tải danh sách nhà vườn...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans selection:bg-[#13a855]/20 selection:text-[#13a855] pb-16">

      {/* Banner/Header Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="mb-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#e8f8f0] text-[#13a855] text-xs font-black rounded-full mb-3 border border-[#d4f2e1]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đối Tác Nông Nghiệp Chuẩn Quốc Tế</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            Danh Sách Đối Tác Nhà Vườn
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1 max-w-2xl">
            Khám phá các trang trại thành viên của PIONE GROUP đạt tiêu chuẩn hữu cơ, GlobalGAP và VietGAP, mang lại nguồn nông sản an toàn nhất tới tay người tiêu dùng.
          </p>
        </div>

        {/* Filter and Search Bar Row */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-10 bg-white p-4.5 rounded-3xl border border-gray-200/80 shadow-sm">
          {/* Category/Standard pills */}
          <div className="flex flex-wrap gap-2 w-full lg:flex-1">
            {uniqueStandards.map((std) => {
              const label = std === "all" ? "Tất Cả Nhà Vườn" : std;
              const isActive = selectedStandard === std;
              return (
                <button
                  key={std}
                  onClick={() => setSelectedStandard(std)}
                  className={`px-4.5 py-2 rounded-full text-xs font-black border transition-all cursor-pointer ${isActive
                    ? "bg-[#13a855] text-white border-[#13a855] shadow-sm scale-102"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search Field */}
          <div className="relative w-full lg:w-80 flex-shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên nhà vườn, vị trí, đặc sản..."
              className="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-5 pr-10 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
            />
            <Search className="absolute right-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          </div>
        </div>

        {/* Responsive Grid List */}
        {filteredFarms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFarms.map((farm) => (
              <div
                key={farm.id}
                className="bg-white border border-gray-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Cover Header */}
                  <div className="h-44 w-full relative overflow-hidden bg-gray-100">
                    <img
                      src={farm.coverImage}
                      alt={farm.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {/* Floating Standard Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="flex items-center gap-1 px-3 py-1.5 bg-[#13a855] text-white text-[10px] font-black uppercase rounded-md shadow-md border border-emerald-400/20 tracking-wider">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {farm.badge}
                      </span>
                    </div>
                  </div>

                  {/* Profile overlay details block */}
                  <div className="px-5 sm:px-6 relative pb-2 flex gap-4 items-end">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-md flex-shrink-0 relative -mt-10">
                      <img src={farm.avatar} alt={farm.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="pb-1.5">
                      <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight group-hover:text-[#13a855] transition-colors">
                        {farm.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#13a855]" />
                        <span>{farm.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="px-5 sm:px-6 py-4 space-y-4">
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {farm.description}
                    </p>

                    {/* Highlights parameters */}
                    <div className="grid grid-cols-3 gap-2.5 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-center text-xs font-bold text-gray-600">
                      <div>
                        <span className="block text-[9px] text-gray-450 uppercase font-black tracking-wider mb-0.5">Kinh nghiệm</span>
                        <span className="text-gray-800 font-extrabold">{farm.experience}</span>
                      </div>
                      <div className="border-x border-gray-150">
                        <span className="block text-[9px] text-gray-450 uppercase font-black tracking-wider mb-0.5">Diện tích</span>
                        <span className="text-gray-800 font-extrabold">{farm.landArea}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-450 uppercase font-black tracking-wider mb-0.5">Đánh giá</span>
                        <span className="text-amber-500 font-extrabold flex items-center justify-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {farm.rating}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Các Đặc Sản Chủ Chốt</span>
                      <p className="text-gray-700 font-extrabold">{farm.specialty}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <button
                    onClick={() => handleLike(farm.id)}
                    className="flex items-center gap-1.5 text-xs font-black text-red-500 hover:text-red-600 transition-colors bg-white border border-red-100 px-3.5 py-2 rounded-xl shadow-sm active:scale-97 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Thích ({farm.likes})</span>
                  </button>

                  <Link
                    href={`/farm/${farm.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-97 cursor-pointer"
                  >
                    <span>Vào nhà vườn</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl max-w-xl mx-auto shadow-sm">
            <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-black text-gray-800">Không tìm thấy nhà vườn nào!</h4>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
