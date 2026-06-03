import axiosInstance from "../axios";
import axios from "axios";

async function topFarmerAPI() {
    try {
        const res = await axiosInstance.get("/farms/top");
        if (res.data) {
            return { data: Array.isArray(res.data) ? res.data : res.data.data || [] };
        }
    } catch (error) {
        console.warn("Backend /farms/top chưa khả dụng, sử dụng dữ liệu mock:", error);
    }
    return await axios.get("/top-farmer.json");
}

export { topFarmerAPI };