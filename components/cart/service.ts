import axiosInstance from "../../lib/axios";

async function getCartAPI(token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.get(`/cart`, { headers });
}

async function addToCartAPI(productId: string | number, quantity: number, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.post(`/cart/add`, { product_id: String(productId), quantity }, { headers });
}

async function updateCartItemAPI(itemId: string | number, quantity: number, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.put(`/cart/update/${itemId}`, { quantity }, { headers });
}

async function removeCartItemAPI(itemId: string | number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.delete(`/cart/remove/${itemId}`, { headers });
}

async function clearCartAPI(token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.delete(`/cart/clear`, { headers });
}

export { getCartAPI, addToCartAPI, updateCartItemAPI, removeCartItemAPI, clearCartAPI };
