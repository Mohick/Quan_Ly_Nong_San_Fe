"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: "Sản phẩm", href: "/san-pham" },
    { name: "Nhà vườn", href: "/nha-vuon" },
    { name: "Truy xuất QR", href: "/truy-xuat-qr" },
    { name: "Hỗ trợ", href: "/ho-tro" },
  ];

  return (
    <footer className="w-full bg-[#eaf6ed] text-[#334e40] py-12 md:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

          {/* Logo and Intro Column */}
          <div className="space-y-4">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <img src="/logo.svg" alt="PIONE" className="h-12 w-12 object-contain" />
              <span className="font-extrabold text-[#0a5c36] text-xl tracking-wider select-none">
                PIONE GROUP
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#4a5d52] max-w-sm">
              Hệ thống quản lý vườn nông sản và thương mại hóa nông sản, kết nối nông dân, thương lái, người bán và khách hàng trên cùng một nền tảng.
            </p>
          </div>

          {/* Links Column */}
          <div className="space-y-4 md:pl-8">
            <h3 className="font-bold text-[#0a5c36] text-base tracking-wide">
              Liên kết
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#4a5d52] hover:text-[#13a855] transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Demo Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-[#0a5c36] text-base tracking-wide">
              Liên hệ demo
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#13a855] shrink-0" />
                <span className="text-[#4a5d52]">1900 1234</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#13a855] shrink-0" />
                <span className="text-[#4a5d52]">demo@pione.local</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#13a855] shrink-0" />
                <span className="text-[#4a5d52]">Việt Nam</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Footer */}
        <div className="border-t border-[#d1ebd7] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5c7265]">
          <p>© {currentYear} PIONE GROUP. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Chính sách bảo mật</Link>
            <Link href="/terms" className="hover:underline">Điều khoản dịch vụ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
