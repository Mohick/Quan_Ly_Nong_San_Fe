import FarmDetailClient from "@/components/FarmDetail/page";
import axios from "axios";

// 1. Định nghĩa các tham số tĩnh cho tính năng export tĩnh (output: "export") của Next.js
export async function generateStaticParams() {
  try {
    const res = await axios.get("http://127.0.0.1:8080/api/v1/farms/get-all");
    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    
    if (list.length === 0) {
      return [{ id: "1" }, { id: "2" }, { id: "3" }];
    }
    
    return list.map((f: any) => ({
      id: f.id || f.ID,
    }));
  } catch (e) {
    console.error("Lỗi khi sinh static params cho farm:", e);
    return [
      { id: "1" },
      { id: "2" },
      { id: "3" },
      { id: "4" },
      { id: "5" },
      { id: "6" }
    ];
  }
}

// 2. Component cha (Server Component) nhận Promise params và render Client Component
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <FarmDetailClient id={resolvedParams.id} />;
}