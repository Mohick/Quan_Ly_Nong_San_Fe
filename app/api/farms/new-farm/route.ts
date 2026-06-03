import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createFarmAPI } from "@/lib/_api/create_farm";

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

    // 2. Lấy dữ liệu FormData từ request gửi lên
    const incomingFormData = await request.formData();
    console.log(authHeader);

    const res = await createFarmAPI(incomingFormData, authHeader);

    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    console.error("Lỗi Route Handler /api/farms/new-farm:", error.message);
    return NextResponse.json(
      { message: error.message || "Lỗi tạo mới trang trại" },
      { status: 500 }
    );
  }
}
