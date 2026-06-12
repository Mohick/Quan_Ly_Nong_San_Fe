import axiosInstance from "../axios";

export async function getUserConversationsAPI(token: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    try {
        const res = await axiosInstance.get(`/chat/conversations/users`, { headers });
        return res.data;
    } catch (error) {
        console.error("Error fetching user conversations:", error);
        throw error;
    }
}

export async function getFarmConversationsAPI(farmId: string, token: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    try {
        const res = await axiosInstance.get(`/chat/conversations/farms/${farmId}`, { headers });
        return res.data;
    } catch (error) {
        console.error("Error fetching farm conversations:", error);
        throw error;
    }
}

export async function getChatHistoryAPI(receiverId: string, token: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    try {
        // According to previous info, the endpoint is /api/v1/chat/history/{farm_id} or just receiverId.
        const res = await axiosInstance.get(`/chat/history/${receiverId}`, { headers });
        return res.data;
    } catch (error) {
        console.error("Error fetching chat history:", error);
        throw error;
    }
}
