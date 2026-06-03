import { NextResponse } from "next/server";
import axiosInstance from "@/lib/axios";

export async function GET() {
  try {
    const res = await axiosInstance.get("/farms/get-all");
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    console.error("Lỗi Route Handler /api/farms/get-all:", error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || error.message || "Lỗi lấy danh sách nông trại" },
      { status: error.response?.status || 500 }
    );
  }
}
