"use client";

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Building2,
  Camera,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import { FarmAPI, updateFarmAPI } from "@/lib/_api/farm";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface FarmForm {
  farmName: string;
  address: string;
  phone: string;
  description: string;
}

type FarmRecord = Record<string, unknown>;

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() : undefined;
}

function readFarmValue(
  farm: FarmRecord | null,
  camelKey: string,
  pascalKey: string,
) {
  const value = farm?.[camelKey] ?? farm?.[pascalKey];
  return value == null ? "" : String(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export default function DashboardFarmPage() {
  const [farmId, setFarmId] = useState<string>("");
  const [form, setForm] = useState<FarmForm>({
    farmName: "",
    address: "",
    phone: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(FALLBACK_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const objectUrlRef = useRef<string | null>(null);

  const loadFarm = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setLoadError("");

    try {
      const token = getCookie("access_token");
      if (!token) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const response = await FarmAPI(token);
      const farm = (response?.data ?? null) as FarmRecord | null;
      const id = readFarmValue(farm, "id", "ID");

      if (!farm || !id) {
        throw new Error("Không tìm thấy thông tin trang trại của tài khoản.");
      }

      setFarmId(String(id));
      setForm({
        farmName: readFarmValue(farm, "farm_name", "FarmName"),
        address: readFarmValue(farm, "address", "Address"),
        phone: readFarmValue(farm, "phone", "Phone"),
        description: readFarmValue(farm, "description", "Description"),
      });
      setImagePreview(
        readFarmValue(farm, "image_url", "ImageURL") || FALLBACK_IMAGE,
      );
      setImageFile(null);
    } catch (error: unknown) {
      setLoadError(getErrorMessage(error, "Không thể tải thông tin trang trại."));
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadFarm();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const updateField = (field: keyof FarmForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng định dạng hình ảnh.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Hình ảnh không được vượt quá 5MB.");
      event.target.value = "";
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(objectUrlRef.current);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!farmId || !form.farmName.trim()) {
      toast.error("Tên trang trại là thông tin bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("farm_name", form.farmName.trim());
      payload.append("address", form.address.trim());
      payload.append("phone", form.phone.trim());
      payload.append("description", form.description.trim());
      if (imageFile) payload.append("image", imageFile);

      const response = await updateFarmAPI(
        farmId,
        payload,
        getCookie("access_token"),
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Máy chủ không xác nhận cập nhật thành công.");
      }

      toast.success("Cập nhật thông tin trang trại thành công.");
      await loadFarm(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể cập nhật thông tin trang trại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          Đang tải thông tin trang trại...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <Building2 className="mx-auto h-10 w-10 text-red-400" />
        <h1 className="mt-4 text-lg font-black text-gray-900">
          Không thể tải trang trại
        </h1>
        <p className="mt-2 text-sm text-gray-500">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadFarm()}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
          Hồ sơ nhà vườn
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
          Cập nhật thông tin trang trại
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Thông tin này được hiển thị tại trang giới thiệu trang trại và sản phẩm.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="relative h-64 overflow-hidden bg-gray-100 sm:h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Ảnh bìa trang trại"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div className="min-w-0 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-white/75">
                Ảnh bìa hiện tại
              </p>
              <h2 className="truncate text-xl font-black">
                {form.farmName || "Trang trại của bạn"}
              </h2>
            </div>
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-gray-800 shadow-lg transition hover:bg-emerald-50">
              <Camera className="h-4 w-4 text-emerald-600" />
              Thay ảnh
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-[1fr_300px] lg:p-8">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Tên trang trại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.farmName}
                  onChange={(event) => updateField("farmName", event.target.value)}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Nhập tên trang trại"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder="Địa chỉ vùng canh tác"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Mô tả trang trại
                </label>
                <span className="text-[11px] font-semibold text-gray-400">
                  {form.description.length}/1000
                </span>
              </div>
              <textarea
                rows={7}
                maxLength={1000}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                placeholder="Giới thiệu sản phẩm chủ lực, quy mô, chứng nhận và phương pháp canh tác..."
              />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <ImagePlus className="h-6 w-6 text-emerald-600" />
              <h3 className="mt-3 text-sm font-black text-gray-900">
                Hình ảnh trang trại
              </h3>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                Hỗ trợ JPG, PNG hoặc WEBP, dung lượng tối đa 5MB. Nên dùng ảnh
                ngang rõ nét.
              </p>
              {imageFile && (
                <p className="mt-3 truncate rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-emerald-700">
                  {imageFile.name}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                Mã trang trại
              </p>
              <p className="mt-2 break-all font-mono text-xs font-semibold text-gray-700">
                {farmId}
              </p>
            </div>
          </aside>
        </div>

        <div className="flex justify-end border-t border-gray-100 bg-gray-50/70 px-6 py-4 lg:px-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
