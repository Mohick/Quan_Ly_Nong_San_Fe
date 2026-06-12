import axiosInstance from "../axios";

export async function getFarmMetricsAPI(farmId: string) {
    try {
        const res = await axiosInstance.get(`/farms/metrics/${farmId}`);
        return res.data;
    } catch (error) {
        console.error("Error fetching farm metrics:", error);
        throw error;
    }
}
