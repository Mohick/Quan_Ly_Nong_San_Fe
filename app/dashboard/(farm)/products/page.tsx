"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, Check, X, 
  Package, ShoppingBag, AlertTriangle, Tag, 
  TrendingUp, CheckCircle, HelpCircle 
} from "lucide-react";
import { productAPI } from "@/lib/_api/product";

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

  // Status message
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch initial products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productAPI();
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
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
    setFormImage("https://images.unsplash.com/photo-1610348725531-843dff10902c?q=80&w=600&auto=format&fit=crop");
    setFormIsBestSeller(false);
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
    } else {
      // Create logic
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
        image: formImage,
        isBestSeller: formIsBestSeller,
      };
      setProducts((prev) => [newProduct, ...prev]);
      showNotification("Thêm sản phẩm mới thành công!", "success");
    }

    setIsModalOpen(false);
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

      {/* Premium creation / editing modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[3px] animate-fade-in font-sans">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-150 overflow-hidden transform scale-100 animate-zoom-in">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-[#fbfdfc] flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  {editingProduct ? "Cập Nhật Thông Tin Sản Phẩm" : "Thêm Nông Sản Mới Vào Cửa Hàng"}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                  {editingProduct ? "Thay đổi các trường dữ liệu bên dưới và nhấn Lưu thay đổi." : "Điền đầy đủ thông tin nông sản để tạo thẻ bán lẻ mới."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Product name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Dưa lưới Huỳnh Long VietGAP..."
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Danh mục</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-700 font-bold focus:outline-none focus:border-[#13a855] cursor-pointer transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Unit */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đơn vị tính</label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="kg, hộp, lon, chai..."
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {/* Sale Price */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Giá bán khuyến mãi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                    placeholder="đ"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                  />
                </div>

                {/* Original Price */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Giá gốc niêm yết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="đ"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                  />
                </div>

                {/* Discount percent */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Chiết khấu (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    placeholder="%"
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Đường dẫn ảnh sản phẩm</label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="URL liên kết ảnh..."
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                />
              </div>

              {/* Best Seller Checkbox */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="best-seller-check"
                  checked={formIsBestSeller}
                  onChange={(e) => setFormIsBestSeller(e.target.checked)}
                  className="w-4.5 h-4.5 text-[#13a855] border-gray-300 rounded focus:ring-[#13a855] cursor-pointer"
                />
                <label 
                  htmlFor="best-seller-check"
                  className="text-xs sm:text-sm font-bold text-gray-700 cursor-pointer select-none"
                >
                  Đánh dấu sản phẩm này là <span className="text-red-500 font-extrabold uppercase">Bán Chạy Nhất</span>
                </label>
              </div>

              {/* Modal Footer / Buttons */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-650 hover:bg-gray-50 font-bold rounded-lg text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#13a855] hover:bg-[#0f8b44] text-white font-bold rounded-lg text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-97"
                >
                  {editingProduct ? "Lưu thay đổi" : "Tạo mới sản phẩm"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}