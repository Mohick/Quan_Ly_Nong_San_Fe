"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin } from "lucide-react";

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
              Digital infrastructure for identification, authentication, traceability, and tokenization of real-world assets in agriculture, commodities, and real estate
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800/40 border border-zinc-700/30 hover:bg-[#13a855] hover:border-[#13a855] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-white">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1H13c-3 0-4 2-4 4v3z" />
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800/40 border border-zinc-700/30 hover:bg-[#13a855] hover:border-[#13a855] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-white">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.024a.066.066 0 0 0-.007.018c-.012.336-.03.73-.046 1.127-.077 1.63-.137 3.07-.144 3.187-.01.144-.084.22-.24.23a5.523 5.523 0 0 1-1.637-.156 4.757 4.757 0 0 0-1.258-.088c-1.396.096-2.585.67-3.415 1.83C5.166 7.11 4.86 8.24 4.887 9.537c.046 2.19 1.157 3.822 3.195 4.673a5.19 5.19 0 0 0 1.954.408c1.378-.027 2.493-.507 3.327-1.615.424-.564.717-1.196.883-1.89.043-.178.077-.384.108-.574.015-.098.053-.146.155-.143 1.25.043 2.5.034 3.75.028a.15.15 0 0 1 .163.125c.186.828.536 1.574 1.053 2.228a4.936 4.936 0 0 0 3.013 1.85c.162.033.24.12.24.29V10.74c0-.13-.056-.205-.183-.242a4.982 4.982 0 0 1-2.92-2.528 5.34 5.34 0 0 1-.58-2.284c-.006-.412-.008-.823-.005-1.235 0-.15-.07-.225-.218-.228-1.523-.028-3.045-.02-4.568-.02a.243.243 0 0 1-.264-.265c-.015-1.3-.01-2.602-.006-3.903v-.01c0-.1-.034-.146-.128-.15a43.5 43.5 0 0 1-2.072-.036z" />
                </svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-800/40 border border-zinc-700/30 hover:bg-[#13a855] hover:border-[#13a855] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-white">
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6 lg:pl-10">
            <h3 className="font-bold text-[#00ff88] text-[15px] tracking-widest uppercase">
              QUICK LINKS
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/nha-vuon"
                  className="text-sm text-zinc-300 hover:text-[#00ff88] transition-colors duration-200"
                >
                  Cultivation Area Map
                </Link>
              </li>
              <li>
                <Link
                  href="/tin-tuc"
                  className="text-sm text-zinc-300 hover:text-[#00ff88] transition-colors duration-200"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-zinc-300 hover:text-[#00ff88] transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-zinc-300 hover:text-[#00ff88] transition-colors duration-200"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-6">
            <h3 className="font-bold text-[#00ff88] text-[15px] tracking-widest uppercase">
              CONTACT
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-extrabold text-white leading-snug">
                  PIONE GLOBAL JOINT STOCK COMPANY
                </p>
                <p className="text-zinc-400 text-xs mt-1">
                  Tax Code: 0318759430
                </p>
                <a
                  href="https://www.pioneglobal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00ff88] text-xs hover:underline mt-1 inline-block"
                >
                  www.pioneglobal.com
                </a>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-zinc-200 text-xs">(+84) 967 103 466</span>
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-zinc-200 text-xs">(+84) 967 213 466</span>
                </li>
                <li className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-zinc-200 text-xs">info@pionetrace.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Address */}
          <div className="space-y-6">
            <h3 className="font-bold text-[#00ff88] text-[15px] tracking-widest uppercase">
              ADDRESS
            </h3>
            <div className="space-y-5 text-xs">

              {/* Headquarters */}
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-[#00ff88] tracking-wider uppercase mb-1">
                    HEADQUARTERS
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    694 Tôn Đản, Phường An Khê, TP. Đà Nẵng, Việt Nam
                  </p>
                </div>
              </div>

              {/* Southern Office */}
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-[#00ff88] tracking-wider uppercase mb-1">
                    SOUTHERN OFFICE
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    213 Tân Thắng, Phường Tân Sơn Nhì, TP.HCM, Việt Nam
                  </p>
                </div>
              </div>

              {/* Office Saint Vincent */}
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#12281d] border border-[#13a855]/30 flex items-center justify-center text-[#00ff88] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-[#00ff88] tracking-wider uppercase mb-1">
                    OFFICE SAINT VINCENT
                  </p>
                  <p className="text-zinc-300 leading-relaxed">
                    Euro House, Richmond Hill Road, P.O. Box 2897, Kingstown, Saint Vincent and the Grenadines
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Copyright Footer */}
        <div className="border-t border-emerald-950 mt-8 pt-8 flex items-center justify-center text-center gap-2 text-[10px] text-zinc-500 font-medium tracking-widest uppercase">
          <p>© {currentYear} PIONE TRACE ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
