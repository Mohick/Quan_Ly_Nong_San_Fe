"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trash2, Plus, Minus, ArrowLeft, ShoppingBag,
  ShieldCheck, Truck, RotateCcw, Check, Loader2, AlertTriangle, X
} from "lucide-react";
import { getCartAPI, updateCartItemAPI, removeCartItemAPI, clearCartAPI } from "./service";
import { productAPI } from "@/lib/_api/product";
import { toast } from "react-toastify";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface CartItem {
  id: string | number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
  unit: string;
  selectedVariant?: {
    name: string;
    options?: any[];
  } | null;
}

export default function CartView() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!itemToRemove) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isRemoving) {
        setItemToRemove(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [itemToRemove, isRemoving]);

  // Fetch real products from cart database to initialize cart
  useEffect(() => {
    const fetchCartProducts = async () => {
      try {
        const token = getCookie("access_token");
        const res = await getCartAPI(token);
        const cartData = res.data?.data || {};
        const items = Array.isArray(cartData.items) ? cartData.items : (Array.isArray(cartData.cart_items) ? cartData.cart_items : []);

        const mapped = items.map((item: any) => {
          const prod = item.product || item.Product || {};
          const discount = prod.Discount || prod.discount || {};
          const hasDiscount = discount.Active || discount.active || false;
          const originalPrice = prod.Price || prod.price || 0;
          const price = hasDiscount ? (discount.DiscountPrice || discount.discount_price || originalPrice) : originalPrice;

          let image = "/images/placeholder.jpg";
          const imageProducts = prod.ImageProducts || prod.image_products || [];
          if (imageProducts.length > 0) {
            image = imageProducts[0].ImageURL || imageProducts[0].image_url || imageProducts[0].ImageUrl || "";
          }

          return {
            id: item.id || item.ID || prod.id || prod.ID,
            name: prod.Name || prod.name || "",
            category: prod.Category?.Name || prod.Category?.name || "Nông sản sạch",
            price: price,
            originalPrice: originalPrice,
            quantity: item.quantity || item.Quantity || 1,
            image: image,
            unit: prod.Unit || prod.unit || "kg",
            selectedVariant: item.selectedVariant || item.SelectedVariant || null
          };
        });

        setCartItems(mapped);
        if (typeof window !== "undefined") {
          localStorage.setItem("local_cart", JSON.stringify(mapped));
        }
      } catch (error) {
        console.warn("Cart API is not supported on Backend (or connection error), falling back to LocalStorage.");

        if (typeof window !== "undefined") {
          const localCart = localStorage.getItem("local_cart");
          if (localCart) {
            try {
              setCartItems(JSON.parse(localCart));
              setIsLoading(false);
              return;
            } catch (_) { }
          }
        }
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Quantity updates
  const handleIncrease = async (id: string | number, variantName?: string) => {
    const item = cartItems.find((item) => item.id === id && (item.selectedVariant?.name || "") === (variantName || ""));
    if (!item) return;
    
    // Check stock limit (default limit: 100 for safety, or check if variant has custom stock)
    const stockLimit = 100;
    const newQty = item.quantity + 1;
    if (newQty > stockLimit) {
      toast.warning(`Rất tiếc, số lượng sản phẩm trong kho chỉ còn tối đa ${stockLimit} ${item.unit || "sản phẩm"}.`);
      return;
    }

    const updatedItems = cartItems.map((item) =>
      item.id === id && (item.selectedVariant?.name || "") === (variantName || "") ? { ...item, quantity: newQty } : item
    );
    setCartItems(updatedItems);
    if (typeof window !== "undefined") {
      localStorage.setItem("local_cart", JSON.stringify(updatedItems));
      window.dispatchEvent(new Event("cart-updated"));
    }

    try {
      const token = getCookie("access_token");
      await updateCartItemAPI(id, newQty, token);
    } catch (err) {
      // Ignore backend error in fallback mode
    }
  };

  const handleDecrease = async (id: string | number, variantName?: string) => {
    const item = cartItems.find((item) => item.id === id && (item.selectedVariant?.name || "") === (variantName || ""));
    if (!item || item.quantity <= 1) return;
    const newQty = item.quantity - 1;

    const updatedItems = cartItems.map((item) =>
      item.id === id && (item.selectedVariant?.name || "") === (variantName || "") ? { ...item, quantity: newQty } : item
    );
    setCartItems(updatedItems);
    if (typeof window !== "undefined") {
      localStorage.setItem("local_cart", JSON.stringify(updatedItems));
      window.dispatchEvent(new Event("cart-updated"));
    }

    try {
      const token = getCookie("access_token");
      await updateCartItemAPI(id, newQty, token);
    } catch (err) {
      // Ignore backend error in fallback mode
    }
  };

  const handleQuantityChange = async (id: string | number, value: string, variantName?: string) => {
    const item = cartItems.find((item) => item.id === id && (item.selectedVariant?.name || "") === (variantName || ""));
    if (!item) return;

    if (value === "") {
      const updatedItems = cartItems.map((item) =>
        item.id === id && (item.selectedVariant?.name || "") === (variantName || "") ? { ...item, quantity: "" as any } : item
      );
      setCartItems(updatedItems);
      return;
    }

    let parsedVal = parseInt(value, 10);
    if (isNaN(parsedVal)) {
      return;
    }
    if (parsedVal < 1) {
      parsedVal = 1;
    }

    const stockLimit = 100;
    if (parsedVal > stockLimit) {
      toast.warning(`Rất tiếc, số lượng sản phẩm trong kho chỉ còn tối đa ${stockLimit} ${item.unit || "sản phẩm"}.`);
      parsedVal = stockLimit;
    }

    const updatedItems = cartItems.map((item) =>
      item.id === id && (item.selectedVariant?.name || "") === (variantName || "") ? { ...item, quantity: parsedVal } : item
    );
    setCartItems(updatedItems);
    if (typeof window !== "undefined") {
      localStorage.setItem("local_cart", JSON.stringify(updatedItems));
      window.dispatchEvent(new Event("cart-updated"));
    }

    try {
      const token = getCookie("access_token");
      await updateCartItemAPI(id, parsedVal, token);
    } catch (err) {
      // Ignore backend error in fallback mode
    }
  };

  const handleQuantityBlur = async (id: string | number, variantName?: string) => {
    const item = cartItems.find((item) => item.id === id && (item.selectedVariant?.name || "") === (variantName || ""));
    if (!item) return;

    if (item.quantity === ("" as any) || isNaN(item.quantity) || item.quantity < 1) {
      const updatedItems = cartItems.map((el) =>
        el.id === id && (el.selectedVariant?.name || "") === (variantName || "") ? { ...el, quantity: 1 } : el
      );
      setCartItems(updatedItems);
      if (typeof window !== "undefined") {
        localStorage.setItem("local_cart", JSON.stringify(updatedItems));
        window.dispatchEvent(new Event("cart-updated"));
      }

      try {
        const token = getCookie("access_token");
        await updateCartItemAPI(id, 1, token);
      } catch (err) {}
    }
  };

  const handleRemove = (item: CartItem) => {
    setItemToRemove(item);
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove || isRemoving) return;

    setIsRemoving(true);
    const variantName = itemToRemove.selectedVariant?.name || "";
    const updatedItems = cartItems.filter(
      (item) =>
        !(
          item.id === itemToRemove.id &&
          (item.selectedVariant?.name || "") === variantName
        ),
    );

    setCartItems(updatedItems);
    if (typeof window !== "undefined") {
      localStorage.setItem("local_cart", JSON.stringify(updatedItems));
      window.dispatchEvent(new Event("cart-updated"));
    }

    try {
      const token = getCookie("access_token");
      await removeCartItemAPI(itemToRemove.id, token);
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
    } catch (err) {
      // Local cart remains the fallback when the backend cart is unavailable.
    } finally {
      setIsRemoving(false);
      setItemToRemove(null);
    }
  };

  // Calculations
  const tempTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalOriginal = cartItems.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0);
  const savedAmount = totalOriginal - tempTotal;

  // Delivery Fee: Free for orders >= 300,000đ, otherwise 30,000đ
  const shippingFee = tempTotal >= 300000 || tempTotal === 0 ? 0 : 30000;

  const grandTotal = tempTotal + shippingFee;

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const token = getCookie("access_token");
      await clearCartAPI(token);
    } catch (err) {
      // Ignore backend error in fallback mode
    } finally {
      setIsCheckoutSuccess(true);
      setCartItems([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("local_cart");
        window.dispatchEvent(new Event("cart-updated"));
      }
      setIsCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faf9] font-sans p-6 text-center select-none animate-fade-in text-gray-800">
        <Loader2 className="w-10 h-10 animate-spin text-[#13a855] mb-4" />
        <p className="text-gray-500 font-bold text-sm">Đang tải giỏ hàng nông sản...</p>
      </div>
    );
  }

  if (isCheckoutSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faf9] font-sans p-6 text-center select-none animate-fade-in text-gray-800">
        <div className="w-20 h-20 bg-[#e8f8f0] text-[#13a855] border-2 border-[#13a855]/30 rounded-full flex items-center justify-center mb-6 shadow-md">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">Đặt Hàng Thành Công!</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
          Cảm ơn bạn đã đồng hành cùng nông sản sạch PIONE. Đơn hàng của bạn đang được xử lý nhanh chóng và sẽ được giao tới trong vòng 2 giờ.
        </p>
        <Link
          href="/products"
          className="flex items-center gap-2 px-6 py-3.5 bg-[#13a855] text-white font-extrabold rounded-xl hover:bg-[#0f8b44] transition-all shadow-md active:scale-97 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang sản phẩm</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8faf9] min-h-screen py-10 font-sans select-none text-gray-800 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500 hover:text-[#13a855] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại mua sắm nông sản</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="mb-8 flex items-start gap-3">
          <ShoppingBag className="mt-0.5 h-6 w-6 shrink-0 text-[#13a855]" />
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight text-gray-905 sm:text-2xl">
              Giỏ Hàng Của Bạn
            </h1>
            <p className="mt-0.5 text-xs font-medium leading-relaxed text-gray-500 sm:text-sm">
              Kiểm tra các sản phẩm đã chọn và tiến hành hoàn tất hóa đơn giao nhận.
            </p>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Cart items table list (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.selectedVariant?.name || "default"}`}
                  className="flex min-h-[124px] flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:gap-6 sm:p-5"
                >
                  {/* Item Image */}
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* Title & category */}
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <span className="block text-[10px] font-bold text-[#13a855]/95 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <Link
                      href={`/products/detail?id=${item.id}`}
                      className="block font-extrabold text-gray-850 text-sm sm:text-base hover:text-[#13a855] transition-colors leading-snug cursor-pointer"
                    >
                      {item.name}
                    </Link>
                    {item.selectedVariant && (
                      <div className="text-[11px] text-[#13a855] font-bold bg-[#e8f8f0] border border-[#cbeed7] px-2 py-0.5 rounded-md mt-1 inline-block">
                        <span>Phân loại: {item.selectedVariant.name}</span>
                        {item.selectedVariant.options && item.selectedVariant.options.length > 0 && (
                          <span className="text-gray-500 font-semibold ml-1.5">
                            ({item.selectedVariant.options.map((o: any) => `${o.key || o.name || ""}: ${o.value || ""}`).join(", ")})
                          </span>
                        )}
                      </div>
                    )}
                    <span className="block text-[10px] text-gray-400">Đơn vị: {item.unit}</span>
                  </div>

                  {/* Quantity selector & price details */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Quantity selectors */}
                    <div className="flex items-center border border-gray-300 rounded-lg p-0.5 bg-white shadow-sm">
                      <button
                        onClick={() => handleDecrease(item.id, item.selectedVariant?.name)}
                        className="p-1.5 text-gray-500 hover:text-[#13a855] hover:bg-[#e8f8f0] rounded-md transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value, item.selectedVariant?.name)}
                        onBlur={() => handleQuantityBlur(item.id, item.selectedVariant?.name)}
                        className="w-10 text-center font-extrabold text-xs sm:text-sm text-gray-800 bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => handleIncrease(item.id, item.selectedVariant?.name)}
                        className="p-1.5 text-gray-500 hover:text-[#13a855] hover:bg-[#e8f8f0] rounded-md transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price details */}
                    <div className="text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
                      {/* <span className="text-xs text-gray-400 line-through font-medium">
                        {formatPrice(item.originalPrice * item.quantity)}
                      </span> */}
                      <span className="text-sm sm:text-base font-extrabold text-[#13a855]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Trash remove button */}
                    <button
                      onClick={() => handleRemove(item)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer active:scale-90"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Checkout Summary Card (4 cols) */}
            <div className="lg:col-span-4 space-y-5">

              {/* Grand Total Order Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5.5 sm:p-6 space-y-4">
                <h3 className="text-gray-900 font-extrabold text-base border-b border-gray-100 pb-3">Tóm Tắt Đơn Hàng</h3>

                <div className="space-y-2.5 text-xs sm:text-sm font-bold text-gray-500">
                  <div className="flex justify-between">
                    <span>Tổng tiền hàng</span>
                    <span className="text-gray-800">{formatPrice(tempTotal)}</span>
                  </div>

                  {savedAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Đã tiết kiệm</span>
                      <span>-{formatPrice(savedAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Phí vận chuyển</span>
                    <span className="text-gray-800">
                      {shippingFee === 0 ? "MIỄN PHÍ" : formatPrice(shippingFee)}
                    </span>
                  </div>

                  {shippingFee > 0 && (
                    <p className="text-[10px] text-gray-400 font-semibold leading-normal">
                      * Mua thêm <span className="text-[#13a855]">{formatPrice(300000 - tempTotal)}</span> để được miễn phí vận chuyển 2H.
                    </p>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3.5 flex justify-between items-baseline">
                  <span className="text-sm sm:text-base font-extrabold text-gray-850">Thành tiền</span>
                  <span className="text-lg sm:text-xl font-black text-[#13a855]">{formatPrice(grandTotal)}</span>
                </div>

                {/* Technical checkout guarantees */}
                <div className="grid grid-cols-1 gap-2 pt-2 text-[10px] text-gray-400 font-semibold border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#13a855]" />
                    <span>Nguồn gốc VietGAP/GlobalGAP sạch chuẩn 100%.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#13a855]" />
                    <span>Giao nhanh siêu tốc trong vòng 2 giờ.</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#13a855] hover:bg-[#0f8b44] text-white font-extrabold rounded-xl shadow-md active:scale-98 transition-all text-xs sm:text-sm mt-4 cursor-pointer text-center"
                >
                  <span>Tiến hành thanh toán</span>
                </Link>

              </div>
            </div>

          </div>
        ) : (
          /* Empty Cart State */
          <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gray-800 mb-1">Giỏ hàng của bạn đang trống</h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
              Bạn chưa thêm sản phẩm nông sản nào vào giỏ hàng. Hãy lấp đầy giỏ hàng của bạn bằng thực phẩm tươi mát và chất lượng cao nhé!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#13a855] text-white font-extrabold rounded-xl hover:bg-[#0f8b44] transition-all shadow-md active:scale-97 text-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khám phá sản phẩm ngay</span>
            </Link>
          </div>
        )}

      </div>

      {itemToRemove && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-[2px] animate-fade-in"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isRemoving) {
              setItemToRemove(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-cart-item-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setItemToRemove(null)}
                disabled={isRemoving}
                className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Đóng hộp thoại"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-5 pt-4 sm:px-6">
              <h2
                id="remove-cart-item-title"
                className="text-base font-black text-gray-900 sm:text-lg"
              >
                Xóa sản phẩm khỏi giỏ hàng?
              </h2>
              <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm">
                Bạn có chắc muốn xóa{" "}
                <span className="font-bold text-gray-800">
                  “{itemToRemove.name}”
                </span>
                ? Bạn vẫn có thể thêm lại sản phẩm sau.
              </p>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setItemToRemove(null)}
                disabled={isRemoving}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>{isRemoving ? "Đang xóa..." : "Xóa khỏi giỏ"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
