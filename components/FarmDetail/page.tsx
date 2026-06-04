"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, MapPin,
    Award, Heart, Star, BadgeCheck, Play, Volume2, Maximize,
    Search, ShieldAlert, Sparkles, MessageSquare, Plus, CheckCircle, ExternalLink, Landmark
} from "lucide-react";
import { getAllFarmAPI } from "@/lib/_api/get_all_farm";
import { productAPI } from "@/lib/_api/product";

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

export default function FarmDetailClient({ id }: { id: string }) {
    const router = useRouter();

    const [farm, setFarm] = useState<Farm | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // YouTube states
    const [activeTab, setActiveTab] = useState<"home" | "products" | "about">("home");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchDetailData = async () => {
            try {
                // Fetch Farm info from backend
                const farmRes = await getAllFarmAPI();
                const responseData = farmRes.data;
                const farmData = Array.isArray(responseData.data) ? responseData.data : [];
                const foundFarm = farmData.find((f: any) => (f.id || f.ID) === id);
                if (foundFarm) {
                    const mappedFarm: Farm = {
                        id: foundFarm.id || foundFarm.ID,
                        name: foundFarm.farm_name || foundFarm.FarmName || "Nông trại thành viên",
                        avatar: foundFarm.image_url || foundFarm.ImageURL || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=150",
                        coverImage: foundFarm.image_url || foundFarm.ImageURL || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000",
                        location: foundFarm.address || foundFarm.Address || "Việt Nam",
                        specialty: "Nông sản sạch, Rau củ quả",
                        experience: "5 năm",
                        landArea: "1.2 Hécta",
                        rating: 4.9,
                        badge: "VietGAP",
                        likes: 88,
                        description: foundFarm.description || foundFarm.Description || "Trang trại của gia đình liên kết sản xuất nông nghiệp sạch chuẩn an toàn vệ sinh thực phẩm.",
                    };
                    setFarm(mappedFarm);
                    setLikesCount(mappedFarm.likes);
                }

                // Fetch Products list
                const productRes = await productAPI();
                const productData = Array.isArray(productRes.data) ? productRes.data : [];
                setProducts(productData);
            } catch (error) {
                console.error("Lỗi tải thông tin chi tiết nhà vườn:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetailData();
    }, [id]);

    // Lọc sản phẩm thuộc nhà vườn này (dựa trên tên hoặc vị trí tương đương)
    const farmProducts = useMemo(() => {
        if (!farm) return [];
        // Lọc theo ký tự gần đúng của tên nông dân
        const nameKeywords = farm.name.split(" ").slice(-2).join(" ").toLowerCase();
        return products.filter((p: any) =>
            p.name?.toLowerCase().includes(nameKeywords) ||
            p.farmer?.toLowerCase().includes(nameKeywords) ||
            p.description?.toLowerCase().includes(nameKeywords)
        );
    }, [farm, products]);

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            alert("Đã sao chép liên kết nhà vườn!");
        }
    };

    const handleSubscribeToggle = () => {
        setIsSubscribed(!isSubscribed);
        if (!isSubscribed) {
            alert(`Đăng ký theo dõi kênh ${farm?.name} thành công! Bạn sẽ nhận được thông báo khi có nông sản mới.`);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f8faf9] text-gray-800 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-t-transparent border-[#13a855] rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-gray-500">Đang tải kênh nhà vườn...</span>
                </div>
            </div>
        );
    }

    if (!farm) {
        return (
            <div className="min-h-screen bg-[#f8faf9] text-gray-800 flex items-center justify-center p-4">
                <div className="bg-white border border-gray-200/80 p-8 rounded-3xl text-center max-w-sm w-full shadow-lg">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-black text-gray-900">Không tìm thấy nhà vườn</h3>
                    <p className="text-xs text-gray-500 mt-1 mb-5">
                        Trang trại này không tồn tại hoặc đã tạm dừng hoạt động trên hệ thống.
                    </p>
                    <button
                        onClick={() => router.push("/farm")}
                        className="w-full py-3 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                        Quay lại danh mục nhà vườn
                    </button>
                </div>
            </div>
        );
    }

    const farmHandle = `@${farm.name.toLowerCase().replace(/[\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, "a")}`;

    return (
        <div className="min-h-screen bg-[#f8faf9] text-gray-700 font-sans selection:bg-[#13a855]/20 selection:text-[#13a855] pb-16">

            {/* 1. YouTube-style Top Horizontal Banner Cover */}
            <div className="w-full max-w-6xl mx-auto px-0 sm:px-4 md:px-8 mt-2">
                <div className="h-28 sm:h-44 md:h-52 w-full overflow-hidden rounded-none sm:rounded-2xl bg-gray-200 relative group shadow-md">
                    <img
                        src={farm.coverImage}
                        alt={farm.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {/* Custom watermark float badge */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                            onClick={() => router.push("/farm")}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/90 hover:bg-white text-gray-800 text-[11px] font-black rounded-full shadow-md active:scale-95 transition-all cursor-pointer border border-gray-200/50 backdrop-blur-md"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Tất cả nhà vườn</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-md active:scale-95 transition-all cursor-pointer border border-gray-200/50 backdrop-blur-md"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Facebook-style Channel Info Header (Only Avatar overlaps banner, Text sits safely below) */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 pb-6">
                <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-start md:items-end justify-between">
                    <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 items-start sm:items-end w-full md:w-auto">
                        {/* Avatar */}
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white bg-white shadow-xl flex-shrink-0 relative -mt-12 sm:-mt-16 md:-mt-20">
                            <img src={farm.avatar} alt={farm.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Core Info details (Name & Stats only - sits perfectly below cover photo) */}
                        <div className="space-y-2 pb-2 flex flex-col items-start">
                            <div className="flex flex-wrap items-center justify-start gap-2">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-gray-900 flex items-center gap-1.5 justify-start">
                                    <span>{farm.name}</span>
                                    <BadgeCheck className="w-5 h-5 text-sky-500 fill-sky-500 shrink-0" />
                                </h1>
                                <span className="px-2.5 py-0.5 bg-[#e8f8f0] text-[#13a855] text-[9px] font-black rounded uppercase border border-[#cbeed7] tracking-wider">
                                    {farm.badge}
                                </span>
                            </div>

                            {/* Handle • Stats row */}
                            <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-xs font-bold text-gray-500">
                                <span className="text-gray-800">{farmHandle}</span>
                                <span>•</span>
                                <span>{likesCount + (isSubscribed ? 1 : 0)} người đăng ký</span>
                                <span>•</span>
                                <span>{farm.experience}</span>
                                <span>•</span>
                                <span>{farm.landArea} canh tác</span>
                            </div>
                        </div>
                    </div>

                    {/* Subscription and Join Action buttons */}
                    <div className="flex flex-wrap gap-2.5 w-full md:w-auto flex-shrink-0 pt-2 md:pt-0 pb-1">
                        <button
                            onClick={handleSubscribeToggle}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-black rounded-full transition-all active:scale-95 cursor-pointer shadow-sm border ${isSubscribed
                                    ? "bg-gray-150 hover:bg-gray-250 text-gray-800 border-gray-300/60"
                                    : "bg-gray-900 hover:bg-gray-800 text-white border-transparent"
                                }`}
                        >
                            {isSubscribed ? (
                                <>
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span>Đã đăng ký</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    <span>Đăng ký mua</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setIsJoined(!isJoined);
                                if (!isJoined) alert(`Chào mừng hội viên! Bạn đã trở thành Hội viên VIP của ${farm.name}.`);
                            }}
                            className={`flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 text-xs font-black rounded-full border transition-all active:scale-95 cursor-pointer ${isJoined
                                    ? "bg-[#e8f8f0] text-[#13a855] border-[#bfead0] hover:bg-[#d4f2e1]"
                                    : "bg-white border-gray-350 hover:bg-gray-50 text-gray-800"
                                }`}
                        >
                            {isJoined ? "Hội viên VIP" : "Tham gia hội viên"}
                        </button>
                    </div>
                </div>

                {/* Bio & Specialties below the Avatar/Name row */}
                <div className="mt-5 pt-4 border-t border-gray-200/60 max-w-4xl space-y-2.5">
                    {/* Expansible description snippet */}
                    <div className="text-xs font-medium text-gray-600 leading-relaxed">
                        <p className={descExpanded ? "" : "line-clamp-2"}>
                            {farm.description} Lâm Đồng chuyên trồng nông sản chất lượng cao theo phương pháp nông nghiệp hữu cơ bền vững. Toàn bộ cây trồng được cấp nước tưới tự động, giảm thiểu phân bón hóa học và theo sát quy trình kiểm duyệt VietGAP chuẩn xuất khẩu.
                        </p>
                        <button
                            onClick={() => setDescExpanded(!descExpanded)}
                            className="text-gray-900 hover:text-[#13a855] font-black mt-1 bg-transparent border-none outline-none cursor-pointer text-[11px]"
                        >
                            {descExpanded ? "ẩn bớt" : "...xem thêm"}
                        </button>
                    </div>

                    {/* Specialty tag link */}
                    <div className="flex items-center justify-start gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="cursor-pointer">{`pione.vn/farm/${id}`}</span>
                        <span className="text-gray-400 font-normal">và đặc sản: {farm.specialty.split(",").slice(0, 2).join(", ")}</span>
                    </div>
                </div>
            </div>

            {/* 3. YouTube Tabs Navigation Menu */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 border-b border-gray-200 flex overflow-x-auto gap-6 sm:gap-8 scrollbar-none">
                {[
                    { id: "home", label: "Trang chủ" },
                    { id: "products", label: "Sản phẩm" },
                    { id: "about", label: "Giới thiệu" },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-3.5 text-sm font-black border-b-2 tracking-wide transition-all flex-shrink-0 cursor-pointer whitespace-nowrap ${isActive
                                    ? "border-[#13a855] text-[#13a855]"
                                    : "border-transparent text-gray-500 hover:text-[#13a855]"
                                }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* 4. Dynamic Tab Contents */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8">

                {/* A. HOME TAB */}
                {activeTab === "home" && (
                    <div className="space-y-10 animate-fade-in">
                        {/* Featured Simulated Video Block */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                            {/* Simulated Video Player */}
                            <div className="lg:col-span-7 rounded-2xl overflow-hidden bg-black border border-gray-200 relative group aspect-video shadow-lg flex-shrink-0">
                                <img
                                    src={farm.coverImage}
                                    alt="Video thumbnail"
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${videoPlaying ? "opacity-30" : "opacity-90"}`}
                                />

                                {/* Dark overlay & subtitles */}
                                <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/20">
                                    <span className="text-[11px] font-black tracking-wider bg-red-600 text-white px-2 py-0.5 rounded uppercase self-start shadow-md">
                                        Live
                                    </span>

                                    {/* Subtitle simulation overlay */}
                                    <div className="text-center font-extrabold text-xs sm:text-sm text-yellow-300 drop-shadow-md pb-8 px-8 leading-snug">
                                        {videoPlaying
                                            ? '"...quay trở lại với nhật ký canh tác dâu tây organic chuẩn VietGAP tại trang trại của Chú Sáu..."'
                                            : '"Nhấn để xem nhật ký hoạt động thu hoạch nông sản hôm nay..."'}
                                    </div>
                                </div>

                                {/* Video controls */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between text-white text-xs bg-black/60 backdrop-blur-xs select-none">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setVideoPlaying(!videoPlaying)}
                                            className="p-1 bg-white text-black hover:bg-neutral-200 rounded-full cursor-pointer shadow"
                                        >
                                            <Play className="w-3.5 h-3.5 fill-current" />
                                        </button>
                                        <Volume2 className="w-4 h-4 text-neutral-300" />
                                        <span>0:04 / 1:50:43</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-red-500 font-bold uppercase animate-pulse">● HD 1086p</span>
                                        <Maximize className="w-4 h-4 text-neutral-300 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Video Info & metadata */}
                            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between h-full">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                                        <Sparkles className="w-3.5 h-3.5 text-[#13a855]" />
                                        <span>Video Tiêu Điểm Nhà Vườn</span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                                        Giải thích quy trình canh tác và đóng gói sản phẩm sạch trọn gói tại {farm.name}
                                    </h3>
                                    <div className="text-xs font-bold text-gray-500">
                                        <span>320.095 lượt xem</span>
                                        <span className="mx-2">•</span>
                                        <span>1 năm trước</span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                        Chào mừng mọi người quay trở lại với series giới thiệu nông nghiệp công nghệ cao của PIONE GROUP. Trong video này, chúng tôi xin chia sẻ trọn bộ kỹ thuật ươm mầm giống, bón vi sinh chất lượng cao và cách bảo dưỡng cây trồng chuẩn sạch nhất.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-250 space-y-2">
                                    <div className="flex gap-2 items-center">
                                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping"></div>
                                        <span className="text-[11px] text-gray-600 font-extrabold">Mua nông sản ủng hộ bà con :3</span>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab("products")}
                                        className="flex items-center gap-1.5 text-xs font-black text-[#13a855] hover:text-[#0f8b44] transition-colors cursor-pointer bg-transparent border-0 outline-none"
                                    >
                                        <span>Xem sản phẩm nhà vườn</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* YouTube Homepage Video Shelves */}
                        <div className="pt-4 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">Sản Phầm Mới Lên Kệ</h3>
                                <button
                                    onClick={() => setActiveTab("products")}
                                    className="text-xs font-black text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                                >
                                    Xem tất cả
                                </button>
                            </div>

                            {farmProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {farmProducts.slice(0, 4).map((p: any) => (
                                        <div
                                            key={p.id}
                                            className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-sm"
                                        >
                                            <div className="h-28 sm:h-36 overflow-hidden relative bg-gray-50 flex-shrink-0">
                                                <img
                                                    src={p.image_url || p.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"}
                                                    alt={p.name}
                                                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                                                <div className="space-y-0.5">
                                                    <h4 className="text-[11px] sm:text-xs font-black text-gray-900 line-clamp-1 group-hover:text-[#13a855] transition-colors">
                                                        {p.name}
                                                    </h4>
                                                    <span className="block text-[9px] text-[#13a855] font-extrabold uppercase">
                                                        {p.category}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-1 border-t border-gray-150 mt-auto text-[10px] sm:text-xs">
                                                    <span className="font-extrabold text-gray-850">{p.price || "Đang bán"}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold">{p.unit || "kg"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white border border-gray-200/80 rounded-2xl max-w-md mx-auto text-gray-500 text-xs shadow-sm">
                                    Hiện chưa có sản phẩm nào lên kệ. Hãy liên hệ với chúng tôi để đặt hàng trước!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* B. PRODUCTS TAB */}
                {activeTab === "products" && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                            <Landmark className="w-5 h-5 text-[#13a855]" />
                            <span>Sản Phẩm Đang Canh Tác ({farmProducts.length})</span>
                        </h3>

                        {farmProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {farmProducts.map((p: any) => (
                                    <div
                                        key={p.id}
                                        className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col justify-between group shadow-sm"
                                    >
                                        <div className="h-32 sm:h-40 overflow-hidden relative bg-gray-50 flex-shrink-0">
                                            <img
                                                src={p.image_url || p.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400"}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                            <div className="space-y-1">
                                                <h4 className="text-xs sm:text-sm font-black text-gray-900 line-clamp-1 group-hover:text-[#13a855] transition-colors">
                                                    {p.name}
                                                </h4>
                                                <span className="block text-[9px] text-[#13a855] font-extrabold uppercase tracking-wider">
                                                    {p.category}
                                                </span>
                                                <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                                                    {p.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-150 mt-auto text-xs sm:text-sm">
                                                <span className="font-extrabold text-gray-950">{p.price || "Liên hệ"}</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">{p.unit || "kg"}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white border border-gray-200/80 rounded-3xl max-w-xl mx-auto text-gray-500 shadow-sm">
                                <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h4 className="text-sm sm:text-base font-black text-gray-800">Nhà vườn chưa đăng tải sản phẩm nào!</h4>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    Vui lòng quay lại sau khi chúng tôi cập nhật thêm các giỏ hàng thu hoạch mới.
                                </p>
                            </div>
                        )}
                    </div>
                )}



                {/* D. ABOUT TAB */}
                {activeTab === "about" && (
                    <div className="space-y-6 animate-fade-in max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Detailed specs */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">Về Trang Trại Chúng Tôi</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                                        {farm.description} Toàn bộ cơ sở vật chất nhà màng, lưới che phủ côn trùng được nhập khẩu trực tiếp từ Israel. Chúng tôi nỗ lực tối đa để mang lại những dòng nông sản có hàm lượng dinh dưỡng nguyên bản, tuyệt đối không lạm dụng chất hóa học tăng trưởng gây hại cho đất và con người.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-xs sm:text-sm font-black text-gray-900">Chỉ số Nông nghiệp của kênh</h4>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="p-4 bg-white border border-gray-200/85 rounded-2xl shadow-sm">
                                            <span className="block text-[9px] text-gray-400 font-black uppercase tracking-wider mb-1">Mã đối tác</span>
                                            <span className="text-xs font-black text-gray-950 uppercase">{`PIONE-FARM-${farm.id}`}</span>
                                        </div>
                                        <div className="p-4 bg-white border border-gray-200/85 rounded-2xl shadow-sm">
                                            <span className="block text-[9px] text-gray-400 font-black uppercase tracking-wider mb-1">Kinh nghiệm nhà nông</span>
                                            <span className="text-xs font-black text-gray-950">{farm.experience}</span>
                                        </div>
                                        <div className="p-4 bg-white border border-gray-200/85 rounded-2xl shadow-sm">
                                            <span className="block text-[9px] text-gray-400 font-black uppercase tracking-wider mb-1">Quy mô quỹ đất</span>
                                            <span className="text-xs font-black text-gray-950">{farm.landArea}</span>
                                        </div>
                                        <div className="p-4 bg-white border border-gray-200/85 rounded-2xl shadow-sm">
                                            <span className="block text-[9px] text-gray-400 font-black uppercase tracking-wider mb-1">Chứng chỉ đạt được</span>
                                            <span className="text-xs font-black text-[#13a855]">{farm.badge}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar stats */}
                            <div className="bg-white border border-gray-200/80 rounded-2xl p-5 h-fit space-y-4 text-xs font-bold text-gray-500 shadow-sm">
                                <h4 className="text-sm font-black text-gray-900 pb-3 border-b border-gray-150">Thống kê hoạt động</h4>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Đánh giá kênh:</span>
                                        <span className="text-amber-500 font-extrabold flex items-center gap-0.5">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            {farm.rating}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Lượt thích:</span>
                                        <span className="text-gray-900 font-extrabold">{likesCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Vị trí địa lý:</span>
                                        <span className="text-gray-900 font-extrabold">{farm.location.split(",").slice(-1)[0]}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}
