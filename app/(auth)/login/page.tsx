"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { extractGoogleUserProfile } from "./service";
import axios from "axios";

function getSafeRedirectPath(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const requestedPath = getSafeRedirectPath(
        new URLSearchParams(window.location.search).get("next"),
      );
      if (requestedPath !== "/") {
        sessionStorage.setItem("post_login_redirect", requestedPath);
      }

      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get("id_token");

      if (idToken) {
        setIsLoading(true);
        setErrorMessage("");
        try {
          const profile = await extractGoogleUserProfile(idToken);
          if (profile) {
            // Save profile details into localStorage
            localStorage.setItem("user", JSON.stringify(profile));
            const redirectPath = getSafeRedirectPath(
              sessionStorage.getItem("post_login_redirect"),
            );
            sessionStorage.removeItem("post_login_redirect");
            window.location.href = redirectPath;
          } else {
            alert("Đăng nhập thất bại. Không thể lấy hồ sơ người dùng.");
          }
        } catch (error) {
          console.error("Login error:", error);
          const message = axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : error instanceof Error
              ? error.message
              : "Loi he thong trong qua trinh dang nhap.";
          setErrorMessage(message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleCallback();
  }, []);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setErrorMessage("");

    const requestedPath = getSafeRedirectPath(
      new URLSearchParams(window.location.search).get("next"),
    );
    if (requestedPath !== "/") {
      sessionStorage.setItem("post_login_redirect", requestedPath);
    }

    // Read from client-side config or defaults
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your_google_client_id_here.apps.googleusercontent.com";
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || "http://localhost:3000/login";
    const responseType = "id_token token";
    const scope = "openid profile email";

    // Construct Google OAuth2 login page redirect link
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=${encodeURIComponent(responseType)}&scope=${encodeURIComponent(scope)}&nonce=${Math.random().toString(36).substring(2)}`;

    // Start Google authentication redirect
    window.location.href = googleAuthUrl;
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#f0f9f4] via-[#ffffff] to-[#eaf5ef] px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left Side: Welcoming Branding Panel */}
        <div className="relative bg-gradient-to-br from-[#13a855] to-[#0a5c36] p-8 md:p-12 text-white flex flex-col justify-between overflow-hidden">
          {/* Background Decorative Circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <Link href="/" className="flex items-center gap-2.5 z-10 select-none">
            <div className="flex items-center justify-center w-8 h-8 bg-white p-1 rounded-lg">
              <svg className="w-7 h-7" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 3.5L4 11.5V27.5L18 35.5V19.5L18 3.5Z" fill="#0891b2" />
                <path d="M18 3.5L32 11.5V27.5L18 35.5V19.5L18 3.5Z" fill="#0ea5e9" opacity="0.9" />
                <path d="M18 3.5L32 11.5L25 15.5L11 7.5L18 3.5Z" fill="#f97316" />
              </svg>
            </div>
            <span className="font-extrabold text-white text-lg tracking-wider">
              PIONE GROUP
            </span>
          </Link>

          <div className="space-y-4 my-12 z-10">
            <h2 className="text-3xl font-black leading-tight tracking-tight">
              Real - World AI & Blockchain Solutions
            </h2>
            <p className="text-sm text-emerald-100 font-medium leading-relaxed">
              Hệ thống quản lý vườn thông minh và nâng tầm nông sản sạch Việt Nam trên thị trường số.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-[#e6fbf1] bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Dữ liệu bảo mật tuyệt đối</span>
            </div>
          </div>

          <p className="text-xs text-emerald-200/80 z-10">
            © {new Date().getFullYear()} PIONE GROUP. All rights reserved.
          </p>
        </div>

        {/* Right Side: Google Login Panel */}
        <div className="p-8 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="space-y-2.5 mb-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
              Đăng nhập
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
              Vui lòng sử dụng tài khoản Google doanh nghiệp đã được cấp quyền truy cập để đăng nhập vào hệ thống.
            </p>
          </div>

          {/* Premium Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 border border-gray-200 hover:border-[#13a855]/30 rounded-2xl bg-white hover:bg-gray-50/50 active:scale-98 transition-all duration-200 shadow-md shadow-gray-100/50 text-sm font-extrabold text-gray-700 cursor-pointer hover:shadow-lg"
          >
            {/* Google Colorful Icon SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>{isLoading ? "Đang liên kết..." : "Đăng nhập bằng tài khoản Google"}</span>
          </button>

          {/* Secure & Privacy Note */}
          <div className="mt-12 pt-6 border-t border-gray-100 flex items-start gap-2.5 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-[#13a855] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Chúng tôi bảo mật thông tin đăng nhập của bạn thông qua cổng xác thực bảo mật chuẩn OAuth2 của Google. Không lưu trữ thông tin nhạy cảm.
            </p>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#13a855] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
