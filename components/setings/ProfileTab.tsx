import React from "react";
import { Mail, Phone, MapPin, BadgeAlert, Loader2 } from "lucide-react";

interface ProfileTabProps {
    fullName: string;
    setFullName: (val: string) => void;
    email: string;
    phone: string;
    setPhone: (val: string) => void;
    address: string;
    setAddress: (val: string) => void;
    createdAt: string;
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function ProfileTab({
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    address,
    setAddress,
    createdAt,
    isSubmitting,
    onSubmit
}: ProfileTabProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-6 animate-fade-in">
            <div className="border-b border-gray-100 pb-4">
                <h3 className="text-base sm:text-lg font-black text-gray-900">Thông Tin Hồ Sơ Cá Nhân</h3>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
                    Cập nhật các thông tin cơ bản về danh tính và địa điểm liên hệ của bạn.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
                {/* Full Name */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Họ và Tên</label>
                    <input
                        type="text"
                        required
                        value={fullName || ""}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-medium"
                    />
                </div>

                {/* Email (Readonly) */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Địa chỉ Email</label>
                    <div className="relative">
                        <input
                            type="email"
                            readOnly
                            value={email || ""}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-400 focus:outline-none cursor-not-allowed font-medium"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Số điện thoại</label>
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={phone || ""}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-medium"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Địa chỉ hiện tại</label>
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={address || ""}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 pl-10 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-medium"
                        />
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Additional readonly technical details */}
            <div className="p-4 bg-gray-50 border border-gray-150/60 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-500 leading-relaxed">
                <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Trạng thái xác minh</span>
                    <span className="flex items-center gap-1.5 mt-1 font-bold text-amber-600">
                        <BadgeAlert className="w-4 h-4" />
                        Chờ xác thực
                    </span>
                </div>
                <div>
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ngày tham gia PIONE</span>
                    <span className="block text-gray-700 mt-1">
                        {createdAt ? new Date(createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric", month: "long", day: "numeric"
                        }) : ""}
                    </span>
                </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs sm:text-sm font-bold rounded-lg shadow-md active:scale-97 cursor-pointer transition-all disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        <span>Cập nhật hồ sơ</span>
                    )}
                </button>
            </div>
        </form>
    );
}
