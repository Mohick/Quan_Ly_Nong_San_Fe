import axiosInstance from "../axios";

interface CategoryPayload {
    name: string;
    description?: string;
}

// Lấy tất cả danh mục
async function getCategoriesAPI(token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.get(`/categories/get-all`, { headers });
}

// Lấy chi tiết danh mục theo ID
async function getCategoryDetailAPI(id: string | number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.get(`/categories/get-one/${id}`, { headers });
}

// Tạo danh mục mới
async function createCategoryAPI(payload: CategoryPayload, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.post(`/categories/create`, payload, { headers });
}

// Cập nhật danh mục theo ID
async function updateCategoryAPI(id: string | number, payload: Partial<CategoryPayload>, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.put(`/categories/update/${id}`, payload, { headers });
}

// Xóa danh mục theo ID
async function deleteCategoryAPI(id: string | number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.delete(`/categories/delete/${id}`, { headers });
}

export { 
    getCategoriesAPI, 
    getCategoryDetailAPI, 
    createCategoryAPI, 
    updateCategoryAPI, 
    deleteCategoryAPI 
};
