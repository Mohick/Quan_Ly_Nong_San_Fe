"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import {
  User,
  Shield,
  Landmark,
  Camera,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useAuthStore, useAutoLogin } from "@/hooks/useAutoLogin";
import { createFarmAPI } from "@/lib/_api/create_farm";
import { FarmAPI } from "@/lib/_api/farm";
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
  const [activeTab, setActiveTab] = useState<"profile" | "farm" | "security">(
    "profile",
  );

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
  const [myFarm, setMyFarm] = useState<any>(null);
  const [isFetchingFarm, setIsFetchingFarm] = useState(true);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  useEffect(() => {
    const fetchFarm = async () => {
      const token = getCookie("access_token");
      if (token) {
        setIsFetchingFarm(true);
        try {
          const res = await FarmAPI(token);
          if (res && res.data) {
            setMyFarm(res.data);
          }
        } catch (error) {
          console.error("Lỗi khi tải thông tin trang trại:", error);
        } finally {
          setIsFetchingFarm(false);
        }
      } else {
        setIsFetchingFarm(false);
      }
    };
    fetchFarm();
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
      showToast(
        "Hình ảnh trang trại là bắt buộc (multipart/form-data)!",
        "error",
      );
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
      showToast(
        error.response?.data?.message ||
          "Lỗi hệ thống khi khởi tạo trang trại.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const userDisplayName =
    (user as any)?.FullName || user?.full_name || fullName || "";
  const userRole = (user as any)?.Role || user?.role || "CUSTOMER";
  const userEmail = (user as any)?.Email || user?.email || "";
  const createdAt = (user as any)?.CreatedAt || (user as any)?.created_at || "";

  return (
    <div className="animate-fade-in min-h-screen w-full bg-[#f8faf9] py-10 font-sans text-gray-800 select-none">
      {toast && (
        <div
          className={`animate-slide-in fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4.5 py-3 text-sm font-bold shadow-xl transition-all duration-300 ${
            toast.type === "success"
              ? "border-[#cbeed7] bg-[#e8f8f0] text-[#13a855]"
              : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          <CheckCircle className="h-5 w-5" />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-500 transition-colors hover:text-[#13a855] sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4 transform transition-transform group-hover:-translate-x-1" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
            Cài Đặt Tài Khoản
          </h1>
          <p className="mt-0.5 text-xs font-medium text-gray-500 sm:text-sm">
            Quản lý thông tin hồ sơ của bạn, đăng ký nâng cấp trang trại hoặc
            tùy chỉnh cấu hình bảo mật.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          {/* Left Sidebar */}
          <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-4">
            <div className="border-gray-150/60 flex items-center gap-4 border-b pb-5">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#13a855] to-[#0a5c36] text-lg font-extrabold text-white shadow-inner">
                  {userDisplayName
                    ? userDisplayName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "A"}
                </div>
                <div className="border-gray-150 absolute -right-1 -bottom-1 cursor-pointer rounded-full border bg-white p-1 shadow-sm transition-colors hover:bg-gray-50">
                  <Camera className="h-3.5 w-3.5 text-gray-500" />
                </div>
              </div>
              <div>
                <span className="mb-1 block text-sm leading-tight font-black text-gray-900 sm:text-base">
                  {userDisplayName}
                </span>
                <span className="inline-block rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                  {userRole}
                </span>
              </div>
            </div>

            <nav className="flex flex-col gap-1 text-xs font-bold sm:text-sm">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  activeTab === "profile"
                    ? "border-l-4 border-[#13a855] bg-[#e8f8f0] text-[#13a855]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <User className="h-4.5 w-4.5" />
                <span>Thông tin tài khoản</span>
              </button>

              <button
                onClick={() => setActiveTab("farm")}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  activeTab === "farm"
                    ? "border-l-4 border-[#13a855] bg-[#e8f8f0] text-[#13a855]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Landmark className="h-4.5 w-4.5" />
                <span>Đăng ký mở Trang trại</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  activeTab === "security"
                    ? "border-l-4 border-[#13a855] bg-[#e8f8f0] text-[#13a855]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Shield className="h-4.5 w-4.5" />
                <span>Bảo mật tài khoản</span>
              </button>
            </nav>
          </div>

          {/* Right Dynamic Content Panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 md:col-span-8">
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
                myFarm={myFarm}
                isFetchingFarm={isFetchingFarm}
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
