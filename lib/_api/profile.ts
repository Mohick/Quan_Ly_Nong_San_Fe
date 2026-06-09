import axiosInstance from "../axios";

interface ProfileUpdatePayload {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    address?: string;
}

interface RegisterPayload {
    full_name: string;
    email: string;
    avatar_url?: string;
    password?: string;
}

// Đăng ký người dùng mới (/auth/create)
async function registerAPI(payload: RegisterPayload) {
    return await axiosInstance.post(`/auth/create`, payload);
}

// Lấy hồ sơ người dùng hiện tại (/auth/profile)
async function getProfileAPI(token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.get(`/auth/profile`, { headers });
}

// Cập nhật hồ sơ người dùng (/auth/update-profile)
async function updateProfileAPI(payload: ProfileUpdatePayload, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.put(`/auth/update-profile`, payload, { headers });
}

// Hủy kích hoạt tài khoản (/auth/deactivate/:id)
async function deactivateUserAPI(id: string | number, token?: string) {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }
    return await axiosInstance.delete(`/auth/deactivate/${id}`, { headers });
}

export { registerAPI, getProfileAPI, updateProfileAPI, deactivateUserAPI };
