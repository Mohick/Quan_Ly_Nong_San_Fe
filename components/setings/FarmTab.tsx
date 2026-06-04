import React from "react";
import Link from "next/link";
import { Landmark, ArrowLeft, Sprout, Upload, Loader2, Plus } from "lucide-react";

interface FarmTabProps {
    user: any;
    myFarm: any;
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
    user,
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
    const [subTab, setSubTab] = React.useState<"tt" | "sp">("tt");
    const [diaries, setDiaries] = React.useState<{ id: number; month: string; description: string }[]>([
        { id: 1, month: "Tháng 1", description: "Bắt đầu vụ mùa canh tác mới, cải tạo đất, bón phân hữu cơ và gieo trồng các loại giống rau ăn lá." },
        { id: 2, month: "Tháng 2", description: "Chăm sóc định kỳ, tưới nước bằng hệ thống cảm biến thông minh, làm cỏ và phòng trừ sâu bệnh hữu cơ." }
    ]);
    const [showAddDiary, setShowAddDiary] = React.useState(false);
    const [newDiaryMonth, setNewDiaryMonth] = React.useState("");
    const [newDiaryDesc, setNewDiaryDesc] = React.useState("");

    const handleAddDiary = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDiaryMonth || !newDiaryDesc) return;
        const newDiary = {
            id: Date.now(),
            month: newDiaryMonth,
            description: newDiaryDesc
        };
        setDiaries([newDiary, ...diaries]);
        setNewDiaryMonth("");
        setNewDiaryDesc("");
        setShowAddDiary(false);
    };

    const handleDeleteDiary = (id: number) => {
        setDiaries(diaries.filter(d => d.id !== id));
    };

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
        const name = myFarm.farm_name || myFarm.FarmName || "Trang trại của tôi";
        const img = myFarm.image_url || myFarm.ImageURL || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000";
        const addr = myFarm.address || myFarm.Address || "Chưa xác định";
        const ph = myFarm.phone || myFarm.Phone || "Chưa cập nhật";
        const desc = myFarm.description || myFarm.Description || "Chưa có mô tả chi tiết.";
        const status = myFarm.status !== false;

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[#13a855]">
                            <Landmark className="w-5 h-5" />
                            <h3 className="text-base sm:text-lg font-black text-gray-900">Quản Lý Trang Trại</h3>
                        </div>
                        <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
                            Quản lý thông tin chung và nhật ký canh tác của trang trại của bạn.
                        </p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl w-fit border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setSubTab("tt")}
                            className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                                subTab === "tt"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-550 hover:text-gray-900"
                            }`}
                        >
                            Trang Trại (TT)
                        </button>
                        <button
                            type="button"
                            onClick={() => setSubTab("sp")}
                            className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                                subTab === "sp"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-555 hover:text-gray-900"
                            }`}
                        >
                            Nhật Ký (SP)
                        </button>
                    </div>
                </div>

                {subTab === "tt" ? (
                    <>
                        {/* Farm details card */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-48 w-full relative overflow-hidden bg-gray-100">
                                <img src={img} alt={name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full shadow-md tracking-wider border ${
                                        status 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                                            : "bg-red-50 text-red-600 border-red-200"
                                    }`}>
                                        {status ? "Đang hoạt động" : "Tạm dừng"}
                                    </span>
                                </div>
                                <div className="absolute bottom-4 left-5 right-5 text-white">
                                    <h4 className="text-lg font-black tracking-tight drop-shadow-sm">{name}</h4>
                                    <p className="text-xs font-semibold text-gray-200 drop-shadow-sm flex items-center gap-1 mt-0.5">
                                        <span>📍 {addr}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 text-xs font-bold text-gray-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Số điện thoại liên hệ</span>
                                        <span className="text-gray-800 text-sm font-extrabold">{ph}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">ID Trang trại</span>
                                        <span className="text-gray-800 font-mono text-xs font-medium bg-gray-50 p-1.5 rounded border border-gray-200 block truncate">{myFarm.id || myFarm.ID}</span>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2 border-t border-gray-100">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Mô tả giới thiệu</span>
                                    <p className="text-gray-600 font-medium leading-relaxed text-xs">{desc}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <Link href="/dashboard" className="block w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-6 py-3.5 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                                    <span>Truy cập Cổng quản trị trang trại</span>
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </button>
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs sm:text-sm font-extrabold text-gray-800">Nhật ký canh tác hàng tháng</h4>
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
                            <form onSubmit={handleAddDiary} className="bg-gray-50 p-4 rounded-xl border border-gray-250/60 space-y-4 animate-slide-in">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                    <span className="text-xs font-extrabold text-gray-800">Thêm nhật ký canh tác mới</span>
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
                                            placeholder="Ví dụ: Tháng 3, Tháng 4..."
                                            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Nội dung nhật ký (Description) <span className="text-red-500">*</span></label>
                                        <textarea
                                            required
                                            value={newDiaryDesc}
                                            onChange={(e) => setNewDiaryDesc(e.target.value)}
                                            placeholder="Nhập chi tiết các hoạt động canh tác trong tháng..."
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

                        {diaries.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 font-medium text-xs">
                                Chưa có nhật ký canh tác nào được ghi chép.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {diaries.map((diary) => (
                                    <div key={diary.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow relative group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                                                📅 {diary.month}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDiary(diary.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-750 text-[10px] font-bold cursor-pointer"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-600 font-medium leading-relaxed">{diary.description}</p>
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
