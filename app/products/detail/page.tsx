"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProductDetailView, { Product } from "@/components/productdetail/page";
import { getProductDetailAPI } from "@/lib/_api/product";
import { FarmAPI } from "@/lib/_api/farm";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(idParam));

  useEffect(() => {
    if (!idParam) return;

    const fetchProduct = async () => {
      try {
        const token = getCookie("access_token");
        // Fetch product and farms together
        const [res, farmRes] = await Promise.all([
          getProductDetailAPI(idParam, token),
          FarmAPI()
        ]);
        const pData = res.data as any;
        if (pData) {
          const farmId = pData.cropLot?.farmId || pData.cropLot?.farm_id || pData.farmId || pData.FarmID;
          const farmList = Array.isArray(farmRes.data) ? farmRes.data : [];
          const matchedFarm = farmList.find((f: any) => String(f.id || f.ID) === String(farmId));
          if (matchedFarm) {
            pData.farmName = matchedFarm.name || matchedFarm.Name || matchedFarm.farm_name || matchedFarm.FarmName;
            pData.farmId = farmId;
            pData.farmAvatar = matchedFarm.avatar || matchedFarm.Avatar || matchedFarm.image_url || matchedFarm.ImageURL || "";
            pData.farmFollowers = matchedFarm.followers || matchedFarm.Followers || Math.floor(Math.random() * 500) + 100;
            pData.farmRating = matchedFarm.rating || matchedFarm.Rating || (Math.random() * 1 + 4).toFixed(1);
          }
        }
        setProduct(pData || null);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [idParam]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <Loader2 className="w-10 h-10 text-[#13a855] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-500 mb-6">Sản phẩm này có thể không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link
          href="/products"
          className="flex items-center gap-2 px-6 py-3 bg-[#13a855] text-white font-bold rounded-lg hover:bg-[#0f8b44] transition-all shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang sản phẩm</span>
        </Link>
      </div>
    );
  }

  return <ProductDetailView key={product.id} product={product} />;
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
          <Loader2 className="w-10 h-10 text-[#13a855] animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Đang tải...</p>
        </div>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}
