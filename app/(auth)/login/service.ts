/**
 * Service xử lý đăng nhập bằng tài khoản Google/Email và giải mã Token
 */

import { loginAPI } from "@/lib/_api/login";

export interface UserProfile {
  username: string;
  image: string;
  email: string;
}

/**
 * Hàm giải mã JWT Token (Google OAuth Credential Token) phía Client mà không cần thư viện ngoài
 * @param token Chuỗi JWT token nhận được từ Google OAuth
 */
export function decodeJWT(token: string): any {
  try {
    if (!token || token === "undefined" || !token.includes(".")) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Lỗi khi giải mã JWT Token:", error);
    return null;
  }
}

/**
 * Trích xuất các thông tin chi tiết từ Google Token bao gồm:
 * 1. Username (Tên người dùng)
 * 2. Image (Ảnh đại diện đại diện của email)
 * 3. Email (Địa chỉ email chủ sở hữu)
 * @param token Chuỗi Google JWT credential
 */
export async function extractGoogleUserProfile(
  token: string,
): Promise<UserProfile | null> {
  const payload = decodeJWT(token);
  if (!payload) return null;
  const result = await loginAPI({
    full_name: payload.name || payload.given_name || "Người dùng PIONE",
    email: payload.email || "",
    avatar_url: payload.picture || "",
  });
  document.cookie = `access_token=${result.data.data.access_token}; path=/; SameSite=Lax`;

  return {
    username: payload.name || payload.given_name || "Người dùng PIONE",
    image: payload.picture || "",
    avatar_url: payload.picture || "",
    avatarUrl: payload.picture || "",
    email: payload.email || "",
  };
}

/**
 * Cấu hình các biến môi trường Client-side phục vụ Google Đăng nhập
 */
export const googleOAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  redirectUri:
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/login",
};
