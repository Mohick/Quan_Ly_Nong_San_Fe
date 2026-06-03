import { NextResponse } from "next/server";
import axiosInstance from "@/lib/axios";

export async function GET() {
  try {
    let url = "/farms/get-all";
    const baseURL = axiosInstance.defaults.baseURL || "";
    if (baseURL.includes("localhost")) {
      const ipv4BaseURL = baseURL.replace("localhost", "127.0.0.1");
      const res = await axiosInstance.get(url, { baseURL: ipv4BaseURL });
      return NextResponse.json(res.data, { status: res.status });
    }
    const res = await axiosInstance.get(url);
    return NextResponse.json(res.data, { status: res.status });
  } catch (error: any) {
    console.error("Lỗi chi tiết Route Handler /api/farms/get-all:", error.response?.data || error.message || error);
    return NextResponse.json(
      { message: error.response?.data?.message || error.message || "Lỗi lấy danh sách nông trại" },
      { status: error.response?.status || 500 }
    );
  }
}
