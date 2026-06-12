"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin } from "lucide-react";
import { FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";

const Footer = () => {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on dashboard pages
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="relative w-full bg-[#1C432F] text-zinc-300 py-12 md:py-12 font-sans flex flex-col overflow-hidden">

      {/* Decorative leaf watermark overlay matching screenshot background */}
      <div className="absolute right-0 bottom-0 top-0 w-2/5 opacity-[0.04] pointer-events-none select-none hidden lg:block">
        <svg className="w-full h-full text-[#00ff88] fill-current" viewBox="0 0 500 500" preserveAspectRatio="xMaxYMax meet">
          <path d="M500,500 C400,380 300,320 220,310 C150,300 80,330 0,390 C60,250 180,120 350,80 C410,66 460,70 500,90 Z" />
          <path d="M420,180 C360,200 300,210 240,190 C180,170 120,120 60,50 C140,80 220,120 300,140 C350,150 390,160 420,180 Z" opacity="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pb-16">

          {/* Column 1: Logo & Info */}
          <div className="space-y-6">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="PIONE GROUP" className="h-14 sm:h-16 w-auto object-contain brightness-0 invert" />
              <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white uppercase select-none">
                Pione Group
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400 max-w-sm">
              Chúng tôi hướng đến kiến tạo tương lai số bằng cách ứng dụng trí tuệ nhân tạo vào hệ sinh thái công nghệ toàn diện, tạo ra giá trị thực tiễn và bền vững cho xã hội.
            </p>
            <p className="text-xs text-zinc-500 max-w-sm mt-2">
              Hoạt động từ 17/02/2014 với 12 năm hoạt động trong lĩnh vực công nghệ AI & Blockchain.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800/40 border border-zinc-700/30 hover:bg-[#13a855] hover:border-[#13a855] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-white">
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800/40 border border-zinc-700/30 hover:bg-[#13a855] hover:border-[#13a855] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-white">
                <FaTiktok className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800/40 border border-zinc-700/30 hover:bg-[#13a855] hover:border-[#13a855] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-white">
                <FaYoutube className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6 lg:pl-10">
            <h3 className="font-bold text-[#00ff88] text-[15px] tracking-widest uppercase">
              LIÊN KẾT NHANH
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/nha-vuon"
                  className="text-sm text-zinc-300 hover:text-[#00ff88] transition-colors duration-200"
                >
                  Bản đồ vùng canh tác
                </Link>
              </li>
              <li>
                <Link
                  href="/tin-tuc"
                  className="text-sm text-zinc-300 hover:text-[#00ff88] transition-colors duration-200"
                >
                  Tin tức nông sản
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-300 hover:text-[#00ff88] transition-colors duration-200"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-300 hover:text-[#00ff88] transition-colors duration-200"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-6">
            <h3 className="font-bold text-[#00ff88] text-[15px] tracking-widest uppercase">
              LIÊN HỆ
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-extrabold text-white leading-snug">
                  Công ty Cổ phần Pione Group
                </p>
                <p className="text-zinc-400 text-xs mt-1">
                  Mã số thuế: 0312651550
                </p>
                <a
                  href="https://www.pionegroup.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] text-xs hover:underline mt-1 inline-block"
                >
                  www.pionegroup.com
                </a>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-zinc-250 text-xs leading-normal">
                    <span className="text-zinc-400 font-bold block sm:inline">Đường dây nóng: </span>
                    (+84) 28 3535 5888
                  </div>
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-zinc-250 text-xs leading-normal">
                    <span className="text-zinc-400 font-bold block sm:inline">Hỗ trợ: </span>
                    (+84) 968 608 974
                  </div>
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="text-zinc-250 text-xs leading-normal">
                    <span className="text-zinc-400 font-bold block sm:inline">Email: </span>
                    info@pionegroup.com
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Address */}
          <div className="space-y-6">
            <h3 className="font-bold text-[#00ff88] text-[15px] tracking-widest uppercase">
              ĐỊA CHỈ
            </h3>
            <div className="space-y-5 text-xs">

              {/* Headquarters */}
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-[#00ff88] tracking-wider uppercase mb-1">
                    TRỤ SỞ CHÍNH
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    213 Đường Tân Thắng, Phường Tân Sơn Nhì, TP. HCM, Việt Nam (trước đây: 213 Tân Thắng, Phường Sơn Kỳ, Quận Tân Phú, TP. HCM, Việt Nam)
                  </p>
                </div>
              </div>

              {/* Representative Office */}
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-[#00ff88] tracking-wider uppercase mb-1">
                    VĂN PHÒNG ĐẠI DIỆN
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    L17-11, Tầng 17, Tòa nhà Vincom Center, Số 72 Lê Thánh Tôn, Phường Bến Nghé, TP. HCM, Việt Nam
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Copyright Footer */}
        <div className="border-t border-emerald-950 mt-8 pt-8 flex items-center justify-center text-center gap-2 text-[10px] text-zinc-500 font-medium tracking-widest uppercase">
          <p>© {currentYear} BẢN QUYỀN THUỘC VỀ PIONE TRACE. BẢO LƯU MỌI QUYỀN.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
