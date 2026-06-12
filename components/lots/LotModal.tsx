"use client";

import React, { useState, useEffect } from "react";
import { X, Layers } from "lucide-react";
import { CropLot } from "@/app/dashboard/(farm)/lots/page";
import { toast } from "react-toastify";

interface LotModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLot: CropLot | null;
  farmId: string;
  onCreate: (payload: any) => void;
  onUpdate: (updatedLot: CropLot) => void;
}

export const LotModal: React.FC<LotModalProps> = ({
  isOpen,
  onClose,
  editingLot,
  farmId,
  onCreate,
  onUpdate,
}) => {
  const [formName, setFormName] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formAreaUnit, setFormAreaUnit] = useState("M2");
  const [formTreeCount, setFormTreeCount] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formHarvestDate, setFormHarvestDate] = useState("");
  const [formStatus, setFormStatus] = useState<"PROCESS" | "HARVESTED">("PROCESS");
  const [formNote, setFormNote] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (editingLot) {
        setFormName(editingLot.name || "");
        setFormArea(editingLot.area?.toString() || "");
        setFormAreaUnit(editingLot.area_unit || "M2");
        setFormTreeCount(editingLot.tree_count?.toString() || "");
        setFormStartDate(editingLot.start_date ? editingLot.start_date.split("T")[0] : "");
        setFormHarvestDate(
          editingLot.expected_harvest_date ? editingLot.expected_harvest_date.split("T")[0] : ""
        );
        setFormStatus(editingLot.status || "PROCESS");
        setFormNote(editingLot.note || "");
      } else {
        setFormName("");
        setFormArea("");
        setFormAreaUnit("M2");
        setFormTreeCount("");
        setFormStartDate(new Date().toISOString().split("T")[0]);
        setFormHarvestDate("");
        setFormStatus("PROCESS");
        setFormNote("");
      }
    }
  }, [isOpen, editingLot]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formArea || !formTreeCount || !formStartDate || !formHarvestDate) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    const areaNum = Number(formArea);
    const treeNum = Number(formTreeCount);

    if (editingLot) {
      onUpdate({
        ...editingLot,
        name: formName,
        area: areaNum,
        area_unit: formAreaUnit,
        tree_count: treeNum,
        start_date: new Date(formStartDate).toISOString(),
        expected_harvest_date: new Date(formHarvestDate).toISOString(),
        status: formStatus,
        note: formNote,
      });
    } else {
      onCreate({
        name: formName,
        area: areaNum,
        area_unit: formAreaUnit,
        tree_count: treeNum,
        start_date: new Date(formStartDate).toISOString().split(".")[0] + "Z",
        expected_harvest_date: new Date(formHarvestDate).toISOString().split(".")[0] + "Z",
        status: formStatus,
        note: formNote,
      });
    }
    onClose();
  };

  return (
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
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">


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
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Trạng thái lô canh tác
            </label>
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
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              Ghi chú canh tác
            </label>
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
              onClick={onClose}
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
  );
};
