"use client";

import Banner from "@/components/banner/banner";
import TopFarmer from "@/components/top_fammer/top_farmer";
import TopSale from "@/components/top_sale/top_sale";
import { Loading } from "@/utils/loading/loading";
import HeaderProduct from "@/components/header_product/heder_product";
import ItemProduct, { Product } from "@/components/item_product/item_product";
import { getProductListAPI } from "@/lib/_api/product";
import { FarmAPI } from "@/lib/_api/farm";
import { useEffect, useState } from "react";
import "./globals.css";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeSort, setActiveSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
            return { ...p, farmName: matchedFarm.name || matchedFarm.Name || matchedFarm.farm_name || matchedFarm.FarmName };
          }
          return p;
        });
        setProducts(mappedProducts);
        setTotalPages(res.totalPages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage]);

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, minPrice, maxPrice, activeSort]);

  const filteredProducts = products
    .filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (minPrice && !isNaN(Number(minPrice)) && p.salePrice < Number(minPrice)) return false;
      if (maxPrice && !isNaN(Number(maxPrice)) && p.salePrice > Number(maxPrice)) return false;
      return true;
    })
    .sort((a, b) => {
      if (activeSort === "price_asc") return a.salePrice - b.salePrice;
      if (activeSort === "price_desc") return b.salePrice - a.salePrice;
      if (activeSort === "bestseller") return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      return b.id - a.id;
    });

  return (
    <div>
      <Banner />
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
        onResetFilters={() => { setSelectedCategory("all"); setMinPrice(""); setMaxPrice(""); }}
      />
      <ItemProduct
        products={filteredProducts}
        isLoading={isLoading}
        viewMode={viewMode}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <TopSale />
      <TopFarmer />
      <Loading />
    </div>
  );
}
