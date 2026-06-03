import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createLotAPI } from "@/lib/_api/create_lots";

export async function POST(request: Request) {
  try {
    // 1. Lấy token từ Header hoặc Cookie
    let authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      const cookieStore = await cookies();
      const token = cookieStore.get("access_token")?.value;
      if (token) {
        authHeader = `Bearer ${token}`;
      }
    }

    if (!authHeader) {
      return NextResponse.json(
        { message: "Không tìm thấy access token" },
        { status: 401 }
      );
    }

    // 2. Lấy dữ liệu JSON từ request gửi lên
    const payload = await request.json();

    // 3. Gọi backend API thông qua lots API helper
    const res = await createLotAPI(payload, authHeader);

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    console.error("Lỗi Route Handler /api/farms/new-crop-lot:", error.message);
    if (error.response?.data) {
      console.error("Chi tiết lỗi từ Backend:", error.response.data);
    }
    return NextResponse.json(
      { message: error.response?.data?.message || error.message || "Lỗi tạo mới lô canh tác" },
      { status: error.response?.status || 500 }
    );
  }
}
