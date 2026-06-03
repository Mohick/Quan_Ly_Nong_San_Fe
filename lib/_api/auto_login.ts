
import axiosInstance from "../axios";

async function autoLoginAPI(token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const a = await axiosInstance.get(`/auth/auto-login`, { headers });
    return a;
}

export { autoLoginAPI };
