import axiosInstance from "../axios";

async function getOneFarmAPI(token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.get(`/farms/get-one`, { headers });
}

export { getOneFarmAPI };
