import axiosInstance from "../axios";

export async function DashboardAPI(token: string) {
    try {
        const headers: Record<string, string> = {
            "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`
        };
        const res = await axiosInstance.get(`/farms/dashboard`, { headers });
        if (res.data && res.data.valid) {
            return { data: res.data.data };
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê dashboard từ backend:", error);
    }
    return { data: null };
}

export async function getRevenueReportAPI(token: string, period: string) {
    try {
        const headers: Record<string, string> = {
            "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`
        };
        const params = new URLSearchParams();
        if (period) params.append("period", period);

        const res = await axiosInstance.get(`/farms/revenue-report?${params.toString()}`, { headers });
        if (res.data && res.data.valid) {
            return { data: res.data.data };
        }
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu báo cáo doanh thu từ backend:", error);
    }
    return { data: null };
}
