import axiosInstance from "../axios";

async function FarmAPI(token?: string) {
    if (token) {
        try {
            const headers: Record<string, string> = {
                "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`
            };
            const res = await axiosInstance.get(`/farms/get-one`, { headers });
            if (res.data && res.data.valid) {
                return { data: res.data.data };
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin trang trại cá nhân từ backend:", error);
        }
        return { data: null };
    }

    try {
        const res = await axiosInstance.get(`/farms/get-all`);
        if (res.data && Array.isArray(res.data)) {
            return { data: res.data };
        } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
            return { data: res.data.data };
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách trang trại từ backend:", error);
    }

    return { data: [] };
}

export { FarmAPI };