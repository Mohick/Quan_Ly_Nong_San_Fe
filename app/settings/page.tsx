"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Landmark,
  Camera,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore, useAutoLogin } from "@/hooks/useAutoLogin";
import { createFarmAPI } from "@/lib/_api/create_farm";
import { FarmAPI } from "@/lib/_api/farm";
import { updateProfileAPI } from "@/lib/_api/profile";
import ProfileTab from "@/components/settings/ProfileTab";
import FarmTab from "@/components/settings/FarmTab";
import SecurityTab from "@/components/settings/SecurityTab";
import { toast } from "react-toastify";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const AVATAR_SIZE = 512;

function createAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Không thể đọc tệp ảnh."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Tệp đã chọn không phải ảnh hợp lệ."));
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Trình duyệt không hỗ trợ xử lý ảnh."));
          return;
        }

        const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
        const sourceX = (image.naturalWidth - sourceSize) / 2;
        const sourceY = (image.naturalHeight - sourceSize) / 2;

        context.drawImage(
          image,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          AVATAR_SIZE,
          AVATAR_SIZE,
        );
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState<"profile" | "farm" | "security">(
    "profile",
  );

  // Lấy thông tin user thực tế từ Zustand Global Store và Trigger Auto Login tự động
  const { user } = useAutoLogin();
  const setUser = useAuthStore((state) => state.setUser);

  // Profile form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

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

  // Đồng bộ form khi tài khoản đăng nhập được tải hoặc cập nhật.
  useEffect(() => {
    if (!user) return;
    let isActive = true;
    const account = user as typeof user & {
      FullName?: string;
      Phone?: string;
      Address?: string;
      AvatarURL?: string;
      image?: string;
    };
    queueMicrotask(() => {
      if (!isActive) return;
      setFullName(account.full_name || account.FullName || "");
      setPhone(account.phone || account.Phone || "");
      setAddress(account.address || account.Address || "");
      setAvatarUrl(
        account.avatar_url || account.AvatarURL || account.image || "",
      );
    });

    return () => {
      isActive = false;
    };
  }, [user]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng định dạng hình ảnh.");
      return;
    }
    if (file.size > MAX_AVATAR_FILE_SIZE) {
      toast.error("Ảnh đại diện không được vượt quá 5MB.");
      return;
    }

    try {
      setAvatarUrl(await createAvatarDataUrl(file));
      toast.info("Ảnh mới đã được chọn. Hãy nhấn Cập nhật hồ sơ để lưu.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể xử lý ảnh đại diện.",
      );
    }
  };

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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.error("Vui lòng nhập đầy đủ các thông tin bắt buộc!");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = getCookie("access_token");
      const res = await updateProfileAPI({
        full_name: fullName,
        phone,
        address,
        avatar_url: avatarUrl,
      }, token);

      if (res.status === 200 || res.status === 201) {
        toast.success("Cập nhật thông tin tài khoản thành công!");
        if (user) {
          const updatedUser = {
            ...user,
            full_name: fullName,
            phone,
            address,
            avatar_url: avatarUrl,
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } else {
        toast.error("Không thể cập nhật hồ sơ. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Lỗi khi cập nhật hồ sơ cá nhân:", error);
      toast.error(
        error.response?.data?.message || error.message || "Lỗi hệ thống khi cập nhật hồ sơ."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFarmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmName.trim()) {
      toast.error("Tên trang trại là thông tin bắt buộc!");
      return;
    }
    if (!farmImage) {
      toast.error(
        "Hình ảnh trang trại là bắt buộc (multipart/form-data)!"
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
        toast.success("Đăng ký & Khởi tạo Trang trại mới thành công!");

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
        toast.error("Khởi tạo thất bại. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Lỗi khởi tạo trang trại:", error);
      toast.error(
        error.response?.data?.message ||
        "Lỗi hệ thống khi khởi tạo trang trại."
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
  const avatarInitials = userDisplayName
    ? userDisplayName
      .split(" ")
      .filter(Boolean)
      .map((name: string) => name[0])
      .join("")
      .slice(0, 3)
      .toUpperCase()
    : "A";

  return (
    <div className="animate-fade-in min-h-screen w-full bg-[#f8faf9] py-10 font-sans text-gray-800 select-none">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`Ảnh đại diện của ${userDisplayName}`}
                    className="h-14 w-14 rounded-full border border-emerald-100 object-cover shadow-inner"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#13a855] to-[#0a5c36] text-lg font-extrabold text-white shadow-inner">
                    {avatarInitials}
                  </div>
                )}
                <label
                  className="border-gray-150 absolute -right-1 -bottom-1 cursor-pointer rounded-full border bg-white p-1 shadow-sm transition-colors hover:bg-gray-50"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
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
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all ${activeTab === "profile"
                    ? "border-l-4 border-[#13a855] bg-[#e8f8f0] text-[#13a855]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <User className="h-4.5 w-4.5" />
                <span>Thông tin tài khoản</span>
              </button>

              <button
                onClick={() => setActiveTab("farm")}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all ${activeTab === "farm"
                    ? "border-l-4 border-[#13a855] bg-[#e8f8f0] text-[#13a855]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <Landmark className="h-4.5 w-4.5" />
                <span>{myFarm ? "Quản lý trang trại" : "Đăng ký mở Trang trại"}</span>
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all ${activeTab === "security"
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
