import axiosInstance from "../axios";

interface DiscountPayload {
    name: string;
    description?: string;
    discount_price: number;
    active: boolean;
    amount: number;
    percent: number;
    start_date: string;
    end_date: string;
    product_id: string;
}

// Lấy chi tiết thông tin khuyến mãi của một sản phẩm cụ thể
async function getDiscountByProductIdAPI(productId: string | number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.get(`/discounts/get-by-product/${productId}`, { headers });
}

// Cập nhật chương trình khuyến mãi
async function updateDiscountAPI(id: string | number, payload: Partial<DiscountPayload>, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.put(`/discounts/update/${id}`, payload, { headers });
}

// Lấy chi tiết thông tin khuyến mãi theo ID khuyến mãi
async function getDiscountByIdAPI(id: string | number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.get(`/discounts/get-one/${id}`, { headers });
}

// Xóa chương trình khuyến mãi
async function deleteDiscountAPI(id: string | number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.delete(`/discounts/delete/${id}`, { headers });
}

export { getDiscountByProductIdAPI, updateDiscountAPI, deleteDiscountAPI, getDiscountByIdAPI };
