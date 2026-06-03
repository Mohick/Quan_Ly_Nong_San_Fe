import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Gọi từ server Next.js đến server backend (Không bị CORS chặn)
    const backendUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`;
    
    const response = await axios.post(backendUrl, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = response.data;
    const accessToken = data?.data?.access_token;

    const nextResponse = NextResponse.json(data, { status: response.status });

    if (accessToken) {
      nextResponse.cookies.set("access_token", accessToken, {
        httpOnly: false, // Set to false so that client-side JS can read it if needed
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return nextResponse;
  } catch (error: any) {
    console.error("Lỗi Route Handler /api/auth/login:", error.response?.data || error.message);
    
    const status = error.response?.status || 500;
    const errorData = error.response?.data || { message: "Lỗi kết nối Backend Server" };
    
    return NextResponse.json(errorData, { status });
  }
}
