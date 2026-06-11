
import axiosInstance from "../axios";

const AUTO_LOGIN_TIMEOUT_MS = 5_000;

async function autoLoginAPI(token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const a = await axiosInstance.get(`/auth/auto-login`, {
        headers,
        timeout: AUTO_LOGIN_TIMEOUT_MS,
    });
    return a;
}

export { autoLoginAPI };
