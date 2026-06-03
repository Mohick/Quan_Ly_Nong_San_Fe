import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductDetailView, { Product } from "@/components/productdetail/page";

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. Required generateStaticParams for Next.js "output: export"
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), "public", "product.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const products: Product[] = JSON.parse(fileData);

    return products.map((product) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// 2. Fetch single product helper at build time
async function getProductById(id: string): Promise<Product | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "product.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const products: Product[] = JSON.parse(fileData);
    const productId = parseInt(id, 10);
    return products.find((p) => p.id === productId) || null;
  } catch (e) {
    return null;
  }
}

// 3. Dynamic Products Detail Route Component (Server Component)
export default async function ProductDetail({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-500 mb-6">Sản phẩm này có thể không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link
          href="/products"
          className="flex items-center gap-2 px-6 py-3 bg-[#13a855] text-white font-bold rounded-lg hover:bg-[#0f8b44] transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang sản phẩm</span>
        </Link>
      </div>
    );
  }

  // Render the highly-interactive Client Component
  return <ProductDetailView product={product} />;
}