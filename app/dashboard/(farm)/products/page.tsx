"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Search, Edit2, Trash2, Check, X,
  Package, ShoppingBag, AlertTriangle, Tag,
  TrendingUp, CheckCircle, HelpCircle
} from "lucide-react";
import { productAPI, createProductAPI, deleteProductAPI, updateProductAPI, addDiscountAPI } from "@/lib/_api/product";
import { getDiscountByProductIdAPI, updateDiscountAPI, deleteDiscountAPI } from "@/lib/_api/discount";
import { FarmAPI } from "@/lib/_api/farm";
import { lotsAPI } from "@/lib/_api/lots";
import { getCategoriesAPI, createCategoryAPI } from "@/lib/_api/category";
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface Product {
  id: number | string;
  name: string;
  category: string;
  cropLotId?: string | null;
  cropLot?: {
    id: string;
    name: string;
    area: number;
    areaUnit: string;
    startDate: string;
    expectedHarvestDate: string;
    status: string;
  } | null;
  description?: string;
  stock?: number;
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
  const [formCategory, setFormCategory] = useState("");
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formUnit, setFormUnit] = useState("kg");
  const [formImage, setFormImage] = useState("");
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);

  // New fields for backend API
  const [lots, setLots] = useState<any[]>([]);
  const [formCropLotId, setFormCropLotId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStock, setFormStock] = useState("10");
  const [formImageFiles, setFormImageFiles] = useState<File[]>([]);
  const [formVariants, setFormVariants] = useState<{ name: string; price: string; stock: string; options: { key: string; value: string }[] }[]>([]);

  // Status message
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Discount Modal & Form control states
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [selectedDiscountProduct, setSelectedDiscountProduct] = useState<Product | null>(null);
  const [discountName, setDiscountName] = useState("");
  const [discountDescription, setDiscountDescription] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountAmount, setDiscountAmount] = useState("100");
  const [discountStartDate, setDiscountStartDate] = useState("");
  const [discountEndDate, setDiscountEndDate] = useState("");
  const [discountActive, setDiscountActive] = useState(true);
  const [activeDiscountId, setActiveDiscountId] = useState<string | number | null>(null);
  const [isFetchingDiscount, setIsFetchingDiscount] = useState(false);

  const loadProductsList = async () => {
    try {
      const token = getCookie("access_token");
      const res = await productAPI(token);
      const data = Array.isArray(res.data) ? res.data : [];
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // Fetch initial products
  useEffect(() => {
    setIsLoading(true);
    loadProductsList().finally(() => setIsLoading(false));

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
    setFormCategory("");
    setFormSalePrice("");
    setFormUnit("kg");
    setFormImage("");
    setFormIsBestSeller(false);
    setFormDescription("");
    setFormStock("10");
    setFormImageFiles([]);
    setFormVariants([]);
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
    setFormSalePrice(product.originalPrice.toString());
    setFormUnit(product.unit);
    setFormImage(product.image);
    setFormIsBestSeller(!!product.isBestSeller);

    const rawDesc = product.description || "";
    // Parse variants JSON out of product.product_variants or description comment
    const rawVariants = (product as any).product_variants || (product as any).ProductVariants;
    if (Array.isArray(rawVariants) && rawVariants.length > 0) {
      const mapped = rawVariants.map((v: any) => ({
        name: v.tile || v.title || v.name || "",
        price: (v.price || "").toString(),
        stock: (v.quantity || v.stock || "").toString(),
        options: Array.isArray(v.options) ? v.options.map((o: any) => ({
          key: o.name || o.key || "",
          value: o.value || ""
        })) : []
      }));
      setFormVariants(mapped);
    } else {
      const match = rawDesc.match(/<!--VARIANTS_JSON: (.*?)-->/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          const mapped = Array.isArray(parsed) ? parsed.map((v: any) => ({
            name: v.name || "",
            price: v.price || "",
            stock: v.stock || "",
            options: Array.isArray(v.options) ? v.options : []
          })) : [];
          setFormVariants(mapped);
        } catch (e) {
          setFormVariants([]);
        }
      } else {
        setFormVariants([]);
      }
    }

    // Clean description text to display in ReactQuill editor without the variants metadata
    let cleanDesc = rawDesc;
    const idxComment = cleanDesc.indexOf("<!--VARIANTS_JSON:");
    if (idxComment !== -1) {
      cleanDesc = cleanDesc.substring(0, idxComment);
    }
    const idxTable = cleanDesc.indexOf("product-variants-table-wrapper");
    if (idxTable !== -1) {
      const beforeClass = cleanDesc.substring(0, idxTable);
      const lastDivStart = beforeClass.lastIndexOf("<div");
      if (lastDivStart !== -1) {
        cleanDesc = cleanDesc.substring(0, lastDivStart);
      }
    }
    setFormDescription(cleanDesc.trim());

    setFormCropLotId(product.cropLotId || (lots.length > 0 ? (lots[0].id || lots[0].ID) : ""));
    setFormStock((product.stock || 10).toString());
    setFormImageFiles([]);
    setIsModalOpen(true);
  };

  // Handle submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formSalePrice) {
      showNotification("Vui lòng điền đầy đủ các thông tin bắt buộc!", "error");
      return;
    }

    if (!formCategory.trim()) {
      showNotification("Vui lòng nhập loại sản phẩm!", "error");
      return;
    }

    const newBasePrice = Number(formSalePrice);
    if (isNaN(newBasePrice)) {
      showNotification("Giá bán phải là dạng số hợp lệ!", "error");
      return;
    }

    const token = getCookie("access_token");
    let resolvedCategoryId = "";

    try {
      // 1. Fetch categories
      const catRes = await getCategoriesAPI(token);
      const catList = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes.data?.data) ? catRes.data.data : []);
      const matchedCat = catList.find((c: any) => {
        const catName = c.name || c.Name || "";
        return catName.trim().toLowerCase() === formCategory.trim().toLowerCase();
      });

      if (matchedCat) {
        resolvedCategoryId = matchedCat.id || matchedCat.ID || "";
      } else {
        // 2. Create category if not found
        const newCatRes = await createCategoryAPI({ name: formCategory.trim(), description: "Danh mục tự động tạo" }, token);
        const newCatData = newCatRes.data?.data || newCatRes.data;
        resolvedCategoryId = newCatData?.id || newCatData?.ID;
      }
    } catch (catErr) {
      console.error("Lỗi khi xử lý danh mục:", catErr);
      showNotification("Không thể tự động tạo hoặc liên kết loại sản phẩm!", "error");
      return;
    }

    if (!resolvedCategoryId) {
      showNotification("Không thể xác định mã loại sản phẩm (category_id)!", "error");
      return;
    }

    const discountNum = editingProduct ? editingProduct.discountPercent : 0;
    const computedSalePrice = discountNum > 0
      ? Math.round(newBasePrice * (1 - discountNum / 100))
      : newBasePrice;

    // Process variants into description (remove existing comments/tables and only append JSON comment)
    let finalDescription = formDescription;
    const idxCommentSubmit = finalDescription.indexOf("<!--VARIANTS_JSON:");
    if (idxCommentSubmit !== -1) {
      finalDescription = finalDescription.substring(0, idxCommentSubmit);
    }
    const idxTableSubmit = finalDescription.indexOf("product-variants-table-wrapper");
    if (idxTableSubmit !== -1) {
      const beforeClass = finalDescription.substring(0, idxTableSubmit);
      const lastDivStart = beforeClass.lastIndexOf("<div");
      if (lastDivStart !== -1) {
        finalDescription = finalDescription.substring(0, lastDivStart);
      }
    }
    finalDescription = finalDescription.trim();

    if (formVariants.length > 0) {
      const variantsComment = `<!--VARIANTS_JSON: ${JSON.stringify(formVariants)}-->`;
      finalDescription = `${finalDescription}\n${variantsComment}`;
    }

    if (editingProduct) {
      // Update logic
      const formData = new FormData();
      formData.append("crop_lot_id", formCropLotId);
      formData.append("name", formName);
      formData.append("description", finalDescription);
      formData.append("price", formSalePrice);
      formData.append("stock", formStock);
      formData.append("category", formCategory);
      formData.append("category_id", resolvedCategoryId);
      formData.append("category_name", formCategory);

      const productVariantsPayload = formVariants.map((v) => ({
        tile: v.name,
        price: v.price.toString(),
        quantity: v.stock.toString(),
        options: (v.options || []).map((o) => ({
          name: o.key,
          value: o.value
        }))
      }));
      formData.append("product_variants", JSON.stringify(productVariantsPayload));

      formImageFiles.forEach((file) => {
        formData.append("image", file);
      });

      updateProductAPI(editingProduct.id, formData, token)
        .then((res) => {
          showNotification("Cập nhật sản phẩm trên Backend thành công!", "success");
          loadProductsList();
        })
        .catch((err) => {
          console.error("Lỗi khi cập nhật sản phẩm lên Backend:", err);
          showNotification("Lỗi Backend: " + (err.response?.data?.message || err.message), "error");
        });
      setIsModalOpen(false);
    } else {
      // Create logic
      const formData = new FormData();
      formData.append("crop_lot_id", formCropLotId);
      formData.append("name", formName);
      formData.append("description", finalDescription);
      formData.append("price", formSalePrice);
      formData.append("stock", formStock);
      formData.append("category", formCategory);
      formData.append("category_id", resolvedCategoryId);
      formData.append("category_name", formCategory);

      const productVariantsPayload = formVariants.map((v) => ({
        tile: v.name,
        price: v.price.toString(),
        quantity: v.stock.toString(),
        options: (v.options || []).map((o) => ({
          name: o.key,
          value: o.value
        }))
      }));
      formData.append("product_variants", JSON.stringify(productVariantsPayload));

      formImageFiles.forEach((file) => {
        formData.append("image", file);
      });

      createProductAPI(formData, token)
        .then((res) => {
          showNotification("Thêm sản phẩm mới lên Backend thành công!", "success");
          loadProductsList();
        })
        .catch((err) => {
          console.error("Lỗi khi thêm sản phẩm lên Backend:", err);
          showNotification("Lỗi Backend: " + (err.response?.data?.message || err.message), "error");
        });
      setIsModalOpen(false);
    }
  };

  // Delete product logic
  const handleDeleteProduct = async (id: number | string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.")) {
      try {
        const token = getCookie("access_token");
        await deleteProductAPI(id, token);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showNotification("Đã xóa sản phẩm trên hệ thống thành công!", "success");
      } catch (err: any) {
        console.error("Lỗi khi xóa sản phẩm:", err);
        showNotification("Lỗi khi xóa sản phẩm: " + (err.response?.data?.message || err.message), "error");
      }
    }
  };

  const handlePercentChange = (val: string) => {
    setDiscountPercent(val);
    const num = Number(val);
    if (selectedDiscountProduct && !isNaN(num) && num >= 0 && num <= 100) {
      const origPrice = selectedDiscountProduct.originalPrice;
      const targetPrice = Math.round(origPrice * (1 - num / 100));
      setDiscountPrice(targetPrice.toString());
    } else {
      setDiscountPrice("");
    }
  };

  const handlePriceChange = (val: string) => {
    setDiscountPrice(val);
    const num = Number(val);
    if (selectedDiscountProduct && !isNaN(num) && num >= 0) {
      const origPrice = selectedDiscountProduct.originalPrice;
      if (origPrice > 0) {
        const computedPercent = Math.round(((origPrice - num) / origPrice) * 100);
        setDiscountPercent(Math.max(0, Math.min(100, computedPercent)).toString());
      }
    } else {
      setDiscountPercent("");
    }
  };

  const handleOpenDiscountModal = async (product: Product) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const nowFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const future = new Date();
    future.setDate(future.getDate() + 30);
    const futureFormatted = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T${pad(future.getHours())}:${pad(future.getMinutes())}`;

    setSelectedDiscountProduct(product);
    setDiscountName(`Khuyến mãi ${product.name}`);
    setDiscountDescription(`Chương trình giảm giá đặc biệt cho ${product.name}`);
    setDiscountAmount("100");
    setDiscountActive(true);
    setDiscountStartDate(nowFormatted);
    setDiscountEndDate(futureFormatted);
    setActiveDiscountId(null);

    if (product.discountPercent > 0) {
      setDiscountPrice(product.salePrice.toString());
      setDiscountPercent(product.discountPercent.toString());

      // Fetch details from backend
      setIsFetchingDiscount(true);
      try {
        const token = getCookie("access_token");
        const res = await getDiscountByProductIdAPI(product.id, token);
        const data = res.data?.data;
        if (data) {
          setActiveDiscountId(data.ID || data.id || null);
          setDiscountName(data.Name || data.name || `Khuyến mãi ${product.name}`);
          setDiscountDescription(data.Description || data.description || "");
          setDiscountPrice((data.Discount_Price || data.discount_price || product.salePrice).toString());
          setDiscountPercent((data.Percent || data.percent || product.discountPercent).toString());
          setDiscountAmount((data.Amount || data.amount || 100).toString());
          setDiscountActive(data.Active !== undefined ? data.Active : (data.active !== undefined ? data.active : true));

          if (data.StartDate || data.start_date) {
            const startD = new Date(data.StartDate || data.start_date);
            setDiscountStartDate(`${startD.getFullYear()}-${pad(startD.getMonth() + 1)}-${pad(startD.getDate())}T${pad(startD.getHours())}:${pad(startD.getMinutes())}`);
          }
          if (data.EndDate || data.end_date) {
            const endD = new Date(data.EndDate || data.end_date);
            setDiscountEndDate(`${endD.getFullYear()}-${pad(endD.getMonth() + 1)}-${pad(endD.getDate())}T${pad(endD.getHours())}:${pad(endD.getMinutes())}`);
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết khuyến mãi từ backend:", err);
      } finally {
        setIsFetchingDiscount(false);
      }
    } else {
      setDiscountPercent("10");
      const defaultPrice = Math.round(product.originalPrice * 0.9);
      setDiscountPrice(defaultPrice.toString());
    }

    setIsDiscountModalOpen(true);
  };

  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscountProduct) return;

    if (!discountName.trim() || !discountPrice || !discountPercent || !discountAmount || !discountStartDate || !discountEndDate) {
      showNotification("Vui lòng điền đầy đủ thông tin giảm giá!", "error");
      return;
    }

    const priceNum = Number(discountPrice);
    const percentNum = Number(discountPercent);
    const amountNum = Number(discountAmount);

    if (isNaN(priceNum) || isNaN(percentNum) || isNaN(amountNum)) {
      showNotification("Các trường giá trị, phần trăm, số lượng phải là số hợp lệ!", "error");
      return;
    }

    if (priceNum >= selectedDiscountProduct.originalPrice) {
      showNotification("Giá giảm phải thấp hơn giá gốc!", "error");
      return;
    }

    try {
      const token = getCookie("access_token");
      const startDateIso = new Date(discountStartDate).toISOString();
      const endDateIso = new Date(discountEndDate).toISOString();

      if (activeDiscountId) {
        await updateDiscountAPI(activeDiscountId, {
          name: discountName,
          description: discountDescription,
          discount_price: priceNum,
          active: discountActive,
          amount: amountNum,
          percent: percentNum,
          start_date: startDateIso,
          end_date: endDateIso,
          product_id: String(selectedDiscountProduct.id),
        }, token);
        showNotification("Cập nhật chương trình giảm giá thành công!", "success");
      } else {
        await addDiscountAPI({
          name: discountName,
          description: discountDescription,
          discount_price: priceNum,
          active: discountActive,
          amount: amountNum,
          percent: percentNum,
          start_date: startDateIso,
          end_date: endDateIso,
          product_id: String(selectedDiscountProduct.id),
        }, token);
        showNotification("Áp dụng chương trình giảm giá thành công!", "success");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedDiscountProduct.id
            ? {
              ...p,
              salePrice: priceNum,
              discountPercent: percentNum,
            }
            : p
        )
      );

      setIsDiscountModalOpen(false);
    } catch (err: any) {
      console.error("Lỗi khi xử lý giảm giá:", err);
      showNotification(
        "Lỗi thiết lập giảm giá: " + (err.response?.data?.message || err.message),
        "error"
      );
    }
  };

  const handleDiscountDelete = async () => {
    if (!selectedDiscountProduct || !activeDiscountId) return;
    if (!confirm("Bạn có chắc chắn muốn xóa chương trình giảm giá này của sản phẩm?")) return;

    try {
      const token = getCookie("access_token");
      await deleteDiscountAPI(activeDiscountId, token);
      showNotification("Đã xóa chương trình giảm giá thành công!", "success");

      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedDiscountProduct.id
            ? {
              ...p,
              salePrice: p.originalPrice,
              discountPercent: 0,
            }
            : p
        )
      );
      setIsDiscountModalOpen(false);
    } catch (err: any) {
      console.error("Lỗi khi xóa giảm giá:", err);
      showNotification(
        "Lỗi khi xóa giảm giá: " + (err.response?.data?.message || err.message),
        "error"
      );
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

  const isDiscountReadOnly = false;

  return (
    <div className="space-y-6 font-sans antialiased text-gray-800">

      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4.5 py-3 rounded-lg shadow-xl text-sm font-bold border transition-all duration-300 animate-slide-in ${notification.type === "success"
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
                      {product.discountPercent > 0 ? (
                        <>
                          <span className="block text-[10px] text-gray-400 line-through font-medium leading-none mb-0.5">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="block font-black text-red-500">{formatPrice(product.salePrice)}</span>
                        </>
                      ) : (
                        <span className="block font-black text-gray-900">{formatPrice(product.salePrice)}</span>
                      )}
                      <span className="block text-[10px] text-gray-400 font-normal">/{product.unit}</span>
                    </td>

                    {/* Discount percent */}
                    <td className="py-4.5 px-4 text-center">
                      {product.discountPercent > 0 ? (
                        <span className="font-extrabold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded text-[10px] sm:text-xs">
                          -{product.discountPercent}%
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
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
                          onClick={() => handleOpenDiscountModal(product)}
                          className={`p-2 rounded-lg cursor-pointer transition-all active:scale-95 border ${product.discountPercent > 0
                              ? "text-red-500 bg-red-50 border-red-100 hover:bg-red-100/50"
                              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-gray-200 hover:border-blue-100"
                            }`}
                          title={product.discountPercent > 0 ? "Thông tin giảm giá" : "Thiết lập giảm giá"}
                        >
                          <Tag className="w-4 h-4" />
                        </button>
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
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-300 focus-within:border-[#13a855] focus-within:ring-1 focus-within:ring-[#13a855] transition-all">
                      <ReactQuill
                        theme="snow"
                        value={formDescription}
                        onChange={setFormDescription}
                        placeholder="Mô tả chi tiết sản phẩm, nguồn gốc xuất xứ..."
                        className="quill-product-desc"
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

                {/* 3. Pricing & Stock Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-gray-900 border-b border-gray-100 pb-2">Giá bán & Kho hàng (Pricing & Inventory)</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formSalePrice}
                        onChange={(e) => setFormSalePrice(e.target.value)}
                        placeholder="đ"
                        className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
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
                        className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-xs sm:text-sm text-gray-850 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Variants Section */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Biến thể sản phẩm (Variants)</label>
                      <button
                        type="button"
                        onClick={() => setFormVariants(prev => [...prev, { name: "", price: "", stock: "", options: [] }])}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#13a855] hover:text-[#0f8b44] bg-[#e8f8f0] hover:bg-[#d8f4e5] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Thêm biến thể</span>
                      </button>
                    </div>

                    {formVariants.length > 0 ? (
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {formVariants.map((variant, index) => (
                          <div key={index} className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-200 animate-fade-in space-y-3">
                            {/* Variant Primary Fields */}
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                required
                                value={variant.name}
                                onChange={(e) => {
                                  const updated = [...formVariants];
                                  updated[index].name = e.target.value;
                                  setFormVariants(updated);
                                }}
                                placeholder="Tên biến thể (VD: Loại 1, Hộp 500g)"
                                className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md py-1.5 px-2.5 text-xs font-semibold focus:outline-none focus:border-[#13a855] text-gray-800"
                              />
                              <input
                                type="number"
                                required
                                min="0"
                                value={variant.price}
                                onChange={(e) => {
                                  const updated = [...formVariants];
                                  updated[index].price = e.target.value;
                                  setFormVariants(updated);
                                }}
                                placeholder="Giá (đ)"
                                className="w-28 bg-white border border-gray-300 rounded-md py-1.5 px-2.5 text-xs font-semibold focus:outline-none focus:border-[#13a855] text-gray-800"
                              />
                              <input
                                type="number"
                                required
                                min="0"
                                value={variant.stock}
                                onChange={(e) => {
                                  const updated = [...formVariants];
                                  updated[index].stock = e.target.value;
                                  setFormVariants(updated);
                                }}
                                placeholder="Kho"
                                className="w-20 bg-white border border-gray-300 rounded-md py-1.5 px-2.5 text-xs font-semibold focus:outline-none focus:border-[#13a855] text-gray-800"
                              />
                              <button
                                type="button"
                                onClick={() => setFormVariants(prev => prev.filter((_, i) => i !== index))}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="Xóa biến thể"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Options List (Thuộc tính tự nhập) */}
                            <div className="pl-4 border-l-2 border-emerald-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Các thuộc tính của biến thể (Options)</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...formVariants];
                                    if (!updated[index].options) updated[index].options = [];
                                    updated[index].options.push({ key: "", value: "" });
                                    setFormVariants(updated);
                                  }}
                                  className="text-[10px] font-black text-[#13a855] hover:underline cursor-pointer"
                                >
                                  + Thêm thuộc tính
                                </button>
                              </div>

                              {variant.options && variant.options.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2">
                                  {variant.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex gap-2 items-center">
                                      <input
                                        type="text"
                                        required
                                        value={opt.key}
                                        onChange={(e) => {
                                          const updated = [...formVariants];
                                          updated[index].options[optIdx].key = e.target.value;
                                          setFormVariants(updated);
                                        }}
                                        placeholder="Tên thuộc tính (VD: Size, Trọng lượng)"
                                        className="w-1/3 bg-white border border-gray-300 rounded-md py-1 px-2 text-[11px] focus:outline-none focus:border-[#13a855] text-gray-700 font-semibold"
                                      />
                                      <input
                                        type="text"
                                        required
                                        value={opt.value}
                                        onChange={(e) => {
                                          const updated = [...formVariants];
                                          updated[index].options[optIdx].value = e.target.value;
                                          setFormVariants(updated);
                                        }}
                                        placeholder="Giá trị (VD: L, XL, 1kg)"
                                        className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md py-1 px-2 text-[11px] focus:outline-none focus:border-[#13a855] text-gray-700 font-semibold"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...formVariants];
                                          updated[index].options = updated[index].options.filter((_, i) => i !== optIdx);
                                          setFormVariants(updated);
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400 font-medium italic">Không có thuộc tính riêng nào.</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 font-medium italic">Chưa có biến thể nào được thêm. Sản phẩm sẽ sử dụng mức giá và tồn kho mặc định ở trên.</p>
                    )}
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

                  {/* Category Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Loại sản phẩm (Category / Loại trái cây) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      placeholder="VD: Sầu riêng Ri6, Cam sành..."
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all font-semibold"
                    />
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

      {/* Discount Management Modal */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[3px] animate-fade-in font-sans">
          <div className="bg-[#f6f6f7] w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform scale-100 animate-zoom-in flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-gray-900">
                  {selectedDiscountProduct && selectedDiscountProduct.discountPercent > 0
                    ? "Chi Tiết Chương Trình Giảm Giá"
                    : "Thiết Lập Giảm Giá Sản Phẩm"}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Sản phẩm: <span className="text-[#13a855] font-bold">{selectedDiscountProduct?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleDiscountSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* Product Info Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Giá gốc niêm yết</span>
                  <span className="text-base font-black text-gray-850">
                    {selectedDiscountProduct ? formatPrice(selectedDiscountProduct.originalPrice) : "0đ"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Đơn vị tính</span>
                  <span className="text-xs font-bold text-gray-600 bg-gray-55 px-2 py-0.5 border border-gray-100 rounded">
                    {selectedDiscountProduct?.unit}
                  </span>
                </div>
              </div>

              {selectedDiscountProduct && selectedDiscountProduct.discountPercent > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-semibold flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-[#13a855] mt-0.5" />
                  <div>
                    Sản phẩm này đang có chương trình giảm giá hoạt động. Bạn có thể cập nhật thông tin khuyến mãi hoặc xóa để quay lại giá bán gốc.
                  </div>
                </div>
              )}

              {/* Discount Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Tên chương trình giảm giá <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  disabled={isDiscountReadOnly}
                  value={discountName}
                  onChange={(e) => setDiscountName(e.target.value)}
                  placeholder="Ví dụ: Khuyến Mãi Mùa Hè 2026..."
                  className="w-full bg-white disabled:bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] font-semibold transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Mô tả chương trình</label>
                <textarea
                  disabled={isDiscountReadOnly}
                  value={discountDescription}
                  onChange={(e) => setDiscountDescription(e.target.value)}
                  placeholder="Mô tả ngắn về điều kiện áp dụng hoặc chương trình..."
                  rows={2}
                  className="w-full bg-white disabled:bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-800 focus:outline-none focus:border-[#13a855] transition-all font-semibold resize-none"
                />
              </div>

              {/* Percent and Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Chiết khấu (%) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      max="99"
                      disabled={isDiscountReadOnly}
                      value={discountPercent}
                      onChange={(e) => handlePercentChange(e.target.value)}
                      placeholder="10"
                      className="w-full bg-white disabled:bg-gray-50 border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-xs sm:text-sm text-gray-855 font-black focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Giá sau giảm (VNĐ) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      disabled={isDiscountReadOnly}
                      value={discountPrice}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="đ"
                      className="w-full bg-white disabled:bg-gray-50 border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-xs sm:text-sm text-gray-855 font-black focus:outline-none focus:border-[#13a855] focus:ring-1 focus:ring-[#13a855] transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">đ</span>
                  </div>
                </div>
              </div>

              {/* Amount and Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Số lượng áp dụng <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    disabled={isDiscountReadOnly}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-white disabled:bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-gray-800 font-semibold focus:outline-none focus:border-[#13a855] transition-all"
                  />
                </div>

                <div className="flex flex-col justify-end pb-2.5">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="discount-active-check"
                      disabled={isDiscountReadOnly}
                      checked={discountActive}
                      onChange={(e) => setDiscountActive(e.target.checked)}
                      className="w-4.5 h-4.5 text-[#13a855] border-gray-300 rounded focus:ring-[#13a855] cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor="discount-active-check"
                      className="text-xs font-bold text-gray-700 cursor-pointer select-none disabled:cursor-not-allowed"
                    >
                      Kích hoạt ngay (Active)
                    </label>
                  </div>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Ngày bắt đầu <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    disabled={isDiscountReadOnly}
                    value={discountStartDate}
                    onChange={(e) => setDiscountStartDate(e.target.value)}
                    className="w-full bg-white disabled:bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-700 font-semibold focus:outline-none focus:border-[#13a855] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Ngày kết thúc <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    disabled={isDiscountReadOnly}
                    value={discountEndDate}
                    onChange={(e) => setDiscountEndDate(e.target.value)}
                    className="w-full bg-white disabled:bg-gray-50 border border-gray-300 rounded-lg py-2 px-3 text-xs text-gray-700 font-semibold focus:outline-none focus:border-[#13a855] transition-all"
                  />
                </div>
              </div>

            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3 shrink-0">
              <div>
                {activeDiscountId && (
                  <button
                    type="button"
                    onClick={handleDiscountDelete}
                    className="px-5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold rounded-lg text-xs transition-all cursor-pointer active:scale-97 shadow-sm"
                  >
                    Xóa giảm giá
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-5 py-2 bg-white border border-gray-300 text-gray-655 hover:bg-gray-50 font-bold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDiscountSubmit}
                  className="px-6 py-2 bg-[#13a855] hover:bg-[#0f8b44] text-white font-bold rounded-lg text-xs shadow-md transition-all cursor-pointer active:scale-97"
                >
                  {activeDiscountId ? "Cập nhật giảm giá" : "Áp dụng giảm giá"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}