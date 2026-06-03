import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { autoLoginAPI } from "@/lib/_api/auto_login";

export async function POST(request: Request) {
  try {
    // 1. Lấy Authorization Header từ request client gửi lên
    let authHeader = request.headers.get("Authorization");
    console.log(authHeader, 1);

    let rawToken = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      rawToken = authHeader.substring(7);
    }

    // 2. Nếu không có Header, thử lấy từ cookie "access_token"
    if (!rawToken) {
      const cookieStore = await cookies();
      const token = cookieStore.get("access_token")?.value;
      if (token) {
        rawToken = token;
      }
    }
    if (!rawToken) {
      return NextResponse.json(
        { message: "Không tìm thấy access token" },
        { status: 401 }
      );
    }

    // 4. Gửi request đến Backend thực tế qua hàm autoLoginAPI đã cấu hình sẵn (vượt CORS)
    const response = await autoLoginAPI(rawToken);

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("Lỗi Route Handler /api/auth/auto-login:", error.response?.data || error.message);

    const status = error.response?.status || 500;
    const errorData = error.response?.data || { message: "Lỗi xác thực tự động đăng nhập" };

    return NextResponse.json(errorData, { status });
  }
}
