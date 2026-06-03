import axiosInstance from "../axios";
import axios from "axios";

async function newsAPI() {
    try {
        const res = await axiosInstance.get("/news");
        if (res.data) {
            return { data: Array.isArray(res.data) ? res.data : res.data.data || [] };
        }
    } catch (error) {
        console.warn("Backend /news chưa khả dụng, sử dụng dữ liệu mock:", error);
    }
    return await axios.get("/news.json");
}

export { newsAPI }; 