import React from "react";
import CheckoutView from "@/components/checkout/checkout";

export const metadata = {
  title: "Thanh toán đơn hàng - Cửa hàng Nông sản PIONE",
  description: "Hoàn tất các bước thanh toán giao nhận nông sản hữu cơ đạt chuẩn VietGAP.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
