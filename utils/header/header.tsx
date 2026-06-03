"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X, LogOut, Settings, FileText } from "lucide-react";
import { useAutoLogin } from "@/hooks/useAutoLogin";

const Header = () => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAutoLogin();

  // Trích xuất an toàn các trường thông tin có fallback để tránh crash lỗi undefined
  const displayName = (user as any)?.FullName || (user as any)?.full_name || (user as any)?.username || "Người dùng PIONE";
  const avatarUrl = (user as any)?.AvatarURL || (user as any)?.avatar_url || (user as any)?.image || "";
  const userRole = (user as any)?.Role || (user as any)?.role || "MEMBER";

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Sản phẩm", href: "/products" },
    { name: "Nhà vườn", href: "/farm" },
    { name: "Tin tức", href: "/news" },
    { name: "Liên hệ", href: "/contact" },

  ];

  return (
    <header className="w-full bg-white shadow-sm font-sans">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10">
              {/* Premium 3D Isometric Hexagon Logo matching the image */}
              <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left Facet - Dark Cyan/Blue */}
                <path d="M18 3.5L4 11.5V27.5L18 35.5V19.5L18 3.5Z" fill="#0891b2" />
                {/* Right Facet - Medium Cyan */}
                <path d="M18 3.5L32 11.5V27.5L18 35.5V19.5L18 3.5Z" fill="#0ea5e9" opacity="0.9" />
                {/* Top/Accent Highlights - Orange segment */}
                <path d="M18 3.5L32 11.5L25 15.5L11 7.5L18 3.5Z" fill="#f97316" />
                {/* Negative space / 3D cutouts */}
                <path d="M18 19.5L32 11.5L18 3.5L4 11.5L18 19.5Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M18 19.5V35.5" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="font-extrabold text-[#0a5c36] text-xl tracking-wider select-none">
              PIONE GROUP
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full bg-[#f4fbf7] border border-[#d1f2e0] rounded-full py-2.5 pl-6 pr-12 text-sm text-[#2c3e50] placeholder-[#8ca496] focus:outline-none focus:ring-2 focus:ring-[#13a855]/20 focus:border-[#13a855] transition-all duration-300"
              />
              <Search className="absolute right-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#13a855] opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
            </div>
          </div>

          {/* User Actions & Cart */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="p-3 bg-[#e8f8f0] text-[#13a855] rounded-full hover:bg-[#d4f2e1] active:scale-95 transition-all duration-200 cursor-pointer relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-sm">
                0
              </span>
            </Link>

            {/* Auth Buttons - Desktop */}
            {loading ? (
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#13a855] animate-spin" />
              </div>
            ) : user ? (
              <div className="hidden lg:block relative group">
                {/* Profile Box Trigger */}
                <div className="flex items-center gap-2.5 bg-[#f0f9f4] border border-[#d1f2e0] px-3.5 py-1.5 rounded-2xl select-none cursor-pointer hover:bg-[#e2f5eb] transition-all duration-300">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full border border-emerald-200 object-cover animate-in fade-in duration-300" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#13a855] text-white flex items-center justify-center font-extrabold text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-gray-800 leading-tight">{displayName}</span>
                    <span className="text-[9px] text-emerald-600 font-extrabold tracking-wider">{userRole}</span>
                  </div>
                </div>

                {/* Hover Dropdown Menu - Glassmorphic design */}
                <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-xl py-2 z-50 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out">
                  <div className="px-4 py-2 border-b border-gray-50/50">
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Tài khoản</p>
                    <p className="text-xs font-black text-gray-700 truncate">{displayName}</p>
                  </div>

                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-gray-600 hover:text-[#13a855] hover:bg-[#f0f9f4] transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Cài đặt</span>
                  </Link>

                  <Link
                    href="/history"
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-gray-600 hover:text-[#13a855] hover:bg-[#f0f9f4] transition-colors"
                  >
                    <span>Lịch sử mua hàng</span>
                  </Link>

                  <div className="border-t border-gray-50/50 my-1.5"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3">
                <Link href="/login">
                  <button className="px-5 py-2 border-2 border-[#13a855] text-[#13a855] font-bold rounded-xl hover:bg-[#e8f8f0] active:scale-98 transition-all duration-200 cursor-pointer text-sm">
                    Đăng nhập
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#13a855] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar - Desktop */}
      <div className="border-t border-[#e2f8ec] hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center items-center py-4 gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[15px] font-bold tracking-wide transition-all duration-200 hover:text-[#13a855] relative py-1 ${isActive ? "text-[#13a855]" : "text-gray-800"
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#13a855] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e2f8ec] bg-white animate-in slide-in-from-top duration-250">
          <div className="px-4 py-4 space-y-4">
            {/* Search Bar - Mobile */}
            <div className="relative w-full md:hidden">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                className="w-full bg-[#f4fbf7] border border-[#d1f2e0] rounded-full py-2 pl-5 pr-10 text-sm focus:outline-none focus:border-[#13a855]"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#13a855]" />
            </div>

            {/* Links */}
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${isActive
                      ? "bg-[#e8f8f0] text-[#13a855]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#13a855]"
                      }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Auth Buttons - Mobile */}
            {loading ? (
              <div className="flex justify-center py-4 border-t border-gray-100">
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-[#13a855] animate-spin" />
              </div>
            ) : user ? (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-emerald-50/50 rounded-xl">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#13a855] text-white flex items-center justify-center font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-800">{displayName}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">{userRole}</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <button className="w-full py-2 border border-[#13a855] text-[#13a855] text-sm font-semibold rounded-lg hover:bg-[#e8f8f0]">
                    Đăng nhập
                  </button>
                </Link>
                <Link href="/dang-ky" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                  <button className="w-full py-2 bg-[#13a855] text-white text-sm font-semibold rounded-lg hover:bg-[#0f8b44]">
                    Đăng ký
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
