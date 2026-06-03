import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FarmAPI } from "@/lib/_api/farm";

export async function GET(request: Request) {
  try {
    // 1. Lấy token từ Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Không tìm thấy access token" },
        { status: 401 }
      );
    }

    // 2. Gọi backend API lấy thông tin nông trại
    const res = await FarmAPI(token);

    // FarmAPI trả về { data: ... }
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("Lỗi Route Handler /api/farms/get-one:", error.message);
    return NextResponse.json(
      { message: error.message || "Lỗi lấy thông tin trang trại" },
      { status: 500 }
    );
  }
}
