import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!baseUrl) {
      return NextResponse.json(
        { message: "Thieu cau hinh NEXT_PUBLIC_BASE_URL" },
        { status: 500 }
      );
    }

    const backendUrl = `${baseUrl.replace(/\/$/, "")}/auth/login`;

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
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return nextResponse;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Login route error:", error.response?.data || error.message);

      const status = error.response?.status || 500;
      const errorData = error.response?.data || {
        message: "Khong ket noi duoc Backend Server",
      };

      return NextResponse.json(errorData, { status });
    }

    const message = error instanceof Error ? error.message : "Loi dang nhap khong xac dinh";
    console.error("Login route error:", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}