"use client";

import React, { useEffect, useRef } from "react";
import { Search, ChevronDown, Filter, X, Grid, List } from "lucide-react";
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
  const filterRowRef = useRef<HTMLDivElement>(null);
  const tagsRowRef = useRef<HTMLDivElement>(null);
  const sortRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Entrance Animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      containerRef.current,
      { y: -15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45 }
    )
      .fromTo(
        filterRowRef.current ? filterRowRef.current.children : [],
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.03, duration: 0.4 },
        "-=0.2"
      )
      .fromTo(
        tagsRowRef.current,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3 },
        "-=0.1"
      )
      .fromTo(
        sortRowRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3 },
        "-=0.1"
      );
  }, []);

  // Compute active filter tags dynamically based on props
  const activeTags: { id: string; label: string }[] = [];
  if (selectedCategory !== "all") {
    activeTags.push({ id: "category", label: `Danh mục: ${selectedCategory}` });
  }
  if (selectedFarmer !== "all") {
    const farmerLabel =
      selectedFarmer === "dalat"
        ? "Đà Lạt"
        : selectedFarmer === "mientay"
        ? "Miền Tây"
        : "HCM";
    activeTags.push({ id: "farmer", label: `Nhà vườn: ${farmerLabel}` });
  }
  if (minPrice || maxPrice) {
    const minStr = minPrice ? new Intl.NumberFormat("vi-VN").format(Number(minPrice)) + "đ" : "0đ";
    const maxStr = maxPrice ? new Intl.NumberFormat("vi-VN").format(Number(maxPrice)) + "đ" : "Trở lên";
    activeTags.push({ id: "price", label: `Giá: ${minStr} – ${maxStr}` });
  }
  if (searchVal) {
    activeTags.push({ id: "search", label: `Từ khóa: "${searchVal}"` });
  }

  const removeTag = (id: string) => {
    const element = document.getElementById(`tag-${id}`);
    const clearState = () => {
      if (id === "category") setSelectedCategory("all");
      if (id === "farmer") setSelectedFarmer("all");
      if (id === "price") {
        setMinPrice("");
        setMaxPrice("");
      }
      if (id === "search") setSearchVal("");
    };

    if (element) {
      gsap.to(element, {
        scale: 0.9,
        opacity: 0,
        width: 0,
        marginRight: 0,
        padding: 0,
        duration: 0.2,
        onComplete: () => {
          clearState();
        },
      });
    } else {
      clearState();
    }
  };

  const handleFilterClick = () => {
    // GSAP button click effect
    const btn = document.getElementById("filter-submit-btn");
    if (btn) {
      gsap.to(btn, { scale: 0.97, duration: 0.08, yoyo: true, repeat: 1 });
    }
    if (onFilterSubmit) onFilterSubmit();
  };

  const handleResetFilters = () => {
    // GSAP clean fade transition for tags
    const tags = document.querySelectorAll(".filter-tag-pill");
    if (tags.length > 0) {
      gsap.to(tags, {
        scale: 0.95,
        opacity: 0,
        stagger: 0.03,
        duration: 0.15,
        onComplete: () => {
          if (onResetFilters) onResetFilters();
        },
      });
    } else {
      if (onResetFilters) onResetFilters();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden font-sans select-none max-w-7xl mx-auto my-6"
    >
      <div className="p-5 space-y-5">
        
        {/* Input Filters Grid */}
        <div 
          ref={filterRowRef} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
        >
          {/* Search Input */}
          <div className="lg:col-span-3 relative">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Tìm tên sản phẩm..."
              className="w-full bg-[#f4fbf7]/80 border border-[#c2ecd3] rounded-md py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-[#8ca496] focus:outline-none focus:ring-1 focus:ring-[#13a855] focus:border-[#13a855] transition-all"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Category Dropdown - Synchronized with product.json */}
          <div className="lg:col-span-3 relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white border border-gray-300 hover:border-[#13a855]/40 rounded-md py-2.5 px-3 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] appearance-none transition-all cursor-pointer font-bold"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="Trái cây cao cấp">Trái cây cao cấp</option>
              <option value="Đặc sản Đà Lạt">Đặc sản Đà Lạt</option>
              <option value="Trái cây nhiệt đới">Trái cây nhiệt đới</option>
              <option value="Đồ khô đóng gói">Đồ khô đóng gói</option>
              <option value="Rau củ hữu cơ">Rau củ hữu cơ</option>
              <option value="Gia vị & Thảo mộc">Gia vị & Thảo mộc</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Farmer Dropdown */}
          <div className="lg:col-span-3 relative">
            <select
              value={selectedFarmer}
              onChange={(e) => setSelectedFarmer(e.target.value)}
              className="w-full bg-white border border-gray-300 hover:border-[#13a855]/40 rounded-md py-2.5 px-3 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] appearance-none transition-all cursor-pointer font-bold"
            >
              <option value="all">Tất cả nhà vườn</option>
              <option value="dalat">Nhà vườn Đà Lạt</option>
              <option value="hcm">Nhà vườn HCM</option>
              <option value="mientay">Hợp tác xã Miền Tây</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Price Range inputs */}
          <div className="lg:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Giá:</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Từ (đ)"
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
            />
            <span className="text-gray-300">—</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Đến (đ)"
              className="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4.5">
          <button
            id="filter-submit-btn"
            onClick={handleFilterClick}
            className="flex items-center gap-2 px-5.5 py-2.5 bg-[#13a855] hover:bg-[#0f8b44] text-white font-bold rounded-lg active:scale-97 shadow-sm text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span>Lọc</span>
          </button>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-white border border-gray-350 hover:border-gray-400 text-gray-650 hover:text-gray-800 font-bold rounded-lg active:scale-97 text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
          >
            Xóa bộ lọc
          </button>
        </div>

        {/* Active Filters Badges */}
        {activeTags.length > 0 && (
          <div 
            ref={tagsRowRef} 
            className="flex flex-wrap items-center gap-2 text-xs py-0.5"
          >
            <span className="font-bold text-gray-400 mr-1.5">Đang lọc:</span>
            {activeTags.map((tag) => (
              <div
                key={tag.id}
                id={`tag-${tag.id}`}
                className="filter-tag-pill flex items-center gap-1.5 px-3 py-1 bg-[#e8f8f0] text-[#13a855] border border-[#cbeed7] rounded-md font-bold shadow-sm"
              >
                <span>{tag.label}</span>
                <button
                  onClick={() => removeTag(tag.id)}
                  className="hover:bg-[#13a855]/10 p-0.5 rounded-full text-[#13a855] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sort & Grid Layout options */}
        <div 
          ref={sortRowRef} 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1.5 border-t border-gray-100"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-gray-400 mr-2.5">Sắp xếp:</span>
            <button
              onClick={() => setActiveSort("newest")}
              className={`px-4 py-2.5 rounded-md font-bold transition-all duration-150 cursor-pointer ${
                activeSort === "newest"
                  ? "bg-[#e8f8f0] text-[#13a855] border-2 border-[#13a855] scale-102 shadow-sm"
                  : "bg-white text-gray-500 border border-gray-300 hover:border-gray-400"
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setActiveSort("bestseller")}
              className={`px-4 py-2.5 rounded-md font-bold transition-all duration-150 cursor-pointer ${
                activeSort === "bestseller"
                  ? "bg-[#e8f8f0] text-[#13a855] border-2 border-[#13a855] scale-102 shadow-sm"
                  : "bg-white text-gray-500 border border-gray-300 hover:border-gray-400"
              }`}
            >
              Bán chạy
            </button>
            <button
              onClick={() => setActiveSort("price_asc")}
              className={`px-4 py-2.5 rounded-md font-bold transition-all duration-150 cursor-pointer ${
                activeSort === "price_asc"
                  ? "bg-[#e8f8f0] text-[#13a855] border-2 border-[#13a855] scale-102 shadow-sm"
                  : "bg-white text-gray-500 border border-gray-300 hover:border-gray-400"
              }`}
            >
              Giá tăng dần
            </button>
            <button
              onClick={() => setActiveSort("price_desc")}
              className={`px-4 py-2.5 rounded-md font-bold transition-all duration-150 cursor-pointer ${
                activeSort === "price_desc"
                  ? "bg-[#e8f8f0] text-[#13a855] border-2 border-[#13a855] scale-102 shadow-sm"
                  : "bg-white text-gray-500 border border-gray-300 hover:border-gray-400"
              }`}
            >
              Giá giảm dần
            </button>
          </div>

          {/* Grid/List View Toggles */}
          <div className="flex items-center bg-white border border-gray-250 rounded-md p-1 shadow-sm gap-0.5 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[#e8f8f0] text-[#13a855]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
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
