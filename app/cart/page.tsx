import React from "react";
import CartView from "@/components/cart/page";

export const metadata = {
  title: "Giỏ hàng - Cửa hàng Nông sản PIONE",
  description: "Xem các sản phẩm đã chọn và hoàn tất đơn hàng giao nhận nông sản sạch siêu tốc 2H.",
};

export default function CartPage() {
  return <CartView />;
}
