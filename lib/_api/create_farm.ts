import axios from "axios";

async function createFarmAPI(formData: FormData, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/api/v1";
    const backendUrl = `${baseUrl.replace(/\/$/, "")}/farms/new-farm`;
    return await axios.post(backendUrl, formData, { headers });
}

export { createFarmAPI };
