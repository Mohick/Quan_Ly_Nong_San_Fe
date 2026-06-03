import axios from "axios";

async function getAllFarmAPI() {
    return await axios.post(`/api/farms/get-all`);
}

export { getAllFarmAPI };
