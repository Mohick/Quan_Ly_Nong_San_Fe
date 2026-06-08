"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, X, Grid, List, Check, RotateCcw } from "lucide-react";
import gsap from "gsap";

interface HeaderProductProps {
  searchVal: string;
  setSearchVal: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedFarmer: string;
  setSelectedFarmer: (val: string) => void;
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
  searchVal,
  setSearchVal,
  selectedCategory,
  setSelectedCategory,
  selectedFarmer,
  setSelectedFarmer,
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
  const [activeDropdown, setActiveDropdown] = useState<"category" | "farmer" | "price" | null>(null);

  // Custom local states for range inputs inside popover
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    setLocalMinPrice(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

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

  // Farmer options list
  const farmers = [
    { value: "dalat", label: "Nhà vườn Đà Lạt" },
    { value: "hcm", label: "Nhà vườn HCM" },
    { value: "mientay", label: "Hợp tác xã Miền Tây" }
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
  if (selectedFarmer !== "all") {
    const farmLabel = farmers.find(f => f.value === selectedFarmer)?.label || selectedFarmer;
    activeTags.push({ id: "farmer", label: `Nhà vườn: ${farmLabel}` });
  }
  if (minPrice || maxPrice) {
    const minStr = minPrice ? new Intl.NumberFormat("vi-VN").format(Number(minPrice)) + "đ" : "0đ";
    const maxStr = maxPrice ? new Intl.NumberFormat("vi-VN").format(Number(maxPrice)) + "đ" : "Trở lên";
    activeTags.push({ id: "price", label: `Giá: ${minStr} - ${maxStr}` });
  }
  if (searchVal) {
    activeTags.push({ id: "search", label: `Tìm kiếm: "${searchVal}"` });
  }

  const removeTag = (id: string) => {
    if (id === "category") setSelectedCategory("all");
    if (id === "farmer") setSelectedFarmer("all");
    if (id === "price") {
      setMinPrice("");
      setMaxPrice("");
    }
    if (id === "search") setSearchVal("");
  };

  const handleResetAll = () => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      setSelectedCategory("all");
      setSelectedFarmer("all");
      setMinPrice("");
      setMaxPrice("");
      setSearchVal("");
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

  return (
    <div 
      ref={containerRef}
      className="w-full bg-[#fcfdfe] rounded-2xl border border-gray-200/80 shadow-sm p-5 font-sans select-none max-w-7xl mx-auto my-6 relative z-30"
    >
      <div className="space-y-4">
        
        {/* TGDD styled Filters Bar Row */}
        <div ref={dropdownRef} className="relative flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          
          {/* TGDD search bar */}
          <div className="relative flex-1 md:max-w-xs">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Tìm tên sản phẩm nông sản..."
              className="w-full bg-gray-50 border border-gray-250 rounded-xl py-2 px-3 pl-9 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#13a855] focus:border-[#13a855] transition-all text-gray-800"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {searchVal && (
              <button 
                onClick={() => setSearchVal("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-650"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter Pills Triggers Flexbox (TGDD layout) */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Category Trigger Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "category" ? null : "category")}
                className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-extrabold transition-all cursor-pointer hover:bg-gray-50 ${
                  selectedCategory !== "all" 
                    ? "border-[#13a855] bg-[#e8f8f0] text-[#13a855]" 
                    : "border-gray-250 text-gray-700 bg-white"
                }`}
              >
                <span>Danh mục: {selectedCategory === "all" ? "Tất cả" : selectedCategory}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "category" ? "rotate-180" : ""}`} />
              </button>

              {/* Category Popover Menu */}
              {activeDropdown === "category" && (
                <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 space-y-3 animate-fade-in">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Chọn danh mục nông sản</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSelectedCategory("all"); setActiveDropdown(null); }}
                      className={`text-left p-2 rounded-xl text-xs font-semibold transition-colors ${selectedCategory === "all" ? "bg-[#e8f8f0] text-[#13a855] font-bold" : "hover:bg-gray-50 text-gray-750"}`}
                    >
                      Tất cả danh mục
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setActiveDropdown(null); }}
                        className={`text-left p-2 rounded-xl text-xs font-semibold transition-colors truncate ${selectedCategory === cat ? "bg-[#e8f8f0] text-[#13a855] font-bold" : "hover:bg-gray-50 text-gray-750"}`}
                        title={cat}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Farmer Trigger Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "farmer" ? null : "farmer")}
                className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-extrabold transition-all cursor-pointer hover:bg-gray-50 ${
                  selectedFarmer !== "all" 
                    ? "border-[#13a855] bg-[#e8f8f0] text-[#13a855]" 
                    : "border-gray-250 text-gray-700 bg-white"
                }`}
              >
                <span>Nhà vườn: {selectedFarmer === "all" ? "Tất cả" : farmers.find(f => f.value === selectedFarmer)?.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "farmer" ? "rotate-180" : ""}`} />
              </button>

              {/* Farmer Popover Menu */}
              {activeDropdown === "farmer" && (
                <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 z-50 space-y-3 animate-fade-in">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Chọn xuất xứ nhà vườn</h4>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => { setSelectedFarmer("all"); setActiveDropdown(null); }}
                      className={`flex justify-between items-center w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-colors ${selectedFarmer === "all" ? "bg-[#e8f8f0] text-[#13a855] font-bold" : "hover:bg-gray-50 text-gray-755"}`}
                    >
                      <span>Tất cả nhà vườn</span>
                      {selectedFarmer === "all" && <Check className="w-3.5 h-3.5 text-[#13a855]" />}
                    </button>
                    {farmers.map((farm) => (
                      <button
                        key={farm.value}
                        onClick={() => { setSelectedFarmer(farm.value); setActiveDropdown(null); }}
                        className={`flex justify-between items-center w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-colors ${selectedFarmer === farm.value ? "bg-[#e8f8f0] text-[#13a855] font-bold" : "hover:bg-gray-50 text-gray-755"}`}
                      >
                        <span>{farm.label}</span>
                        {selectedFarmer === farm.value && <Check className="w-3.5 h-3.5 text-[#13a855]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Range Trigger Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "price" ? null : "price")}
                className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-extrabold transition-all cursor-pointer hover:bg-gray-50 ${
                  minPrice || maxPrice 
                    ? "border-[#13a855] bg-[#e8f8f0] text-[#13a855]" 
                    : "border-gray-250 text-gray-700 bg-white"
                }`}
              >
                <span>Giá: {minPrice || maxPrice ? "Đã lọc mức giá" : "Tất cả mức giá"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === "price" ? "rotate-180" : ""}`} />
              </button>

              {/* Price Range Popover Menu */}
              {activeDropdown === "price" && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl p-4.5 z-50 space-y-4 animate-fade-in">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Lọc nhanh theo giá</h4>
                  
                  {/* Quick price selection tags */}
                  <div className="flex flex-col gap-1.5">
                    {quickPrices.map((qp) => {
                      const isActive = minPrice === qp.min && maxPrice === qp.max;
                      return (
                        <button
                          key={qp.label}
                          type="button"
                          onClick={() => selectQuickPrice(qp.min, qp.max)}
                          className={`text-left text-xs p-2 rounded-xl transition-colors font-semibold ${
                            isActive ? "bg-[#e8f8f0] text-[#13a855] font-extrabold" : "hover:bg-gray-50 text-gray-700"
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
                          className="flex-1 py-2 text-xs font-bold border border-gray-350 hover:bg-gray-50 text-gray-700 rounded-xl transition-all"
                        >
                          Xóa
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 text-xs font-bold bg-[#13a855] text-white rounded-xl hover:bg-[#0f8b44] transition-all shadow-sm"
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
                className="flex items-center gap-1 px-3 py-2 border border-dashed border-red-300 bg-red-50/40 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:border-red-400 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
            )}

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

        {/* TGDD sorting row style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-gray-400 mr-2">Sắp xếp theo:</span>
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
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all duration-150 cursor-pointer border flex items-center gap-1 ${
                    isActive
                      ? "bg-[#e8f8f0] text-[#13a855] border-[#13a855] shadow-sm font-extrabold"
                      : "bg-white text-gray-550 border-gray-250 hover:border-gray-400"
                  }`}
                >
                  {isActive && <Check className="w-3.5 h-3.5" />}
                  <span>{sort.label}</span>
                </button>
              );
            })}
          </div>

          {/* Grid/List View Toggles */}
          <div className="flex items-center bg-white border border-gray-250 rounded-xl p-1 shadow-sm gap-0.5 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#e8f8f0] text-[#13a855]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#e8f8f0] text-[#13a855]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeaderProduct;
