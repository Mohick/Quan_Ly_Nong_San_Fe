import { NextResponse } from "next/server";
import { lotsAPI } from "@/lib/_api/lots";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Gọi backend API thông qua lotsAPI helper
    const res = await lotsAPI(id);

    // lotsAPI trả về { data: ... }
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("Lỗi Route Handler /api/crop-lot/get-crop-lot/[id]:", error.message);
    return NextResponse.json(
      { message: error.message || "Lỗi lấy danh sách lô canh tác" },
      { status: 500 }
    );
  }
}
