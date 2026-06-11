"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, X, Grid, List, Check, RotateCcw } from "lucide-react";
import gsap from "gsap";

interface HeaderProductProps {
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  activeSort: string;
  setActiveSort: (val: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  productCount?: number;
  onFilterSubmit?: () => void;
  onResetFilters?: () => void;
}

const HeaderProduct = ({
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  activeSort,
  setActiveSort,
  viewMode,
  setViewMode,
  productCount = 0,
  onFilterSubmit,
  onResetFilters,
}: HeaderProductProps) => {
  // GSAP animation refs
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // States to manage popover dropdowns (similar to TGDD overlay triggers)
  const [activeDropdown, setActiveDropdown] = useState<"category" | "price" | null>(null);

  // Custom local states for range inputs inside popover
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    // Entrance animations
    gsap.fromTo(
      containerRef.current,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
    );
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Category options list
  const categories = [
    "Trái cây cao cấp",
    "Đặc sản Đà Lạt",
    "Trái cây nhiệt đới",
    "Đồ khô đóng gói",
    "Rau củ hữu cơ",
    "Gia vị & Thảo mộc"
  ];

  // Price selections
  const quickPrices = [
    { label: "Dưới 50.000đ", min: "", max: "50000" },
    { label: "Từ 50.000đ - 100.000đ", min: "50000", max: "100000" },
    { label: "Trên 100.000đ", min: "100000", max: "" }
  ];

  // Compute active filter tags dynamically based on props
  const activeTags: { id: string; label: string }[] = [];
  if (selectedCategory !== "all") {
    activeTags.push({ id: "category", label: `Danh mục: ${selectedCategory}` });
  }
  if (minPrice || maxPrice) {
    const minStr = minPrice ? new Intl.NumberFormat("vi-VN").format(Number(minPrice)) + "đ" : "0đ";
    const maxStr = maxPrice ? new Intl.NumberFormat("vi-VN").format(Number(maxPrice)) + "đ" : "Trở lên";
    activeTags.push({ id: "price", label: `Giá: ${minStr} - ${maxStr}` });
  }
  const removeTag = (id: string) => {
    if (id === "category") setSelectedCategory("all");
    if (id === "price") {
      setMinPrice("");
      setMaxPrice("");
    }
  };

  const handleResetAll = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      setSelectedCategory("all");
      setMinPrice("");
      setMaxPrice("");
    }
    setActiveDropdown(null);
  };

  const handleCustomPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMinPrice(localMinPrice);
    setMaxPrice(localMaxPrice);
    setActiveDropdown(null);
  };

  const selectQuickPrice = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    setActiveDropdown(null);
  };

  const togglePriceDropdown = () => {
    const isOpening = activeDropdown !== "price";
    if (isOpening) {
      setLocalMinPrice(minPrice);
      setLocalMaxPrice(maxPrice);
    }
    setActiveDropdown(isOpening ? "price" : null);
  };

  return (
    <div
      ref={containerRef}
      className="relative z-30 mx-auto mt-3 mb-0 w-full max-w-7xl select-none bg-transparent px-3 sm:px-6 lg:px-8 py-1 font-sans"
    >
      <div className="space-y-3">

        <div ref={dropdownRef} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* Price Range Trigger Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={togglePriceDropdown}
                className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-sm font-extrabold transition-all cursor-pointer hover:bg-gray-50 ${minPrice || maxPrice
                  ? "border-[#13a855] bg-[#e8f8f0] text-[#13a855]"
                  : "border-gray-250 text-gray-700 bg-white"
                  }`}
              >
                <span>Mức giá: {minPrice || maxPrice ? "Đã lọc theo giá" : "Tất cả mức giá"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === "price" ? "rotate-180" : ""}`} />
              </button>

              {/* Price Range Popover Menu */}
              {activeDropdown === "price" && (
                <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4.5 z-50 space-y-4 animate-fade-in">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Lọc nhanh theo giá</h4>

                  <div className="flex flex-col gap-1.5">
                    {quickPrices.map((qp) => {
                      const isActive = minPrice === qp.min && maxPrice === qp.max;
                      return (
                        <button
                          key={qp.label}
                          type="button"
                          onClick={() => selectQuickPrice(qp.min, qp.max)}
                          className={`text-left text-xs p-2 rounded-xl transition-colors font-semibold ${isActive ? "bg-[#e8f8f0] text-[#13a855] font-extrabold" : "hover:bg-gray-50 text-gray-700"
                            }`}
                        >
                          {qp.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-100 pt-3.5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Nhập khoảng giá chi tiết</h4>
                    <form onSubmit={handleCustomPriceSubmit} className="space-y-3.5">
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
                          onClick={() => { setMinPrice(""); setMaxPrice(""); setLocalMinPrice(""); setLocalMaxPrice(""); setActiveDropdown(null); }}
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

            {/* Quick reset button */}
            {activeTags.length > 0 && (
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1.5 px-4 py-2.5 border border-dashed border-red-300 bg-red-50/40 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-400 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>

          {/* TGDD sorting row style */}
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
                  const isActive = activeSort === sort.id;
                  return (
                    <button
                      key={sort.id}
                      onClick={() => setActiveSort(sort.id)}
                      className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer border flex items-center gap-1 ${isActive
                        ? "bg-[#e8f8f0] text-[#13a855] border-[#13a855] shadow-sm font-extrabold"
                        : "bg-white text-gray-550 border-gray-250 hover:border-gray-400"
                        }`}
                    >
                      {isActive && <Check className="w-4 h-4" />}
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
        </div>

        {/* Dynamic active filter tag badges underneath (TGDD style) */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs py-1 border-t border-gray-100 pt-3">
            <span className="font-bold text-gray-400 mr-1.5">Đang lọc theo:</span>
            {activeTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#e8f8f0] text-[#13a855] border border-[#cbeed7] rounded-full font-extrabold shadow-sm"
              >
                <span>{tag.label}</span>
                <button
                  onClick={() => removeTag(tag.id)}
                  className="hover:bg-[#13a855]/20 p-0.5 rounded-full text-[#13a855] transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default HeaderProduct;
