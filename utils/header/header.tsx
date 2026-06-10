"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, Menu, X, LogOut, Settings } from "lucide-react";
import { useAutoLogin } from "@/hooks/useAutoLogin";

// Stable helper outside component so it's never re-created
function readCartCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("local_cart");
    if (!raw) return 0;
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return 0;
    return items.length;
  } catch {
    return 0;
  }
}

const Header = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const { user, loading, logout } = useAutoLogin();

  // Safe extraction of user details with fallback values
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

  const [cartCount, setCartCount] = useState(0);

  const syncCart = useCallback(() => {
    setCartCount(readCartCount());
  }, []);

  useEffect(() => {
    // Read immediately after mount
    syncCart();

    window.addEventListener("cart-updated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener("cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, [syncCart]);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If close to the top, always show header
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else {
        // Show if scrolling up, hide if scrolling down
        if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Hide header on dashboard pages
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full shadow-sm font-sans transition-transform duration-300 bg-cover bg-center bg-no-repeat ${isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        style={{ backgroundImage: 'url("/header.png")' }}
      >
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 gap-4">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="PIONE GROUP" className="h-10 sm:h-12 w-auto object-contain" />
            <span className="font-extrabold text-base sm:text-lg tracking-wider text-white uppercase select-none">
              Pione Group
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 mx-auto">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[15px] font-bold tracking-wide transition-all duration-200 hover:text-[#00ff88] relative py-1 ${isActive ? "text-[#00ff88]" : "text-zinc-300"
                    }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00ff88] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Actions & Cart */}
          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="p-3 bg-[#e8f8f0] text-[#13a855] rounded-full hover:bg-[#d4f2e1] active:scale-95 transition-all duration-200 cursor-pointer relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons - Desktop */}
            {loading ? (
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#13a855] animate-spin" />
              </div>
            ) : user ? (
              <div className="hidden lg:block relative">
                {/* Profile Box Trigger (opens Left Drawer on Click) */}
                <div 
                  onClick={() => setIsProfileDrawerOpen(true)}
                  className="flex items-center gap-2.5 bg-[#f0f9f4] border border-[#d1f2e0] px-3.5 py-1.5 rounded-2xl select-none cursor-pointer hover:bg-[#e2f5eb] transition-all duration-300"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full border border-emerald-200 object-cover" />
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
              className="lg:hidden p-2 text-zinc-300 hover:text-[#00ff88] transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Menu (Slides in from the right, occupies 1/4 viewport width on tablet/desktop sizes) */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] md:w-[25vw] max-w-[90vw] bg-white shadow-2xl z-50 lg:hidden flex flex-col transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <span className="font-black text-gray-800 text-base">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Search Bar - Mobile */}
          <div className="px-5 pb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                className="w-full bg-[#f4fbf7] border border-[#d1f2e0] rounded-full py-2.5 pl-5 pr-10 text-sm focus:outline-none focus:border-[#13a855] text-gray-800"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#13a855]" />
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-col space-y-1.5 px-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-bold py-2.5 px-4 rounded-xl transition-all ${isActive
                    ? "bg-[#e8f8f0] text-[#13a855]"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#13a855]"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Account Section - inline after links */}
          {!loading && user && (
            <div className="px-3 pt-4 mt-2 border-t border-gray-100 space-y-2">
              <div
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileDrawerOpen(true);
                }}
                className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#13a855] text-white flex items-center justify-center font-bold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-black text-gray-800 leading-tight truncate max-w-[130px]">{displayName}</p>
                  <p className="text-[9px] text-emerald-600 font-extrabold tracking-wider">{userRole}</p>
                </div>
              </div>
            </div>
          )}
          {!loading && !user && (
            <div className="px-3 pt-4 mt-2 border-t border-gray-100 flex gap-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                <button className="w-full py-2 border border-[#13a855] text-[#13a855] text-xs font-bold rounded-xl hover:bg-[#e8f8f0] cursor-pointer">Đăng nhập</button>
              </Link>
              <Link href="/dang-ky" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                <button className="w-full py-2 bg-[#13a855] text-white text-xs font-bold rounded-xl hover:bg-[#0f8b44] cursor-pointer">Đăng ký</button>
              </Link>
            </div>
          )}
        </div>

        {/* Drawer Footer / Loading indicator only */}
        {loading && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/50 flex justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-[#13a855] animate-spin" />
          </div>
        )}
      </div>

      {/* Profile Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isProfileDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsProfileDrawerOpen(false)}
      />

      {/* Profile Drawer (Slides in from the right, takes up 1/5 of viewport on lg screens) */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] lg:w-[20vw] max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isProfileDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <span className="font-black text-gray-800 text-base">Tài khoản</span>
          <button
            onClick={() => setIsProfileDrawerOpen(false)}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto py-6 px-5 space-y-6">
          {/* User Profile Card */}
          <div className="flex items-center gap-3.5 p-4 bg-emerald-50/40 border border-emerald-100/50 rounded-2xl">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#13a855] text-white flex items-center justify-center font-black text-sm shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left min-w-0">
              <p className="text-sm font-black text-gray-800 leading-tight truncate">{displayName}</p>
              <p className="text-[10px] text-emerald-600 font-extrabold tracking-wider uppercase mt-0.5">{userRole}</p>
            </div>
          </div>

          {/* Account Links */}
          <nav className="flex flex-col space-y-1">
            <Link
              href="/settings"
              onClick={() => setIsProfileDrawerOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-[#13a855] hover:bg-[#f0f9f4] rounded-xl transition-all"
            >
              <Settings className="w-4.5 h-4.5 shrink-0" />
              <span>Cài đặt tài khoản</span>
            </Link>

            <Link
              href="/history"
              onClick={() => setIsProfileDrawerOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-[#13a855] hover:bg-[#f0f9f4] rounded-xl transition-all"
            >
              <ShoppingCart className="w-4.5 h-4.5 shrink-0" />
              <span>Lịch sử mua hàng</span>
            </Link>
          </nav>
        </div>

        {/* Drawer Footer Logout */}
        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
          <button
            onClick={() => {
              setIsProfileDrawerOpen(false);
              logout();
            }}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
