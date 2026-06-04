"use client";

import React from "react";
import { Calendar, CheckCircle2, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { CropLot } from "@/app/dashboard/(farm)/lots/page";

interface LotCardProps {
  lot: CropLot;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
  formatDate: (isoStr: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

export const LotCard: React.FC<LotCardProps> = ({
  lot,
  onDetail,
  onEdit,
  onDelete,
  formatDate,
  getStatusBadge,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
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
            <span className="block text-gray-750 text-xs sm:text-sm">
              {(lot.area || 0).toLocaleString()} {lot.area_unit}
            </span>
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] text-gray-400 uppercase">Quy mô</span>
            <span className="block text-gray-750 text-xs sm:text-sm">
              {(lot.tree_count || 0).toLocaleString()} gốc cây
            </span>
          </div>
        </div>

        {/* Timelines countdown */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-550">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              Ngày gieo: <span className="font-bold text-gray-700">{formatDate(lot.start_date)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-550">
            <CheckCircle2 className="w-4 h-4 text-gray-400" />
            <span>
              Thu hoạch: <span className="font-bold text-gray-700">{formatDate(lot.expected_harvest_date)}</span>
            </span>
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
          onClick={onDetail}
          className="p-2 text-gray-500 hover:text-[#13a855] hover:bg-[#e8f8f0] border border-gray-200 hover:border-[#13a855]/30 rounded-lg cursor-pointer transition-all active:scale-95 text-xs font-bold flex items-center gap-1.5"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Chi tiết</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-[#13a855] hover:bg-[#e8f8f0] border border-[#d3ecd8] hover:border-[#13a855]/30 rounded-lg cursor-pointer transition-all active:scale-95 text-xs font-bold flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 rounded-lg cursor-pointer transition-all active:scale-95 text-xs font-bold flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
