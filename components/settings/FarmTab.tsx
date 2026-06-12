import React, { useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Building2,
    ChevronDown,
    ChevronUp,
    CircleAlert,
    FileText,
    ImageIcon,
    Landmark,
    Loader2,
    MapPin,
    Phone,
    Plus,
    Sprout,
    Upload,
} from "lucide-react";

interface FarmRecord {
    id?: string;
    ID?: string;
    farm_name?: string;
    FarmName?: string;
    image_url?: string;
    ImageURL?: string;
    address?: string;
    Address?: string;
    phone?: string;
    Phone?: string;
    description?: string;
    Description?: string;
    status?: boolean;
    Status?: boolean;
}

interface FarmTabProps {
    myFarm: FarmRecord | null;
    isFetchingFarm: boolean;
    farmName: string;
    setFarmName: (val: string) => void;
    farmPhone: string;
    setFarmPhone: (val: string) => void;
    farmAddress: string;
    setFarmAddress: (val: string) => void;
    farmDescription: string;
    setFarmDescription: (val: string) => void;
    farmImagePreview: string;
    setFarmImagePreview: (val: string) => void;
    setFarmImage: (val: File | null) => void;
    isSubmitting: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

export default function FarmTab({
    myFarm,
    isFetchingFarm,
    farmName,
    setFarmName,
    farmPhone,
    setFarmPhone,
    farmAddress,
    setFarmAddress,
    farmDescription,
    setFarmDescription,
    farmImagePreview,
    setFarmImagePreview,
    setFarmImage,
    isSubmitting,
    onSubmit
}: FarmTabProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const handleFarmImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFarmImage(file);
            setFarmImagePreview(URL.createObjectURL(file));
        }
    };

    if (isFetchingFarm) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#13a855]" />
                <span className="text-xs font-bold text-gray-500">Đang tải thông tin trang trại...</span>
            </div>
        );
    }

    if (myFarm) {
        const name = myFarm.farm_name || myFarm.FarmName || "";
        const imageUrl = myFarm.image_url || myFarm.ImageURL || "";
        const address = myFarm.address || myFarm.Address || "";
        const phone = myFarm.phone || myFarm.Phone || "";
        const description = myFarm.description || myFarm.Description || "";
        const status = myFarm.status ?? myFarm.Status;
        const hasContactDetails = Boolean(address || phone);
        const canExpandDescription = description.length > 160;

        return (
            <div className="animate-fade-in space-y-4">
                <div className="border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#13a855]">
                            <Landmark className="h-4.5 w-4.5" />
                        </span>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 sm:text-base">
                                Quản Lý Trang Trại
                            </h3>
                            <p className="mt-0.5 text-[10px] font-medium text-gray-500 sm:text-[11px]">
                                Thông tin được đồng bộ trực tiếp từ hồ sơ trang trại của bạn.
                            </p>
                        </div>
                    </div>
                </div>

                <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="relative h-36 overflow-hidden bg-gray-100 sm:h-40">
                        {imageUrl ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imageUrl}
                                    alt={name ? `Ảnh trang trại ${name}` : "Ảnh trang trại"}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5" />
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                                <ImageIcon className="h-8 w-8" />
                                <span className="text-[11px] font-semibold">Chưa có ảnh trang trại</span>
                            </div>
                        )}

                        {typeof status === "boolean" && (
                            <span
                                className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider shadow-sm ${
                                    status
                                        ? "border-emerald-200 bg-white/95 text-emerald-700"
                                        : "border-red-200 bg-white/95 text-red-600"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        status ? "bg-emerald-500" : "bg-red-500"
                                    }`}
                                />
                                {status ? "Đang hoạt động" : "Tạm dừng"}
                            </span>
                        )}

                        <div className="absolute right-4 bottom-4 left-4 text-white">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4.5 w-4.5 shrink-0" />
                                <h4 className="text-base font-black tracking-tight sm:text-lg">
                                    {name || "Chưa cập nhật tên trang trại"}
                                </h4>
                            </div>
                            {address && (
                                <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-white/90 sm:text-xs">
                                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                                    <span>{address}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-3 p-4 sm:grid-cols-2">
                        {hasContactDetails ? (
                            <>
                                {phone && (
                                    <div className="rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2.5">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Phone className="h-3.5 w-3.5" />
                                            <span className="text-[9px] font-extrabold uppercase tracking-wider">
                                                Số điện thoại liên hệ
                                            </span>
                                        </div>
                                        <a
                                            href={`tel:${phone}`}
                                            className="mt-1 block text-xs font-black text-gray-900 transition-colors hover:text-[#13a855] sm:text-sm"
                                        >
                                            {phone}
                                        </a>
                                    </div>
                                )}

                                {address && (
                                    <div className="rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2.5">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span className="text-[9px] font-extrabold uppercase tracking-wider">
                                                Địa chỉ trang trại
                                            </span>
                                        </div>
                                        <p className="mt-1 line-clamp-1 text-xs font-bold text-gray-800 sm:text-sm">
                                            {address}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-2.5 rounded-lg border border-amber-100 bg-amber-50/70 p-3 text-amber-700 sm:col-span-2">
                                <CircleAlert className="h-4 w-4 shrink-0" />
                                <span className="text-[11px] font-semibold">
                                    Trang trại chưa cập nhật thông tin liên hệ.
                                </span>
                            </div>
                        )}

                        {description && (
                            <div className="rounded-lg border border-gray-100 p-3 sm:col-span-2">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span className="text-[9px] font-extrabold uppercase tracking-wider">
                                        Mô tả giới thiệu
                                    </span>
                                </div>
                                <p
                                    className={`mt-1.5 whitespace-pre-line text-xs leading-5 text-gray-600 ${
                                        isDescriptionExpanded ? "" : "line-clamp-3"
                                    }`}
                                >
                                    {description}
                                </p>
                                {canExpandDescription && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsDescriptionExpanded((expanded) => !expanded)
                                        }
                                        className="mt-1.5 inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold text-[#13a855] transition-colors hover:text-[#0f8b44]"
                                        aria-expanded={isDescriptionExpanded}
                                    >
                                        <span>
                                            {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
                                        </span>
                                        {isDescriptionExpanded ? (
                                            <ChevronUp className="h-3.5 w-3.5" />
                                        ) : (
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end border-t border-gray-100 pt-3 sm:col-span-2">
                            <Link
                                href="/dashboard"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#13a855] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0f8b44] active:scale-[0.98] sm:w-auto"
                            >
                                <span>Truy cập cổng quản trị</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </article>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6 animate-fade-in">
            <div className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-[#13a855]">
                    <Landmark className="w-5 h-5" />
                    <h3 className="text-base sm:text-lg font-black text-gray-900">Đăng Ký Khởi Tạo Trang Trại</h3>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
                    Nâng cấp tài khoản lên đối tác Nhà vườn bằng việc tạo một Cơ sở sản xuất (Trang trại) mới đạt chuẩn.
                </p>
            </div>

            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start gap-3.5 text-xs text-emerald-800 leading-relaxed">
                <Sprout className="w-5 h-5 text-[#13a855] shrink-0 mt-0.5" />
                <div>
                    <span className="font-extrabold text-emerald-900 block mb-0.5">Quyền lợi Nhà Vườn PIONE</span>
                    Sau khi khởi tạo trang trại thành công, bạn sẽ nhận được quyền truy cập vào giao diện trang quản trị nông nghiệp chuyên sâu (Dashboard Farm) để tự đăng bán và quản lý hàng hóa của mình.
                </div>
            </div>

            {/* Form fields matching Swagger API specifications */}
            <div className="space-y-4">
                {/* farm_name */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Tên trang trại <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="Nhập tên trang trại (Ví dụ: Trang trại xanh An Bình)..."
                        className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-medium placeholder-gray-400"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* phone */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Số điện thoại liên hệ</label>
                        <input
                            type="text"
                            value={farmPhone}
                            onChange={(e) => setFarmPhone(e.target.value)}
                            placeholder="Số điện thoại dùng cho trang trại..."
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-medium placeholder-gray-400"
                        />
                    </div>

                    {/* address */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Địa chỉ trang trại</label>
                        <input
                            type="text"
                            value={farmAddress}
                            onChange={(e) => setFarmAddress(e.target.value)}
                            placeholder="Khu vực canh tác địa phương..."
                            className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-medium placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* description */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Mô tả trang trại</label>
                    <textarea
                        value={farmDescription}
                        onChange={(e) => setFarmDescription(e.target.value)}
                        placeholder="Mô tả các sản phẩm chính và diện tích, công nghệ canh tác (VietGAP, hữu cơ)..."
                        rows={3}
                        className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-medium placeholder-gray-400 resize-none"
                    />
                </div>

                {/* image (multipart/form-data) */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Ảnh bìa trang trại <span className="text-red-500">*</span>
                    </label>

                    <div className="flex items-center gap-4">
                        {farmImagePreview ? (
                            <div className="w-24 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100 relative group">
                                <img src={farmImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setFarmImage(null); setFarmImagePreview(""); }}
                                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                                >
                                    Thay đổi
                                </button>
                            </div>
                        ) : (
                            <label className="w-24 h-20 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#13a855]/60 flex flex-col items-center justify-center text-gray-400 hover:text-gray-650 transition-colors cursor-pointer flex-shrink-0">
                                <Upload className="w-5 h-5" />
                                <span className="text-[9px] font-bold mt-1">Chọn tệp</span>
                                <input
                                    type="file"
                                    required
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFarmImageChange}
                                />
                            </label>
                        )}

                        <div className="text-[10px] text-gray-400 font-semibold leading-normal">
                            <span className="block text-gray-500 font-extrabold uppercase">File Upload (Binary)</span>
                            Yêu cầu ảnh chụp thực tế chất lượng cao. Định dạng JPG, PNG không quá 5MB.
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit button / API Trigger */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs sm:text-sm font-bold rounded-lg shadow-md active:scale-97 cursor-pointer transition-all disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Đang khởi tạo (POST)...</span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-4.5 h-4.5" />
                            <span>Khởi tạo trang trại</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
