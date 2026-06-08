"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Landmark, Layers, Trees, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { FarmAPI } from "@/lib/_api/farm";
import { lotsAPI, updateLotAPI, deleteLotAPI } from "@/lib/_api/lots";
import { createLotAPI } from "@/lib/_api/create_lots";
import { getCareProcessesAPI } from "@/lib/_api/care_process";
import { LotCard } from "@/components/lots/LotCard";
import { LotDetail } from "@/components/lots/LotDetail";
import { LotModal } from "@/components/lots/LotModal";

export interface CropLot {
  farm_id?: string;
  id: string;
  name: string;
  area: number;
  area_unit: string;
  tree_count: number;
  start_date: string;
  expected_harvest_date: string;
  status: "PROCESS" | "HARVESTED";
  note: string;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export default function CropLotsDashboard() {
  const [lots, setLots] = useState<CropLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [farmId, setFarmId] = useState("550e8400-e29b-41d4-a716-446655440000");

  const [selectedLot, setSelectedLot] = useState<CropLot | null>(null);
  const [lotDiaries, setLotDiaries] = useState<Record<string, any[]>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<CropLot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch diaries from backend/localStorage fallback
  useEffect(() => {
    const fetchDiaries = async () => {
      if (selectedLot) {
        const lotId = selectedLot.id || (selectedLot as any).ID;
        if (!lotId) return;
        const token = getCookie("access_token");
        const res = await getCareProcessesAPI(lotId, token);
        if (res && Array.isArray(res.data)) {
          setLotDiaries((prev) => ({
            ...prev,
            [lotId]: res.data,
          }));
        }
      }
    };
    fetchDiaries();
  }, [selectedLot]);

  // Fetch lots from Backend APIs directly
  useEffect(() => {
    const fetchLotsData = async () => {
      try {
        let activeFarmId = "";
        const token = getCookie("access_token");

        // 1. Gọi Backend API lấy thông tin trang trại của user và trích xuất farmId
        try {
          const farmRes = await FarmAPI(token);
          if (farmRes && farmRes.data) {
            const farmData = farmRes.data;
            const id = farmData.id || farmData.ID || "";
            if (id) {
              activeFarmId = id;
              setFarmId(id);
            }
          }
        } catch (e) {
          console.error("Lỗi khi tải thông tin trang trại để lấy farmId:", e);
        }

        // 2. Gọi Backend API lấy danh sách lô đất với farmId
        if (activeFarmId) {
          const res = await lotsAPI(activeFarmId, token);
          const data = Array.isArray(res?.data) ? res.data : [];
          setLots(data);
        } else {
          setLots([]);
        }
      } catch (error) {
        console.error("Error loading crop lots:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLotsData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingLot(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lot: CropLot) => {
    setEditingLot(lot);
    setIsModalOpen(true);
  };

  const handleCreateLot = (newLotPayload: any) => {
    const token = getCookie("access_token");
    createLotAPI(newLotPayload, token)
      .then((response) => {
        if (response.data && response.data.valid === false) {
          showToast("Khởi tạo lô canh tác thất bại: " + (response.data.message || "Lỗi hệ thống"));
          return;
        }
        lotsAPI(farmId, token).then((res) => {
          setLots(Array.isArray(res?.data) ? res.data : []);
        });
        showToast("Đã khởi tạo lô canh tác mới thành công!");
      })
      .catch((error) => {
        console.error("Lỗi khi gửi yêu cầu khởi tạo lô đất canh tác mới:", error);
        const errMsg = error.response?.data?.message || error.message || "Lỗi kết nối Backend";
        alert("Lỗi: " + errMsg);
      });
  };

  const handleUpdateLot = (updatedLot: CropLot) => {
    const token = getCookie("access_token");
    const payload = {
      name: updatedLot.name,
      area: updatedLot.area,
      area_unit: updatedLot.area_unit,
      tree_count: updatedLot.tree_count,
      start_date: updatedLot.start_date,
      expected_harvest_date: updatedLot.expected_harvest_date,
      status: updatedLot.status,
      note: updatedLot.note,
    };

    updateLotAPI(updatedLot.id, payload, token)
      .then((res) => {
        if (res.data && res.data.valid === false) {
          showToast("Cập nhật lô canh tác thất bại: " + (res.data.message || "Lỗi hệ thống"));
          return;
        }
        setLots((prev) => prev.map((l) => (l.id === updatedLot.id ? updatedLot : l)));
        showToast("Cập nhật lô đất canh tác thành công!");
      })
      .catch((error) => {
        console.error("Lỗi khi cập nhật lô đất canh tác:", error);
        const errMsg = error.response?.data?.message || error.message || "Lỗi kết nối Backend";
        alert("Lỗi: " + errMsg);
      });
  };

  const handleDelete = (id: string) => {
    if (confirm("Xóa lô đất canh tác này khỏi nông trại? Tất cả lịch trình liên quan sẽ bị hủy bỏ.")) {
      const token = getCookie("access_token");
      deleteLotAPI(id, token)
        .then((res) => {
          if (res.data && res.data.valid === false) {
            showToast("Xóa lô canh tác thất bại: " + (res.data.message || "Lỗi hệ thống"));
            return;
          }
          setLots((prev) => prev.filter((l) => l.id !== id));
          showToast("Đã xóa lô đất canh tác thành công!");
        })
        .catch((error) => {
          console.error("Lỗi khi xóa lô đất canh tác:", error);
          const errMsg = error.response?.data?.message || error.message || "Lỗi kết nối Backend";
          alert("Lỗi: " + errMsg);
        });
    }
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESS":
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold text-[#13a855] bg-[#e8f8f0] border border-[#cbeed7] rounded-md">
            ĐANG NUÔI TRỒNG
          </span>
        );
      case "HARVESTED":
        return (
          <span className="px-2.5 py-1 text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 rounded-md">
            ĐANG THU HOẠCH
          </span>
        );
      default:
        return null;
    }
  };

  const filteredLots = lots.filter((lot) => {
    const matchesSearch =
      (lot.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.note || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalArea = lots.reduce((sum, l) => sum + (l.area || 0), 0);
  const totalTrees = lots.reduce((sum, l) => sum + (l.tree_count || 0), 0);
  const activeLots = lots.filter((l) => l.status === "PROCESS" || l.status === "HARVESTED").length;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center font-sans p-6 text-center select-none text-gray-800">
        <Loader2 className="w-10 h-10 animate-spin text-[#13a855] mb-4" />
        <p className="text-gray-500 font-bold text-sm">Đang tải dữ liệu lô đất canh tác...</p>
      </div>
    );
  }

  if (selectedLot) {
    return (
      <LotDetail
        selectedLot={selectedLot}
        onBack={() => setSelectedLot(null)}
        farmId={farmId}
        lotDiaries={lotDiaries}
        setLotDiaries={setLotDiaries}
        handleOpenEditModal={handleOpenEditModal}
        showToast={showToast}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800 animate-fade-in select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4.5 py-3 rounded-lg shadow-xl text-sm font-bold border bg-[#e8f8f0] text-[#13a855] border-[#cbeed7] transition-all duration-300 animate-slide-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#13a855]" />
            <span>Quản Lý Lô Đất Canh Tác</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Phân bổ đất trồng, theo dõi tiến độ sinh trưởng và lên lịch dự báo sản lượng thu hoạch.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs sm:text-sm font-bold rounded-lg shadow-md active:scale-97 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Khởi Tạo Lô Canh Tác</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#e8f8f0] text-[#13a855] rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase">Tổng diện tích canh tác</span>
            <span className="text-lg font-black text-gray-800">{totalArea.toLocaleString()} M²</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-lg">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase">Tổng số gốc / Cây trồng</span>
            <span className="text-lg font-black text-gray-800">{totalTrees.toLocaleString()} cây</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase">Lô đất đang hoạt động</span>
            <span className="text-lg font-black text-gray-800">
              {activeLots} / {lots.length} lô
            </span>
          </div>
        </div>
      </div>

      {/* Controls / Filter row */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên lô canh tác hoặc ghi chú..."
            className="w-full bg-[#f4fbf7]/40 border border-[#c2ecd3] rounded-md py-2 px-3 pl-10 text-xs sm:text-sm text-gray-800 placeholder-[#8ca496] focus:outline-none focus:ring-1 focus:ring-[#13a855] focus:border-[#13a855] transition-all"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded-md py-2 px-3 text-xs sm:text-sm text-gray-707 font-bold focus:outline-none focus:border-[#13a855] cursor-pointer shadow-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PROCESS">Đang nuôi trồng (PROCESS)</option>
            <option value="HARVESTED">Đang thu hoạch (HARVESTED)</option>
          </select>
        </div>
      </div>

      {/* Dynamic lots list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLots.length > 0 ? (
          filteredLots.map((lot, index) => (
            <LotCard
              key={lot.id ? `${lot.id}-${index}` : `lot-${index}`}
              lot={lot}
              onDetail={() => setSelectedLot(lot)}
              onEdit={() => handleOpenEditModal(lot)}
              onDelete={() => handleDelete(lot.id)}
              formatDate={formatDate}
              getStatusBadge={getStatusBadge}
            />
          ))
        ) : (
          <div className="col-span-full bg-white border border-gray-200 rounded-2xl py-16 text-center text-gray-400 font-medium">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <span>Không tìm thấy lô đất canh tác nào.</span>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <LotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingLot={editingLot}
        farmId={farmId}
        onCreate={handleCreateLot}
        onUpdate={handleUpdateLot}
      />
    </div>
  );
}
