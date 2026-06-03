import FarmDetailClient from "@/components/FarmDetail/page";

// 1. Định nghĩa các tham số tĩnh cho tính năng export tĩnh (output: "export") của Next.js
export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" }
  ];
}

// 2. Component cha (Server Component) nhận Promise params và render Client Component
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <FarmDetailClient id={resolvedParams.id} />;
}
