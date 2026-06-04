"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, Check, X, 
  Package, ShoppingBag, AlertTriangle, Tag, 
  TrendingUp, CheckCircle, HelpCircle 
} from "lucide-react";
import { productAPI, createProductAPI } from "@/lib/_api/product";
import { FarmAPI } from "@/lib/_api/farm";
import { lotsAPI } from "@/lib/_api/lots";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface Product {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewsCount?: number;
  soldQuantity: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  image: string;
  images?: string[];
  isBestSeller?: boolean;
  unit: string;
}

export default function DashboardProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Trái cây cao cấp");
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formUnit, setFormUnit] = useState("kg");
  const [formDiscount, setFormDiscount] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);

  // New fields for backend API
  const [lots, setLots] = useState<any[]>([]);
  const [formCropLotId, setFormCropLotId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStock, setFormStock] = useState("10");
  const [formImageFiles, setFormImageFiles] = useState<File[]>([]);

  // Status message
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch initial products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = getCookie("access_token");
        const res = await productAPI(token);
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchLotsData = async () => {
      try {
        const token = getCookie("access_token");
        const farmRes = await FarmAPI(token);
        const activeFarmId = farmRes?.data?.id || farmRes?.data?.ID;
        if (activeFarmId) {
          const res = await lotsAPI(activeFarmId, token);
          if (res && Array.isArray(res.data)) {
            setLots(res.data);
            if (res.data.length > 0) {
              setFormCropLotId(res.data[0].id || res.data[0].ID);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách lô để liên kết sản phẩm:", error);
      }
    };
    fetchProducts();
    fetchLotsData();
  }, []);

  // Display notification helper
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Open modal for adding new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory("Trái cây cao cấp");
    setFormSalePrice("");
    setFormOriginalPrice("");
    setFormUnit("kg");
    setFormDiscount("0");
    setFormImage("");
    setFormIsBestSeller(false);
    setFormDescription("");
    setFormStock("10");
    setFormImageFiles([]);
    if (lots.length > 0) {
      setFormCropLotId(lots[0].id || lots[0].ID);
    }
    setIsModalOpen(true);
  };

  // Open modal for editing a product
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormSalePrice(product.salePrice.toString());
    setFormOriginalPrice(product.originalPrice.toString());
    setFormUnit(product.unit);
    setFormDiscount(product.discountPercent.toString());
    setFormImage(product.image);
    setFormIsBestSeller(!!product.isBestSeller);
    setIsModalOpen(true);
  };

  // Handle submit (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formSalePrice || !formOriginalPrice) {
      showNotification("Vui lòng điền đầy đủ các thông tin bắt buộc!", "error");
      return;
    }

    const salePriceNum = Number(formSalePrice);
    const originalPriceNum = Number(formOriginalPrice);
    const discountNum = Number(formDiscount) || 0;

    if (isNaN(salePriceNum) || isNaN(originalPriceNum)) {
      showNotification("Giá tiền phải là dạng số hợp lệ!", "error");
      return;
    }

    if (editingProduct) {
      // Update logic
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formName,
                category: formCategory,
                salePrice: salePriceNum,
                originalPrice: originalPriceNum,
                discountPercent: discountNum,
                unit: formUnit,
                image: formImage,
                isBestSeller: formIsBestSeller,
              }
            : p
        )
      );
      showNotification("Cập nhật sản phẩm thành công!", "success");
      setIsModalOpen(false);
    } else {
      // Create logic
      const token = getCookie("access_token");
      const formData = new FormData();
      formData.append("crop_lot_id", formCropLotId);
      formData.append("name", formName);
      formData.append("description", formDescription);
      formData.append("price", formSalePrice);
      formData.append("stock", formStock);
      
      formImageFiles.forEach((file) => {
        formData.append("image", file);
      });

      createProductAPI(formData, token)
        .then((res) => {
          showNotification("Thêm sản phẩm mới lên Backend thành công!", "success");
          const newProduct: Product = {
            id: res.data?.data?.id || res.data?.data?.ID || (products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1),
            name: formName,
            category: formCategory,
            rating: 5.0,
            reviewsCount: 0,
            soldQuantity: "0 kg",
            salePrice: salePriceNum,
            originalPrice: originalPriceNum,
            discountPercent: discountNum,
            unit: formUnit,
            image: formImageFiles.length > 0 ? URL.createObjectURL(formImageFiles[0]) : formImage || "https://images.unsplash.com/photo-1610348725531-843dff10902c?q=80&w=600&auto=format&fit=crop",
            isBestSeller: formIsBestSeller,
          };
          setProducts((prev) => [newProduct, ...prev]);
        })
        .catch((err) => {
          console.error("Lỗi khi thêm sản phẩm lên Backend:", err);
          showNotification("Lỗi Backend: " + (err.response?.data?.message || err.message), "error");
          
          // Fallback locally
          const newProduct: Product = {
            id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
            name: formName,
            category: formCategory,
            rating: 5.0,
            reviewsCount: 0,
            soldQuantity: "0 kg",
            salePrice: salePriceNum,
            originalPrice: originalPriceNum,
            discountPercent: discountNum,
            unit: formUnit,
            image: formImageFiles.length > 0 ? URL.createObjectURL(formImageFiles[0]) : formImage || "https://images.unsplash.com/photo-1610348725531-843dff10902c?q=80&w=600&auto=format&fit=crop",
            isBestSeller: formIsBestSeller,
          };
          setProducts((prev) => [newProduct, ...prev]);
        });
      setIsModalOpen(false);
    }
  };

  // Delete product logic
  const handleDeleteProduct = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showNotification("Đã xóa sản phẩm khỏi danh sách thành công!", "success");
    }
  };

  // Format Price to VND Currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Categories list based on real product.json
  const categories = [
    "Trái cây cao cấp",
    "Đặc sản Đà Lạt",
    "Trái cây nhiệt đới",
    "Đồ khô đóng gói",
    "Rau củ hữu cơ",
    "Gia vị & Thảo mộc",
  ];

  // Filtering products for the table
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate statistics
  const totalProducts = products.length;
  const bestSellersCount = products.filter((p) => p.isBestSeller).length;
  const avgDiscount = products.length > 0
    ? Math.round(products.reduce((acc, p) => acc + p.discountPercent, 0) / products.length)
    : 0;

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">
      
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4.5 py-3 rounded-lg shadow-xl text-sm font-bold border transition-all duration-300 animate-slide-in ${
            notification.type === "success" 
              ? "bg-[#e8f8f0] text-[#13a855] border-[#cbeed7]" 
              : "bg-red-50 text-red-600 border-red-100"
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Sản Phẩm Nông Sản
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Thêm mới, sửa đổi thông tin hoặc xóa các sản phẩm trong hệ thống cửa hàng.
          </p>
        </div>
        
        {/* Create CTA Button */}
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#13a855] hover:bg-[#0f8b44] text-white text-xs sm:text-sm font-bold rounded-lg shadow-md active:scale-97 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#e8f8f0] text-[#13a855] rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Tổng sản phẩm</span>
            <span className="text-xl font-extrabold text-gray-800">{totalProducts} mặt hàng</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Bán chạy nhất</span>
            <span className="text-xl font-extrabold text-gray-800">{bestSellersCount} sản phẩm</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-lg">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Giảm giá trung bình</span>
            <span className="text-xl font-extrabold text-gray-800">{avgDiscount}% chiết khấu</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-500 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Khu vực bán lẻ</span>
            <span className="text-xl font-extrabold text-gray-800">{categories.length} danh mục</span>
          </div>
        </div>
      </div>

      {/* Main filter, search and list card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Controls Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên sản phẩm..."
              className="w-full bg-[#f4fbf7]/40 border border-[#c2ecd3] rounded-md py-2 px-3 pl-10 text-xs sm:text-sm text-gray-800 placeholder-[#8ca496] focus:outline-none focus:ring-1 focus:ring-[#13a855] focus:border-[#13a855] transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Lọc theo:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-300 hover:border-[#13a855]/40 rounded-md py-2 px-3 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-[#13a855] font-bold transition-all cursor-pointer shadow-sm"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto w-full">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 font-medium">
              Đang tải danh sách sản phẩm...
            </div>
          ) : filteredProducts.length > 0 ? (
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] sm:text-xs">
                <tr>
                  <th className="py-4 px-6">Sản phẩm</th>
                  <th className="py-4 px-4">Danh mục</th>
                  <th className="py-4 px-4 text-right">Giá bán / Đơn vị</th>
                  <th className="py-4 px-4 text-center">Khuyến mãi</th>
                  <th className="py-4 px-4 text-center">Best Seller</th>
                  <th className="py-4 px-6 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Item Image & Title */}
                    <td className="py-4.5 px-6 flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100 bg-gray-50"
                      />
                      <div className="max-w-xs sm:max-w-md">
                        <span className="block font-extrabold text-gray-850 text-xs sm:text-sm leading-tight mb-1 hover:text-[#13a855] transition-colors">
                          {product.name}
                        </span>
                        <span className="block text-[10px] text-gray-400">ID: #{product.id}</span>
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td className="py-4.5 px-4">
                      <span className="px-2.5 py-1 bg-[#e8f8f0] text-[#13a855] border border-[#cbeed7] rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap">
                        {product.category}
                      </span>
                    </td>

                    {/* Price and Unit */}
                    <td className="py-4.5 px-4 text-right">
                      <span className="block font-black text-gray-900">{formatPrice(product.salePrice)}</span>
                      <span className="block text-[10px] text-gray-400 font-normal">/{product.unit}</span>
                    </td>

                    {/* Discount percent */}
                    <td className="py-4.5 px-4 text-center">
                      <span className="font-extrabold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded text-[10px] sm:text-xs">
                        -{product.discountPercent}%
                      </span>
                    </td>

                    {/* Best Seller Check */}
                    <td className="py-4.5 px-4 text-center">
                      <div className="flex justify-center">
                        {product.isBestSeller ? (
                          <span className="p-1 bg-[#e8f8f0] text-[#13a855] border border-[#cbeed7] rounded-full">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                    </td>

                    {/* Actions buttons */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-2 text-gray-500 hover:text-[#13a855] hover:bg-[#e8f8f0] border border-gray-200 hover:border-[#13a855]/30 rounded-lg cursor-pointer transition-all active:scale-95"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 rounded-lg cursor-pointer transition-all active:scale-95"
                          title="Xóa sản phẩm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center bg-gray-50/50">
              <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium text-sm">Không tìm thấy sản phẩm nào khớp với tìm kiếm.</p>
            </div>
          )}
        </div>

      </div>

      {/* Shopify-like two-column product creation modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[3px] animate-fade-in font-sans">
          <div className="bg-[#f6f6f7] w-full max-w-6xl rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform scale-100 animate-zoom-in flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-gray-900">
                  {editingProduct ? "Cập Nhật Thông Tin Sản Phẩm" : "Thêm Nông Sản Mới Vào Cửa Hàng"}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Quản lý thông tin chi tiết, định mức giá bán và phân phối lô đất.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Body - Two-column Shopify editor layout */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column (md:col-span-2) - Main details */}
              <div className="md:col-span-2 space-y-6">
                
                {/* 1. Title & Description Box */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Tiêu đề (Title) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ví dụ: Short sleeve t-shirt, Dưa lưới Huỳnh Long..."
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Mô tả (Description) <span className="text-red-500">*</span></label>
                    {/* Rich text formatting bar mockup matching the Shopify design */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#13a855] focus-within:ring-1 focus-within:ring-[#13a855] transition-all bg-white">
                      <div className="flex flex-wrap items-center gap-1 bg-gray-50 border-b border-gray-200 p-2 text-gray-500 text-xs font-medium">
                        <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer">✨</button>
                        <select className="bg-transparent hover:bg-gray-200 p-1 rounded text-[11px] font-bold cursor-pointer outline-none">
                          <option>Paragraph</option>
                          <option>Heading 1</option>
                          <option>Heading 2</option>
                        </select>
                        <span className="h-4 w-[1px] bg-gray-300 mx-1"></span>
                        <button type="button" className="p-1 font-bold hover:bg-gray-200 rounded w-6 cursor-pointer">B</button>
                        <button type="button" className="p-1 italic hover:bg-gray-200 rounded w-6 cursor-pointer">I</button>
                        <button type="button" className="p-1 underline hover:bg-gray-200 rounded w-6 cursor-pointer">U</button>
                        <span className="h-4 w-[1px] bg-gray-300 mx-1"></span>
                        <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer">🔗</button>
                        <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer">🖼️</button>
                        <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer">🎥</button>
                      </div>
                      <textarea
                        required
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Mô tả chi tiết sản phẩm, nguồn gốc xuất xứ..."
                        rows={5}
                        className="w-full border-none p-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Media Upload Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                  <label className="text-xs font-bold text-gray-700">Hình ảnh sản phẩm (Media) <span className="text-red-500">*</span></label>
                  
                  {editingProduct ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="URL liên kết ảnh..."
                        className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                      />
                      {formImage && (
                        <div className="relative w-28 h-28 border border-gray-200 rounded-lg overflow-hidden">
                          <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#13a855] transition-all bg-gray-50 flex flex-col items-center justify-center relative">
                      {formImageFiles.length > 0 ? (
                        <div className="space-y-4 w-full">
                          <div className="grid grid-cols-3 gap-3">
                            {formImageFiles.map((file, idx) => (
                              <div key={idx} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden shadow-xs group">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setFormImageFiles(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 cursor-pointer flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <label className="px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[10px] font-extrabold rounded-lg shadow-sm cursor-pointer transition-all active:scale-95">
                              Thêm ảnh khác
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    const newFiles = Array.from(e.target.files);
                                    setFormImageFiles(prev => [...prev, ...newFiles]);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => setFormImageFiles([])}
                              className="text-[10px] text-red-500 hover:underline font-bold"
                            >
                              Xóa tất cả
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-center text-gray-400">
                            <Package className="w-10 h-10 stroke-[1.2]" />
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <label className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-extrabold rounded-lg shadow-sm cursor-pointer transition-all active:scale-95">
                              Chọn ảnh sản phẩm
                              <input
                                type="file"
                                required
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    setFormImageFiles(Array.from(e.target.files));
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[10px] text-gray-400 font-semibold">Có thể chọn nhiều hình ảnh cùng lúc</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Pricing, Discount and Stock Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-gray-900 border-b border-gray-100 pb-2">Giá cả & Kho hàng (Pricing & Inventory)</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Sale Price */}
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Giá bán khuyến mãi <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formSalePrice}
                        onChange={(e) => setFormSalePrice(e.target.value)}
                        placeholder="đ"
                        className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                      />
                    </div>

                    {/* Original Price */}
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Giá gốc niêm yết <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formOriginalPrice}
                        onChange={(e) => setFormOriginalPrice(e.target.value)}
                        placeholder="đ"
                        className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Discount percent */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Chiết khấu (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formDiscount}
                        onChange={(e) => setFormDiscount(e.target.value)}
                        placeholder="%"
                        className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                      />
                    </div>

                    {/* Stock */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Số lượng tồn kho (stock) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        placeholder="Ví dụ: 10..."
                        className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (md:col-span-1) - Metadata & Settings */}
              <div className="md:col-span-1 space-y-6">
                
                {/* 1. Status Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                  <label className="text-xs font-bold text-gray-700 block">Trạng thái (Status)</label>
                  <select className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#13a855] cursor-pointer transition-all">
                    <option>Active</option>
                    <option>Draft</option>
                  </select>
                </div>

                {/* 2. Publishing Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Publishing</span>
                    <span className="text-[10px] text-gray-400 cursor-pointer">⚙️</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                    <span>📢</span>
                    <span>All channels</span>
                  </div>
                </div>

                {/* 3. Product organization Card (Specifically linking crop lot id) */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-gray-700">Thông tin Phân loại (Organization)</span>
                    <span className="text-gray-400 text-[10px] font-bold cursor-help" title="Liên kết sản phẩm với một lô canh tác cụ thể">ℹ️</span>
                  </div>

                  {/* crop_lot_id dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Lô canh tác liên kết <span className="text-red-500">*</span></label>
                    <select
                      value={formCropLotId}
                      required
                      onChange={(e) => setFormCropLotId(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-707 font-bold focus:outline-none focus:border-[#13a855] cursor-pointer transition-all"
                    >
                      {lots.map((lot) => (
                        <option key={lot.id || lot.ID} value={lot.id || lot.ID}>
                          {lot.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category select */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Danh mục (Category)</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-707 font-bold focus:outline-none focus:border-[#13a855] cursor-pointer transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Đơn vị tính</label>
                    <input
                      type="text"
                      required
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      placeholder="kg, hộp, lon..."
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] transition-all font-semibold"
                    />
                  </div>

                  {/* Best Seller Checkbox */}
                  <div className="flex items-center gap-3.5 pt-2 border-t border-gray-100">
                    <input
                      type="checkbox"
                      id="best-seller-check"
                      checked={formIsBestSeller}
                      onChange={(e) => setFormIsBestSeller(e.target.checked)}
                      className="w-4.5 h-4.5 text-[#13a855] border-gray-300 rounded focus:ring-[#13a855] cursor-pointer"
                    />
                    <label 
                      htmlFor="best-seller-check"
                      className="text-[11px] font-bold text-gray-700 cursor-pointer select-none"
                    >
                      Bán Chạy Nhất (Best Seller)
                    </label>
                  </div>
                </div>

              </div>

            </form>

            {/* Modal Footer / Action controls */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-white border border-gray-300 text-gray-650 hover:bg-gray-50 font-bold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-[#13a855] hover:bg-[#0f8b44] text-white font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer active:scale-97"
              >
                {editingProduct ? "Lưu thay đổi" : "Tạo mới sản phẩm"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}