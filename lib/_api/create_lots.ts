import axiosInstance from "../axios";

async function createLotAPI(payload: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    console.log(payload)
    return await axiosInstance.post(`/farms/new-crop-lot`, payload, { headers });
}

export { createLotAPI };
