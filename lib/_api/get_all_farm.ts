import axiosInstance from "../axios";

async function getAllFarmAPI() {
    return await axiosInstance.get(`/farms/get-all`);
}

export { getAllFarmAPI };
