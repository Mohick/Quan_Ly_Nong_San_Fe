import { NextResponse } from "next/server";
import axiosInstance from "@/lib/axios";

export async function GET() {
  try {
    let url = "/farms/get-all";
    let baseURL = axiosInstance.defaults.baseURL || process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:8080/api/v1";
    if (baseURL.includes("localhost")) {
      baseURL = baseURL.replace("localhost", "127.0.0.1");
    }
    console.log("Calling backend GET at:", baseURL + url);
    const res = await axiosInstance.get(url, { baseURL });
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    console.error("Lỗi chi tiết Route Handler /api/farms/get-all:", error.response?.data || error.message || error);
    return NextResponse.json(
      { message: error.response?.data?.message || error.message || "Lỗi lấy danh sách nông trại" },
      { status: error.response?.status || 500 }
    );
  }
}
