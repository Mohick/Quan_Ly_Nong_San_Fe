import axiosInstance from "../axios";

async function lotsAPI(farmId?: string) {
    if (!farmId) {
        return { data: [] };
    }
    try {
        const res = await axiosInstance.get(`/crop-lot/get-crop-lot/${farmId}`);
        if (res.data && res.data.valid && Array.isArray(res.data.data)) {
            return { data: res.data.data };
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu lô đất từ backend API:", error);
    }
    return { data: [] };
}

export { lotsAPI };