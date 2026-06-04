"use client";

import HeaderProduct from "@/components/header_product/heder_product";
import ItemProduct, { Product } from "@/components/item_product/item_product";
import { productAPI } from "@/lib/_api/product";
import { useEffect, useState } from "react";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter, sort, view and pagination states
  const [searchVal, setSearchVal] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFarmer, setSelectedFarmer] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeSort, setActiveSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Fetch products on load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = getCookie("access_token");
        const res = await productAPI(token);
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(data);
        console.log("Danh sách sản phẩm:", data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchVal("");
    setSelectedCategory("all");
    setSelectedFarmer("all");
    setMinPrice("");
    setMaxPrice("");
  };

  // Reset to page 1 if any filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchVal, selectedCategory, selectedFarmer, minPrice, maxPrice, activeSort]);

  // Helper function to check if a product belongs to a specific region/farmer choice
  const matchesFarmer = (product: Product, farmerOption: string) => {
    if (farmerOption === "all") return true;
    
    const nameLower = product.name.toLowerCase();
    const categoryLower = product.category.toLowerCase();
    
    const isDalat = 
      nameLower.includes("đà lạt") || 
      nameLower.includes("cầu đất") || 
      categoryLower.includes("đà lạt");
      
    const isMienTay = 
      nameLower.includes("miền tây") || 
      nameLower.includes("bến tre") || 
      nameLower.includes("u minh") ||
      nameLower.includes("huế");

    if (farmerOption === "dalat") {
      return isDalat;
    }
    if (farmerOption === "mientay") {
      return isMienTay;
    }
    if (farmerOption === "hcm") {
      return !isDalat && !isMienTay;
    }
    return true;
  };

  // 1. Filter and sort entire products array first
  const filteredProducts = products
    .filter((product) => {
      // Search term match
      if (searchVal) {
        const query = searchVal.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category match
      if (selectedCategory !== "all") {
        if (product.category !== selectedCategory) return false;
      }

      // Farmer / Region match
      if (!matchesFarmer(product, selectedFarmer)) return false;

      // Min Price match
      if (minPrice) {
        const minVal = Number(minPrice);
        if (!isNaN(minVal) && product.salePrice < minVal) return false;
      }

      // Max Price match
      if (maxPrice) {
        const maxVal = Number(maxPrice);
        if (!isNaN(maxVal) && product.salePrice > maxVal) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (activeSort === "newest") {
        return b.id - a.id;
      }
      if (activeSort === "bestseller") {
        const aBest = a.isBestSeller ? 1 : 0;
        const bBest = b.isBestSeller ? 1 : 0;
        if (bBest !== aBest) return bBest - aBest;
        return b.rating - a.rating;
      }
      if (activeSort === "price_asc") {
        return a.salePrice - b.salePrice;
      }
      if (activeSort === "price_desc") {
        return b.salePrice - a.salePrice;
      }
      return 0;
    });

  // 2. Paginate products
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full bg-gray-50/30 min-h-screen">
      <HeaderProduct
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedFarmer={selectedFarmer}
        setSelectedFarmer={setSelectedFarmer}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        activeSort={activeSort}
        setActiveSort={setActiveSort}
        viewMode={viewMode}
        setViewMode={setViewMode}
        productCount={filteredProducts.length}
        onResetFilters={handleResetFilters}
      />
      <ItemProduct
        products={paginatedProducts}
        isLoading={isLoading}
        viewMode={viewMode}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
