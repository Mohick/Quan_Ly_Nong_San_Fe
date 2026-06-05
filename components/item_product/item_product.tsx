"use client";

import React, { useState } from "react";
import { Star, ShoppingCart, Eye, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface Product {
    id: number;
    name: string;
    category: string;
    cropLotId?: string | null;
    cropLot?: {
        id: string;
        name: string;
        area: number;
        areaUnit: string;
        startDate: string;
        expectedHarvestDate: string;
        status: string;
    } | null;
    rating: number;
    reviewsCount?: number;
    soldQuantity: string;
    originalPrice: number;
    salePrice: number;
    discountPercent: number;
    image: string;
    images?: string[];
    isBestSeller?: boolean;
    unit: string;
}

interface ProductCardProps {
    product: Product;
    viewMode?: "grid" | "list";
}

// Reusable single product card component supporting both grid & list viewmodes
const ProductCard = ({ product, viewMode = "grid" }: ProductCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    if (viewMode === "list") {
        return (
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative flex flex-col sm:flex-row bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden font-sans p-4 gap-4 sm:gap-6"
            >
                {/* Clickable Image Container on Left */}
                <Link
                    href={`/products/detail?id=${product.id}`}
                    className="relative w-full sm:w-48 h-48 sm:h-auto aspect-square sm:aspect-square rounded-md overflow-hidden bg-gray-50/30 flex-shrink-0 block cursor-pointer"
                >
                    {/* Badges */}
                    <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                        {product.isBestSeller && (
                            <span className="px-2 py-0.5 text-[8px] font-extrabold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded shadow-sm tracking-wider uppercase">
                                Bán chạy
                            </span>
                        )}
                        <span className="w-fit px-1.5 py-0.5 text-[8px] font-bold text-white bg-[#13a855] rounded shadow-sm">
                            -{product.discountPercent}%
                        </span>
                    </div>

                    {/* Quick Action Overlay */}
                    <div
                        className={`absolute inset-0 bg-black/25 backdrop-blur-[1px] z-10 flex items-center justify-center gap-2 transition-opacity duration-200 ${
                            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <button className="p-2 bg-white hover:bg-[#e8f8f0] text-gray-800 hover:text-[#13a855] rounded-full shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-2 bg-white hover:bg-red-50 text-gray-800 hover:text-red-500 rounded-full shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer">
                            <Heart className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Product Image */}
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-505"
                    />
                </Link>

                {/* Product Info on Right */}
                <div className="flex flex-col flex-1 justify-between py-1 space-y-2">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#13a855]/90 uppercase tracking-wider">
                            {product.category}
                        </span>

                        {/* Clickable Title */}
                        <Link href={`/products/detail?id=${product.id}`} className="block group/title cursor-pointer">
                            <h3 className="font-bold text-gray-850 text-sm sm:text-base group-hover/title:text-[#13a855] transition-colors leading-snug">
                                {product.name}
                            </h3>
                        </Link>

                        {/* Rating & Sold Volume */}
                        <div className="flex items-center gap-1.5 text-[11px] pt-1">
                            <div className="flex items-center text-amber-500 gap-0.5 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>{product.rating}</span>
                            </div>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500 font-medium">Đã bán {product.soldQuantity}</span>
                        </div>
                    </div>

                    {/* Pricing and Unit */}
                    <div className="flex items-end justify-between pt-2 mt-auto border-t border-gray-50">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 line-through font-medium leading-none">
                                {formatPrice(product.originalPrice)}
                            </span>
                            <span className="text-base sm:text-lg font-extrabold text-[#13a855] leading-tight">
                                {formatPrice(product.salePrice)}
                                <span className="text-[10px] text-gray-400 font-normal"> / {product.unit}</span>
                            </span>
                        </div>

                        {/* Quick Add to Cart Button */}
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#e8f8f0] hover:bg-[#13a855] text-[#13a855] hover:text-white rounded-lg active:scale-95 transition-all duration-200 cursor-pointer shadow-sm text-xs font-bold">
                            <ShoppingCart className="w-4 h-4" />
                            <span>Thêm giỏ hàng</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Grid View
    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden font-sans"
        >
            {/* Clickable Image Container */}
            <Link
                href={`/products/detail?id=${product.id}`}
                className="relative aspect-square w-full overflow-hidden bg-gray-50/30 block cursor-pointer"
            >
                {/* Badges */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                    {product.isBestSeller && (
                        <span className="px-2.5 py-1 text-[9px] font-extrabold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded shadow-sm tracking-wider uppercase">
                            Bán chạy
                        </span>
                    )}
                    <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-[#13a855] rounded shadow-sm">
                        -{product.discountPercent}%
                    </span>
                </div>

                {/* Quick Action Overlay */}
                <div
                    className={`absolute inset-0 bg-black/25 backdrop-blur-[1px] z-10 flex items-center justify-center gap-2.5 transition-opacity duration-200 ${
                        isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                >
                    <button className="p-2.5 bg-white hover:bg-[#e8f8f0] text-gray-800 hover:text-[#13a855] rounded-full shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 bg-white hover:bg-red-50 text-gray-800 hover:text-red-500 rounded-full shadow-md transition-transform duration-200 hover:scale-105 cursor-pointer">
                        <Heart className="w-4 h-4" />
                    </button>
                </div>

                {/* Product Image */}
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-500"
                />
            </Link>

            {/* Product Info */}
            <div className="flex flex-col flex-1 p-4 space-y-2">
                <span className="text-[10px] font-bold text-[#13a855]/90 uppercase tracking-wider">
                    {product.category}
                </span>

                {/* Clickable Title */}
                <Link href={`/products/detail?id=${product.id}`} className="block group/title cursor-pointer">
                    <h3 className="font-bold text-gray-850 text-xs sm:text-sm line-clamp-2 min-h-[36px] sm:min-h-[40px] group-hover/title:text-[#13a855] transition-colors leading-snug">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating & Sold Volume */}
                <div className="flex items-center gap-1.5 text-[11px]">
                    <div className="flex items-center text-amber-500 gap-0.5 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{product.rating}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 font-medium">Đã bán {product.soldQuantity}</span>
                </div>

                {/* Pricing and Unit */}
                <div className="flex items-end justify-between pt-1.5 mt-auto">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 line-through font-medium leading-none">
                            {formatPrice(product.originalPrice)}
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-[#13a855] leading-tight">
                            {formatPrice(product.salePrice)}
                            <span className="text-[10px] text-gray-400 font-normal"> / {product.unit}</span>
                        </span>
                    </div>

                    {/* Quick Add to Cart Button */}
                    <button className="p-2 bg-[#e8f8f0] hover:bg-[#13a855] text-[#13a855] hover:text-white rounded-lg active:scale-95 transition-all duration-200 cursor-pointer shadow-sm">
                        <ShoppingCart className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ItemProductProps {
    products: Product[];
    isLoading: boolean;
    viewMode?: "grid" | "list";
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// Main Container Component with Pagination Controls
const ItemProduct = ({
    products,
    isLoading,
    viewMode = "grid",
    currentPage,
    totalPages,
    onPageChange,
}: ItemProductProps) => {

    // Helper to generate page numbers list
    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-[500px]">
            <div className="flex-grow">
                {isLoading ? (
                    /* Loading Skeleton Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {[1, 2, 3, 4].map((id) => (
                            <div key={id} className="animate-pulse bg-white border border-gray-200 rounded-lg p-5 space-y-4 h-[350px]">
                                <div className="bg-gray-200 aspect-square w-full rounded-md" />
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-6 bg-gray-200 rounded w-5/6" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    /* Loaded Products Display */
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} viewMode="grid" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} viewMode="list" />
                            ))}
                        </div>
                    )
                ) : (
                    /* Empty Fallback State */
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-lg">
                        <p className="text-gray-400 font-medium text-sm">Không tìm thấy sản phẩm nào.</p>
                    </div>
                )}
            </div>

            {/* Premium Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 sm:mt-16 mb-4 select-none font-sans">
                    {/* Previous Page Button */}
                    <button
                        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center justify-center p-2.5 rounded-lg border shadow-sm transition-all duration-200 cursor-pointer ${
                            currentPage === 1
                                ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                                : "bg-white border-gray-300 text-gray-650 hover:bg-[#e8f8f0] hover:text-[#13a855] hover:border-[#13a855]/40 active:scale-95"
                        }`}
                        title="Trang trước"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1.5">
                        {pages.map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`min-w-[40px] h-[40px] flex items-center justify-center rounded-lg border font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                                    pageNum === currentPage
                                        ? "bg-[#13a855] border-[#13a855] text-white shadow-md active:scale-95"
                                        : "bg-white border-gray-300 text-gray-700 hover:bg-[#e8f8f0] hover:text-[#13a855] hover:border-[#13a855]/40 active:scale-95"
                                }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    {/* Next Page Button */}
                    <button
                        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center justify-center p-2.5 rounded-lg border shadow-sm transition-all duration-200 cursor-pointer ${
                            currentPage === totalPages
                                ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
                                : "bg-white border-gray-300 text-gray-650 hover:bg-[#e8f8f0] hover:text-[#13a855] hover:border-[#13a855]/40 active:scale-95"
                        }`}
                        title="Trang sau"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ItemProduct;
