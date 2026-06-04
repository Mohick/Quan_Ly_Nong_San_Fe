"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Search, Edit2, Trash2, Landmark,
  Calendar, Layers, Trees, CheckCircle2,
  Clock, AlertCircle, X, ChevronRight, Sparkles, Loader2
} from "lucide-react";
import { FarmAPI } from "@/lib/_api/farm";
import { lotsAPI } from "@/lib/_api/lots";
import { createLotAPI } from "@/lib/_api/create_lots";

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

  // State for Crop Lot Detail UI as requested by user
  const [selectedLot, setSelectedLot] = useState<CropLot | null>(null);
  const [detailTab, setDetailTab] = useState<"tt" | "sp">("tt");
  const [lotDiaries, setLotDiaries] = useState<Record<string, { id: number; month: string; description: string }[]>>({
    // Pre-populate some crop lot diaries for dynamic presentation
    "1": [
      { id: 1, month: "Tháng 1", description: "Cày bừa, cấy hạt giống rau ăn lá đợt đầu. Sử dụng phân bón hữu cơ sinh học." },
      { id: 2, month: "Tháng 2", description: "Cây con cao khoảng 5-7cm, hệ thống tưới tự động ổn định, chưa phát hiện sâu bệnh gây hại." }
    ]
  });
  const [showAddDiary, setShowAddDiary] = useState(false);
  const [newDiaryMonth, setNewDiaryMonth] = useState("");
  const [newDiaryDesc, setNewDiaryDesc] = useState("");

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

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<CropLot | null>(null);

  // Form states matching JSON schema fields
  const [formName, setFormName] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formAreaUnit, setFormAreaUnit] = useState("M2");
  const [formTreeCount, setFormTreeCount] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formHarvestDate, setFormHarvestDate] = useState("");
  const [formStatus, setFormStatus] = useState<"PROCESS" | "HARVESTED">("PROCESS");
  const [formNote, setFormNote] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingLot(null);
    setFormName("");
    setFormArea("");
    setFormAreaUnit("M2");
    setFormTreeCount("");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormHarvestDate("");
    setFormStatus("PROCESS");
    setFormNote("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lot: CropLot) => {
    setEditingLot(lot);
    setFormName(lot.name);
    setFormArea(lot.area.toString());
    setFormAreaUnit(lot.area_unit);
    setFormTreeCount(lot.tree_count.toString());
    setFormStartDate(lot.start_date.split("T")[0]);
    setFormHarvestDate(lot.expected_harvest_date.split("T")[0]);
    setFormStatus(lot.status);
    setFormNote(lot.note);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formArea || !formTreeCount || !formStartDate || !formHarvestDate) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    const areaNum = Number(formArea);
    const treeNum = Number(formTreeCount);

    if (editingLot) {
      // Update
      setLots((prev) =>
        prev.map((l) =>
          l.id === editingLot.id
            ? {
              ...l,
              name: formName,
              area: areaNum,
              area_unit: formAreaUnit,
              tree_count: treeNum,
              start_date: new Date(formStartDate).toISOString(),
              expected_harvest_date: new Date(formHarvestDate).toISOString(),
              status: formStatus,
              note: formNote,
            }
            : l
        )
      );
      showToast("Cập nhật lô đất canh tác thành công!");
    } else {
      // Create new lot using the exact JSON fields schema
      const newLotPayload = {
        name: formName,
        area: areaNum,
        area_unit: formAreaUnit,
        tree_count: treeNum,
        start_date: new Date(formStartDate).toISOString().split(".")[0] + "Z",
        expected_harvest_date: new Date(formHarvestDate).toISOString().split(".")[0] + "Z",
        status: formStatus,
        note: formNote,
      };

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
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Xóa lô đất canh tác này khỏi nông trại? Tất cả lịch trình liên quan sẽ bị hủy bỏ.")) {
      setLots((prev) => prev.filter((l) => l.id !== id));
      showToast("Đã xóa lô đất canh tác thành công!");
    }
  };

  // Helper: Format Dates to vi-VN
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("vi-VN", {
      year: "numeric", month: "short", day: "numeric"
    });
  };

  // Helper: Status label and badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PROCESS":
        return <span className="px-2.5 py-1 text-[10px] font-extrabold text-[#13a855] bg-[#e8f8f0] border border-[#cbeed7] rounded-md">ĐANG NUÔI TRỒNG</span>;
      case "HARVESTED":
        return <span className="px-2.5 py-1 text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 rounded-md">ĐANG THU HOẠCH</span>;
      default:
        return null;
    }
  };

  // Filter lots
  const filteredLots = lots.filter((lot) => {
    const matchesSearch = (lot.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || (lot.note || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lot.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalArea = lots.reduce((sum, l) => sum + (l.area || 0), 0);
  const totalTrees = lots.reduce((sum, l) => sum + (l.tree_count || 0), 0);
  const activeLots = lots.filter(l => l.status === "PROCESS" || l.status === "HARVESTED").length;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center font-sans p-6 text-center select-none text-gray-800">
        <Loader2 className="w-10 h-10 animate-spin text-[#13a855] mb-4" />
        <p className="text-gray-500 font-bold text-sm">Đang tải dữ liệu lô đất canh tác...</p>
      </div>
    );
  }

  if (selectedLot) {
    const currentDiaries = lotDiaries[selectedLot.id] || [];

    return (
      <div className="space-y-6 font-sans antialiased text-gray-800 animate-fade-in select-none">
        {/* Back header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-150/60 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedLot(null)}
              className="p-2 text-gray-500 hover:text-gray-900 bg-gray-150/80 hover:bg-gray-200 rounded-lg cursor-pointer transition-all flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
                Chi tiết Lô: {selectedLot.name}
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 font-semibold mt-0.5">
                Mã lô: #{selectedLot.id} | Nông trại: {farmId}
              </p>
            </div>
          </div>

          {/* Sub tabs: tt (Thông tin) and sp (Nhật ký) */}
          <div className="flex bg-gray-150/60 p-1 rounded-xl w-fit border border-gray-250/60">
            <button
              type="button"
              onClick={() => setDetailTab("tt")}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                detailTab === "tt"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Thông Tin (TT)
            </button>
            <button
              type="button"
              onClick={() => setDetailTab("sp")}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                detailTab === "sp"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-555 hover:text-gray-900"
              }`}
            >
              Nhật Ký (SP)
            </button>
          </div>
        </div>

        {detailTab === "tt" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Info grid */}
            <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Thông tin chi tiết</h3>
              
              <div className="grid grid-cols-2 gap-6 text-xs font-bold text-gray-500">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase block">Diện tích canh tác</span>
                  <span className="text-gray-800 text-sm font-extrabold">{(selectedLot.area ?? 0).toLocaleString()} {selectedLot.area_unit || "M2"}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase block">Quy mô gieo trồng</span>
                  <span className="text-gray-800 text-sm font-extrabold">{(selectedLot.tree_count ?? 0).toLocaleString()} gốc cây</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase block">Ngày gieo hạt</span>
                  <span className="text-gray-800 text-sm font-extrabold">{formatDate(selectedLot.start_date)}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase block">Dự kiến thu hoạch</span>
                  <span className="text-gray-800 text-sm font-extrabold">{formatDate(selectedLot.expected_harvest_date)}</span>
                </div>
              </div>

              {selectedLot.note && (
                <div className="space-y-1.5 pt-4 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase block">Ghi chú kỹ thuật</span>
                  <p className="text-xs text-gray-655 font-medium leading-relaxed bg-[#f4fbf7]/40 border border-[#e8f8f0] p-3 rounded-xl italic">
                    {selectedLot.note}
                  </p>
                </div>
              )}
            </div>

            {/* Status card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">Trạng thái</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedLot.status)}
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-semibold">
                  {selectedLot.status === "PROCESS" 
                    ? "Lô đất hiện đang được nuôi trồng tích cực. Hãy theo dõi độ ẩm đất và chu kỳ tưới tiêu."
                    : "Lô đất đã thu hoạch thành công vụ mùa. Hãy tiến hành cải tạo lại đất cho chu kỳ mới."}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleOpenEditModal(selectedLot)}
                  className="w-full py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Chỉnh sửa thông số lô
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-extrabold text-gray-800">Nhật ký sinh trưởng hàng tháng</h4>
              <button
                type="button"
                onClick={() => setShowAddDiary(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#13a855] hover:bg-[#0f8b44] text-white text-[11px] font-bold rounded-lg shadow transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo nhật ký</span>
              </button>
            </div>

            {showAddDiary && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newDiaryMonth || !newDiaryDesc) return;
                  const newDiary = {
                    id: Date.now(),
                    month: newDiaryMonth,
                    description: newDiaryDesc
                  };
                  setLotDiaries({
                    ...lotDiaries,
                    [selectedLot.id]: [newDiary, ...currentDiaries]
                  });
                  setNewDiaryMonth("");
                  setNewDiaryDesc("");
                  setShowAddDiary(false);
                }} 
                className="bg-gray-55 p-4 rounded-xl border border-gray-250/60 space-y-4 animate-slide-in"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs font-extrabold text-gray-800">Thêm nhật ký tháng mới</span>
                  <button 
                    type="button" 
                    onClick={() => setShowAddDiary(false)}
                    className="text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Thời gian (Tháng) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={newDiaryMonth}
                      onChange={(e) => setNewDiaryMonth(e.target.value)}
                      placeholder="Ví dụ: Tháng 1, Tháng 2..."
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Nội dung nhật ký (Description) <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      value={newDiaryDesc}
                      onChange={(e) => setNewDiaryDesc(e.target.value)}
                      placeholder="Nhập chi tiết các hoạt động, bón phân, tưới tiêu trong tháng..."
                      rows={4}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Lưu nhật ký
                  </button>
                </div>
              </form>
            )}

            {currentDiaries.length === 0 ? (
              <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl text-gray-400 font-semibold text-xs">
                Chưa có nhật ký nào được ghi nhận cho lô canh tác này.
              </div>
            ) : (
              <div className="space-y-3">
                {currentDiaries.map((diary) => (
                  <div key={diary.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow relative group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                        📅 {diary.month}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setLotDiaries({
                            ...lotDiaries,
                            [selectedLot.id]: currentDiaries.filter(d => d.id !== diary.id)
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-750 text-[10px] font-bold cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold leading-relaxed">{diary.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
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
            <span className="text-lg font-black text-gray-800">{activeLots} / {lots.length} lô</span>
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
            <div
              key={lot.id ? `${lot.id}-${index}` : `lot-${index}`}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                {/* Header: Title and Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-gray-850 text-sm sm:text-base leading-tight mb-1 hover:text-[#13a855] transition-colors">
                      {lot.name}
                    </h3>
                    <span className="block text-[10px] text-gray-400">Mã Lô: #{lot.id}</span>
                  </div>
                  {getStatusBadge(lot.status)}
                </div>

                {/* Specs grids */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl text-xs font-bold text-gray-500">
                  <div className="space-y-1">
                    <span className="block text-[10px] text-gray-400 uppercase">Diện tích</span>
                    <span className="block text-gray-750 text-xs sm:text-sm">{(lot.area || 0).toLocaleString()} {lot.area_unit}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] text-gray-400 uppercase">Quy mô</span>
                    <span className="block text-gray-750 text-xs sm:text-sm">{(lot.tree_count || 0).toLocaleString()} gốc cây</span>
                  </div>
                </div>

                {/* Timelines countdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-550">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Ngày gieo: <span className="font-bold text-gray-700">{formatDate(lot.start_date)}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-550">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    <span>Thu hoạch: <span className="font-bold text-gray-700">{formatDate(lot.expected_harvest_date)}</span></span>
                  </div>
                </div>

                {/* Notes */}
                {lot.note && (
                  <p className="text-xs text-gray-500 leading-relaxed bg-[#f4fbf7]/40 border border-[#e8f8f0] p-2.5 rounded-lg italic">
                    Ghi chú: {lot.note}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="bg-gray-50/60 border-t border-gray-150/60 p-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedLot(lot);
                    setDetailTab("tt");
                  }}
                  className="p-2 text-gray-500 hover:text-[#13a855] hover:bg-[#e8f8f0] border border-gray-200 hover:border-[#13a855]/30 rounded-lg cursor-pointer transition-all active:scale-95 text-xs font-bold flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(lot)}
                    className="p-2 text-gray-500 hover:text-[#13a855] hover:bg-[#e8f8f0] border border-[#d3ecd8] hover:border-[#13a855]/30 rounded-lg cursor-pointer transition-all active:scale-95 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(lot.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 rounded-lg cursor-pointer transition-all active:scale-95 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white border border-gray-200 rounded-2xl py-16 text-center text-gray-400 font-medium">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <span>Không tìm thấy lô đất canh tác nào.</span>
          </div>
        )}
      </div>

      {/* Premium Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[4px] transition-all animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform scale-100 animate-zoom-in">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#fbfdfc] to-[#f4fbf7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#e8f8f0] text-[#13a855] rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
                    {editingLot ? "Cập Nhật Lô Đất Canh Tác" : "Thiết Lập Lô Canh Tác Mới"}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
                    Cấu hình chi tiết diện tích, số cây và lịch trình gieo trồng.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* farm_id display */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ID Trang trại liên kết</label>
                <input
                  type="text"
                  readOnly
                  value={farmId}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-500 cursor-not-allowed font-mono tracking-tight font-medium"
                />
              </div>

              {/* name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Tên lô canh tác <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Lô Xà Lách Hữu Cơ 2..."
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#13a855]/20 focus:border-[#13a855] transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* area */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Diện tích lô đất <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      value={formArea}
                      onChange={(e) => setFormArea(e.target.value)}
                      placeholder="Diện tích..."
                      className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#13a855]/20 focus:border-[#13a855] transition-all font-medium"
                    />
                    <select
                      value={formAreaUnit}
                      onChange={(e) => setFormAreaUnit(e.target.value)}
                      className="w-24 flex-shrink-0 bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-750 font-bold focus:outline-none focus:ring-2 focus:ring-[#13a855]/20 focus:border-[#13a855] cursor-pointer"
                    >
                      <option value="M2">M²</option>
                      <option value="HA">Hécta</option>
                    </select>
                  </div>
                </div>

                {/* tree_count */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Số lượng gốc cây trồng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formTreeCount}
                    onChange={(e) => setFormTreeCount(e.target.value)}
                    placeholder="Số lượng cây..."
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#13a855]/20 focus:border-[#13a855] transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* start_date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Ngày xuống giống gieo hạt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#13a855]/20 focus:border-[#13a855] transition-all"
                  />
                </div>

                {/* expected_harvest_date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Ngày dự kiến thu hoạch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formHarvestDate}
                    onChange={(e) => setFormHarvestDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#13a855]/20 focus:border-[#13a855] transition-all"
                  />
                </div>
              </div>

              {/* status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Trạng thái lô canh tác</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-705 font-bold focus:outline-none focus:ring-2 focus:ring-[#13a855]/20 focus:border-[#13a855] cursor-pointer"
                >
                  <option value="PROCESS">Đang nuôi trồng (PROCESS)</option>
                  <option value="HARVESTED">Đang thu hoạch (HARVESTED)</option>
                </select>
              </div>

              {/* note */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Ghi chú canh tác</label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Ghi chú về phân bón hữu cơ, lượng nước hoặc kỹ thuật canh tác đặc biệt..."
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#13a855]/20 focus:border-[#13a855] transition-all font-medium placeholder-gray-400 resize-none"
                />
              </div>

              {/* Footer buttons */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-650 hover:bg-gray-50 hover:text-gray-800 font-bold rounded-lg text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#13a855] hover:bg-[#0f8b44] text-white font-bold rounded-lg text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  {editingLot ? "Lưu thay đổi" : "Khởi tạo lô đất"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
