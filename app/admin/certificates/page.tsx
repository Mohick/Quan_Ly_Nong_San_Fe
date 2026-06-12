"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, FileImage, Loader2, RefreshCw, Eye } from "lucide-react";
import { toast } from "react-toastify";
import { getPendingCertificatesAPI, verifyCertificateAPI } from "@/lib/_api/certificates";
import { getCookie } from "cookies-next";

interface FarmCertificate {
  ID: string;
  FarmID: string;
  Name: string;
  ImageURL: string;
  Status: string;
  CreatedAt: string;
  Farm?: {
    FarmName: string;
  };
}

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<FarmCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const token = getCookie("access_token") as string;
      const res = await getPendingCertificatesAPI(token);
      if (res.data?.valid) {
        setCertificates(res.data.data || []);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách chứng chỉ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleVerify = async (id: string, status: "APPROVED" | "REJECTED") => {
    if (!window.confirm(`Bạn chắc chắn muốn ${status === "APPROVED" ? "DUYỆT" : "TỪ CHỐI"} chứng chỉ này?`)) return;

    setIsVerifying(id);
    try {
      const token = getCookie("access_token") as string;
      const res = await verifyCertificateAPI(id, status, token);
      if (res.data?.valid) {
        toast.success(`Đã ${status === "APPROVED" ? "duyệt" : "từ chối"} chứng chỉ thành công`);
        // Remove from list
        setCertificates(prev => prev.filter(c => c.ID !== id));
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    } finally {
      setIsVerifying(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Kiểm duyệt
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">
            Chứng Chỉ Nhà Vườn
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Xem xét và duyệt chứng chỉ VietGAP, GlobalGAP, OCOP... từ các nhà vườn.
          </p>
        </div>
        <button
          onClick={fetchCertificates}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm border border-gray-200 transition hover:bg-gray-50 hover:text-blue-600"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          Làm mới
        </button>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <ShieldCheck className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-sm font-bold text-gray-900">Không có chứng chỉ nào chờ duyệt</h3>
          <p className="mt-1 text-xs text-gray-500">Hệ thống đã xử lý xong toàn bộ các yêu cầu.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div key={cert.ID} className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
              {/* Image Preview Area */}
              <div className="relative aspect-video w-full bg-gray-100 group">
                {cert.ImageURL ? (
                  <img src={cert.ImageURL} alt={cert.Name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileImage className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                {/* Overlay to view full image */}
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                  <button 
                    onClick={() => setSelectedImage(cert.ImageURL)}
                    className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-gray-900 backdrop-blur-sm"
                  >
                    <Eye className="h-4 w-4" /> Xem chi tiết
                  </button>
                </div>
              </div>

              {/* Info Area */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-4">
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                    Chờ duyệt
                  </span>
                  <h3 className="mt-3 text-base font-black text-gray-900 line-clamp-2">
                    {cert.Name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    Nhà vườn: <span className="font-bold text-gray-700">{cert.Farm?.FarmName || cert.FarmID}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Ngày đăng: {new Date(cert.CreatedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleVerify(cert.ID, "REJECTED")}
                    disabled={isVerifying === cert.ID}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {isVerifying === cert.ID ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Từ chối
                  </button>
                  <button
                    onClick={() => handleVerify(cert.ID, "APPROVED")}
                    disabled={isVerifying === cert.ID}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isVerifying === cert.ID ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Duyệt ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition"
            >
              <XCircle className="h-6 w-6" />
            </button>
            <img src={selectedImage} alt="Chứng chỉ" className="max-h-[90vh] max-w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
