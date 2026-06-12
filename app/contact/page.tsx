"use client";

import React, { useState } from "react";
import { Phone, Mail, Check, ArrowRight, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function ContactSupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }, 1500);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-x-hidden bg-[#fbfcfc] py-10 font-sans text-gray-800 sm:py-14 lg:py-16">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)] xl:gap-16">
        
        {/* Left Column */}
        <div className="min-w-0 space-y-8 sm:space-y-10">
          <div className="space-y-4">
            <h1 className="max-w-2xl break-words text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl xl:text-5xl">
              Nhận tư vấn miễn phí từ các chuyên gia
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-gray-500 sm:text-base">
              Hãy để lại thông tin của bạn, đội ngũ chuyên gia của chúng tôi sẽ liên hệ để phân tích nhu cầu và đề xuất giải pháp phù hợp nhất cho doanh nghiệp của bạn.
            </p>
          </div>

          {/* Bullet Grid */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500 text-emerald-500 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-700">Phản hồi trong vòng 24 giờ</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500 text-emerald-500 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-700">Tư vấn hoàn toàn miễn phí</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500 text-emerald-500 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-700">Bảo mật thông tin tuyệt đối</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-emerald-500 text-emerald-500 shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-700">Hỗ trợ 1-1 cùng chuyên gia</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Direct Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              LIÊN HỆ TRỰC TIẾP
            </h3>
            
            <div className="space-y-4">
              {/* Hotline */}
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
                  <Phone className="w-4 h-4 fill-emerald-600/10" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider leading-none mb-1">ĐƯỜNG DÂY NÓNG (HOTLINE)</span>
                  <a href="tel:+84967103466" className="text-xs sm:text-sm font-black text-gray-900 hover:text-emerald-600 transition-colors">
                    (+84) 967 103 466
                  </a>
                </div>
              </div>

              {/* Direct Support */}
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
                  <Phone className="w-4 h-4 fill-emerald-600/10" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider leading-none mb-1">HỖ TRỢ TRỰC TIẾP</span>
                  <a href="tel:+84967213466" className="text-xs sm:text-sm font-black text-gray-900 hover:text-emerald-600 transition-colors">
                    (+84) 967 213 466
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600">
                  <Mail className="w-4 h-4 fill-emerald-600/10" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider leading-none mb-1">EMAIL</span>
                  <a href="mailto:info@pionetrace.com" className="text-xs sm:text-sm font-black text-gray-900 hover:text-emerald-600 transition-colors">
                    info@pionetrace.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Form Card) */}
        <div className="min-w-0 rounded-3xl border border-gray-150/70 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-black text-gray-900">Cảm ơn bạn!</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Yêu cầu tư vấn của bạn đã được gửi thành công. Đội ngũ của chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 px-6 py-2 bg-[#009a63] hover:bg-[#008253] text-white text-xs font-black rounded-xl transition-all"
              >
                Gửi yêu cầu mới
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  HỌ VÀ TÊN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[#f4f6f8] border border-transparent hover:border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3 px-4 text-xs sm:text-sm font-bold placeholder-gray-400 outline-none transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  SỐ ĐIỆN THOẠI <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full bg-[#f4f6f8] border border-transparent hover:border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3 px-4 text-xs sm:text-sm font-bold placeholder-gray-400 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  ĐỊA CHỈ EMAIL <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@congty.vn"
                  className="w-full bg-[#f4f6f8] border border-transparent hover:border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3 px-4 text-xs sm:text-sm font-bold placeholder-gray-400 outline-none transition-all"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  NỘI DUNG CẦN TƯ VẤN
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mô tả ngắn gọn về nhu cầu của bạn (không bắt buộc)"
                  className="w-full bg-[#f4f6f8] border border-transparent hover:border-gray-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3 px-4 text-xs sm:text-sm font-bold placeholder-gray-400 outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#009a63] hover:bg-[#008253] disabled:bg-gray-300 text-white text-xs sm:text-sm font-black rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? "Đang xử lý..." : "Đăng ký nhận tư vấn miễn phí"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Footer Disclaimer */}
              <p className="text-[10px] text-gray-400 text-center font-bold">
                Bằng việc đăng ký, bạn đồng ý với{" "}
                <a href="/privacy-policy" className="underline hover:text-gray-600 transition-colors">
                  Chính sách bảo mật
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#009a63] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer z-40 group">
        <MessageCircle className="w-6 h-6 fill-white/10 group-hover:rotate-12 transition-transform duration-200" />
      </button>
    </div>
  );
}
