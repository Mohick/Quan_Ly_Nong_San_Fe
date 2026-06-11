import axiosInstance from "../axios";

interface CareProcessPayload {
    crop_lot_id: string;
    title: string;
    description: string;
    month: number;
    started_date: string;
    finished_date: string;
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
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cropLotId);
    if (!isUUID) {
        return { data: [], isLocal: false };
    }

    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        }
        const res = await axiosInstance.get(`/care-process/get-process/${cropLotId}`, { headers });
        const dataField = res.data?.data !== undefined ? res.data.data : res.data;
        let rawData: any[] = [];
        if (dataField) {
            if (Array.isArray(dataField)) {
                rawData = dataField;
            } else {
                rawData = [dataField];
            }
        }
        
        // Map PascalCase/camelCase to camelCase expected by frontend (mapping finished_date to finished_dat)
        const mapped = rawData.map((item: any) => ({
            id: item.ID || item.id,
            crop_lot_id: item.CropLotID || item.crop_lot_id,
            title: item.Title || item.title || "",
            description: item.Description || item.description || "",
            month: item.Month || item.month || 1,
            started_date: item.StartedDate || item.started_date || "",
            finished_dat: item.FinishedDate || item.finished_date || item.FinishedDat || item.finished_dat || "",
        }));
        return { data: mapped, isLocal: false };
    } catch (error: any) {
        console.error(`Lỗi khi lấy dữ liệu nhật ký chăm sóc từ Backend cho lô ${cropLotId}:`, error);
        return { data: [], isLocal: false };
    }
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

async function deleteCareProcessAPI(id: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.delete(`/care-process/delete/${id}`, { headers });
}

export { createCareProcessAPI, getCareProcessesAPI, updateCareProcessAPI, deleteCareProcessAPI };
