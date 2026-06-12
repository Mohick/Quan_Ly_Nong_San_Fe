"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  MapPin,
  Award,
  Heart,
  Star,
  Users,
  BadgeCheck,
  TicketPercent,
  Truck,
  Search,
  ShieldAlert,
  Sparkles,
  MessageSquare,
  Plus,
  CheckCircle,
  ExternalLink,
  Landmark,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  Grid,
  List,
} from "lucide-react";
import { getAllFarmAPI } from "@/lib/_api/get_all_farm";
import { productAPI, topFarmProductAPI } from "@/lib/_api/product";
import { lotsAPI } from "@/lib/_api/lots";
import { toggleFollowAPI } from "@/lib/_api/follows";
import { getFarmMetricsAPI } from "@/lib/_api/farm_metrics";
import { getFarmVouchersAPI, saveVoucherAPI } from "@/lib/_api/vouchers";
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
    return formatted.endsWith(".0")
      ? `${formatted.slice(0, -2)}M`
      : `${formatted}M`;
  }
  if (count >= 10_000) {
    const formatted = (count / 1_000).toFixed(1);
    return formatted.endsWith(".0")
      ? `${formatted.slice(0, -2)}K`
      : `${formatted}K`;
  }
  return count.toLocaleString("vi-VN");
};

