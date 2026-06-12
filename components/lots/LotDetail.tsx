"use client";

import React, { useState } from "react";
import { X, Plus, Calendar, CheckCircle2 } from "lucide-react";
import { CropLot } from "@/app/dashboard/(farm)/lots/page";
import { createCareProcessAPI, updateCareProcessAPI, deleteCareProcessAPI, getCareProcessesAPI } from "@/lib/_api/care_process";
import { toast } from "react-toastify";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface LotDetailProps {
  selectedLot: CropLot;
  onBack: () => void;
  farmId: string;
  lotDiaries: Record<string, any[]>;
  setLotDiaries: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
  handleOpenEditModal: (lot: CropLot) => void;
  showToast: (msg: string) => void;
  formatDate: (isoStr: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export const LotDetail: React.FC<LotDetailProps> = ({
  selectedLot,
  onBack,
  farmId,
  lotDiaries,
  setLotDiaries,
  handleOpenEditModal,
  showToast,
  formatDate,
  getStatusBadge,
}) => {
  const [detailTab, setDetailTab] = useState<"tt" | "sp">("tt");
  const [showAddDiary, setShowAddDiary] = useState(false);
  const [editingDiary, setEditingDiary] = useState<any | null>(null);
  const [newDiaryTitle, setNewDiaryTitle] = useState("");
  const [newDiaryDesc, setNewDiaryDesc] = useState("");
  const [newDiaryMonth, setNewDiaryMonth] = useState<number>(1);
  const [newDiaryStartDate, setNewDiaryStartDate] = useState("");
  const [newDiaryFinishedDate, setNewDiaryFinishedDate] = useState("");
  const [diaryToDelete, setDiaryToDelete] = useState<any | null>(null);
  const [isDeletingDiary, setIsDeletingDiary] = useState(false);

  const lotId = selectedLot.id || (selectedLot as any).ID;
  const currentDiaries = lotDiaries[lotId] || [];

  const handleDiaryEdit = (diary: any) => {
    setEditingDiary(diary);
    setNewDiaryTitle(diary.title || "");
    setNewDiaryDesc(diary.description || "");
    setNewDiaryMonth(diary.month || 1);
    setNewDiaryStartDate(diary.started_date ? diary.started_date.split("T")[0] : "");
    setNewDiaryFinishedDate(diary.finished_dat ? diary.finished_dat.split("T")[0] : "");
    setShowAddDiary(true);
  };

  const handleDiarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiaryTitle.trim() || !newDiaryDesc.trim() || !newDiaryStartDate || !newDiaryFinishedDate) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }
    if (!lotId) return;

    const payload = {
      crop_lot_id: lotId,
      title: newDiaryTitle,
      description: newDiaryDesc,
      month: Number(newDiaryMonth),
      started_date: new Date(newDiaryStartDate).toISOString().split(".")[0] + "Z",
      finished_date: new Date(newDiaryFinishedDate).toISOString().split(".")[0] + "Z",
    };

    const token = getCookie("access_token");
    try {
      if (editingDiary) {
        // Edit flow
        await updateCareProcessAPI({ id: editingDiary.id, ...payload }, token);
        showToast("Đã cập nhật nhật ký thành công!");
      } else {
        // Create flow
        await createCareProcessAPI(payload, token);
        showToast("Đã lưu nhật ký mới thành công!");
      }
      
      // Refresh list from backend directly
      const res = await getCareProcessesAPI(lotId, token);
      if (res && Array.isArray(res.data)) {
        setLotDiaries((prev) => ({
          ...prev,
          [lotId]: res.data,
        }));
      }
    } catch (error: any) {
      console.error("Lỗi khi tạo/sửa nhật ký chăm sóc:", error);
      toast.error("Lỗi khi lưu nhật ký lên máy chủ!");
    }

    setNewDiaryTitle("");
    setNewDiaryDesc("");
    setNewDiaryMonth(1);
    setNewDiaryStartDate("");
    setNewDiaryFinishedDate("");
    setShowAddDiary(false);
    setEditingDiary(null);
  };

  const handleDiaryDelete = async () => {
    if (!lotId || !diaryToDelete || isDeletingDiary) return;
    setIsDeletingDiary(true);
    const token = getCookie("access_token");
    try {
      await deleteCareProcessAPI(diaryToDelete.id, token);
      showToast("Đã xóa nhật ký chăm sóc thành công!");
      
      // Refresh list from backend directly
      const res = await getCareProcessesAPI(lotId, token);
      if (res && Array.isArray(res.data)) {
        setLotDiaries((prev) => ({
          ...prev,
          [lotId]: res.data,
        }));
      }
      setDiaryToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa nhật ký trên backend:", error);
      toast.error("Lỗi khi xóa nhật ký trên máy chủ!");
    } finally {
      setIsDeletingDiary(false);
    }
  };

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800 animate-fade-in select-none">
      {/* Back header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-150/60 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-900 bg-gray-150/80 hover:bg-gray-200 rounded-lg cursor-pointer transition-all flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
              Chi tiết Lô: {selectedLot.name}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 font-semibold mt-0.5">
              Mã lô: #{lotId} | Nông trại: {farmId}
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
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2">
              Thông tin chi tiết
            </h3>

            <div className="grid grid-cols-2 gap-6 text-xs font-bold text-gray-500">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 uppercase block">Diện tích canh tác</span>
                <span className="text-gray-800 text-sm font-extrabold">
                  {(selectedLot.area ?? 0).toLocaleString()} {selectedLot.area_unit || "M2"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 uppercase block">Quy mô gieo trồng</span>
                <span className="text-gray-800 text-sm font-extrabold">
                  {(selectedLot.tree_count ?? 0).toLocaleString()} gốc cây
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 uppercase block">Ngày gieo hạt</span>
                <span className="text-gray-800 text-sm font-extrabold">
                  {formatDate(selectedLot.start_date)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 uppercase block">Dự kiến thu hoạch</span>
                <span className="text-gray-800 text-sm font-extrabold">
                  {formatDate(selectedLot.expected_harvest_date)}
                </span>
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
              <div className="flex items-center gap-2">{getStatusBadge(selectedLot.status)}</div>
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
            <h4 className="text-xs sm:text-sm font-extrabold text-gray-800">
              Nhật ký sinh trưởng hàng tháng
            </h4>
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
              onSubmit={handleDiarySubmit}
              className="bg-gray-50 p-5 rounded-xl border border-gray-250/60 space-y-4 animate-slide-in"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-extrabold text-gray-800 font-sans">
                  {editingDiary ? "Chỉnh sửa nhật ký" : "Thêm nhật ký tháng mới"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDiary(false);
                    setEditingDiary(null);
                    setNewDiaryTitle("");
                    setNewDiaryDesc("");
                    setNewDiaryMonth(1);
                    setNewDiaryStartDate("");
                    setNewDiaryFinishedDate("");
                  }}
                  className="text-gray-400 hover:text-gray-650 text-xs font-bold cursor-pointer font-sans"
                >
                  Hủy
                </button>
              </div>

              <div className="space-y-3">
                {/* title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Tiêu đề nhật ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDiaryTitle}
                    onChange={(e) => setNewDiaryTitle(e.target.value)}
                    placeholder="Ví dụ: Chăm sóc tháng 1..."
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* month */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Chỉ số Tháng (1 - 12) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="12"
                      value={newDiaryMonth}
                      onChange={(e) => setNewDiaryMonth(Number(e.target.value))}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                    />
                  </div>

                  {/* started_date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Ngày bắt đầu (started_date) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={newDiaryStartDate}
                      onChange={(e) => setNewDiaryStartDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* finished_dat */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Ngày kết thúc (finished_dat) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={newDiaryFinishedDate}
                      onChange={(e) => setNewDiaryFinishedDate(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    Nội dung nhật ký (Description) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={newDiaryDesc}
                    onChange={(e) => setNewDiaryDesc(e.target.value)}
                    placeholder="Nhập chi tiết các hoạt động, bón phân, tưới tiêu..."
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
                <div
                  key={diary.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow relative group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                        📅 Tháng {diary.month}
                      </span>
                      <span className="text-gray-800 font-black text-xs">{diary.title}</span>
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleDiaryEdit(diary)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#13a855] hover:text-[#0f8b44] text-[10px] font-bold cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiaryToDelete(diary)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-750 text-[10px] font-bold cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  {diary.started_date && diary.finished_dat && (
                    <div className="text-[10px] text-gray-450 font-bold mb-1">
                      Thời gian: {formatDate(diary.started_date)} - {formatDate(diary.finished_dat)}
                    </div>
                  )}

                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    {diary.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        open={Boolean(diaryToDelete)}
        title="Xóa nhật ký chăm sóc?"
        description={`Nhật ký “${diaryToDelete?.title || ""}” sẽ bị xóa vĩnh viễn khỏi lô canh tác này.`}
        confirmLabel="Xóa nhật ký"
        isLoading={isDeletingDiary}
        onCancel={() => setDiaryToDelete(null)}
        onConfirm={handleDiaryDelete}
      />
    </div>
  );
};
