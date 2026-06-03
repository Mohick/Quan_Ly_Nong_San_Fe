"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    User, Shield, Landmark, Camera, ArrowLeft, CheckCircle
} from "lucide-react";
import { useAuthStore, useAutoLogin } from "@/hooks/useAutoLogin";
import { createFarmAPI } from "@/lib/_api/create_farm";
import ProfileTab from "@/components/setings/ProfileTab";
import FarmTab from "@/components/setings/FarmTab";
import SecurityTab from "@/components/setings/SecurityTab";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export default function ProfileSettings() {
    const [activeTab, setActiveTab] = useState<"profile" | "farm" | "security">("profile");

    // Lấy thông tin user thực tế từ Zustand Global Store và Trigger Auto Login tự động
    const { user, loading } = useAutoLogin();
    const setUser = useAuthStore((state) => state.setUser);

    // Profile form states
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // Farm creation states
    const [farmName, setFarmName] = useState("");
    const [farmAddress, setFarmAddress] = useState("");
    const [farmPhone, setFarmPhone] = useState("");
    const [farmDescription, setFarmDescription] = useState("");
    const [farmImage, setFarmImage] = useState<File | null>(null);
    const [farmImagePreview, setFarmImagePreview] = useState("");

    // UI States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Đồng bộ form sau khi có kết quả từ Promise auto login
    useEffect(() => {
        const fetchAndFillUser = async () => {
            try {
                await useAuthStore.getState().performAutoLogin();
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    setFullName(currentUser.full_name || "");
                    setPhone(currentUser.phone || "");
                    setAddress(currentUser.address || "");
                }
            } catch (err) {
                console.error("Lỗi khi tải thông tin tài khoản:", err);
            }
        };
        fetchAndFillUser();
    }, []);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            showToast("Cập nhật thông tin tài khoản thành công!", "success");
        }, 1200);
    };

    const handleFarmSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!farmName.trim()) {
            showToast("Tên trang trại là thông tin bắt buộc!", "error");
            return;
        }
        if (!farmImage) {
            showToast("Hình ảnh trang trại là bắt buộc (multipart/form-data)!", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            // Khởi tạo FormData đóng gói chuẩn tên trường của Backend: farm_name và image
            const formData = new FormData();
            formData.append("farm_name", farmName);
            formData.append("address", farmAddress);
            formData.append("phone", farmPhone);
            formData.append("description", farmDescription);
            formData.append("image", farmImage);

            const token = getCookie("access_token");
            const response = await createFarmAPI(formData, token);

            if (response.status === 200 || response.status === 201) {
                showToast("Đăng ký & Khởi tạo Trang trại mới thành công!", "success");

                if (user) {
                    setUser({
                        ...user,
                        role: "FARMER",
                    });
                }

                setFarmName("");
                setFarmAddress("");
                setFarmPhone("");
                setFarmDescription("");
                setFarmImage(null);
                setFarmImagePreview("");

                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 1500);
            } else {
                showToast("Khởi tạo thất bại. Vui lòng thử lại!", "error");
            }
        } catch (error: any) {
            console.error("Lỗi khởi tạo trang trại:", error);
            showToast(error.response?.data?.message || "Lỗi hệ thống khi khởi tạo trang trại.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const userDisplayName = (user as any)?.FullName || user?.full_name || fullName || "";
    const userRole = (user as any)?.Role || user?.role || "CUSTOMER";
    const userEmail = (user as any)?.Email || user?.email || "";
    const createdAt = (user as any)?.CreatedAt || (user as any)?.created_at || "";

    return (
        <div className="w-full bg-[#f8faf9] min-h-screen py-10 font-sans select-none animate-fade-in text-gray-800">
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4.5 py-3 rounded-lg shadow-xl text-sm font-bold border transition-all duration-300 animate-slide-in ${toast.type === "success"
                        ? "bg-[#e8f8f0] text-[#13a855] border-[#cbeed7]"
                        : "bg-red-50 text-red-600 border-red-100"
                        }`}
                >
                    <CheckCircle className="w-5 h-5" />
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-[#13a855] transition-colors group cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        <span>Quay lại trang chủ</span>
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Cài Đặt Tài Khoản</h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                        Quản lý thông tin hồ sơ của bạn, đăng ký nâng cấp trang trại hoặc tùy chỉnh cấu hình bảo mật.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Left Sidebar */}
                    <div className="md:col-span-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-6">
                        <div className="flex items-center gap-4 pb-5 border-b border-gray-150/60">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-tr from-[#13a855] to-[#0a5c36] rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
                                    {userDisplayName ? userDisplayName.split(" ").map((n: string) => n[0]).join("") : "A"}
                                </div>
                                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full border border-gray-150 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                                    <Camera className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                            </div>
                            <div>
                                <span className="block font-black text-gray-900 text-sm sm:text-base leading-tight mb-1">{userDisplayName}</span>
                                <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-bold rounded">
                                    {userRole}
                                </span>
                            </div>
                        </div>

                        <nav className="flex flex-col gap-1 text-xs sm:text-sm font-bold">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "profile"
                                    ? "bg-[#e8f8f0] text-[#13a855] border-l-4 border-[#13a855]"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                    }`}
                            >
                                <User className="w-4.5 h-4.5" />
                                <span>Thông tin tài khoản</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("farm")}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "farm"
                                    ? "bg-[#e8f8f0] text-[#13a855] border-l-4 border-[#13a855]"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                    }`}
                            >
                                <Landmark className="w-4.5 h-4.5" />
                                <span>Đăng ký mở Trang trại</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("security")}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${activeTab === "security"
                                    ? "bg-[#e8f8f0] text-[#13a855] border-l-4 border-[#13a855]"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                    }`}
                            >
                                <Shield className="w-4.5 h-4.5" />
                                <span>Bảo mật tài khoản</span>
                            </button>
                        </nav>
                    </div>

                    {/* Right Dynamic Content Panel */}
                    <div className="md:col-span-8 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
                        {activeTab === "profile" && (
                            <ProfileTab
                                fullName={fullName}
                                setFullName={setFullName}
                                email={userEmail}
                                phone={phone}
                                setPhone={setPhone}
                                address={address}
                                setAddress={setAddress}
                                createdAt={createdAt}
                                isSubmitting={isSubmitting}
                                onSubmit={handleProfileSubmit}
                            />
                        )}

                        {activeTab === "farm" && (
                            <FarmTab
                                user={user}
                                farmName={farmName}
                                setFarmName={setFarmName}
                                farmPhone={farmPhone}
                                setFarmPhone={setFarmPhone}
                                farmAddress={farmAddress}
                                setFarmAddress={setFarmAddress}
                                farmDescription={farmDescription}
                                setFarmDescription={setFarmDescription}
                                farmImagePreview={farmImagePreview}
                                setFarmImagePreview={setFarmImagePreview}
                                setFarmImage={setFarmImage}
                                isSubmitting={isSubmitting}
                                onSubmit={handleFarmSubmit}
                            />
                        )}

                        {activeTab === "security" && <SecurityTab />}
                    </div>
                </div>
            </div>
        </div>
    );
}
