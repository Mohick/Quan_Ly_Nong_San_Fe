import axiosInstance from "../axios";

interface PlaceOrderPayload {
    address: string;
    payment_method: string;
}

// Lấy lịch sử đơn hàng của tôi
async function getMyOrdersAPI(token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.get(`/orders/my-orders`, { headers });
}

// Đặt hàng mới
async function placeOrderAPI(payload: PlaceOrderPayload, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.post(`/orders/place`, payload, { headers });
}

// Cập nhật trạng thái đơn hàng
async function updateOrderStatusAPI(orderId: string, status: string, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.put(`/orders/update-status/${orderId}`, { status }, { headers });
}

// Lấy danh sách toàn bộ đơn hàng (dành cho Farmer/Admin)
async function getAllOrdersAPI(token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.get(`/orders/all`, { headers });
}

// Lấy danh sách quản lý đơn hàng
async function getOrderManagementAPI(token: string, status?: string, search?: string) {
    const headers: Record<string, string> = {
        "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`
    };
    const params = new URLSearchParams();
    if (status && status !== "ALL") params.append("status", status);
    if (search) params.append("search", search);
    
    return await axiosInstance.get(`/orders/management?${params.toString()}`, { headers });
}

export { getMyOrdersAPI, placeOrderAPI, updateOrderStatusAPI, getAllOrdersAPI, getOrderManagementAPI };
