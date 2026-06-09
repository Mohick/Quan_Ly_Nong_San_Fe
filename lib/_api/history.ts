import axiosInstance from "../axios";
import axios from "axios";

function mapOrder(order: any): any {
  const rawDetails = order.OrderDetails || order.order_details || [];
  const items = rawDetails.map((detail: any) => {
    const prod = detail.Product || detail.product || {};
    let image = "https://images.unsplash.com/photo-1610348725531-843dff10902c?q=80&w=600&auto=format&fit=crop";
    
    if (prod.ImageProducts && prod.ImageProducts.length > 0) {
      image = prod.ImageProducts[0].ImageURL || prod.ImageProducts[0].image_url || image;
    } else if (prod.image_products && prod.image_products.length > 0) {
      image = prod.image_products[0].image_url || image;
    } else if (prod.ImageURL || prod.image_url || prod.image) {
      image = prod.ImageURL || prod.image_url || prod.image;
    }
    
    return {
      id: detail.ID || detail.id || "",
      name: prod.Name || prod.name || "",
      image: image,
      category: prod.category || "Nông sản sạch",
      quantity: detail.Quantity || detail.quantity || 1,
      price: detail.Price || detail.price || 0
    };
  });

  const statusMap: Record<string, "pending" | "shipping" | "delivered" | "cancelled"> = {
    "PENDING": "pending",
    "PROCESSING": "shipping",
    "SHIPPED": "shipping",
    "DELIVERED": "delivered",
    "CANCELLED": "cancelled",
    "pending": "pending",
    "shipping": "shipping",
    "delivered": "delivered",
    "cancelled": "cancelled"
  };

  const statusTextMap: Record<string, string> = {
    "PENDING": "Chờ xác nhận",
    "PROCESSING": "Đang xử lý",
    "SHIPPED": "Đang giao hàng",
    "DELIVERED": "Đã giao hàng",
    "CANCELLED": "Đã hủy đơn",
    "pending": "Chờ xác nhận",
    "shipping": "Đang giao",
    "delivered": "Đã giao",
    "cancelled": "Đã hủy"
  };

  const rawStatus = order.Status || order.status || "PENDING";
  const status = statusMap[rawStatus] || "pending";
  const statusText = statusTextMap[rawStatus] || "Chờ xác nhận";

  const rawDate = order.CreatedAt || order.created_at || new Date().toISOString();
  const formattedDate = new Date(rawDate).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return {
    id: order.ID || order.id || "",
    date: formattedDate,
    status: status,
    statusText: statusText,
    items: items,
    total: order.TotalAmount || order.total_amount || order.total || 0,
    paymentMethod: order.PaymentMethod || order.payment_method || "COD",
    shippingAddress: order.Address || order.address || ""
  };
}

async function HistoryAPI(token?: string) {
    if (token) {
        try {
            const headers: Record<string, string> = {
                "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`
            };
            const res = await axiosInstance.get("/orders/my-orders", { headers });
            if (res.data && res.data.valid) {
                const rawOrders = Array.isArray(res.data.data) ? res.data.data : [];
                return { data: rawOrders.map(mapOrder) };
            }
        } catch (error) {
            console.error("Lỗi khi gọi API lấy lịch sử đơn hàng từ backend:", error);
        }
    }
    return { data: [] };
}

export { HistoryAPI };
