import NewsDetailClient from "./NewsDetailClient";

// 1. Định nghĩa các tham số tĩnh cho tính năng export tĩnh (output: "export") của Next.js
export async function generateStaticParams() {
  return [
    { id: "news-1" },
    { id: "news-2" },
    { id: "news-3" },
    { id: "news-4" },
    { id: "news-5" },
    { id: "news-6" }
  ];
}

// 2. Component cha (Server Component) nhận Promise params và render Client Component
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <NewsDetailClient id={resolvedParams.id} />;
}
