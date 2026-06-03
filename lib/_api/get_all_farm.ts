import axios from "axios";

async function getAllFarmAPI() {
    return await axios.get(`/api/farms/get-all`);
}

export { getAllFarmAPI };
