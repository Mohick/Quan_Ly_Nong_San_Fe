import axiosInstance from "../axios";

interface CareProcessPayload {
    crop_lot_id: string;
    title: string;
    description: string;
    month: number;
    started_date: string;
    finished_dat: string;
}

async function createCareProcessAPI(payload: CareProcessPayload, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.post(`/care-process/create`, payload, { headers });
}

async function getCareProcessesAPI(cropLotId: string, token?: string) {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        }
        // Giả sử API GET có dạng /care-process/get-by-crop-lot/:id hoặc /care-process/get-all
        const res = await axiosInstance.get(`/care-process/get-by-crop-lot/${cropLotId}`, { headers });
        if (res.data && res.data.valid && Array.isArray(res.data.data)) {
            return { data: res.data.data };
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhật ký chăm sóc từ backend:", error);
    }
    return { data: [] };
}

export { createCareProcessAPI, getCareProcessesAPI };
