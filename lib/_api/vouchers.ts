import axiosInstance from "../axios";

export async function getFarmVouchersAPI(farmId: string) {
    try {
        const res = await axiosInstance.get(`/vouchers/farm/${farmId}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching farm vouchers:", error);
        throw error;
    }
}

export async function saveVoucherAPI(voucherId: string, token: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    
    try {
        const res = await axiosInstance.post(`/vouchers/save`, { voucher_id: voucherId }, { headers });
        return res.data;
    } catch (error) {
        console.error("Error saving voucher:", error);
        throw error;
    }
}

export async function getMyVouchersAPI(token: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    
    try {
        const res = await axiosInstance.get(`/vouchers/my`, { headers });
        return res.data;
    } catch (error) {
        console.error("Error fetching my vouchers:", error);
        throw error;
    }
}
