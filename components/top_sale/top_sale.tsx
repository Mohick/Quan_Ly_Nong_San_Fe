"use client";

import React, { useEffect, useState, useRef } from "react";
import { Star, ShoppingCart, Eye, Heart, Sparkles } from "lucide-react";
import { productAPI } from "@/lib/_api/product";
import Link from "next/link";

const TopSale = () => {
    const [topSaleProducts, setTopSaleProducts] = useState<any[]>([]);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const sectionRef = useRef<HTMLDivElement>(null);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productAPI();
                const data = Array.isArray(res.data) ? res.data : [];
                setTopSaleProducts(data.slice(0, 8));
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProduct();
    }, []);



    return (
        <section ref={sectionRef} className="w-full py-12 bg-white font-sans min-h-[600px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 border-b border-gray-100 pb-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[#13a855] text-xs sm:text-sm font-bold uppercase tracking-widest">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span>Sản phẩm hot nhất</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a5c36] tracking-tight">
                            Top Bán Chạy Nhất Tuần
                        </h2>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 self-start sm:self-auto">
                        Số liệu cập nhật thời gian thực
                    </span>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {topSaleProducts.map((product) => {
                        const isHovered = hoveredCard === product.id;
                        return (
                            <div
                                key={product.id}
                                onMouseEnter={() => setHoveredCard(product.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#13a855]/20 transition-all duration-300 overflow-hidden p-2 sm:p-3"
                            >
                                {/* Image Container */}
                                <Link href={`/products/detail?id=${product.id}`} className="relative aspect-square w-full overflow-hidden bg-gray-50 block cursor-pointer rounded-xl">
                                    {/* Badges */}
                                    <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5">
                                        {product.isBestSeller && (
                                            <span className="px-2.5 py-1 text-[10px] font-extrabold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-md shadow-sm tracking-wider uppercase">
                                                Bán chạy
                                            </span>
                                        )}
                                        {product.discountPercent > 0 && (
                                            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#13a855] rounded-md shadow-sm">
                                                -{product.discountPercent}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Quick Action Overlay (Fade in on hover) */}
                                    <div className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] z-10 flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                                        }`}>
                                        <button className="p-3 bg-white hover:bg-[#e8f8f0] text-gray-800 hover:text-[#13a855] rounded-full shadow-lg transition-transform duration-200 hover:scale-110 cursor-pointer">
                                            <Eye className="w-4.5 h-4.5" />
                                        </button>
                                        <button className="p-3 bg-white hover:bg-red-50 text-gray-800 hover:text-red-500 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 cursor-pointer">
                                            <Heart className="w-4.5 h-4.5" />
                                        </button>
                                    </div>

                                    {/* Product Image */}
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </Link>

                                {/* Product Info */}
                                <div className="flex flex-col flex-1 pt-3 pb-1 px-1 sm:pt-4 sm:pb-2 sm:px-2 space-y-2.5">
                                    <span className="text-[11px] font-bold text-[#13a855]/80 uppercase tracking-wider">
                                        {product.category}
                                    </span>

                                    <Link href={`/products/detail?id=${product.id}`} className="block group/title cursor-pointer">
                                        <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2 min-h-[40px] sm:min-h-[48px] group-hover/title:text-[#13a855] transition-colors leading-snug">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    {/* Rating & Sold Volume */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="flex items-center text-amber-500 gap-0.5 font-bold">
                                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                            <span>{product.rating}</span>
                                        </div>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-gray-500 font-medium">Đã bán {product.soldQuantity}</span>
                                    </div>

                                    {/* Pricing and Unit */}
                                    <div className="flex items-end justify-between pt-2 mt-auto">
                                        <div className="flex flex-col">
                                            {product.discountPercent > 0 && (
                                                <span className="text-xs text-gray-400 line-through font-medium leading-none">
                                                    {formatPrice(product.originalPrice)}
                                                </span>
                                            )}
                                            <span className="text-base sm:text-lg font-black text-[#13a855] leading-tight">
                                                {formatPrice(product.salePrice)}
                                                <span className="text-xs text-gray-400 font-normal"> / {product.unit}</span>
                                            </span>
                                        </div>

                                        {/* Quick Add to Cart Button */}
                                        <button className="p-2.5 bg-[#e8f8f0] hover:bg-[#13a855] text-[#13a855] hover:text-white rounded-xl active:scale-95 transition-all duration-200 cursor-pointer shadow-sm">
                                            <ShoppingCart className="w-5 h-5" />
                                        </button>
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

export default TopSale;
