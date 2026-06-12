"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, MapPin,
    Award, Heart, Star, BadgeCheck, Play, Volume2, Maximize,
    Search, ShieldAlert, Sparkles, MessageSquare, Plus, CheckCircle, ExternalLink, Landmark,
    ChevronLeft, ChevronRight, ChevronDown, X, Check, RotateCcw, Grid, List
} from "lucide-react";
import { getAllFarmAPI } from "@/lib/_api/get_all_farm";
import { productAPI } from "@/lib/_api/product";
import { lotsAPI } from "@/lib/_api/lots";
import { ProductCard } from "@/components/item_product/item_product";
import { toast } from "react-toastify";

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

const formatFollowers = (count: number): string => {
    if (count >= 1_000_000) {
        const formatted = (count / 1_000_000).toFixed(1);
        return formatted.endsWith(".0") ? `${formatted.slice(0, -2)}M` : `${formatted}M`;
    }
    if (count >= 10_000) {
        const formatted = (count / 1_000).toFixed(1);
        return formatted.endsWith(".0") ? `${formatted.slice(0, -2)}K` : `${formatted}K`;
    }
    return count.toLocaleString("vi-VN");
};

export default function FarmDetailClient({ id }: { id: string }) {
    const router = useRouter();

    const [farm, setFarm] = useState<Farm | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // YouTube states
    const [activeTab, setActiveTab] = useState<"home" | "products" | "about">("home");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);

    // Products filter & pagination states
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Price filter states
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [localMinPrice, setLocalMinPrice] = useState("");
    const [localMaxPrice, setLocalMaxPrice] = useState("");
    const [activePriceDropdown, setActivePriceDropdown] = useState(false);

    // Sort & view mode states
    const [activeSort, setActiveSort] = useState("newest");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        if (!id) return;

        const fetchDetailData = async () => {
            try {
                // Fetch Farm info from backend
                const farmRes = await getAllFarmAPI();
                const responseData = farmRes.data;
                const farmData = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);
                const foundFarm = farmData.find((f: any) => (f.id || f.ID) === id);
                if (foundFarm) {
                    const rawLocation = foundFarm.address || foundFarm.Address || "Việt Nam";
                    const mappedFarm: Farm = {
                        id: foundFarm.id || foundFarm.ID,
                        name: foundFarm.farm_name || foundFarm.FarmName || "Nông trại thành viên",
                        avatar: foundFarm.image_url || foundFarm.ImageURL || "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=150",
                        coverImage: foundFarm.image_url || foundFarm.ImageURL || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000",
                        location: rawLocation.length > 30 ? `${rawLocation.slice(0, 30)}...` : rawLocation,
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
                
                // Fetch Crop Lots list for this farm
                const lotsRes = await lotsAPI(id);
                const farmLots = lotsRes.data || [];
                setLots(farmLots);

                // Populate farmName for each product
                const farmResData = farmData.find((f: any) => (f.id || f.ID) === id);
                const currentFarmName = farmResData ? (farmResData.farm_name || farmResData.FarmName || farmResData.name || farmResData.Name || "Trang trại Thông") : "Trang trại Thông";
                
                const mappedProducts = productData.map((p: any) => {
                    // Check if this product belongs to this farm's lots or matches by farm id
                    const pFarmId = p.cropLot?.farmId || p.cropLot?.farm_id || p.farmId || p.FarmID;
                    const farmLotIds = new Set(farmLots.map((lot: any) => String(lot.id)));
                    const isOurProduct = (pFarmId && String(pFarmId) === String(id)) || (p.cropLotId && farmLotIds.has(String(p.cropLotId)));
                    
                    if (isOurProduct) {
                        return {
                            ...p,
                            farmName: currentFarmName
                        };
                    }
                    return p;
                });
                
                setProducts(mappedProducts);
            } catch (error) {
                console.error("Lỗi tải thông tin chi tiết nhà vườn:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetailData();
    }, [id]);

    // Lọc sản phẩm thuộc nhà vườn này (dựa trên farm ID hoặc tên tương đương, hoặc thông qua lô đất)
    const farmProductsAll = useMemo(() => {
        if (!farm) return [];
        const farmLotIds = new Set(lots.map((lot: any) => String(lot.id)));
        return products.filter((p: any) => {
            const pFarmId = p.cropLot?.farmId || p.cropLot?.farm_id || p.farmId || p.FarmID;
            if (pFarmId && farm.id) {
                return String(pFarmId) === String(farm.id);
            }
            if (p.cropLotId && farmLotIds.has(String(p.cropLotId))) {
                return true;
            }
            const nameKeywords = farm.name.split(" ").slice(-2).join(" ").toLowerCase();
            return (
                p.name?.toLowerCase().includes(nameKeywords) ||
                p.farmer?.toLowerCase().includes(nameKeywords) ||
                p.description?.toLowerCase().includes(nameKeywords)
            );
        });
    }, [farm, products, lots]);

    // Lọc danh sách phân loại (categories) thực tế từ các sản phẩm của nhà vườn
    const farmCategories = useMemo(() => {
        const cats = new Set<string>();
        farmProductsAll.forEach((p: any) => {
            if (p.category) {
                cats.add(p.category);
            }
        });
        return ["all", ...Array.from(cats)];
    }, [farmProductsAll]);

    // Reset trang về 1 khi đổi phân loại hoặc bộ lọc thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, minPrice, maxPrice, activeSort]);

    // Áp dụng bộ lọc phân loại + giá + sắp xếp
    const filteredFarmProducts = useMemo(() => {
        let result = farmProductsAll;

        // Lọc phân loại
        if (selectedCategory !== "all") {
            result = result.filter((p: any) => p.category === selectedCategory);
        }

        // Lọc theo khoảng giá
        if (minPrice) {
            result = result.filter((p: any) => {
                const price = Number(p.salePrice || p.price || 0);
                return price >= Number(minPrice);
            });
        }
        if (maxPrice) {
            result = result.filter((p: any) => {
                const price = Number(p.salePrice || p.price || 0);
                return price <= Number(maxPrice);
            });
        }

        // Sắp xếp
        const sorted = [...result];
        switch (activeSort) {
            case "price_asc":
                sorted.sort((a: any, b: any) => Number(a.salePrice || a.price || 0) - Number(b.salePrice || b.price || 0));
                break;
            case "price_desc":
                sorted.sort((a: any, b: any) => Number(b.salePrice || b.price || 0) - Number(a.salePrice || a.price || 0));
                break;
            case "bestseller":
                sorted.sort((a: any, b: any) => Number(b.sold || 0) - Number(a.sold || 0));
                break;
            case "newest":
            default:
                break;
        }

        return sorted;
    }, [farmProductsAll, selectedCategory, minPrice, maxPrice, activeSort]);

    // Phân trang sản phẩm: 1 trang 4 cột x 2 hàng = 8 sản phẩm
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.ceil(filteredFarmProducts.length / ITEMS_PER_PAGE) || 1;
    
    const paginatedFarmProducts = useMemo(() => {
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredFarmProducts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    }, [filteredFarmProducts, currentPage]);

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Đã sao chép liên kết nhà vườn!");
        }
    };

    const handleAddToCart = async (product: any) => {
        if (typeof window !== "undefined") {
            const localCart = localStorage.getItem("local_cart");
            let cartItems: any[] = [];
            if (localCart) {
                try {
                    cartItems = JSON.parse(localCart);
                } catch (_) {}
            }
            if (!Array.isArray(cartItems)) {
                cartItems = [];
            }

            const existingIndex = cartItems.findIndex((item: any) => item.id === product.id);
            if (existingIndex > -1) {
                cartItems[existingIndex].quantity += 1;
            } else {
                cartItems.push({
                    id: product.id,
                    name: product.name,
                    category: product.category || "Nông sản sạch",
                    price: product.salePrice,
                    originalPrice: product.originalPrice,
                    quantity: 1,
                    image: product.image,
                    unit: product.unit || "kg"
                });
            }

            localStorage.setItem("local_cart", JSON.stringify(cartItems));
            window.dispatchEvent(new Event("cart-updated"));
            toast.success(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
        }
    };

    const handleSubscribeToggle = () => {
        setIsSubscribed(!isSubscribed);
        if (!isSubscribed) {
            toast.success(`Đăng ký theo dõi kênh ${farm?.name} thành công! Bạn sẽ nhận được thông báo khi có nông sản mới.`);
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

    const cleanName = farm.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "");
    const farmHandle = `@${cleanName}`;

    return (
        <div className="min-h-screen bg-[#f8faf9] text-gray-700 font-sans selection:bg-[#13a855]/20 selection:text-[#13a855] pb-16">

            {/* 1. YouTube-style Top Horizontal Banner Cover */}
            <div className="w-full max-w-7xl mx-auto px-0 sm:px-4 md:px-8 mt-2">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 pb-6">
                <div className="flex flex-col md:flex-row gap-5 md:gap-7 items-start md:items-end justify-between">
                    <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 items-start sm:items-end w-full md:w-auto">
                        {/* Avatar */}
                        <div className="w-28 h-28 sm:w-36 sm:h-36 ml-5 rounded-full overflow-hidden border-4 border-white bg-white shadow-xl flex-shrink-0 relative -mt-12 sm:-mt-16 md:-mt-20">
                            <img src={farm?.avatar} alt={farm?.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Core Info details (Name & Stats only - sits perfectly below cover photo) */}
                        <div className="space-y-2 pb-2 flex flex-col items-start pt-[10px]">
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
                                <span>{formatFollowers(likesCount)} người theo dõi</span>
                                <span>•</span>
                                <span>{farm.experience} kinh nghiệm</span>
                                <span>•</span>
                                <span>{farm.landArea} diện tích</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* 3. YouTube Tabs Navigation Menu */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 border-b border-gray-200 flex overflow-x-auto gap-6 sm:gap-8 scrollbar-none">
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8">

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

                            {farmProductsAll.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {farmProductsAll.slice(0, 4).map((p: any) => (
                                        <ProductCard key={p.id} product={p} viewMode="grid" onAddToCart={handleAddToCart} />
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
                        {/* Header */}
                        <div className="border-b border-gray-250 pb-4">
                            <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                                <Landmark className="w-5 h-5 text-[#13a855]" />
                                <span>Sản Phẩm Đang Canh Tác ({filteredFarmProducts.length})</span>
                            </h3>
                        </div>

                        {/* ===== BỘ LỌC NÂNG CAO (giống trang /products) ===== */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                {/* Mức giá Dropdown */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const opening = !activePriceDropdown;
                                            if (opening) { setLocalMinPrice(minPrice); setLocalMaxPrice(maxPrice); }
                                            setActivePriceDropdown(opening);
                                        }}
                                        className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm font-extrabold transition-all cursor-pointer hover:bg-gray-50 ${
                                            minPrice || maxPrice
                                                ? "border-[#13a855] bg-[#e8f8f0] text-[#13a855]"
                                                : "border-gray-250 text-gray-700 bg-white"
                                        }`}
                                    >
                                        <span>Mức giá: {minPrice || maxPrice ? "Đã lọc theo giá" : "Tất cả mức giá"}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activePriceDropdown ? "rotate-180" : ""}`} />
                                    </button>

                                    {/* Price Popover */}
                                    {activePriceDropdown && (
                                        <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4.5 z-50 space-y-4 animate-fade-in">
                                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Lọc nhanh theo giá</h4>
                                            <div className="flex flex-col gap-1.5">
                                                {[
                                                    { label: "Dưới 50.000đ", min: "", max: "50000" },
                                                    { label: "Từ 50.000đ - 100.000đ", min: "50000", max: "100000" },
                                                    { label: "Trên 100.000đ", min: "100000", max: "" }
                                                ].map((qp) => {
                                                    const isQpActive = minPrice === qp.min && maxPrice === qp.max;
                                                    return (
                                                        <button
                                                            key={qp.label}
                                                            type="button"
                                                            onClick={() => { setMinPrice(qp.min); setMaxPrice(qp.max); setActivePriceDropdown(false); }}
                                                            className={`text-left text-xs p-2 rounded-xl transition-colors font-semibold ${isQpActive ? "bg-[#e8f8f0] text-[#13a855] font-extrabold" : "hover:bg-gray-50 text-gray-700"}`}
                                                        >
                                                            {qp.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="border-t border-gray-100 pt-3.5 space-y-3">
                                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Nhập khoảng giá chi tiết</h4>
                                                <form onSubmit={(e) => { e.preventDefault(); setMinPrice(localMinPrice); setMaxPrice(localMaxPrice); setActivePriceDropdown(false); }} className="space-y-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={localMinPrice}
                                                            onChange={(e) => setLocalMinPrice(e.target.value)}
                                                            placeholder="Từ (đ)"
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-[#13a855]"
                                                        />
                                                        <span className="text-gray-300">—</span>
                                                        <input
                                                            type="number"
                                                            value={localMaxPrice}
                                                            onChange={(e) => setLocalMaxPrice(e.target.value)}
                                                            placeholder="Đến (đ)"
                                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-[#13a855]"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => { setMinPrice(""); setMaxPrice(""); setLocalMinPrice(""); setLocalMaxPrice(""); setActivePriceDropdown(false); }}
                                                            className="flex-1 py-2.5 text-sm font-bold border border-gray-350 hover:bg-gray-50 text-gray-700 rounded-xl transition-all"
                                                        >
                                                            Xóa
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="flex-1 py-2.5 text-sm font-bold bg-[#13a855] text-white rounded-xl hover:bg-[#0f8b44] transition-all shadow-sm"
                                                        >
                                                            Áp dụng
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Nút xóa bộ lọc */}
                                {(minPrice || maxPrice || selectedCategory !== "all") && (
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedCategory("all"); setMinPrice(""); setMaxPrice(""); setActiveSort("newest"); }}
                                        className="flex items-center gap-1.5 px-4 py-2.5 border border-dashed border-red-300 bg-red-50/40 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-400 active:scale-95 transition-all cursor-pointer"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        <span>Xóa bộ lọc</span>
                                    </button>
                                )}
                            </div>

                            {/* Sắp xếp + Grid/List toggle */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="font-bold text-gray-400 w-full sm:w-auto mb-1 sm:mb-0">Sắp xếp theo:</span>
                                    <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                                        {[
                                            { id: "newest", label: "Mới nhất" },
                                            { id: "bestseller", label: "Bán chạy" },
                                            { id: "price_asc", label: "Giá thấp đến cao" },
                                            { id: "price_desc", label: "Giá cao đến thấp" }
                                        ].map((sort) => {
                                            const isSortActive = activeSort === sort.id;
                                            return (
                                                <button
                                                    key={sort.id}
                                                    onClick={() => setActiveSort(sort.id)}
                                                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer border flex items-center gap-1 ${
                                                        isSortActive
                                                            ? "bg-[#e8f8f0] text-[#13a855] border-[#13a855] shadow-sm font-extrabold"
                                                            : "bg-white text-gray-550 border-gray-250 hover:border-gray-400"
                                                    }`}
                                                >
                                                    {isSortActive && <Check className="w-4 h-4" />}
                                                    <span>{sort.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Grid/List View Toggles */}
                                <div className="flex items-center bg-white border border-gray-250 rounded-xl p-1 shadow-sm gap-0.5 self-end sm:self-auto">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === "grid"
                                            ? "bg-[#e8f8f0] text-[#13a855]"
                                            : "text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        <Grid className="w-4.5 h-4.5" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === "list"
                                            ? "bg-[#e8f8f0] text-[#13a855]"
                                            : "text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        <List className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Active filter tags */}
                            {(() => {
                                const tags: { id: string; label: string }[] = [];
                                if (selectedCategory !== "all") tags.push({ id: "category", label: `Danh mục: ${selectedCategory}` });
                                if (minPrice || maxPrice) {
                                    const minStr = minPrice ? new Intl.NumberFormat("vi-VN").format(Number(minPrice)) + "đ" : "0đ";
                                    const maxStr = maxPrice ? new Intl.NumberFormat("vi-VN").format(Number(maxPrice)) + "đ" : "Trở lên";
                                    tags.push({ id: "price", label: `Giá: ${minStr} - ${maxStr}` });
                                }
                                if (tags.length === 0) return null;
                                return (
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs py-1 border-t border-gray-100 pt-3">
                                        <span className="font-bold text-gray-400 mr-1.5">Đang lọc theo:</span>
                                        {tags.map((tag) => (
                                            <div
                                                key={tag.id}
                                                className="flex items-center gap-1.5 px-3 py-1 bg-[#e8f8f0] text-[#13a855] border border-[#cbeed7] rounded-full font-extrabold shadow-sm"
                                            >
                                                <span>{tag.label}</span>
                                                <button
                                                    onClick={() => {
                                                        if (tag.id === "category") setSelectedCategory("all");
                                                        if (tag.id === "price") { setMinPrice(""); setMaxPrice(""); }
                                                    }}
                                                    className="hover:bg-[#13a855]/20 p-0.5 rounded-full text-[#13a855] transition-colors cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {paginatedFarmProducts.length > 0 ? (
                            <div className="space-y-8">
                                {/* Grid 4 cột / List view - tối đa 8 sản phẩm (2 hàng) */}
                                <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
                                    {paginatedFarmProducts.map((p: any) => (
                                        <ProductCard key={p.id} product={p} viewMode={viewMode} onAddToCart={handleAddToCart} />
                                    ))}
                                </div>

                                {/* Điều khiển phân trang cao cấp */}
                                {totalPages >= 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-6 pb-2 select-none">
                                        <button
                                            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`flex items-center justify-center p-2 rounded-lg border shadow-xs transition-all cursor-pointer ${
                                                currentPage === 1
                                                    ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                                                    : "bg-white border-gray-300 text-gray-600 hover:bg-[#e8f8f0] hover:text-[#13a855] active:scale-95"
                                            }`}
                                            title="Trang trước"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center gap-1.5">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`min-w-[34px] h-[34px] flex items-center justify-center rounded-lg border font-black text-xs transition-all cursor-pointer ${
                                                        pageNum === currentPage
                                                            ? "bg-[#13a855] border-[#13a855] text-white shadow-xs"
                                                            : "bg-white border-gray-300 text-gray-750 hover:bg-[#e8f8f0] hover:text-[#13a855]"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`flex items-center justify-center p-2 rounded-lg border shadow-xs transition-all cursor-pointer ${
                                                currentPage === totalPages
                                                    ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                                                    : "bg-white border-gray-300 text-gray-600 hover:bg-[#e8f8f0] hover:text-[#13a855] active:scale-95"
                                            }`}
                                            title="Trang sau"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
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
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Detailed specs */}
                            <div className="md:col-span-2 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">Về Trang Trại Chúng Tôi</h3>
                                    <p className={`text-xs sm:text-sm text-gray-600 leading-relaxed font-medium ${descExpanded ? "" : "line-clamp-3"}`}>
                                        {farm.description} Toàn bộ cơ sở vật chất nhà màng, lưới che phủ côn trùng được nhập khẩu trực tiếp từ Israel. Chúng tôi nỗ lực tối đa để mang lại những dòng nông sản có hàm lượng dinh dưỡng nguyên bản, tuyệt đối không lạm dụng chất hóa học tăng trưởng gây hại cho đất và con người.
                                    </p>
                                    <button
                                        onClick={() => setDescExpanded(!descExpanded)}
                                        className="text-[#13a855] hover:text-[#0f8b44] font-black text-[11px] bg-transparent border-none outline-none cursor-pointer"
                                    >
                                        {descExpanded ? "ẩn bớt" : "...xem thêm"}
                                    </button>
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
                                        <span className="text-gray-900 font-extrabold">{formatFollowers(likesCount)}</span>
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
