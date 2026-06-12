"use client";

import HeaderProduct from "@/components/header_product/heder_product";
import ItemProduct, { Product } from "@/components/item_product/item_product";
import { getProductListAPI } from "@/lib/_api/product";
import { FarmAPI } from "@/lib/_api/farm";
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeSort, setActiveSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Pagination (client-side: 4 cột x 2 hàng = 8 sản phẩm/trang)
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products on load and page change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const token = getCookie("access_token");
        const [res, farmRes] = await Promise.all([
          getProductListAPI(currentPage, token),
          FarmAPI()
        ]);
        const farmList = Array.isArray(farmRes.data) ? farmRes.data : [];
        const mappedProducts = (res.data || []).map((p: any) => {
          const farmId = p.cropLot?.farmId || p.cropLot?.farm_id || p.farmId || p.FarmID;
          const matchedFarm = farmList.find((f: any) => (f.id || f.ID) === farmId);
          if (matchedFarm) {
            return {
              ...p,
              farmName: matchedFarm.name || matchedFarm.Name || matchedFarm.farm_name || matchedFarm.FarmName
            };
          }
          return p;
        });
        setProducts(mappedProducts);
        console.log("Danh sách sản phẩm trang", currentPage, ":", mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage]);

  // Reset filters handler
  const handleResetFilters = () => {
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
  };

  // Reset to page 1 if any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, minPrice, maxPrice, activeSort]);

  // 1. Filter and sort entire products array first
  const filteredProducts = products
    .filter((product) => {
      // Category match
      if (selectedCategory !== "all") {
        if (product.category !== selectedCategory) return false;
      }

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

  // 2. Client-side pagination: 4 cột x 2 hàng = 8 sản phẩm mỗi trang
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full bg-gray-50/30 min-h-screen">
      <HeaderProduct
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
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
