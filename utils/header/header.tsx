"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, LogOut, Settings, Heart, Store, MessageSquare } from "lucide-react";
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
  const displayName =
    (user as any)?.FullName ||
    (user as any)?.full_name ||
    (user as any)?.username ||
    "Người dùng PIONE";
  const avatarUrl =
    (user as any)?.AvatarURL ||
    (user as any)?.avatar_url ||
    (user as any)?.image ||
    "";
  const userRole = (user as any)?.Role || (user as any)?.role || "MEMBER";

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Sản phẩm", href: "/products" },
    { name: "Nhà vườn", href: "/farm" },
    { name: "Tin tức", href: "/news" },
    { name: "Liên hệ", href: "/contact" },
  ];
  console.log(displayName);

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
        className={`sticky top-0 z-50 w-full bg-cover bg-center bg-no-repeat font-sans shadow-sm transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ backgroundImage: 'url("/header.png")' }}
      >
        {/* Top Header Bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-24 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="PIONE GROUP"
                className="h-10 w-auto object-contain sm:h-12"
              />
              <span className="text-base font-extrabold tracking-wider text-white uppercase select-none sm:text-lg">
                Pione Group
              </span>
            </Link>

            {/* Navigation Links - Desktop */}
            <nav className="mx-auto hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative py-1 text-[15px] font-bold tracking-wide transition-all duration-200 hover:text-[#00ff88] ${
                      isActive ? "text-[#00ff88]" : "text-zinc-300"
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[#00ff88]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Actions & Cart */}
            <div className="flex items-center gap-4">
              {/* Cart Icon */}
              {user && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/chat"
                    className="relative cursor-pointer rounded-full bg-[#e8f8f0] p-3 text-[#13a855] transition-all duration-200 hover:bg-[#d4f2e1] active:scale-95"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/cart"
                    className="relative cursor-pointer rounded-full bg-[#e8f8f0] p-3 text-[#13a855] transition-all duration-200 hover:bg-[#d4f2e1] active:scale-95"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}
              {/* Auth Buttons - Desktop */}
              {loading ? (
                <div className="hidden items-center gap-3 lg:flex">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#13a855] border-t-transparent" />
                </div>
              ) : user ? (
                <div className="relative hidden lg:block">
                  {/* Profile Box Trigger (opens Left Drawer on Click) */}
                  <div
                    onClick={() => setIsProfileDrawerOpen(true)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-[#d1f2e0] bg-[#f0f9f4] px-3.5 py-1.5 transition-all duration-300 select-none hover:bg-[#e2f5eb]"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-8 w-8 rounded-full border border-emerald-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#13a855] text-xs font-extrabold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-xs leading-tight font-black text-gray-800">
                        {displayName}
                      </span>
                      <span className="text-[9px] font-extrabold tracking-wider text-emerald-600">
                        {userRole}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden items-center gap-3 lg:flex">
                  <Link href="/login">
                    <button className="cursor-pointer rounded-xl border-2 border-[#13a855] px-5 py-2 text-sm font-bold text-[#13a855] transition-all duration-200 hover:bg-[#e8f8f0] active:scale-98">
                      Đăng nhập
                    </button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative z-50 flex cursor-pointer items-center justify-center p-3.5 text-white transition-all hover:text-[#00ff88] active:scale-95 lg:hidden"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-7 w-7" />
                ) : (
                  <Menu className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 opacity-100 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Menu (Slides in from the right, occupies 1/4 viewport width on tablet/desktop sizes) */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-[280px] max-w-[90vw] flex-col bg-white shadow-2xl transition-all duration-300 ease-in-out sm:w-[320px] md:w-[25vw] lg:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none invisible translate-x-full opacity-0"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
          <span className="text-base font-black text-gray-800">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="cursor-pointer rounded-xl p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Links */}
          <nav className="flex flex-col space-y-1.5 px-3">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    isActive
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
            <div className="mt-2 space-y-2 border-t border-gray-100 px-3 pt-4">
              <div
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsProfileDrawerOpen(true);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2 shadow-sm transition-colors hover:bg-gray-50"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#13a855] text-xs font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="max-w-[130px] truncate text-xs leading-tight font-black text-gray-800">
                    {displayName}
                  </p>
                  <p className="text-[9px] font-extrabold tracking-wider text-emerald-600">
                    {userRole}
                  </p>
                </div>
              </div>
            </div>
          )}
          {!loading && !user && (
            <div className="mt-2 border-t border-gray-100 px-3 pt-4">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block"
              >
                <button className="w-full cursor-pointer rounded-xl border border-[#13a855] py-2.5 text-xs font-bold text-[#13a855] hover:bg-[#e8f8f0]">
                  Đăng nhập
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Drawer Footer / Loading indicator only */}
        {loading && (
          <div className="flex justify-center border-t border-gray-100 bg-gray-50/50 p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#13a855] border-t-transparent" />
          </div>
        )}
      </div>

      {/* Profile Drawer Backdrop */}
      {isProfileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 opacity-100 transition-opacity duration-300"
          onClick={() => setIsProfileDrawerOpen(false)}
        />
      )}

      {/* Profile Drawer (Slides in from the right, takes up 1/5 of viewport on lg screens) */}
      <div
        className={`fixed inset-y-0 right-0 z-[60] flex h-full w-full max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[420px] lg:w-[460px] xl:w-[500px] ${
          isProfileDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
          <span className="text-base font-black text-gray-800">Tài khoản</span>
          <button
            onClick={() => setIsProfileDrawerOpen(false)}
            className="cursor-pointer rounded-xl p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
          {/* User Profile Card */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-100/50 bg-emerald-50/40 p-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13a855] text-sm font-black text-white shadow-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="truncate text-sm leading-tight font-black text-gray-800">
                {displayName}
              </p>
              <p className="mt-0.5 text-[10px] font-extrabold tracking-wider text-emerald-600 uppercase">
                {userRole}
              </p>
            </div>
          </div>

          {/* Account Links */}
          <nav className="flex flex-col space-y-1">
            <Link
              href="/settings"
              onClick={() => setIsProfileDrawerOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-[#f0f9f4] hover:text-[#13a855]"
            >
              <Settings className="h-4.5 w-4.5 shrink-0" />
              <span>Cài đặt tài khoản</span>
            </Link>

            <Link
              href="/history"
              onClick={() => setIsProfileDrawerOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-[#f0f9f4] hover:text-[#13a855]"
            >
              <ShoppingCart className="h-4.5 w-4.5 shrink-0" />
              <span>Lịch sử mua hàng</span>
            </Link>

            <Link
              href="/favorites"
              onClick={() => setIsProfileDrawerOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-[#f0f9f4] hover:text-[#13a855]"
            >
              <Heart className="h-4.5 w-4.5 shrink-0" />
              <span>Mục yêu thích</span>
            </Link>
          </nav>
        </div>

        {/* Drawer Footer Logout */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-5">
          <button
            onClick={() => {
              setIsProfileDrawerOpen(false);
              logout();
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-xs font-bold text-red-600 transition-all hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
