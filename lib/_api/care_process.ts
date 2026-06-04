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
    // Vì Backend hiện tại chưa định nghĩa API GET cho care-process (chỉ có POST /create và PUT /update),
    // chúng ta sẽ đọc trực tiếp từ bộ nhớ trình duyệt (LocalStorage) để tránh gây ra lỗi đỏ 404 trên Console.
    if (typeof window !== "undefined") {
        const localData = localStorage.getItem(`diaries_${cropLotId}`);
        if (localData) {
            try {
                return { data: JSON.parse(localData), isLocal: true };
            } catch (_) { }
        }
    }
    return { data: [], isLocal: true };
}

interface CareProcessUpdatePayload extends CareProcessPayload {
    id: string;
}

async function updateCareProcessAPI(payload: CareProcessUpdatePayload, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.put(`/care-process/update`, payload, { headers });
}

export { createCareProcessAPI, getCareProcessesAPI, updateCareProcessAPI };
