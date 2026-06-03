import axiosInstance from "../axios";
import axios from "axios";

async function HistoryAPI(token?: string) {
    if (token) {
        try {
            const headers: Record<string, string> = {
                "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`
            };
            const res = await axiosInstance.get("/orders/history", { headers });
            if (res.data) {
                return { data: Array.isArray(res.data) ? res.data : res.data.data || [] };
            }
        } catch (error) {
            console.warn("Backend /orders/history chưa khả dụng:", error);
        }
    }
    return await axios.get("/history.json");
}

export { HistoryAPI };