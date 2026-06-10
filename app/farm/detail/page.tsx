"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import FarmDetailClient from "@/components/FarmDetail/page";

function FarmDetailContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  if (!idParam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy nhà vườn</h2>
        <p className="text-gray-500 mb-6">Mã nhà vườn không hợp lệ hoặc bị thiếu.</p>
      </div>
    );
  }

  return <FarmDetailClient id={idParam} />;
}

export default function FarmDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
          <Loader2 className="w-10 h-10 text-[#13a855] animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Đang tải...</p>
        </div>
      }
    >
      <FarmDetailContent />
    </Suspense>
  );
}
