import axiosInstance from "../axios";

async function createFarmAPI(formData: FormData, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "multipart/form-data",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.post(`/farms/new-farm`, formData, { headers });
}

export { createFarmAPI };