export default function FarmDetailClient({ id }: { id: string }) {
  const router = useRouter();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [topSaleProducts, setTopSaleProducts] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New states for Metrics and Vouchers
  const [metrics, setMetrics] = useState<any>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [savedVouchers, setSavedVouchers] = useState<Set<string>>(new Set());

  // YouTube states
  const [activeTab, setActiveTab] = useState<"home" | "products" | "about">(
    "home",
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
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
        const farmData = Array.isArray(responseData.data)
          ? responseData.data
          : Array.isArray(responseData)
            ? responseData
            : [];
        const foundFarm = farmData.find((f: any) => (f.id || f.ID) === id);
        if (foundFarm) {
          const rawLocation =
            foundFarm.address || foundFarm.Address || "Việt Nam";
          const mappedFarm: Farm = {
            id: foundFarm.id || foundFarm.ID,
            name:
              foundFarm.farm_name ||
              foundFarm.FarmName ||
              "Nông trại thành viên",
            avatar:
              foundFarm.image_url ||
              foundFarm.ImageURL ||
              "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=150",
            coverImage:
              foundFarm.image_url ||
              foundFarm.ImageURL ||
              "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000",
            location:
              rawLocation.length > 30
                ? `${rawLocation.slice(0, 30)}...`
                : rawLocation,
            specialty: "Nông sản sạch, Rau củ quả",
            experience: "5 năm",
            landArea: "1.2 Hécta",
            rating: 4.9,
            badge: "VietGAP",
            likes: 88,
            description:
              foundFarm.description ||
              foundFarm.Description ||
              "Trang trại của gia đình liên kết sản xuất nông nghiệp sạch chuẩn an toàn vệ sinh thực phẩm.",
          };

          setFarm(mappedFarm);
          setLikesCount(mappedFarm.likes);
        }

        // Fetch Products list
        const productRes = await productAPI();
        const productData = Array.isArray(productRes.data)
          ? productRes.data
          : [];

        // Fetch Top Products for this farm
        try {
          const topRes = await topFarmProductAPI(id);
          const topData = Array.isArray(topRes.data) ? topRes.data : [];
          setTopSaleProducts(topData);
        } catch (e) {
          console.warn("Failed to fetch top farm products", e);
        }

        // Fetch Metrics
        try {
          const metricsRes = await getFarmMetricsAPI(id);
          if (metricsRes?.data) setMetrics(metricsRes.data);
        } catch (e) {
          console.warn("Failed to fetch farm metrics", e);
        }

        // Fetch Vouchers
        try {
          const vouchersRes = await getFarmVouchersAPI(id);
          if (vouchersRes?.data) setVouchers(vouchersRes.data);
        } catch (e) {
          console.warn("Failed to fetch farm vouchers", e);
        }

        // Fetch Crop Lots list for this farm
        const lotsRes = await lotsAPI(id);
        const farmLots = lotsRes.data || [];
        setLots(farmLots);

        // Populate farmName for each product
        const farmResData = farmData.find((f: any) => (f.id || f.ID) === id);
        const currentFarmName = farmResData
          ? farmResData.farm_name ||
            farmResData.FarmName ||
            farmResData.name ||
            farmResData.Name ||
            "Trang trại Thông"
          : "Trang trại Thông";

        const mappedProducts = productData.map((p: any) => {
          // Check if this product belongs to this farm's lots or matches by farm id
          const pFarmId =
            p.cropLot?.farmId || p.cropLot?.farm_id || p.farmId || p.FarmID;
          const farmLotIds = new Set(
            farmLots.map((lot: any) => String(lot.id)),
          );
          const isOurProduct =
            (pFarmId && String(pFarmId) === String(id)) ||
            (p.cropLotId && farmLotIds.has(String(p.cropLotId)));

          if (isOurProduct) {
            return {
              ...p,
              farmName: currentFarmName,
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
      const pFarmId =
        p.cropLot?.farmId || p.cropLot?.farm_id || p.farmId || p.FarmID;
      if (pFarmId && farm.id) {
        return String(pFarmId) === String(farm.id);
      }
      if (p.cropLotId && farmLotIds.has(String(p.cropLotId))) {
        return true;
      }
      const nameKeywords = farm.name
        .split(" ")
        .slice(-2)
        .join(" ")
        .toLowerCase();
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
        sorted.sort(
          (a: any, b: any) =>
            Number(a.salePrice || a.price || 0) -
            Number(b.salePrice || b.price || 0),
        );
        break;
      case "price_desc":
        sorted.sort(
          (a: any, b: any) =>
            Number(b.salePrice || b.price || 0) -
            Number(a.salePrice || a.price || 0),
        );
        break;
      case "bestseller":
        sorted.sort(
          (a: any, b: any) => Number(b.sold || 0) - Number(a.sold || 0),
        );
        break;
      case "newest":
      default:
        break;
    }

    return sorted;
  }, [farmProductsAll, selectedCategory, minPrice, maxPrice, activeSort]);

  // Phân trang sản phẩm: 1 trang 4 cột x 2 hàng = 8 sản phẩm
  const ITEMS_PER_PAGE = 8;
  const totalPages =
    Math.ceil(filteredFarmProducts.length / ITEMS_PER_PAGE) || 1;

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

      const existingIndex = cartItems.findIndex(
        (item: any) => item.id === product.id,
      );
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
          unit: product.unit || "kg",
        });
      }

      localStorage.setItem("local_cart", JSON.stringify(cartItems));
      window.dispatchEvent(new Event("cart-updated"));
      toast.success(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
    }
  };

  const handleSubscribeToggle = async () => {
    try {
      await toggleFollowAPI(id);
      setIsSubscribed(!isSubscribed);
      if (!isSubscribed) {
        setLikesCount((prev) => prev + 1);
        toast.success(
          `Đăng ký theo dõi nhà vườn ${farm?.name} thành công! Bạn sẽ nhận được thông báo khi có nông sản mới.`,
        );
      } else {
        setLikesCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error toggle subscribe:", error);
    }
  };

  const handleSaveVoucher = async (voucherId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
         toast.error("Vui lòng đăng nhập để lưu mã giảm giá!");
         return;
      }
      await saveVoucherAPI(voucherId, token);
      const newSet = new Set(savedVouchers);
      newSet.add(voucherId);
      setSavedVouchers(newSet);
      toast.success("Lưu mã giảm giá thành công!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Đã có lỗi xảy ra hoặc bạn đã lưu mã này rồi.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] text-gray-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#13a855] border-t-transparent"></div>
          <span className="text-xs font-bold text-gray-500">
            Đang tải thông tin nhà vườn...
          </span>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8faf9] p-4 text-gray-800">
        <div className="w-full max-w-sm rounded-3xl border border-gray-200/80 bg-white p-8 text-center shadow-lg">
          <ShieldAlert className="mx-auto mb-3 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-black text-gray-900">
            Không tìm thấy nhà vườn
          </h3>
          <p className="mt-1 mb-5 text-xs text-gray-500">
            Trang trại này không tồn tại hoặc đã tạm dừng hoạt động trên hệ
            thống.
          </p>
          <button
            onClick={() => router.push("/farm")}
            className="w-full cursor-pointer rounded-xl bg-[#13a855] py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0f8b44]"
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
    <div className="min-h-screen bg-[#f8faf9] pb-16 font-sans text-gray-700 selection:bg-[#13a855]/20 selection:text-[#13a855]">
      {/* 1. YouTube-style Top Horizontal Banner Cover */}
      <div className="mx-auto mt-2 w-full max-w-7xl px-0 sm:px-4 md:px-8">
        {/* 1. E-commerce Style Shop Header */}
        <div className="mx-auto mt-4 w-full">
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Cover Image Background */}
            <div className="relative h-32 w-full sm:h-40 md:h-48">
              <img
                src={farm.coverImage}
                alt={farm.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

              {/* Header Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleShare}
                  className="cursor-pointer rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/40"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Shop Info Overlay */}
            <div className="relative flex flex-col items-center gap-4 px-6 pt-0 pb-6 sm:-mt-10 sm:flex-row sm:items-end sm:gap-6">
              {/* Avatar */}
              <div className="relative -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:mt-0 sm:h-28 sm:w-28">
                <img
                  src={farm?.avatar}
                  alt={farm?.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Shop Details */}
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <h1 className="flex items-center justify-center gap-1.5 text-xl font-black text-gray-900 sm:justify-start sm:text-2xl">
                    {farm.name}
                    <BadgeCheck className="h-5 w-5 fill-sky-500 text-sky-500" />
                  </h1>
                  <span className="inline-block rounded border border-[#13a855]/20 bg-[#e8f8f0] px-2 py-0.5 text-[10px] font-black text-[#13a855] uppercase">
                    Mall
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-medium text-gray-600 sm:justify-start">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />{" "}
                    {formatFollowers(metrics?.followers_count ?? likesCount)} Theo dõi
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{" "}
                    {metrics?.average_rating ?? farm.rating} Đánh giá
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" /> Phản hồi chat: {metrics?.chat_response_rate ?? 98}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-2 flex w-full shrink-0 items-center gap-3 sm:mt-0 sm:w-auto">
                <button
                  onClick={handleSubscribeToggle}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-bold shadow-sm transition-all active:scale-95 sm:flex-none ${
                    isSubscribed
                      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      : "bg-[#13a855] text-white hover:bg-[#0f8b44]"
                  }`}
                >
                  {isSubscribed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>{isSubscribed ? "Đang theo dõi" : "Theo dõi"}</span>
                </button>
                <Link 
                  href={`/chat?store_id=${farm.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. YouTube Tabs Navigation Menu */}
      <div className="mx-auto flex max-w-7xl scrollbar-none gap-6 overflow-x-auto border-b border-gray-200 px-4 sm:gap-8 sm:px-6 md:px-8">
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
              className={`flex-shrink-0 cursor-pointer border-b-2 py-3.5 text-sm font-black tracking-wide whitespace-nowrap transition-all ${
                isActive
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
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 md:px-8">
        {/* A. HOME TAB */}
        {activeTab === "home" && (
          <div className="animate-fade-in space-y-8">
            {/* VOUCHERS SECTION */}
            {vouchers.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <TicketPercent className="h-5 w-5 text-red-500" />
                  <h3 className="text-base font-black text-gray-900">
                    Mã giảm giá của Shop
                  </h3>
                </div>
                <div className="flex scrollbar-none gap-4 overflow-x-auto pb-2">
                  {vouchers.map((vc: any) => {
                    const isFreeship = vc.Code?.toLowerCase().includes('freeship') || vc.Type === 'FREESHIP';
                    const isSaved = savedVouchers.has(vc.ID);
                    return (
                      <div key={vc.ID} className={`flex min-w-[260px] overflow-hidden rounded-lg border ${isFreeship ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                        <div className={`relative flex flex-col items-center justify-center border-r border-dashed ${isFreeship ? 'border-green-200 bg-[#13a855]' : 'border-red-200 bg-red-500'} px-4 py-3 text-white`}>
                          {isFreeship ? (
                            <Truck className="mb-1 h-6 w-6" />
                          ) : (
                            <span className="text-lg leading-none font-black">
                              {vc.Type === 'PERCENT' ? `${vc.Value}%` : `${vc.Value / 1000}k`}
                            </span>
                          )}
                          <span className="mt-1 text-[10px] font-bold uppercase">
                            {isFreeship ? 'Freeship' : 'Giảm'}
                          </span>
                          <div className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-white"></div>
                          <div className="absolute -right-1.5 -bottom-1.5 h-3 w-3 rounded-full bg-white"></div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-3">
                          <div>
                            <h4 className="text-sm font-bold text-gray-800">
                              {isFreeship ? 'Miễn phí vận chuyển' : `Giảm ${vc.Type === 'PERCENT' ? vc.Value + '%' : (vc.Value / 1000) + 'k'}`}
                            </h4>
                            <p className="text-[10px] text-gray-500">
                              Đơn Tối Thiểu {(vc.MinOrder / 1000)}k
                            </p>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[9px] text-gray-400">
                              HSD: {new Date(vc.EndDate).toLocaleDateString('vi-VN')}
                            </span>
                            <button 
                              onClick={() => !isSaved && handleSaveVoucher(vc.ID)}
                              className={`rounded px-3 py-1 text-[10px] font-bold text-white transition-colors ${
                                isSaved 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : isFreeship ? 'bg-[#13a855] hover:bg-[#0f8b44]' : 'bg-red-500 hover:bg-red-600'
                              }`}
                            >
                              {isSaved ? "Đã lưu" : "Lưu"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* YouTube Homepage Video Shelves */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black tracking-tight text-gray-900 sm:text-lg">
                  Sản Phẩm Bán Chạy
                </h3>
                <button
                  onClick={() => setActiveTab("products")}
                  className="cursor-pointer text-xs font-black text-gray-500 transition-colors hover:text-gray-800"
                >
                  Xem tất cả
                </button>
              </div>

              {topSaleProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {topSaleProducts.slice(0, 4).map((p: any) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      viewMode="grid"
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              ) : (
                <div className="mx-auto w-full rounded-2xl border border-gray-200/80 bg-white py-10 text-center text-xs text-gray-500 shadow-sm">
                  Hiện chưa có sản phẩm nào lên kệ. Hãy liên hệ với chúng tôi để
                  đặt hàng trước!
                </div>
              )}
            </div>
          </div>
        )}

        {/* B. PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="border-gray-250 border-b pb-4">
              <h3 className="flex items-center gap-1.5 text-base font-black tracking-tight text-gray-900 sm:text-lg">
                <Landmark className="h-5 w-5 text-[#13a855]" />
                <span>
                  Sản Phẩm Đang Canh Tác ({filteredFarmProducts.length})
                </span>
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
                      if (opening) {
                        setLocalMinPrice(minPrice);
                        setLocalMaxPrice(maxPrice);
                      }
                      setActivePriceDropdown(opening);
                    }}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-extrabold transition-all hover:bg-gray-50 ${
                      minPrice || maxPrice
                        ? "border-[#13a855] bg-[#e8f8f0] text-[#13a855]"
                        : "border-gray-250 bg-white text-gray-700"
                    }`}
                  >
                    <span>
                      Mức giá:{" "}
                      {minPrice || maxPrice
                        ? "Đã lọc theo giá"
                        : "Tất cả mức giá"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${activePriceDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Price Popover */}
                  {activePriceDropdown && (
                    <div className="animate-fade-in absolute left-0 z-50 mt-2 w-72 space-y-4 rounded-2xl border border-gray-200 bg-white p-4.5 shadow-xl">
                      <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase">
                        Lọc nhanh theo giá
                      </h4>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { label: "Dưới 50.000đ", min: "", max: "50000" },
                          {
                            label: "Từ 50.000đ - 100.000đ",
                            min: "50000",
                            max: "100000",
                          },
                          { label: "Trên 100.000đ", min: "100000", max: "" },
                        ].map((qp) => {
                          const isQpActive =
                            minPrice === qp.min && maxPrice === qp.max;
                          return (
                            <button
                              key={qp.label}
                              type="button"
                              onClick={() => {
                                setMinPrice(qp.min);
                                setMaxPrice(qp.max);
                                setActivePriceDropdown(false);
                              }}
                              className={`rounded-xl p-2 text-left text-xs font-semibold transition-colors ${isQpActive ? "bg-[#e8f8f0] font-extrabold text-[#13a855]" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                              {qp.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-3 border-t border-gray-100 pt-3.5">
                        <h4 className="text-[10px] font-black tracking-wider text-gray-400 uppercase">
                          Nhập khoảng giá chi tiết
                        </h4>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setMinPrice(localMinPrice);
                            setMaxPrice(localMaxPrice);
                            setActivePriceDropdown(false);
                          }}
                          className="space-y-3.5"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={localMinPrice}
                              onChange={(e) => setLocalMinPrice(e.target.value)}
                              placeholder="Từ (đ)"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:border-[#13a855] focus:outline-none"
                            />
                            <span className="text-gray-300">—</span>
                            <input
                              type="number"
                              value={localMaxPrice}
                              onChange={(e) => setLocalMaxPrice(e.target.value)}
                              placeholder="Đến (đ)"
                              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs focus:border-[#13a855] focus:outline-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setMinPrice("");
                                setMaxPrice("");
                                setLocalMinPrice("");
                                setLocalMaxPrice("");
                                setActivePriceDropdown(false);
                              }}
                              className="border-gray-350 flex-1 rounded-xl border py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
                            >
                              Xóa
                            </button>
                            <button
                              type="submit"
                              className="flex-1 rounded-xl bg-[#13a855] py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0f8b44]"
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
                    onClick={() => {
                      setSelectedCategory("all");
                      setMinPrice("");
                      setMaxPrice("");
                      setActiveSort("newest");
                    }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-red-300 bg-red-50/40 px-4 py-2.5 text-sm font-bold text-red-600 transition-all hover:border-red-400 hover:bg-red-50 active:scale-95"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Xóa bộ lọc</span>
                  </button>
                )}
              </div>

              {/* Sắp xếp + Grid/List toggle */}
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="mb-1 w-full font-bold text-gray-400 sm:mb-0 sm:w-auto">
                    Sắp xếp theo:
                  </span>
                  <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto">
                    {[
                      { id: "newest", label: "Mới nhất" },
                      { id: "bestseller", label: "Bán chạy" },
                      { id: "price_asc", label: "Giá thấp đến cao" },
                      { id: "price_desc", label: "Giá cao đến thấp" },
                    ].map((sort) => {
                      const isSortActive = activeSort === sort.id;
                      return (
                        <button
                          key={sort.id}
                          onClick={() => setActiveSort(sort.id)}
                          className={`flex cursor-pointer items-center gap-1 rounded-lg border px-4 py-2 text-xs font-bold transition-all duration-150 sm:text-sm ${
                            isSortActive
                              ? "border-[#13a855] bg-[#e8f8f0] font-extrabold text-[#13a855] shadow-sm"
                              : "text-gray-550 border-gray-250 bg-white hover:border-gray-400"
                          }`}
                        >
                          {isSortActive && <Check className="h-4 w-4" />}
                          <span>{sort.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grid/List View Toggles */}
                <div className="border-gray-250 flex items-center gap-0.5 self-end rounded-xl border bg-white p-1 shadow-sm sm:self-auto">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`cursor-pointer rounded-lg p-2 transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#e8f8f0] text-[#13a855]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Grid className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`cursor-pointer rounded-lg p-2 transition-colors ${
                      viewMode === "list"
                        ? "bg-[#e8f8f0] text-[#13a855]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Active filter tags */}
              {(() => {
                const tags: { id: string; label: string }[] = [];
                if (selectedCategory !== "all")
                  tags.push({
                    id: "category",
                    label: `Danh mục: ${selectedCategory}`,
                  });
                if (minPrice || maxPrice) {
                  const minStr = minPrice
                    ? new Intl.NumberFormat("vi-VN").format(Number(minPrice)) +
                      "đ"
                    : "0đ";
                  const maxStr = maxPrice
                    ? new Intl.NumberFormat("vi-VN").format(Number(maxPrice)) +
                      "đ"
                    : "Trở lên";
                  tags.push({
                    id: "price",
                    label: `Giá: ${minStr} - ${maxStr}`,
                  });
                }
                if (tags.length === 0) return null;
                return (
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 py-1 pt-3 text-xs">
                    <span className="mr-1.5 font-bold text-gray-400">
                      Đang lọc theo:
                    </span>
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-1.5 rounded-full border border-[#cbeed7] bg-[#e8f8f0] px-3 py-1 font-extrabold text-[#13a855] shadow-sm"
                      >
                        <span>{tag.label}</span>
                        <button
                          onClick={() => {
                            if (tag.id === "category")
                              setSelectedCategory("all");
                            if (tag.id === "price") {
                              setMinPrice("");
                              setMaxPrice("");
                            }
                          }}
                          className="cursor-pointer rounded-full p-0.5 text-[#13a855] transition-colors hover:bg-[#13a855]/20"
                        >
                          <X className="h-3 w-3" />
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
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 gap-6 md:grid-cols-4"
                      : "flex flex-col gap-4"
                  }
                >
                  {paginatedFarmProducts.map((p: any) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      viewMode={viewMode}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Điều khiển phân trang cao cấp */}
                {totalPages >= 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 pb-2 select-none">
                    <button
                      onClick={() =>
                        currentPage > 1 && setCurrentPage(currentPage - 1)
                      }
                      disabled={currentPage === 1}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border p-2 shadow-xs transition-all ${
                        currentPage === 1
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-[#e8f8f0] hover:text-[#13a855] active:scale-95"
                      }`}
                      title="Trang trước"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`flex h-[34px] min-w-[34px] cursor-pointer items-center justify-center rounded-lg border text-xs font-black transition-all ${
                              pageNum === currentPage
                                ? "border-[#13a855] bg-[#13a855] text-white shadow-xs"
                                : "text-gray-750 border-gray-300 bg-white hover:bg-[#e8f8f0] hover:text-[#13a855]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      onClick={() =>
                        currentPage < totalPages &&
                        setCurrentPage(currentPage + 1)
                      }
                      disabled={currentPage === totalPages}
                      className={`flex cursor-pointer items-center justify-center rounded-lg border p-2 shadow-xs transition-all ${
                        currentPage === totalPages
                          ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
                          : "border-gray-300 bg-white text-gray-600 hover:bg-[#e8f8f0] hover:text-[#13a855] active:scale-95"
                      }`}
                      title="Trang sau"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto rounded-3xl border border-gray-200/80 bg-white py-20 text-center text-gray-500 shadow-sm">
                <Landmark className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <h4 className="text-sm font-black text-gray-800 sm:text-base">
                  Nhà vườn chưa đăng tải sản phẩm nào!
                </h4>
                <p className="mt-1 text-[11px] text-gray-400">
                  Vui lòng quay lại sau khi chúng tôi cập nhật thêm các giỏ hàng
                  thu hoạch mới.
                </p>
              </div>
            )}
          </div>
        )}

        {/* D. ABOUT TAB */}
        {activeTab === "about" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Detailed specs */}
              <div className="space-y-6 md:col-span-2">
                <div className="space-y-2">
                  <h3 className="text-base font-black tracking-tight text-gray-900 sm:text-lg">
                    Về Trang Trại Chúng Tôi
                  </h3>
                  <p
                    className={`text-xs leading-relaxed font-medium text-gray-600 sm:text-sm ${descExpanded ? "" : "line-clamp-3"}`}
                  >
                    {farm.description} Toàn bộ cơ sở vật chất nhà màng, lưới che
                    phủ côn trùng được nhập khẩu trực tiếp từ Israel. Chúng tôi
                    nỗ lực tối đa để mang lại những dòng nông sản có hàm lượng
                    dinh dưỡng nguyên bản, tuyệt đối không lạm dụng chất hóa học
                    tăng trưởng gây hại cho đất và con người.
                  </p>
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="cursor-pointer border-none bg-transparent text-[11px] font-black text-[#13a855] outline-none hover:text-[#0f8b44]"
                  >
                    {descExpanded ? "ẩn bớt" : "...xem thêm"}
                  </button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-gray-900 sm:text-sm">
                    Chỉ số Nông nghiệp
                  </h4>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="rounded-2xl border border-gray-200/85 bg-white p-4 shadow-sm">
                      <span className="mb-1 block text-[9px] font-black tracking-wider text-gray-400 uppercase">
                        Mã đối tác
                      </span>
                      <span className="text-xs font-black text-gray-950 uppercase">{`PIONE-FARM-${farm.id}`}</span>
                    </div>
                    <div className="rounded-2xl border border-gray-200/85 bg-white p-4 shadow-sm">
                      <span className="mb-1 block text-[9px] font-black tracking-wider text-gray-400 uppercase">
                        Kinh nghiệm nhà nông
                      </span>
                      <span className="text-xs font-black text-gray-950">
                        {farm.experience}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-gray-200/85 bg-white p-4 shadow-sm">
                      <span className="mb-1 block text-[9px] font-black tracking-wider text-gray-400 uppercase">
                        Quy mô quỹ đất
                      </span>
                      <span className="text-xs font-black text-gray-950">
                        {farm.landArea}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-gray-200/85 bg-white p-4 shadow-sm">
                      <span className="mb-1 block text-[9px] font-black tracking-wider text-gray-400 uppercase">
                        Chứng chỉ đạt được
                      </span>
                      <span className="text-xs font-black text-[#13a855]">
                        {farm.badge}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar stats */}
              <div className="h-fit space-y-4 rounded-2xl border border-gray-200/80 bg-white p-5 text-xs font-bold text-gray-500 shadow-sm">
                <h4 className="border-gray-150 border-b pb-3 text-sm font-black text-gray-900">
                  Thống kê hoạt động
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Đánh giá shop:</span>
                    <span className="flex items-center gap-0.5 font-extrabold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {farm.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lượt thích:</span>
                    <span className="font-extrabold text-gray-900">
                      {formatFollowers(likesCount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vị trí địa lý:</span>
                    <span className="font-extrabold text-gray-900">
                      {farm.location.split(",").slice(-1)[0]}
                    </span>
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
