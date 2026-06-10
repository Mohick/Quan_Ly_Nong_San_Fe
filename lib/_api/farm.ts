import axiosInstance from "../axios";
import axios from "axios";

// Lấy thông tin trang trại của chính mình (/farms/get-one)
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

// Cập nhật thông tin trang trại (/farms/update/:id)
async function updateFarmAPI(id: string | number, formData: FormData, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/api/v1";
    const backendUrl = `${baseUrl.replace(/\/$/, "")}/farms/update/${id}`;

    // Không đặt Content-Type thủ công để Axios tự thêm multipart boundary.
    return await axios.put(backendUrl, formData, { headers });
}

// Xóa trang trại (/farms/delete/:id)
async function deleteFarmAPI(id: string | number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.delete(`/farms/delete/${id}`, { headers });
}

export { FarmAPI, updateFarmAPI, deleteFarmAPI };
