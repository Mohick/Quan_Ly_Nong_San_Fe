import axiosInstance from "../axios";

async function lotsAPI(farmId?: string, token?: string) {
    if (!farmId) {
        return { data: [] };
    }
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        }
        const res = await axiosInstance.get(`/crop-lot/get-crop-lot/${farmId}`, { headers });
        if (res.data && res.data.valid && Array.isArray(res.data.data)) {
            return { data: res.data.data };
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu lô đất từ backend API:", error);
    }
    return { data: [] };
}

export { lotsAPI };