import axiosInstance from "../axios";
import axios from "axios";

async function productAPI() {
    try {
        const res = await axiosInstance.get("/products");
        if (res.data) {
            return { data: Array.isArray(res.data) ? res.data : res.data.data || [] };
        }
    } catch (error) {
        console.warn("Backend /products chưa khả dụng, sử dụng dữ liệu mock:", error);
    }
    return await axios.get("/product.json");
}

export { productAPI };